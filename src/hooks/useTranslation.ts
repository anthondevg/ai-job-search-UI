import { useLanguageContext } from '../i18n/LanguageProvider'
import type { Language } from '../i18n/types'

export function useTranslation() {
  return useLanguageContext()
}

export function useLanguage() {
  const { language, setLanguage } = useLanguageContext()
  return { language, setLanguage }
}

export type { Language }
