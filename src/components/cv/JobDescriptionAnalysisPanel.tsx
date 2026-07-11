import { useTranslation } from '../../hooks/useTranslation'
import type { JobDescriptionAnalysis } from '../../types/jobDescription'

type JobDescriptionAnalysisPanelProps = {
  analysis: JobDescriptionAnalysis
}

function TagList({ items, variant }: { items: string[]; variant: 'accent' | 'muted' }) {
  if (!items.length) return null

  const className =
    variant === 'accent'
      ? 'bg-accent-subtle text-accent'
      : 'bg-surface-tab text-body'

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className={`rounded-full px-3 py-1 text-xs font-medium ${className}`}
        >
          {item}
        </span>
      ))}
    </div>
  )
}

export default function JobDescriptionAnalysisPanel({
  analysis,
}: JobDescriptionAnalysisPanelProps) {
  const { t } = useTranslation()

  return (
    <section className="space-y-4 rounded-xl border border-border bg-surface-muted p-4">
      <div>
        <h2 className="text-base font-semibold text-heading">
          {t('pages.cv.generate.analysis.title')}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {t('pages.cv.generate.analysis.description')}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            {t('pages.cv.generate.analysis.roleTitle')}
          </p>
          <p className="mt-1 text-sm font-medium text-heading">
            {analysis.roleTitle || '—'}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
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
            <TagList items={analysis.keywords} variant="accent" />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-heading">
            {t('pages.cv.generate.analysis.requiredSkills')}
          </h3>
          <div className="mt-2">
            <TagList items={analysis.requiredSkills} variant="muted" />
          </div>
        </div>

        {analysis.preferredSkills.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-heading">
              {t('pages.cv.generate.analysis.preferredSkills')}
            </h3>
            <div className="mt-2">
              <TagList items={analysis.preferredSkills} variant="muted" />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
