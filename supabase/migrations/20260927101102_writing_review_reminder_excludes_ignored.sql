-- Keep the scheduler, recipients, privileges and six-hour threshold unchanged.
-- The shared review digest excludes submissions parked in the Writing admin queue.
do $migration$
declare definition text; old_filter text := 'and not exists(select 1 from public.writing_submission_feedback f where f.submission_id=s.id and f.status=''published'');';
begin
 select pg_get_functiondef('public.classroom_enqueue_notifications()'::regprocedure) into definition;
 if position('writing_submission_feedback_ignored' in definition)>0 then return; end if;
 if position(old_filter in definition)=0 then raise exception 'Review reminder query changed; inspect before applying'; end if;
 definition:=replace(definition,old_filter,'and not exists(select 1 from public.writing_submission_feedback_ignored i where i.submission_id=s.id) '||old_filter);
 execute definition;
end $migration$;
