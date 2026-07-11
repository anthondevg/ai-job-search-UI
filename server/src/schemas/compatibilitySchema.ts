import { Type, type Schema } from '@google/genai'

const locationEligibilityValues = [
  'eligible',
  'likely_eligible',
  'unclear',
  'unlikely',
  'ineligible',
] as const

export const profileCompatibilitySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    skillsScore: { type: Type.NUMBER },
    score: { type: Type.NUMBER },
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
      },
      required: [
        'candidateLocation',
        'jobLocation',
        'remotePolicy',
        'eligibility',
        'verdict',
        'restrictions',
      ],
    },
  },
  required: ['skillsScore', 'score', 'summary', 'strengths', 'gaps', 'location'],
}
