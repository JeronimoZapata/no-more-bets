import { createContext } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { Profile } from '../types'

export interface AuthValue {
  session: Session | null
  profile: Profile | null
  loading: boolean
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthValue | undefined>(undefined)
