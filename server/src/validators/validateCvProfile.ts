import type {
  CVProfile,
  EducationItem,
  ExperienceItem,
  PersonalInfo,
} from '../types/cvProfile.js'

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
}

function normalizePersonalInfo(value: unknown): PersonalInfo {
  const info = value && typeof value === 'object' ? value : {}

  return {
    name: asString((info as PersonalInfo).name),
    email: asString((info as PersonalInfo).email),
    phone: asString((info as PersonalInfo).phone),
    location: asString((info as PersonalInfo).location),
    linkedin: asString((info as PersonalInfo).linkedin),
    website: asString((info as PersonalInfo).website),
  }
}

function normalizeExperience(value: unknown): ExperienceItem[] {
  if (!Array.isArray(value)) return []

  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => ({
      company: asString(item.company),
      role: asString(item.role),
      startDate: asString(item.startDate),
      endDate: asString(item.endDate),
      bullets: asStringArray(item.bullets),
    }))
    .filter((item) => item.company || item.role)
}

function normalizeEducation(value: unknown): EducationItem[] {
  if (!Array.isArray(value)) return []

  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => ({
      institution: asString(item.institution),
      degree: asString(item.degree),
      startDate: asString(item.startDate),
      endDate: asString(item.endDate),
    }))
    .filter((item) => item.institution || item.degree)
}

export function validateCvProfile(data: unknown): CVProfile {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid CV profile response from model')
  }

  const record = data as Record<string, unknown>
  const profile: CVProfile = {
    personalInfo: normalizePersonalInfo(record.personalInfo),
    summary: asString(record.summary),
    skills: asStringArray(record.skills),
    experience: normalizeExperience(record.experience),
    education: normalizeEducation(record.education),
    languages: asStringArray(record.languages),
    certifications: asStringArray(record.certifications),
  }

  const hasContent =
    profile.personalInfo.name ||
    profile.summary ||
    profile.skills.length > 0 ||
    profile.experience.length > 0

  if (!hasContent) {
    throw new Error(
      'Could not extract meaningful CV data. The PDF may be empty, scanned without text, or unreadable.',
    )
  }

  return profile
}
