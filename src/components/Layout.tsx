import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useTranslation } from '../hooks/useTranslation'
import AppLogo from './AppLogo'
import LanguageSwitcher from './LanguageSwitcher'
import Sidebar from './Sidebar'

export default function Layout() {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="flex min-h-svh bg-surface">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={() => setCollapsed((prev) => !prev)}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-surface px-4 lg:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label={t('layout.openMenu')}
              className="flex size-9 items-center justify-center rounded-control text-muted transition-colors hover:bg-surface-muted hover:text-heading"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </button>
            <AppLogo compact />
          </div>

          <div className="w-24">
            <LanguageSwitcher compact />
          </div>
        </header>

        <main className="flex flex-1 flex-col overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
