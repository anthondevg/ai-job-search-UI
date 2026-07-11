import type { CVProfile } from './cvProfile'
import type { JobDescriptionAnalysis } from './jobDescription'

/** Same shape as CVProfile — tailored content only, no invented facts. */
export type TailoredCVProfile = CVProfile

export type TailoredCvMeta = {
  roleTitle: string
  matchedKeywords: string[]
  matchedSkills: string[]
  missingFromCv: string[]
  adaptationNotes: string[]
}

export type TailoredCvResult = {
  profile: TailoredCVProfile
  meta: TailoredCvMeta
}

export type GenerateCvStatus = 'idle' | 'analyzing' | 'generating' | 'ready' | 'error'

export type AnalyzeJobResponse = {
  analysis: JobDescriptionAnalysis
}

export type TailorCvResponse = {
  result: TailoredCvResult
}
