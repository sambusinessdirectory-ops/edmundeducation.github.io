-- Writing Submission: suggestion-copy practice, fragment bookmarks, grammar
-- feedback, and sentence-structure learning links.
-- Apply after supabase-writing-submission-feedback-fragment-enhancements.sql.

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
  if to_regprocedure('public._writing_submission_feedback_fragments_valid(jsonb,text)') is null then
    raise exception 'Missing dependency: public._writing_submission_feedback_fragments_valid(jsonb,text)';
  end if;
  if to_regprocedure('public._writing_submission_admin_id(uuid)') is null then
    raise exception 'Missing dependency: public._writing_submission_admin_id(uuid)';
  end if;
end;
$$;

-- Browser selection offsets use JavaScript UTF-16 code units. PostgreSQL's
-- char_length counts Unicode code points instead, so non-BMP characters such
-- as emoji need to count as two units to keep formatting ranges consistent.
create or replace function public._writing_submission_utf16_length(
  p_text text
)
returns integer
language sql
immutable
strict
parallel safe
set search_path = ''
as $$
  select coalesce(sum(
    case when octet_length(character_row.character) = 4 then 2 else 1 end
  ), 0)::integer
  from regexp_split_to_table(p_text, '') character_row(character);
$$;

create or replace function public._writing_submission_feedback_rich_text_valid(
  p_items jsonb
)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_item jsonb;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    return false;
  end if;
  if jsonb_array_length(p_items) > 100
    or octet_length(p_items::text) > 1048576
  then
    return false;
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    if jsonb_typeof(v_item) <> 'object'
      or (select count(*) from jsonb_object_keys(v_item)) <> 2
      or exists (
        select 1
        from jsonb_object_keys(v_item) key_row(key_name)
        where key_name not in ('text', 'formatting')
      )
      or jsonb_typeof(v_item -> 'text') is distinct from 'string'
      or char_length(btrim(coalesce(v_item ->> 'text', ''))) = 0
      or char_length(coalesce(v_item ->> 'text', '')) > 20000
      or octet_length(coalesce(v_item ->> 'text', '')) > 80000
      or regexp_replace(coalesce(v_item ->> 'text', ''), E'[\n\r\t]', '', 'g') ~ '[[:cntrl:]]'
      or not public._writing_submission_feedback_formatting_valid(v_item -> 'formatting')
      or exists (
        select 1
        from jsonb_array_elements(v_item -> 'formatting') run
        where (run ->> 'end')::integer
          > public._writing_submission_utf16_length(coalesce(v_item ->> 'text', ''))
      )
    then
      return false;
    end if;
  end loop;

  return true;
exception
  when invalid_text_representation or numeric_value_out_of_range then
    return false;
end;
$$;

create or replace function public._writing_submission_sentence_structure_links_valid(
  p_links jsonb
)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_item jsonb;
  v_url text;
begin
  if p_links is null or jsonb_typeof(p_links) <> 'array' then
    return false;
  end if;
  if jsonb_array_length(p_links) > 100 or octet_length(p_links::text) > 262144 then
    return false;
  end if;

  for v_item in select value from jsonb_array_elements(p_links)
  loop
    v_url := coalesce(v_item ->> 'url', '');
    if jsonb_typeof(v_item) <> 'object'
      or (select count(*) from jsonb_object_keys(v_item)) <> 2
      or exists (
        select 1
        from jsonb_object_keys(v_item) key_row(key_name)
        where key_name not in ('label', 'url')
      )
      or jsonb_typeof(v_item -> 'label') is distinct from 'string'
      or jsonb_typeof(v_item -> 'url') is distinct from 'string'
      or char_length(btrim(coalesce(v_item ->> 'label', ''))) = 0
      or char_length(coalesce(v_item ->> 'label', '')) > 200
      or octet_length(coalesce(v_item ->> 'label', '')) > 800
      or regexp_replace(coalesce(v_item ->> 'label', ''), E'[\n\r\t]', '', 'g') ~ '[[:cntrl:]]'
      or char_length(v_url) > 2048
      or octet_length(v_url) > 8192
      or v_url <> btrim(v_url)
      or v_url !~ '^/sentence-structure[.]html[?]lesson=[A-Za-z0-9][A-Za-z0-9_-]{0,79}$'
      or regexp_replace(v_url, E'[\n\r\t]', '', 'g') ~ '[[:cntrl:]]'
    then
      return false;
    end if;
  end loop;

  return true;
end;
$$;

alter table public.writing_submission_feedback
  add column if not exists grammar_points jsonb not null default '[]'::jsonb;
alter table public.writing_submission_feedback
  add column if not exists sentence_structure_methods jsonb not null default '[]'::jsonb;
alter table public.writing_submission_feedback
  add column if not exists sentence_structure_links jsonb not null default '[]'::jsonb;

alter table public.writing_submission_feedback
  drop constraint if exists writing_submission_feedback_grammar_points_valid;
alter table public.writing_submission_feedback
  add constraint writing_submission_feedback_grammar_points_valid check (
    public._writing_submission_feedback_rich_text_valid(grammar_points)
  );
alter table public.writing_submission_feedback
  drop constraint if exists writing_submission_feedback_sentence_methods_valid;
alter table public.writing_submission_feedback
  add constraint writing_submission_feedback_sentence_methods_valid check (
    public._writing_submission_feedback_rich_text_valid(sentence_structure_methods)
  );
alter table public.writing_submission_feedback
  drop constraint if exists writing_submission_feedback_sentence_links_valid;
alter table public.writing_submission_feedback
  add constraint writing_submission_feedback_sentence_links_valid check (
    public._writing_submission_sentence_structure_links_valid(sentence_structure_links)
  );

-- A deferrable ordering constraint lets the v2 save RPC reorder stable fragment
-- IDs atomically. Stable IDs keep student-owned copies and bookmarks attached
-- to the intended feedback fragment across administrator edits.
alter table public.writing_submission_feedback_fragments
  drop constraint if exists writing_submission_feedback_fragments_feedback_id_position_key;
alter table public.writing_submission_feedback_fragments
  drop constraint if exists writing_submission_feedback_fragments_feedback_position_key;
alter table public.writing_submission_feedback_fragments
  add constraint writing_submission_feedback_fragments_feedback_position_key
  unique (feedback_id, position) deferrable initially immediate;
alter table public.writing_submission_feedback_fragments
  drop constraint if exists writing_submission_feedback_fragments_not_empty;
alter table public.writing_submission_feedback_fragments
  add constraint writing_submission_feedback_fragments_not_empty check (
    char_length(btrim(original_fragment)) > 0
    or char_length(btrim(edmund_comment)) > 0
    or char_length(btrim(suggested_writing)) > 0
  );

create table if not exists public.writing_submission_feedback_fragment_copies (
  fragment_id uuid not null
    references public.writing_submission_feedback_fragments(id) on delete cascade,
  student_id uuid not null
    references public.flashcard_students(id) on delete cascade,
  copy_text text not null default '',
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (fragment_id, student_id),
  constraint writing_submission_feedback_fragment_copies_text_size check (
    char_length(copy_text) <= 20000
    and octet_length(copy_text) <= 80000
    and regexp_replace(copy_text, E'[\n\r\t]', '', 'g') !~ '[[:cntrl:]]'
  ),
  constraint writing_submission_feedback_fragment_copies_version_valid
    check (version between 1 and 2147483647)
);

create index if not exists writing_submission_feedback_fragment_copies_student_idx
  on public.writing_submission_feedback_fragment_copies (student_id, updated_at desc, fragment_id);

create table if not exists public.writing_submission_feedback_fragment_bookmarks (
  fragment_id uuid not null
    references public.writing_submission_feedback_fragments(id) on delete cascade,
  student_id uuid not null
    references public.flashcard_students(id) on delete cascade,
  bookmarked boolean not null default true,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (fragment_id, student_id),
  constraint writing_submission_feedback_fragment_bookmarks_version_valid
    check (version between 1 and 2147483647)
);

create index if not exists writing_submission_feedback_fragment_bookmarks_student_idx
  on public.writing_submission_feedback_fragment_bookmarks (
    student_id, bookmarked, updated_at desc, fragment_id
  );

alter table public.writing_submission_feedback_fragment_copies enable row level security;
alter table public.writing_submission_feedback_fragment_bookmarks enable row level security;
revoke all on table public.writing_submission_feedback_fragment_copies
  from public, anon, authenticated, service_role;
revoke all on table public.writing_submission_feedback_fragment_bookmarks
  from public, anon, authenticated, service_role;

create or replace function public._writing_submission_feedback_fragments_v2_valid(
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
  v_without_ids jsonb;
  v_non_null_ids integer;
  v_distinct_ids integer;
begin
  if p_fragments is null
    or jsonb_typeof(p_fragments) <> 'array'
    or jsonb_array_length(p_fragments) > 200
    or octet_length(p_fragments::text) > 589824
  then
    return false;
  end if;

  for v_item in select value from jsonb_array_elements(p_fragments)
  loop
    if jsonb_typeof(v_item) <> 'object'
      or (select count(*) from jsonb_object_keys(v_item)) <> 7
      or exists (
        select 1
        from jsonb_object_keys(v_item) key_row(key_name)
        where key_name not in (
          'id', 'originalFragment', 'edmundComment', 'suggestedWriting',
          'originalFormatting', 'commentFormatting', 'suggestionFormatting'
        )
      )
      or jsonb_typeof(v_item -> 'id') not in ('null', 'string')
      or (
        jsonb_typeof(v_item -> 'id') = 'string'
        and coalesce(v_item ->> 'id', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      )
    then
      return false;
    end if;
  end loop;

  select count(*), count(distinct value ->> 'id')
  into v_non_null_ids, v_distinct_ids
  from jsonb_array_elements(p_fragments)
  where jsonb_typeof(value -> 'id') = 'string';
  if v_non_null_ids <> v_distinct_ids then return false; end if;

  select coalesce(jsonb_agg(value - 'id' order by ordinality), '[]'::jsonb)
  into v_without_ids
  from jsonb_array_elements(p_fragments) with ordinality item(value, ordinality);

  return public._writing_submission_feedback_fragments_valid(v_without_ids, p_status);
end;
$$;

create or replace function public.writing_submission_feedback_student_open_v2(
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

create or replace function public.writing_submission_feedback_admin_get_v3(
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

create or replace function public.writing_submission_feedback_admin_save_v2(
  p_admin_token uuid,
  p_submission_id uuid,
  p_overall_comment text,
  p_fragments jsonb,
  p_final_comment text,
  p_improved_version text,
  p_grammar_points jsonb,
  p_sentence_structure_methods jsonb,
  p_sentence_structure_links jsonb,
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
  v_grammar_points jsonb;
  v_sentence_methods jsonb;
  v_sentence_links jsonb;
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
         feedback.sentence_structure_methods, feedback.sentence_structure_links
  into v_feedback_id, v_version, v_current_grammar_points,
       v_current_sentence_methods, v_current_sentence_links
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
  if char_length(btrim(coalesce(p_overall_comment, ''))) = 0
    and char_length(btrim(coalesce(p_final_comment, ''))) = 0
    and char_length(btrim(coalesce(p_improved_version, ''))) = 0
    and jsonb_array_length(p_fragments) = 0
    and jsonb_array_length(v_grammar_points) = 0
    and jsonb_array_length(v_sentence_methods) = 0
    and jsonb_array_length(v_sentence_links) = 0
  then
    raise exception 'Invalid writing feedback' using errcode = '22023';
  end if;

  insert into public.writing_submission_feedback as feedback (
    submission_id, student_id, overall_comment, final_comment, improved_version,
    grammar_points, sentence_structure_methods, sentence_structure_links,
    status, version, created_by_admin_id, updated_by_admin_id,
    published_at, student_read_at, updated_at
  ) values (
    p_submission_id, v_student_id, coalesce(p_overall_comment, ''),
    coalesce(p_final_comment, ''), coalesce(p_improved_version, ''),
    v_grammar_points, v_sentence_methods, v_sentence_links,
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
    -- A null ID always represents a genuinely new fragment. Reusing the old
    -- row at the same position would transfer its student copy/bookmark state
    -- to unrelated replacement text.
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
         feedback.sentence_structure_links,
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

create or replace function public.writing_submission_feedback_student_save_fragment_copy_v2(
  p_student_id uuid,
  p_submission_id uuid,
  p_fragment_id uuid,
  p_copy_text text,
  p_expected_version integer
)
returns table (
  fragment_id uuid,
  copy_text text,
  version integer,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_fragment_id uuid;
  v_existing_version integer;
begin
  if p_student_id is null or p_submission_id is null or p_fragment_id is null
    or p_expected_version is null or p_expected_version not between 0 and 2147483647
    or char_length(coalesce(p_copy_text, '')) > 20000
    or octet_length(coalesce(p_copy_text, '')) > 80000
    or regexp_replace(coalesce(p_copy_text, ''), E'[\n\r\t]', '', 'g') ~ '[[:cntrl:]]'
  then
    raise exception 'Invalid suggestion copy' using errcode = '22023';
  end if;

  select fragment.id into v_fragment_id
  from public.writing_submission_feedback_fragments fragment
  join public.writing_submission_feedback feedback on feedback.id = fragment.feedback_id
  join public.writing_submissions submission
    on submission.id = feedback.submission_id
   and submission.student_id = feedback.student_id
  where fragment.id = p_fragment_id
    and feedback.submission_id = p_submission_id
    and feedback.student_id = p_student_id
    and feedback.status = 'published'
    and submission.student_id = p_student_id
    and submission.deleted_at is null
    and char_length(btrim(fragment.suggested_writing)) > 0
  limit 1
  for key share of fragment;
  if v_fragment_id is null then return; end if;

  perform pg_advisory_xact_lock(pg_catalog.hashtextextended(
    'writing-submission-fragment-copy:' || p_student_id::text || ':' || p_fragment_id::text,
    0
  ));
  select fragment_copy.version into v_existing_version
  from public.writing_submission_feedback_fragment_copies fragment_copy
  where fragment_copy.fragment_id = p_fragment_id
    and fragment_copy.student_id = p_student_id
  for update;

  if (v_existing_version is null and p_expected_version <> 0)
    or (v_existing_version is not null and p_expected_version <> v_existing_version)
    or v_existing_version = 2147483647
  then
    raise exception 'Suggestion copy version conflict' using errcode = 'P4092';
  end if;

  insert into public.writing_submission_feedback_fragment_copies as fragment_copy (
    fragment_id, student_id, copy_text, version, updated_at
  ) values (
    p_fragment_id, p_student_id, coalesce(p_copy_text, ''), 1, clock_timestamp()
  )
  on conflict on constraint writing_submission_feedback_fragment_copies_pkey do update
  set copy_text = excluded.copy_text,
      version = fragment_copy.version + 1,
      updated_at = clock_timestamp()
  where fragment_copy.student_id = p_student_id;

  return query
  select fragment_copy.fragment_id, fragment_copy.copy_text,
         fragment_copy.version, fragment_copy.updated_at
  from public.writing_submission_feedback_fragment_copies fragment_copy
  where fragment_copy.fragment_id = p_fragment_id
    and fragment_copy.student_id = p_student_id;
end;
$$;

create or replace function public.writing_submission_feedback_bookmark_set_v2(
  p_student_id uuid,
  p_fragment_id uuid,
  p_bookmarked boolean,
  p_expected_version integer
)
returns table (
  fragment_id uuid,
  bookmarked boolean,
  version integer,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_fragment_id uuid;
  v_existing_version integer;
begin
  if p_student_id is null or p_fragment_id is null or p_bookmarked is null
    or p_expected_version is null or p_expected_version not between 0 and 2147483647
  then
    raise exception 'Invalid feedback bookmark' using errcode = '22023';
  end if;

  select fragment.id into v_fragment_id
  from public.writing_submission_feedback_fragments fragment
  join public.writing_submission_feedback feedback on feedback.id = fragment.feedback_id
  join public.writing_submissions submission
    on submission.id = feedback.submission_id
   and submission.student_id = feedback.student_id
  where fragment.id = p_fragment_id
    and feedback.student_id = p_student_id
    and feedback.status = 'published'
    and submission.student_id = p_student_id
    and submission.deleted_at is null
  limit 1
  for key share of fragment;
  if v_fragment_id is null then return; end if;

  perform pg_advisory_xact_lock(pg_catalog.hashtextextended(
    'writing-submission-fragment-bookmark:' || p_student_id::text || ':' || p_fragment_id::text,
    0
  ));
  select bookmark.version into v_existing_version
  from public.writing_submission_feedback_fragment_bookmarks bookmark
  where bookmark.fragment_id = p_fragment_id
    and bookmark.student_id = p_student_id
  for update;

  if (v_existing_version is null and p_expected_version <> 0)
    or (v_existing_version is not null and p_expected_version <> v_existing_version)
    or v_existing_version = 2147483647
  then
    raise exception 'Feedback bookmark version conflict' using errcode = 'P4093';
  end if;

  insert into public.writing_submission_feedback_fragment_bookmarks as bookmark (
    fragment_id, student_id, bookmarked, version, updated_at
  ) values (
    p_fragment_id, p_student_id, p_bookmarked, 1, clock_timestamp()
  )
  on conflict on constraint writing_submission_feedback_fragment_bookmarks_pkey do update
  set bookmarked = excluded.bookmarked,
      version = bookmark.version + 1,
      updated_at = clock_timestamp()
  where bookmark.student_id = p_student_id;

  return query
  select bookmark.fragment_id, bookmark.bookmarked, bookmark.version, bookmark.updated_at
  from public.writing_submission_feedback_fragment_bookmarks bookmark
  where bookmark.fragment_id = p_fragment_id
    and bookmark.student_id = p_student_id;
end;
$$;

create or replace function public.writing_submission_feedback_bookmarks_list_v2(
  p_student_id uuid,
  p_limit integer,
  p_offset integer
)
returns table (
  fragment_id uuid,
  feedback_id uuid,
  submission_id uuid,
  topic text,
  "position" smallint,
  original_fragment text,
  edmund_comment text,
  suggested_writing text,
  original_formatting jsonb,
  comment_formatting jsonb,
  suggestion_formatting jsonb,
  version integer,
  updated_at timestamptz,
  published_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if p_student_id is null
    or p_limit not between 1 and 101
    or p_offset not between 0 and 1000000
  then
    raise exception 'Invalid feedback bookmark page' using errcode = '22023';
  end if;

  return query
  select fragment.id, feedback.id, feedback.submission_id, submission.topic,
         fragment.position, fragment.original_fragment, fragment.edmund_comment,
         fragment.suggested_writing, fragment.original_formatting,
         fragment.comment_formatting, fragment.suggestion_formatting,
         bookmark.version, bookmark.updated_at, feedback.published_at
  from public.writing_submission_feedback_fragment_bookmarks bookmark
  join public.writing_submission_feedback_fragments fragment
    on fragment.id = bookmark.fragment_id
  join public.writing_submission_feedback feedback
    on feedback.id = fragment.feedback_id
   and feedback.student_id = bookmark.student_id
  join public.writing_submissions submission
    on submission.id = feedback.submission_id
   and submission.student_id = bookmark.student_id
  where bookmark.student_id = p_student_id
    and bookmark.bookmarked = true
    and feedback.status = 'published'
    and submission.deleted_at is null
  order by bookmark.updated_at desc, bookmark.fragment_id desc
  limit p_limit offset p_offset;
end;
$$;

revoke all on function public._writing_submission_utf16_length(text)
  from public, anon, authenticated, service_role;
revoke all on function public._writing_submission_feedback_rich_text_valid(jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public._writing_submission_sentence_structure_links_valid(jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public._writing_submission_feedback_fragments_v2_valid(jsonb, text)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_feedback_student_open_v2(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_feedback_admin_get_v3(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_feedback_admin_save_v2(
  uuid, uuid, text, jsonb, text, text, jsonb, jsonb, jsonb, text, integer, uuid
) from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_feedback_student_save_fragment_copy_v2(
  uuid, uuid, uuid, text, integer
) from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_feedback_bookmark_set_v2(
  uuid, uuid, boolean, integer
) from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_feedback_bookmarks_list_v2(
  uuid, integer, integer
) from public, anon, authenticated, service_role;

grant execute on function public.writing_submission_feedback_student_open_v2(uuid, uuid)
  to service_role;
grant execute on function public.writing_submission_feedback_admin_get_v3(uuid, uuid)
  to service_role;
grant execute on function public.writing_submission_feedback_admin_save_v2(
  uuid, uuid, text, jsonb, text, text, jsonb, jsonb, jsonb, text, integer, uuid
) to service_role;
grant execute on function public.writing_submission_feedback_student_save_fragment_copy_v2(
  uuid, uuid, uuid, text, integer
) to service_role;
grant execute on function public.writing_submission_feedback_bookmark_set_v2(
  uuid, uuid, boolean, integer
) to service_role;
grant execute on function public.writing_submission_feedback_bookmarks_list_v2(
  uuid, integer, integer
) to service_role;

notify pgrst, 'reload schema';
commit;
