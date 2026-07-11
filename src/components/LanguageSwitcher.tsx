import { useTranslation } from '../hooks/useTranslation'
import type { Language } from '../i18n/types'

type LanguageSwitcherProps = {
  compact?: boolean
  variant?: 'default' | 'sidebar'
}

const languages: Language[] = ['en', 'es']

export default function LanguageSwitcher({
  compact = false,
  variant = 'default',
}: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useTranslation()
  const isSidebar = variant === 'sidebar'

  const labelClass = isSidebar ? 'text-sidebar-muted' : 'text-muted'
  const containerClass = isSidebar
    ? 'border border-sidebar-border bg-sidebar-hover'
    : 'border border-border bg-surface-muted'
  const inactiveClass = isSidebar
    ? 'text-sidebar-muted hover:text-sidebar-heading'
    : 'text-muted hover:text-heading'

  return (
    <div className={compact ? 'flex justify-center' : 'space-y-2'}>
      {!compact && (
        <p className={`text-xs font-medium uppercase tracking-widest ${labelClass}`}>
          {t('language.label')}
        </p>
      )}
      <div
        className={`flex rounded-control p-0.5 ${containerClass} ${compact ? 'w-full' : ''}`}
        role="group"
        aria-label={t('language.label')}
      >
        {languages.map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => setLanguage(lang)}
            aria-pressed={language === lang}
            className={`flex-1 rounded-tag px-2 py-1.5 font-mono text-xs font-medium transition-colors ${
              language === lang
                ? 'bg-accent text-accent-foreground'
                : inactiveClass
            }`}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )
}
