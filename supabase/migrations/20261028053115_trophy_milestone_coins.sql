-- Trophy rewards use saved course results, not browser-submitted coin amounts.
create table eddie_farm.trophy_catalogue (
 system_key text not null, lesson_id text not null, question_ids text[] not null,
 primary key(system_key,lesson_id), check(cardinality(question_ids)>0)
);
create table eddie_farm.trophy_rewards (
 student_id uuid not null references public.flashcard_students(id) on delete cascade,
 system_key text not null, lesson_id text not null, tier text not null check(tier in ('bronze','silver','gold')),
 points integer not null check((tier='bronze' and points=20) or (tier='silver' and points=30) or (tier='gold' and points=50)),
 awarded_at timestamptz not null default now(),
 primary key(student_id,system_key,lesson_id,tier)
);
alter table eddie_farm.trophy_catalogue enable row level security;
alter table eddie_farm.trophy_rewards enable row level security;
revoke all on eddie_farm.trophy_catalogue,eddie_farm.trophy_rewards from public,anon,authenticated,service_role;

create function eddie_farm.award_trophy(p_student uuid,p_system text,p_lesson text,p_correct integer,p_total integer,p_gold boolean)
returns void language plpgsql security definer set search_path='' as $$
declare r record;
begin
 if p_student is null or p_system is null or p_lesson is null or p_total is null or p_correct is null or p_total<=0 or p_correct<0 or p_correct>p_total then return; end if;
 if p_correct<ceil(p_total*.5) then return; end if;
 perform eddie_farm.lock_wallet(p_student);
 for r in select * from (values('bronze',20,ceil(p_total*.5)::integer),('silver',30,ceil(p_total*.8)::integer),('gold',50,p_total)) v(tier,points,threshold) loop
  if p_correct<r.threshold or (r.tier='gold' and not p_gold) then continue; end if;
  insert into eddie_farm.trophy_rewards(student_id,system_key,lesson_id,tier,points) values(p_student,p_system,p_lesson,r.tier,r.points) on conflict do nothing;
  if found then
   update eddie_farm.wallets set balance=balance+r.points where student_id=p_student;
   insert into eddie_farm.ledger(student_id,kind,system_key,points) values(p_student,'trophy-'||r.tier,p_system||':'||p_lesson,r.points);
  end if;
 end loop;
end $$;

create function eddie_farm.observe_trophy(p_table text,p_row jsonb)
returns void language plpgsql security definer set search_path='' as $$
declare sid uuid:=(p_row->>'student_id')::uuid; sys text; lesson text:=p_row->>'lesson_id'; ids text[]; total integer; correct integer; reported numeric; gold boolean; result jsonb;
begin
 if sid is null then return; end if;
 perform eddie_farm.lock_wallet(sid);
 if p_table='progress' then
  sys:='ielts-listening'; lesson:='ielts-listening-practice-'||(p_row->>'practice');
  select question_count into total from listening_rewards.practices where practice=(p_row->>'practice')::integer;
  select count(distinct question_number)::integer into correct from listening_rewards.progress where student_id=sid and practice=(p_row->>'practice')::integer and question_number between 1 and total;
  gold:=correct=total;
 else
  sys:=case p_table when 'sentence_structure_attempts' then 'sentence-structure' when 'idiom_system_attempts' then 'idioms' when 'proverb_system_attempts' then 'proverbs' when 'phrasal_verb_system_attempts' then 'phrasal-verbs' when 'common_expression_lesson_states' then 'common-expression-'||(p_row->>'system_key') end;
  select question_ids into ids from eddie_farm.trophy_catalogue where system_key=sys and lesson_id=lesson;
  if ids is null then return; end if;
  total:=cardinality(ids);
  if p_table='common_expression_lesson_states' then
   select count(*)::integer into correct from jsonb_each(case when jsonb_typeof(p_row->'state'->'answers')='object' then p_row->'state'->'answers' else '{}'::jsonb end) a where a.key=any(ids) and a.value->'correct'='true'::jsonb;
   gold:=correct=total;
  else
   if (p_row->>'total_count')::integer<>total then return; end if;
   reported:=(p_row->>'correct_count')::numeric;
   if reported is null or reported<>trunc(reported) or reported<0 or reported>total then return; end if;
   correct:=reported::integer; result:=p_row->'result';
   if jsonb_typeof(result->'correctIds')='array' then
    select least(correct,count(distinct q)::integer) into correct from jsonb_array_elements_text(result->'correctIds') q where q=any(ids);
   end if;
   gold:=p_row->>'status'='completed' and correct=total;
  end if;
 end if;
 perform eddie_farm.award_trophy(sid,sys,lesson,correct,total,coalesce(gold,false));
end $$;

create function eddie_farm.capture_trophy() returns trigger language plpgsql security definer set search_path='' as $$
begin perform eddie_farm.observe_trophy(TG_TABLE_NAME,to_jsonb(new)); return new; end $$;

create function eddie_farm.trophy_summary(p_token uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare sid uuid:=eddie_farm.student_id(p_token);
begin
 return (select jsonb_build_object('bronze',count(*) filter(where tier='bronze'),'silver',count(*) filter(where tier='silver'),'gold',count(*) filter(where tier='gold'),'coins',coalesce(sum(points),0)) from eddie_farm.trophy_rewards where student_id=sid);
end $$;
create function public.eddie_farm_trophy_summary(p_token uuid) returns jsonb language sql security invoker set search_path='' as $$ select eddie_farm.trophy_summary(p_token) $$;
revoke all on function eddie_farm.award_trophy(uuid,text,text,integer,integer,boolean),eddie_farm.observe_trophy(text,jsonb),eddie_farm.capture_trophy(),eddie_farm.trophy_summary(uuid),public.eddie_farm_trophy_summary(uuid) from public,anon,authenticated,service_role;
grant execute on function eddie_farm.trophy_summary(uuid),public.eddie_farm_trophy_summary(uuid) to anon,authenticated;
