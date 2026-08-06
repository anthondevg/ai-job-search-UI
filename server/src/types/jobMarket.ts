export type JobProvider = 'greenhouse' | 'lever' | 'ashby' | 'remotive' | 'external'
export type JobPipelineStatus = 'saved' | 'preparing' | 'applied' | 'interview' | 'offer' | 'rejected' | 'withdrawn' | 'archived'
export type JobEligibility = 'global' | 'latam' | 'relocation' | 'restricted' | 'unknown'

export type NormalizedJob = {
  provider: JobProvider
  externalId: string
  companyName: string
  title: string
  description: string
  location: string
  workplaceType: string | null
  employmentType: string | null
  salaryText: string | null
  applyUrl: string
  sourceUrl: string
  postedAt: string | null
  eligibility: JobEligibility
}

export type JobSearchPreferences = {
  roleFamilies: string[]
  skills: string[]
  seniority: string[]
  countries: string[]
  remote: boolean
  relocation: boolean
}

export const DEFAULT_JOB_PREFERENCES: JobSearchPreferences = {
  roleFamilies: ['Frontend', 'Full Stack', 'Backend JS/TS', 'AI Engineer', 'Applied AI', 'LLM Engineer'],
  skills: [],
  seniority: [],
  countries: ['Worldwide', 'Latin America'],
  remote: true,
  relocation: true,
}
