import { useTranslation } from '../../hooks/useTranslation'
import { useCvGeneration } from '../../hooks/useCvGeneration'
import type { CvOutputLanguage } from '../../types/cvOutputLanguage'

const options: CvOutputLanguage[] = ['en', 'es']

export default function CvOutputLanguageSelect() {
  const { t } = useTranslation()
  const { outputLanguage, setOutputLanguage, isGenerating } = useCvGeneration()

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <label
          htmlFor="cv-output-language"
          className="text-sm font-medium text-heading"
        >
          {t('pages.cv.generate.outputLanguage.label')}
        </label>
        <p className="mt-0.5 text-xs text-muted">
          {t('pages.cv.generate.outputLanguage.hint')}
        </p>
      </div>

      <select
        id="cv-output-language"
        value={outputLanguage}
        disabled={isGenerating}
        onChange={(event) =>
          setOutputLanguage(event.target.value as CvOutputLanguage)
        }
        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-body focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {options.map((language) => (
          <option key={language} value={language}>
            {t(`pages.cv.generate.outputLanguage.${language}`)}
          </option>
        ))}
      </select>
    </div>
  )
}
