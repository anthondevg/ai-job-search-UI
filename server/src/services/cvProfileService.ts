import type { PostgrestError } from '@supabase/supabase-js'
import type { CVProfile } from '../types/cvProfile.js'
import { getSupabaseClient } from './supabaseClient.js'

export type CvProfileRow = {
  id: string
  user_id: string
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
    return 'Supabase blocked the server request (RLS). Verify SUPABASE_SERVICE_ROLE_KEY and run supabase/migrations/003_auth_and_rls.sql'
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
  userId: string,
  fileName: string,
  profile: CVProfile,
): Promise<SavedCvRecord> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('cv_profiles')
    .insert({
      user_id: userId,
      file_name: fileName,
      profile,
    })
    .select('id, user_id, file_name, profile, created_at')
    .single()

  if (error || !data) {
    throw new Error(error ? formatSupabaseError(error) : 'Failed to save CV profile')
  }

  return mapRow(data as CvProfileRow)
}

export async function listCvProfiles(userId: string): Promise<SavedCvRecord[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('cv_profiles')
    .select('id, user_id, file_name, profile, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(formatSupabaseError(error))
  }

  return (data as CvProfileRow[]).map(mapRow)
}

export async function claimLegacyCvProfiles(
  userId: string,
  sessionId: string,
): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('cv_profiles')
    .update({ user_id: userId, session_id: null })
    .eq('session_id', sessionId)
    .is('user_id', null)

  if (error) {
    throw new Error(formatSupabaseError(error))
  }
}

export async function updateCvProfile(
  userId: string,
  id: string,
  profile: CVProfile,
): Promise<SavedCvRecord> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('cv_profiles')
    .update({ profile })
    .eq('id', id)
    .eq('user_id', userId)
    .select('id, user_id, file_name, profile, created_at')
    .single()

  if (error) {
    throw new Error(formatSupabaseError(error))
  }

  if (!data) {
    throw new Error('CV profile not found')
  }

  return mapRow(data as CvProfileRow)
}

export async function deleteCvProfile(
  userId: string,
  id: string,
): Promise<void> {
  const supabase = getSupabaseClient()

  const { error, count } = await supabase
    .from('cv_profiles')
    .delete({ count: 'exact' })
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    throw new Error(formatSupabaseError(error))
  }

  if (!count) {
    throw new Error('CV profile not found')
  }
}
