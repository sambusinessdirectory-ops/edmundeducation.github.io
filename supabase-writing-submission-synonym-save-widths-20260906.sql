-- Preserve the existing save RPC, privileges and concurrency checks.
-- Match save validation to the storage validator supporting columnWidths.
CREATE OR REPLACE FUNCTION public.writing_submission_feedback_admin_save_v5(p_admin_token uuid, p_submission_id uuid, p_overall_comment text, p_overall_formatting jsonb, p_fragments jsonb, p_final_comment text, p_final_formatting jsonb, p_improved_version text, p_improved_formatting jsonb, p_grammar_points jsonb, p_sentence_structure_methods jsonb, p_sentence_structure_links jsonb, p_sentence_structure_parts jsonb, p_rhetorical_parts jsonb, p_phrasal_verb_parts jsonb, p_writing_common_expression_parts jsonb, p_rhetorical_common_expression_parts jsonb, p_synonym_improvement_parts jsonb, p_status text, p_expected_version integer, p_expected_feedback_id uuid)
 RETURNS TABLE(id uuid, submission_id uuid, overall_comment text, overall_formatting jsonb, final_comment text, final_formatting jsonb, improved_version text, improved_formatting jsonb, status text, version integer, published_at timestamp with time zone, updated_at timestamp with time zone, grammar_points jsonb, sentence_structure_methods jsonb, sentence_structure_links jsonb, sentence_structure_parts jsonb, rhetorical_parts jsonb, phrasal_verb_parts jsonb, writing_common_expression_parts jsonb, rhetorical_common_expression_parts jsonb, synonym_improvement_parts jsonb, fragments jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_feedback_id uuid;
  v_legacy_overall text := coalesce(p_overall_comment, '');
begin
  if not public._writing_submission_feedback_formatting_valid(coalesce(p_overall_formatting, '[]'::jsonb))
    or not public._writing_submission_feedback_formatting_valid(coalesce(p_final_formatting, '[]'::jsonb))
    or not public._writing_submission_feedback_formatting_valid(coalesce(p_improved_formatting, '[]'::jsonb))
    or not public._writing_submission_synonym_parts_valid(coalesce(p_synonym_improvement_parts, '[]'::jsonb))
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
$function$

