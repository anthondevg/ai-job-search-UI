import { useTranslation } from '../../hooks/useTranslation'
import { DEV_MOCK_GENERATE } from '../../config/devFlags'
import { useCvGeneration } from '../../hooks/useCvGeneration'
import CvGenerateActionBar from './CvGenerateActionBar'
import CvGenerateResultsPanel from './CvGenerateResultsPanel'
import CvGenerateStepper from './CvGenerateStepper'
import CvRecordCard from './CvRecordCard'
import JobDescriptionInput from './JobDescriptionInput'

export default function CvGenerateTab() {
  const { t } = useTranslation()
  const {
    activeRecord,
    analysis,
    compatibility,
    tailoredResult,
    coverLetterResult,
    coverLetterError,
    jdError,
    generateError,
    outputLanguage,
    currentStep,
    isAnalyzing,
    isGenerating,
  } = useCvGeneration()

  return (
    <div className="flex flex-col gap-6 pb-4">
      {DEV_MOCK_GENERATE && (
        <div
          className="match-rail match-rail-warm match-notch match-notch-warm rounded-card bg-warm-subtle px-4 py-2 font-mono text-xs text-warm"
          role="status"
        >
          {t('pages.cv.generate.devMockBanner')}
        </div>
      )}

      <CvGenerateStepper
        currentStep={currentStep}
        isProcessing={isAnalyzing || isGenerating}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,32rem)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-6 lg:sticky lg:top-4 lg:self-start">
          {activeRecord ? (
            <CvRecordCard
              record={activeRecord}
              isActive
              readOnly
              badgeLabel={t('pages.cv.library.active')}
            />
          ) : (
            <div className="match-frame rounded-card border border-dashed border-border bg-surface-muted/40 px-4 py-3 text-sm text-muted">
              {t('pages.cv.generate.noActiveCv')}
            </div>
          )}

          <JobDescriptionInput />

          {jdError && (
            <div
              className="match-rail match-rail-danger match-frame rounded-card bg-danger-subtle px-4 py-3 text-sm text-danger"
              role="alert"
            >
              {jdError}
            </div>
          )}
        </div>

        <CvGenerateResultsPanel
          analysis={analysis}
          compatibility={compatibility}
          tailoredResult={tailoredResult}
          coverLetterResult={coverLetterResult}
          sourceProfile={activeRecord?.profile ?? null}
          outputLanguage={outputLanguage}
          generateError={generateError}
          coverLetterError={coverLetterError}
        />
      </div>

      <CvGenerateActionBar currentStep={currentStep} />
    </div>
  )
}
