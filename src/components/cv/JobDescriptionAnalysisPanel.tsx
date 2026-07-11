import { useTranslation } from '../../hooks/useTranslation'
import type { JobDescriptionAnalysis } from '../../types/jobDescription'

type JobDescriptionAnalysisPanelProps = {
  analysis: JobDescriptionAnalysis
  bare?: boolean
}

function TagList({
  items,
  variant,
}: {
  items: string[]
  variant: 'keyword' | 'required' | 'preferred'
}) {
  if (!items.length) return null

  const className =
    variant === 'keyword'
      ? 'border-accent/40 bg-accent-subtle text-accent'
      : variant === 'required'
        ? 'border-border bg-surface-tab text-body'
        : 'border-border-muted bg-surface-raised text-muted'

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className={`rounded-tag border px-2 py-0.5 font-mono text-xs font-medium ${className}`}
        >
          {item}
        </span>
      ))}
    </div>
  )
}

export default function JobDescriptionAnalysisPanel({
  analysis,
  bare = false,
}: JobDescriptionAnalysisPanelProps) {
  const { t } = useTranslation()

  const content = (
    <>
      {!bare && (
        <div>
          <h2 className="font-display text-base font-semibold text-heading">
            {t('pages.cv.generate.analysis.title')}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {t('pages.cv.generate.analysis.description')}
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted">
            {t('pages.cv.generate.analysis.roleTitle')}
          </p>
          <p className="mt-1 text-sm font-medium text-heading">
            {analysis.roleTitle || '—'}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted">
            {t('pages.cv.generate.analysis.seniority')}
          </p>
          <p className="mt-1 text-sm font-medium text-heading">
            {analysis.seniority || '—'}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-heading">
            {t('pages.cv.generate.analysis.keywords')}
          </h3>
          <div className="mt-2">
            <TagList items={analysis.keywords} variant="keyword" />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-heading">
            {t('pages.cv.generate.analysis.requiredSkills')}
          </h3>
          <div className="mt-2">
            <TagList items={analysis.requiredSkills} variant="required" />
          </div>
        </div>

        {analysis.preferredSkills.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-heading">
              {t('pages.cv.generate.analysis.preferredSkills')}
            </h3>
            <div className="mt-2">
              <TagList items={analysis.preferredSkills} variant="preferred" />
            </div>
          </div>
        )}
      </div>
    </>
  )

  if (bare) {
    return <div className="space-y-4">{content}</div>
  }

  return (
    <section className="space-y-4 rounded-card border border-border bg-surface-muted p-4">
      {content}
    </section>
  )
}
