import { create } from 'zustand'
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
  error: string | null
}

type GenerateActions = {
  setOutputLanguage: (language: CvOutputLanguage) => void
  setStatus: (status: GenerateCvStatus) => void
  setTailoredResult: (result: TailoredCvResult | null) => void
  setError: (error: string | null) => void
  reset: () => void
}

export type GenerateStore = GenerateState & GenerateActions

export const useGenerateStore = create<GenerateStore>()((set) => ({
  outputLanguage: getDefaultCvOutputLanguage(),
  status: 'idle',
  tailoredResult: null,
  error: null,

  setOutputLanguage: (outputLanguage) => {
    localStorage.setItem(CV_OUTPUT_LANGUAGE_STORAGE_KEY, outputLanguage)
    set({ outputLanguage, tailoredResult: null, status: 'idle', error: null })
  },

  setStatus: (status) => set({ status }),

  setTailoredResult: (tailoredResult) =>
    set({ tailoredResult, status: tailoredResult ? 'ready' : 'idle', error: null }),

  setError: (error) =>
    set({ error, status: error ? 'error' : 'idle' }),

  reset: () => set({ status: 'idle', tailoredResult: null, error: null }),
}))
