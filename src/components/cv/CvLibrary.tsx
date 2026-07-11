import { useTranslation } from '../../hooks/useTranslation'
import type { SavedCvRecord } from '../../types/cvProfile'
import CvDocumentIcon from './CvDocumentIcon'
import CvRecordCard from './CvRecordCard'

type CvLibraryProps = {
  records: SavedCvRecord[]
  activeId: string | null
  isLoading: boolean
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  showHeader?: boolean
}

export { CvDocumentIcon }

export default function CvLibrary({
  records,
  activeId,
  isLoading,
  onSelect,
  onDelete,
  showHeader = true,
}: CvLibraryProps) {
  const { t } = useTranslation()

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
              <li key={record.id}>
                <CvRecordCard
                  record={record}
                  isActive={isActive}
                  onSelect={() => onSelect(record.id)}
                  onDelete={() => onDelete(record.id)}
                />
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
