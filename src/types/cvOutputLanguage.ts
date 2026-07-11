export type CvOutputLanguage = 'en' | 'es'

export const CV_OUTPUT_LANGUAGE_STORAGE_KEY = 'ai-job-search-cv-output-language'

export function getDefaultCvOutputLanguage(): CvOutputLanguage {
  const stored = localStorage.getItem(CV_OUTPUT_LANGUAGE_STORAGE_KEY)
  return stored === 'es' ? 'es' : 'en'
}
