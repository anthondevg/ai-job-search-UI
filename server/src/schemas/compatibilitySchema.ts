import { Type, type Schema } from '@google/genai'

const locationEligibilityValues = [
  'eligible',
  'likely_eligible',
  'unclear',
  'unlikely',
  'ineligible',
] as const

const warningFlagValues = [
  'visa_sponsorship_required',
  'us_timezone_restricted',
  'us_only_remote',
  'latam_excluded',
  'global_remote',
  'latam_friendly_remote',
] as const

const companySignalConfidenceValues = [
  'stated_in_posting',
  'inferred_from_knowledge',
  'none',
] as const

export const profileCompatibilitySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    skillsScore: { type: Type.NUMBER },
    summary: { type: Type.STRING },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    gaps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    location: {
      type: Type.OBJECT,
      properties: {
        candidateLocation: { type: Type.STRING },
        jobLocation: { type: Type.STRING },
        remotePolicy: { type: Type.STRING },
        eligibility: {
          type: Type.STRING,
          enum: [...locationEligibilityValues],
        },
        verdict: { type: Type.STRING },
        restrictions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        warningFlags: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
            enum: [...warningFlagValues],
          },
        },
        companySignalConfidence: {
          type: Type.STRING,
          enum: [...companySignalConfidenceValues],
        },
      },
      required: [
        'candidateLocation',
        'jobLocation',
        'remotePolicy',
        'eligibility',
        'verdict',
        'restrictions',
        'warningFlags',
        'companySignalConfidence',
      ],
    },
  },
  required: ['skillsScore', 'summary', 'strengths', 'gaps', 'location'],
}
