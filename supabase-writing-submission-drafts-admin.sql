-- Writing Submission: server-backed incomplete drafts and audited admin grammar controls.
-- Apply after:
--   1. supabase-writing-submission.sql
--   2. supabase-writing-submission-enhancements.sql
--   3. supabase-writing-submission-grammar-history.sql

begin;

create table if not exists public.writing_submission_drafts (
  id uuid primary key,
  student_id uuid not null
    references public.flashcard_students(id) on delete cascade,
  topic text not null default '',
  answer text not null default '',
  topic_resource jsonb,
  image_zoom_tenths smallint not null default 10,
  countdown_state jsonb not null default '{"status":"idle"}'::jsonb,
  stopwatch_state jsonb not null default '{"status":"idle"}'::jsonb,
  duration_seconds integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(topic) <= 4000 and octet_length(topic) <= 16000),
  check (char_length(answer) <= 100000 and octet_length(answer) <= 400000),
  check (char_length(btrim(topic)) > 0 or char_length(btrim(answer)) > 0),
  check (topic_resource is null or (
    jsonb_typeof(topic_resource) = 'object'
    and octet_length(topic_resource::text) <= 65536
  )),
  check (image_zoom_tenths in (5, 10, 20, 30, 40, 50, 70)),
  check (jsonb_typeof(countdown_state) = 'object' and octet_length(countdown_state::text) <= 4096),
  check (jsonb_typeof(stopwatch_state) = 'object' and octet_length(stopwatch_state::text) <= 2048),
  check (duration_seconds between 0 and 31536000)
);

create index if not exists writing_submission_drafts_student_updated_idx
  on public.writing_submission_drafts (student_id, updated_at desc, id desc);

alter table public.writing_submission_drafts enable row level security;
revoke all on table public.writing_submission_drafts from public, anon, authenticated, service_role;

create table if not exists public.writing_submission_admin_audit (
  id bigint generated always as identity primary key,
  admin_id uuid
    references public.writing_submission_admin_accounts(id) on delete set null,
  student_id uuid
    references public.flashcard_students(id) on delete set null,
  action text not null,
  occurrence_id uuid,
  rule_id text,
  affected_count integer not null,
  created_at timestamptz not null default now(),
  check (action in ('delete_occurrence', 'delete_rule_category')),
  check (affected_count >= 0),
  check (rule_id is null or (
    char_length(rule_id) between 1 and 120
    and octet_length(rule_id) <= 480
    and rule_id !~ '[[:cntrl:]]'
  ))
);

create index if not exists writing_submission_admin_audit_admin_history_idx
  on public.writing_submission_admin_audit (admin_id, created_at desc, id desc);

create index if not exists writing_submission_admin_audit_student_history_idx
  on public.writing_submission_admin_audit (student_id, created_at desc, id desc);

alter table public.writing_submission_admin_audit enable row level security;
revoke all on table public.writing_submission_admin_audit from public, anon, authenticated, service_role;

create or replace function public.writing_submission_save_draft(
  p_id uuid,
  p_student_id uuid,
  p_topic text,
  p_answer text,
  p_topic_resource jsonb,
  p_image_zoom_tenths smallint,
  p_countdown_state jsonb,
  p_stopwatch_state jsonb,
  p_duration_seconds integer
)
returns table (
  id uuid,
  topic text,
  answer text,
  topic_resource jsonb,
  image_zoom_tenths smallint,
  countdown_state jsonb,
  stopwatch_state jsonb,
  duration_seconds integer,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_id is null or p_student_id is null
    or char_length(coalesce(p_topic, '')) > 4000
    or octet_length(coalesce(p_topic, '')) > 16000
    or char_length(coalesce(p_answer, '')) > 100000
    or octet_length(coalesce(p_answer, '')) > 400000
    or (char_length(btrim(coalesce(p_topic, ''))) = 0 and char_length(btrim(coalesce(p_answer, ''))) = 0)
    or (p_topic_resource is not null and (
      jsonb_typeof(p_topic_resource) <> 'object'
      or octet_length(p_topic_resource::text) > 65536
    ))
    or p_image_zoom_tenths not in (5, 10, 20, 30, 40, 50, 70)
    or jsonb_typeof(coalesce(p_countdown_state, 'null'::jsonb)) <> 'object'
    or octet_length(coalesce(p_countdown_state, 'null'::jsonb)::text) > 4096
    or jsonb_typeof(coalesce(p_stopwatch_state, 'null'::jsonb)) <> 'object'
    or octet_length(coalesce(p_stopwatch_state, 'null'::jsonb)::text) > 2048
    or p_duration_seconds not between 0 and 31536000
  then
    raise exception 'Invalid writing draft' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(
    pg_catalog.hashtextextended('writing-submission-student:' || p_student_id::text, 0)
  );
  perform pg_advisory_xact_lock(
    pg_catalog.hashtextextended('writing-submission-document:' || p_id::text, 0)
  );

  if not exists (
    select 1 from public.flashcard_students student
    where student.id = p_student_id and student.deleted_at is null
  ) then
    return;
  end if;

  insert into public.writing_submission_drafts as draft (
    id, student_id, topic, answer, topic_resource, image_zoom_tenths,
    countdown_state, stopwatch_state, duration_seconds, updated_at
  ) values (
    p_id, p_student_id, p_topic, p_answer, p_topic_resource, p_image_zoom_tenths,
    p_countdown_state, p_stopwatch_state, p_duration_seconds, now()
  )
  -- The function returns a column named `id`, so `on conflict (id)` is
  -- ambiguous inside PL/pgSQL (it can resolve to either the output variable
  -- or the table column). Naming the primary-key constraint keeps the upsert
  -- unambiguous and stable if output-column names are retained.
  on conflict on constraint writing_submission_drafts_pkey do update
  set topic = excluded.topic,
      answer = excluded.answer,
      topic_resource = excluded.topic_resource,
      image_zoom_tenths = excluded.image_zoom_tenths,
      countdown_state = excluded.countdown_state,
      stopwatch_state = excluded.stopwatch_state,
      duration_seconds = excluded.duration_seconds,
      updated_at = now()
  where draft.student_id = p_student_id;

  if not found then
    raise exception 'Writing draft ownership conflict' using errcode = '42501';
  end if;

  return query
  select draft.id, draft.topic, draft.answer, draft.topic_resource,
         draft.image_zoom_tenths, draft.countdown_state, draft.stopwatch_state,
         draft.duration_seconds, draft.created_at, draft.updated_at
  from public.writing_submission_drafts draft
  where draft.id = p_id and draft.student_id = p_student_id;
end;
$$;

create or replace function public.writing_submission_list_drafts(
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
  image_zoom_tenths smallint,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if p_limit not between 1 and 101 or p_offset not between 0 and 1000000 then
    raise exception 'Invalid draft page' using errcode = '22023';
  end if;
  return query
  select draft.id, draft.topic, left(draft.answer, 400),
         public._writing_submission_word_count(draft.answer), draft.duration_seconds,
         draft.image_zoom_tenths, draft.created_at, draft.updated_at
  from public.writing_submission_drafts draft
  where draft.student_id = p_student_id
  order by draft.updated_at desc, draft.id desc
  limit p_limit offset p_offset;
end;
$$;

create or replace function public.writing_submission_get_draft(
  p_student_id uuid,
  p_id uuid
)
returns table (
  id uuid,
  topic text,
  answer text,
  topic_resource jsonb,
  image_zoom_tenths smallint,
  countdown_state jsonb,
  stopwatch_state jsonb,
  duration_seconds integer,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select draft.id, draft.topic, draft.answer, draft.topic_resource,
         draft.image_zoom_tenths, draft.countdown_state, draft.stopwatch_state,
         draft.duration_seconds, draft.created_at, draft.updated_at
  from public.writing_submission_drafts draft
  where draft.student_id = p_student_id and draft.id = p_id
  limit 1;
$$;

create or replace function public.writing_submission_delete_draft(
  p_student_id uuid,
  p_id uuid
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deleted integer;
begin
  perform pg_advisory_xact_lock(
    pg_catalog.hashtextextended('writing-submission-student:' || p_student_id::text, 0)
  );
  perform pg_advisory_xact_lock(
    pg_catalog.hashtextextended('writing-submission-document:' || p_id::text, 0)
  );
  delete from public.writing_submission_drafts draft
  where draft.student_id = p_student_id and draft.id = p_id;
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

create or replace function public.writing_submission_submit_v3(
  p_id uuid,
  p_student_id uuid,
  p_topic text,
  p_answer text,
  p_word_count integer,
  p_duration_seconds integer
)
returns table (
  id uuid,
  topic text,
  answer text,
  word_count integer,
  duration_seconds integer,
  submitted_at timestamptz,
  deleted_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(
    pg_catalog.hashtextextended('writing-submission-student:' || p_student_id::text, 0)
  );
  perform pg_advisory_xact_lock(
    pg_catalog.hashtextextended('writing-submission-document:' || p_id::text, 0)
  );

  return query
  with saved as materialized (
    select *
    from public.writing_submission_submit_v2(
      p_id, p_student_id, p_topic, p_answer, p_word_count, p_duration_seconds
    )
  ), removed_draft as materialized (
    delete from public.writing_submission_drafts draft
    where draft.id = p_id
      and draft.student_id = p_student_id
      and exists (select 1 from saved)
    returning draft.id
  )
  select saved.id, saved.topic, saved.answer, saved.word_count,
         saved.duration_seconds, saved.submitted_at, saved.deleted_at
  from saved
  left join lateral (select count(*) from removed_draft) removed on true;
end;
$$;

create or replace function public.writing_submission_admin_problem_summary(
  p_admin_token uuid,
  p_student_id uuid
)
returns table (
  rule_id text,
  title text,
  occurrence_count bigint,
  first_seen_at timestamptz,
  last_seen_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if public._writing_submission_admin_id(p_admin_token) is null then return; end if;
  return query
  select occurrence.rule_id, max(occurrence.title), count(*)::bigint,
         min(occurrence.detected_at), max(occurrence.detected_at)
  from public.writing_submission_issue_occurrences occurrence
  where occurrence.student_id = p_student_id
  group by occurrence.rule_id
  order by count(*) desc, max(occurrence.detected_at) desc, occurrence.rule_id
  limit 500;
end;
$$;

create or replace function public.writing_submission_admin_problem_occurrences(
  p_admin_token uuid,
  p_student_id uuid,
  p_rule_id text,
  p_limit integer,
  p_offset integer
)
returns table (
  id uuid,
  document_id uuid,
  submission_id uuid,
  fingerprint text,
  rule_id text,
  title text,
  message text,
  original_text text,
  suggested_text text,
  sentence_text text,
  corrected_sentence text,
  detected_at timestamptz,
  source_topic text,
  source_submitted_at timestamptz,
  source_deleted_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if public._writing_submission_admin_id(p_admin_token) is null then return; end if;
  if char_length(coalesce(p_rule_id, '')) not between 1 and 120
    or octet_length(coalesce(p_rule_id, '')) > 480
    or coalesce(p_rule_id, '') ~ '[[:cntrl:]]'
    or p_limit not between 1 and 101
    or p_offset not between 0 and 1000000
  then
    raise exception 'Invalid admin grammar history page' using errcode = '22023';
  end if;
  return query
  select occurrence.id, occurrence.document_id, occurrence.submission_id,
         occurrence.fingerprint, occurrence.rule_id, occurrence.title,
         occurrence.message, occurrence.original_text,
         occurrence.suggested_text, occurrence.sentence_text,
         occurrence.corrected_sentence, occurrence.detected_at,
         submission.topic, submission.submitted_at, submission.deleted_at
  from public.writing_submission_issue_occurrences occurrence
  left join public.writing_submissions submission
    on submission.id = occurrence.submission_id
   and submission.student_id = occurrence.student_id
  where occurrence.student_id = p_student_id
    and occurrence.rule_id = p_rule_id
  order by occurrence.detected_at desc, occurrence.id desc
  limit p_limit offset p_offset;
end;
$$;

create or replace function public.writing_submission_admin_delete_occurrence(
  p_admin_token uuid,
  p_student_id uuid,
  p_occurrence_id uuid
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_rule_id text;
  v_deleted integer;
begin
  v_admin_id := public._writing_submission_admin_id(p_admin_token);
  if v_admin_id is null then return 0; end if;

  select occurrence.rule_id into v_rule_id
  from public.writing_submission_issue_occurrences occurrence
  where occurrence.id = p_occurrence_id and occurrence.student_id = p_student_id
  for update;

  delete from public.writing_submission_issue_occurrences occurrence
  where occurrence.id = p_occurrence_id and occurrence.student_id = p_student_id;
  get diagnostics v_deleted = row_count;

  insert into public.writing_submission_admin_audit (
    admin_id, student_id, action, occurrence_id, rule_id, affected_count
  ) values (
    v_admin_id, p_student_id, 'delete_occurrence', p_occurrence_id, v_rule_id, v_deleted
  );
  return v_deleted;
end;
$$;

create or replace function public.writing_submission_admin_delete_problem_category(
  p_admin_token uuid,
  p_student_id uuid,
  p_rule_id text
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_deleted integer;
begin
  v_admin_id := public._writing_submission_admin_id(p_admin_token);
  if v_admin_id is null then return 0; end if;
  if char_length(coalesce(p_rule_id, '')) not between 1 and 120
    or octet_length(coalesce(p_rule_id, '')) > 480
    or coalesce(p_rule_id, '') ~ '[[:cntrl:]]'
  then
    raise exception 'Invalid grammar rule' using errcode = '22023';
  end if;

  delete from public.writing_submission_issue_occurrences occurrence
  where occurrence.student_id = p_student_id and occurrence.rule_id = p_rule_id;
  get diagnostics v_deleted = row_count;

  insert into public.writing_submission_admin_audit (
    admin_id, student_id, action, rule_id, affected_count
  ) values (
    v_admin_id, p_student_id, 'delete_rule_category', p_rule_id, v_deleted
  );
  return v_deleted;
end;
$$;

revoke all on function public.writing_submission_save_draft(uuid, uuid, text, text, jsonb, smallint, jsonb, jsonb, integer)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_list_drafts(uuid, integer, integer)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_get_draft(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_delete_draft(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_submit_v3(uuid, uuid, text, text, integer, integer)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_admin_problem_summary(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_admin_problem_occurrences(uuid, uuid, text, integer, integer)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_admin_delete_occurrence(uuid, uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_admin_delete_problem_category(uuid, uuid, text)
  from public, anon, authenticated, service_role;

grant execute on function public.writing_submission_save_draft(uuid, uuid, text, text, jsonb, smallint, jsonb, jsonb, integer)
  to service_role;
grant execute on function public.writing_submission_list_drafts(uuid, integer, integer)
  to service_role;
grant execute on function public.writing_submission_get_draft(uuid, uuid)
  to service_role;
grant execute on function public.writing_submission_delete_draft(uuid, uuid)
  to service_role;
grant execute on function public.writing_submission_submit_v3(uuid, uuid, text, text, integer, integer)
  to service_role;
grant execute on function public.writing_submission_admin_problem_summary(uuid, uuid)
  to service_role;
grant execute on function public.writing_submission_admin_problem_occurrences(uuid, uuid, text, integer, integer)
  to service_role;
grant execute on function public.writing_submission_admin_delete_occurrence(uuid, uuid, uuid)
  to service_role;
grant execute on function public.writing_submission_admin_delete_problem_category(uuid, uuid, text)
  to service_role;

notify pgrst, 'reload schema';
commit;
