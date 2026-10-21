-- Rich announcements, a five-image gallery, and reversible archiving.
-- Apply after supabase-schedule-announcement-edit.sql. Existing RPCs remain available during rollout.
begin;

alter table public.schedule_announcements
  add column if not exists content_runs jsonb not null default '[]'::jsonb,
  add column if not exists is_archived boolean not null default false,
  add column if not exists archived_at timestamptz;

create table if not exists public.schedule_announcement_images (
  id uuid primary key default gen_random_uuid(),
  announcement_id uuid not null references public.schedule_announcements(id) on delete cascade,
  sort_order integer not null,
  image_content bytea not null,
  image_content_type text not null,
  created_at timestamptz not null default now(),
  constraint schedule_announcement_images_type_valid check (image_content_type in ('image/jpeg','image/png','image/webp','image/gif')),
  constraint schedule_announcement_images_size_valid check (octet_length(image_content) between 1 and 5242880),
  constraint schedule_announcement_images_order_valid check (sort_order between 1 and 5),
  unique (announcement_id, sort_order)
);
create index if not exists schedule_announcement_images_parent_idx on public.schedule_announcement_images (announcement_id, sort_order);
alter table public.schedule_announcement_images enable row level security;
revoke all on table public.schedule_announcement_images from public, anon, authenticated, service_role;

-- Preserve images on existing announcements once, without changing the old interface.
insert into public.schedule_announcement_images (announcement_id, sort_order, image_content, image_content_type)
select id, 1, image_content, image_content_type
from public.schedule_announcements
where image_content is not null
on conflict (announcement_id, sort_order) do nothing;

create or replace function public.schedule_announcement_v2_payload(p_id uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'id', a.id, 'message', a.message, 'content_runs', a.content_runs,
    'has_image', a.image_content is not null,
    'is_active', a.is_active, 'is_archived', a.is_archived,
    'archived_at', a.archived_at, 'updated_at', a.updated_at, 'version', a.version,
    'images', coalesce((
      select jsonb_agg(jsonb_build_object('id', i.id, 'sort_order', i.sort_order) order by i.sort_order)
      from public.schedule_announcement_images i where i.announcement_id = a.id
    ), '[]'::jsonb)
  ) from public.schedule_announcements a where a.id = p_id;
$$;

create or replace function public.schedule_announcement_v2_public_list(p_service_secret text)
returns jsonb language sql stable security definer set search_path = '' as $$
  select case when public._schedule_worker_ok(p_service_secret) then
    coalesce((select jsonb_agg(public.schedule_announcement_v2_payload(x.id) order by x.updated_at desc, x.id desc)
      from (select a.id, a.updated_at from public.schedule_announcements a
        where a.is_active and not a.is_archived order by a.updated_at desc, a.id desc limit 100) x), '[]'::jsonb)
    else '[]'::jsonb end;
$$;

create or replace function public.schedule_announcement_v2_admin_list(p_service_secret text, p_admin_token uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
  select case when public._schedule_worker_ok(p_service_secret)
    and public._schedule_admin_id(p_admin_token) is not null then
    coalesce((select jsonb_agg(public.schedule_announcement_v2_payload(x.id) order by x.updated_at desc, x.id desc)
      from (select a.id, a.updated_at from public.schedule_announcements a
        order by a.updated_at desc, a.id desc limit 500) x), '[]'::jsonb)
    else '[]'::jsonb end;
$$;

create or replace function public.schedule_announcement_v2_create(
  p_service_secret text, p_admin_token uuid, p_message text, p_content_runs jsonb, p_is_active boolean
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_admin_id uuid; v_id uuid;
begin
  if not public._schedule_worker_ok(p_service_secret) then return null; end if;
  v_admin_id := public._schedule_admin_id(p_admin_token);
  if v_admin_id is null then return null; end if;
  if p_content_runs is null or jsonb_typeof(p_content_runs) <> 'array'
    or octet_length(p_content_runs::text) > 100000 or p_is_active is null then
    raise exception 'Invalid announcement content' using errcode = '22023';
  end if;
  insert into public.schedule_announcements (message, content_runs, is_active, created_by_admin_id, updated_by_admin_id)
  values (p_message, p_content_runs, p_is_active, v_admin_id, v_admin_id) returning id into v_id;
  return public.schedule_announcement_v2_payload(v_id);
end;
$$;

create or replace function public.schedule_announcement_v2_update(
  p_service_secret text, p_admin_token uuid, p_id uuid, p_expected_version integer,
  p_message text, p_content_runs jsonb, p_is_active boolean
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_admin_id uuid;
begin
  if not public._schedule_worker_ok(p_service_secret) then return null; end if;
  v_admin_id := public._schedule_admin_id(p_admin_token);
  if v_admin_id is null or p_content_runs is null or jsonb_typeof(p_content_runs) <> 'array'
    or octet_length(p_content_runs::text) > 100000 or p_is_active is null
    or p_expected_version < 1 then return null; end if;
  update public.schedule_announcements a set message = p_message, content_runs = p_content_runs,
    is_active = case when a.is_archived then false else p_is_active end,
    version = a.version + 1, updated_at = clock_timestamp(), updated_by_admin_id = v_admin_id
  where a.id = p_id and a.version = p_expected_version;
  if not found then return null; end if;
  return public.schedule_announcement_v2_payload(p_id);
end;
$$;

create or replace function public.schedule_announcement_v2_set_active(
  p_service_secret text, p_admin_token uuid, p_id uuid, p_expected_version integer, p_is_active boolean
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_admin_id uuid;
begin
  if not public._schedule_worker_ok(p_service_secret) then return null; end if;
  v_admin_id := public._schedule_admin_id(p_admin_token);
  if v_admin_id is null or p_is_active is null or p_expected_version < 1 then return null; end if;
  update public.schedule_announcements a set is_active = p_is_active,
    version = a.version + 1, updated_at = clock_timestamp(), updated_by_admin_id = v_admin_id
  where a.id = p_id and a.version = p_expected_version and not a.is_archived;
  if not found then return null; end if;
  return public.schedule_announcement_v2_payload(p_id);
end;
$$;

create or replace function public.schedule_announcement_v2_set_archived(
  p_service_secret text, p_admin_token uuid, p_id uuid, p_expected_version integer, p_is_archived boolean
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_admin_id uuid;
begin
  if not public._schedule_worker_ok(p_service_secret) then return null; end if;
  v_admin_id := public._schedule_admin_id(p_admin_token);
  if v_admin_id is null or p_is_archived is null or p_expected_version < 1 then return null; end if;
  update public.schedule_announcements a set is_archived = p_is_archived,
    archived_at = case when p_is_archived then clock_timestamp() else null end,
    is_active = false, version = a.version + 1,
    updated_at = clock_timestamp(), updated_by_admin_id = v_admin_id
  where a.id = p_id and a.version = p_expected_version and a.is_archived <> p_is_archived;
  if not found then return null; end if;
  return public.schedule_announcement_v2_payload(p_id);
end;
$$;

create or replace function public.schedule_announcement_v2_add_image(
  p_service_secret text, p_admin_token uuid, p_id uuid, p_expected_version integer,
  p_image_content text, p_image_content_type text
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_admin_id uuid; v_version integer; v_count integer; v_image bytea;
begin
  if not public._schedule_worker_ok(p_service_secret) then return null; end if;
  v_admin_id := public._schedule_admin_id(p_admin_token);
  if v_admin_id is null or p_expected_version < 1 or p_image_content_type not in ('image/jpeg','image/png','image/webp','image/gif')
    or char_length(coalesce(p_image_content,'')) > 6990512
    or p_image_content !~ '^[A-Za-z0-9+/]*={0,2}$' then return null; end if;
  select a.version into v_version from public.schedule_announcements a where a.id = p_id for update;
  if v_version is distinct from p_expected_version then return null; end if;
  select count(*) into v_count from public.schedule_announcement_images i where i.announcement_id = p_id;
  if v_count >= 5 then raise exception 'Announcement image limit reached' using errcode = '22023'; end if;
  v_image := decode(p_image_content, 'base64');
  if octet_length(v_image) not between 1 and 5242880 then raise exception 'Invalid image size' using errcode = '22023'; end if;
  insert into public.schedule_announcement_images (announcement_id, sort_order, image_content, image_content_type)
  select p_id, n, v_image, p_image_content_type from generate_series(1,5) n
  where not exists (select 1 from public.schedule_announcement_images i where i.announcement_id = p_id and i.sort_order = n)
  order by n limit 1;
  update public.schedule_announcements a set version = a.version + 1,
    updated_at = clock_timestamp(), updated_by_admin_id = v_admin_id where a.id = p_id;
  return public.schedule_announcement_v2_payload(p_id);
end;
$$;

create or replace function public.schedule_announcement_v2_remove_image(
  p_service_secret text, p_admin_token uuid, p_id uuid, p_expected_version integer, p_image_id uuid
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_admin_id uuid; v_version integer; v_image bytea;
begin
  if not public._schedule_worker_ok(p_service_secret) then return null; end if;
  v_admin_id := public._schedule_admin_id(p_admin_token);
  if v_admin_id is null or p_expected_version < 1 then return null; end if;
  select a.version into v_version from public.schedule_announcements a where a.id = p_id for update;
  if v_version is distinct from p_expected_version then return null; end if;
  delete from public.schedule_announcement_images i where i.announcement_id = p_id and i.id = p_image_id
    returning i.image_content into v_image;
  if not found then return null; end if;
  update public.schedule_announcements a set version = a.version + 1,
    image_content = case when a.image_content = v_image then null else a.image_content end,
    image_content_type = case when a.image_content = v_image then null else a.image_content_type end,
    updated_at = clock_timestamp(), updated_by_admin_id = v_admin_id where a.id = p_id;
  return public.schedule_announcement_v2_payload(p_id);
end;
$$;

create or replace function public.schedule_announcement_v2_public_image(
  p_service_secret text, p_id uuid, p_image_id uuid
) returns table (image_content text, image_content_type text)
language sql stable security definer set search_path = '' as $$
  select encode(i.image_content,'base64'), i.image_content_type
  from public.schedule_announcement_images i join public.schedule_announcements a on a.id = i.announcement_id
  where public._schedule_worker_ok(p_service_secret) and a.id = p_id and i.id = p_image_id
    and a.is_active and not a.is_archived limit 1;
$$;

create or replace function public.schedule_announcement_v2_admin_image(
  p_service_secret text, p_admin_token uuid, p_id uuid, p_image_id uuid
) returns table (image_content text, image_content_type text)
language sql stable security definer set search_path = '' as $$
  select encode(i.image_content,'base64'), i.image_content_type
  from public.schedule_announcement_images i
  where public._schedule_worker_ok(p_service_secret)
    and public._schedule_admin_id(p_admin_token) is not null
    and i.announcement_id = p_id and i.id = p_image_id limit 1;
$$;

revoke all on function public.schedule_announcement_v2_payload(uuid) from public, anon, authenticated, service_role;
revoke all on function public.schedule_announcement_v2_public_list(text) from public, anon, authenticated, service_role;
revoke all on function public.schedule_announcement_v2_admin_list(text,uuid) from public, anon, authenticated, service_role;
revoke all on function public.schedule_announcement_v2_create(text,uuid,text,jsonb,boolean) from public, anon, authenticated, service_role;
revoke all on function public.schedule_announcement_v2_update(text,uuid,uuid,integer,text,jsonb,boolean) from public, anon, authenticated, service_role;
revoke all on function public.schedule_announcement_v2_set_active(text,uuid,uuid,integer,boolean) from public, anon, authenticated, service_role;
revoke all on function public.schedule_announcement_v2_set_archived(text,uuid,uuid,integer,boolean) from public, anon, authenticated, service_role;
revoke all on function public.schedule_announcement_v2_add_image(text,uuid,uuid,integer,text,text) from public, anon, authenticated, service_role;
revoke all on function public.schedule_announcement_v2_remove_image(text,uuid,uuid,integer,uuid) from public, anon, authenticated, service_role;
revoke all on function public.schedule_announcement_v2_public_image(text,uuid,uuid) from public, anon, authenticated, service_role;
revoke all on function public.schedule_announcement_v2_admin_image(text,uuid,uuid,uuid) from public, anon, authenticated, service_role;

grant execute on function public.schedule_announcement_v2_public_list(text) to anon;
grant execute on function public.schedule_announcement_v2_admin_list(text,uuid) to anon;
grant execute on function public.schedule_announcement_v2_create(text,uuid,text,jsonb,boolean) to anon;
grant execute on function public.schedule_announcement_v2_update(text,uuid,uuid,integer,text,jsonb,boolean) to anon;
grant execute on function public.schedule_announcement_v2_set_active(text,uuid,uuid,integer,boolean) to anon;
grant execute on function public.schedule_announcement_v2_set_archived(text,uuid,uuid,integer,boolean) to anon;
grant execute on function public.schedule_announcement_v2_add_image(text,uuid,uuid,integer,text,text) to anon;
grant execute on function public.schedule_announcement_v2_remove_image(text,uuid,uuid,integer,uuid) to anon;
grant execute on function public.schedule_announcement_v2_public_image(text,uuid,uuid) to anon;
grant execute on function public.schedule_announcement_v2_admin_image(text,uuid,uuid,uuid) to anon;

notify pgrst, 'reload schema';
commit;
