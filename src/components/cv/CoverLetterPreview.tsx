import { lazy, Suspense, useCallback, useState } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import type { CoverLetterResult } from '../../types/coverLetter'
import type { CVProfile } from '../../types/cvProfile'

const CoverLetterPdfPanel = lazy(() => import('./CoverLetterPdfPanel'))

type CoverLetterPreviewProps = {
  profile: CVProfile
  coverLetter: CoverLetterResult
}

export default function CoverLetterPreview({
  profile,
  coverLetter,
}: CoverLetterPreviewProps) {
  const { t } = useTranslation()
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(coverLetter.body)
      setCopyState('copied')
      window.setTimeout(() => setCopyState('idle'), 2000)
    } catch {
      setCopyState('failed')
      window.setTimeout(() => setCopyState('idle'), 3000)
    }
  }, [coverLetter.body])

  const titleParts = [coverLetter.roleTitle, coverLetter.companyName].filter(
    Boolean,
  )

  return (
    <div className="space-y-4">
      <section className="match-frame rounded-card border-border bg-surface-muted p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-muted">
              {t('pages.cv.generate.coverLetter.badge')}
            </p>
            <h3 className="mt-1 font-display text-base font-semibold text-heading">
              {titleParts.length > 0
                ? titleParts.join(' · ')
                : t('pages.cv.generate.coverLetter.title')}
            </h3>
            <p className="mt-1 text-sm text-muted">
              {t('pages.cv.generate.coverLetter.description')}
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleCopy()}
            className="match-frame shrink-0 rounded-control border-border px-4 py-2 text-sm font-medium text-body transition-colors hover:border-border-muted hover:bg-surface-raised"
          >
            {copyState === 'copied'
              ? t('pages.cv.generate.coverLetter.copied')
              : copyState === 'failed'
                ? t('pages.cv.generate.coverLetter.copyFailed')
                : t('pages.cv.generate.coverLetter.copy')}
          </button>
        </div>

        <div className="mt-4 match-frame rounded-card border-border bg-surface-raised px-4 py-4">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-body">
            {coverLetter.body}
          </pre>
        </div>
      </section>

      <Suspense
        fallback={
          <div className="rounded-card border border-border bg-surface-muted p-4 text-sm text-muted">
            {t('pages.cv.generate.coverLetter.pdfLoadingPreview')}
          </div>
        }
      >
        <CoverLetterPdfPanel profile={profile} coverLetter={coverLetter} />
      </Suspense>
    </div>
  )
}
