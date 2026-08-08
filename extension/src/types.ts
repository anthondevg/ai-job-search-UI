export type CvRecord = {
  id: string
  fileName: string
  profile: {
    personalInfo: { name: string; location?: string }
    [key: string]: unknown
  }
  createdAt: string
}

export type Compatibility = {
  score: number
  skillsScore: number
  summary: string
  strengths: string[]
  gaps: string[]
  location: {
    candidateLocation: string
    jobLocation: string
    remotePolicy: string
    eligibility: 'eligible' | 'likely_eligible' | 'unclear' | 'unlikely' | 'ineligible'
    verdict: string
    restrictions: string[]
    warningFlags: string[]
  }
}

export type JobAnalysis = {
  roleTitle: string
  seniority: string
  keywords: string[]
  requiredSkills: string[]
  preferredSkills: string[]
  responsibilities: string[]
}

export type AnalyzeResponse = {
  analysis: JobAnalysis
  compatibility: Compatibility | null
}
