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
  const progressWidth =
    currentStep === 1 ? '0%' : currentStep === 2 ? '33.333333%' : '66.666667%'

  return (
    <nav aria-label={t('pages.cv.generate.steps.label')} className="px-1 py-3">
      <ol className="relative flex items-start">
        <span
          className="absolute left-1/6 right-1/6 top-4 h-0.5 rounded-full bg-border"
          aria-hidden
        />
        <span
          className="stepper-progress absolute left-1/6 top-4 h-0.5 rounded-full bg-success transition-[width] duration-700 ease-out motion-reduce:transition-none"
          style={{ width: progressWidth }}
          aria-hidden
        />
        {GENERATE_STEP_IDS.map((stepId, index) => {
          const stepNumber = (index + 1) as GenerateStep
          const status = getGenerateStepStatus(stepNumber, currentStep)

          return (
            <li key={stepId} className="relative flex min-w-0 flex-1 flex-col items-center text-center">
              <span
                className={`relative z-10 flex size-8 items-center justify-center rounded-full border font-mono text-xs font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-500 ${
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
                    className="stepper-check size-4 motion-reduce:animate-none"
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
                className={`mt-2 truncate px-1 text-xs font-medium ${
                  status === 'current' ? 'text-heading' : 'text-muted'
                }`}
              >
                {t(`pages.cv.generate.steps.${stepId}`)}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
