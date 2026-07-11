import type { TranslationKey, Translations } from '../i18n/types'

export function getTranslation(
  dictionary: Translations,
  key: TranslationKey,
): string {
  const value = key.split('.').reduce<unknown>((current, part) => {
    if (current && typeof current === 'object' && part in current) {
      return (current as Record<string, unknown>)[part]
    }
    return undefined
  }, dictionary)

  return typeof value === 'string' ? value : key
}
