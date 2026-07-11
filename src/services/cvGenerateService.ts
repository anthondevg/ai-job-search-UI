import type {
  AnalyzeJobResponse,
  TailorCvResponse,
} from '../types/tailoredCv'
import type { CVProfile } from '../types/cvProfile'
import type { ProfileCompatibility } from '../types/compatibility'
import type { CvOutputLanguage } from '../types/cvOutputLanguage'
import type { JobDescriptionAnalysis } from '../types/jobDescription'
import { apiFetch, parseApiError } from '../utils/apiClient'

type ApiError = { error: string }

export async function analyzeJobDescription(
  jobDescription: string,
  sourceProfile?: CVProfile,
): Promise<{
  analysis: JobDescriptionAnalysis
  compatibility: ProfileCompatibility | null
}> {
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
