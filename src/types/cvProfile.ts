export type PersonalInfo = {
  name: string
  email: string
  phone: string
  location: string
  linkedin: string
  website: string
}

export type ExperienceItem = {
  company: string
  role: string
  startDate: string
  endDate: string
  bullets: string[]
}

export type EducationItem = {
  institution: string
  degree: string
  startDate: string
  endDate: string
}

export type ProjectItem = {
  name: string
  description: string
  url: string
  startDate: string
  endDate: string
}

export type LanguageLevel = '' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Native'

export type LanguageItem = {
  name: string
  level: LanguageLevel
}

export type CVProfile = {
  personalInfo: PersonalInfo
  summary: string
  skills: string[]
  experience: ExperienceItem[]
  education: EducationItem[]
  projects: ProjectItem[]
  languages: LanguageItem[]
  certifications: string[]
}

export type SavedCvRecord = {
  id: string
  fileName: string
  profile: CVProfile
  createdAt: string
}

export type ParseCvResponse = {
  record: SavedCvRecord
}

export type ListCvResponse = {
  records: SavedCvRecord[]
}

export type ParseCvErrorResponse = {
  error: string
}

export type UpdateCvResponse = {
  record: SavedCvRecord
}

export type CvUploadStatus =
  | 'idle'
  | 'dragging'
  | 'parsing'
  | 'success'
  | 'error'
