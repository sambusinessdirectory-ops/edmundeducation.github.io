-- Repair the production timer definition from the first dashboard deployment.
begin;

create or replace function public.synonyms_progress_record_time(
  p_token uuid,
  p_duration_ms integer
)
returns bigint
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_event_key text;
  v_total_ms bigint;
begin
  if auth.uid() is null or p_token is null then
    raise exception 'Student authentication is required' using errcode = '42501';
  end if;
  if p_duration_ms is null or p_duration_ms not between 1000 and 60000 then
    raise exception 'Study duration is invalid' using errcode = '22023';
  end if;

  select session_row.student_id
  into v_student_id
  from public.flashcard_student_sessions session_row
  join public.flashcard_students student on student.id = session_row.student_id
  where session_row.token = p_token
    and session_row.expires_at > pg_catalog.now()
    and student.deleted_at is null
  limit 1;

  if v_student_id is null then
    raise exception 'Student session is invalid or expired' using errcode = '42501';
  end if;

  v_event_key := 'study-time:' ||
    ((pg_catalog.now() at time zone 'Asia/Hong_Kong')::date)::text;

  insert into public.learning_portal_progress_events as saved (
    student_id, system_key, event_key, activity_count, duration_ms, occurred_at
  ) values (
    v_student_id, 'synonyms', v_event_key, 0, p_duration_ms, pg_catalog.now()
  )
  on conflict (student_id, system_key, event_key) do update
  set duration_ms = least(86400000::bigint, saved.duration_ms + excluded.duration_ms),
      updated_at = pg_catalog.now()
  returning duration_ms into v_total_ms;

  return v_total_ms;
end;
$$;

revoke all on function public.synonyms_progress_record_time(uuid, integer)
  from public, anon, authenticated;
grant execute on function public.synonyms_progress_record_time(uuid, integer) to authenticated;

notify pgrst, 'reload schema';
commit;
