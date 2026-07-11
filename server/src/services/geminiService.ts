import { GoogleGenAI, type Schema } from '@google/genai'
import { ANALYZE_JOB_DESCRIPTION_PROMPT } from '../prompts/analyzeJobDescriptionPrompt.js'
import { PARSE_CV_PROMPT } from '../prompts/parseCvPrompt.js'
import { TAILOR_CV_PROMPT } from '../prompts/tailorCvPrompt.js'
import { cvProfileJsonSchema } from '../schemas/cvProfileSchema.js'
import { jobDescriptionAnalysisSchema } from '../schemas/jobDescriptionSchema.js'
import { tailoredCvResultSchema } from '../schemas/tailoredCvSchema.js'
import type { CVProfile } from '../types/cvProfile.js'
import type { JobDescriptionAnalysis } from '../types/jobDescription.js'
import type { TailoredCvResult } from '../types/tailoredCv.js'
import { validateCvProfile } from '../validators/validateCvProfile.js'
import {
  validateJobDescriptionAnalysis,
  validateTailoredCvResult,
} from '../validators/validateGeneration.js'

const MODEL_ID = 'gemini-3.5-flash'
const MIN_JOB_DESCRIPTION_LENGTH = 50
const MAX_JOB_DESCRIPTION_LENGTH = 50_000

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  return new GoogleGenAI({ apiKey })
}

async function generateStructuredJson<T>(
  prompt: string,
  userContent: string,
  schema: Schema,
  validate: (data: unknown) => T,
  errorLabel: string,
): Promise<T> {
  const client = getClient()

  const response = await client.models.generateContent({
    model: MODEL_ID,
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
    throw new Error(`Failed to parse structured response from Gemini while ${errorLabel}`)
  }

  return validate(parsed)
}

export async function parseCvFromPdf(
  pdfBuffer: Buffer,
  mimeType: string,
): Promise<CVProfile> {
  const client = getClient()

  const response = await client.models.generateContent({
    model: MODEL_ID,
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

export async function generateTailoredCv(
  sourceProfile: CVProfile,
  jobDescription: string,
  analysis: JobDescriptionAnalysis,
): Promise<TailoredCvResult> {
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
    TAILOR_CV_PROMPT,
    userContent,
    tailoredCvResultSchema,
    validateTailoredCvResult,
    'generating tailored CV',
  )
}
