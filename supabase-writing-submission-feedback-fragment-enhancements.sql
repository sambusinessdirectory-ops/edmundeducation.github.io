-- Writing Submission: suggested rewrites and safe inline formatting for
-- sentence-level feedback fragments.
-- Apply after supabase-writing-submission-feedback-revision.sql.

begin;

do $$
begin
  if to_regclass('public.writing_submission_feedback_fragments') is null then
    raise exception 'Missing dependency: public.writing_submission_feedback_fragments';
  end if;
  if to_regprocedure('public._writing_submission_feedback_fragments_valid(jsonb,text)') is null then
    raise exception 'Missing dependency: public._writing_submission_feedback_fragments_valid(jsonb,text)';
  end if;
  if to_regprocedure('public.writing_submission_feedback_student_open(uuid,uuid)') is null then
    raise exception 'Missing dependency: public.writing_submission_feedback_student_open(uuid,uuid)';
  end if;
  if to_regprocedure('public.writing_submission_feedback_admin_get_v2(uuid,uuid)') is null then
    raise exception 'Missing dependency: public.writing_submission_feedback_admin_get_v2(uuid,uuid)';
  end if;
  if to_regprocedure(
    'public.writing_submission_feedback_admin_save(uuid,uuid,text,jsonb,text,text,text,integer,uuid)'
  ) is null then
    raise exception 'Missing dependency: public.writing_submission_feedback_admin_save';
  end if;
end;
$$;

alter table public.writing_submission_feedback_fragments
  add column if not exists suggested_writing text not null default '';
alter table public.writing_submission_feedback_fragments
  add column if not exists original_formatting jsonb not null default '[]'::jsonb;
alter table public.writing_submission_feedback_fragments
  add column if not exists comment_formatting jsonb not null default '[]'::jsonb;
alter table public.writing_submission_feedback_fragments
  add column if not exists suggestion_formatting jsonb not null default '[]'::jsonb;

create or replace function public._writing_submission_feedback_formatting_valid(
  p_formatting jsonb
)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_run jsonb;
  v_start_text text;
  v_end_text text;
  v_start integer;
  v_end integer;
begin
  if p_formatting is null or jsonb_typeof(p_formatting) <> 'array' then
    return false;
  end if;
  if jsonb_array_length(p_formatting) > 500
    or octet_length(p_formatting::text) > 131072
  then
    return false;
  end if;

  for v_run in select value from jsonb_array_elements(p_formatting)
  loop
    if jsonb_typeof(v_run) <> 'object' then
      return false;
    end if;
    if (select count(*) from jsonb_object_keys(v_run)) <> 4
      or exists (
        select 1
        from jsonb_object_keys(v_run) key_row(key_name)
        where key_name not in ('start', 'end', 'bold', 'highlight')
      )
      or jsonb_typeof(v_run -> 'start') is distinct from 'number'
      or jsonb_typeof(v_run -> 'end') is distinct from 'number'
      or jsonb_typeof(v_run -> 'bold') is distinct from 'boolean'
      or jsonb_typeof(v_run -> 'highlight') is distinct from 'string'
      or coalesce(v_run ->> 'highlight', '') not in (
        '', 'yellow', 'orange', 'blue', 'green'
      )
    then
      return false;
    end if;

    v_start_text := coalesce(v_run ->> 'start', '');
    v_end_text := coalesce(v_run ->> 'end', '');
    if v_start_text !~ '^(0|[1-9][0-9]{0,5})$'
      or v_end_text !~ '^[1-9][0-9]{0,5}$'
    then
      return false;
    end if;

    v_start := v_start_text::integer;
    v_end := v_end_text::integer;
    if v_start < 0 or v_end <= v_start or v_end > 200000 then
      return false;
    end if;
  end loop;

  return true;
end;
$$;

alter table public.writing_submission_feedback_fragments
  drop constraint if exists writing_submission_feedback_fragments_suggested_size;
alter table public.writing_submission_feedback_fragments
  add constraint writing_submission_feedback_fragments_suggested_size check (
    char_length(suggested_writing) <= 20000
    and octet_length(suggested_writing) <= 80000
    and regexp_replace(suggested_writing, E'[\n\r\t]', '', 'g') !~ '[[:cntrl:]]'
  );

alter table public.writing_submission_feedback_fragments
  drop constraint if exists writing_submission_feedback_fragments_original_format_valid;
alter table public.writing_submission_feedback_fragments
  add constraint writing_submission_feedback_fragments_original_format_valid check (
    public._writing_submission_feedback_formatting_valid(original_formatting)
  );

alter table public.writing_submission_feedback_fragments
  drop constraint if exists writing_submission_feedback_fragments_comment_format_valid;
alter table public.writing_submission_feedback_fragments
  add constraint writing_submission_feedback_fragments_comment_format_valid check (
    public._writing_submission_feedback_formatting_valid(comment_formatting)
  );

alter table public.writing_submission_feedback_fragments
  drop constraint if exists writing_submission_feedback_fragments_suggestion_format_valid;
alter table public.writing_submission_feedback_fragments
  add constraint writing_submission_feedback_fragments_suggestion_format_valid check (
    public._writing_submission_feedback_formatting_valid(suggestion_formatting)
  );

create or replace function public._writing_submission_feedback_fragments_valid(
  p_fragments jsonb,
  p_status text
)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_item jsonb;
begin
  if p_status not in ('draft', 'published')
    or p_fragments is null
    or jsonb_typeof(p_fragments) <> 'array'
  then
    return false;
  end if;
  if jsonb_array_length(p_fragments) > 200
    or octet_length(p_fragments::text) > 524288
  then
    return false;
  end if;

  for v_item in select value from jsonb_array_elements(p_fragments)
  loop
    if jsonb_typeof(v_item) <> 'object' then
      return false;
    end if;
    if (select count(*) from jsonb_object_keys(v_item)) <> 6
      or exists (
        select 1
        from jsonb_object_keys(v_item) key_row(key_name)
        where key_name not in (
          'originalFragment',
          'edmundComment',
          'suggestedWriting',
          'originalFormatting',
          'commentFormatting',
          'suggestionFormatting'
        )
      )
      or jsonb_typeof(v_item -> 'originalFragment') is distinct from 'string'
      or jsonb_typeof(v_item -> 'edmundComment') is distinct from 'string'
      or jsonb_typeof(v_item -> 'suggestedWriting') is distinct from 'string'
      or char_length(coalesce(v_item ->> 'originalFragment', '')) > 10000
      or octet_length(coalesce(v_item ->> 'originalFragment', '')) > 40000
      or regexp_replace(
        coalesce(v_item ->> 'originalFragment', ''),
        E'[\n\r\t]',
        '',
        'g'
      ) ~ '[[:cntrl:]]'
      or char_length(coalesce(v_item ->> 'edmundComment', '')) > 20000
      or octet_length(coalesce(v_item ->> 'edmundComment', '')) > 80000
      or regexp_replace(
        coalesce(v_item ->> 'edmundComment', ''),
        E'[\n\r\t]',
        '',
        'g'
      ) ~ '[[:cntrl:]]'
      or char_length(coalesce(v_item ->> 'suggestedWriting', '')) > 20000
      or octet_length(coalesce(v_item ->> 'suggestedWriting', '')) > 80000
      or regexp_replace(
        coalesce(v_item ->> 'suggestedWriting', ''),
        E'[\n\r\t]',
        '',
        'g'
      ) ~ '[[:cntrl:]]'
      or not public._writing_submission_feedback_formatting_valid(
        v_item -> 'originalFormatting'
      )
      or not public._writing_submission_feedback_formatting_valid(
        v_item -> 'commentFormatting'
      )
      or not public._writing_submission_feedback_formatting_valid(
        v_item -> 'suggestionFormatting'
      )
      or (
        char_length(btrim(coalesce(v_item ->> 'originalFragment', ''))) = 0
        and char_length(btrim(coalesce(v_item ->> 'edmundComment', ''))) = 0
        and char_length(btrim(coalesce(v_item ->> 'suggestedWriting', ''))) = 0
      )
      or (
        p_status = 'published'
        and (
          char_length(btrim(coalesce(v_item ->> 'originalFragment', ''))) = 0
          or char_length(btrim(coalesce(v_item ->> 'edmundComment', ''))) = 0
        )
      )
    then
      return false;
    end if;
  end loop;

  return true;
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
               'edmundComment', fragment.edmund_comment,
               'suggestedWriting', fragment.suggested_writing,
               'originalFormatting', fragment.original_formatting,
               'commentFormatting', fragment.comment_formatting,
               'suggestionFormatting', fragment.suggestion_formatting
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
               'edmundComment', fragment.edmund_comment,
               'suggestedWriting', fragment.suggested_writing,
               'originalFormatting', fragment.original_formatting,
               'commentFormatting', fragment.comment_formatting,
               'suggestionFormatting', fragment.suggestion_formatting
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
    feedback_id,
    position,
    original_fragment,
    edmund_comment,
    suggested_writing,
    original_formatting,
    comment_formatting,
    suggestion_formatting
  )
  select v_feedback_id,
         item.ordinality::smallint,
         item.value ->> 'originalFragment',
         item.value ->> 'edmundComment',
         item.value ->> 'suggestedWriting',
         item.value -> 'originalFormatting',
         item.value -> 'commentFormatting',
         item.value -> 'suggestionFormatting'
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
               'edmundComment', fragment.edmund_comment,
               'suggestedWriting', fragment.suggested_writing,
               'originalFormatting', fragment.original_formatting,
               'commentFormatting', fragment.comment_formatting,
               'suggestionFormatting', fragment.suggestion_formatting
             ) order by fragment.position
           )
           from public.writing_submission_feedback_fragments fragment
           where fragment.feedback_id = feedback.id
         ), '[]'::jsonb)
  from public.writing_submission_feedback feedback
  where feedback.id = v_feedback_id;
end;
$$;

revoke all on function public._writing_submission_feedback_formatting_valid(jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public._writing_submission_feedback_fragments_valid(jsonb, text)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_feedback_student_open(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_feedback_admin_get_v2(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_feedback_admin_save(
  uuid, uuid, text, jsonb, text, text, text, integer, uuid
)
  from public, anon, authenticated, service_role;

grant execute on function public._writing_submission_feedback_formatting_valid(jsonb)
  to service_role;
grant execute on function public._writing_submission_feedback_fragments_valid(jsonb, text)
  to service_role;
grant execute on function public.writing_submission_feedback_student_open(uuid, uuid)
  to service_role;
grant execute on function public.writing_submission_feedback_admin_get_v2(uuid, uuid)
  to service_role;
grant execute on function public.writing_submission_feedback_admin_save(
  uuid, uuid, text, jsonb, text, text, text, integer, uuid
)
  to service_role;

notify pgrst, 'reload schema';
commit;
