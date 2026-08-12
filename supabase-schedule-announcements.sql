-- Schedule administrator-managed public announcements.
-- Apply after supabase-schedule-system.sql.

begin;

create table if not exists public.schedule_announcements (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  image_content bytea,
  image_content_type text,
  is_active boolean not null default true,
  version integer not null default 1,
  created_by_admin_id uuid references public.schedule_admin_accounts(id) on delete set null,
  updated_by_admin_id uuid references public.schedule_admin_accounts(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint schedule_announcements_message_valid check (
    char_length(btrim(message)) between 1 and 4000
    and octet_length(message) <= 16000
    and regexp_replace(message, E'[\n\r\t]', '', 'g') !~ '[[:cntrl:]]'
  ),
  constraint schedule_announcements_image_pair check (
    (image_content is null and image_content_type is null)
    or (
      image_content is not null
      and image_content_type in ('image/jpeg', 'image/png', 'image/webp', 'image/gif')
      and octet_length(image_content) between 1 and 5242880
    )
  ),
  constraint schedule_announcements_version_valid check (version between 1 and 2147483647)
);

create index if not exists schedule_announcements_active_order_idx
  on public.schedule_announcements (updated_at desc, id desc)
  where is_active;

create index if not exists schedule_announcements_created_admin_idx
  on public.schedule_announcements (created_by_admin_id)
  where created_by_admin_id is not null;

create index if not exists schedule_announcements_admin_history_idx
  on public.schedule_announcements (updated_by_admin_id, updated_at desc, id desc)
  where updated_by_admin_id is not null;

alter table public.schedule_announcements enable row level security;
revoke all on table public.schedule_announcements from public, anon, authenticated, service_role;

create or replace function public.schedule_announcement_admin_auth(
  p_service_secret text,
  p_admin_token uuid
)
returns table (id uuid, name text)
language sql
stable
security definer
set search_path = ''
as $$
  select admin.id, admin.name
  from public.schedule_admin_accounts admin
  where public._schedule_worker_ok(p_service_secret)
    and admin.id = public._schedule_admin_id(p_admin_token)
  limit 1;
$$;

create or replace function public.schedule_announcement_public_list(p_service_secret text)
returns table (
  id uuid,
  message text,
  has_image boolean,
  updated_at timestamptz,
  version integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select announcement.id,
         announcement.message,
         announcement.image_content is not null,
         announcement.updated_at,
         announcement.version
  from public.schedule_announcements announcement
  where public._schedule_worker_ok(p_service_secret)
    and announcement.is_active
  order by announcement.updated_at desc, announcement.id desc
  limit 100;
$$;

create or replace function public.schedule_announcement_public_image(
  p_service_secret text,
  p_id uuid
)
returns table (image_content text, image_content_type text)
language sql
stable
security definer
set search_path = ''
as $$
  select encode(announcement.image_content, 'base64'), announcement.image_content_type
  from public.schedule_announcements announcement
  where public._schedule_worker_ok(p_service_secret)
    and announcement.id = p_id
    and announcement.is_active
    and announcement.image_content is not null
  limit 1;
$$;

create or replace function public.schedule_announcement_admin_list(
  p_service_secret text,
  p_admin_token uuid
)
returns table (
  id uuid,
  message text,
  has_image boolean,
  is_active boolean,
  updated_at timestamptz,
  version integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select announcement.id,
         announcement.message,
         announcement.image_content is not null,
         announcement.is_active,
         announcement.updated_at,
         announcement.version
  from public.schedule_announcements announcement
  where public._schedule_worker_ok(p_service_secret)
    and public._schedule_admin_id(p_admin_token) is not null
  order by announcement.updated_at desc, announcement.id desc
  limit 500;
$$;

create or replace function public.schedule_announcement_admin_create(
  p_service_secret text,
  p_admin_token uuid,
  p_message text,
  p_image_content text,
  p_image_content_type text,
  p_is_active boolean
)
returns table (
  id uuid,
  message text,
  has_image boolean,
  is_active boolean,
  updated_at timestamptz,
  version integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_id uuid;
  v_image bytea;
begin
  if not public._schedule_worker_ok(p_service_secret) then return; end if;
  v_admin_id := public._schedule_admin_id(p_admin_token);
  if v_admin_id is null then return; end if;
  if p_message is null
    or char_length(btrim(p_message)) not between 1 and 4000
    or octet_length(p_message) > 16000
    or regexp_replace(p_message, E'[\n\r\t]', '', 'g') ~ '[[:cntrl:]]'
    or p_is_active is null
    or ((p_image_content is null) <> (p_image_content_type is null))
    or (p_image_content_type is not null and p_image_content_type not in ('image/jpeg', 'image/png', 'image/webp', 'image/gif'))
    or char_length(coalesce(p_image_content, '')) > 6990512
    or (p_image_content is not null and p_image_content !~ '^[A-Za-z0-9+/]*={0,2}$')
  then
    raise exception 'Invalid announcement' using errcode = '22023';
  end if;

  if p_image_content is not null then
    v_image := decode(p_image_content, 'base64');
    if octet_length(v_image) not between 1 and 5242880 then
      raise exception 'Invalid announcement image' using errcode = '22023';
    end if;
  end if;

  insert into public.schedule_announcements (
    message, image_content, image_content_type, is_active,
    created_by_admin_id, updated_by_admin_id
  ) values (
    p_message, v_image, p_image_content_type, p_is_active,
    v_admin_id, v_admin_id
  ) returning schedule_announcements.id into v_id;

  return query
  select announcement.id, announcement.message,
         announcement.image_content is not null, announcement.is_active,
         announcement.updated_at, announcement.version
  from public.schedule_announcements announcement
  where announcement.id = v_id;
end;
$$;

create or replace function public.schedule_announcement_admin_set_active(
  p_service_secret text,
  p_admin_token uuid,
  p_id uuid,
  p_expected_version integer,
  p_is_active boolean
)
returns table (
  id uuid,
  message text,
  has_image boolean,
  is_active boolean,
  updated_at timestamptz,
  version integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare v_admin_id uuid := null;
begin
  if not public._schedule_worker_ok(p_service_secret) then return; end if;
  v_admin_id := public._schedule_admin_id(p_admin_token);
  if v_admin_id is null or p_id is null or p_expected_version < 1 or p_is_active is null then return; end if;

  update public.schedule_announcements announcement
  set is_active = p_is_active,
      version = announcement.version + 1,
      updated_by_admin_id = v_admin_id,
      updated_at = clock_timestamp()
  where announcement.id = p_id
    and announcement.version = p_expected_version;

  if not found then return; end if;
  return query
  select announcement.id, announcement.message,
         announcement.image_content is not null, announcement.is_active,
         announcement.updated_at, announcement.version
  from public.schedule_announcements announcement
  where announcement.id = p_id;
end;
$$;

create or replace function public.schedule_announcement_admin_delete(
  p_service_secret text,
  p_admin_token uuid,
  p_id uuid,
  p_expected_version integer
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare v_deleted integer := 0;
begin
  if not public._schedule_worker_ok(p_service_secret)
    or public._schedule_admin_id(p_admin_token) is null
    or p_id is null
    or p_expected_version < 1
  then
    return 0;
  end if;
  delete from public.schedule_announcements announcement
  where announcement.id = p_id and announcement.version = p_expected_version;
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

revoke all on function public.schedule_announcement_admin_auth(text, uuid) from public, anon, authenticated, service_role;
revoke all on function public.schedule_announcement_public_list(text) from public, anon, authenticated, service_role;
revoke all on function public.schedule_announcement_public_image(text, uuid) from public, anon, authenticated, service_role;
revoke all on function public.schedule_announcement_admin_list(text, uuid) from public, anon, authenticated, service_role;
revoke all on function public.schedule_announcement_admin_create(text, uuid, text, text, text, boolean) from public, anon, authenticated, service_role;
revoke all on function public.schedule_announcement_admin_set_active(text, uuid, uuid, integer, boolean) from public, anon, authenticated, service_role;
revoke all on function public.schedule_announcement_admin_delete(text, uuid, uuid, integer) from public, anon, authenticated, service_role;

grant execute on function public.schedule_announcement_admin_auth(text, uuid) to anon;
grant execute on function public.schedule_announcement_public_list(text) to anon;
grant execute on function public.schedule_announcement_public_image(text, uuid) to anon;
grant execute on function public.schedule_announcement_admin_list(text, uuid) to anon;
grant execute on function public.schedule_announcement_admin_create(text, uuid, text, text, text, boolean) to anon;
grant execute on function public.schedule_announcement_admin_set_active(text, uuid, uuid, integer, boolean) to anon;
grant execute on function public.schedule_announcement_admin_delete(text, uuid, uuid, integer) to anon;

notify pgrst, 'reload schema';
commit;
