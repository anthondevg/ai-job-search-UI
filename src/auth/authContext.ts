import { createContext } from 'react'
import type { Session, UserAttributes } from '@supabase/supabase-js'

export type AuthContextValue = {
  session: Session | null
  isLoading: boolean
  configurationError: string | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateUser: (attributes: UserAttributes) => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
