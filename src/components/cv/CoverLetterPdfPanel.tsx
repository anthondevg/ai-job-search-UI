import { PDFViewer } from '@react-pdf/renderer'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import type { CoverLetterResult } from '../../types/coverLetter'
import type { CVProfile } from '../../types/cvProfile'
import { downloadCoverLetterPdf } from '../../utils/downloadCoverLetterPdf'
import CoverLetterPdfDocument from './pdf/CoverLetterPdfDocument'

type CoverLetterPdfPanelProps = {
  profile: CVProfile
  coverLetter: CoverLetterResult
}

export default function CoverLetterPdfPanel({
  profile,
  coverLetter,
}: CoverLetterPdfPanelProps) {
  const { t } = useTranslation()
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const document = useMemo(
    () => (
      <CoverLetterPdfDocument profile={profile} coverLetter={coverLetter} />
    ),
    [profile, coverLetter],
  )

  const handleDownload = useCallback(async () => {
    setIsDownloading(true)
    setDownloadError(null)

    try {
      await downloadCoverLetterPdf(profile, coverLetter)
    } catch {
      setDownloadError(t('pages.cv.generate.coverLetter.pdfDownloadFailed'))
    } finally {
      setIsDownloading(false)
    }
  }, [coverLetter, profile, t])

  return (
    <section className="match-frame space-y-4 rounded-card border-border bg-surface-muted p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-display text-base font-semibold text-heading">
            {t('pages.cv.generate.coverLetter.pdfPreviewTitle')}
          </h3>
          <p className="mt-1 text-sm text-muted">
            {t('pages.cv.generate.coverLetter.pdfPreviewDescription')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleDownload()}
          disabled={isDownloading}
          className="match-frame shrink-0 rounded-control border-accent bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDownloading
            ? t('pages.cv.generate.coverLetter.pdfDownloading')
            : t('pages.cv.generate.coverLetter.pdfDownload')}
        </button>
      </div>

      {downloadError && (
        <div className="match-frame rounded-card border-danger-border bg-danger-subtle px-4 py-3 text-sm text-danger">
          {downloadError}
        </div>
      )}

      <div className="match-frame overflow-hidden rounded-card border-border bg-[#f8fafc] p-1">
        <PDFViewer width="100%" height={560} showToolbar>
          {document}
        </PDFViewer>
      </div>
    </section>
  )
}
