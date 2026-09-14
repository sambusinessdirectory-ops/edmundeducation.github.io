-- Checked IELTS question progress, independent of Eddie Farm points.
-- Version matches the migration applied through Supabase MCP.
create schema if not exists listening_rewards;
revoke all on schema listening_rewards from public, anon;
grant usage on schema listening_rewards to authenticated;
create table listening_rewards.practices (
 practice integer primary key check (practice > 0),
 question_count integer not null check (question_count > 0)
);
insert into listening_rewards.practices select n,40 from generate_series(1,20) n;
alter table listening_rewards.practices enable row level security;
create table listening_rewards.progress (
 student_id uuid not null references public.flashcard_students(id) on delete cascade,
 practice integer not null references listening_rewards.practices(practice),
 question_number integer not null check (question_number > 0),
 completed_at timestamptz not null default now(),
 primary key(student_id,practice,question_number)
);
alter table listening_rewards.progress enable row level security;
revoke all on all tables in schema listening_rewards from public,anon,authenticated;

-- The existing student token identifies the owner; callers cannot pass a
-- student ID. Checked IDs are bounded by the current practice catalogue.
create function listening_rewards.progress_sync(p_token uuid,p_practice integer default null,p_correct_ids integer[] default '{}')
returns table(practice integer,correct_ids integer[])
language plpgsql security definer set search_path='' as $$
declare student uuid; total integer;
begin
 if (select auth.uid()) is null then raise exception 'Authentication required' using errcode='42501'; end if;
 student := public.flashcard_session_student_id(p_token);
 if student is null then raise exception 'Please log in again' using errcode='42501'; end if;
 if p_practice is not null then
  select question_count into total from listening_rewards.practices p where p.practice=p_practice;
  if total is null or p_correct_ids is null or cardinality(p_correct_ids)>total
   or exists(select 1 from unnest(p_correct_ids) n where n is null or n<1 or n>total)
  then raise exception 'Invalid checked questions' using errcode='22023'; end if;
  insert into listening_rewards.progress(student_id,practice,question_number)
   select student,p_practice,n from unnest(p_correct_ids) n on conflict do nothing;
 elsif coalesce(cardinality(p_correct_ids),0)>0 then
  raise exception 'Practice required' using errcode='22023';
 end if;
 return query select p.practice,array_agg(p.question_number order by p.question_number)
  from listening_rewards.progress p where p.student_id=student group by p.practice;
end $$;
revoke all on function listening_rewards.progress_sync(uuid,integer,integer[]) from public,anon;
grant execute on function listening_rewards.progress_sync(uuid,integer,integer[]) to authenticated;
create function public.ielts_trophy_progress(p_token uuid,p_practice integer default null,p_correct_ids integer[] default '{}')
returns table(practice integer,correct_ids integer[])
language sql security invoker set search_path='' as $$
 select * from listening_rewards.progress_sync(p_token,p_practice,p_correct_ids);
$$;
revoke all on function public.ielts_trophy_progress(uuid,integer,integer[]) from public,anon;
grant execute on function public.ielts_trophy_progress(uuid,integer,integer[]) to authenticated;
