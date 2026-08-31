begin;

do $$
begin
  if to_regprocedure('public.writing_submission_submit_v4(uuid,uuid,text,text,integer,integer,jsonb)') is null
    or to_regprocedure('public.writing_submission_feedback_student_open_v4(uuid,uuid)') is null
    or to_regprocedure('public.writing_submission_feedback_admin_get_v5(uuid,uuid)') is null
    or to_regprocedure(
      'public.writing_submission_feedback_admin_save_v4(uuid,uuid,text,jsonb,text,text,jsonb,jsonb,jsonb,jsonb,jsonb,jsonb,jsonb,jsonb,text,integer,uuid)'
    ) is null
  then
    raise exception 'Missing Writing Submission migration dependencies';
  end if;
end
$$;

alter table public.writing_submission_admin_audit
  add column if not exists submission_id uuid
    references public.writing_submissions(id) on delete set null;
alter table public.writing_submission_admin_audit
  drop constraint if exists writing_submission_admin_audit_action_check;
alter table public.writing_submission_admin_audit
  add constraint writing_submission_admin_audit_action_check check (
    action in ('delete_occurrence', 'delete_rule_category', 'proxy_submission')
  );
create index if not exists writing_submission_admin_audit_submission_idx
  on public.writing_submission_admin_audit (submission_id, created_at desc, id desc);

alter table public.writing_submission_feedback
  add column if not exists overall_formatting jsonb not null default '[]'::jsonb,
  add column if not exists final_formatting jsonb not null default '[]'::jsonb,
  add column if not exists improved_formatting jsonb not null default '[]'::jsonb,
  add column if not exists synonym_improvement_parts jsonb not null default '[]'::jsonb;

alter table public.writing_submission_feedback
  drop constraint if exists writing_submission_feedback_overall_formatting_valid,
  drop constraint if exists writing_submission_feedback_final_formatting_valid,
  drop constraint if exists writing_submission_feedback_improved_formatting_valid,
  drop constraint if exists writing_submission_feedback_synonym_parts_valid;
alter table public.writing_submission_feedback
  add constraint writing_submission_feedback_overall_formatting_valid check (
    public._writing_submission_feedback_formatting_valid(overall_formatting)
  ),
  add constraint writing_submission_feedback_final_formatting_valid check (
    public._writing_submission_feedback_formatting_valid(final_formatting)
  ),
  add constraint writing_submission_feedback_improved_formatting_valid check (
    public._writing_submission_feedback_formatting_valid(improved_formatting)
  ),
  add constraint writing_submission_feedback_synonym_parts_valid check (
    public._writing_submission_feedback_parts_valid(synonym_improvement_parts)
  );

alter table public.writing_submission_feedback_enhancement_copies
  drop constraint if exists writing_submission_feedback_enhancement_copie_section_key_check;
alter table public.writing_submission_feedback_enhancement_copies
  add constraint writing_submission_feedback_enhancement_copie_section_key_check check (
    section_key in (
      'sentence-structure',
      'rhetorical-technique',
      'phrasal-verb',
      'writing-common-expression',
      'rhetorical-common-expression',
      'synonym-improvement'
    )
  );

create or replace function public.writing_submission_admin_submit_for_student(
  p_admin_token uuid,
  p_id uuid,
  p_student_id uuid,
  p_topic text,
  p_answer text,
  p_word_count integer
)
returns table (
  id uuid,
  student_id uuid,
  student_name text,
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
declare
  v_admin_id uuid;
  v_row record;
begin
  v_admin_id := public._writing_submission_admin_id(p_admin_token);
  if v_admin_id is null then return; end if;
  if not exists (
    select 1
    from public.flashcard_students student
    where student.id = p_student_id
      and student.is_active
  ) then
    return;
  end if;

  select submitted.*
  into v_row
  from public.writing_submission_submit_v4(
    p_id, p_student_id, p_topic, p_answer, p_word_count, 0, null
  ) submitted;
  if v_row.id is null then return; end if;

  insert into public.writing_submission_admin_audit (
    admin_id, student_id, action, submission_id, affected_count
  ) values (
    v_admin_id, p_student_id, 'proxy_submission', v_row.id, 1
  );

  return query
  select v_row.id,
         p_student_id,
         student.name,
         v_row.topic,
         v_row.answer,
         v_row.word_count,
         v_row.duration_seconds,
         v_row.submitted_at,
         v_row.deleted_at,
         v_row.topic_resource
  from public.flashcard_students student
  where student.id = p_student_id;
end;
$$;

create or replace function public.writing_submission_feedback_student_open_v5(
  p_student_id uuid,
  p_submission_id uuid
)
returns table (
  id uuid,
  submission_id uuid,
  overall_comment text,
  overall_formatting jsonb,
  final_comment text,
  final_formatting jsonb,
  improved_version text,
  improved_formatting jsonb,
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
  synonym_improvement_parts jsonb,
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
         feedback.overall_formatting,
         opened.final_comment,
         feedback.final_formatting,
         opened.improved_version,
         feedback.improved_formatting,
         opened.status,
         opened.version,
         opened.published_at,
         opened.updated_at,
         opened.grammar_points,
         opened.sentence_structure_methods,
         opened.sentence_structure_links,
         opened.sentence_structure_parts,
         opened.rhetorical_parts,
         opened.phrasal_verb_parts,
         opened.writing_common_expression_parts,
         opened.rhetorical_common_expression_parts,
         feedback.synonym_improvement_parts,
         coalesce(opened.enhancement_copies, '[]'::jsonb) || coalesce((
           select jsonb_agg(jsonb_build_object(
             'sectionKey', copy.section_key,
             'itemPosition', copy.item_position,
             'text', copy.copy_text,
             'version', copy.version,
             'updatedAt', copy.updated_at
           ) order by copy.item_position)
           from public.writing_submission_feedback_enhancement_copies copy
           where copy.feedback_id = feedback.id
             and copy.student_id = p_student_id
             and copy.section_key = 'synonym-improvement'
             and jsonb_typeof(feedback.synonym_improvement_parts -> (copy.item_position - 1)) = 'object'
             and copy.source_fingerprint = pg_catalog.md5(
               (feedback.synonym_improvement_parts -> (copy.item_position - 1))::text
             )
         ), '[]'::jsonb),
         opened.fragments,
         opened.transcription_improved,
         opened.transcription_model,
         opened.transcription_version,
         opened.topic_resource
  from public.writing_submission_feedback_student_open_v4(
    p_student_id, p_submission_id
  ) opened
  join public.writing_submission_feedback feedback on feedback.id = opened.id;
$$;

create or replace function public.writing_submission_feedback_admin_get_v6(
  p_admin_token uuid,
  p_submission_id uuid
)
returns table (
  id uuid,
  submission_id uuid,
  overall_comment text,
  overall_formatting jsonb,
  final_comment text,
  final_formatting jsonb,
  improved_version text,
  improved_formatting jsonb,
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
  synonym_improvement_parts jsonb,
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
         feedback.overall_formatting,
         admin_view.final_comment,
         feedback.final_formatting,
         admin_view.improved_version,
         feedback.improved_formatting,
         admin_view.status,
         admin_view.version,
         admin_view.published_at,
         admin_view.updated_at,
         admin_view.grammar_points,
         admin_view.sentence_structure_methods,
         admin_view.sentence_structure_links,
         admin_view.sentence_structure_parts,
         admin_view.rhetorical_parts,
         admin_view.phrasal_verb_parts,
         admin_view.writing_common_expression_parts,
         admin_view.rhetorical_common_expression_parts,
         feedback.synonym_improvement_parts,
         admin_view.fragments
  from public.writing_submission_feedback_admin_get_v5(
    p_admin_token, p_submission_id
  ) admin_view
  join public.writing_submission_feedback feedback on feedback.id = admin_view.id;
$$;

create or replace function public.writing_submission_feedback_admin_save_v5(
  p_admin_token uuid,
  p_submission_id uuid,
  p_overall_comment text,
  p_overall_formatting jsonb,
  p_fragments jsonb,
  p_final_comment text,
  p_final_formatting jsonb,
  p_improved_version text,
  p_improved_formatting jsonb,
  p_grammar_points jsonb,
  p_sentence_structure_methods jsonb,
  p_sentence_structure_links jsonb,
  p_sentence_structure_parts jsonb,
  p_rhetorical_parts jsonb,
  p_phrasal_verb_parts jsonb,
  p_writing_common_expression_parts jsonb,
  p_rhetorical_common_expression_parts jsonb,
  p_synonym_improvement_parts jsonb,
  p_status text,
  p_expected_version integer,
  p_expected_feedback_id uuid
)
returns table (
  id uuid,
  submission_id uuid,
  overall_comment text,
  overall_formatting jsonb,
  final_comment text,
  final_formatting jsonb,
  improved_version text,
  improved_formatting jsonb,
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
  synonym_improvement_parts jsonb,
  fragments jsonb
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_feedback_id uuid;
  v_legacy_overall text := coalesce(p_overall_comment, '');
begin
  if not public._writing_submission_feedback_formatting_valid(coalesce(p_overall_formatting, '[]'::jsonb))
    or not public._writing_submission_feedback_formatting_valid(coalesce(p_final_formatting, '[]'::jsonb))
    or not public._writing_submission_feedback_formatting_valid(coalesce(p_improved_formatting, '[]'::jsonb))
    or not public._writing_submission_feedback_parts_valid(coalesce(p_synonym_improvement_parts, '[]'::jsonb))
  then
    raise exception 'Invalid writing feedback' using errcode = '22023';
  end if;

  if char_length(btrim(v_legacy_overall)) = 0
    and char_length(btrim(coalesce(p_final_comment, ''))) = 0
    and char_length(btrim(coalesce(p_improved_version, ''))) = 0
    and coalesce(jsonb_array_length(p_fragments), 0) = 0
    and coalesce(jsonb_array_length(p_grammar_points), 0) = 0
    and coalesce(jsonb_array_length(p_sentence_structure_methods), 0) = 0
    and coalesce(jsonb_array_length(p_sentence_structure_links), 0) = 0
    and coalesce(jsonb_array_length(p_sentence_structure_parts), 0) = 0
    and coalesce(jsonb_array_length(p_rhetorical_parts), 0) = 0
    and coalesce(jsonb_array_length(p_phrasal_verb_parts), 0) = 0
    and coalesce(jsonb_array_length(p_writing_common_expression_parts), 0) = 0
    and coalesce(jsonb_array_length(p_rhetorical_common_expression_parts), 0) = 0
    and coalesce(jsonb_array_length(p_synonym_improvement_parts), 0) > 0
  then
    v_legacy_overall := '[synonym improvement feedback]';
  end if;

  select saved.id
  into v_feedback_id
  from public.writing_submission_feedback_admin_save_v4(
    p_admin_token,
    p_submission_id,
    v_legacy_overall,
    p_fragments,
    p_final_comment,
    p_improved_version,
    p_grammar_points,
    p_sentence_structure_methods,
    p_sentence_structure_links,
    p_sentence_structure_parts,
    p_rhetorical_parts,
    p_phrasal_verb_parts,
    p_writing_common_expression_parts,
    p_rhetorical_common_expression_parts,
    p_status,
    p_expected_version,
    p_expected_feedback_id
  ) saved;
  if v_feedback_id is null then return; end if;

  update public.writing_submission_feedback feedback
  set overall_comment = coalesce(p_overall_comment, ''),
      overall_formatting = coalesce(p_overall_formatting, '[]'::jsonb),
      final_formatting = coalesce(p_final_formatting, '[]'::jsonb),
      improved_formatting = coalesce(p_improved_formatting, '[]'::jsonb),
      synonym_improvement_parts = coalesce(p_synonym_improvement_parts, '[]'::jsonb)
  where feedback.id = v_feedback_id;

  delete from public.writing_submission_feedback_enhancement_copies copy
  using public.writing_submission_feedback feedback
  where feedback.id = v_feedback_id
    and copy.feedback_id = feedback.id
    and copy.section_key = 'synonym-improvement'
    and (
      jsonb_typeof(feedback.synonym_improvement_parts -> (copy.item_position - 1)) is distinct from 'object'
      or copy.source_fingerprint is distinct from pg_catalog.md5(
        (feedback.synonym_improvement_parts -> (copy.item_position - 1))::text
      )
    );

  return query
  select feedback.id,
         feedback.submission_id,
         feedback.overall_comment,
         feedback.overall_formatting,
         feedback.final_comment,
         feedback.final_formatting,
         feedback.improved_version,
         feedback.improved_formatting,
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
         feedback.synonym_improvement_parts,
         coalesce((
           select jsonb_agg(jsonb_build_object(
             'id', fragment.id,
             'position', fragment.position,
             'originalFragment', fragment.original_fragment,
             'edmundComment', fragment.edmund_comment,
             'suggestedWriting', fragment.suggested_writing,
             'originalFormatting', fragment.original_formatting,
             'commentFormatting', fragment.comment_formatting,
             'suggestionFormatting', fragment.suggestion_formatting
           ) order by fragment.position)
           from public.writing_submission_feedback_fragments fragment
           where fragment.feedback_id = feedback.id
         ), '[]'::jsonb)
  from public.writing_submission_feedback feedback
  where feedback.id = v_feedback_id;
end;
$$;

create or replace function public.writing_submission_feedback_student_save_enhancement_copy_v2(
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
  v_fingerprint text;
  v_existing_fingerprint text;
  v_existing_version integer;
begin
  if p_section_key <> 'synonym-improvement' then
    return query
    select saved.section_key, saved.item_position, saved.copy_text, saved.version, saved.updated_at
    from public.writing_submission_feedback_student_save_enhancement_copy(
      p_student_id, p_submission_id, p_section_key, p_item_position,
      p_copy_text, p_expected_version
    ) saved;
    return;
  end if;
  if p_student_id is null
    or p_submission_id is null
    or p_item_position is null
    or p_item_position not between 1 and 100
    or p_expected_version is null
    or p_expected_version not between 0 and 2147483647
    or char_length(coalesce(p_copy_text, '')) > 20000
    or octet_length(coalesce(p_copy_text, '')) > 80000
    or regexp_replace(coalesce(p_copy_text, ''), E'[\n\r\t]', '', 'g') ~ '[[:cntrl:]]'
  then
    raise exception 'Invalid enhancement copy' using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('writing-submission-feedback:' || p_submission_id::text, 0)
  );
  select feedback.id,
         feedback.synonym_improvement_parts -> (p_item_position - 1)
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
  if v_feedback_id is null or jsonb_typeof(v_source_part) is distinct from 'object' then return; end if;
  v_fingerprint := pg_catalog.md5(v_source_part::text);

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'writing-submission-enhancement-copy:' || v_feedback_id::text || ':'
      || p_student_id::text || ':synonym-improvement:' || p_item_position::text,
      0
    )
  );
  select copy.source_fingerprint, copy.version
  into v_existing_fingerprint, v_existing_version
  from public.writing_submission_feedback_enhancement_copies copy
  where copy.feedback_id = v_feedback_id
    and copy.student_id = p_student_id
    and copy.section_key = 'synonym-improvement'
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
      v_feedback_id, p_student_id, 'synonym-improvement', p_item_position::smallint,
      v_fingerprint, coalesce(p_copy_text, ''), 1, clock_timestamp()
    );
  elsif v_existing_fingerprint is distinct from v_fingerprint then
    if p_expected_version <> 0 then
      raise exception 'Enhancement copy version conflict' using errcode = 'P4093';
    end if;
    update public.writing_submission_feedback_enhancement_copies copy
    set source_fingerprint = v_fingerprint,
        copy_text = coalesce(p_copy_text, ''),
        version = 1,
        updated_at = clock_timestamp()
    where copy.feedback_id = v_feedback_id
      and copy.student_id = p_student_id
      and copy.section_key = 'synonym-improvement'
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
      and copy.section_key = 'synonym-improvement'
      and copy.item_position = p_item_position;
  end if;

  return query
  select copy.section_key, copy.item_position, copy.copy_text, copy.version, copy.updated_at
  from public.writing_submission_feedback_enhancement_copies copy
  where copy.feedback_id = v_feedback_id
    and copy.student_id = p_student_id
    and copy.section_key = 'synonym-improvement'
    and copy.item_position = p_item_position;
end;
$$;

revoke all on function public.writing_submission_admin_submit_for_student(
  uuid, uuid, uuid, text, text, integer
) from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_feedback_student_open_v5(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_feedback_admin_get_v6(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_feedback_admin_save_v5(
  uuid, uuid, text, jsonb, jsonb, text, jsonb, text, jsonb, jsonb, jsonb,
  jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, text, integer, uuid
) from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_feedback_student_save_enhancement_copy_v2(
  uuid, uuid, text, integer, text, integer
) from public, anon, authenticated, service_role;

grant execute on function public.writing_submission_admin_submit_for_student(
  uuid, uuid, uuid, text, text, integer
) to service_role;
grant execute on function public.writing_submission_feedback_student_open_v5(uuid, uuid)
  to service_role;
grant execute on function public.writing_submission_feedback_admin_get_v6(uuid, uuid)
  to service_role;
grant execute on function public.writing_submission_feedback_admin_save_v5(
  uuid, uuid, text, jsonb, jsonb, text, jsonb, text, jsonb, jsonb, jsonb,
  jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, text, integer, uuid
) to service_role;
grant execute on function public.writing_submission_feedback_student_save_enhancement_copy_v2(
  uuid, uuid, text, integer, text, integer
) to service_role;

notify pgrst, 'reload schema';
commit;
