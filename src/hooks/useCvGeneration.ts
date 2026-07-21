import { useCallback, useMemo } from 'react'
import { useTranslation } from './useTranslation'
import {
  analyzeJobDescription as analyzeJobDescriptionApi,
  generateCoverLetter as generateCoverLetterApi,
  tailorCv as tailorCvApi,
} from '../services/cvGenerateService'
import { useActiveCvRecord } from '../stores/cvStore'
import { useGenerateStore } from '../stores/generateStore'
import { useJobDescriptionStore } from '../stores/jobDescriptionStore'
import { getGenerateStep } from '../utils/getGenerateStep'

const MIN_JOB_DESCRIPTION_LENGTH = 50

export type GenerateBlockedReason =
  | 'noActiveCv'
  | 'analysisRequired'
  | 'jobDescriptionTooShort'
  | null

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
  const coverLetterResult = useGenerateStore((state) => state.coverLetterResult)
  const coverLetterStatus = useGenerateStore((state) => state.coverLetterStatus)
  const coverLetterError = useGenerateStore((state) => state.coverLetterError)
  const generateError = useGenerateStore((state) => state.error)

  const setOutputLanguage = useGenerateStore((state) => state.setOutputLanguage)
  const setGenerateStatus = useGenerateStore((state) => state.setStatus)
  const setTailoredResult = useGenerateStore((state) => state.setTailoredResult)
  const setCoverLetterResult = useGenerateStore((state) => state.setCoverLetterResult)
  const setCoverLetterStatus = useGenerateStore((state) => state.setCoverLetterStatus)
  const setCoverLetterError = useGenerateStore((state) => state.setCoverLetterError)
  const setGenerateError = useGenerateStore((state) => state.setError)

  const hasText = text.trim().length >= MIN_JOB_DESCRIPTION_LENGTH
  const isAnalyzing = jdStatus === 'analyzing'
  const isGenerating = generateStatus === 'generating'
  const isGeneratingCoverLetter = coverLetterStatus === 'generating'
  const isBusy = isAnalyzing || isGenerating || isGeneratingCoverLetter

  const canAnalyze = hasText && !isBusy
  const canGenerate =
    !!activeRecord && !!analysis && hasText && !isBusy
  const canGenerateCoverLetter = canGenerate

  const currentStep = getGenerateStep({
    hasAnalysis: !!analysis,
    hasTailoredResult: !!tailoredResult,
  })

  const generateBlockedReason = useMemo((): GenerateBlockedReason => {
    if (isBusy || canGenerate) return null
    if (!activeRecord) return 'noActiveCv'
    if (!analysis) return 'analysisRequired'
    if (!hasText) return 'jobDescriptionTooShort'
    return null
  }, [activeRecord, analysis, canGenerate, hasText, isBusy])

  const analyzeJobDescription = useCallback(async () => {
    const currentText = useJobDescriptionStore.getState().text
    if (currentText.trim().length < MIN_JOB_DESCRIPTION_LENGTH) {
      setJdError(t('pages.cv.generate.errors.jobDescriptionTooShort'))
      return
    }

    if (useJobDescriptionStore.getState().status === 'analyzing') {
      return
    }

    const generateState = useGenerateStore.getState()
    if (
      generateState.status === 'generating' ||
      generateState.coverLetterStatus === 'generating'
    ) {
      return
    }

    setJdStatus('analyzing')
    setJdError(null)
    setGenerateError(null)
    setCoverLetterError(null)

    try {
      const result = await analyzeJobDescriptionApi(
        currentText,
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
    setAnalysis,
    setCompatibility,
    setCoverLetterError,
    setJdError,
    setJdStatus,
    setGenerateError,
    t,
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

    if (useGenerateStore.getState().status === 'generating') {
      return
    }

    if (useJobDescriptionStore.getState().status === 'analyzing') {
      return
    }

    if (useGenerateStore.getState().coverLetterStatus === 'generating') {
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

  const generateCoverLetter = useCallback(async () => {
    if (!activeRecord) {
      setCoverLetterError(t('pages.cv.generate.noActiveCv'))
      return
    }

    if (!analysis) {
      setCoverLetterError(t('pages.cv.generate.errors.analysisRequired'))
      return
    }

    if (!hasText) {
      setCoverLetterError(t('pages.cv.generate.errors.jobDescriptionTooShort'))
      return
    }

    if (useGenerateStore.getState().coverLetterStatus === 'generating') {
      return
    }

    if (useJobDescriptionStore.getState().status === 'analyzing') {
      return
    }

    if (useGenerateStore.getState().status === 'generating') {
      return
    }

    setCoverLetterStatus('generating')
    setCoverLetterError(null)

    try {
      const result = await generateCoverLetterApi(
        activeRecord.profile,
        text,
        analysis,
        outputLanguage,
      )
      setCoverLetterResult(result)
    } catch (error) {
      setCoverLetterError(
        error instanceof Error
          ? error.message
          : t('pages.cv.generate.errors.coverLetterFailed'),
      )
    }
  }, [
    activeRecord,
    analysis,
    hasText,
    outputLanguage,
    setCoverLetterError,
    setCoverLetterResult,
    setCoverLetterStatus,
    t,
    text,
  ])

  return {
    activeRecord,
    text,
    hasText,
    analysis,
    compatibility,
    tailoredResult,
    coverLetterResult,
    coverLetterError,
    jdError,
    generateError,
    canAnalyze,
    canGenerate,
    canGenerateCoverLetter,
    isAnalyzing,
    isGenerating,
    isGeneratingCoverLetter,
    isBusy,
    currentStep,
    generateBlockedReason,
    outputLanguage,
    setOutputLanguage,
    analyzeJobDescription,
    generateTailoredCv,
    generateCoverLetter,
  }
}
