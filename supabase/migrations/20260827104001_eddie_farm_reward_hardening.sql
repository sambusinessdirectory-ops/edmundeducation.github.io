begin;
set local lock_timeout='5s';

alter function eddie_farm.source_rows(text,jsonb) rename to source_rows_v1;
create function eddie_farm.source_rows(p_table text,p_row jsonb)
returns table(student_id uuid,system_key text,source_key text,units bigint)
language plpgsql stable security definer set search_path='' as $$
declare q text; base_key text; r record; result_value jsonb; filled_mistakes bigint;
begin
  if p_table in ('sentence_structure_attempts','idiom_system_attempts','proverb_system_attempts','phrasal_verb_system_attempts') then
    student_id:=(p_row->>'student_id')::uuid;
    system_key:=case p_table when 'sentence_structure_attempts' then 'sentence-structure' when 'idiom_system_attempts' then 'idioms' when 'proverb_system_attempts' then 'proverbs' else 'phrasal-verbs' end;
    base_key:=p_table||':'||(p_row->>'id'); result_value:=p_row->'result';
    -- A blank included by a "submit all" button is not a finished question.
    -- Per-question high watermarks also survive clearing a remedial round.
    for q in
      select jsonb_array_elements_text(eddie_farm.array_value(result_value->'correctIds'))
      union
      select e.key from jsonb_each(case when jsonb_typeof(result_value->'questionState')='object' then result_value->'questionState' else '{}'::jsonb end) e
      where e.value->>'status' in ('correct','wrong') and length(btrim(coalesce(e.value->>'lastAnswer','')))>0
    loop
      source_key:=base_key||':'||q; units:=1; return next;
    end loop;
    return;
  end if;
  for r in select * from eddie_farm.source_rows_v1(p_table,p_row) loop
    student_id:=r.student_id; system_key:=r.system_key; source_key:=r.source_key; units:=r.units;
    if p_table='common_expression_question_completions' then
      system_key:='common-expression-'||r.system_key;
    elsif p_table='writing_practice_attempts' then
      select count(distinct coalesce(m->>'blankId',m->>'number')) into filled_mistakes
      from jsonb_array_elements(eddie_farm.array_value(p_row->'attempt'->'mistakeDetails')) m
      where length(btrim(coalesce(m->>'userAnswer','')))>0;
      units:=least(r.units,coalesce((p_row->>'correct_count')::bigint,0)+filled_mistakes);
    end if;
    return next;
  end loop;
end $$;
revoke all on function eddie_farm.source_rows(text,jsonb) from public,anon,authenticated,service_role;

-- Baseline the refined question keys without rewarding past exercises.
do $$ declare t text; row_value jsonb; r record;
begin
  foreach t in array array['sentence_structure_attempts','idiom_system_attempts','proverb_system_attempts','phrasal_verb_system_attempts','common_expression_question_completions'] loop
    execute format('lock table public.%I in share row exclusive mode',t);
    for row_value in execute format('select to_jsonb(s) from public.%I s',t) loop
      for r in select * from eddie_farm.source_rows(t,row_value) loop
        perform eddie_farm.observe(r.student_id,r.system_key,r.source_key,r.units,true);
      end loop;
    end loop;
  end loop;
end $$;

-- Honour a student's existing T+1 streak on the first rollout day. Only seed
-- yesterday's actual learning day, never historical points or today's visit.
insert into eddie_farm.activity_days(student_id,day)
select s.id,(now() at time zone 'Asia/Hong_Kong')::date-1
from public.flashcard_students s
where s.deleted_at is null and exists(
  select 1 from jsonb_each(public._student_progress_snapshot(s.id)->'sources') source
  cross join lateral jsonb_array_elements(
    eddie_farm.array_value(source.value->'activityDays')||eddie_farm.array_value(source.value->'timeDays')
  ) d
  where d->>'date'=((now() at time zone 'Asia/Hong_Kong')::date-1)::text
) on conflict do nothing;

create function eddie_farm.revoke_changed_admin_sessions() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if old.password_hash is distinct from new.password_hash or old.active is distinct from new.active then
    delete from eddie_farm.admin_sessions where admin_id=new.id;
  end if;
  return new;
end $$;
revoke all on function eddie_farm.revoke_changed_admin_sessions() from public,anon,authenticated,service_role;
create trigger eddie_farm_admin_security_change after update on eddie_farm.admin_accounts
for each row execute function eddie_farm.revoke_changed_admin_sessions();
notify pgrst,'reload schema';
commit;
