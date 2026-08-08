import { useTranslation } from '../../hooks/useTranslation'
import type { SavedCvRecord } from '../../types/cvProfile'
import CvDocumentIcon from './CvDocumentIcon'

type CvRecordCardProps = {
  record: SavedCvRecord
  isActive?: boolean
  onSelect?: () => void
  onDelete?: () => void
  readOnly?: boolean
  badgeLabel?: string
  compact?: boolean
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

export default function CvRecordCard({
  record,
  isActive = false,
  onSelect,
  onDelete,
  readOnly = false,
  badgeLabel,
  compact = false,
}: CvRecordCardProps) {
  const { t, language } = useTranslation()
  const locale = language === 'es' ? 'es-ES' : 'en-US'
  const resolvedBadge = badgeLabel ?? t('pages.cv.library.active')

  if (compact) {
    return (
      <div className="flex min-w-0 items-center gap-2.5 rounded-control border border-border bg-surface-raised px-3 py-2">
        <span className="flex size-7 shrink-0 items-center justify-center bg-accent-subtle text-accent">
          <CvDocumentIcon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-heading">
            {record.profile.personalInfo.name || record.fileName}
          </p>
          <p className="truncate font-mono text-[10px] text-muted">
            {record.fileName}
          </p>
        </div>
        {isActive && (
          <span className="shrink-0 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-accent">
            {resolvedBadge}
          </span>
        )}
      </div>
    )
  }

  const textBlock = (
    <div className={`min-w-0 flex-1 ${isActive ? 'pr-12' : ''}`}>
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
      <p className={`mt-1 text-xs ${isActive ? 'text-muted' : 'text-muted/80'}`}>
        {formatDate(record.createdAt, locale)}
      </p>
    </div>
  )

  return (
    <div
      className={`relative overflow-hidden transition-colors ${
        isActive ? 'bg-surface-raised' : 'bg-surface-muted/40 hover:bg-surface-muted/70'
      }`}
    >
      {isActive && (
        <span className="absolute top-0 right-0 bg-accent px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-accent-foreground">
          {resolvedBadge}
        </span>
      )}

      <div className="flex items-center gap-3 p-4">
        <span
          className={`flex size-10 shrink-0 items-center justify-center ${
            isActive ? 'bg-accent-subtle text-accent' : 'bg-surface-tab text-muted'
          }`}
        >
          <CvDocumentIcon className="size-5" />
        </span>

        {readOnly ? (
          textBlock
        ) : (
          <>
            <button
              type="button"
              onClick={onSelect}
              className="min-w-0 flex-1 text-left"
            >
              {textBlock}
            </button>

            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                aria-label={t('pages.cv.library.delete')}
                className="shrink-0 self-center p-2 text-muted transition-colors hover:bg-danger-subtle hover:text-danger"
              >
                <DeleteIcon />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
