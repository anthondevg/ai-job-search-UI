import { useTranslation } from '../../hooks/useTranslation'
import type { SavedCvRecord } from '../../types/cvProfile'

type CvLibraryProps = {
  records: SavedCvRecord[]
  activeId: string | null
  isLoading: boolean
  onSelect: (id: string) => void
  onDelete: (id: string) => void
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
}: CvLibraryProps) {
  const { t, language } = useTranslation()
  const locale = language === 'es' ? 'es-ES' : 'en-US'

  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-display text-base font-semibold text-heading">
          {t('pages.cv.library.title')}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {t('pages.cv.library.description')}
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-card border border-border bg-surface-muted px-4 py-6 text-sm text-muted">
          {t('pages.cv.library.loading')}
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-card border border-dashed border-border bg-surface-muted/50 px-4 py-6 text-sm text-muted">
          {t('pages.cv.library.empty')}
        </div>
      ) : (
        <ul className="space-y-2">
          {records.map((record) => {
            const isActive = record.id === activeId

            return (
              <li
                key={record.id}
                className={`rounded-card border p-4 transition-colors ${
                  isActive
                    ? 'border-2 border-accent bg-surface-raised shadow-sm'
                    : 'border-border bg-surface-raised hover:border-border-muted'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onSelect(record.id)}
                    className="min-w-0 flex-1 text-left"
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

                  <div className="flex shrink-0 items-center gap-2">
                    {isActive && (
                      <span className="rounded-tag bg-accent px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-accent-foreground">
                        {t('pages.cv.library.active')}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => onDelete(record.id)}
                      aria-label={t('pages.cv.library.delete')}
                      className="rounded-control p-2 text-muted transition-colors hover:bg-danger-subtle hover:text-danger"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-4"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
