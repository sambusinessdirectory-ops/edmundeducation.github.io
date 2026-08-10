-- Non-destructive production migration for the per-student recording quota.
-- This intentionally does not replay the full speaking schema or remove any
-- legacy columns. Existing recordings remain intact.

begin;

do $$
begin
  if pg_catalog.to_regclass('public.flashcard_students') is null
    or pg_catalog.to_regclass('public.speaking_system_settings') is null
    or pg_catalog.to_regclass('public.speaking_recording_attempts') is null then
    raise exception 'Missing dependency: speaking system schema';
  end if;
end;
$$;

update public.speaking_system_settings
set max_storage_bytes_per_student = 209715200,
    updated_at = now()
where singleton;

create or replace function public.speaking_get_recording_usage(
  p_student_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_settings public.speaking_system_settings%rowtype;
  v_file_count integer;
  v_total_bytes bigint;
begin
  if not exists (
    select 1
    from public.flashcard_students student
    where student.id = p_student_id
      and student.deleted_at is null
  ) then
    return jsonb_build_object('ok', false, 'code', 'STUDENT_NOT_FOUND');
  end if;

  select settings.*
  into strict v_settings
  from public.speaking_system_settings settings
  where settings.singleton;

  select count(*)::integer, coalesce(sum(attempt.size_bytes), 0)::bigint
  into v_file_count, v_total_bytes
  from public.speaking_recording_attempts attempt
  where attempt.student_id = p_student_id;

  return jsonb_build_object(
    'ok', true,
    'usage', jsonb_build_object(
      'fileCount', v_file_count,
      'storageBytes', v_total_bytes
    ),
    'quota', jsonb_build_object(
      'maxFiles', v_settings.max_recordings_per_student,
      'maxBytes', v_settings.max_storage_bytes_per_student
    ),
    'canRecord',
      v_file_count < v_settings.max_recordings_per_student
      and v_total_bytes < v_settings.max_storage_bytes_per_student
  );
end;
$$;

revoke all on function public.speaking_get_recording_usage(uuid)
  from public, anon, authenticated;
grant execute on function public.speaking_get_recording_usage(uuid)
  to service_role;

notify pgrst, 'reload schema';

commit;
