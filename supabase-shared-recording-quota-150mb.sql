-- One account-wide 150 MiB allowance across Listening recordings and every
-- Speaking / learning-system recording. Existing audio and student records are
-- retained. Both reservation paths take the same transaction lock, and the
-- trigger is a final guard for any future server-side insert path.

begin;

do $$
begin
  if pg_catalog.to_regclass('public.flashcard_students') is null
    or pg_catalog.to_regclass('public.speaking_system_settings') is null
    or pg_catalog.to_regclass('public.speaking_recording_attempts') is null
    or pg_catalog.to_regclass('public.listening_recordings') is null then
    raise exception 'Missing dependency: Listening or Speaking recording schema';
  end if;
end;
$$;

update public.speaking_system_settings
set max_storage_bytes_per_student = 157286400,
    updated_at = now()
where singleton;

alter table public.speaking_recording_attempts
  drop constraint if exists speaking_recording_attempts_exam_check;

alter table public.speaking_recording_attempts
  add constraint speaking_recording_attempts_exam_check
  check (exam in (
    'ielts',
    'dse',
    'business-english',
    'school-job-interview',
    'civil-service-interview',
    'learning-practice'
  ));

create or replace function public.shared_recording_quota_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_limit bigint;
  v_used bigint;
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('shared-recordings:' || new.student_id::text, 0)
  );

  select settings.max_storage_bytes_per_student
  into strict v_limit
  from public.speaking_system_settings settings
  where settings.singleton
  for share;

  select coalesce(sum(recording.size_bytes), 0)::bigint
  into v_used
  from (
    select attempt.size_bytes
    from public.speaking_recording_attempts attempt
    where attempt.student_id = new.student_id
    union all
    select listening.size_bytes
    from public.listening_recordings listening
    where listening.student_id = new.student_id
  ) recording;

  if v_used + new.size_bytes > v_limit then
    raise exception using
      errcode = '23514',
      message = 'Shared recording storage quota exceeded';
  end if;
  return new;
end;
$$;

revoke all on function public.shared_recording_quota_guard()
  from public, anon, authenticated;

drop trigger if exists speaking_shared_recording_quota_guard
  on public.speaking_recording_attempts;
create trigger speaking_shared_recording_quota_guard
before insert on public.speaking_recording_attempts
for each row execute function public.shared_recording_quota_guard();

drop trigger if exists listening_shared_recording_quota_guard
  on public.listening_recordings;
create trigger listening_shared_recording_quota_guard
before insert on public.listening_recordings
for each row execute function public.shared_recording_quota_guard();

create or replace function public.speaking_get_recording_usage(
  p_student_id uuid
)
returns jsonb
language plpgsql
stable
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

  select count(*)::integer, coalesce(sum(recording.size_bytes), 0)::bigint
  into v_file_count, v_total_bytes
  from (
    select attempt.size_bytes
    from public.speaking_recording_attempts attempt
    where attempt.student_id = p_student_id
    union all
    select listening.size_bytes
    from public.listening_recordings listening
    where listening.student_id = p_student_id
  ) recording;

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

create or replace function public.listening_reserve_recording(
  p_student uuid,
  p_id uuid,
  p_practice integer,
  p_part integer,
  p_row integer,
  p_title text,
  p_transcript text,
  p_size integer,
  p_duration integer,
  p_sha256 text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.listening_recordings%rowtype;
  used bigint;
  shared_limit bigint;
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('shared-recordings:' || p_student::text, 0)
  );

  select * into r
  from public.listening_recordings
  where id = p_id
  for update;
  if found then
    if r.student_id <> p_student or r.sha256 <> p_sha256 or r.size_bytes <> p_size
      or r.practice <> p_practice or r.part <> p_part or r.row_index is distinct from p_row
      or r.title <> p_title or r.transcript <> p_transcript or r.storage_state = 'deleting' then
      return jsonb_build_object('error', 'Recording ID conflict', 'status', 409);
    end if;
    update public.listening_recordings
    set updated_at = now()
    where id = r.id
    returning * into r;
    return jsonb_build_object('recording', to_jsonb(r));
  end if;

  select settings.max_storage_bytes_per_student
  into strict shared_limit
  from public.speaking_system_settings settings
  where settings.singleton
  for share;

  select coalesce(sum(recording.size_bytes), 0)::bigint
  into used
  from (
    select attempt.size_bytes
    from public.speaking_recording_attempts attempt
    where attempt.student_id = p_student
    union all
    select listening.size_bytes
    from public.listening_recordings listening
    where listening.student_id = p_student
  ) recording;

  if used + p_size > shared_limit then
    return jsonb_build_object(
      'error', 'Shared Listening and Speaking storage is full (150 MB). Export and delete an older recording first.',
      'status', 413,
      'usage', jsonb_build_object('storageBytes', used),
      'quota', jsonb_build_object('maxBytes', shared_limit)
    );
  end if;

  if (
    select count(*)
    from public.listening_recordings
    where student_id = p_student
      and created_at > now() - interval '1 minute'
  ) >= 12 then
    return jsonb_build_object('error', 'Please wait a minute before saving another recording.', 'status', 429);
  end if;

  insert into public.listening_recordings (
    id, student_id, practice, part, row_index, title, transcript,
    size_bytes, duration_ms, sha256, object_path
  ) values (
    p_id, p_student, p_practice, p_part, p_row, p_title, p_transcript,
    p_size, p_duration, p_sha256,
    'students/' || p_student::text || '/' || p_id::text || '.mp3'
  ) returning * into r;

  return jsonb_build_object(
    'recording', to_jsonb(r),
    'usage', jsonb_build_object('storageBytes', used + p_size),
    'quota', jsonb_build_object('maxBytes', shared_limit)
  );
end;
$$;

notify pgrst, 'reload schema';

commit;
