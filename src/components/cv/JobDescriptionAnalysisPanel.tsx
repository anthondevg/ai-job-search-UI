import { useTranslation } from '../../hooks/useTranslation'
import SkillBadge from '../SkillBadge'
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

  const badgeVariant =
    variant === 'keyword'
      ? 'keyword'
      : variant === 'required'
        ? 'skill'
        : 'skill'

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <SkillBadge key={item} label={item} variant={badgeVariant} />
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
    <section className="match-frame space-y-4 rounded-card border-border bg-surface-muted p-4">
      {content}
    </section>
  )
}
