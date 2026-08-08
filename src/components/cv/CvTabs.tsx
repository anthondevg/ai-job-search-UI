import type { ReactNode } from 'react'
import { useTranslation } from '../../hooks/useTranslation'

export type CvTabId = 'import' | 'generate'

type CvTabsProps = {
  activeTab: CvTabId
  onChange: (tab: CvTabId) => void
  children: ReactNode
}

const tabs: CvTabId[] = ['import', 'generate']

export default function CvTabs({ activeTab, onChange, children }: CvTabsProps) {
  const { t } = useTranslation()

  return (
    <div className="match-frame flex flex-col overflow-hidden rounded-panel border-border bg-surface-raised">
      <div
        role="tablist"
        aria-label={t('pages.cv.tabs.label')}
        className="flex gap-1 border-b border-border bg-surface-muted/60 p-1"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab
          const tabId = `cv-tab-${tab}`

          return (
            <button
              key={tab}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="cv-tabpanel"
              onClick={() => onChange(tab)}
              className={`relative flex min-w-[6rem] items-center justify-center rounded-control border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-[background-color,border-color,color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-muted ${
                isActive
                  ? 'border-border bg-surface-raised text-heading shadow-[0_2px_8px_color-mix(in_srgb,var(--color-surface-muted)_60%,transparent)]'
                  : 'border-transparent text-muted hover:border-border-muted hover:bg-surface-tab/70 hover:text-body'
              }`}
            >
              <span
                className={`mr-2 size-1.5 rounded-full transition-colors ${
                  isActive ? 'bg-accent' : 'bg-border'
                }`}
                aria-hidden
              />
              {t(`pages.cv.tabs.${tab}`)}
              {isActive && (
                <span
                  className="absolute inset-x-3 -bottom-1 h-0.5 rounded-full bg-accent"
                  aria-hidden
                />
              )}
            </button>
          )
        })}
      </div>

      <div
        id="cv-tabpanel"
        role="tabpanel"
        aria-labelledby={`cv-tab-${activeTab}`}
        className="bg-surface p-3 sm:p-4"
      >
        {children}
      </div>
    </div>
  )
}
