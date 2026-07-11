import { useTranslation } from '../hooks/useTranslation'

type AppLogoProps = {
  showText?: boolean
  compact?: boolean
  variant?: 'default' | 'sidebar'
}

export function AppLogoMark({ className = 'size-8' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
    >
      <rect x="5" y="7" width="14" height="18" stroke="currentColor" strokeWidth="1.5" />
      <rect
        x="13"
        y="7"
        width="14"
        height="18"
        stroke="currentColor"
        strokeWidth="1.5"
        className="opacity-50"
      />
      <rect x="13" y="15" width="6" height="6" className="fill-accent" />
    </svg>
  )
}

export default function AppLogo({
  showText = true,
  compact = false,
  variant = 'default',
}: AppLogoProps) {
  const { t } = useTranslation()
  const isSidebar = variant === 'sidebar'

  const titleClass = isSidebar ? 'text-sidebar-heading' : 'text-heading'
  const taglineClass = isSidebar ? 'text-sidebar-muted' : 'text-muted'
  const iconClass = isSidebar ? 'text-sidebar-body' : 'text-body'

  return (
    <div className="flex items-center gap-2 overflow-hidden">
      <div className={`flex shrink-0 items-center justify-center ${iconClass}`}>
        <AppLogoMark className={compact ? 'size-7' : 'size-8'} />
      </div>
      {showText && (
        <div className="min-w-0 truncate">
          <p
            className={`truncate font-display text-sm font-semibold leading-tight ${titleClass}`}
          >
            {t('app.name')}
          </p>
          {!compact && (
            <p className={`truncate text-[10px] uppercase tracking-widest ${taglineClass}`}>
              {t('app.tagline')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
