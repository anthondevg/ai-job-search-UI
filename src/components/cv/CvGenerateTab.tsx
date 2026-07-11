import { useTranslation } from '../../hooks/useTranslation'
import { useActiveCvRecord } from '../../stores/cvStore'
import JobDescriptionInput from './JobDescriptionInput'

export default function CvGenerateTab() {
  const { t } = useTranslation()
  const activeRecord = useActiveCvRecord()

  return (
    <div className="space-y-6">
      {activeRecord ? (
        <div className="rounded-lg border border-border bg-surface-muted px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            {t('pages.cv.generate.activeCv')}
          </p>
          <p className="mt-1 text-sm font-medium text-heading">
            {activeRecord.profile.personalInfo.name || activeRecord.fileName}
          </p>
          <p className="text-xs text-muted">{activeRecord.fileName}</p>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-surface-muted/40 px-4 py-3 text-sm text-muted">
          {t('pages.cv.generate.noActiveCv')}
        </div>
      )}

      <JobDescriptionInput />
    </div>
  )
}
