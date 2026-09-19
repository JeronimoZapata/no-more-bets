import { supabase } from './supabase'
import type { GlobalRole, Profile } from '../types'

export async function updateOwnProfile(displayName: string, username: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')
  const { error } = await supabase.from('profiles').update({ display_name: displayName.trim(), username: username.toLowerCase().trim() }).eq('id', user.id)
  if (error) throw error
}

export async function listUsers() { const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }); if (error) throw error; return data as Profile[] }
export async function adminUpdateUser(userId: string, role: GlobalRole, active: boolean) { const { error } = await supabase.rpc('admin_update_user', { target_user: userId, new_role: role, new_active: active }); if (error) throw error }
