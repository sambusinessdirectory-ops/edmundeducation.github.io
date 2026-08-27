begin;
set local lock_timeout='5s';

create or replace function eddie_farm.source_rows_v1(p_table text,p_row jsonb)
returns table(student_id uuid,system_key text,source_key text,units bigint)
language plpgsql stable security definer set search_path='' as $$
declare a jsonb; v_result jsonb;
begin
  student_id:=(p_row->>'student_id')::uuid;
  source_key:=p_table||':'||coalesce(p_row->>'id',p_row->>'attempt_id');
  case p_table
  when 'flashcard_student_state' then
    if p_row->>'key'<>'edmundFlashcardAttempts' then return; end if;
    for a in select value from jsonb_array_elements(eddie_farm.array_value(case when jsonb_typeof(p_row->'value')='array' then p_row->'value' else p_row->'value'->'attempts' end)) loop
      if nullif(a->>'id','') is null then continue; end if;
      system_key:='flashcards'; source_key:='flashcards:'||(a->>'id');
      select count(distinct coalesce(o->>'key',(o->>'deckId')||':'||(o->>'index'),o->>'index',o->>'front')) into units
      from jsonb_array_elements(eddie_farm.array_value(a->'cardOutcomes')) o where o->>'status' in ('red','green');
      units:=greatest(units,least(coalesce(public._student_progress_json_number(a->'totalCards'),0),coalesce(public._student_progress_json_number(a->'answeredCount'),0))::bigint);
      return next;
    end loop;
    return;
  when 'sentence_structure_attempts','idiom_system_attempts','proverb_system_attempts','phrasal_verb_system_attempts' then
    system_key:=case p_table when 'sentence_structure_attempts' then 'sentence-structure' when 'idiom_system_attempts' then 'idioms' when 'proverb_system_attempts' then 'proverbs' else 'phrasal-verbs' end;
    v_result:=p_row->'result';
    select count(distinct q) into units from (
      select jsonb_array_elements_text(eddie_farm.array_value(v_result->'correctIds')) q
      union all
      select jsonb_array_elements_text(eddie_farm.array_value(r->'checkedIds')) q from jsonb_array_elements(eddie_farm.array_value(v_result->'rounds')) r
    ) checked;
  when 'writing_practice_attempts' then
    -- shared_account_id belongs to the shared identity table, not the wallet.
    -- Always resolve the actual flashcard student ID before awarding points.
    select s.id into student_id from public.writing_student_accounts w
    join public.flashcard_students s on s.deleted_at is null and (
      (w.shared_account_id is not null and s.shared_account_id=w.shared_account_id)
      or s.id=w.id or lower(btrim(s.name))=lower(btrim(w.name))
    ) where w.id=(p_row->>'student_id')::uuid
    order by (w.shared_account_id is not null and s.shared_account_id=w.shared_account_id) desc nulls last,
      (s.id=w.id) desc,s.id limit 1;
    system_key:='writing-practice'; units:=(p_row->>'total_count')::bigint;
  when 'learning_portal_progress_events' then system_key:=p_row->>'system_key'; source_key:='portal:'||(p_row->>'event_key'); units:=(p_row->>'activity_count')::bigint;
  when 'common_expression_question_completions' then system_key:=p_row->>'system_key'; source_key:='common:'||(p_row->>'lesson_id')||':'||(p_row->>'question_id'); units:=1;
  when 'reading_comprehension_question_results' then system_key:='reading-comprehension'; source_key:='reading:'||(p_row->>'attempt_id')||':'||(p_row->>'question_number'); units:=1;
  when 'song_appreciation_attempts' then system_key:='song-appreciation'; units:=(p_row->>'total_count')::bigint;
  when 'speaking_exam_attempts' then
    system_key:='speaking'; units:=case when p_row->>'completed_at' is not null then greatest(0,jsonb_array_length(eddie_farm.array_value(p_row->'question_manifest'))-jsonb_array_length(eddie_farm.array_value(p_row->'skipped_question_orders'))) else 0 end;
  when 'speaking_recording_attempts' then system_key:='speaking-recordings'; units:=case when p_row->>'storage_state'='ready' then 1 else 0 end;
  when 'writing_submissions' then system_key:='writing-submission'; units:=1;
  else return;
  end case;
  return next;
end $$;

revoke all on function eddie_farm.source_rows_v1(text,jsonb) from public,anon,authenticated,service_role;
commit;
