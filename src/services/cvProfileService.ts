import type {
  ListCvResponse,
  ParseCvErrorResponse,
  ParseCvResponse,
  SavedCvRecord,
} from '../types/cvProfile'
import { apiFetch, parseApiError } from '../utils/apiClient'

export async function parseCvPdf(file: File): Promise<SavedCvRecord> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiFetch('/api/cv/parse', {
    method: 'POST',
    body: formData,
  })

  const data = (await response.json()) as ParseCvResponse | ParseCvErrorResponse

  if (!response.ok) {
    const errorMessage =
      'error' in data ? data.error : await parseApiError(response)
    throw new Error(errorMessage)
  }

  return (data as ParseCvResponse).record
}

export async function fetchCvRecords(): Promise<SavedCvRecord[]> {
  const response = await apiFetch('/api/cv')

  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }

  const data = (await response.json()) as ListCvResponse
  return data.records
}

export async function deleteCvRecord(id: string): Promise<void> {
  const response = await apiFetch(`/api/cv/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }
}
