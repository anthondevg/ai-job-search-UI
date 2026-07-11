export type LocationEligibility =
  | 'eligible'
  | 'likely_eligible'
  | 'unclear'
  | 'unlikely'
  | 'ineligible'

export type ProfileCompatibilityLocation = {
  candidateLocation: string
  jobLocation: string
  remotePolicy: string
  eligibility: LocationEligibility
  verdict: string
  restrictions: string[]
}

export type ProfileCompatibility = {
  score: number
  skillsScore: number
  summary: string
  strengths: string[]
  gaps: string[]
  location: ProfileCompatibilityLocation
}
