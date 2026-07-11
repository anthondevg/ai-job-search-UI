import { type ChangeEvent, type DragEvent } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import { useCvProfiles } from '../../hooks/useCvProfiles'
import CvImportUpload from './CvImportUpload'
import CvLibrarySidebar from './CvLibrarySidebar'
import CvSourceProfileEditor from './CvSourceProfileEditor'

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
  const hasRecords = records.length > 0

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
    <div className="flex items-start gap-4">
      <CvLibrarySidebar
        records={records}
        activeId={activeId}
        isLoading={isLoading}
        onSelect={selectRecord}
        onDelete={(id) => void removeRecord(id)}
        uploadSlot={<CvImportUpload {...uploadProps} flat />}
        compactUploadSlot={<CvImportUpload {...uploadProps} compact />}
        error={error}
      />

      <div className="min-w-0 flex-1">
        {activeRecord ? (
          <CvSourceProfileEditor
            recordId={activeRecord.id}
            profile={activeRecord.profile}
            fileName={activeRecord.fileName}
          />
        ) : (
          <div className="match-frame rounded-card border-dashed border-border bg-surface-muted/30 px-4 py-6 text-sm text-muted lg:min-h-48">
            {hasRecords
              ? t('pages.cv.library.description')
              : t('pages.cv.upload.emptyLibraryHint')}
          </div>
        )}
      </div>
    </div>
  )
}
