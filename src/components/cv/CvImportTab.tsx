import { useEffect, useRef, type ChangeEvent, type DragEvent } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import { useCvProfiles } from '../../hooks/useCvProfiles'
import CvLibrary from './CvLibrary'
import CvProfilePreview from './CvProfilePreview'

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

export default function CvImportTab() {
  const { t } = useTranslation()
  const importDetailsRef = useRef<HTMLDetailsElement>(null)
  const {
    inputRef,
    records,
    activeRecord,
    activeId,
    isLoading,
    status,
    error,
    handleFile,
    openFilePicker,
    setDragging,
    selectRecord,
    removeRecord,
  } = useCvProfiles()

  const isParsing = status === 'parsing'
  const isDragging = status === 'dragging'
  const hasRecords = records.length > 0

  useEffect(() => {
    if ((isParsing || error) && importDetailsRef.current) {
      importDetailsRef.current.open = true
    }
  }, [error, isParsing])

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (!isParsing) setDragging(true)
  }

  const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
  }

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)

    if (isParsing) return

    const file = event.dataTransfer.files.item(0)
    if (file) void handleFile(file)
  }

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.item(0)
    if (file) void handleFile(file)
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:items-start">
        <CvLibrary
          records={records}
          activeId={activeId}
          isLoading={isLoading}
          onSelect={selectRecord}
          onDelete={(id) => void removeRecord(id)}
        />

        {activeRecord ? (
          <CvProfilePreview
            profile={activeRecord.profile}
            fileName={activeRecord.fileName}
            compact
          />
        ) : (
          <div className="match-frame rounded-card border-dashed border-border bg-surface-muted/30 px-4 py-6 text-sm text-muted lg:min-h-[12rem]">
            {hasRecords
              ? t('pages.cv.library.description')
              : t('pages.cv.upload.emptyLibraryHint')}
          </div>
        )}
      </div>

      <details
        ref={importDetailsRef}
        className="group match-frame rounded-card border-border bg-surface-muted/40"
        open={!hasRecords}
      >
        <summary className="cursor-pointer list-none px-4 py-3 marker:content-none [&::-webkit-details-marker]:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-control match-rail match-rail-accent bg-accent-subtle text-accent">
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

        <div className="border-t border-border px-4 py-3">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={onInputChange}
          />

          <div
            role="button"
            tabIndex={0}
            onClick={() => !isParsing && openFilePicker()}
            onKeyDown={(event) => {
              if ((event.key === 'Enter' || event.key === ' ') && !isParsing) {
                event.preventDefault()
                openFilePicker()
              }
            }}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            aria-busy={isParsing}
            className={`flex flex-col gap-3 rounded-control border border-dashed p-3 transition-colors sm:flex-row sm:items-center sm:justify-between ${
              isDragging
                ? 'match-rail match-rail-accent border-border bg-accent-subtle/40'
                : 'border-border bg-surface-raised/60 hover:border-border-muted'
            } ${isParsing ? 'pointer-events-none opacity-70' : 'cursor-pointer'}`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-control ${
                  isParsing
                    ? 'match-frame border-border bg-surface-tab text-muted'
                    : 'match-rail match-rail-accent bg-accent-subtle text-accent'
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

      {error && (
        <div className="match-rail match-rail-danger match-frame rounded-card bg-danger-subtle px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}
    </div>
  )
}
