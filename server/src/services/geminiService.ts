import { GoogleGenAI } from '@google/genai'
import { PARSE_CV_PROMPT } from '../prompts/parseCvPrompt.js'
import { cvProfileJsonSchema } from '../schemas/cvProfileSchema.js'
import type { CVProfile } from '../types/cvProfile.js'
import { validateCvProfile } from '../validators/validateCvProfile.js'

const MODEL_ID = 'gemini-3.5-flash'

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  return new GoogleGenAI({ apiKey })
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
