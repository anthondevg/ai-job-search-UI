export type JobDescriptionStatus = 'idle' | 'analyzing' | 'ready' | 'error'

export type JobDescriptionAnalysis = {
  keywords: string[]
  skills: string[]
}
