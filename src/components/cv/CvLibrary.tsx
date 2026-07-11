import { useTranslation } from '../../hooks/useTranslation'
import type { SavedCvRecord } from '../../types/cvProfile'

type CvLibraryProps = {
  records: SavedCvRecord[]
  activeId: string | null
  isLoading: boolean
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  showHeader?: boolean
}

export function CvDocumentIcon({ className = 'size-5' }: { className?: string }) {
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
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}

function DeleteIcon({ className = 'size-4' }: { className?: string }) {
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
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  )
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function CvLibrary({
  records,
  activeId,
  isLoading,
  onSelect,
  onDelete,
  showHeader = true,
}: CvLibraryProps) {
  const { t, language } = useTranslation()
  const locale = language === 'es' ? 'es-ES' : 'en-US'

  return (
    <section className="space-y-3">
      {showHeader && (
        <div>
          <h2 className="font-display text-base font-semibold text-heading">
            {t('pages.cv.library.title')}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {t('pages.cv.library.description')}
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="bg-surface-muted px-4 py-6 text-sm text-muted">
          {t('pages.cv.library.loading')}
        </div>
      ) : records.length === 0 ? (
        <div className="bg-surface-muted/50 px-4 py-6 text-sm text-muted">
          {t('pages.cv.library.empty')}
        </div>
      ) : (
        <ul className="space-y-2">
          {records.map((record) => {
            const isActive = record.id === activeId

            return (
              <li
                key={record.id}
                className={`relative overflow-hidden transition-colors ${
                  isActive
                    ? 'bg-surface-raised'
                    : 'bg-surface-muted/40 hover:bg-surface-muted/70'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 right-0 bg-accent px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-accent-foreground">
                    {t('pages.cv.library.active')}
                  </span>
                )}

                <div className="flex items-center gap-3 p-4">
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center ${
                      isActive
                        ? 'bg-accent-subtle text-accent'
                        : 'bg-surface-tab text-muted'
                    }`}
                  >
                    <CvDocumentIcon className="size-5" />
                  </span>

                  <button
                    type="button"
                    onClick={() => onSelect(record.id)}
                    className={`min-w-0 flex-1 text-left ${isActive ? 'pr-12' : ''}`}
                  >
                    <p className="truncate text-sm font-semibold text-heading">
                      {record.profile.personalInfo.name || record.fileName}
                    </p>
                    <p
                      className={`mt-0.5 truncate font-mono text-xs ${
                        isActive ? 'text-body' : 'text-muted'
                      }`}
                    >
                      {record.fileName}
                    </p>
                    <p
                      className={`mt-1 text-xs ${
                        isActive ? 'text-muted' : 'text-muted/80'
                      }`}
                    >
                      {formatDate(record.createdAt, locale)}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(record.id)}
                    aria-label={t('pages.cv.library.delete')}
                    className="shrink-0 self-center p-2 text-muted transition-colors hover:bg-danger-subtle hover:text-danger"
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
