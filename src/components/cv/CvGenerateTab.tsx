import { useTranslation } from '../../hooks/useTranslation'
import { useCvGeneration } from '../../hooks/useCvGeneration'
import { useActiveCvRecord } from '../../stores/cvStore'
import CvGenerateActions from './CvGenerateActions'
import JobDescriptionAnalysisPanel from './JobDescriptionAnalysisPanel'
import JobDescriptionInput from './JobDescriptionInput'
import TailoredCvPreview from './TailoredCvPreview'

export default function CvGenerateTab() {
  const { t } = useTranslation()
  const activeRecord = useActiveCvRecord()
  const { analysis, tailoredResult, jdError, generateError } = useCvGeneration()

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
      <CvGenerateActions />

      {jdError && (
        <div className="rounded-lg border border-danger-border bg-danger-subtle px-4 py-3 text-sm text-danger">
          {jdError}
        </div>
      )}

      {generateError && (
        <div className="rounded-lg border border-danger-border bg-danger-subtle px-4 py-3 text-sm text-danger">
          {generateError}
        </div>
      )}

      {analysis && <JobDescriptionAnalysisPanel analysis={analysis} />}

      {tailoredResult && (
        <TailoredCvPreview
          profile={tailoredResult.profile}
          meta={tailoredResult.meta}
        />
      )}
    </div>
  )
}
