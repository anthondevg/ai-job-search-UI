import { getSessionId } from './session'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''

type ApiErrorResponse = {
  error: string
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(options.headers)
  headers.set('X-Session-Id', getSessionId())

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
