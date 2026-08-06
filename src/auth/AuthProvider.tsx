import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { getSupabaseBrowserClient } from '../services/supabaseBrowserClient'
import { AuthContext } from './authContext'

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [configurationError, setConfigurationError] = useState<string | null>(
    null,
  )

  useEffect(() => {
    try {
      const supabase = getSupabaseBrowserClient()
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        setSession(nextSession)
        setIsLoading(false)
      })

      void supabase.auth.getSession().then(({ data, error }) => {
        if (error) {
          setConfigurationError(error.message)
        }
        setSession(data.session)
        setIsLoading(false)
      })

      return () => subscription.unsubscribe()
    } catch (error) {
      setConfigurationError(
        error instanceof Error ? error.message : 'Authentication is not configured',
      )
      setIsLoading(false)
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await getSupabaseBrowserClient().auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await getSupabaseBrowserClient().auth.signOut()
    if (error) throw error
    window.location.assign('/')
  }, [])

  const updateUser = useCallback(async (attributes: import('@supabase/supabase-js').UserAttributes) => {
    const { error } = await getSupabaseBrowserClient().auth.updateUser(attributes)
    if (error) throw error
  }, [])

  const value = useMemo(
    () => ({ session, isLoading, configurationError, signIn, signOut, updateUser }),
    [configurationError, isLoading, session, signIn, signOut, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
