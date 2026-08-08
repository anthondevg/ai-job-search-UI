import { useCallback, useEffect, useRef } from 'react'
import { useAuth } from '../auth/useAuth'
import { useTranslation } from './useTranslation'
import type { TranslationKey } from '../i18n/types'
import { useActiveCvRecord, useCvStore } from '../stores/cvStore'
import {
  validatePdfFile,
  type PdfValidationError,
} from '../utils/validatePdfFile'

const uploadErrorKeys: Record<PdfValidationError, TranslationKey> = {
  invalidType: 'pages.cv.upload.errors.invalidType',
  tooLarge: 'pages.cv.upload.errors.tooLarge',
  empty: 'pages.cv.upload.errors.empty',
}

export function useCvProfiles() {
  const { t } = useTranslation()
  const { session } = useAuth()
  const userId = session?.user.id
  const inputRef = useRef<HTMLInputElement>(null)

  const records = useCvStore((state) => state.records)
  const activeId = useCvStore((state) => state.activeId)
  const isLoading = useCvStore((state) => state.isLoading)
  const status = useCvStore((state) => state.status)
  const error = useCvStore((state) => state.error)
  const activeRecord = useActiveCvRecord()

  const loadRecords = useCvStore((state) => state.loadRecords)
  const selectRecord = useCvStore((state) => state.selectRecord)
  const uploadPdf = useCvStore((state) => state.uploadPdf)
  const removeRecord = useCvStore((state) => state.removeRecord)
  const setDragging = useCvStore((state) => state.setDragging)
  const setError = useCvStore((state) => state.setError)
  const setStatus = useCvStore((state) => state.setStatus)

  useEffect(() => {
    if (userId) void loadRecords(userId)
  }, [loadRecords, userId])

  const reloadRecords = useCallback(() => {
    if (!userId) return Promise.resolve()
    return loadRecords(userId)
  }, [loadRecords, userId])

  const handleFile = useCallback(
    async (file: File) => {
      const validationError = validatePdfFile(file)

      if (validationError) {
        setStatus('error')
        setError(t(uploadErrorKeys[validationError]))
        return
      }

      try {
        await uploadPdf(file)
      } catch (parseError) {
        setStatus('error')
        setError(
          parseError instanceof Error
            ? parseError.message
            : t('pages.cv.upload.errors.parseFailed'),
        )
      }
    },
    [setError, setStatus, t, uploadPdf],
  )

  const handleRemoveRecord = useCallback(
    async (id: string) => {
      try {
        await removeRecord(id)
      } catch (deleteError) {
        setError(
          deleteError instanceof Error
            ? deleteError.message
            : t('pages.cv.library.errors.deleteFailed'),
        )
      }
    },
    [removeRecord, setError, t],
  )

  const openFilePicker = useCallback(() => {
    inputRef.current?.click()
  }, [])

  return {
    inputRef,
    records,
    activeRecord,
    activeId,
    isLoading,
    status,
    error,
    handleFile,
    openFilePicker,
    setDragging,
    selectRecord,
    removeRecord: handleRemoveRecord,
    reloadRecords,
  }
}
