import type { ChangeEvent, DragEvent } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import { useCvProfiles } from '../../hooks/useCvProfiles'
import CvLibrary from './CvLibrary'
import CvProfilePreview from './CvProfilePreview'

export default function CvImportTab() {
  const { t } = useTranslation()
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
    <div className="space-y-6">
      <CvLibrary
        records={records}
        activeId={activeId}
        isLoading={isLoading}
        onSelect={selectRecord}
        onDelete={(id) => void removeRecord(id)}
      />

      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-heading">
            {t('pages.cv.upload.title')}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {t('pages.cv.upload.description')}
          </p>
        </div>

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
          className={`rounded-xl border-2 border-dashed p-6 transition-colors sm:p-8 ${
            isDragging
              ? 'border-accent/60 bg-accent-subtle/40'
              : 'border-border bg-surface-muted/40 hover:border-border-muted'
          } ${isParsing ? 'pointer-events-none opacity-70' : 'cursor-pointer'}`}
        >
          <div className="flex flex-col items-center text-center">
            <div
              className={`mb-4 flex size-14 items-center justify-center rounded-full ${
                isParsing
                  ? 'bg-surface-tab text-muted'
                  : 'bg-accent-subtle text-accent'
              }`}
            >
              {isParsing ? (
                <svg
                  className="size-7 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
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
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-7"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" x2="12" y1="3" y2="15" />
                </svg>
              )}
            </div>

            <p className="text-sm font-medium text-body">
              {isParsing
                ? t('pages.cv.upload.parsing')
                : t('pages.cv.upload.dropzone')}
            </p>
            <p className="mt-1 text-xs text-muted">
              {t('pages.cv.upload.hint')}
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-danger-border bg-danger-subtle px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {activeRecord && (
        <CvProfilePreview
          profile={activeRecord.profile}
          fileName={activeRecord.fileName}
        />
      )}
    </div>
  )
}
