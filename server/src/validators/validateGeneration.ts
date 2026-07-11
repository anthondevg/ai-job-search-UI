import type {
  LocationEligibility,
  ProfileCompatibility,
  ProfileCompatibilityLocation,
} from '../types/compatibility.js'
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

const ELIGIBILITY_VALUES: LocationEligibility[] = [
  'eligible',
  'likely_eligible',
  'unclear',
  'unlikely',
  'ineligible',
]

function clampScore(value: unknown): number {
  const rawScore = typeof value === 'number' ? value : 0
  return Math.min(100, Math.max(0, Math.round(rawScore)))
}

function applyLocationPenalty(
  skillsScore: number,
  eligibility: LocationEligibility,
): number {
  switch (eligibility) {
    case 'eligible':
      return skillsScore
    case 'likely_eligible':
      return Math.round(skillsScore * 0.92)
    case 'unclear':
      return Math.round(skillsScore * 0.72)
    case 'unlikely':
      return Math.round(skillsScore * 0.45)
    case 'ineligible':
      return Math.min(Math.round(skillsScore * 0.2), 25)
  }
}

function normalizeLocation(value: unknown): ProfileCompatibilityLocation {
  const location = value && typeof value === 'object' ? value : {}
  const record = location as ProfileCompatibilityLocation
  const eligibility = ELIGIBILITY_VALUES.includes(record.eligibility)
    ? record.eligibility
    : 'unclear'

  return {
    candidateLocation: asString(record.candidateLocation) || 'Not specified in CV',
    jobLocation: asString(record.jobLocation),
    remotePolicy: asString(record.remotePolicy),
    eligibility,
    verdict: asString(record.verdict),
    restrictions: asStringArray(record.restrictions),
  }
}

export function validateProfileCompatibility(data: unknown): ProfileCompatibility {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid compatibility response from model')
  }

  const record = data as Record<string, unknown>
  const skillsScore = clampScore(record.skillsScore ?? record.score)
  const location = normalizeLocation(record.location)
  const score = clampScore(
    applyLocationPenalty(skillsScore, location.eligibility),
  )

  return {
    score,
    skillsScore,
    summary: asString(record.summary),
    strengths: asStringArray(record.strengths),
    gaps: asStringArray(record.gaps),
    location,
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
