-- Install triggers and backfill in one transaction: no completion is missed.
set local lock_timeout='10s';
lock table public.sentence_structure_attempts,public.idiom_system_attempts,public.proverb_system_attempts,public.phrasal_verb_system_attempts,public.common_expression_lesson_states,listening_rewards.progress in share row exclusive mode;
create trigger eddie_farm_trophy after insert or update on public.sentence_structure_attempts for each row execute function eddie_farm.capture_trophy();
create trigger eddie_farm_trophy after insert or update on public.idiom_system_attempts for each row execute function eddie_farm.capture_trophy();
create trigger eddie_farm_trophy after insert or update on public.proverb_system_attempts for each row execute function eddie_farm.capture_trophy();
create trigger eddie_farm_trophy after insert or update on public.phrasal_verb_system_attempts for each row execute function eddie_farm.capture_trophy();
create trigger eddie_farm_trophy after insert or update on public.common_expression_lesson_states for each row execute function eddie_farm.capture_trophy();
create trigger eddie_farm_trophy after insert or update on listening_rewards.progress for each row execute function eddie_farm.capture_trophy();
do $$ declare r record;
begin
 for r in
  select src.* from (
   select student_id,'sentence_structure_attempts'::text tbl,to_jsonb(a) rowdata from public.sentence_structure_attempts a
   union all select student_id,'idiom_system_attempts',to_jsonb(a) from public.idiom_system_attempts a
   union all select student_id,'proverb_system_attempts',to_jsonb(a) from public.proverb_system_attempts a
   union all select student_id,'phrasal_verb_system_attempts',to_jsonb(a) from public.phrasal_verb_system_attempts a
   union all select student_id,'common_expression_lesson_states',to_jsonb(a) from public.common_expression_lesson_states a
   union all select student_id,'progress',jsonb_build_object('student_id',student_id,'practice',practice) from listening_rewards.progress group by student_id,practice
  ) src join public.flashcard_students s on s.id=src.student_id where s.deleted_at is null order by src.student_id,src.tbl
 loop perform eddie_farm.observe_trophy(r.tbl,r.rowdata); end loop;
end $$;
notify pgrst,'reload schema';
