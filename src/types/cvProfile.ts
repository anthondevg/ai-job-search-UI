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

export type CVProfile = {
  personalInfo: PersonalInfo
  summary: string
  skills: string[]
  experience: ExperienceItem[]
  education: EducationItem[]
  languages: string[]
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
