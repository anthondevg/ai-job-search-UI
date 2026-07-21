import { Type, type Schema } from '@google/genai'

export const coverLetterResultSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    roleTitle: { type: Type.STRING },
    companyName: { type: Type.STRING },
    body: { type: Type.STRING },
  },
  required: ['roleTitle', 'companyName', 'body'],
}
