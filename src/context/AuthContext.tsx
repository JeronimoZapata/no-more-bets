import { useCallback, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../services/supabase'
import type { Profile } from '../types'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (nextSession?: Session | null) => {
    const activeSession = nextSession === undefined ? (await supabase.auth.getSession()).data.session : nextSession
    if (!activeSession) { setProfile(null); return }
    const { data } = await supabase.from('profiles').select('*').eq('id', activeSession.user.id).single()
    setProfile(data as Profile | null)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => { setSession(data.session); await loadProfile(data.session); setLoading(false) })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      window.setTimeout(() => loadProfile(nextSession), 0)
    })
    return () => listener.subscription.unsubscribe()
  }, [loadProfile])

  return <AuthContext.Provider value={{ session, profile, loading, refreshProfile: () => loadProfile() }}>{children}</AuthContext.Provider>
}
