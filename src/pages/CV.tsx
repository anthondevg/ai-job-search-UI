import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from '../hooks/useTranslation'
import CvGenerateTab from '../components/cv/CvGenerateTab'
import CvImportTab from '../components/cv/CvImportTab'
import CvTabs, { type CvTabId } from '../components/cv/CvTabs'

export default function CV() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<CvTabId>(() =>
    searchParams.get('tab') === 'generate' ? 'generate' : 'import',
  )

  return (
    <div className="match-page flex flex-1 flex-col p-3 sm:p-4 lg:p-5">
      <header className="match-page-header mb-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 pb-3">
        <div className="flex items-baseline gap-3">
          <h1 className="font-display text-2xl font-semibold text-heading">
            {t('pages.cv.title')}
          </h1>
          <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-accent">
            Career workspace / 01
          </p>
        </div>
        <p className="min-w-0 flex-1 text-xs text-muted sm:text-right">
          {t('pages.cv.description')}
        </p>
      </header>

      <CvTabs activeTab={activeTab} onChange={setActiveTab}>
        {activeTab === 'import' ? <CvImportTab /> : <CvGenerateTab />}
      </CvTabs>
    </div>
  )
}
