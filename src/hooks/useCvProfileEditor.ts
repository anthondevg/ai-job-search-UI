import { useCallback, useEffect, useRef, useState } from 'react'
import { useCvStore } from '../stores/cvStore'
import type { CVProfile } from '../types/cvProfile'

const SAVE_DEBOUNCE_MS = 600

export function useCvProfileEditor(recordId: string, initialProfile: CVProfile) {
  const [draft, setDraft] = useState(initialProfile)
  const updateProfile = useCvStore((state) => state.updateProfile)
  const profileSaveStatus = useCvStore((state) => state.profileSaveStatus)
  const profileSaveError = useCvStore((state) => state.profileSaveError)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedRef = useRef(JSON.stringify(initialProfile))

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setDraft(initialProfile)
    lastSavedRef.current = JSON.stringify(initialProfile)
    // Only reset local draft when switching CV records, not on each server sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initialProfile read on recordId change
  }, [recordId])

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    [],
  )

  const scheduleSave = useCallback(
    (next: CVProfile) => {
      if (timerRef.current) clearTimeout(timerRef.current)

      timerRef.current = setTimeout(() => {
        const serialized = JSON.stringify(next)
        if (serialized === lastSavedRef.current) return

        void updateProfile(recordId, next)
          .then(() => {
            lastSavedRef.current = serialized
          })
          .catch(() => {
            // Error state is handled in the store.
          })
      }, SAVE_DEBOUNCE_MS)
    },
    [recordId, updateProfile],
  )

  const updateDraft = useCallback(
    (updater: (prev: CVProfile) => CVProfile) => {
      setDraft((prev) => {
        const next = updater(prev)
        scheduleSave(next)
        return next
      })
    },
    [scheduleSave],
  )

  return { draft, updateDraft, profileSaveStatus, profileSaveError }
}
