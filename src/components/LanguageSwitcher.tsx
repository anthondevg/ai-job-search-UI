import { useTranslation } from '../hooks/useTranslation'
import type { Language } from '../i18n/types'

type LanguageSwitcherProps = {
  compact?: boolean
}

const languages: Language[] = ['en', 'es']

export default function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useTranslation()

  return (
    <div className={compact ? 'flex justify-center' : 'space-y-2'}>
      {!compact && (
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {t('language.label')}
        </p>
      )}
      <div
        className={`flex rounded-lg bg-sidebar-hover p-1 ${compact ? 'w-full' : ''}`}
        role="group"
        aria-label={t('language.label')}
      >
        {languages.map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => setLanguage(lang)}
            aria-pressed={language === lang}
            className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
              language === lang
                ? 'bg-accent text-surface'
                : 'text-muted hover:text-heading'
            }`}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )
}
