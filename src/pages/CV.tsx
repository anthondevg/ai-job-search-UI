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
    <div className="match-page flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
      <header className="match-page-header mb-6 pb-5 sm:mb-8 sm:pb-7">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">Career workspace / 01</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-heading sm:text-4xl">
          {t('pages.cv.title')}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          {t('pages.cv.description')}
        </p>
      </header>

      <CvTabs activeTab={activeTab} onChange={setActiveTab}>
        {activeTab === 'import' ? <CvImportTab /> : <CvGenerateTab />}
      </CvTabs>
    </div>
  )
}
