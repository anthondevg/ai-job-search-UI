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
    <div className="flex flex-col overflow-hidden rounded-panel border border-border bg-surface-raised">
      <div
        role="tablist"
        aria-label={t('pages.cv.tabs.label')}
        className="flex border-b border-border"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab

          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab)}
              className={`min-w-[5rem] px-4 py-2.5 text-xs font-medium uppercase tracking-widest transition-colors sm:min-w-[6rem] sm:px-5 ${
                isActive
                  ? 'bg-surface text-heading'
                  : 'text-muted hover:bg-surface-muted/60 hover:text-body'
              }`}
            >
              {t(`pages.cv.tabs.${tab}`)}
            </button>
          )
        })}
      </div>

      <div role="tabpanel" className="bg-surface p-4 sm:p-6">
        {children}
      </div>
    </div>
  )
}
