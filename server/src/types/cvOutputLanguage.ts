export type CvOutputLanguage = 'en' | 'es'

export function parseCvOutputLanguage(value: unknown): CvOutputLanguage {
  return value === 'es' ? 'es' : 'en'
}
