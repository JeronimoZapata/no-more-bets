create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (username ~ '^[a-z0-9_]{3,24}$'),
  display_name text not null check (char_length(display_name) between 1 and 50),
  avatar_url text,
  role text not null default 'USER' check (role in ('USER', 'ADMIN')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  description text check (description is null or char_length(description) <= 240),
  owner_id uuid not null references public.profiles(id),
  invite_code text unique not null check (invite_code ~ '^[A-Z0-9]{6,8}$'),
  created_at timestamptz not null default now()
);

create table public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'MEMBER' check (role in ('OWNER', 'ADMIN', 'MEMBER')),
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);

create table public.wheels (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  created_by uuid not null references public.profiles(id),
  name text not null check (char_length(name) between 1 and 80),
  description text check (description is null or char_length(description) <= 240),
  selection_mode text not null default 'RANDOM' check (selection_mode = 'RANDOM'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wheel_options (
  id uuid primary key default gen_random_uuid(),
  wheel_id uuid not null references public.wheels(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  description text check (description is null or char_length(description) <= 180),
  active boolean not null default true,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.spins (
  id uuid primary key default gen_random_uuid(),
  wheel_id uuid not null references public.wheels(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  winner_option_id uuid not null references public.wheel_options(id),
  spun_by uuid not null references public.profiles(id),
  algorithm text not null default 'RANDOM' check (algorithm = 'RANDOM'),
  created_at timestamptz not null default now()
);

create index group_members_user_idx on public.group_members(user_id);
create index group_members_group_idx on public.group_members(group_id);
create index wheels_group_idx on public.wheels(group_id);
create index wheel_options_wheel_idx on public.wheel_options(wheel_id) where active;
create index spins_wheel_created_idx on public.spins(wheel_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger wheels_set_updated_at before update on public.wheels for each row execute function public.set_updated_at();

create or replace function public.protect_immutable_columns()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_table_name = 'groups' then
    new.owner_id := old.owner_id;
    new.invite_code := old.invite_code;
  elsif tg_table_name = 'group_members' then
    new.group_id := old.group_id;
    new.user_id := old.user_id;
  elsif tg_table_name = 'wheels' then
    new.group_id := old.group_id;
    new.created_by := old.created_by;
    new.selection_mode := old.selection_mode;
  elsif tg_table_name = 'wheel_options' then
    new.wheel_id := old.wheel_id;
    new.created_by := old.created_by;
  end if;
  return new;
end;
$$;
create trigger groups_protect_immutable before update on public.groups for each row execute function public.protect_immutable_columns();
create trigger members_protect_immutable before update on public.group_members for each row execute function public.protect_immutable_columns();
create trigger wheels_protect_immutable before update on public.wheels for each row execute function public.protect_immutable_columns();
create trigger options_protect_immutable before update on public.wheel_options for each row execute function public.protect_immutable_columns();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  new_username text := lower(trim(coalesce(new.raw_user_meta_data ->> 'username', '')));
  new_display_name text := trim(coalesce(new.raw_user_meta_data ->> 'display_name', ''));
begin
  if new_username !~ '^[a-z0-9_]{3,24}$' then raise exception 'invalid username'; end if;
  if char_length(new_display_name) not between 1 and 50 then raise exception 'invalid display name'; end if;
  insert into public.profiles (id, username, display_name) values (new.id, new_username, new_display_name);
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- SECURITY DEFINER helpers avoid recursive RLS checks. They expose booleans only.
create or replace function public.is_active_user(uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = uid and active);
$$;
create or replace function public.is_global_admin(uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = uid and active and role = 'ADMIN');
$$;
create or replace function public.is_group_member(gid uuid, uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.group_members where group_id = gid and user_id = uid);
$$;
create or replace function public.can_manage_group(gid uuid, uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.group_members where group_id = gid and user_id = uid and role in ('OWNER', 'ADMIN'));
$$;
create or replace function public.shares_group(viewer uuid, target uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.group_members mine
    join public.group_members theirs on theirs.group_id = mine.group_id
    where mine.user_id = viewer and theirs.user_id = target
  );
$$;

revoke all on function public.is_active_user(uuid) from public;
revoke all on function public.is_global_admin(uuid) from public;
revoke all on function public.is_group_member(uuid, uuid) from public;
revoke all on function public.can_manage_group(uuid, uuid) from public;
revoke all on function public.shares_group(uuid, uuid) from public;
grant execute on function public.is_active_user(uuid), public.is_global_admin(uuid), public.is_group_member(uuid, uuid), public.can_manage_group(uuid, uuid), public.shares_group(uuid, uuid) to authenticated;

create or replace function public.protect_profile_security_fields()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_global_admin(auth.uid()) then
    new.role := old.role;
    new.active := old.active;
  end if;
  return new;
end;
$$;
create trigger profiles_protect_security before update on public.profiles for each row execute function public.protect_profile_security_fields();

create or replace function public.create_group(group_name text, group_description text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare gid uuid; code text;
begin
  if auth.uid() is null or not public.is_active_user(auth.uid()) then raise exception 'user is inactive'; end if;
  if char_length(trim(group_name)) not between 1 and 60 then raise exception 'invalid group name'; end if;
  loop
    select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random() * 32)::int, 1), '') into code from generate_series(1, 6);
    exit when not exists (select 1 from public.groups where invite_code = code);
  end loop;
  insert into public.groups(name, description, owner_id, invite_code) values (trim(group_name), nullif(trim(group_description), ''), auth.uid(), code) returning id into gid;
  insert into public.group_members(group_id, user_id, role) values (gid, auth.uid(), 'OWNER');
  return gid;
end;
$$;

create or replace function public.get_group_invite_preview(code text)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare result jsonb;
begin
  if auth.uid() is null or not public.is_active_user(auth.uid()) then raise exception 'user is inactive'; end if;
  select jsonb_build_object('id', g.id, 'name', g.name, 'description', g.description, 'owner_name', p.display_name, 'already_member', public.is_group_member(g.id, auth.uid())) into result
  from public.groups g join public.profiles p on p.id = g.owner_id where g.invite_code = upper(trim(code));
  if result is null then raise exception 'invalid invite code'; end if;
  return result;
end;
$$;

create or replace function public.join_group(code text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare gid uuid;
begin
  if auth.uid() is null or not public.is_active_user(auth.uid()) then raise exception 'user is inactive'; end if;
  select id into gid from public.groups where invite_code = upper(trim(code));
  if gid is null then raise exception 'invalid invite code'; end if;
  if public.is_group_member(gid, auth.uid()) then raise exception 'already a member'; end if;
  insert into public.group_members(group_id, user_id, role) values (gid, auth.uid(), 'MEMBER');
  return gid;
end;
$$;

create or replace function public.admin_update_user(target_user uuid, new_role text, new_active boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_global_admin(auth.uid()) then raise exception 'not authorized'; end if;
  if target_user = auth.uid() then raise exception 'cannot change your own access'; end if;
  if new_role not in ('USER', 'ADMIN') then raise exception 'invalid role'; end if;
  update public.profiles set role = new_role, active = new_active where id = target_user;
end;
$$;

revoke all on function public.create_group(text, text), public.get_group_invite_preview(text), public.join_group(text), public.admin_update_user(uuid, text, boolean) from public;
grant execute on function public.create_group(text, text), public.get_group_invite_preview(text), public.join_group(text), public.admin_update_user(uuid, text, boolean) to authenticated;

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.wheels enable row level security;
alter table public.wheel_options enable row level security;
alter table public.spins enable row level security;

create policy profiles_read on public.profiles for select to authenticated using (
  id = auth.uid() or public.is_global_admin() or (public.is_active_user() and public.shares_group(auth.uid(), id))
);
create policy profiles_update on public.profiles for update to authenticated using (
  id = auth.uid() or public.is_global_admin()
) with check (id = auth.uid() or public.is_global_admin());

create policy groups_read on public.groups for select to authenticated using (public.is_active_user() and public.is_group_member(id));
create policy groups_update on public.groups for update to authenticated using (public.is_active_user() and owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy members_read on public.group_members for select to authenticated using (public.is_active_user() and public.is_group_member(group_id));
create policy members_update on public.group_members for update to authenticated using (
  public.is_active_user() and exists (select 1 from public.groups g where g.id = group_id and g.owner_id = auth.uid()) and role <> 'OWNER'
) with check (role in ('ADMIN', 'MEMBER') and exists (select 1 from public.groups g where g.id = group_id and g.owner_id = auth.uid()));
create policy members_delete on public.group_members for delete to authenticated using (
  public.is_active_user() and exists (select 1 from public.groups g where g.id = group_id and g.owner_id = auth.uid()) and role <> 'OWNER'
);

create policy wheels_read on public.wheels for select to authenticated using (public.is_active_user() and public.is_group_member(group_id));
create policy wheels_insert on public.wheels for insert to authenticated with check (public.is_active_user() and created_by = auth.uid() and public.can_manage_group(group_id));
create policy wheels_update on public.wheels for update to authenticated using (public.is_active_user() and public.can_manage_group(group_id)) with check (public.can_manage_group(group_id));
create policy wheels_delete on public.wheels for delete to authenticated using (public.is_active_user() and public.can_manage_group(group_id));

create policy options_read on public.wheel_options for select to authenticated using (
  public.is_active_user() and exists (select 1 from public.wheels w where w.id = wheel_id and public.is_group_member(w.group_id))
);
create policy options_insert on public.wheel_options for insert to authenticated with check (
  public.is_active_user() and created_by = auth.uid() and exists (select 1 from public.wheels w where w.id = wheel_id and public.can_manage_group(w.group_id))
);
create policy options_update on public.wheel_options for update to authenticated using (
  public.is_active_user() and exists (select 1 from public.wheels w where w.id = wheel_id and public.can_manage_group(w.group_id))
) with check (exists (select 1 from public.wheels w where w.id = wheel_id and public.can_manage_group(w.group_id)));
create policy options_delete on public.wheel_options for delete to authenticated using (
  public.is_active_user() and exists (select 1 from public.wheels w where w.id = wheel_id and public.can_manage_group(w.group_id))
);

create policy spins_read on public.spins for select to authenticated using (public.is_active_user() and public.is_group_member(group_id));
create policy spins_insert on public.spins for insert to authenticated with check (
  public.is_active_user() and spun_by = auth.uid() and public.is_group_member(group_id)
  and exists (select 1 from public.wheels w where w.id = wheel_id and w.group_id = group_id)
  and exists (select 1 from public.wheel_options o where o.id = winner_option_id and o.wheel_id = wheel_id and o.active)
);

grant usage on schema public to authenticated;
grant select, update on public.profiles to authenticated;
grant select, update on public.groups to authenticated;
grant select, update, delete on public.group_members to authenticated;
grant select, insert, update, delete on public.wheels to authenticated;
grant select, insert, update, delete on public.wheel_options to authenticated;
grant select, insert on public.spins to authenticated;
