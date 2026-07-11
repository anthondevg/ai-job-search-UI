import { useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import CvGenerateTab from '../components/cv/CvGenerateTab'
import CvImportTab from '../components/cv/CvImportTab'
import CvTabs, { type CvTabId } from '../components/cv/CvTabs'

export default function CV() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<CvTabId>('import')

  return (
    <div className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
      <header className="mb-4 sm:mb-6 lg:mb-8">
        <h1 className="text-xl font-semibold text-heading sm:text-2xl">
          {t('pages.cv.title')}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {t('pages.cv.description')}
        </p>
      </header>

      <CvTabs activeTab={activeTab} onChange={setActiveTab}>
        {activeTab === 'import' ? <CvImportTab /> : <CvGenerateTab />}
      </CvTabs>
    </div>
  )
}
