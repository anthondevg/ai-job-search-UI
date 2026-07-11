import { create } from 'zustand'
import {
  deleteCvRecord,
  fetchCvRecords,
  parseCvPdf,
} from '../services/cvProfileService'
import type { CvUploadStatus, SavedCvRecord } from '../types/cvProfile'

const ACTIVE_ID_STORAGE_KEY = 'ai-job-search-cv-store-active-id'

type CvState = {
  records: SavedCvRecord[]
  activeId: string | null
  isLoading: boolean
  status: CvUploadStatus
  error: string | null
}

type CvActions = {
  loadRecords: () => Promise<void>
  selectRecord: (id: string) => void
  uploadPdf: (file: File) => Promise<void>
  removeRecord: (id: string) => Promise<void>
  setDragging: (isDragging: boolean) => void
  setError: (error: string | null) => void
  setStatus: (status: CvUploadStatus) => void
}

export type CvStore = CvState & CvActions

function readPersistedActiveId(): string | null {
  return localStorage.getItem(ACTIVE_ID_STORAGE_KEY)
}

function persistActiveId(id: string | null) {
  if (id) {
    localStorage.setItem(ACTIVE_ID_STORAGE_KEY, id)
    return
  }
  localStorage.removeItem(ACTIVE_ID_STORAGE_KEY)
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

function applyActiveId(
  set: (partial: Partial<CvState>) => void,
  activeId: string | null,
  extra?: Partial<CvState>,
) {
  persistActiveId(activeId)
  set({ activeId, ...extra })
}

export const useCvStore = create<CvStore>()((set, get) => ({
  records: [],
  activeId: readPersistedActiveId(),
  isLoading: true,
  status: 'idle',
  error: null,

  setError: (error) => set({ error }),

  setStatus: (status) => set({ status }),

  selectRecord: (id) => {
    applyActiveId(set, id, { status: 'success', error: null })
  },

  setDragging: (isDragging) => {
    const { status, activeId, records } = get()
    if (status === 'parsing') return

    const hasActive = records.some((record) => record.id === activeId)
    set({ status: isDragging ? 'dragging' : hasActive ? 'success' : 'idle' })
  },

  loadRecords: async () => {
    set({ isLoading: true, error: null })

    try {
      const nextRecords = await fetchCvRecords()
      const nextActiveId = resolveActiveId(nextRecords, get().activeId)

      applyActiveId(set, nextActiveId, {
        records: nextRecords,
        status: nextActiveId ? 'success' : 'idle',
      })
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to load saved CVs',
        status: 'error',
      })
    } finally {
      set({ isLoading: false })
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

      applyActiveId(set, record.id, {
        records: nextRecords,
        status: 'success',
      })
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to parse CV from PDF',
        status: 'error',
      })
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

      applyActiveId(set, nextActiveId, {
        records: nextRecords,
        status: nextActiveId ? 'success' : 'idle',
      })
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
