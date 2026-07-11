import type { JobDescriptionAnalysis } from '../types/jobDescription.js'
import type { TailoredCvMeta, TailoredCvResult } from '../types/tailoredCv.js'
import { validateCvProfile } from './validateCvProfile.js'

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

function normalizeMeta(value: unknown): TailoredCvMeta {
  const meta = value && typeof value === 'object' ? value : {}

  return {
    roleTitle: asString((meta as TailoredCvMeta).roleTitle),
    matchedKeywords: asStringArray((meta as TailoredCvMeta).matchedKeywords),
    matchedSkills: asStringArray((meta as TailoredCvMeta).matchedSkills),
    missingFromCv: asStringArray((meta as TailoredCvMeta).missingFromCv),
    adaptationNotes: asStringArray((meta as TailoredCvMeta).adaptationNotes),
  }
}

export function validateJobDescriptionAnalysis(data: unknown): JobDescriptionAnalysis {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid job description analysis response from model')
  }

  const record = data as Record<string, unknown>

  return {
    roleTitle: asString(record.roleTitle),
    seniority: asString(record.seniority),
    keywords: asStringArray(record.keywords),
    requiredSkills: asStringArray(record.requiredSkills),
    preferredSkills: asStringArray(record.preferredSkills),
    responsibilities: asStringArray(record.responsibilities),
  }
}

export function validateTailoredCvResult(data: unknown): TailoredCvResult {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid tailored CV response from model')
  }

  const record = data as Record<string, unknown>

  if (!record.profile) {
    throw new Error('Tailored CV response is missing profile')
  }

  return {
    profile: validateCvProfile(record.profile),
    meta: normalizeMeta(record.meta),
  }
}
