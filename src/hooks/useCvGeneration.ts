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
  const compatibility = useJobDescriptionStore((state) => state.compatibility)
  const jdStatus = useJobDescriptionStore((state) => state.status)
  const jdError = useJobDescriptionStore((state) => state.error)

  const setJdStatus = useJobDescriptionStore((state) => state.setStatus)
  const setAnalysis = useJobDescriptionStore((state) => state.setAnalysis)
  const setCompatibility = useJobDescriptionStore((state) => state.setCompatibility)
  const setJdError = useJobDescriptionStore((state) => state.setError)

  const generateStatus = useGenerateStore((state) => state.status)
  const outputLanguage = useGenerateStore((state) => state.outputLanguage)
  const tailoredResult = useGenerateStore((state) => state.tailoredResult)
  const generateError = useGenerateStore((state) => state.error)

  const setOutputLanguage = useGenerateStore((state) => state.setOutputLanguage)
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
      const result = await analyzeJobDescriptionApi(
        text,
        activeRecord?.profile,
      )
      setAnalysis(result.analysis)
      setCompatibility(result.compatibility)
    } catch (error) {
      setJdError(
        error instanceof Error
          ? error.message
          : t('pages.cv.generate.errors.analyzeFailed'),
      )
    }
  }, [
    activeRecord?.profile,
    hasText,
    setAnalysis,
    setCompatibility,
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
        outputLanguage,
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
    outputLanguage,
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
    compatibility,
    tailoredResult,
    jdError,
    generateError,
    canAnalyze,
    canGenerate,
    isAnalyzing,
    isGenerating,
    outputLanguage,
    setOutputLanguage,
    analyzeJobDescription,
    generateTailoredCv,
  }
}
