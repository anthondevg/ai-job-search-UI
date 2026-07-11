import type { CVProfile } from './cvProfile.js'

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
