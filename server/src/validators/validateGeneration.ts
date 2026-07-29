import type { CoverLetterResult } from '../types/coverLetter.js'
import type {
  CompanySignalConfidence,
  LocationEligibility,
  ProfileCompatibility,
  ProfileCompatibilityLocation,
  WarningFlag,
} from '../types/compatibility.js'
import type { JobDescriptionAnalysis } from '../types/jobDescription.js'
import type { TailoredCvMeta, TailoredCvResult } from '../types/tailoredCv.js'
import {
  LOCATION_PENALTIES,
  LOCATION_PENALTY_CAPS,
  VISA_OVERRIDE,
  VISA_UNLIKELY_OVERRIDE,
} from '../config/locationPenalties.js'
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

const VALID_WARNING_FLAGS: WarningFlag[] = [
  'visa_sponsorship_required',
  'us_timezone_restricted',
  'us_only_remote',
  'latam_excluded',
  'global_remote',
  'latam_friendly_remote',
]

const VALID_COMPANY_CONFIDENCE: CompanySignalConfidence[] = [
  'stated_in_posting',
  'inferred_from_knowledge',
  'none',
]

function clampScore(value: unknown): number {
  const rawScore = typeof value === 'number' ? value : 0
  return Math.min(100, Math.max(0, Math.round(rawScore)))
}

function applyLocationPenalty(
  skillsScore: number,
  eligibility: LocationEligibility,
  warningFlags: WarningFlag[],
): number {
  const hasVisaFlag = warningFlags.includes('visa_sponsorship_required')

  if (eligibility === 'ineligible' && hasVisaFlag) {
    return Math.min(Math.round(skillsScore * VISA_OVERRIDE.multiplier), VISA_OVERRIDE.cap)
  }

  const multiplier = LOCATION_PENALTIES[eligibility]
  const raw = Math.round(skillsScore * multiplier)
  const cap = LOCATION_PENALTY_CAPS[eligibility]

  if (cap !== undefined) {
    return Math.min(raw, cap)
  }

  if (eligibility === 'unlikely' && hasVisaFlag) {
    return Math.min(Math.round(skillsScore * VISA_UNLIKELY_OVERRIDE.multiplier), VISA_UNLIKELY_OVERRIDE.cap)
  }

  return raw
}

function normalizeWarningFlags(value: unknown): WarningFlag[] {
  const raw = asStringArray(value)
  return raw.filter((flag): flag is WarningFlag =>
    VALID_WARNING_FLAGS.includes(flag as WarningFlag),
  )
}

function normalizeCompanyConfidence(value: unknown): CompanySignalConfidence {
  const raw = asString(value) as CompanySignalConfidence
  return VALID_COMPANY_CONFIDENCE.includes(raw) ? raw : 'none'
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
    warningFlags: normalizeWarningFlags(record.warningFlags),
    companySignalConfidence: normalizeCompanyConfidence(record.companySignalConfidence),
  }
}

export function validateProfileCompatibility(data: unknown): ProfileCompatibility {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid compatibility response from model')
  }

  const record = data as Record<string, unknown>
  const skillsScore = clampScore(record.skillsScore)
  const location = normalizeLocation(record.location)
  const score = clampScore(
    applyLocationPenalty(skillsScore, location.eligibility, location.warningFlags),
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

export function validateCoverLetterResult(data: unknown): CoverLetterResult {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid cover letter response from model')
  }

  const record = data as Record<string, unknown>
  const body = asString(record.body)

  if (!body) {
    throw new Error('Cover letter response is missing body')
  }

  return {
    roleTitle: asString(record.roleTitle),
    companyName: asString(record.companyName),
    body,
  }
}
