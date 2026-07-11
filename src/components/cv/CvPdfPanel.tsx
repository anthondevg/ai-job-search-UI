import { PDFViewer } from '@react-pdf/renderer'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import type { CVProfile } from '../../types/cvProfile'
import type { CvOutputLanguage } from '../../types/cvOutputLanguage'
import { getCvPdfLabels } from '../../utils/cvPdfLabels'
import { downloadCvPdf } from '../../utils/downloadCvPdf'
import CvPdfDocument from './pdf/CvPdfDocument'

type CvPdfPanelProps = {
  profile: CVProfile
  roleTitle?: string
  outputLanguage: CvOutputLanguage
}

export default function CvPdfPanel({
  profile,
  roleTitle,
  outputLanguage,
}: CvPdfPanelProps) {
  const { t } = useTranslation()
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const labels = useMemo(
    () => getCvPdfLabels(outputLanguage),
    [outputLanguage],
  )

  const document = useMemo(
    () => <CvPdfDocument profile={profile} labels={labels} />,
    [profile, labels],
  )

  const handleDownload = useCallback(async () => {
    setIsDownloading(true)
    setDownloadError(null)

    try {
      await downloadCvPdf(profile, labels, roleTitle)
    } catch {
      setDownloadError(t('pages.cv.generate.pdf.downloadFailed'))
    } finally {
      setIsDownloading(false)
    }
  }, [labels, profile, roleTitle, t])

  return (
    <section className="space-y-4 rounded-xl border border-border bg-surface-muted p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-heading">
            {t('pages.cv.generate.pdf.previewTitle')}
          </h3>
          <p className="mt-1 text-sm text-muted">
            {t('pages.cv.generate.pdf.previewDescription')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleDownload()}
          disabled={isDownloading}
          className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDownloading
            ? t('pages.cv.generate.pdf.downloading')
            : t('pages.cv.generate.pdf.download')}
        </button>
      </div>

      {downloadError && (
        <div className="rounded-lg border border-danger-border bg-danger-subtle px-4 py-3 text-sm text-danger">
          {downloadError}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-white">
        <PDFViewer width="100%" height={720} showToolbar>
          {document}
        </PDFViewer>
      </div>
    </section>
  )
}
