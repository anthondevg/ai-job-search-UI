import { lazy, Suspense } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import type { CvOutputLanguage } from '../../types/cvOutputLanguage'
import type { TailoredCvMeta } from '../../types/tailoredCv'
import CvProfilePreview from './CvProfilePreview'
import type { CVProfile } from '../../types/cvProfile'

const CvPdfPanel = lazy(() => import('./CvPdfPanel'))

type TailoredCvPreviewProps = {
  profile: CVProfile
  meta: TailoredCvMeta
  outputLanguage: CvOutputLanguage
}

export default function TailoredCvPreview({
  profile,
  meta,
  outputLanguage,
}: TailoredCvPreviewProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <CvProfilePreview
        profile={profile}
        fileName={meta.roleTitle || null}
        badgeLabel={t('pages.cv.generate.tailored.badge')}
      />

      {(meta.matchedSkills.length > 0 || meta.matchedKeywords.length > 0) && (
        <section className="rounded-xl border border-border bg-surface-muted p-4">
          {meta.matchedSkills.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-heading">
                {t('pages.cv.generate.tailored.matchedSkills')}
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {meta.matchedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-success-subtle px-3 py-1 text-xs font-medium text-success"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {meta.matchedKeywords.length > 0 && (
            <div className={meta.matchedSkills.length > 0 ? 'mt-4' : ''}>
              <h3 className="text-sm font-semibold text-heading">
                {t('pages.cv.generate.tailored.matchedKeywords')}
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {meta.matchedKeywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full bg-accent-subtle px-3 py-1 text-xs font-medium text-accent"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {meta.adaptationNotes.length > 0 && (
        <section className="rounded-xl border border-border bg-surface-muted p-4">
          <h3 className="text-sm font-semibold text-heading">
            {t('pages.cv.generate.tailored.adaptationNotes')}
          </h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-body">
            {meta.adaptationNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      )}

      {meta.missingFromCv.length > 0 && (
        <section className="rounded-xl border border-border bg-surface-muted p-4">
          <h3 className="text-sm font-semibold text-heading">
            {t('pages.cv.generate.tailored.missingFromCv')}
          </h3>
          <p className="mt-1 text-xs text-muted">
            {t('pages.cv.generate.tailored.missingFromCvHint')}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {meta.missingFromCv.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      <Suspense
        fallback={
          <div className="rounded-xl border border-border bg-surface-muted p-4 text-sm text-muted">
            {t('pages.cv.generate.pdf.loadingPreview')}
          </div>
        }
      >
        <CvPdfPanel
          profile={profile}
          roleTitle={meta.roleTitle}
          outputLanguage={outputLanguage}
        />
      </Suspense>
    </div>
  )
}
