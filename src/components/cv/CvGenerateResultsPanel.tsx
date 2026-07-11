import { useTranslation } from '../../hooks/useTranslation'
import type { CvOutputLanguage } from '../../types/cvOutputLanguage'
import type { ProfileCompatibility } from '../../types/compatibility'
import type { JobDescriptionAnalysis } from '../../types/jobDescription'
import type { TailoredCvResult } from '../../types/tailoredCv'
import CvGenerateInsightsPanel from './CvGenerateInsightsPanel'
import TailoredCvPreview from './TailoredCvPreview'

type CvGenerateResultsPanelProps = {
  analysis: JobDescriptionAnalysis | null
  compatibility: ProfileCompatibility | null
  tailoredResult: TailoredCvResult | null
  outputLanguage: CvOutputLanguage
  generateError: string | null
}

function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-card border border-dashed border-border bg-surface-muted/40 px-4 py-8 text-center">
      <p className="font-display text-sm font-semibold text-heading">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{description}</p>
    </div>
  )
}

export default function CvGenerateResultsPanel({
  analysis,
  compatibility,
  tailoredResult,
  outputLanguage,
  generateError,
}: CvGenerateResultsPanelProps) {
  const { t } = useTranslation()
  const hasInsights = !!analysis || !!compatibility

  return (
    <div className="space-y-6">
      <section aria-labelledby="generate-results-analysis">
        <h2 id="generate-results-analysis" className="sr-only">
          {t('pages.cv.generate.steps.analysis')}
        </h2>

        {hasInsights ? (
          <CvGenerateInsightsPanel
            compatibility={compatibility}
            analysis={analysis}
          />
        ) : (
          <EmptyState
            title={t('pages.cv.generate.empty.analysisTitle')}
            description={t('pages.cv.generate.empty.analysisDescription')}
          />
        )}
      </section>

      <section aria-labelledby="generate-results-tailored">
        <h2
          id="generate-results-tailored"
          className="mb-3 font-display text-base font-semibold text-heading"
        >
          {t('pages.cv.generate.steps.tailored')}
        </h2>

        {generateError && (
          <div className="mb-4 rounded-card border border-danger-border bg-danger-subtle px-4 py-3 text-sm text-danger">
            {generateError}
          </div>
        )}

        {tailoredResult ? (
          <TailoredCvPreview
            profile={tailoredResult.profile}
            meta={tailoredResult.meta}
            outputLanguage={outputLanguage}
            collapseMeta
          />
        ) : (
          <EmptyState
            title={t('pages.cv.generate.empty.tailoredTitle')}
            description={t('pages.cv.generate.empty.tailoredDescription')}
          />
        )}
      </section>
    </div>
  )
}
