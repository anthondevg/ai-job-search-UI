import { getSupabaseBrowserClient } from '../services/supabaseBrowserClient'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''
const LEGACY_SESSION_ID_STORAGE_KEY = 'ai-job-search-session-id'

type ApiErrorResponse = {
  error: string
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(options.headers)
  const { data, error } = await getSupabaseBrowserClient().auth.getSession()

  if (error || !data.session?.access_token) {
    throw new Error('Authentication is required')
  }

  headers.set('Authorization', `Bearer ${data.session.access_token}`)

  const legacySessionId = localStorage.getItem(LEGACY_SESSION_ID_STORAGE_KEY)
  if (legacySessionId) {
    headers.set('X-Legacy-Session-Id', legacySessionId)
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })
}

export async function parseApiError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as ApiErrorResponse
    return data.error ?? 'Request failed'
  } catch {
    return 'Request failed'
  }
}
