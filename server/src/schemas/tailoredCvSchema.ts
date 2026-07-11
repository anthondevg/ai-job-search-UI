import { Type, type Schema } from '@google/genai'
import { cvProfileJsonSchema } from './cvProfileSchema.js'

export const tailoredCvResultSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    profile: cvProfileJsonSchema,
    meta: {
      type: Type.OBJECT,
      properties: {
        roleTitle: { type: Type.STRING },
        matchedKeywords: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        matchedSkills: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        missingFromCv: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        adaptationNotes: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: [
        'roleTitle',
        'matchedKeywords',
        'matchedSkills',
        'missingFromCv',
        'adaptationNotes',
      ],
    },
  },
  required: ['profile', 'meta'],
}
