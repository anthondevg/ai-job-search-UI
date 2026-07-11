import { useTranslation } from '../../hooks/useTranslation'
import {
  GENERATE_STEP_COUNT,
  GENERATE_STEP_IDS,
  type GenerateStep,
  getGenerateStepStatus,
} from '../../utils/getGenerateStep'

type CvGenerateStepperProps = {
  currentStep: GenerateStep
}

export default function CvGenerateStepper({ currentStep }: CvGenerateStepperProps) {
  const { t } = useTranslation()

  return (
    <nav aria-label={t('pages.cv.generate.steps.label')}>
      <ol className="grid grid-cols-3 gap-2 sm:gap-3">
        {GENERATE_STEP_IDS.map((stepId, index) => {
          const stepNumber = (index + 1) as GenerateStep
          const status = getGenerateStepStatus(stepNumber, currentStep)

          return (
            <li
              key={stepId}
              className={`rounded-card px-3 py-2.5 transition-colors sm:px-4 ${
                status === 'current'
                  ? 'match-rail match-rail-accent match-frame-emphasis bg-accent-subtle'
                  : status === 'completed'
                    ? 'match-rail match-rail-success bg-success-subtle/50'
                    : 'match-frame border-border bg-surface-muted/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-tag font-mono text-xs font-semibold ${
                    status === 'current'
                      ? 'bg-accent text-accent-foreground'
                      : status === 'completed'
                        ? 'bg-success text-surface'
                        : 'bg-surface-tab text-muted'
                  }`}
                  aria-hidden
                >
                  {status === 'completed' ? '✓' : stepNumber}
                </span>
                <div className="min-w-0">
                  <p
                    className={`truncate text-xs font-medium uppercase tracking-widest ${
                      status === 'current'
                        ? 'text-accent'
                        : status === 'completed'
                          ? 'text-success'
                          : 'text-muted'
                    }`}
                  >
                    {t(`pages.cv.generate.steps.${stepId}`)}
                  </p>
                  {status === 'current' && (
                    <p className="mt-0.5 truncate text-[0.65rem] text-body sm:text-xs">
                      {t('pages.cv.generate.steps.current')}
                    </p>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      <p className="mt-3 font-mono text-xs text-muted">
        {t('pages.cv.generate.steps.progress')
          .replace('{current}', String(currentStep))
          .replace('{total}', String(GENERATE_STEP_COUNT))}
      </p>
    </nav>
  )
}
