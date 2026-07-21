import { create } from 'zustand'
import type { CoverLetterResult } from '../types/coverLetter'
import {
  CV_OUTPUT_LANGUAGE_STORAGE_KEY,
  getDefaultCvOutputLanguage,
  type CvOutputLanguage,
} from '../types/cvOutputLanguage'
import type { GenerateCvStatus, TailoredCvResult } from '../types/tailoredCv'

type GenerateState = {
  outputLanguage: CvOutputLanguage
  status: GenerateCvStatus
  tailoredResult: TailoredCvResult | null
  coverLetterResult: CoverLetterResult | null
  coverLetterStatus: 'idle' | 'generating' | 'ready' | 'error'
  coverLetterError: string | null
  error: string | null
}

type GenerateActions = {
  setOutputLanguage: (language: CvOutputLanguage) => void
  setStatus: (status: GenerateCvStatus) => void
  setTailoredResult: (result: TailoredCvResult | null) => void
  setCoverLetterResult: (result: CoverLetterResult | null) => void
  setCoverLetterStatus: (status: GenerateState['coverLetterStatus']) => void
  setCoverLetterError: (error: string | null) => void
  setError: (error: string | null) => void
  reset: () => void
}

export type GenerateStore = GenerateState & GenerateActions

export const useGenerateStore = create<GenerateStore>()((set) => ({
  outputLanguage: getDefaultCvOutputLanguage(),
  status: 'idle',
  tailoredResult: null,
  coverLetterResult: null,
  coverLetterStatus: 'idle',
  coverLetterError: null,
  error: null,

  setOutputLanguage: (outputLanguage) => {
    localStorage.setItem(CV_OUTPUT_LANGUAGE_STORAGE_KEY, outputLanguage)
    set({
      outputLanguage,
      tailoredResult: null,
      coverLetterResult: null,
      coverLetterStatus: 'idle',
      coverLetterError: null,
      status: 'idle',
      error: null,
    })
  },

  setStatus: (status) => set({ status }),

  setTailoredResult: (tailoredResult) =>
    set({ tailoredResult, status: tailoredResult ? 'ready' : 'idle', error: null }),

  setCoverLetterResult: (coverLetterResult) =>
    set({
      coverLetterResult,
      coverLetterStatus: coverLetterResult ? 'ready' : 'idle',
      coverLetterError: null,
    }),

  setCoverLetterStatus: (coverLetterStatus) => set({ coverLetterStatus }),

  setCoverLetterError: (coverLetterError) =>
    set(
      coverLetterError
        ? { coverLetterError, coverLetterStatus: 'error' }
        : { coverLetterError: null },
    ),

  setError: (error) =>
    set(error ? { error, status: 'error' } : { error: null }),

  reset: () =>
    set({
      status: 'idle',
      tailoredResult: null,
      coverLetterResult: null,
      coverLetterStatus: 'idle',
      coverLetterError: null,
      error: null,
    }),
}))
