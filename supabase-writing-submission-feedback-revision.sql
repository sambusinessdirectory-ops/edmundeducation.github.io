-- Writing Submission: optional feedback sections, unread state, improved versions,
-- student transcription areas, and immutable Writing Practice topic linkage.
-- Apply after supabase-writing-submission-feedback.sql.

begin;

alter table public.writing_submissions
  add column if not exists topic_resource jsonb;

alter table public.writing_submissions
  drop constraint if exists writing_submissions_topic_resource_valid;
alter table public.writing_submissions
  add constraint writing_submissions_topic_resource_valid check (
    topic_resource is null or (
      jsonb_typeof(topic_resource) = 'object'
      and octet_length(topic_resource::text) <= 65536
      and topic_resource ->> 'type' is not distinct from 'fill-blanks'
      and coalesce(topic_resource ->> 'id', '') ~ '^fill:[A-Za-z0-9][A-Za-z0-9._~-]{0,239}$'
    )
  );

alter table public.writing_submission_feedback
  add column if not exists improved_version text not null default '';
alter table public.writing_submission_feedback
  add column if not exists student_read_at timestamptz;

alter table public.writing_submission_feedback
  drop constraint if exists writing_submission_feedback_improved_version_size;
alter table public.writing_submission_feedback
  add constraint writing_submission_feedback_improved_version_size check (
    char_length(improved_version) <= 100000
    and octet_length(improved_version) <= 400000
    and regexp_replace(improved_version, E'[\n\r\t]', '', 'g') !~ '[[:cntrl:]]'
  );

create index if not exists writing_submission_feedback_unread_idx
  on public.writing_submission_feedback (student_id, published_at desc, submission_id)
  where status = 'published' and student_read_at is null;

create table if not exists public.writing_submission_feedback_transcriptions (
  feedback_id uuid primary key
    references public.writing_submission_feedback(id) on delete cascade,
  student_id uuid not null
    references public.flashcard_students(id) on delete cascade,
  improved_version_copy text not null default '',
  model_essay_copy text not null default '',
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint writing_submission_feedback_transcriptions_improved_size check (
    char_length(improved_version_copy) <= 100000
    and octet_length(improved_version_copy) <= 400000
    and regexp_replace(improved_version_copy, E'[\n\r\t]', '', 'g') !~ '[[:cntrl:]]'
  ),
  constraint writing_submission_feedback_transcriptions_model_size check (
    char_length(model_essay_copy) <= 100000
    and octet_length(model_essay_copy) <= 400000
    and regexp_replace(model_essay_copy, E'[\n\r\t]', '', 'g') !~ '[[:cntrl:]]'
  ),
  constraint writing_submission_feedback_transcriptions_version_valid
    check (version between 1 and 2147483647)
);

create index if not exists writing_submission_feedback_transcriptions_student_idx
  on public.writing_submission_feedback_transcriptions (student_id, updated_at desc, feedback_id);

alter table public.writing_submission_feedback_transcriptions enable row level security;
revoke all on table public.writing_submission_feedback_transcriptions
  from public, anon, authenticated, service_role;

create or replace function public.writing_submission_submit_v4(
  p_id uuid,
  p_student_id uuid,
  p_topic text,
  p_answer text,
  p_word_count integer,
  p_duration_seconds integer,
  p_topic_resource jsonb
)
returns table (
  id uuid,
  topic text,
  answer text,
  word_count integer,
  duration_seconds integer,
  submitted_at timestamptz,
  deleted_at timestamptz,
  topic_resource jsonb
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_topic_resource is not null and (
    jsonb_typeof(p_topic_resource) <> 'object'
    or octet_length(p_topic_resource::text) > 65536
    or p_topic_resource ->> 'type' is distinct from 'fill-blanks'
    or coalesce(p_topic_resource ->> 'id', '') !~ '^fill:[A-Za-z0-9][A-Za-z0-9._~-]{0,239}$'
  ) then
    raise exception 'Invalid writing topic resource' using errcode = '22023';
  end if;

  perform 1
  from public.writing_submission_submit_v3(
    p_id, p_student_id, p_topic, p_answer, p_word_count, p_duration_seconds
  );
  if not found then return; end if;

  if exists (
    select 1
    from public.writing_submissions submission
    where submission.id = p_id
      and submission.student_id = p_student_id
      and submission.topic_resource is not null
      and submission.topic_resource is distinct from p_topic_resource
  ) then
    raise exception 'Submission topic resource conflict' using errcode = '23505';
  end if;

  update public.writing_submissions submission
  set topic_resource = p_topic_resource
  where submission.id = p_id
    and submission.student_id = p_student_id
    and submission.topic_resource is null;

  return query
  select submission.id, submission.topic, submission.answer,
         submission.word_count, submission.duration_seconds,
         submission.submitted_at, submission.deleted_at,
         submission.topic_resource
  from public.writing_submissions submission
  where submission.id = p_id and submission.student_id = p_student_id;
end;
$$;

create or replace function public.writing_submission_get_v3(
  p_student_id uuid,
  p_id uuid
)
returns table (
  id uuid,
  topic text,
  answer text,
  word_count integer,
  duration_seconds integer,
  submitted_at timestamptz,
  topic_resource jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
  select submission.id, submission.topic, submission.answer,
         submission.word_count, submission.duration_seconds,
         submission.submitted_at, submission.topic_resource
  from public.writing_submissions submission
  where submission.student_id = p_student_id
    and submission.id = p_id
    and submission.deleted_at is null
  limit 1;
$$;

create or replace function public.writing_submission_list_v3(
  p_student_id uuid,
  p_limit integer,
  p_offset integer
)
returns table (
  id uuid,
  topic text,
  answer_preview text,
  word_count integer,
  duration_seconds integer,
  submitted_at timestamptz,
  has_published_feedback boolean,
  feedback_unread boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if p_limit not between 1 and 101 or p_offset not between 0 and 1000000 then
    raise exception 'Invalid submission page' using errcode = '22023';
  end if;
  return query
  select submission.id, submission.topic, left(submission.answer, 400),
         submission.word_count, submission.duration_seconds,
         submission.submitted_at,
         feedback.id is not null,
         feedback.id is not null and feedback.student_read_at is null
  from public.writing_submissions submission
  left join public.writing_submission_feedback feedback
    on feedback.submission_id = submission.id
   and feedback.student_id = submission.student_id
   and feedback.status = 'published'
  where submission.student_id = p_student_id
    and submission.deleted_at is null
  order by submission.submitted_at desc, submission.id desc
  limit p_limit offset p_offset;
end;
$$;

create or replace function public.writing_submission_admin_list_submissions_v3(
  p_admin_token uuid,
  p_student_id uuid,
  p_limit integer,
  p_offset integer
)
returns table (
  id uuid,
  student_id uuid,
  student_name text,
  topic text,
  answer_preview text,
  word_count integer,
  duration_seconds integer,
  submitted_at timestamptz,
  deleted_at timestamptz,
  has_published_feedback boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if public._writing_submission_admin_id(p_admin_token) is null then return; end if;
  if p_limit not between 1 and 101 or p_offset not between 0 and 1000000 then
    raise exception 'Invalid admin submission page' using errcode = '22023';
  end if;
  return query
  select submission.id, submission.student_id, student.name,
         submission.topic, left(submission.answer, 400),
         submission.word_count, submission.duration_seconds,
         submission.submitted_at, submission.deleted_at,
         feedback.id is not null
  from public.writing_submissions submission
  join public.flashcard_students student on student.id = submission.student_id
  left join public.writing_submission_feedback feedback
    on feedback.submission_id = submission.id
   and feedback.student_id = submission.student_id
   and feedback.status = 'published'
  where (p_student_id is null or submission.student_id = p_student_id)
    and student.deleted_at is null
  order by submission.submitted_at desc, submission.id desc
  limit p_limit offset p_offset;
end;
$$;

create or replace function public.writing_submission_feedback_student_open(
  p_student_id uuid,
  p_submission_id uuid
)
returns table (
  id uuid,
  submission_id uuid,
  overall_comment text,
  final_comment text,
  improved_version text,
  status text,
  version integer,
  published_at timestamptz,
  updated_at timestamptz,
  fragments jsonb,
  transcription_improved text,
  transcription_model text,
  transcription_version integer,
  topic_resource jsonb
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.writing_submission_feedback feedback
  set student_read_at = coalesce(feedback.student_read_at, clock_timestamp())
  from public.writing_submissions submission
  where feedback.submission_id = p_submission_id
    and feedback.student_id = p_student_id
    and feedback.status = 'published'
    and feedback.student_read_at is null
    and submission.id = feedback.submission_id
    and submission.student_id = p_student_id
    and submission.deleted_at is null;

  return query
  select feedback.id,
         feedback.submission_id,
         feedback.overall_comment,
         feedback.final_comment,
         feedback.improved_version,
         feedback.status,
         feedback.version,
         feedback.published_at,
         feedback.updated_at,
         coalesce((
           select jsonb_agg(
             jsonb_build_object(
               'id', fragment.id,
               'position', fragment.position,
               'originalFragment', fragment.original_fragment,
               'edmundComment', fragment.edmund_comment
             ) order by fragment.position
           )
           from public.writing_submission_feedback_fragments fragment
           where fragment.feedback_id = feedback.id
         ), '[]'::jsonb),
         coalesce(transcription.improved_version_copy, ''),
         coalesce(transcription.model_essay_copy, ''),
         coalesce(transcription.version, 0),
         submission.topic_resource
  from public.writing_submission_feedback feedback
  join public.writing_submissions submission
    on submission.id = feedback.submission_id
   and submission.student_id = feedback.student_id
  left join public.writing_submission_feedback_transcriptions transcription
    on transcription.feedback_id = feedback.id
   and transcription.student_id = feedback.student_id
  where feedback.submission_id = p_submission_id
    and feedback.student_id = p_student_id
    and feedback.status = 'published'
    and submission.deleted_at is null
  limit 1;
end;
$$;

create or replace function public.writing_submission_feedback_admin_get_v2(
  p_admin_token uuid,
  p_submission_id uuid
)
returns table (
  id uuid,
  submission_id uuid,
  overall_comment text,
  final_comment text,
  improved_version text,
  status text,
  version integer,
  published_at timestamptz,
  updated_at timestamptz,
  fragments jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
  select feedback.id,
         feedback.submission_id,
         feedback.overall_comment,
         feedback.final_comment,
         feedback.improved_version,
         feedback.status,
         feedback.version,
         feedback.published_at,
         feedback.updated_at,
         coalesce((
           select jsonb_agg(
             jsonb_build_object(
               'id', fragment.id,
               'position', fragment.position,
               'originalFragment', fragment.original_fragment,
               'edmundComment', fragment.edmund_comment
             ) order by fragment.position
           )
           from public.writing_submission_feedback_fragments fragment
           where fragment.feedback_id = feedback.id
         ), '[]'::jsonb)
  from public.writing_submission_feedback feedback
  where feedback.submission_id = p_submission_id
    and public._writing_submission_admin_id(p_admin_token) is not null
  limit 1;
$$;

drop function if exists public.writing_submission_feedback_admin_save(
  uuid, uuid, text, jsonb, text, text, integer, uuid
);

create or replace function public.writing_submission_feedback_admin_save(
  p_admin_token uuid,
  p_submission_id uuid,
  p_overall_comment text,
  p_fragments jsonb,
  p_final_comment text,
  p_improved_version text,
  p_status text,
  p_expected_version integer,
  p_expected_feedback_id uuid
)
returns table (
  id uuid,
  submission_id uuid,
  overall_comment text,
  final_comment text,
  improved_version text,
  status text,
  version integer,
  published_at timestamptz,
  updated_at timestamptz,
  fragments jsonb
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_student_id uuid;
  v_feedback_id uuid;
  v_version integer;
begin
  v_admin_id := public._writing_submission_admin_id(p_admin_token);
  if v_admin_id is null then return; end if;

  if p_submission_id is null
    or p_expected_version is null
    or p_expected_version < 0
    or (p_expected_version = 0 and p_expected_feedback_id is not null)
    or (p_expected_version > 0 and p_expected_feedback_id is null)
    or char_length(coalesce(p_overall_comment, '')) > 20000
    or octet_length(coalesce(p_overall_comment, '')) > 80000
    or regexp_replace(coalesce(p_overall_comment, ''), E'[\n\r\t]', '', 'g') ~ '[[:cntrl:]]'
    or char_length(coalesce(p_final_comment, '')) > 20000
    or octet_length(coalesce(p_final_comment, '')) > 80000
    or regexp_replace(coalesce(p_final_comment, ''), E'[\n\r\t]', '', 'g') ~ '[[:cntrl:]]'
    or char_length(coalesce(p_improved_version, '')) > 100000
    or octet_length(coalesce(p_improved_version, '')) > 400000
    or regexp_replace(coalesce(p_improved_version, ''), E'[\n\r\t]', '', 'g') ~ '[[:cntrl:]]'
    or not public._writing_submission_feedback_fragments_valid(p_fragments, p_status)
    or (
      char_length(btrim(coalesce(p_overall_comment, ''))) = 0
      and char_length(btrim(coalesce(p_final_comment, ''))) = 0
      and char_length(btrim(coalesce(p_improved_version, ''))) = 0
      and jsonb_array_length(p_fragments) = 0
    )
  then
    raise exception 'Invalid writing feedback' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(
    pg_catalog.hashtextextended('writing-submission-feedback:' || p_submission_id::text, 0)
  );

  select submission.student_id into v_student_id
  from public.writing_submissions submission
  where submission.id = p_submission_id
  limit 1 for update;
  if v_student_id is null then return; end if;

  select feedback.id, feedback.version into v_feedback_id, v_version
  from public.writing_submission_feedback feedback
  where feedback.submission_id = p_submission_id
  limit 1 for update;

  if (
    v_feedback_id is null and (p_expected_version <> 0 or p_expected_feedback_id is not null)
  ) or (
    v_feedback_id is not null and (
      p_expected_version <> v_version
      or p_expected_feedback_id is distinct from v_feedback_id
    )
  ) then
    raise exception 'Writing feedback version conflict' using errcode = 'P4090';
  end if;

  insert into public.writing_submission_feedback as feedback (
    submission_id, student_id, overall_comment, final_comment, improved_version,
    status, version, created_by_admin_id, updated_by_admin_id,
    published_at, student_read_at, updated_at
  ) values (
    p_submission_id, v_student_id, coalesce(p_overall_comment, ''),
    coalesce(p_final_comment, ''), coalesce(p_improved_version, ''),
    p_status, 1, v_admin_id, v_admin_id,
    case when p_status = 'published' then clock_timestamp() else null end,
    null, clock_timestamp()
  )
  on conflict on constraint writing_submission_feedback_submission_id_key do update
  set student_id = excluded.student_id,
      overall_comment = excluded.overall_comment,
      final_comment = excluded.final_comment,
      improved_version = excluded.improved_version,
      status = excluded.status,
      version = feedback.version + 1,
      updated_by_admin_id = excluded.updated_by_admin_id,
      published_at = case when excluded.status = 'published' then clock_timestamp() else null end,
      student_read_at = null,
      updated_at = clock_timestamp()
  returning feedback.id, feedback.version into v_feedback_id, v_version;

  delete from public.writing_submission_feedback_fragments fragment
  where fragment.feedback_id = v_feedback_id;

  insert into public.writing_submission_feedback_fragments (
    feedback_id, position, original_fragment, edmund_comment
  )
  select v_feedback_id, item.ordinality::smallint,
         item.value ->> 'originalFragment', item.value ->> 'edmundComment'
  from jsonb_array_elements(p_fragments) with ordinality item(value, ordinality);

  insert into public.writing_submission_feedback_audit (
    feedback_id, submission_id, student_id, admin_id, action, feedback_version
  ) values (
    v_feedback_id, p_submission_id, v_student_id, v_admin_id,
    case when p_status = 'published' then 'publish' else 'save_draft' end,
    v_version
  );

  return query
  select feedback.id, feedback.submission_id, feedback.overall_comment,
         feedback.final_comment, feedback.improved_version, feedback.status,
         feedback.version, feedback.published_at, feedback.updated_at,
         coalesce((
           select jsonb_agg(
             jsonb_build_object(
               'id', fragment.id,
               'position', fragment.position,
               'originalFragment', fragment.original_fragment,
               'edmundComment', fragment.edmund_comment
             ) order by fragment.position
           )
           from public.writing_submission_feedback_fragments fragment
           where fragment.feedback_id = feedback.id
         ), '[]'::jsonb)
  from public.writing_submission_feedback feedback
  where feedback.id = v_feedback_id;
end;
$$;

create or replace function public.writing_submission_feedback_student_save_transcriptions(
  p_student_id uuid,
  p_submission_id uuid,
  p_improved_version_copy text,
  p_model_essay_copy text,
  p_expected_version integer
)
returns table (
  improved_version_copy text,
  model_essay_copy text,
  version integer,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_feedback_id uuid;
  v_existing_version integer;
begin
  if p_student_id is null or p_submission_id is null
    or p_expected_version is null
    or p_expected_version not between 0 and 2147483647
    or char_length(coalesce(p_improved_version_copy, '')) > 100000
    or octet_length(coalesce(p_improved_version_copy, '')) > 400000
    or regexp_replace(coalesce(p_improved_version_copy, ''), E'[\n\r\t]', '', 'g') ~ '[[:cntrl:]]'
    or char_length(coalesce(p_model_essay_copy, '')) > 100000
    or octet_length(coalesce(p_model_essay_copy, '')) > 400000
    or regexp_replace(coalesce(p_model_essay_copy, ''), E'[\n\r\t]', '', 'g') ~ '[[:cntrl:]]'
  then
    raise exception 'Invalid transcription' using errcode = '22023';
  end if;

  select feedback.id into v_feedback_id
  from public.writing_submission_feedback feedback
  join public.writing_submissions submission
    on submission.id = feedback.submission_id
   and submission.student_id = feedback.student_id
  where feedback.submission_id = p_submission_id
    and feedback.student_id = p_student_id
    and feedback.status = 'published'
    and submission.deleted_at is null
  limit 1;
  if v_feedback_id is null then return; end if;

  perform pg_advisory_xact_lock(
    pg_catalog.hashtextextended('writing-submission-transcription:' || v_feedback_id::text, 0)
  );
  select transcription.version into v_existing_version
  from public.writing_submission_feedback_transcriptions transcription
  where transcription.feedback_id = v_feedback_id
  for update;

  if (v_existing_version is null and p_expected_version <> 0)
    or (v_existing_version is not null and p_expected_version <> v_existing_version)
  then
    raise exception 'Writing transcription version conflict' using errcode = 'P4090';
  end if;

  insert into public.writing_submission_feedback_transcriptions as transcription (
    feedback_id, student_id, improved_version_copy, model_essay_copy, version, updated_at
  ) values (
    v_feedback_id, p_student_id, coalesce(p_improved_version_copy, ''),
    coalesce(p_model_essay_copy, ''), 1, clock_timestamp()
  )
  on conflict on constraint writing_submission_feedback_transcriptions_pkey do update
  set improved_version_copy = excluded.improved_version_copy,
      model_essay_copy = excluded.model_essay_copy,
      version = transcription.version + 1,
      updated_at = clock_timestamp()
  where transcription.student_id = p_student_id;

  return query
  select transcription.improved_version_copy, transcription.model_essay_copy,
         transcription.version, transcription.updated_at
  from public.writing_submission_feedback_transcriptions transcription
  where transcription.feedback_id = v_feedback_id
    and transcription.student_id = p_student_id;
end;
$$;

revoke all on function public.writing_submission_submit_v4(uuid, uuid, text, text, integer, integer, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_get_v3(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_list_v3(uuid, integer, integer)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_admin_list_submissions_v3(uuid, uuid, integer, integer)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_feedback_student_open(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_feedback_admin_get_v2(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_feedback_admin_save(uuid, uuid, text, jsonb, text, text, text, integer, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_feedback_student_save_transcriptions(uuid, uuid, text, text, integer)
  from public, anon, authenticated, service_role;

grant execute on function public.writing_submission_submit_v4(uuid, uuid, text, text, integer, integer, jsonb)
  to service_role;
grant execute on function public.writing_submission_get_v3(uuid, uuid)
  to service_role;
grant execute on function public.writing_submission_list_v3(uuid, integer, integer)
  to service_role;
grant execute on function public.writing_submission_admin_list_submissions_v3(uuid, uuid, integer, integer)
  to service_role;
grant execute on function public.writing_submission_feedback_student_open(uuid, uuid)
  to service_role;
grant execute on function public.writing_submission_feedback_admin_get_v2(uuid, uuid)
  to service_role;
grant execute on function public.writing_submission_feedback_admin_save(uuid, uuid, text, jsonb, text, text, text, integer, uuid)
  to service_role;
grant execute on function public.writing_submission_feedback_student_save_transcriptions(uuid, uuid, text, text, integer)
  to service_role;

notify pgrst, 'reload schema';
commit;
