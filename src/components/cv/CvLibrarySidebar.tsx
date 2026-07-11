import { useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import type { SavedCvRecord } from '../../types/cvProfile'
import CvLibrary, { CvDocumentIcon } from './CvLibrary'

const COLLAPSED_STORAGE_KEY = 'cv-library-sidebar-collapsed'

type CvLibrarySidebarProps = {
  records: SavedCvRecord[]
  activeId: string | null
  isLoading: boolean
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  uploadSlot: ReactNode
  compactUploadSlot: ReactNode
  error: string | null
}

function readInitialCollapsed(hasRecords: boolean): boolean {
  const stored = localStorage.getItem(COLLAPSED_STORAGE_KEY)
  if (stored !== null) return stored === 'true'
  return hasRecords
}

function getRecordLabel(record: SavedCvRecord): string {
  return record.profile.personalInfo.name || record.fileName
}

function SidebarToggleIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`size-5 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
      aria-hidden
    >
      <rect width="18" height="18" x="3" y="3" rx="0" />
      <path d="M9 3v18" />
      <path d="m14 9 3 3-3 3" />
    </svg>
  )
}

export default function CvLibrarySidebar({
  records,
  activeId,
  isLoading,
  onSelect,
  onDelete,
  uploadSlot,
  compactUploadSlot,
  error,
}: CvLibrarySidebarProps) {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(() => readInitialCollapsed(records.length > 0))

  useEffect(() => {
    localStorage.setItem(COLLAPSED_STORAGE_KEY, String(collapsed))
  }, [collapsed])

  useEffect(() => {
    if (error) setCollapsed(false)
  }, [error])

  const toggleCollapsed = () => setCollapsed((prev) => !prev)

  return (
    <aside
      className={`shrink-0 transition-[width] duration-300 ${
        collapsed ? 'w-14' : 'w-full max-w-full sm:w-96 lg:w-[28rem]'
      }`}
    >
      <div className="flex flex-col overflow-hidden bg-surface-muted/30">
        <div
          className={`flex shrink-0 items-center ${
            collapsed ? 'justify-center px-2 py-2' : 'justify-between gap-2 px-3 py-2.5'
          }`}
        >
          {!collapsed && (
            <div className="min-w-0">
              <h2 className="truncate font-display text-sm font-semibold text-heading">
                {t('pages.cv.library.title')}
              </h2>
            </div>
          )}

          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={
              collapsed ? t('sidebar.expand') : t('sidebar.collapse')
            }
            title={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
            className="flex size-9 shrink-0 items-center justify-center rounded-control text-muted transition-colors hover:bg-surface-raised hover:text-heading"
          >
            <SidebarToggleIcon collapsed={collapsed} />
          </button>
        </div>

        {collapsed ? (
          <div className="flex flex-col items-center gap-2 p-2">
            {isLoading ? (
              <span
                className="size-10 animate-pulse rounded-control bg-surface-tab"
                aria-hidden
              />
            ) : (
              records.map((record) => {
                const isActive = record.id === activeId
                const label = getRecordLabel(record)

                return (
                  <button
                    key={record.id}
                    type="button"
                    onClick={() => onSelect(record.id)}
                    title={label}
                    aria-label={label}
                    aria-current={isActive ? 'true' : undefined}
                    className={`flex size-10 items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-surface-raised text-muted hover:bg-surface-tab hover:text-body'
                    }`}
                  >
                    <CvDocumentIcon className="size-5" />
                  </button>
                )
              })
            )}

            <div className="mt-1 pt-2">
              {compactUploadSlot}
            </div>
          </div>
        ) : (
          <div className="max-h-[calc(100vh-12rem)] space-y-4 overflow-y-auto p-3">
            <CvLibrary
              records={records}
              activeId={activeId}
              isLoading={isLoading}
              onSelect={onSelect}
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
        )}
      </div>
    </aside>
  )
}
