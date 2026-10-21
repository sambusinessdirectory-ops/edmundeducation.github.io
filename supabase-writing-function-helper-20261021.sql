-- Separate student brainstorming and sentence-function draft state from the final essay.
-- Apply before the matching Writing Submission Worker release.
begin;

alter table public.writing_submissions
  add column if not exists brainstorm text not null default '';
alter table public.writing_submissions
  add constraint writing_submissions_brainstorm_length_check
  check (char_length(brainstorm) <= 20000 and octet_length(brainstorm) <= 80000);

alter table public.writing_submission_drafts
  add column if not exists brainstorm text not null default '',
  add column if not exists function_helper jsonb not null default '{}'::jsonb,
  add column if not exists draft_helper_open boolean not null default false;
alter table public.writing_submission_drafts
  drop constraint if exists writing_submission_drafts_check;
alter table public.writing_submission_drafts
  add constraint writing_submission_drafts_content_check
  check (char_length(btrim(topic)) > 0 or char_length(btrim(answer)) > 0 or char_length(btrim(brainstorm)) > 0),
  add constraint writing_submission_drafts_brainstorm_length_check
  check (char_length(brainstorm) <= 20000 and octet_length(brainstorm) <= 80000),
  add constraint writing_submission_drafts_helper_shape_check
  check (jsonb_typeof(function_helper) = 'object' and octet_length(function_helper::text) <= 450000);

create or replace function public.writing_submission_save_draft_v2(
  p_id uuid, p_student_id uuid, p_topic text, p_answer text,
  p_topic_resource jsonb, p_image_zoom_tenths smallint,
  p_countdown_state jsonb, p_stopwatch_state jsonb, p_duration_seconds integer,
  p_brainstorm text, p_function_helper jsonb, p_draft_helper_open boolean
)
returns table (
  id uuid, topic text, answer text, topic_resource jsonb,
  image_zoom_tenths smallint, countdown_state jsonb, stopwatch_state jsonb,
  duration_seconds integer, created_at timestamptz, updated_at timestamptz,
  brainstorm text, function_helper jsonb, draft_helper_open boolean
)
language plpgsql security definer set search_path = '' as $$
begin
  if p_id is null or p_student_id is null or p_brainstorm is null
    or char_length(p_brainstorm) > 20000 or octet_length(p_brainstorm) > 80000
    or p_function_helper is null or jsonb_typeof(p_function_helper) <> 'object'
    or octet_length(p_function_helper::text) > 450000
    or p_draft_helper_open is null
    or (char_length(btrim(coalesce(p_topic, ''))) = 0
      and char_length(btrim(coalesce(p_answer, ''))) = 0
      and char_length(btrim(p_brainstorm)) = 0)
  then raise exception 'Invalid writing draft helper' using errcode = '22023'; end if;

  if char_length(btrim(coalesce(p_topic, ''))) > 0
     or char_length(btrim(coalesce(p_answer, ''))) > 0 then
    perform 1 from public.writing_submission_save_draft(
      p_id, p_student_id, p_topic, p_answer, p_topic_resource,
      p_image_zoom_tenths, p_countdown_state, p_stopwatch_state, p_duration_seconds
    );
    if not found then return; end if;
  else
    if char_length(coalesce(p_topic, '')) > 4000 or octet_length(coalesce(p_topic, '')) > 16000
      or char_length(coalesce(p_answer, '')) > 100000 or octet_length(coalesce(p_answer, '')) > 400000
      or (p_topic_resource is not null and (jsonb_typeof(p_topic_resource) <> 'object' or octet_length(p_topic_resource::text) > 65536))
      or p_image_zoom_tenths not in (5, 10, 20, 30, 40, 50, 70)
      or jsonb_typeof(coalesce(p_countdown_state, 'null'::jsonb)) <> 'object'
      or octet_length(coalesce(p_countdown_state, 'null'::jsonb)::text) > 4096
      or jsonb_typeof(coalesce(p_stopwatch_state, 'null'::jsonb)) <> 'object'
      or octet_length(coalesce(p_stopwatch_state, 'null'::jsonb)::text) > 2048
      or p_duration_seconds not between 0 and 31536000
    then raise exception 'Invalid writing draft' using errcode = '22023'; end if;
    perform pg_advisory_xact_lock(pg_catalog.hashtextextended('writing-submission-student:' || p_student_id::text, 0));
    perform pg_advisory_xact_lock(pg_catalog.hashtextextended('writing-submission-document:' || p_id::text, 0));
    if not exists (select 1 from public.flashcard_students student where student.id = p_student_id and student.deleted_at is null)
    then return; end if;
    insert into public.writing_submission_drafts as draft (
      id, student_id, topic, answer, topic_resource, image_zoom_tenths,
      countdown_state, stopwatch_state, duration_seconds, brainstorm,
      function_helper, draft_helper_open, updated_at
    ) values (
      p_id, p_student_id, p_topic, p_answer, p_topic_resource, p_image_zoom_tenths,
      p_countdown_state, p_stopwatch_state, p_duration_seconds, p_brainstorm,
      p_function_helper, p_draft_helper_open, now()
    ) on conflict on constraint writing_submission_drafts_pkey do update
      set topic = excluded.topic, answer = excluded.answer,
          topic_resource = excluded.topic_resource, image_zoom_tenths = excluded.image_zoom_tenths,
          countdown_state = excluded.countdown_state, stopwatch_state = excluded.stopwatch_state,
          duration_seconds = excluded.duration_seconds, brainstorm = excluded.brainstorm,
          function_helper = excluded.function_helper, draft_helper_open = excluded.draft_helper_open,
          updated_at = now()
      where draft.student_id = p_student_id;
    if not found then raise exception 'Writing draft ownership conflict' using errcode = '42501'; end if;
  end if;

  update public.writing_submission_drafts draft
  set brainstorm = p_brainstorm, function_helper = p_function_helper,
      draft_helper_open = p_draft_helper_open
  where draft.id = p_id and draft.student_id = p_student_id;
  return query
  select draft.id, draft.topic, draft.answer, draft.topic_resource,
         draft.image_zoom_tenths, draft.countdown_state, draft.stopwatch_state,
         draft.duration_seconds, draft.created_at, draft.updated_at,
         draft.brainstorm, draft.function_helper, draft.draft_helper_open
  from public.writing_submission_drafts draft
  where draft.id = p_id and draft.student_id = p_student_id;
end;
$$;

create or replace function public.writing_submission_draft_planning_get(p_student_id uuid, p_id uuid)
returns table (brainstorm text, function_helper jsonb, draft_helper_open boolean)
language sql stable security definer set search_path = '' as $$
  select draft.brainstorm, draft.function_helper, draft.draft_helper_open
  from public.writing_submission_drafts draft
  where draft.id = p_id and draft.student_id = p_student_id limit 1;
$$;

create or replace function public.writing_submission_submit_v5(
  p_id uuid, p_student_id uuid, p_topic text, p_answer text,
  p_word_count integer, p_duration_seconds integer, p_topic_resource jsonb,
  p_brainstorm text
)
returns table (
  id uuid, topic text, answer text, word_count integer,
  duration_seconds integer, submitted_at timestamptz, deleted_at timestamptz,
  topic_resource jsonb, brainstorm text
)
language plpgsql security definer set search_path = '' as $$
begin
  if p_brainstorm is null or char_length(p_brainstorm) > 20000 or octet_length(p_brainstorm) > 80000
  then raise exception 'Invalid brainstorm' using errcode = '22023'; end if;
  perform 1 from public.writing_submission_submit_v4(
    p_id, p_student_id, p_topic, p_answer, p_word_count, p_duration_seconds, p_topic_resource
  );
  if not found then return; end if;
  if exists (
    select 1 from public.writing_submissions submission
    where submission.id = p_id and submission.student_id = p_student_id
      and submission.brainstorm <> '' and submission.brainstorm is distinct from p_brainstorm
  ) then raise exception 'Submission brainstorm conflict' using errcode = '23505'; end if;
  update public.writing_submissions submission
  set brainstorm = p_brainstorm
  where submission.id = p_id and submission.student_id = p_student_id
    and submission.brainstorm = '';
  return query
  select submission.id, submission.topic, submission.answer, submission.word_count,
         submission.duration_seconds, submission.submitted_at, submission.deleted_at,
         submission.topic_resource, submission.brainstorm
  from public.writing_submissions submission
  where submission.id = p_id and submission.student_id = p_student_id;
end;
$$;

create or replace function public.writing_submission_brainstorm_get(p_student_id uuid, p_id uuid)
returns text language sql stable security definer set search_path = '' as $$
  select submission.brainstorm from public.writing_submissions submission
  where submission.id = p_id and submission.student_id = p_student_id
    and submission.deleted_at is null limit 1;
$$;

create or replace function public.writing_submission_admin_brainstorm_get(p_admin_token uuid, p_id uuid)
returns text language sql stable security definer set search_path = '' as $$
  select submission.brainstorm from public.writing_submissions submission
  where submission.id = p_id and public._writing_submission_admin_id(p_admin_token) is not null
  limit 1;
$$;

revoke all on function public.writing_submission_save_draft_v2(uuid,uuid,text,text,jsonb,smallint,jsonb,jsonb,integer,text,jsonb,boolean) from public,anon,authenticated;
revoke all on function public.writing_submission_draft_planning_get(uuid,uuid) from public,anon,authenticated;
revoke all on function public.writing_submission_submit_v5(uuid,uuid,text,text,integer,integer,jsonb,text) from public,anon,authenticated;
revoke all on function public.writing_submission_brainstorm_get(uuid,uuid) from public,anon,authenticated;
revoke all on function public.writing_submission_admin_brainstorm_get(uuid,uuid) from public,anon,authenticated;
grant execute on function public.writing_submission_save_draft_v2(uuid,uuid,text,text,jsonb,smallint,jsonb,jsonb,integer,text,jsonb,boolean) to service_role;
grant execute on function public.writing_submission_draft_planning_get(uuid,uuid) to service_role;
grant execute on function public.writing_submission_submit_v5(uuid,uuid,text,text,integer,integer,jsonb,text) to service_role;
grant execute on function public.writing_submission_brainstorm_get(uuid,uuid) to service_role;
grant execute on function public.writing_submission_admin_brainstorm_get(uuid,uuid) to service_role;
commit;
