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
    <div className="flex flex-col">
      <div className="rounded-t-xl border border-b-0 border-border bg-gradient-to-b from-surface-muted via-surface-tab/90 to-surface-tab shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div
          role="tablist"
          aria-label={t('pages.cv.tabs.label')}
          className="inline-flex items-end gap-0.5 px-1.5 pt-1"
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
                className={`relative min-w-[4.5rem] rounded-t-lg px-3 py-1.5 text-xs font-medium transition-all sm:min-w-[5rem] sm:px-3.5 sm:py-2 ${
                  isActive
                    ? 'z-10 -mb-px border border-b-0 border-border bg-surface-raised text-heading shadow-[0_-1px_0_rgba(255,255,255,0.05)_inset]'
                    : 'border border-transparent text-muted hover:bg-white/5 hover:text-body'
                }`}
              >
                {t(`pages.cv.tabs.${tab}`)}
              </button>
            )
          })}
        </div>
      </div>

      <div
        role="tabpanel"
        className="-mt-px rounded-b-xl rounded-tr-xl border border-border bg-surface-raised p-4 sm:p-6"
      >
        {children}
      </div>
    </div>
  )
}
