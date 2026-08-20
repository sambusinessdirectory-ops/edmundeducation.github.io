-- Writing Submission: additional enhancement sections and per-item student
-- copy practice. Apply after
-- supabase-writing-submission-feedback-structured-parts.sql.

begin;

do $$
begin
  if to_regclass('public.writing_submission_feedback') is null then
    raise exception 'Missing dependency: public.writing_submission_feedback';
  end if;
  if to_regclass('public.writing_submission_feedback_fragments') is null then
    raise exception 'Missing dependency: public.writing_submission_feedback_fragments';
  end if;
  if to_regclass('public.writing_submissions') is null then
    raise exception 'Missing dependency: public.writing_submissions';
  end if;
  if to_regclass('public.flashcard_students') is null then
    raise exception 'Missing dependency: public.flashcard_students';
  end if;
  if to_regprocedure('public._writing_submission_feedback_parts_valid(jsonb)') is null then
    raise exception 'Missing dependency: public._writing_submission_feedback_parts_valid(jsonb)';
  end if;
  if to_regprocedure('public.writing_submission_feedback_student_open_v3(uuid,uuid)') is null then
    raise exception 'Missing dependency: public.writing_submission_feedback_student_open_v3';
  end if;
  if to_regprocedure('public.writing_submission_feedback_admin_get_v4(uuid,uuid)') is null then
    raise exception 'Missing dependency: public.writing_submission_feedback_admin_get_v4';
  end if;
  if to_regprocedure(
    'public.writing_submission_feedback_admin_save_v3(uuid,uuid,text,jsonb,text,text,jsonb,jsonb,jsonb,jsonb,jsonb,text,integer,uuid)'
  ) is null then
    raise exception 'Missing dependency: public.writing_submission_feedback_admin_save_v3';
  end if;
end;
$$;

alter table public.writing_submission_feedback
  add column if not exists phrasal_verb_parts jsonb not null default '[]'::jsonb;
alter table public.writing_submission_feedback
  add column if not exists writing_common_expression_parts jsonb not null default '[]'::jsonb;
alter table public.writing_submission_feedback
  add column if not exists rhetorical_common_expression_parts jsonb not null default '[]'::jsonb;

alter table public.writing_submission_feedback
  drop constraint if exists writing_submission_feedback_phrasal_verb_parts_valid;
alter table public.writing_submission_feedback
  add constraint writing_submission_feedback_phrasal_verb_parts_valid check (
    public._writing_submission_feedback_parts_valid(phrasal_verb_parts)
  );
alter table public.writing_submission_feedback
  drop constraint if exists writing_submission_feedback_writing_expression_parts_valid;
alter table public.writing_submission_feedback
  add constraint writing_submission_feedback_writing_expression_parts_valid check (
    public._writing_submission_feedback_parts_valid(writing_common_expression_parts)
  );
alter table public.writing_submission_feedback
  drop constraint if exists writing_submission_feedback_rhetorical_expression_parts_valid;
alter table public.writing_submission_feedback
  add constraint writing_submission_feedback_rhetorical_expression_parts_valid check (
    public._writing_submission_feedback_parts_valid(rhetorical_common_expression_parts)
  );

create table if not exists public.writing_submission_feedback_enhancement_copies (
  feedback_id uuid not null references public.writing_submission_feedback(id) on delete cascade,
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  section_key text not null check (
    section_key in (
      'sentence-structure',
      'rhetorical-technique',
      'phrasal-verb',
      'writing-common-expression',
      'rhetorical-common-expression'
    )
  ),
  item_position smallint not null check (item_position between 1 and 100),
  source_fingerprint text not null check (source_fingerprint ~ '^[0-9a-f]{32}$'),
  copy_text text not null default '' check (
    char_length(copy_text) <= 20000
    and octet_length(copy_text) <= 80000
    and regexp_replace(copy_text, E'[\n\r\t]', '', 'g') !~ '[[:cntrl:]]'
  ),
  version integer not null default 1 check (version between 1 and 2147483647),
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  primary key (feedback_id, student_id, section_key, item_position)
);

create index if not exists writing_submission_feedback_enhancement_copies_student_updated_idx
  on public.writing_submission_feedback_enhancement_copies (student_id, updated_at desc);

alter table public.writing_submission_feedback_enhancement_copies enable row level security;
revoke all on table public.writing_submission_feedback_enhancement_copies
  from public, anon, authenticated, service_role;

create or replace function public.writing_submission_feedback_student_open_v4(
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
  phrasal_verb_parts jsonb,
  writing_common_expression_parts jsonb,
  rhetorical_common_expression_parts jsonb,
  enhancement_copies jsonb,
  fragments jsonb,
  transcription_improved text,
  transcription_model text,
  transcription_version integer,
  topic_resource jsonb
)
language sql
security definer
set search_path = ''
as $$
  select opened.id,
         opened.submission_id,
         opened.overall_comment,
         opened.final_comment,
         opened.improved_version,
         opened.status,
         opened.version,
         opened.published_at,
         opened.updated_at,
         opened.grammar_points,
         opened.sentence_structure_methods,
         opened.sentence_structure_links,
         opened.sentence_structure_parts,
         opened.rhetorical_parts,
         feedback.phrasal_verb_parts,
         feedback.writing_common_expression_parts,
         feedback.rhetorical_common_expression_parts,
         coalesce((
           select jsonb_agg(
             jsonb_build_object(
               'sectionKey', copy.section_key,
               'itemPosition', copy.item_position,
               'text', copy.copy_text,
               'version', copy.version,
               'updatedAt', copy.updated_at
             ) order by copy.section_key, copy.item_position
           )
           from public.writing_submission_feedback_enhancement_copies copy
           where copy.feedback_id = feedback.id
             and copy.student_id = p_student_id
             and jsonb_typeof((
               case copy.section_key
                 when 'sentence-structure' then feedback.sentence_structure_parts
                 when 'rhetorical-technique' then feedback.rhetorical_parts
                 when 'phrasal-verb' then feedback.phrasal_verb_parts
                 when 'writing-common-expression' then feedback.writing_common_expression_parts
                 when 'rhetorical-common-expression' then feedback.rhetorical_common_expression_parts
                 else '[]'::jsonb
               end
             ) -> (copy.item_position - 1)) = 'object'
             and copy.source_fingerprint = pg_catalog.md5(((
               case copy.section_key
                 when 'sentence-structure' then feedback.sentence_structure_parts
                 when 'rhetorical-technique' then feedback.rhetorical_parts
                 when 'phrasal-verb' then feedback.phrasal_verb_parts
                 when 'writing-common-expression' then feedback.writing_common_expression_parts
                 when 'rhetorical-common-expression' then feedback.rhetorical_common_expression_parts
                 else '[]'::jsonb
               end
             ) -> (copy.item_position - 1))::text)
         ), '[]'::jsonb),
         opened.fragments,
         opened.transcription_improved,
         opened.transcription_model,
         opened.transcription_version,
         opened.topic_resource
  from public.writing_submission_feedback_student_open_v3(
    p_student_id,
    p_submission_id
  ) opened
  join public.writing_submission_feedback feedback on feedback.id = opened.id;
$$;

create or replace function public.writing_submission_feedback_admin_get_v5(
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
  phrasal_verb_parts jsonb,
  writing_common_expression_parts jsonb,
  rhetorical_common_expression_parts jsonb,
  fragments jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
  select admin_view.id,
         admin_view.submission_id,
         admin_view.overall_comment,
         admin_view.final_comment,
         admin_view.improved_version,
         admin_view.status,
         admin_view.version,
         admin_view.published_at,
         admin_view.updated_at,
         admin_view.grammar_points,
         admin_view.sentence_structure_methods,
         admin_view.sentence_structure_links,
         admin_view.sentence_structure_parts,
         admin_view.rhetorical_parts,
         feedback.phrasal_verb_parts,
         feedback.writing_common_expression_parts,
         feedback.rhetorical_common_expression_parts,
         admin_view.fragments
  from public.writing_submission_feedback_admin_get_v4(
    p_admin_token,
    p_submission_id
  ) admin_view
  join public.writing_submission_feedback feedback on feedback.id = admin_view.id;
$$;

create or replace function public.writing_submission_feedback_admin_save_v4(
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
  p_phrasal_verb_parts jsonb,
  p_writing_common_expression_parts jsonb,
  p_rhetorical_common_expression_parts jsonb,
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
  phrasal_verb_parts jsonb,
  writing_common_expression_parts jsonb,
  rhetorical_common_expression_parts jsonb,
  fragments jsonb
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_feedback_id uuid;
  v_version integer;
  v_legacy_overall_comment text;
begin
  if (
    p_phrasal_verb_parts is not null
    and not public._writing_submission_feedback_parts_valid(p_phrasal_verb_parts)
  ) or (
    p_writing_common_expression_parts is not null
    and not public._writing_submission_feedback_parts_valid(p_writing_common_expression_parts)
  ) or (
    p_rhetorical_common_expression_parts is not null
    and not public._writing_submission_feedback_parts_valid(p_rhetorical_common_expression_parts)
  ) then
    raise exception 'Invalid writing feedback' using errcode = '22023';
  end if;

  -- The v3 RPC owns all fragment identity/concurrency/audit behaviour. Its
  -- legacy non-empty guard cannot see the three new sections, so a private
  -- transaction-local marker lets a new-only feedback document reach the
  -- v4 validation below. The marker is never committed or returned.
  v_legacy_overall_comment := coalesce(p_overall_comment, '');
  if char_length(btrim(v_legacy_overall_comment)) = 0
    and char_length(btrim(coalesce(p_final_comment, ''))) = 0
    and char_length(btrim(coalesce(p_improved_version, ''))) = 0
    and coalesce(jsonb_array_length(p_fragments), 0) = 0
    and coalesce(jsonb_array_length(p_grammar_points), 0) = 0
    and coalesce(jsonb_array_length(p_sentence_structure_methods), 0) = 0
    and coalesce(jsonb_array_length(p_sentence_structure_links), 0) = 0
    and coalesce(jsonb_array_length(p_sentence_structure_parts), 0) = 0
    and coalesce(jsonb_array_length(p_rhetorical_parts), 0) = 0
  then
    v_legacy_overall_comment := '[additional enhancement feedback]';
  end if;

  select saved.id, saved.version
  into v_feedback_id, v_version
  from public.writing_submission_feedback_admin_save_v3(
    p_admin_token,
    p_submission_id,
    v_legacy_overall_comment,
    p_fragments,
    p_final_comment,
    p_improved_version,
    p_grammar_points,
    p_sentence_structure_methods,
    p_sentence_structure_links,
    p_sentence_structure_parts,
    p_rhetorical_parts,
    p_status,
    p_expected_version,
    p_expected_feedback_id
  ) saved;
  if v_feedback_id is null then return; end if;

  update public.writing_submission_feedback feedback
  set overall_comment = coalesce(p_overall_comment, ''),
      phrasal_verb_parts = coalesce(p_phrasal_verb_parts, feedback.phrasal_verb_parts),
      writing_common_expression_parts = coalesce(
        p_writing_common_expression_parts,
        feedback.writing_common_expression_parts
      ),
      rhetorical_common_expression_parts = coalesce(
        p_rhetorical_common_expression_parts,
        feedback.rhetorical_common_expression_parts
      )
  where feedback.id = v_feedback_id;

  if exists (
    select 1
    from public.writing_submission_feedback feedback
    where feedback.id = v_feedback_id
      and char_length(btrim(feedback.overall_comment)) = 0
      and char_length(btrim(feedback.final_comment)) = 0
      and char_length(btrim(feedback.improved_version)) = 0
      and jsonb_array_length(feedback.grammar_points) = 0
      and jsonb_array_length(feedback.sentence_structure_methods) = 0
      and jsonb_array_length(feedback.sentence_structure_links) = 0
      and jsonb_array_length(feedback.sentence_structure_parts) = 0
      and jsonb_array_length(feedback.rhetorical_parts) = 0
      and jsonb_array_length(feedback.phrasal_verb_parts) = 0
      and jsonb_array_length(feedback.writing_common_expression_parts) = 0
      and jsonb_array_length(feedback.rhetorical_common_expression_parts) = 0
      and not exists (
        select 1
        from public.writing_submission_feedback_fragments fragment
        where fragment.feedback_id = feedback.id
      )
  ) then
    raise exception 'Invalid writing feedback' using errcode = '22023';
  end if;

  -- A copy exercise belongs to a particular source item. Remove stale rows
  -- whenever an administrator edits, removes, or reorders that item.
  delete from public.writing_submission_feedback_enhancement_copies copy
  using public.writing_submission_feedback feedback
  where feedback.id = v_feedback_id
    and copy.feedback_id = feedback.id
    and (
      jsonb_typeof((
        case copy.section_key
          when 'sentence-structure' then feedback.sentence_structure_parts
          when 'rhetorical-technique' then feedback.rhetorical_parts
          when 'phrasal-verb' then feedback.phrasal_verb_parts
          when 'writing-common-expression' then feedback.writing_common_expression_parts
          when 'rhetorical-common-expression' then feedback.rhetorical_common_expression_parts
          else '[]'::jsonb
        end
      ) -> (copy.item_position - 1)) is distinct from 'object'
      or copy.source_fingerprint is distinct from pg_catalog.md5(((
        case copy.section_key
          when 'sentence-structure' then feedback.sentence_structure_parts
          when 'rhetorical-technique' then feedback.rhetorical_parts
          when 'phrasal-verb' then feedback.phrasal_verb_parts
          when 'writing-common-expression' then feedback.writing_common_expression_parts
          when 'rhetorical-common-expression' then feedback.rhetorical_common_expression_parts
          else '[]'::jsonb
        end
      ) -> (copy.item_position - 1))::text)
    );

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
         feedback.phrasal_verb_parts,
         feedback.writing_common_expression_parts,
         feedback.rhetorical_common_expression_parts,
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

create or replace function public.writing_submission_feedback_student_save_enhancement_copy(
  p_student_id uuid,
  p_submission_id uuid,
  p_section_key text,
  p_item_position integer,
  p_copy_text text,
  p_expected_version integer
)
returns table (
  section_key text,
  item_position smallint,
  copy_text text,
  version integer,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_feedback_id uuid;
  v_source_part jsonb;
  v_source_fingerprint text;
  v_existing_fingerprint text;
  v_existing_version integer;
begin
  if p_student_id is null
    or p_submission_id is null
    or p_section_key is null
    or p_section_key not in (
      'sentence-structure',
      'rhetorical-technique',
      'phrasal-verb',
      'writing-common-expression',
      'rhetorical-common-expression'
    )
    or p_item_position is null
    or p_item_position < 1
    or p_item_position > 100
    or p_expected_version is null
    or p_expected_version < 0
    or p_expected_version > 2147483647
    or char_length(coalesce(p_copy_text, '')) > 20000
    or octet_length(coalesce(p_copy_text, '')) > 80000
    or regexp_replace(coalesce(p_copy_text, ''), E'[\n\r\t]', '', 'g') ~ '[[:cntrl:]]'
  then
    raise exception 'Invalid enhancement copy' using errcode = '22023';
  end if;

  -- Share the feedback-document lock used by the administrator save RPC so
  -- the source item cannot change between fingerprinting and saving.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'writing-submission-feedback:' || p_submission_id::text,
      0
    )
  );

  select feedback.id,
         (case p_section_key
           when 'sentence-structure' then feedback.sentence_structure_parts
           when 'rhetorical-technique' then feedback.rhetorical_parts
           when 'phrasal-verb' then feedback.phrasal_verb_parts
           when 'writing-common-expression' then feedback.writing_common_expression_parts
           when 'rhetorical-common-expression' then feedback.rhetorical_common_expression_parts
           else '[]'::jsonb
         end) -> (p_item_position - 1)
  into v_feedback_id, v_source_part
  from public.writing_submission_feedback feedback
  join public.writing_submissions submission
    on submission.id = feedback.submission_id
   and submission.student_id = feedback.student_id
  where feedback.submission_id = p_submission_id
    and feedback.student_id = p_student_id
    and feedback.status = 'published'
    and submission.deleted_at is null
  limit 1;
  if v_feedback_id is null or jsonb_typeof(v_source_part) is distinct from 'object' then
    return;
  end if;
  v_source_fingerprint := pg_catalog.md5(v_source_part::text);

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'writing-submission-enhancement-copy:'
      || v_feedback_id::text || ':' || p_student_id::text || ':'
      || p_section_key || ':' || p_item_position::text,
      0
    )
  );

  select copy.source_fingerprint, copy.version
  into v_existing_fingerprint, v_existing_version
  from public.writing_submission_feedback_enhancement_copies copy
  where copy.feedback_id = v_feedback_id
    and copy.student_id = p_student_id
    and copy.section_key = p_section_key
    and copy.item_position = p_item_position
  for update;

  if v_existing_version is null then
    if p_expected_version <> 0 then
      raise exception 'Enhancement copy version conflict' using errcode = 'P4093';
    end if;
    insert into public.writing_submission_feedback_enhancement_copies (
      feedback_id, student_id, section_key, item_position,
      source_fingerprint, copy_text, version, updated_at
    ) values (
      v_feedback_id, p_student_id, p_section_key, p_item_position::smallint,
      v_source_fingerprint, coalesce(p_copy_text, ''), 1, clock_timestamp()
    );
  elsif v_existing_fingerprint is distinct from v_source_fingerprint then
    if p_expected_version <> 0 then
      raise exception 'Enhancement copy version conflict' using errcode = 'P4093';
    end if;
    update public.writing_submission_feedback_enhancement_copies copy
    set source_fingerprint = v_source_fingerprint,
        copy_text = coalesce(p_copy_text, ''),
        version = 1,
        updated_at = clock_timestamp()
    where copy.feedback_id = v_feedback_id
      and copy.student_id = p_student_id
      and copy.section_key = p_section_key
      and copy.item_position = p_item_position;
  else
    if p_expected_version <> v_existing_version or v_existing_version = 2147483647 then
      raise exception 'Enhancement copy version conflict' using errcode = 'P4093';
    end if;
    update public.writing_submission_feedback_enhancement_copies copy
    set copy_text = coalesce(p_copy_text, ''),
        version = copy.version + 1,
        updated_at = clock_timestamp()
    where copy.feedback_id = v_feedback_id
      and copy.student_id = p_student_id
      and copy.section_key = p_section_key
      and copy.item_position = p_item_position;
  end if;

  return query
  select copy.section_key,
         copy.item_position,
         copy.copy_text,
         copy.version,
         copy.updated_at
  from public.writing_submission_feedback_enhancement_copies copy
  where copy.feedback_id = v_feedback_id
    and copy.student_id = p_student_id
    and copy.section_key = p_section_key
    and copy.item_position = p_item_position;
end;
$$;

revoke all on function public.writing_submission_feedback_student_open_v4(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_feedback_admin_get_v5(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_feedback_admin_save_v4(
  uuid, uuid, text, jsonb, text, text, jsonb, jsonb, jsonb, jsonb, jsonb,
  jsonb, jsonb, jsonb, text, integer, uuid
) from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_feedback_student_save_enhancement_copy(
  uuid, uuid, text, integer, text, integer
) from public, anon, authenticated, service_role;

grant execute on function public.writing_submission_feedback_student_open_v4(uuid, uuid)
  to service_role;
grant execute on function public.writing_submission_feedback_admin_get_v5(uuid, uuid)
  to service_role;
grant execute on function public.writing_submission_feedback_admin_save_v4(
  uuid, uuid, text, jsonb, text, text, jsonb, jsonb, jsonb, jsonb, jsonb,
  jsonb, jsonb, jsonb, text, integer, uuid
) to service_role;
grant execute on function public.writing_submission_feedback_student_save_enhancement_copy(
  uuid, uuid, text, integer, text, integer
) to service_role;

notify pgrst, 'reload schema';
commit;
