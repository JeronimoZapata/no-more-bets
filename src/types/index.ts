export type GlobalRole = 'USER' | 'ADMIN'
export type GroupRole = 'OWNER' | 'ADMIN' | 'MEMBER'

export interface Profile {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  role: GlobalRole
  active: boolean
  created_at: string
  updated_at: string
}

export interface Group {
  id: string
  name: string
  description: string | null
  owner_id: string
  invite_code: string
  created_at: string
}

export interface GroupMembership {
  id: string
  group_id: string
  user_id: string
  role: GroupRole
  joined_at: string
  groups?: Group
  profiles?: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'>
}

export interface Wheel {
  id: string
  group_id: string
  created_by: string
  name: string
  description: string | null
  selection_mode: 'RANDOM'
  created_at: string
  updated_at: string
}

export interface WheelOption {
  id: string
  wheel_id: string
  name: string
  description: string | null
  active: boolean
  created_by: string
  created_at: string
  profiles?: Pick<Profile, 'display_name' | 'username'>
}

export interface Spin {
  id: string
  wheel_id: string
  group_id: string
  winner_option_id: string
  spun_by: string
  algorithm: 'RANDOM'
  created_at: string
  wheel_options?: Pick<WheelOption, 'name'>
  profiles?: Pick<Profile, 'display_name' | 'username'>
}

export interface InvitePreview { id: string; name: string; description: string | null; owner_name: string; already_member: boolean }
