import { useCallback, useState, type ChangeEvent, type DragEvent } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import { useCvProfiles } from '../../hooks/useCvProfiles'
import CvImportUpload from './CvImportUpload'
import CvLibraryDrawer from './CvLibraryDrawer'
import CvSourceProfileEditor from './CvSourceProfileEditor'

function LibraryIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
      aria-hidden
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </svg>
  )
}

export default function CvImportTab() {
  const { t } = useTranslation()
  const [isLibraryOpen, setIsLibraryOpen] = useState(false)
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
  const closeLibrary = useCallback(() => setIsLibraryOpen(false), [])

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

  const uploadProps = {
    inputRef,
    isParsing,
    isDragging,
    hasRecords,
    error,
    onOpenFilePicker: openFilePicker,
    onFileChange: onInputChange,
    onDragOver,
    onDragLeave,
    onDrop,
  }

  return (
    <div className="min-w-0">
      {hasRecords && (
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={() => setIsLibraryOpen(true)}
            className="inline-flex items-center gap-2 rounded-control border border-border bg-surface-raised px-3 py-2 text-xs font-medium text-body transition-colors hover:border-accent/50 hover:text-heading"
          >
            <LibraryIcon />
            {t('pages.cv.library.manage')}
            <span className="rounded-full bg-accent-subtle px-1.5 py-0.5 font-mono text-[10px] text-accent">
              {records.length}
            </span>
          </button>
        </div>
      )}

      <div className="min-w-0">
        {activeRecord ? (
          <CvSourceProfileEditor
            recordId={activeRecord.id}
            profile={activeRecord.profile}
            fileName={activeRecord.fileName}
          />
        ) : isLoading ? (
          <div className="match-frame rounded-card border-border bg-surface-muted/30 px-4 py-8 text-sm text-muted">
            {t('pages.cv.library.loading')}
          </div>
        ) : (
          <div className="space-y-3">
            <CvImportUpload {...uploadProps} />
            {error && (
              <div className="bg-danger-subtle px-4 py-3 text-sm text-danger">
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      <CvLibraryDrawer
        open={isLibraryOpen}
        records={records}
        activeId={activeId}
        isLoading={isLoading}
        onClose={closeLibrary}
        onSelect={selectRecord}
        onDelete={(id) => void removeRecord(id)}
        uploadSlot={<CvImportUpload {...uploadProps} flat />}
        error={error}
      />
    </div>
  )
}
