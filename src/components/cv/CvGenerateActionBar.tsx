import { useTranslation } from '../../hooks/useTranslation'
import { useCvGeneration } from '../../hooks/useCvGeneration'
import type { CvOutputLanguage } from '../../types/cvOutputLanguage'
import { GENERATE_STEP_COUNT, type GenerateStep } from '../../utils/getGenerateStep'
import ActionSpinner from './generate/ActionSpinner'
import { actionButtonClassName } from './generate/actionButtonStyles'

const languageOptions: CvOutputLanguage[] = ['en', 'es']

type CvGenerateActionBarProps = {
  currentStep: GenerateStep
}

export default function CvGenerateActionBar({ currentStep }: CvGenerateActionBarProps) {
  const { t } = useTranslation()
  const {
    canAnalyze,
    canGenerate,
    canGenerateCoverLetter,
    isAnalyzing,
    isGenerating,
    isGeneratingCoverLetter,
    isBusy,
    hasText,
    analysis,
    activeRecord,
    outputLanguage,
    setOutputLanguage,
    analyzeJobDescription,
    generateTailoredCv,
    generateCoverLetter,
    generateBlockedReason,
  } = useCvGeneration()

  const analyzeUnavailable = !canAnalyze && !isAnalyzing
  const generateUnavailable = !canGenerate && !isGenerating
  const coverLetterUnavailable = !canGenerateCoverLetter && !isGeneratingCoverLetter
  const showGenerateSection = !!analysis

  const statusMessage = isAnalyzing
    ? t('pages.cv.generate.actions.analyzingHint')
    : isGenerating
      ? t('pages.cv.generate.actions.generatingHint')
      : isGeneratingCoverLetter
        ? t('pages.cv.generate.actions.generatingCoverLetterHint')
        : null

  const blockedHint =
    generateBlockedReason && !isBusy
      ? t(`pages.cv.generate.hints.${generateBlockedReason}`)
      : null

  return (
    <div className="sticky bottom-0 z-10 -mx-4 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="font-mono text-xs text-muted">
            {t('pages.cv.generate.steps.progress')
              .replace('{current}', String(currentStep))
              .replace('{total}', String(GENERATE_STEP_COUNT))}
          </p>

          {statusMessage ? (
            <p className="flex items-center gap-2 text-sm text-heading" role="status" aria-live="polite">
              {(isAnalyzing || isGenerating || isGeneratingCoverLetter) && (
                <ActionSpinner />
              )}
              {statusMessage}
            </p>
          ) : (
            <p className="text-sm text-muted">
              {currentStep === 1
                ? t('pages.cv.generate.steps.statusOffer')
                : currentStep === 2
                  ? t('pages.cv.generate.steps.statusAnalysis')
                  : t('pages.cv.generate.steps.statusTailored')}
            </p>
          )}

          {blockedHint && showGenerateSection && (
            <p className="text-xs text-muted">{blockedHint}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={() => void analyzeJobDescription()}
            disabled={analyzeUnavailable}
            aria-busy={isAnalyzing}
            aria-disabled={analyzeUnavailable || isAnalyzing}
            className={actionButtonClassName({
              loading: isAnalyzing,
              unavailable: analyzeUnavailable,
              variant: 'secondary',
            })}
          >
            {isAnalyzing && <ActionSpinner />}
            {isAnalyzing
              ? t('pages.cv.generate.actions.analyzing')
              : t('pages.cv.generate.actions.analyze')}
          </button>

          {showGenerateSection && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label htmlFor="cv-output-language-bar" className="sr-only">
                {t('pages.cv.generate.outputLanguage.label')}
              </label>
              <select
                id="cv-output-language-bar"
                value={outputLanguage}
                disabled={isBusy}
                onChange={(event) =>
                  setOutputLanguage(event.target.value as CvOutputLanguage)
                }
                className="match-input match-frame rounded-control border-border bg-surface-raised px-3 py-2 text-sm text-body disabled:cursor-not-allowed disabled:opacity-50"
              >
                {languageOptions.map((language) => (
                  <option key={language} value={language}>
                    {t(`pages.cv.generate.outputLanguage.${language}`)}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => void generateTailoredCv()}
                disabled={generateUnavailable}
                aria-busy={isGenerating}
                aria-disabled={generateUnavailable || isGenerating}
                className={actionButtonClassName({
                  loading: isGenerating,
                  unavailable: generateUnavailable,
                  variant: 'primary',
                })}
              >
                {isGenerating && <ActionSpinner />}
                {isGenerating
                  ? t('pages.cv.generate.actions.generating')
                  : t('pages.cv.generate.actions.generate')}
              </button>

              <button
                type="button"
                onClick={() => void generateCoverLetter()}
                disabled={coverLetterUnavailable}
                aria-busy={isGeneratingCoverLetter}
                aria-disabled={coverLetterUnavailable || isGeneratingCoverLetter}
                className={actionButtonClassName({
                  loading: isGeneratingCoverLetter,
                  unavailable: coverLetterUnavailable,
                  variant: 'secondary',
                })}
              >
                {isGeneratingCoverLetter && <ActionSpinner />}
                {isGeneratingCoverLetter
                  ? t('pages.cv.generate.actions.generatingCoverLetter')
                  : t('pages.cv.generate.actions.generateCoverLetter')}
              </button>
            </div>
          )}

          {!showGenerateSection && !hasText && (
            <p className="text-xs text-muted sm:max-w-xs sm:text-right">
              {t('pages.cv.generate.hints.jobDescriptionTooShort')}
            </p>
          )}

          {!showGenerateSection && hasText && !activeRecord && (
            <p className="text-xs text-muted sm:max-w-xs sm:text-right">
              {t('pages.cv.generate.hints.noActiveCv')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
