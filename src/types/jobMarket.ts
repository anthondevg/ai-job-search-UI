export type JobProvider = 'greenhouse' | 'lever' | 'ashby' | 'remotive' | 'external'

export type JobPipelineStatus =
  | 'saved'
  | 'preparing'
  | 'applied'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn'
  | 'archived'

export type JobEligibility = 'global' | 'latam' | 'relocation' | 'restricted' | 'unknown'

export type Company = {
  id: string
  name: string
  websiteUrl: string | null
  careersUrl: string
  integrationType: JobProvider | 'external_only'
  followed: boolean
  suggested: boolean
  activeJobCount: number
}

export type JobSource = {
  id: string
  companyId: string | null
  companyName: string | null
  provider: JobProvider
  boardKey: string
  sourceUrl: string
  attribution: string | null
  enabled: boolean
  status: 'idle' | 'syncing' | 'healthy' | 'error'
  lastSyncedAt: string | null
  lastError: string | null
}

export type JobMatch = {
  score: number
  roleScore: number
  skillScore: number
  locationScore: number
  freshnessScore: number
  matchedSkills: string[]
  reasons: string[]
}

export type Job = {
  id: string
  sourceId: string | null
  provider: JobProvider
  externalId: string
  companyId: string | null
  companyName: string
  title: string
  description: string
  location: string
  workplaceType: string | null
  employmentType: string | null
  salaryText: string | null
  applyUrl: string
  sourceUrl: string
  attribution: string | null
  postedAt: string | null
  firstSeenAt: string
  lastSeenAt: string
  status: 'active' | 'expired'
  eligibility: JobEligibility
  pipelineStatus: JobPipelineStatus | null
  notes: string
  match: JobMatch
}

export type JobSearchPreferences = {
  roleFamilies: string[]
  skills: string[]
  seniority: string[]
  countries: string[]
  remote: boolean
  relocation: boolean
}

export type JobListResponse = {
  jobs: Job[]
  nextCursor: string | null
  total: number
}

export type JobMarketOverview = {
  companies: Company[]
  suggestions: Company[]
  sources: JobSource[]
}

export const DEFAULT_JOB_PREFERENCES: JobSearchPreferences = {
  roleFamilies: ['Frontend', 'Full Stack', 'Backend JS/TS', 'AI Engineer', 'Applied AI', 'LLM Engineer'],
  skills: [],
  seniority: [],
  countries: ['Worldwide', 'Latin America'],
  remote: true,
  relocation: true,
}
