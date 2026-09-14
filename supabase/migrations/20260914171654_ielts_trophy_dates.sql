-- Preserve the v1 endpoint for cached clients; v2 adds original check dates.
-- Version matches the applied Supabase migration.
create function listening_rewards.progress_with_dates(p_token uuid,p_practice integer default null,p_correct_ids integer[] default '{}')
returns table(practice integer,correct_ids integer[],correct_dates jsonb)
language plpgsql security definer set search_path='' as $$
declare student uuid;
begin
 if (select auth.uid()) is null then raise exception 'Authentication required' using errcode='42501'; end if;
 perform * from listening_rewards.progress_sync(p_token,p_practice,p_correct_ids);
 student:=public.flashcard_session_student_id(p_token);
 if student is null then raise exception 'Please log in again' using errcode='42501'; end if;
 return query select p.practice,array_agg(p.question_number order by p.question_number),
  jsonb_object_agg(p.question_number::text,p.completed_at)
  from listening_rewards.progress p where p.student_id=student group by p.practice;
end $$;
revoke all on function listening_rewards.progress_with_dates(uuid,integer,integer[]) from public,anon;
grant execute on function listening_rewards.progress_with_dates(uuid,integer,integer[]) to authenticated;
create function public.ielts_trophy_progress_v2(p_token uuid,p_practice integer default null,p_correct_ids integer[] default '{}')
returns table(practice integer,correct_ids integer[],correct_dates jsonb)
language sql security invoker set search_path='' as $$
 select * from listening_rewards.progress_with_dates(p_token,p_practice,p_correct_ids);
$$;
revoke all on function public.ielts_trophy_progress_v2(uuid,integer,integer[]) from public,anon;
grant execute on function public.ielts_trophy_progress_v2(uuid,integer,integer[]) to authenticated;
