import type { PostgrestError } from '@supabase/supabase-js'
import type { CVProfile } from '../types/cvProfile.js'
import { getSupabaseClient } from './supabaseClient.js'

export type CvProfileRow = {
  id: string
  session_id: string
  file_name: string
  profile: CVProfile
  created_at: string
}

export type SavedCvRecord = {
  id: string
  fileName: string
  profile: CVProfile
  createdAt: string
}

function mapRow(row: CvProfileRow): SavedCvRecord {
  return {
    id: row.id,
    fileName: row.file_name,
    profile: row.profile,
    createdAt: row.created_at,
  }
}

function formatSupabaseError(error: PostgrestError): string {
  if (error.code === '42501') {
    return 'Supabase blocked the request (RLS). Use the service_role key in server/.env and run supabase/migrations/002_disable_rls.sql'
  }

  if (error.code === '42P01') {
    return 'Table cv_profiles does not exist. Run supabase/migrations/001_cv_profiles.sql in the Supabase SQL editor'
  }

  const details = [error.message, error.details, error.hint]
    .filter(Boolean)
    .join(' — ')

  return details || 'Supabase request failed'
}

export async function createCvProfile(
  sessionId: string,
  fileName: string,
  profile: CVProfile,
): Promise<SavedCvRecord> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('cv_profiles')
    .insert({
      session_id: sessionId,
      file_name: fileName,
      profile,
    })
    .select('id, session_id, file_name, profile, created_at')
    .single()

  if (error || !data) {
    throw new Error(error ? formatSupabaseError(error) : 'Failed to save CV profile')
  }

  return mapRow(data as CvProfileRow)
}

export async function listCvProfiles(sessionId: string): Promise<SavedCvRecord[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('cv_profiles')
    .select('id, session_id, file_name, profile, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(formatSupabaseError(error))
  }

  return (data as CvProfileRow[]).map(mapRow)
}

export async function deleteCvProfile(
  sessionId: string,
  id: string,
): Promise<void> {
  const supabase = getSupabaseClient()

  const { error, count } = await supabase
    .from('cv_profiles')
    .delete({ count: 'exact' })
    .eq('id', id)
    .eq('session_id', sessionId)

  if (error) {
    throw new Error(formatSupabaseError(error))
  }

  if (!count) {
    throw new Error('CV profile not found')
  }
}
