import { useTranslation } from '../../hooks/useTranslation'
import SkillBadge from '../SkillBadge'
import type { CVProfile } from '../../types/cvProfile'

type CvProfilePreviewProps = {
  profile: CVProfile
  fileName: string | null
  badgeLabel?: string
  compact?: boolean
}

export default function CvProfilePreview({
  profile,
  fileName,
  badgeLabel,
  compact = false,
}: CvProfilePreviewProps) {
  const { t } = useTranslation()
  const resolvedBadge =
    badgeLabel ?? t('pages.cv.preview.sourceOfTruth')

  const experienceSection = (
    <>
      {profile.experience.length > 0 ? (
        <ul className="space-y-3">
          {profile.experience.map((item) => (
            <li
              key={`${item.company}-${item.role}-${item.startDate}`}
              className="border-b border-border-muted pb-3 last:border-b-0 last:pb-0"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-heading">{item.role}</p>
                  <p className="text-sm text-body">{item.company}</p>
                </div>
                <p className="font-mono text-xs text-muted">
                  {item.startDate} – {item.endDate}
                </p>
              </div>
              {item.bullets.length > 0 && (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-body">
                  {item.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">{t('pages.cv.preview.empty')}</p>
      )}
    </>
  )

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2
            className={`font-display font-semibold text-heading ${
              compact ? 'text-sm' : 'text-base'
            }`}
          >
            {t('pages.cv.preview.title')}
          </h2>
          {fileName && (
            <p className="mt-0.5 font-mono text-xs text-muted">{fileName}</p>
          )}
        </div>
        <span className="match-chip match-chip-success">
          {resolvedBadge}
        </span>
      </div>

      <div
        className={`grid gap-3 ${compact ? 'sm:grid-cols-2' : 'gap-4 lg:grid-cols-2'}`}
      >
        <section className="match-frame rounded-card border-border bg-surface-muted p-4">
          <h3 className="text-sm font-semibold text-heading">
            {t('pages.cv.preview.personalInfo')}
          </h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-muted">{t('pages.cv.preview.name')}</dt>
              <dd className="font-medium text-heading">
                {profile.personalInfo.name || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-muted">{t('pages.cv.preview.email')}</dt>
              <dd className="text-body">{profile.personalInfo.email || '—'}</dd>
            </div>
            <div>
              <dt className="text-muted">{t('pages.cv.preview.location')}</dt>
              <dd className="text-body">{profile.personalInfo.location || '—'}</dd>
            </div>
          </dl>
        </section>

        <section className="match-frame rounded-card border-border bg-surface-muted p-4">
          <h3 className="text-sm font-semibold text-heading">
            {t('pages.cv.preview.summary')}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-body">
            {profile.summary || t('pages.cv.preview.empty')}
          </p>
        </section>

        <section
          className={`match-frame rounded-card border-border bg-surface-muted p-4 ${
            compact ? 'sm:col-span-2' : 'lg:col-span-2'
          }`}
        >
          <h3 className="text-sm font-semibold text-heading">
            {t('pages.cv.preview.skills')}
          </h3>
          {profile.skills.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <SkillBadge key={skill} label={skill} />
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">
              {t('pages.cv.preview.empty')}
            </p>
          )}
        </section>

        {compact ? (
          <details className="match-frame rounded-card border-border bg-surface-muted sm:col-span-2">
            <summary className="cursor-pointer list-none px-4 py-3 marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="text-sm font-semibold text-heading">
                {t('pages.cv.preview.experience')}
              </span>
            </summary>
            <div className="border-t border-border px-4 py-3">
              {experienceSection}
            </div>
          </details>
        ) : (
          <section className="match-frame rounded-card border-border bg-surface-muted p-4 lg:col-span-2">
            <h3 className="text-sm font-semibold text-heading">
              {t('pages.cv.preview.experience')}
            </h3>
            <div className="mt-3">{experienceSection}</div>
          </section>
        )}
      </div>
    </div>
  )
}
