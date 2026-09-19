import { supabase } from './supabase'
import type { Group, GroupMembership, InvitePreview, Wheel } from '../types'

export async function listMyGroups() {
  const { data, error } = await supabase.from('group_members').select('id,group_id,user_id,role,joined_at,groups(*)').order('joined_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as (GroupMembership & { groups: Group })[]
}

export async function createGroup(name: string, description?: string) {
  const { data, error } = await supabase.rpc('create_group', { group_name: name.trim(), group_description: description?.trim() || null })
  if (error) throw error
  return data as string
}

export async function getGroup(groupId: string) {
  const [groupResult, membersResult, wheelsResult] = await Promise.all([
    supabase.from('groups').select('*').eq('id', groupId).single(),
    supabase.from('group_members').select('id,group_id,user_id,role,joined_at,profiles(id,username,display_name,avatar_url)').eq('group_id', groupId).order('joined_at'),
    supabase.from('wheels').select('*').eq('group_id', groupId).order('created_at', { ascending: false }),
  ])
  if (groupResult.error) throw groupResult.error
  if (membersResult.error) throw membersResult.error
  if (wheelsResult.error) throw wheelsResult.error
  return { group: groupResult.data as Group, members: membersResult.data as unknown as GroupMembership[], wheels: wheelsResult.data as Wheel[] }
}

export async function getInvitePreview(inviteCode: string) {
  const { data, error } = await supabase.rpc('get_group_invite_preview', { code: inviteCode.toUpperCase() })
  if (error) throw error
  return data as InvitePreview
}

export async function joinGroup(inviteCode: string) {
  const { data, error } = await supabase.rpc('join_group', { code: inviteCode.toUpperCase() })
  if (error) throw error
  return data as string
}

export async function updateGroup(groupId: string, name: string, description?: string) { const { error } = await supabase.from('groups').update({ name: name.trim(), description: description?.trim() || null }).eq('id', groupId); if (error) throw error }
export async function updateMemberRole(membershipId: string, role: 'ADMIN' | 'MEMBER') { const { error } = await supabase.from('group_members').update({ role }).eq('id', membershipId); if (error) throw error }
export async function removeMember(membershipId: string) { const { error } = await supabase.from('group_members').delete().eq('id', membershipId); if (error) throw error }
export async function getMyGroupRole(groupId: string) { const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error('No autenticado'); const { data, error } = await supabase.from('group_members').select('role').eq('group_id', groupId).eq('user_id', user.id).single(); if (error) throw error; return data.role as GroupMembership['role'] }
