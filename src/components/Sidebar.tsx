import { NavLink } from 'react-router-dom'
import { useTranslation } from '../hooks/useTranslation'
import AppLogo, { AppLogoMark } from './AppLogo'
import LanguageSwitcher from './LanguageSwitcher'

type SidebarProps = {
  collapsed: boolean
  mobileOpen: boolean
  onToggle: () => void
  onMobileClose: () => void
}

const navItems = [
  {
    to: '/cv',
    labelKey: 'nav.cv' as const,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 shrink-0">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    to: '/job-scraper-market',
    labelKey: 'nav.jobScraperMarket' as const,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 shrink-0">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
        <path d="M11 8v6" />
        <path d="M8 11h6" />
      </svg>
    ),
  },
]

export default function Sidebar({
  collapsed,
  mobileOpen,
  onToggle,
  onMobileClose,
}: SidebarProps) {
  const { t } = useTranslation()
  const showLabels = !collapsed || mobileOpen

  return (
    <>
      <div
        aria-hidden={!mobileOpen}
        onClick={onMobileClose}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden ${
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 lg:relative lg:z-auto lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64 ${collapsed ? 'lg:w-[72px]' : 'lg:w-64'}`}
      >
        <div
          className={`flex h-14 shrink-0 items-center border-b border-sidebar-border lg:h-16 ${
            showLabels ? 'justify-between px-4' : 'justify-center px-2'
          }`}
        >
          {showLabels ? (
            <AppLogo variant="sidebar" />
          ) : (
            <div className="text-sidebar-body max-lg:hidden">
              <AppLogoMark className="size-8" />
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              if (mobileOpen) {
                onMobileClose()
                return
              }
              onToggle()
            }}
            aria-label={
              mobileOpen
                ? t('sidebar.closeMenu')
                : collapsed
                  ? t('sidebar.expand')
                  : t('sidebar.collapse')
            }
            className="flex size-9 items-center justify-center rounded-control text-sidebar-muted transition-colors hover:bg-sidebar-hover hover:text-sidebar-heading"
          >
            {mobileOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5 lg:hidden"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`size-5 transition-transform duration-300 max-lg:hidden ${
                  collapsed ? 'rotate-180' : ''
                }`}
              >
                <rect width="18" height="18" x="3" y="3" rx="0" />
                <path d="M9 3v18" />
                <path d="m14 9 3 3-3 3" />
              </svg>
            )}
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
          {navItems.map((item) => {
            const label = t(item.labelKey)

            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={!showLabels ? label : undefined}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  `mx-0.5 flex items-center gap-3 rounded-card border-l-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                    showLabels ? '' : 'justify-center border-l-0'
                  } ${
                    isActive
                      ? 'border-accent bg-sidebar-active text-sidebar-heading'
                      : 'border-transparent text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-body'
                  }`
                }
              >
                {item.icon}
                {showLabels && <span className="truncate">{label}</span>}
              </NavLink>
            )
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          {showLabels ? (
            <>
              <LanguageSwitcher variant="sidebar" />
              <p className="mt-3 text-xs text-sidebar-muted">{t('app.version')}</p>
            </>
          ) : (
            <LanguageSwitcher compact variant="sidebar" />
          )}
        </div>
      </aside>
    </>
  )
}
