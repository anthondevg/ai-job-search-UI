export const LOCATION_PENALTIES = {
  eligible: 1.0,
  likely_eligible: 0.92,
  unclear: 0.72,
  unlikely: 0.45,
  ineligible: 0.2,
} as const

export const LOCATION_PENALTY_CAPS: Partial<Record<keyof typeof LOCATION_PENALTIES, number>> = {
  ineligible: 25,
}

export const VISA_OVERRIDE: {
  multiplier: number
  cap: number
  targetLevels: Array<keyof typeof LOCATION_PENALTIES>
} = {
  multiplier: 0.1,
  cap: 15,
  targetLevels: ['ineligible'],
}

export const VISA_UNLIKELY_OVERRIDE: {
  multiplier: number
  cap: number
} = {
  multiplier: 0.25,
  cap: 20,
}
