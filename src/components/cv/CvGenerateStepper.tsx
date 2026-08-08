import { useTranslation } from '../../hooks/useTranslation'
import {
  GENERATE_STEP_IDS,
  type GenerateStep,
  getGenerateStepStatus,
} from '../../utils/getGenerateStep'

type CvGenerateStepperProps = {
  currentStep: GenerateStep
  isProcessing?: boolean
}

export default function CvGenerateStepper({
  currentStep,
  isProcessing = false,
}: CvGenerateStepperProps) {
  const { t } = useTranslation()
  return (
    <nav aria-label={t('pages.cv.generate.steps.label')}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {GENERATE_STEP_IDS.map((stepId, index) => {
          const stepNumber = (index + 1) as GenerateStep
          const status = getGenerateStepStatus(stepNumber, currentStep)

          return (
            <li key={stepId} className="flex min-w-0 items-center gap-1.5">
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-500 ${
                  status === 'current'
                    ? `border-accent bg-accent text-accent-foreground shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-accent)_20%,transparent)] ${
                        isProcessing
                          ? 'stepper-current-processing motion-reduce:animate-none'
                          : ''
                      }`
                    : status === 'completed'
                      ? 'stepper-step-complete border-success bg-success text-surface motion-reduce:animate-none'
                      : 'border-border bg-surface-raised text-muted'
                }`}
                aria-hidden
              >
                {status === 'completed' ? (
                  <svg
                    key={`${stepId}-completed`}
                    viewBox="0 0 16 16"
                    fill="none"
                    className="stepper-check size-3.5 motion-reduce:animate-none"
                  >
                    <path
                      d="m3.25 8.25 3 3 6.5-6.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  stepNumber
                )}
              </span>

              <span
                className={`truncate text-[11px] font-medium ${
                  status === 'current' ? 'text-heading' : 'text-muted'
                }`}
              >
                {t(`pages.cv.generate.steps.${stepId}`)}
              </span>
              {index < GENERATE_STEP_IDS.length - 1 && (
                <span
                  className={`mx-1 h-px w-5 sm:w-10 ${
                    status === 'completed' ? 'bg-success' : 'bg-border'
                  }`}
                  aria-hidden
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
