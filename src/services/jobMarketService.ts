import type {
  Job,
  JobListResponse,
  JobMarketOverview,
  JobPipelineStatus,
  JobSearchPreferences,
} from '../types/jobMarket'
import { apiFetch, parseApiError } from '../utils/apiClient'

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error(await parseApiError(response))
  return response.json() as Promise<T>
}

export async function fetchJobs(params: {
  search?: string
  provider?: string
  pipeline?: string
  cursor?: string | null
  profileId?: string | null
  limit?: number
} = {}): Promise<JobListResponse> {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) if (value) query.set(key, String(value))
  return readJson<JobListResponse>(await apiFetch(`/api/jobs?${query}`))
}

export async function addManualJob(input: {
  companyName: string
  title: string
  url: string
  location: string
  description: string
}): Promise<Job> {
  const data = await readJson<{ job: Job }>(await apiFetch('/api/jobs/manual', { method: 'POST', body: JSON.stringify(input) }))
  return data.job
}

export async function updateJobState(jobId: string, status: JobPipelineStatus, notes = '') {
  await readJson(await apiFetch(`/api/jobs/${jobId}/state`, { method: 'PATCH', body: JSON.stringify({ status, notes }) }))
}

export async function fetchJobMarketOverview(): Promise<JobMarketOverview> {
  return readJson<JobMarketOverview>(await apiFetch('/api/job-market/companies'))
}

export async function fetchJobPreferences(): Promise<JobSearchPreferences> {
  const data = await readJson<{ preferences: JobSearchPreferences }>(await apiFetch('/api/job-market/preferences'))
  return data.preferences
}

export async function saveJobPreferences(preferences: JobSearchPreferences) {
  const data = await readJson<{ preferences: JobSearchPreferences }>(await apiFetch('/api/job-market/preferences', { method: 'PUT', body: JSON.stringify(preferences) }))
  return data.preferences
}

export async function addCompany(input: { name: string; careersUrl: string; websiteUrl?: string }) {
  return readJson(await apiFetch('/api/job-market/companies', { method: 'POST', body: JSON.stringify(input) }))
}

export async function followCompany(companyId: string) {
  return readJson(await apiFetch(`/api/job-market/companies/${companyId}/follow`, { method: 'POST' }))
}

export async function removeSource(sourceId: string) {
  return readJson(await apiFetch(`/api/job-market/sources/${sourceId}`, { method: 'DELETE' }))
}

export async function setSourceEnabled(sourceId: string, enabled: boolean) {
  return readJson(await apiFetch(`/api/job-market/sources/${sourceId}`, { method: 'PATCH', body: JSON.stringify({ enabled }) }))
}

export async function syncJobMarket() {
  return readJson<{ attempted: number; skipped: number }>(await apiFetch('/api/job-market/sync', { method: 'POST' }))
}
