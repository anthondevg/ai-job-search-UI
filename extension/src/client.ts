import { createClient } from '@supabase/supabase-js'
import type { AnalyzeResponse, CvRecord } from './types'

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('La extensión no tiene configuradas las credenciales de Supabase')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey: 'cv-match-extension-auth',
  },
})

async function authorizedFetch(path: string, init?: RequestInit): Promise<Response> {
  const { data, error } = await supabase.auth.getSession()
  if (error || !data.session) throw new Error('Tu sesión expiró. Inicia sesión otra vez.')

  const headers = new Headers(init?.headers)
  headers.set('Authorization', `Bearer ${data.session.access_token}`)
  if (init?.body) headers.set('Content-Type', 'application/json')

  return fetch(`${apiUrl}${path}`, { ...init, headers })
}

async function responseError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string }
    return body.error || 'La solicitud falló'
  } catch {
    return 'La solicitud falló'
  }
}

export async function getCvRecords(): Promise<CvRecord[]> {
  const response = await authorizedFetch('/api/cv')
  if (!response.ok) throw new Error(await responseError(response))
  const body = (await response.json()) as { records: CvRecord[] }
  return body.records
}

export async function analyzeOffer(
  jobDescription: string,
  record: CvRecord,
): Promise<AnalyzeResponse> {
  const response = await authorizedFetch('/api/cv/analyze-job', {
    method: 'POST',
    body: JSON.stringify({
      jobDescription,
      sourceProfile: record.profile,
      responseLanguage: 'es',
    }),
  })

  if (!response.ok) throw new Error(await responseError(response))
  return response.json() as Promise<AnalyzeResponse>
}
