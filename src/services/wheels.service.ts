import { supabase } from './supabase'
import type { Spin, Wheel, WheelOption } from '../types'

export async function createWheel(groupId: string, name: string, description?: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')
  const { data, error } = await supabase.from('wheels').insert({ group_id: groupId, created_by: user.id, name: name.trim(), description: description?.trim() || null }).select('id').single()
  if (error) throw error
  return data.id as string
}

export async function deleteWheel(id: string) { const { error } = await supabase.from('wheels').delete().eq('id', id); if (error) throw error }
export async function updateWheel(id: string, name: string, description?: string) { const { error } = await supabase.from('wheels').update({ name: name.trim(), description: description?.trim() || null }).eq('id', id); if (error) throw error }

export async function getWheel(id: string) {
  const [wheelResult, optionsResult, spinsResult] = await Promise.all([
    supabase.from('wheels').select('*').eq('id', id).single(),
    supabase.from('wheel_options').select('*,profiles(display_name,username)').eq('wheel_id', id).eq('active', true).order('created_at'),
    supabase.from('spins').select('*,wheel_options(name),profiles(display_name,username)').eq('wheel_id', id).order('created_at', { ascending: false }).limit(10),
  ])
  if (wheelResult.error) throw wheelResult.error
  if (optionsResult.error) throw optionsResult.error
  if (spinsResult.error) throw spinsResult.error
  return { wheel: wheelResult.data as Wheel, options: optionsResult.data as WheelOption[], spins: spinsResult.data as unknown as Spin[] }
}

export async function addOption(wheelId: string, name: string, description?: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')
  const { error } = await supabase.from('wheel_options').insert({ wheel_id: wheelId, name: name.trim(), description: description?.trim() || null, created_by: user.id })
  if (error) throw error
}

export async function deleteOption(id: string) { const { error } = await supabase.from('wheel_options').update({ active: false }).eq('id', id); if (error) throw error }

export async function recordSpin(wheel: Wheel, winnerOptionId: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')
  const { error } = await supabase.from('spins').insert({ wheel_id: wheel.id, group_id: wheel.group_id, winner_option_id: winnerOptionId, spun_by: user.id })
  if (error) throw error
}
