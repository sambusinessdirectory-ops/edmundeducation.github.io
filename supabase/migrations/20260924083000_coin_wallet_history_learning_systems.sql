-- Show a student's earned coins by local date and connect the newer practice systems.
begin;
set local lock_timeout = '5s';

insert into eddie_farm.rules(system_key,label,exercise_count,points)
select v.system_key,v.label,r.exercise_count,r.points
from (values
  ('polysemy-lab','Polysemy Lab'),('natural-english','Native speakers 怎麼說?'),
  ('quotes','Quotes'),('collocation','Collocation'),('irregular-verb','Irregular Verbs'),
  ('thematic-vocabulary','Thematic Vocabulary'),('part-of-speech','Parts of Speech'),
  ('synonyms','Synonyms'),('error-identifier','Error Identifier'),('spelling','Spelling'),
  ('reading-logic','Reading Logic'),('translation-skills','Translation Skills'),
  ('business-school','Business School'),('complex-questions','Complex Questions'),
  ('leisurely-reading','Leisurely Reading'),('english-humour-speaking','English Humour Speaking'),
  ('english-humour-writing','English Humour Writing'),('english-joke-collection','English Jokes'),
  ('argument-learning','Argument Learning'),('fragmented-reading','Fragmented Reading'),
  ('precise-language','Precise Language'),('english-in-shows','English in Shows'),
  ('ted-talk-english','TED Talk English'),('poem-english','Poem English'),
  ('excellent-learning','English Accent Learning')
) as v(system_key,label)
cross join eddie_farm.rules r
where r.system_key='*'
on conflict(system_key) do nothing;

-- Only validated, correct answers are counted; event IDs make retries idempotent.
create function eddie_farm.capture_polysemy_answer() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  perform eddie_farm.observe(new.student_id,'polysemy-lab','answer:'||new.id::text,1);
  return new;
end $$;
create trigger eddie_farm_correct_answer after insert on polysemy_private.events
for each row when (new.kind='answer' and new.correct is true)
execute function eddie_farm.capture_polysemy_answer();

create function eddie_farm.capture_natural_english_answer() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  perform eddie_farm.observe(new.student_id,'natural-english','answer:'||new.id::text,1);
  return new;
end $$;
create trigger eddie_farm_correct_answer after insert on natural_english_private.events
for each row when (new.kind='answer' and new.correct is true)
execute function eddie_farm.capture_natural_english_answer();

revoke all on function eddie_farm.capture_polysemy_answer(),eddie_farm.capture_natural_english_answer() from public,anon,authenticated,service_role;

create function eddie_farm.wallet_history(p_token uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_student uuid:=eddie_farm.student_id(p_token);
begin
  return jsonb_build_object(
    'balance',coalesce((select balance from eddie_farm.wallets where student_id=v_student),0),
    'days',coalesce((
      select jsonb_agg(jsonb_build_object('date',d.day,'points',d.points) order by d.day desc)
      from (
        select (created_at at time zone 'Asia/Hong_Kong')::date as day,sum(points) as points
        from eddie_farm.ledger
        where student_id=v_student and points>0
        group by 1
      ) d
    ),'[]'::jsonb)
  );
end $$;
revoke all on function eddie_farm.wallet_history(uuid) from public,anon,authenticated,service_role;
grant execute on function eddie_farm.wallet_history(uuid) to anon,authenticated;

create function public.eddie_farm_wallet_history(p_token uuid) returns jsonb
language sql security invoker set search_path='' as $$ select eddie_farm.wallet_history(p_token) $$;
revoke all on function public.eddie_farm_wallet_history(uuid) from public,anon,authenticated,service_role;
grant execute on function public.eddie_farm_wallet_history(uuid) to anon,authenticated;
commit;
