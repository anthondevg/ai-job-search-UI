import { create } from 'zustand'
import type {
  JobDescriptionAnalysis,
  JobDescriptionStatus,
} from '../types/jobDescription'

const TEXT_STORAGE_KEY = 'ai-job-search-job-description-text'

type JobDescriptionState = {
  text: string
  status: JobDescriptionStatus
  analysis: JobDescriptionAnalysis | null
  error: string | null
}

type JobDescriptionActions = {
  setText: (text: string) => void
  clearText: () => void
  setStatus: (status: JobDescriptionStatus) => void
  setAnalysis: (analysis: JobDescriptionAnalysis | null) => void
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
  error: null,

  setText: (text) => {
    persistText(text)
    set({ text, status: 'idle', analysis: null, error: null })
  },

  clearText: () => {
    persistText('')
    set({ text: '', status: 'idle', analysis: null, error: null })
  },

  setStatus: (status) => set({ status }),

  setAnalysis: (analysis) =>
    set({ analysis, status: analysis ? 'ready' : 'idle', error: null }),

  setError: (error) => set({ error, status: error ? 'error' : 'idle' }),

  resetAnalysis: () => set({ analysis: null, status: 'idle', error: null }),
}))
