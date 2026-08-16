-- Writing Submission: structured sentence/rhetorical feedback parts and
-- expanded safe inline formatting (italic, strikethrough, and red).
-- Apply after supabase-writing-submission-feedback-learning-tools.sql.

begin;

do $$
begin
  if to_regclass('public.writing_submission_feedback') is null then
    raise exception 'Missing dependency: public.writing_submission_feedback';
  end if;
  if to_regclass('public.writing_submission_feedback_fragments') is null then
    raise exception 'Missing dependency: public.writing_submission_feedback_fragments';
  end if;
  if to_regprocedure('public._writing_submission_feedback_formatting_valid(jsonb)') is null then
    raise exception 'Missing dependency: public._writing_submission_feedback_formatting_valid(jsonb)';
  end if;
  if to_regprocedure('public._writing_submission_utf16_length(text)') is null then
    raise exception 'Missing dependency: public._writing_submission_utf16_length(text)';
  end if;
  if to_regprocedure('public._writing_submission_feedback_fragments_v2_valid(jsonb,text)') is null then
    raise exception 'Missing dependency: public._writing_submission_feedback_fragments_v2_valid';
  end if;
  if to_regprocedure('public._writing_submission_admin_id(uuid)') is null then
    raise exception 'Missing dependency: public._writing_submission_admin_id(uuid)';
  end if;
end;
$$;

-- Preserve the legacy four-key run shape while accepting the new six-key
-- shape. This keeps every stored feedback document valid during a rolling
-- database/Worker/frontend deployment.
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
  v_key_count integer;
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
    select count(*) into v_key_count from jsonb_object_keys(v_run);
    if v_key_count not in (4, 6)
      or exists (
        select 1
        from jsonb_object_keys(v_run) key_row(key_name)
        where key_name not in (
          'start', 'end', 'bold', 'italic', 'strikethrough', 'highlight'
        )
      )
      or jsonb_typeof(v_run -> 'start') is distinct from 'number'
      or jsonb_typeof(v_run -> 'end') is distinct from 'number'
      or jsonb_typeof(v_run -> 'bold') is distinct from 'boolean'
      or jsonb_typeof(v_run -> 'highlight') is distinct from 'string'
      or (
        v_key_count = 6
        and (
          jsonb_typeof(v_run -> 'italic') is distinct from 'boolean'
          or jsonb_typeof(v_run -> 'strikethrough') is distinct from 'boolean'
        )
      )
      or (
        v_key_count = 4
        and (v_run ? 'italic' or v_run ? 'strikethrough')
      )
      or coalesce(v_run ->> 'highlight', '') not in (
        '', 'yellow', 'orange', 'blue', 'green', 'red'
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
exception
  when invalid_text_representation or numeric_value_out_of_range then
    return false;
end;
$$;

create or replace function public._writing_submission_feedback_rich_text_value_valid(
  p_value jsonb
)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_text text;
begin
  if p_value is null or jsonb_typeof(p_value) <> 'object' then
    return false;
  end if;
  if (select count(*) from jsonb_object_keys(p_value)) <> 2
    or exists (
      select 1
      from jsonb_object_keys(p_value) key_row(key_name)
      where key_name not in ('text', 'formatting')
    )
    or jsonb_typeof(p_value -> 'text') is distinct from 'string'
  then
    return false;
  end if;

  v_text := coalesce(p_value ->> 'text', '');
  if char_length(v_text) > 20000
    or octet_length(v_text) > 80000
    or regexp_replace(v_text, E'[\n\r\t]', '', 'g') ~ '[[:cntrl:]]'
    or not public._writing_submission_feedback_formatting_valid(p_value -> 'formatting')
  then
    return false;
  end if;
  if exists (
    select 1
    from jsonb_array_elements(p_value -> 'formatting') run
    where (run ->> 'end')::integer
      > public._writing_submission_utf16_length(v_text)
  ) then
    return false;
  end if;

  return true;
exception
  when invalid_text_representation or numeric_value_out_of_range then
    return false;
end;
$$;

create or replace function public._writing_submission_feedback_parts_valid(
  p_parts jsonb
)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_item jsonb;
begin
  if p_parts is null or jsonb_typeof(p_parts) <> 'array' then
    return false;
  end if;
  if jsonb_array_length(p_parts) > 100
    or octet_length(p_parts::text) > 1048576
  then
    return false;
  end if;

  for v_item in select value from jsonb_array_elements(p_parts)
  loop
    if jsonb_typeof(v_item) <> 'object' then
      return false;
    end if;
    if (select count(*) from jsonb_object_keys(v_item)) <> 3
      or exists (
        select 1
        from jsonb_object_keys(v_item) key_row(key_name)
        where key_name not in ('originalSentence', 'enhancement', 'benefit')
      )
      or not public._writing_submission_feedback_rich_text_value_valid(
        v_item -> 'originalSentence'
      )
      or not public._writing_submission_feedback_rich_text_value_valid(
        v_item -> 'enhancement'
      )
      or not public._writing_submission_feedback_rich_text_value_valid(
        v_item -> 'benefit'
      )
      or (
        char_length(btrim(coalesce(v_item #>> '{originalSentence,text}', ''))) = 0
        and char_length(btrim(coalesce(v_item #>> '{enhancement,text}', ''))) = 0
        and char_length(btrim(coalesce(v_item #>> '{benefit,text}', ''))) = 0
      )
    then
      return false;
    end if;
  end loop;

  return true;
end;
$$;

alter table public.writing_submission_feedback
  add column if not exists sentence_structure_parts jsonb not null default '[]'::jsonb;
alter table public.writing_submission_feedback
  add column if not exists rhetorical_parts jsonb not null default '[]'::jsonb;

alter table public.writing_submission_feedback
  drop constraint if exists writing_submission_feedback_sentence_parts_valid;
alter table public.writing_submission_feedback
  add constraint writing_submission_feedback_sentence_parts_valid check (
    public._writing_submission_feedback_parts_valid(sentence_structure_parts)
  );
alter table public.writing_submission_feedback
  drop constraint if exists writing_submission_feedback_rhetorical_parts_valid;
alter table public.writing_submission_feedback
  add constraint writing_submission_feedback_rhetorical_parts_valid check (
    public._writing_submission_feedback_parts_valid(rhetorical_parts)
  );

create or replace function public.writing_submission_feedback_student_open_v3(
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
  grammar_points jsonb,
  sentence_structure_methods jsonb,
  sentence_structure_links jsonb,
  sentence_structure_parts jsonb,
  rhetorical_parts jsonb,
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
         feedback.grammar_points,
         feedback.sentence_structure_methods,
         feedback.sentence_structure_links,
         feedback.sentence_structure_parts,
         feedback.rhetorical_parts,
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
               'suggestionFormatting', fragment.suggestion_formatting,
               'suggestionCopyText', coalesce(fragment_copy.copy_text, ''),
               'suggestionCopyVersion', coalesce(fragment_copy.version, 0),
               'suggestionCopyUpdatedAt', fragment_copy.updated_at,
               'bookmarked', coalesce(bookmark.bookmarked, false),
               'bookmarkVersion', coalesce(bookmark.version, 0)
             ) order by fragment.position
           )
           from public.writing_submission_feedback_fragments fragment
           left join public.writing_submission_feedback_fragment_copies fragment_copy
             on fragment_copy.fragment_id = fragment.id
            and fragment_copy.student_id = p_student_id
           left join public.writing_submission_feedback_fragment_bookmarks bookmark
             on bookmark.fragment_id = fragment.id
            and bookmark.student_id = p_student_id
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

create or replace function public.writing_submission_feedback_admin_get_v4(
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
  grammar_points jsonb,
  sentence_structure_methods jsonb,
  sentence_structure_links jsonb,
  sentence_structure_parts jsonb,
  rhetorical_parts jsonb,
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
         feedback.grammar_points,
         feedback.sentence_structure_methods,
         feedback.sentence_structure_links,
         feedback.sentence_structure_parts,
         feedback.rhetorical_parts,
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

create or replace function public.writing_submission_feedback_admin_save_v3(
  p_admin_token uuid,
  p_submission_id uuid,
  p_overall_comment text,
  p_fragments jsonb,
  p_final_comment text,
  p_improved_version text,
  p_grammar_points jsonb,
  p_sentence_structure_methods jsonb,
  p_sentence_structure_links jsonb,
  p_sentence_structure_parts jsonb,
  p_rhetorical_parts jsonb,
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
  grammar_points jsonb,
  sentence_structure_methods jsonb,
  sentence_structure_links jsonb,
  sentence_structure_parts jsonb,
  rhetorical_parts jsonb,
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
  v_current_grammar_points jsonb;
  v_current_sentence_methods jsonb;
  v_current_sentence_links jsonb;
  v_current_sentence_parts jsonb;
  v_current_rhetorical_parts jsonb;
  v_grammar_points jsonb;
  v_sentence_methods jsonb;
  v_sentence_links jsonb;
  v_sentence_parts jsonb;
  v_rhetorical_parts jsonb;
  v_item jsonb;
  v_position integer;
  v_fragment_id uuid;
  v_requested_ids uuid[] := array[]::uuid[];
  v_keep_ids uuid[] := array[]::uuid[];
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
    or not public._writing_submission_feedback_fragments_v2_valid(p_fragments, p_status)
    or (p_grammar_points is not null and not public._writing_submission_feedback_rich_text_valid(p_grammar_points))
    or (
      p_sentence_structure_methods is not null
      and not public._writing_submission_feedback_rich_text_valid(p_sentence_structure_methods)
    )
    or (
      p_sentence_structure_links is not null
      and not public._writing_submission_sentence_structure_links_valid(p_sentence_structure_links)
    )
    or (
      p_sentence_structure_parts is not null
      and not public._writing_submission_feedback_parts_valid(p_sentence_structure_parts)
    )
    or (
      p_rhetorical_parts is not null
      and not public._writing_submission_feedback_parts_valid(p_rhetorical_parts)
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
    and submission.deleted_at is null
  limit 1 for update;
  if v_student_id is null then return; end if;

  select feedback.id, feedback.version, feedback.grammar_points,
         feedback.sentence_structure_methods, feedback.sentence_structure_links,
         feedback.sentence_structure_parts, feedback.rhetorical_parts
  into v_feedback_id, v_version, v_current_grammar_points,
       v_current_sentence_methods, v_current_sentence_links,
       v_current_sentence_parts, v_current_rhetorical_parts
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
  if v_version = 2147483647 then
    raise exception 'Writing feedback version exhausted' using errcode = 'P4090';
  end if;

  v_grammar_points := coalesce(p_grammar_points, v_current_grammar_points, '[]'::jsonb);
  v_sentence_methods := coalesce(
    p_sentence_structure_methods, v_current_sentence_methods, '[]'::jsonb
  );
  v_sentence_links := coalesce(
    p_sentence_structure_links, v_current_sentence_links, '[]'::jsonb
  );
  v_sentence_parts := coalesce(
    p_sentence_structure_parts, v_current_sentence_parts, '[]'::jsonb
  );
  v_rhetorical_parts := coalesce(
    p_rhetorical_parts, v_current_rhetorical_parts, '[]'::jsonb
  );
  if char_length(btrim(coalesce(p_overall_comment, ''))) = 0
    and char_length(btrim(coalesce(p_final_comment, ''))) = 0
    and char_length(btrim(coalesce(p_improved_version, ''))) = 0
    and jsonb_array_length(p_fragments) = 0
    and jsonb_array_length(v_grammar_points) = 0
    and jsonb_array_length(v_sentence_methods) = 0
    and jsonb_array_length(v_sentence_links) = 0
    and jsonb_array_length(v_sentence_parts) = 0
    and jsonb_array_length(v_rhetorical_parts) = 0
  then
    raise exception 'Invalid writing feedback' using errcode = '22023';
  end if;

  insert into public.writing_submission_feedback as feedback (
    submission_id, student_id, overall_comment, final_comment, improved_version,
    grammar_points, sentence_structure_methods, sentence_structure_links,
    sentence_structure_parts, rhetorical_parts,
    status, version, created_by_admin_id, updated_by_admin_id,
    published_at, student_read_at, updated_at
  ) values (
    p_submission_id, v_student_id, coalesce(p_overall_comment, ''),
    coalesce(p_final_comment, ''), coalesce(p_improved_version, ''),
    v_grammar_points, v_sentence_methods, v_sentence_links,
    v_sentence_parts, v_rhetorical_parts,
    p_status, 1, v_admin_id, v_admin_id,
    case when p_status = 'published' then clock_timestamp() else null end,
    null, clock_timestamp()
  )
  on conflict on constraint writing_submission_feedback_submission_id_key do update
  set student_id = excluded.student_id,
      overall_comment = excluded.overall_comment,
      final_comment = excluded.final_comment,
      improved_version = excluded.improved_version,
      grammar_points = excluded.grammar_points,
      sentence_structure_methods = excluded.sentence_structure_methods,
      sentence_structure_links = excluded.sentence_structure_links,
      sentence_structure_parts = excluded.sentence_structure_parts,
      rhetorical_parts = excluded.rhetorical_parts,
      status = excluded.status,
      version = feedback.version + 1,
      updated_by_admin_id = excluded.updated_by_admin_id,
      published_at = case when excluded.status = 'published' then clock_timestamp() else null end,
      student_read_at = null,
      updated_at = clock_timestamp()
  returning feedback.id, feedback.version into v_feedback_id, v_version;

  select coalesce(array_agg((item.value ->> 'id')::uuid), array[]::uuid[])
  into v_requested_ids
  from jsonb_array_elements(p_fragments) item(value)
  where jsonb_typeof(item.value -> 'id') = 'string';

  if exists (
    select 1
    from unnest(v_requested_ids) requested(fragment_id)
    where not exists (
      select 1
      from public.writing_submission_feedback_fragments fragment
      where fragment.id = requested.fragment_id
        and fragment.feedback_id = v_feedback_id
    )
  ) then
    raise exception 'Invalid feedback fragment identity' using errcode = '22023';
  end if;

  set constraints public.writing_submission_feedback_fragments_feedback_position_key deferred;
  for v_item, v_position in
    select item.value, item.ordinality::integer
    from jsonb_array_elements(p_fragments) with ordinality item(value, ordinality)
    order by item.ordinality
  loop
    v_fragment_id := case
      when jsonb_typeof(v_item -> 'id') = 'string' then (v_item ->> 'id')::uuid
      else null
    end;
    v_fragment_id := coalesce(v_fragment_id, gen_random_uuid());

    update public.writing_submission_feedback_fragments fragment
    set position = v_position::smallint,
        original_fragment = v_item ->> 'originalFragment',
        edmund_comment = v_item ->> 'edmundComment',
        suggested_writing = v_item ->> 'suggestedWriting',
        original_formatting = v_item -> 'originalFormatting',
        comment_formatting = v_item -> 'commentFormatting',
        suggestion_formatting = v_item -> 'suggestionFormatting',
        updated_at = clock_timestamp()
    where fragment.id = v_fragment_id
      and fragment.feedback_id = v_feedback_id;
    if not found then
      insert into public.writing_submission_feedback_fragments (
        id, feedback_id, position, original_fragment, edmund_comment,
        suggested_writing, original_formatting, comment_formatting,
        suggestion_formatting, updated_at
      ) values (
        v_fragment_id, v_feedback_id, v_position::smallint,
        v_item ->> 'originalFragment', v_item ->> 'edmundComment',
        v_item ->> 'suggestedWriting', v_item -> 'originalFormatting',
        v_item -> 'commentFormatting', v_item -> 'suggestionFormatting',
        clock_timestamp()
      );
    end if;
    v_keep_ids := array_append(v_keep_ids, v_fragment_id);
  end loop;

  delete from public.writing_submission_feedback_fragments fragment
  where fragment.feedback_id = v_feedback_id
    and not (fragment.id = any(v_keep_ids));

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
         feedback.grammar_points, feedback.sentence_structure_methods,
         feedback.sentence_structure_links, feedback.sentence_structure_parts,
         feedback.rhetorical_parts,
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
revoke all on function public._writing_submission_feedback_rich_text_value_valid(jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public._writing_submission_feedback_parts_valid(jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_feedback_student_open_v3(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_feedback_admin_get_v4(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_feedback_admin_save_v3(
  uuid, uuid, text, jsonb, text, text, jsonb, jsonb, jsonb, jsonb, jsonb,
  text, integer, uuid
) from public, anon, authenticated, service_role;

grant execute on function public.writing_submission_feedback_student_open_v3(uuid, uuid)
  to service_role;
grant execute on function public.writing_submission_feedback_admin_get_v4(uuid, uuid)
  to service_role;
grant execute on function public.writing_submission_feedback_admin_save_v3(
  uuid, uuid, text, jsonb, text, text, jsonb, jsonb, jsonb, jsonb, jsonb,
  text, integer, uuid
) to service_role;

notify pgrst, 'reload schema';
commit;
