import type {
  AnalyzeJobResponse,
  TailorCvResponse,
} from '../types/tailoredCv'
import type { CVProfile } from '../types/cvProfile'
import type { JobDescriptionAnalysis } from '../types/jobDescription'
import { apiFetch, parseApiError } from '../utils/apiClient'

type ApiError = { error: string }

export async function analyzeJobDescription(
  jobDescription: string,
): Promise<JobDescriptionAnalysis> {
  const response = await apiFetch('/api/cv/analyze-job', {
    method: 'POST',
    body: JSON.stringify({ jobDescription }),
  })

  const data = (await response.json()) as AnalyzeJobResponse | ApiError

  if (!response.ok) {
    throw new Error('error' in data ? data.error : await parseApiError(response))
  }

  return (data as AnalyzeJobResponse).analysis
}

export async function tailorCv(
  sourceProfile: CVProfile,
  jobDescription: string,
  analysis: JobDescriptionAnalysis,
): Promise<TailorCvResponse['result']> {
  const response = await apiFetch('/api/cv/tailor', {
    method: 'POST',
    body: JSON.stringify({ sourceProfile, jobDescription, analysis }),
  })

  const data = (await response.json()) as TailorCvResponse | ApiError

  if (!response.ok) {
    throw new Error('error' in data ? data.error : await parseApiError(response))
  }

  return (data as TailorCvResponse).result
}
