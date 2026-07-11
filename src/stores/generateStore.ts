import { create } from 'zustand'
import type { GenerateCvStatus, TailoredCvResult } from '../types/tailoredCv'

type GenerateState = {
  status: GenerateCvStatus
  tailoredResult: TailoredCvResult | null
  error: string | null
}

type GenerateActions = {
  setStatus: (status: GenerateCvStatus) => void
  setTailoredResult: (result: TailoredCvResult | null) => void
  setError: (error: string | null) => void
  reset: () => void
}

export type GenerateStore = GenerateState & GenerateActions

export const useGenerateStore = create<GenerateStore>()((set) => ({
  status: 'idle',
  tailoredResult: null,
  error: null,

  setStatus: (status) => set({ status }),

  setTailoredResult: (tailoredResult) =>
    set({ tailoredResult, status: tailoredResult ? 'ready' : 'idle', error: null }),

  setError: (error) =>
    set({ error, status: error ? 'error' : 'idle' }),

  reset: () => set({ status: 'idle', tailoredResult: null, error: null }),
}))
