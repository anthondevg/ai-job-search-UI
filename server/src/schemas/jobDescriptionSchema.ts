import { Type, type Schema } from '@google/genai'

export const jobDescriptionAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    roleTitle: { type: Type.STRING },
    seniority: { type: Type.STRING },
    keywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    requiredSkills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    preferredSkills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    responsibilities: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: [
    'roleTitle',
    'seniority',
    'keywords',
    'requiredSkills',
    'preferredSkills',
    'responsibilities',
  ],
}
