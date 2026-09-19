import { supabase } from './supabase'

export async function signUp(email: string, password: string, username: string, displayName: string) {
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { username: username.toLowerCase().trim(), display_name: displayName.trim() } } })
  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
