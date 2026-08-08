import { create } from 'zustand'
import {
  deleteCvRecord,
  fetchCvRecords,
  parseCvPdf,
  updateCvRecord,
} from '../services/cvProfileService'
import type { CvUploadStatus, CVProfile, SavedCvRecord } from '../types/cvProfile'
import { useGenerateStore } from './generateStore'
import { useJobDescriptionStore } from './jobDescriptionStore'
import { normalizeLanguageItems } from '../utils/cvLanguages'

const CV_CACHE_KEY_PREFIX = 'ai-job-search-cv-cache-v1:'

type CachedCvState = {
  records: SavedCvRecord[]
  activeId: string | null
}

type CvState = {
  records: SavedCvRecord[]
  activeId: string | null
  currentUserId: string | null
  isLoading: boolean
  status: CvUploadStatus
  error: string | null
  profileSaveStatus: 'idle' | 'saving' | 'saved' | 'error'
  profileSaveError: string | null
}

type CvActions = {
  loadRecords: (userId: string) => Promise<void>
  selectRecord: (id: string) => void
  uploadPdf: (file: File) => Promise<void>
  updateProfile: (id: string, profile: CVProfile) => Promise<void>
  removeRecord: (id: string) => Promise<void>
  setDragging: (isDragging: boolean) => void
  setError: (error: string | null) => void
  setStatus: (status: CvUploadStatus) => void
  setProfileSaveStatus: (
    status: CvState['profileSaveStatus'],
    error?: string | null,
  ) => void
}

export type CvStore = CvState & CvActions

function getCacheKey(userId: string): string {
  return `${CV_CACHE_KEY_PREFIX}${userId}`
}

function readCachedState(userId: string): CachedCvState | null {
  try {
    const value = localStorage.getItem(getCacheKey(userId))
    if (!value) return null

    const cached = JSON.parse(value) as Partial<CachedCvState>
    if (!Array.isArray(cached.records)) return null

    return {
      records: cached.records.map((record) => ({
        ...record,
        profile: {
          ...record.profile,
          languages: normalizeLanguageItems(record.profile?.languages),
        },
      })),
      activeId: typeof cached.activeId === 'string' ? cached.activeId : null,
    }
  } catch {
    return null
  }
}

function persistCachedState(
  userId: string | null,
  records: SavedCvRecord[],
  activeId: string | null,
) {
  if (!userId) return

  try {
    localStorage.setItem(
      getCacheKey(userId),
      JSON.stringify({ records, activeId } satisfies CachedCvState),
    )
  } catch {
    // The server remains the source of truth if browser storage is unavailable
    // or its quota has been reached.
  }
}

function resolveActiveId(
  records: SavedCvRecord[],
  preferredId: string | null,
): string | null {
  if (!records.length) return null
  if (preferredId && records.some((record) => record.id === preferredId)) {
    return preferredId
  }
  return records[0]?.id ?? null
}

export const useCvStore = create<CvStore>()((set, get) => ({
  records: [],
  activeId: null,
  currentUserId: null,
  isLoading: true,
  status: 'idle',
  error: null,
  profileSaveStatus: 'idle',
  profileSaveError: null,

  setError: (error) => set({ error }),

  setStatus: (status) => set({ status }),

  setProfileSaveStatus: (profileSaveStatus, profileSaveError = null) =>
    set({ profileSaveStatus, profileSaveError }),

  selectRecord: (id) => {
    set({
      activeId: id,
      status: 'success',
      error: null,
      profileSaveStatus: 'idle',
      profileSaveError: null,
    })
    persistCachedState(get().currentUserId, get().records, id)
  },

  setDragging: (isDragging) => {
    const { status, activeId, records } = get()
    if (status === 'parsing') return

    const hasActive = records.some((record) => record.id === activeId)
    set({ status: isDragging ? 'dragging' : hasActive ? 'success' : 'idle' })
  },

  loadRecords: async (userId) => {
    const cached = readCachedState(userId)
    const cachedRecords = cached?.records ?? []
    const cachedActiveId = resolveActiveId(cachedRecords, cached?.activeId ?? null)

    set({
      currentUserId: userId,
      records: cachedRecords,
      activeId: cachedActiveId,
      isLoading: !cached,
      error: null,
      status: cachedActiveId ? 'success' : 'idle',
    })

    try {
      const nextRecords = await fetchCvRecords()
      if (get().currentUserId !== userId) return

      const nextActiveId = resolveActiveId(nextRecords, get().activeId)

      set({
        activeId: nextActiveId,
        records: nextRecords,
        status: nextActiveId ? 'success' : 'idle',
      })
      persistCachedState(userId, nextRecords, nextActiveId)
    } catch (error) {
      if (get().currentUserId !== userId) return
      set({
        error:
          error instanceof Error ? error.message : 'Failed to load saved CVs',
        status: get().records.length ? 'success' : 'error',
      })
    } finally {
      if (get().currentUserId === userId) set({ isLoading: false })
    }
  },

  uploadPdf: async (file) => {
    set({ status: 'parsing', error: null })

    try {
      const record = await parseCvPdf(file)
      const nextRecords = [
        record,
        ...get().records.filter((item) => item.id !== record.id),
      ]

      set({
        activeId: record.id,
        records: nextRecords,
        status: 'success',
      })
      persistCachedState(get().currentUserId, nextRecords, record.id)
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to parse CV from PDF',
        status: 'error',
      })
    }
  },

  updateProfile: async (id, profile) => {
    set({ profileSaveStatus: 'saving', profileSaveError: null })

    const previousRecords = get().records
    set({
      records: previousRecords.map((record) =>
        record.id === id ? { ...record, profile } : record,
      ),
    })

    useGenerateStore.getState().reset()
    useJobDescriptionStore.getState().resetAnalysis()

    try {
      const updated = await updateCvRecord(id, profile)
      set({
        records: get().records.map((record) =>
          record.id === id ? updated : record,
        ),
        profileSaveStatus: 'saved',
        profileSaveError: null,
      })
      persistCachedState(get().currentUserId, get().records, get().activeId)
    } catch (error) {
      set({
        records: previousRecords,
        profileSaveStatus: 'error',
        profileSaveError:
          error instanceof Error
            ? error.message
            : 'Failed to save CV profile changes',
      })
      throw error
    }
  },

  removeRecord: async (id) => {
    set({ error: null })

    try {
      await deleteCvRecord(id)

      const nextRecords = get().records.filter((record) => record.id !== id)
      const shouldUpdateActive = get().activeId === id
      const nextActiveId = shouldUpdateActive
        ? resolveActiveId(nextRecords, null)
        : get().activeId

      set({
        activeId: nextActiveId,
        records: nextRecords,
        status: nextActiveId ? 'success' : 'idle',
      })
      persistCachedState(get().currentUserId, nextRecords, nextActiveId)
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to delete the CV',
      })
    }
  },
}))

export function useActiveCvRecord() {
  return useCvStore((state) =>
    state.records.find((record) => record.id === state.activeId) ?? null,
  )
}

export function useActiveCvProfile() {
  return useCvStore((state) => {
    const record = state.records.find((record) => record.id === state.activeId)
    return record?.profile ?? null
  })
}
