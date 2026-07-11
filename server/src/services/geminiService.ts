import { GoogleGenAI, type Schema } from '@google/genai'
import { PROFILE_COMPATIBILITY_PROMPT } from '../prompts/compatibilityPrompt.js'
import { ANALYZE_JOB_DESCRIPTION_PROMPT } from '../prompts/analyzeJobDescriptionPrompt.js'
import { PARSE_CV_PROMPT } from '../prompts/parseCvPrompt.js'
import { TAILOR_CV_PROMPT } from '../prompts/tailorCvPrompt.js'
import { cvProfileJsonSchema } from '../schemas/cvProfileSchema.js'
import { profileCompatibilitySchema } from '../schemas/compatibilitySchema.js'
import { jobDescriptionAnalysisSchema } from '../schemas/jobDescriptionSchema.js'
import { tailoredCvResultSchema } from '../schemas/tailoredCvSchema.js'
import type { CVProfile } from '../types/cvProfile.js'
import type { ProfileCompatibility } from '../types/compatibility.js'
import type { CvOutputLanguage } from '../types/cvOutputLanguage.js'
import type { JobDescriptionAnalysis } from '../types/jobDescription.js'
import type { TailoredCvResult } from '../types/tailoredCv.js'
import { validateCvProfile } from '../validators/validateCvProfile.js'
import {
  validateJobDescriptionAnalysis,
  validateProfileCompatibility,
  validateTailoredCvResult,
} from '../validators/validateGeneration.js'

const DEFAULT_MODEL_ID = 'gemini-3.1-flash-lite'
const FALLBACK_MODEL_IDS = ['gemini-3.5-flash']
const MIN_JOB_DESCRIPTION_LENGTH = 50
const MAX_JOB_DESCRIPTION_LENGTH = 50_000
const MAX_GEMINI_RETRIES = 3

function getModelCandidates(): string[] {
  const configured = process.env.GEMINI_MODEL?.trim()
  if (configured) return [configured]
  return [DEFAULT_MODEL_ID, ...FALLBACK_MODEL_IDS]
}

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  return new GoogleGenAI({ apiKey })
}

function isQuotaError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return (
    message.includes('429') ||
    message.includes('RESOURCE_EXHAUSTED') ||
    message.includes('quota') ||
    message.includes('Quota exceeded')
  )
}

function isModelUnavailableError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return (
    message.includes('404') ||
    message.includes('NOT_FOUND') ||
    message.includes('no longer available')
  )
}

function getRetryDelayMs(error: unknown, attempt: number): number {
  const message = error instanceof Error ? error.message : String(error)
  const retryMatch = message.match(/retry in (\d+(?:\.\d+)?)s/i)
  if (retryMatch) {
    return Math.ceil(parseFloat(retryMatch[1]) * 1000) + 500
  }
  return Math.min(10_000, 2_000 * attempt)
}

async function withGeminiRetry<T>(operation: () => Promise<T>): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= MAX_GEMINI_RETRIES; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      if (!isQuotaError(error) || attempt === MAX_GEMINI_RETRIES) {
        throw error
      }
      await new Promise((resolve) =>
        setTimeout(resolve, getRetryDelayMs(error, attempt)),
      )
    }
  }

  throw lastError
}

async function withModelFallback<T>(
  operation: (modelId: string) => Promise<T>,
): Promise<T> {
  const candidates = getModelCandidates()
  let lastError: unknown

  for (let index = 0; index < candidates.length; index++) {
    const modelId = candidates[index]
    try {
      return await operation(modelId)
    } catch (error) {
      lastError = error
      const hasNext = index < candidates.length - 1
      if (!isModelUnavailableError(error) || !hasNext) {
        throw error
      }
      console.warn(
        `Gemini model "${modelId}" unavailable, falling back to "${candidates[index + 1]}"`,
      )
    }
  }

  throw lastError
}

async function generateStructuredJson<T>(
  prompt: string,
  userContent: string,
  schema: Schema,
  validate: (data: unknown) => T,
  errorLabel: string,
): Promise<T> {
  return withGeminiRetry(() =>
    withModelFallback(async (modelId) => {
      const client = getClient()

      const response = await client.models.generateContent({
        model: modelId,
        contents: [
          {
            role: 'user',
            parts: [{ text: `${prompt}\n\n---\n\n${userContent}` }],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: 0,
        },
      })

      const rawText = response.text
      if (!rawText) {
        throw new Error(`Empty response from Gemini while ${errorLabel}`)
      }

      let parsed: unknown
      try {
        parsed = JSON.parse(rawText)
      } catch {
        throw new Error(
          `Failed to parse structured response from Gemini while ${errorLabel}`,
        )
      }

      return validate(parsed)
    }),
  )
}

export async function parseCvFromPdf(
  pdfBuffer: Buffer,
  mimeType: string,
): Promise<CVProfile> {
  return withGeminiRetry(() =>
    withModelFallback(async (modelId) => {
      const client = getClient()

      const response = await client.models.generateContent({
        model: modelId,
        contents: [
          {
            role: 'user',
            parts: [
              { text: PARSE_CV_PROMPT },
              {
                inlineData: {
                  mimeType,
                  data: pdfBuffer.toString('base64'),
                },
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: cvProfileJsonSchema,
          temperature: 0,
        },
      })

      const rawText = response.text
      if (!rawText) {
        throw new Error('Empty response from Gemini while parsing CV')
      }

      let parsed: unknown
      try {
        parsed = JSON.parse(rawText)
      } catch {
        throw new Error('Failed to parse structured CV response from Gemini')
      }

      return validateCvProfile(parsed)
    }),
  )
}

export function assertJobDescriptionLength(text: string) {
  const trimmed = text.trim()

  if (trimmed.length < MIN_JOB_DESCRIPTION_LENGTH) {
    throw new Error('Job description is too short to analyze')
  }

  if (trimmed.length > MAX_JOB_DESCRIPTION_LENGTH) {
    throw new Error('Job description exceeds maximum length')
  }

  return trimmed
}

export async function analyzeJobDescription(
  jobDescription: string,
): Promise<JobDescriptionAnalysis> {
  const trimmed = assertJobDescriptionLength(jobDescription)

  return generateStructuredJson(
    ANALYZE_JOB_DESCRIPTION_PROMPT,
    trimmed,
    jobDescriptionAnalysisSchema,
    validateJobDescriptionAnalysis,
    'analyzing job description',
  )
}

export async function calculateProfileCompatibility(
  sourceProfile: CVProfile,
  jobDescription: string,
  analysis: JobDescriptionAnalysis,
): Promise<ProfileCompatibility> {
  const trimmed = assertJobDescriptionLength(jobDescription)

  const userContent = JSON.stringify(
    {
      sourceProfile,
      jobDescription: trimmed,
      jobAnalysis: analysis,
    },
    null,
    2,
  )

  return generateStructuredJson(
    PROFILE_COMPATIBILITY_PROMPT,
    userContent,
    profileCompatibilitySchema,
    validateProfileCompatibility,
    'calculating profile compatibility',
  )
}

export async function generateTailoredCv(
  sourceProfile: CVProfile,
  jobDescription: string,
  analysis: JobDescriptionAnalysis,
  outputLanguage: CvOutputLanguage = 'en',
): Promise<TailoredCvResult> {
  const trimmed = assertJobDescriptionLength(jobDescription)

  const userContent = JSON.stringify(
    {
      sourceProfile,
      jobDescription: trimmed,
      jobAnalysis: analysis,
      outputLanguage,
    },
    null,
    2,
  )

  return generateStructuredJson(
    TAILOR_CV_PROMPT,
    userContent,
    tailoredCvResultSchema,
    validateTailoredCvResult,
    'generating tailored CV',
  )
}
