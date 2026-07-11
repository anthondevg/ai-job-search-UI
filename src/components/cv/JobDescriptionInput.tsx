import { useTranslation } from '../../hooks/useTranslation'
import { useJobDescription } from '../../hooks/useJobDescription'

export default function JobDescriptionInput() {
  const { t } = useTranslation()
  const {
    text,
    hasText,
    characterCount,
    maxLength,
    handleTextChange,
    clearText,
  } = useJobDescription()

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-heading">
            {t('pages.cv.generate.jobDescription.title')}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {t('pages.cv.generate.jobDescription.description')}
          </p>
        </div>

        {hasText && (
          <button
            type="button"
            onClick={clearText}
            className="shrink-0 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-border-muted hover:text-body"
          >
            {t('pages.cv.generate.jobDescription.clear')}
          </button>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="job-description" className="sr-only">
          {t('pages.cv.generate.jobDescription.label')}
        </label>
        <textarea
          id="job-description"
          name="job-description"
          value={text}
          onChange={(event) => handleTextChange(event.target.value)}
          placeholder={t('pages.cv.generate.jobDescription.placeholder')}
          rows={14}
          maxLength={maxLength}
          className="w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-body placeholder:text-muted/70 focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
        <p className="text-xs text-muted">
          {t('pages.cv.generate.jobDescription.hint')}
        </p>
        <p className="text-right text-xs text-muted">
          {t('pages.cv.generate.jobDescription.characterCountLabel')}:{' '}
          {characterCount.toLocaleString()} / {maxLength.toLocaleString()}
        </p>
      </div>
    </section>
  )
}
