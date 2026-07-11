import { lazy, Suspense, type ReactNode } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import SkillBadge from '../SkillBadge'
import type { CvOutputLanguage } from '../../types/cvOutputLanguage'
import type { TailoredCvMeta } from '../../types/tailoredCv'
import CvProfilePreview from './CvProfilePreview'
import type { CVProfile } from '../../types/cvProfile'

const CvPdfPanel = lazy(() => import('./CvPdfPanel'))

type TailoredCvPreviewProps = {
  profile: CVProfile
  meta: TailoredCvMeta
  outputLanguage: CvOutputLanguage
  collapseMeta?: boolean
}

export default function TailoredCvPreview({
  profile,
  meta,
  outputLanguage,
  collapseMeta = false,
}: TailoredCvPreviewProps) {
  const { t } = useTranslation()

  const matchedContent =
    meta.matchedSkills.length > 0 || meta.matchedKeywords.length > 0 ? (
      <>
        {meta.matchedSkills.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-heading">
              {t('pages.cv.generate.tailored.matchedSkills')}
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {meta.matchedSkills.map((skill) => (
                <SkillBadge key={skill} label={skill} variant="matched" />
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
                <SkillBadge key={keyword} label={keyword} variant="keyword" />
              ))}
            </div>
          </div>
        )}
      </>
    ) : null

  const notesContent =
    meta.adaptationNotes.length > 0 ? (
      <ul className="list-disc space-y-1 pl-5 text-sm text-body">
        {meta.adaptationNotes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    ) : null

  const missingContent =
    meta.missingFromCv.length > 0 ? (
      <>
        <p className="text-xs text-muted">
          {t('pages.cv.generate.tailored.missingFromCvHint')}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {meta.missingFromCv.map((skill) => (
            <SkillBadge key={skill} label={skill} variant="missing" />
          ))}
        </div>
      </>
    ) : null

  const wrapCard = (title: string, content: ReactNode) => (
    <section className="match-frame rounded-card border-border bg-surface-muted p-4">
      <h3 className="text-sm font-semibold text-heading">{title}</h3>
      <div className="mt-3">{content}</div>
    </section>
  )

  const wrapCollapsible = (title: string, content: ReactNode) => (
    <details className="group match-frame rounded-card border-border bg-surface-muted">
      <summary className="cursor-pointer list-none px-4 py-3 marker:content-none [&::-webkit-details-marker]:hidden">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-heading">{title}</h3>
          <span className="shrink-0 font-mono text-xs text-muted transition-transform group-open:rotate-180">
            ▾
          </span>
        </div>
      </summary>
      <div className="border-t border-border px-4 py-4">{content}</div>
    </details>
  )

  const renderMetaSection = (title: string, content: ReactNode) => {
    if (!content) return null
    return collapseMeta ? wrapCollapsible(title, content) : wrapCard(title, content)
  }

  return (
    <div className="space-y-4">
      <CvProfilePreview
        profile={profile}
        fileName={meta.roleTitle || null}
        badgeLabel={t('pages.cv.generate.tailored.badge')}
      />

      {renderMetaSection(
        t('pages.cv.generate.tailored.matchedSkills'),
        matchedContent,
      )}
      {renderMetaSection(
        t('pages.cv.generate.tailored.adaptationNotes'),
        notesContent,
      )}
      {renderMetaSection(
        t('pages.cv.generate.tailored.missingFromCv'),
        missingContent,
      )}

      <Suspense
        fallback={
          <div className="rounded-card border border-border bg-surface-muted p-4 text-sm text-muted">
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
