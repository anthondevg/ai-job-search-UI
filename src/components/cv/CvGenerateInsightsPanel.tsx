import type { ReactNode } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import type { ProfileCompatibility } from '../../types/compatibility'
import type { JobDescriptionAnalysis } from '../../types/jobDescription'
import JobDescriptionAnalysisPanel from './JobDescriptionAnalysisPanel'
import ProfileCompatibilityCard from './ProfileCompatibilityCard'

type CvGenerateInsightsPanelProps = {
  compatibility: ProfileCompatibility | null
  analysis: JobDescriptionAnalysis | null
}

function CollapsibleSection({
  title,
  description,
  defaultOpen,
  children,
}: {
  title: string
  description?: string
  defaultOpen: boolean
  children: ReactNode
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-card border border-border bg-surface-muted"
    >
      <summary className="cursor-pointer list-none px-4 py-3 marker:content-none [&::-webkit-details-marker]:hidden">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-heading">{title}</h3>
            {description && (
              <p className="mt-0.5 text-xs text-muted">{description}</p>
            )}
          </div>
          <span className="shrink-0 font-mono text-xs text-muted transition-transform group-open:rotate-180">
            ▾
          </span>
        </div>
      </summary>
      <div className="border-t border-border px-4 py-4">{children}</div>
    </details>
  )
}

export default function CvGenerateInsightsPanel({
  compatibility,
  analysis,
}: CvGenerateInsightsPanelProps) {
  const { t } = useTranslation()

  if (!compatibility && !analysis) return null

  return (
    <section className="space-y-3" aria-labelledby="generate-insights-heading">
      <div>
        <h2
          id="generate-insights-heading"
          className="font-display text-base font-semibold text-heading"
        >
          {t('pages.cv.generate.insights.title')}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {t('pages.cv.generate.insights.description')}
        </p>
      </div>

      {compatibility && (
        <CollapsibleSection
          title={t('pages.cv.generate.compatibility.title')}
          defaultOpen
        >
          <ProfileCompatibilityCard compatibility={compatibility} bare />
        </CollapsibleSection>
      )}

      {analysis && (
        <CollapsibleSection
          title={t('pages.cv.generate.analysis.title')}
          description={t('pages.cv.generate.analysis.description')}
          defaultOpen={!compatibility}
        >
          <JobDescriptionAnalysisPanel analysis={analysis} bare />
        </CollapsibleSection>
      )}
    </section>
  )
}
