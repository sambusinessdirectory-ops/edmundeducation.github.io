-- Writing Submission detailed grammar history and administrator review queue.
-- Apply after supabase-writing-submission.sql and
-- supabase-writing-submission-enhancements.sql.
--
-- Existing aggregate-only rows remain valid. New rows store the complete
-- corrected sentence, and narrowly scoped RPCs expose owned history to the
-- student or the dedicated Writing Submission administrator only.

begin;

alter table public.writing_submission_issue_occurrences
  add column if not exists corrected_sentence text not null default '';

alter table public.writing_submission_issue_occurrences
  add column if not exists needs_explanation_review boolean
    generated always as (
      pg_catalog.strpos(message, '；請留意這部分的文法結構。') > 0
    ) stored;

do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.writing_submission_issue_occurrences'::regclass
      and conname = 'writing_submission_issues_corrected_sentence_check'
  ) then
    alter table public.writing_submission_issue_occurrences
      add constraint writing_submission_issues_corrected_sentence_check
      check (
        char_length(corrected_sentence) <= 10000
        and octet_length(corrected_sentence) <= 40000
      );
  end if;
end;
$$;

create index if not exists writing_submission_issues_review_queue_idx
  on public.writing_submission_issue_occurrences (detected_at desc, id desc)
  where needs_explanation_review;

-- Accept the legacy nine-field browser payload during a rolling release, as
-- well as the new payload with correctedSentence. The replacement batch RPC
-- below always stores an explicit value when the new field is present.
create or replace function public._writing_submission_occurrence_batch_valid(
  p_document_id uuid,
  p_occurrences jsonb
)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  v_item jsonb;
  v_detected_at timestamptz;
  v_count integer;
begin
  if p_document_id is null
    or p_occurrences is null
    or jsonb_typeof(p_occurrences) <> 'array'
    or jsonb_array_length(p_occurrences) < 1
    or jsonb_array_length(p_occurrences) > 50
    or octet_length(p_occurrences::text) > 524288
  then
    return false;
  end if;

  for v_item in select value from jsonb_array_elements(p_occurrences)
  loop
    if jsonb_typeof(v_item) <> 'object'
      or (select count(*) from jsonb_object_keys(v_item)) not between 9 and 10
      or exists (
        select 1
        from jsonb_object_keys(v_item) key_row(key_name)
        where key_name not in (
          'id', 'fingerprint', 'ruleId', 'title', 'message',
          'originalText', 'suggestedText', 'sentenceText',
          'correctedSentence', 'detectedAt'
        )
      )
      or not (
        v_item ? 'id' and v_item ? 'fingerprint' and v_item ? 'ruleId'
        and v_item ? 'title' and v_item ? 'message'
        and v_item ? 'originalText' and v_item ? 'suggestedText'
        and v_item ? 'sentenceText' and v_item ? 'detectedAt'
      )
      or jsonb_typeof(v_item -> 'id') <> 'string'
      or coalesce(v_item ->> 'id', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      or jsonb_typeof(v_item -> 'fingerprint') <> 'string'
      or coalesce(v_item ->> 'fingerprint', '') !~ '^[0-9a-f]{64}$'
      or jsonb_typeof(v_item -> 'ruleId') <> 'string'
      or char_length(coalesce(v_item ->> 'ruleId', '')) not between 1 and 120
      or octet_length(coalesce(v_item ->> 'ruleId', '')) > 480
      or coalesce(v_item ->> 'ruleId', '') ~ '[[:cntrl:]]'
      or jsonb_typeof(v_item -> 'title') <> 'string'
      or char_length(coalesce(v_item ->> 'title', '')) not between 1 and 200
      or octet_length(coalesce(v_item ->> 'title', '')) > 800
      or coalesce(v_item ->> 'title', '') ~ '[[:cntrl:]]'
      or jsonb_typeof(v_item -> 'message') <> 'string'
      or char_length(coalesce(v_item ->> 'message', '')) not between 1 and 2000
      or octet_length(coalesce(v_item ->> 'message', '')) > 8000
      or jsonb_typeof(v_item -> 'originalText') <> 'string'
      or char_length(coalesce(v_item ->> 'originalText', '')) > 2000
      or octet_length(coalesce(v_item ->> 'originalText', '')) > 8000
      or jsonb_typeof(v_item -> 'suggestedText') <> 'string'
      or char_length(coalesce(v_item ->> 'suggestedText', '')) > 2000
      or octet_length(coalesce(v_item ->> 'suggestedText', '')) > 8000
      or (
        coalesce(v_item ->> 'originalText', '') = ''
        and coalesce(v_item ->> 'suggestedText', '') = ''
      )
      or jsonb_typeof(v_item -> 'sentenceText') <> 'string'
      or char_length(coalesce(v_item ->> 'sentenceText', '')) not between 1 and 10000
      or octet_length(coalesce(v_item ->> 'sentenceText', '')) > 40000
      or (
        v_item ? 'correctedSentence'
        and (
          jsonb_typeof(v_item -> 'correctedSentence') <> 'string'
          or char_length(coalesce(v_item ->> 'correctedSentence', '')) not between 1 and 10000
          or octet_length(coalesce(v_item ->> 'correctedSentence', '')) > 40000
        )
      )
      or jsonb_typeof(v_item -> 'detectedAt') <> 'string'
      or char_length(coalesce(v_item ->> 'detectedAt', '')) not between 20 and 40
    then
      return false;
    end if;

    begin
      v_detected_at := (v_item ->> 'detectedAt')::timestamptz;
    exception when others then
      return false;
    end;
    if v_detected_at < timestamptz '2020-01-01 00:00:00+00'
      or v_detected_at > clock_timestamp() + interval '5 minutes'
    then
      return false;
    end if;
  end loop;

  select count(*) into v_count from jsonb_array_elements(p_occurrences);
  if v_count <> (
    select count(distinct value ->> 'id')
    from jsonb_array_elements(p_occurrences)
  ) or v_count <> (
    select count(distinct value ->> 'fingerprint')
    from jsonb_array_elements(p_occurrences)
  ) then
    return false;
  end if;

  return true;
end;
$$;

create or replace function public.writing_submission_record_issue_batch(
  p_student_id uuid,
  p_document_id uuid,
  p_occurrences jsonb
)
returns table (accepted_count integer, inserted_count integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_submission_id uuid;
  v_current_count bigint;
  v_new_count bigint;
  v_inserted integer := 0;
begin
  if not exists (
    select 1 from public.flashcard_students student
    where student.id = p_student_id and student.deleted_at is null
  ) then
    raise exception 'Active student not found' using errcode = '23503';
  end if;
  if not public._writing_submission_occurrence_batch_valid(p_document_id, p_occurrences) then
    raise exception 'Invalid grammar occurrence batch' using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('writing-submission-student:' || p_student_id::text, 0)
  );
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('writing-submission-document:' || p_document_id::text, 0)
  );

  select submission.id into v_submission_id
  from public.writing_submissions submission
  where submission.id = p_document_id and submission.student_id = p_student_id
  limit 1;

  select count(*) into v_current_count
  from public.writing_submission_issue_occurrences occurrence
  where occurrence.student_id = p_student_id;

  select count(*) into v_new_count
  from jsonb_array_elements(p_occurrences) item
  where not exists (
    select 1
    from public.writing_submission_issue_occurrences occurrence
    where occurrence.student_id = p_student_id
      and occurrence.document_id = p_document_id
      and occurrence.fingerprint = item ->> 'fingerprint'
  );

  if v_current_count + v_new_count > 50000 then
    raise exception 'Grammar history limit reached' using errcode = '54000';
  end if;

  insert into public.writing_submission_issue_occurrences (
    id, student_id, document_id, submission_id, fingerprint, rule_id,
    title, message, original_text, suggested_text, sentence_text,
    corrected_sentence, detected_at, created_at
  )
  select
    (item ->> 'id')::uuid,
    p_student_id,
    p_document_id,
    v_submission_id,
    item ->> 'fingerprint',
    item ->> 'ruleId',
    item ->> 'title',
    item ->> 'message',
    item ->> 'originalText',
    item ->> 'suggestedText',
    item ->> 'sentenceText',
    coalesce(item ->> 'correctedSentence', ''),
    (item ->> 'detectedAt')::timestamptz,
    now()
  from jsonb_array_elements(p_occurrences) item
  on conflict do nothing;

  get diagnostics v_inserted = row_count;

  return query
  select jsonb_array_length(p_occurrences), v_inserted;
end;
$$;

create or replace function public.writing_submission_problem_occurrences(
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
  if char_length(coalesce(p_rule_id, '')) not between 1 and 120
    or octet_length(coalesce(p_rule_id, '')) > 480
    or coalesce(p_rule_id, '') ~ '[[:cntrl:]]'
    or p_limit not between 1 and 101
    or p_offset not between 0 and 1000000
  then
    raise exception 'Invalid grammar history page' using errcode = '22023';
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

create or replace function public.writing_submission_admin_explanation_review_queue(
  p_admin_token uuid,
  p_limit integer,
  p_offset integer
)
returns table (
  id uuid,
  student_id uuid,
  student_name text,
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
  if p_limit not between 1 and 101 or p_offset not between 0 and 1000000 then
    raise exception 'Invalid explanation review page' using errcode = '22023';
  end if;

  return query
  select occurrence.id, occurrence.student_id, student.name,
         occurrence.document_id, occurrence.submission_id,
         occurrence.fingerprint, occurrence.rule_id, occurrence.title,
         occurrence.message, occurrence.original_text,
         occurrence.suggested_text, occurrence.sentence_text,
         occurrence.corrected_sentence, occurrence.detected_at,
         submission.topic, submission.submitted_at, submission.deleted_at
  from public.writing_submission_issue_occurrences occurrence
  join public.flashcard_students student on student.id = occurrence.student_id
  left join public.writing_submissions submission
    on submission.id = occurrence.submission_id
   and submission.student_id = occurrence.student_id
  where occurrence.needs_explanation_review
    and student.deleted_at is null
  order by occurrence.detected_at desc, occurrence.id desc
  limit p_limit offset p_offset;
end;
$$;

revoke all on function public._writing_submission_occurrence_batch_valid(uuid, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_record_issue_batch(uuid, uuid, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_problem_occurrences(uuid, text, integer, integer)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_admin_explanation_review_queue(uuid, integer, integer)
  from public, anon, authenticated, service_role;

grant execute on function public.writing_submission_record_issue_batch(uuid, uuid, jsonb)
  to service_role;
grant execute on function public.writing_submission_problem_occurrences(uuid, text, integer, integer)
  to service_role;
grant execute on function public.writing_submission_admin_explanation_review_queue(uuid, integer, integer)
  to service_role;

notify pgrst, 'reload schema';

commit;
