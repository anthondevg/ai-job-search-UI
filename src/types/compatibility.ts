export type LocationEligibility =
  | 'eligible'
  | 'likely_eligible'
  | 'unclear'
  | 'unlikely'
  | 'ineligible'

export type WarningFlag =
  | 'visa_sponsorship_required'
  | 'us_timezone_restricted'
  | 'us_only_remote'
  | 'latam_excluded'
  | 'global_remote'
  | 'latam_friendly_remote'

export type CompanySignalConfidence =
  | 'stated_in_posting'
  | 'inferred_from_knowledge'
  | 'none'

export type ProfileCompatibilityLocation = {
  candidateLocation: string
  jobLocation: string
  remotePolicy: string
  eligibility: LocationEligibility
  verdict: string
  restrictions: string[]
  warningFlags: WarningFlag[]
  companySignalConfidence: CompanySignalConfidence
}

export type ProfileCompatibility = {
  score: number
  skillsScore: number
  summary: string
  strengths: string[]
  gaps: string[]
  location: ProfileCompatibilityLocation
}
