import { useEffect, useRef, type ChangeEvent, type DragEvent, type RefObject } from 'react'
import { useTranslation } from '../../hooks/useTranslation'

function UploadIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  )
}

function ParsingSpinner() {
  return (
    <svg
      className="size-5 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

type CvImportUploadProps = {
  inputRef: RefObject<HTMLInputElement | null>
  isParsing: boolean
  isDragging: boolean
  hasRecords: boolean
  error: string | null
  onOpenFilePicker: () => void
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void
  onDragOver: (event: DragEvent<HTMLDivElement>) => void
  onDragLeave: (event: DragEvent<HTMLDivElement>) => void
  onDrop: (event: DragEvent<HTMLDivElement>) => void
  compact?: boolean
  flat?: boolean
}

export default function CvImportUpload({
  inputRef,
  isParsing,
  isDragging,
  hasRecords,
  error,
  onOpenFilePicker,
  onFileChange,
  onDragOver,
  onDragLeave,
  onDrop,
  compact = false,
  flat = false,
}: CvImportUploadProps) {
  const { t } = useTranslation()
  const importDetailsRef = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    if ((isParsing || error) && importDetailsRef.current) {
      importDetailsRef.current.open = true
    }
  }, [error, isParsing])

  if (compact) {
    return (
      <>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={onFileChange}
        />
        <button
          type="button"
          onClick={() => !isParsing && onOpenFilePicker()}
          disabled={isParsing}
          aria-label={t('pages.cv.upload.title')}
          title={t('pages.cv.upload.title')}
          className="flex size-10 items-center justify-center bg-accent-subtle text-accent transition-colors hover:bg-accent-subtle/80 disabled:cursor-wait disabled:opacity-70"
        >
          {isParsing ? <ParsingSpinner /> : <UploadIcon />}
        </button>
      </>
    )
  }

  return (
    <details
      ref={importDetailsRef}
      className={`group bg-surface-muted/40 ${flat ? '' : 'match-frame rounded-card border-border'}`}
      open={!hasRecords}
    >
      <summary className="cursor-pointer list-none px-4 py-3 marker:content-none [&::-webkit-details-marker]:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center bg-accent-subtle text-accent">
              <UploadIcon />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-heading">
                {hasRecords
                  ? t('pages.cv.upload.collapsedSummary')
                  : t('pages.cv.upload.title')}
              </p>
              <p className="truncate text-xs text-muted">
                {t('pages.cv.upload.hint')}
              </p>
            </div>
          </div>
          <span className="shrink-0 font-mono text-xs text-muted transition-transform group-open:rotate-180">
            ▾
          </span>
        </div>
      </summary>

      <div className={`px-4 py-3 ${flat ? '' : 'border-t border-border'}`}>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={onFileChange}
        />

        <div
          role="button"
          tabIndex={0}
          onClick={() => !isParsing && onOpenFilePicker()}
          onKeyDown={(event) => {
            if ((event.key === 'Enter' || event.key === ' ') && !isParsing) {
              event.preventDefault()
              onOpenFilePicker()
            }
          }}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          aria-busy={isParsing}
          className={`flex flex-col gap-3 p-3 transition-colors sm:flex-row sm:items-center sm:justify-between ${
            isDragging
              ? 'bg-accent-subtle/40'
              : 'bg-surface-raised/60 hover:bg-surface-raised'
          } ${isParsing ? 'pointer-events-none opacity-70' : 'cursor-pointer'}`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={`flex size-10 shrink-0 items-center justify-center ${
                isParsing
                  ? 'bg-surface-tab text-muted'
                  : 'bg-accent-subtle text-accent'
              }`}
            >
              {isParsing ? <ParsingSpinner /> : <UploadIcon />}
            </span>
            <div className="min-w-0 text-left">
              <p className="text-sm font-medium text-body">
                {isParsing
                  ? t('pages.cv.upload.parsing')
                  : t('pages.cv.upload.dropzoneShort')}
              </p>
              <p className="text-xs text-muted">{t('pages.cv.upload.hint')}</p>
            </div>
          </div>

          {!isParsing && (
            <span className="shrink-0 rounded-control border border-border bg-surface-tab px-3 py-1.5 text-xs font-medium text-body sm:self-center">
              {t('pages.cv.upload.browse')}
            </span>
          )}
        </div>
      </div>
    </details>
  )
}
