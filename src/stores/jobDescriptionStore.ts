import { create } from 'zustand'
import type { ProfileCompatibility } from '../types/compatibility'
import type {
  JobDescriptionAnalysis,
  JobDescriptionStatus,
} from '../types/jobDescription'
import { useGenerateStore } from './generateStore'

const TEXT_STORAGE_KEY = 'ai-job-search-job-description-text'

type JobDescriptionState = {
  text: string
  status: JobDescriptionStatus
  analysis: JobDescriptionAnalysis | null
  compatibility: ProfileCompatibility | null
  error: string | null
}

type JobDescriptionActions = {
  setText: (text: string) => void
  clearText: () => void
  setStatus: (status: JobDescriptionStatus) => void
  setAnalysis: (analysis: JobDescriptionAnalysis | null) => void
  setCompatibility: (compatibility: ProfileCompatibility | null) => void
  setError: (error: string | null) => void
  resetAnalysis: () => void
}

export type JobDescriptionStore = JobDescriptionState & JobDescriptionActions

function readPersistedText(): string {
  return localStorage.getItem(TEXT_STORAGE_KEY) ?? ''
}

function persistText(text: string) {
  if (text.trim()) {
    localStorage.setItem(TEXT_STORAGE_KEY, text)
    return
  }
  localStorage.removeItem(TEXT_STORAGE_KEY)
}

export const useJobDescriptionStore = create<JobDescriptionStore>()((set) => ({
  text: readPersistedText(),
  status: 'idle',
  analysis: null,
  compatibility: null,
  error: null,

  setText: (text) => {
    persistText(text)
    useGenerateStore.getState().reset()
    set({ text, status: 'idle', analysis: null, compatibility: null, error: null })
  },

  clearText: () => {
    persistText('')
    useGenerateStore.getState().reset()
    set({ text: '', status: 'idle', analysis: null, compatibility: null, error: null })
  },

  setStatus: (status) => set({ status }),

  setAnalysis: (analysis) =>
    set({ analysis, status: analysis ? 'ready' : 'idle', error: null }),

  setCompatibility: (compatibility) => set({ compatibility }),

  setError: (error) =>
    set(error ? { error, status: 'error' } : { error: null }),

  resetAnalysis: () =>
    set({ analysis: null, compatibility: null, status: 'idle', error: null }),
}))
