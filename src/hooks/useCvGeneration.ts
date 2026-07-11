import { useCallback } from 'react'
import { useTranslation } from './useTranslation'
import {
  analyzeJobDescription as analyzeJobDescriptionApi,
  tailorCv as tailorCvApi,
} from '../services/cvGenerateService'
import { useActiveCvRecord } from '../stores/cvStore'
import { useGenerateStore } from '../stores/generateStore'
import { useJobDescriptionStore } from '../stores/jobDescriptionStore'

const MIN_JOB_DESCRIPTION_LENGTH = 50

export function useCvGeneration() {
  const { t } = useTranslation()
  const activeRecord = useActiveCvRecord()

  const text = useJobDescriptionStore((state) => state.text)
  const analysis = useJobDescriptionStore((state) => state.analysis)
  const jdStatus = useJobDescriptionStore((state) => state.status)
  const jdError = useJobDescriptionStore((state) => state.error)

  const setJdStatus = useJobDescriptionStore((state) => state.setStatus)
  const setAnalysis = useJobDescriptionStore((state) => state.setAnalysis)
  const setJdError = useJobDescriptionStore((state) => state.setError)

  const generateStatus = useGenerateStore((state) => state.status)
  const tailoredResult = useGenerateStore((state) => state.tailoredResult)
  const generateError = useGenerateStore((state) => state.error)

  const setGenerateStatus = useGenerateStore((state) => state.setStatus)
  const setTailoredResult = useGenerateStore((state) => state.setTailoredResult)
  const setGenerateError = useGenerateStore((state) => state.setError)

  const hasText = text.trim().length >= MIN_JOB_DESCRIPTION_LENGTH
  const canAnalyze = hasText && jdStatus !== 'analyzing'
  const canGenerate =
    !!activeRecord &&
    !!analysis &&
    hasText &&
    generateStatus !== 'generating' &&
    jdStatus !== 'analyzing'

  const analyzeJobDescription = useCallback(async () => {
    if (!hasText) {
      setJdError(t('pages.cv.generate.errors.jobDescriptionTooShort'))
      return
    }

    setJdStatus('analyzing')
    setJdError(null)
    setGenerateError(null)

    try {
      const nextAnalysis = await analyzeJobDescriptionApi(text)
      setAnalysis(nextAnalysis)
    } catch (error) {
      setJdError(
        error instanceof Error
          ? error.message
          : t('pages.cv.generate.errors.analyzeFailed'),
      )
    }
  }, [
    hasText,
    setAnalysis,
    setJdError,
    setJdStatus,
    setGenerateError,
    t,
    text,
  ])

  const generateTailoredCv = useCallback(async () => {
    if (!activeRecord) {
      setGenerateError(t('pages.cv.generate.noActiveCv'))
      return
    }

    if (!analysis) {
      setGenerateError(t('pages.cv.generate.errors.analysisRequired'))
      return
    }

    if (!hasText) {
      setGenerateError(t('pages.cv.generate.errors.jobDescriptionTooShort'))
      return
    }

    setGenerateStatus('generating')
    setGenerateError(null)

    try {
      const result = await tailorCvApi(
        activeRecord.profile,
        text,
        analysis,
      )
      setTailoredResult(result)
    } catch (error) {
      setGenerateError(
        error instanceof Error
          ? error.message
          : t('pages.cv.generate.errors.generateFailed'),
      )
    }
  }, [
    activeRecord,
    analysis,
    hasText,
    setGenerateError,
    setGenerateStatus,
    setTailoredResult,
    t,
    text,
  ])

  const isAnalyzing = jdStatus === 'analyzing'
  const isGenerating = generateStatus === 'generating'

  return {
    activeRecord,
    text,
    analysis,
    tailoredResult,
    jdError,
    generateError,
    canAnalyze,
    canGenerate,
    isAnalyzing,
    isGenerating,
    analyzeJobDescription,
    generateTailoredCv,
  }
}
