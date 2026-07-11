import { useCallback } from 'react'
import { useJobDescriptionStore } from '../stores/jobDescriptionStore'

export const JOB_DESCRIPTION_MAX_LENGTH = 50_000

export function useJobDescription() {
  const text = useJobDescriptionStore((state) => state.text)
  const status = useJobDescriptionStore((state) => state.status)
  const analysis = useJobDescriptionStore((state) => state.analysis)
  const error = useJobDescriptionStore((state) => state.error)

  const setText = useJobDescriptionStore((state) => state.setText)
  const clearText = useJobDescriptionStore((state) => state.clearText)
  const setStatus = useJobDescriptionStore((state) => state.setStatus)
  const setAnalysis = useJobDescriptionStore((state) => state.setAnalysis)
  const setError = useJobDescriptionStore((state) => state.setError)
  const resetAnalysis = useJobDescriptionStore((state) => state.resetAnalysis)

  const handleTextChange = useCallback(
    (value: string) => {
      setText(value.slice(0, JOB_DESCRIPTION_MAX_LENGTH))
    },
    [setText],
  )

  const hasText = text.trim().length > 0
  const characterCount = text.length

  return {
    text,
    status,
    analysis,
    error,
    hasText,
    characterCount,
    maxLength: JOB_DESCRIPTION_MAX_LENGTH,
    handleTextChange,
    clearText,
    setStatus,
    setAnalysis,
    setError,
    resetAnalysis,
  }
}
