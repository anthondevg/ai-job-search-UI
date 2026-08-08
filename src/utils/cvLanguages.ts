import type { LanguageItem, LanguageLevel } from '../types/cvProfile'

export const LANGUAGE_LEVELS: LanguageLevel[] = [
  '',
  'A1',
  'A2',
  'B1',
  'B2',
  'C1',
  'C2',
  'Native',
]

export function isLanguageLevel(value: unknown): value is LanguageLevel {
  return typeof value === 'string' && LANGUAGE_LEVELS.includes(value as LanguageLevel)
}

export function normalizeLanguageItems(value: unknown): LanguageItem[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((item) => {
    if (typeof item === 'string') {
      const name = item.trim()
      return name ? [{ name, level: '' as const }] : []
    }

    if (!item || typeof item !== 'object') return []

    const candidate = item as Record<string, unknown>
    const name = typeof candidate.name === 'string' ? candidate.name.trim() : ''
    if (!name) return []

    return [{
      name,
      level: isLanguageLevel(candidate.level) ? candidate.level : '',
    }]
  })
}

export function formatLanguageItem(item: LanguageItem, nativeLabel = 'Native'): string {
  if (!item.level) return item.name
  const level = item.level === 'Native' ? nativeLabel : item.level
  return `${item.name} · ${level}`
}
