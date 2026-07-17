import { useCallback, useState } from 'react'
import { useJobDescriptionStore } from '../stores/jobDescriptionStore'
import { readClipboardText } from '../utils/readClipboardText'

export const JOB_DESCRIPTION_MAX_LENGTH = 50_000

/** Ignore tiny clipboard snippets (passwords, single words, etc.). */
const MIN_CLIPBOARD_PASTE_LENGTH = 50

export type PasteFromClipboardResult =
  | 'pasted'
  | 'empty'
  | 'too_short'
  | 'unavailable'

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

  const [isPasting, setIsPasting] = useState(false)

  const handleTextChange = useCallback(
    (value: string) => {
      setText(value.slice(0, JOB_DESCRIPTION_MAX_LENGTH))
    },
    [setText],
  )

  const pasteFromClipboard = useCallback(
    async (options?: { onlyIfEmpty?: boolean }): Promise<PasteFromClipboardResult> => {
      if (
        options?.onlyIfEmpty &&
        useJobDescriptionStore.getState().text.trim().length > 0
      ) {
        return 'empty'
      }

      setIsPasting(true)
      try {
        const clipboard = await readClipboardText()
        if (!clipboard) return 'unavailable'
        if (clipboard.length < MIN_CLIPBOARD_PASTE_LENGTH) return 'too_short'

        setText(clipboard.slice(0, JOB_DESCRIPTION_MAX_LENGTH))
        return 'pasted'
      } finally {
        setIsPasting(false)
      }
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
    isPasting,
    handleTextChange,
    clearText,
    pasteFromClipboard,
    setStatus,
    setAnalysis,
    setError,
    resetAnalysis,
  }
}
