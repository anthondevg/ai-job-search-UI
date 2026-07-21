import type {
  AnalyzeJobResponse,
  TailorCvResponse,
} from '../types/tailoredCv'
import type { CoverLetterResult } from '../types/coverLetter'
import type { CVProfile } from '../types/cvProfile'
import type { ProfileCompatibility } from '../types/compatibility'
import type { CvOutputLanguage } from '../types/cvOutputLanguage'
import type { JobDescriptionAnalysis } from '../types/jobDescription'
import { DEV_MOCK_GENERATE } from '../config/devFlags'
import {
  DEV_MOCK_ANALYZE_RESPONSE,
  DEV_MOCK_COVER_LETTER_RESULT,
  DEV_MOCK_TAILOR_RESULT,
  devMockDelay,
} from '../mocks/generateDevMocks'
import { apiFetch, parseApiError } from '../utils/apiClient'

type ApiError = { error: string }

export async function analyzeJobDescription(
  jobDescription: string,
  sourceProfile?: CVProfile,
): Promise<{
  analysis: JobDescriptionAnalysis
  compatibility: ProfileCompatibility | null
}> {
  if (DEV_MOCK_GENERATE) {
    await devMockDelay()
    return {
      analysis: DEV_MOCK_ANALYZE_RESPONSE.analysis,
      compatibility: DEV_MOCK_ANALYZE_RESPONSE.compatibility,
    }
  }

  const response = await apiFetch('/api/cv/analyze-job', {
    method: 'POST',
    body: JSON.stringify({
      jobDescription,
      ...(sourceProfile ? { sourceProfile } : {}),
    }),
  })

  const data = (await response.json()) as AnalyzeJobResponse | ApiError

  if (!response.ok) {
    throw new Error('error' in data ? data.error : await parseApiError(response))
  }

  const result = data as AnalyzeJobResponse
  return {
    analysis: result.analysis,
    compatibility: result.compatibility ?? null,
  }
}

export async function tailorCv(
  sourceProfile: CVProfile,
  jobDescription: string,
  analysis: JobDescriptionAnalysis,
  outputLanguage: CvOutputLanguage,
): Promise<TailorCvResponse['result']> {
  if (DEV_MOCK_GENERATE) {
    await devMockDelay()
    return DEV_MOCK_TAILOR_RESULT
  }

  const response = await apiFetch('/api/cv/tailor', {
    method: 'POST',
    body: JSON.stringify({
      sourceProfile,
      jobDescription,
      analysis,
      outputLanguage,
    }),
  })

  const data = (await response.json()) as TailorCvResponse | ApiError

  if (!response.ok) {
    throw new Error('error' in data ? data.error : await parseApiError(response))
  }

  return (data as TailorCvResponse).result
}

export async function generateCoverLetter(
  sourceProfile: CVProfile,
  jobDescription: string,
  analysis: JobDescriptionAnalysis,
  outputLanguage: CvOutputLanguage,
): Promise<CoverLetterResult> {
  if (DEV_MOCK_GENERATE) {
    await devMockDelay()
    return DEV_MOCK_COVER_LETTER_RESULT
  }

  const response = await apiFetch('/api/cv/cover-letter', {
    method: 'POST',
    body: JSON.stringify({
      sourceProfile,
      jobDescription,
      analysis,
      outputLanguage,
    }),
  })

  const data = (await response.json()) as
    | { result: CoverLetterResult }
    | ApiError

  if (!response.ok) {
    throw new Error('error' in data ? data.error : await parseApiError(response))
  }

  return (data as { result: CoverLetterResult }).result
}
