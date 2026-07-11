export type GenerateStep = 1 | 2 | 3

export const GENERATE_STEP_COUNT = 3

type GenerateStepInput = {
  hasAnalysis: boolean
  hasTailoredResult: boolean
}

export function getGenerateStep({
  hasAnalysis,
  hasTailoredResult,
}: GenerateStepInput): GenerateStep {
  if (hasTailoredResult) return 3
  if (hasAnalysis) return 2
  return 1
}

export type GenerateStepId = 'offer' | 'analysis' | 'tailored'

export const GENERATE_STEP_IDS: GenerateStepId[] = ['offer', 'analysis', 'tailored']

export function getGenerateStepId(step: GenerateStep): GenerateStepId {
  return GENERATE_STEP_IDS[step - 1]
}

export function getGenerateStepStatus(
  stepNumber: GenerateStep,
  currentStep: GenerateStep,
): 'completed' | 'current' | 'upcoming' {
  if (stepNumber < currentStep) return 'completed'
  if (stepNumber === currentStep) return 'current'
  return 'upcoming'
}
