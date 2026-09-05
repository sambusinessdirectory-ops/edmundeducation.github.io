-- Preserve the Advanced Speaking Performance Indicator with each saved MP3 attempt.
begin;

alter table public.speaking_recording_attempts
  add column if not exists performance_checklist jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.speaking_recording_attempts'::regclass
      and conname = 'speaking_recordings_performance_checklist_check'
  ) then
    alter table public.speaking_recording_attempts
      add constraint speaking_recordings_performance_checklist_check check (
        performance_checklist is null
        or (
          jsonb_typeof(performance_checklist) = 'object'
          and performance_checklist ?& array['version', 'content', 'language']
          and performance_checklist - 'version' - 'content' - 'language' = '{}'::jsonb
          and performance_checklist -> 'version' = '1'::jsonb
          and jsonb_typeof(performance_checklist -> 'content') = 'array'
          and jsonb_array_length(performance_checklist -> 'content') <= 5
          and jsonb_typeof(performance_checklist -> 'language') = 'array'
          and jsonb_array_length(performance_checklist -> 'language') <= 16
          and pg_column_size(performance_checklist) <= 4096
        )
      );
  end if;
end;
$$;

create or replace function public.speaking_set_recording_performance_checklist(
  p_id uuid,
  p_student_id uuid,
  p_performance_checklist jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_recording public.speaking_recording_attempts%rowtype;
begin
  if p_performance_checklist is null then
    return jsonb_build_object('ok', false, 'code', 'INVALID_PERFORMANCE_CHECKLIST');
  end if;

  update public.speaking_recording_attempts attempt
  set performance_checklist = p_performance_checklist,
      updated_at = clock_timestamp()
  where attempt.id = p_id
    and attempt.student_id = p_student_id
    and attempt.storage_state = 'uploading'
  returning attempt.* into v_recording;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'RECORDING_STATE_CONFLICT');
  end if;

  return jsonb_build_object('ok', true, 'recording', to_jsonb(v_recording));
end;
$$;

revoke all on function public.speaking_set_recording_performance_checklist(uuid, uuid, jsonb)
  from public, anon, authenticated;
grant execute on function public.speaking_set_recording_performance_checklist(uuid, uuid, jsonb)
  to service_role;

notify pgrst, 'reload schema';

commit;
