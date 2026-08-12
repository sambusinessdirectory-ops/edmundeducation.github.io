-- Incremental, version-checked editing for existing schedule announcements.
-- Apply after supabase-schedule-announcements.sql. Do not combine with the
-- original migration on an already-initialised database.

begin;

create or replace function public.schedule_announcement_admin_update(
  p_service_secret text,
  p_admin_token uuid,
  p_id uuid,
  p_expected_version integer,
  p_message text,
  p_image_action text,
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
  v_image bytea;
begin
  if not public._schedule_worker_ok(p_service_secret) then return; end if;
  v_admin_id := public._schedule_admin_id(p_admin_token);
  if v_admin_id is null then return; end if;

  if p_id is null
    or p_expected_version is null
    or p_expected_version not between 1 and 2147483646
    or p_message is null
    or char_length(btrim(p_message)) not between 1 and 4000
    or octet_length(p_message) > 16000
    or regexp_replace(p_message, E'[\n\r\t]', '', 'g') ~ '[[:cntrl:]]'
    or p_is_active is null
    or p_image_action is null
    or p_image_action not in ('keep', 'replace', 'remove')
    or (
      p_image_action in ('keep', 'remove')
      and (p_image_content is not null or p_image_content_type is not null)
    )
    or (
      p_image_action = 'replace'
      and (
        p_image_content is null
        or p_image_content_type is null
        or p_image_content_type not in ('image/jpeg', 'image/png', 'image/webp', 'image/gif')
        or char_length(p_image_content) > 6990512
        or char_length(p_image_content) % 4 <> 0
        or p_image_content !~ '^[A-Za-z0-9+/]*={0,2}$'
      )
    )
  then
    raise exception 'Invalid announcement update' using errcode = '22023';
  end if;

  if p_image_action = 'replace' then
    begin
      v_image := decode(p_image_content, 'base64');
    exception when others then
      raise exception 'Invalid announcement image' using errcode = '22023';
    end;
    if octet_length(v_image) not between 1 and 5242880 then
      raise exception 'Invalid announcement image' using errcode = '22023';
    end if;
  end if;

  update public.schedule_announcements announcement
  set message = p_message,
      image_content = case p_image_action
        when 'keep' then announcement.image_content
        when 'remove' then null
        else v_image
      end,
      image_content_type = case p_image_action
        when 'keep' then announcement.image_content_type
        when 'remove' then null
        else p_image_content_type
      end,
      is_active = p_is_active,
      version = announcement.version + 1,
      updated_by_admin_id = v_admin_id,
      updated_at = clock_timestamp()
  where announcement.id = p_id
    and announcement.version = p_expected_version
    and announcement.version < 2147483647;

  if not found then return; end if;

  return query
  select announcement.id,
         announcement.message,
         announcement.image_content is not null,
         announcement.is_active,
         announcement.updated_at,
         announcement.version
  from public.schedule_announcements announcement
  where announcement.id = p_id;
end;
$$;

revoke all on function public.schedule_announcement_admin_update(
  text, uuid, uuid, integer, text, text, text, text, boolean
) from public, anon, authenticated, service_role;

grant execute on function public.schedule_announcement_admin_update(
  text, uuid, uuid, integer, text, text, text, text, boolean
) to anon;

notify pgrst, 'reload schema';
commit;
