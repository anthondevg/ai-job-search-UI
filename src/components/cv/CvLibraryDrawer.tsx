import { useEffect, type ReactNode } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import type { SavedCvRecord } from '../../types/cvProfile'
import CvLibrary from './CvLibrary'

type CvLibraryDrawerProps = {
  open: boolean
  records: SavedCvRecord[]
  activeId: string | null
  isLoading: boolean
  onClose: () => void
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  uploadSlot: ReactNode
  error: string | null
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
      className="size-5"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

export default function CvLibraryDrawer({
  open,
  records,
  activeId,
  isLoading,
  onClose,
  onSelect,
  onDelete,
  uploadSlot,
  error,
}: CvLibraryDrawerProps) {
  const { t } = useTranslation()

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose, open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-black/55 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={t('pages.cv.library.close')}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cv-library-drawer-title"
        className="relative flex h-full w-full max-w-md flex-col border-l border-border bg-surface shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h2
              id="cv-library-drawer-title"
              className="font-display text-base font-semibold text-heading"
            >
              {t('pages.cv.library.title')}
            </h2>
            <p className="mt-1 text-xs text-muted">
              {t('pages.cv.library.description')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('pages.cv.library.close')}
            className="flex size-9 shrink-0 items-center justify-center rounded-control text-muted transition-colors hover:bg-surface-raised hover:text-heading"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <CvLibrary
            records={records}
            activeId={activeId}
            isLoading={isLoading}
            onSelect={(id) => {
              onSelect(id)
              onClose()
            }}
            onDelete={onDelete}
            showHeader={false}
          />

          {uploadSlot}

          {error && (
            <div className="bg-danger-subtle px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
