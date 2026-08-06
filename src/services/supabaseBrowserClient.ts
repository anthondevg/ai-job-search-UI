import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function getSupabaseBrowserClient() {
  if (client) return client

  const url = import.meta.env.VITE_SUPABASE_URL
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

  if (!url || !publishableKey) {
    throw new Error(
      'VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must be configured',
    )
  }

  client = createClient(url, publishableKey)
  return client
}
