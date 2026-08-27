-- Run against the deployed schema. All test accounts, points and changes roll back.
begin;
do $$
declare s uuid:=gen_random_uuid(); other_s uuid:=gen_random_uuid(); token uuid:=gen_random_uuid();
  admin uuid:=gen_random_uuid(); admin_token uuid:=gen_random_uuid(); receipt uuid:=gen_random_uuid();
  planting uuid:=gen_random_uuid(); harvesting uuid:=gen_random_uuid(); writer uuid:=gen_random_uuid(); snap jsonb; n bigint; r record;
begin
  insert into public.flashcard_students(id,name,password_hash) values
    (s,'Farm transactional QA '||s,'disabled-qa-login'),(other_s,'Farm transactional QA '||other_s,'disabled-qa-login');
  insert into public.flashcard_student_sessions(token,student_id) values(token,s);
  insert into eddie_farm.rules(system_key,label,exercise_count,points) values('qa-system','QA',3,2);

  perform eddie_farm.observe(s,'qa-system','old-attempt',12,true);
  perform eddie_farm.observe(s,'qa-system','old-attempt',12);
  perform eddie_farm.observe(s,'qa-system','new-attempt',2);
  assert (select balance from eddie_farm.wallets where student_id=s)=0,'partial batch must not pay';
  perform eddie_farm.observe(s,'qa-system','new-attempt',3);
  assert (select balance from eddie_farm.wallets where student_id=s)=2,'batch award';
  perform eddie_farm.observe(s,'qa-system','new-attempt',3);
  perform eddie_farm.observe(s,'qa-system','new-attempt',0);
  perform eddie_farm.observe(s,'qa-system','new-attempt',3);
  assert (select balance from eddie_farm.wallets where student_id=s)=2,'retry/reset must not duplicate points';
  perform eddie_farm.observe(s,'qa-system','another-module',3);
  assert (select balance from eddie_farm.wallets where student_id=s)=4,'pool across modules';
  begin
    perform eddie_farm.purchase(token,'carrot',receipt);
    raise exception 'Insufficient balance was accepted';
  exception when raise_exception then
    if sqlerrm<>'Not enough points.' then raise; end if;
  end;
  assert not exists(select 1 from eddie_farm.inventory where student_id=s),'failed purchase must not grant a seed';
  perform eddie_farm.observe(s,'qa-system','another-module',6);
  snap:=eddie_farm.purchase(token,'carrot',receipt);
  assert (snap->>'balance')::bigint=1,'purchase deducts price';
  snap:=eddie_farm.purchase(token,'carrot',receipt);
  assert (snap->>'balance')::bigint=1,'purchase retry is free';
  assert (select quantity from eddie_farm.inventory where student_id=s and seed_id='carrot')=1,'one seed only';
  begin
    perform eddie_farm.purchase(token,'tomato',receipt);
    raise exception 'Mismatched receipt was accepted';
  exception when raise_exception then
    if sqlerrm<>'Purchase reference was already used.' then raise; end if;
  end;
  snap:=eddie_farm.plant(token,'carrot','bed-1',planting);
  snap:=eddie_farm.plant(token,'carrot','bed-1',planting);
  assert (select quantity from eddie_farm.inventory where student_id=s and seed_id='carrot')=0,'plant consumes one seed exactly once';
  assert jsonb_array_length(snap->'plots')=1,'planted crop persists';
  begin
    perform eddie_farm.harvest(token,'bed-1',harvesting);
    raise exception 'Early harvest was accepted';
  exception when raise_exception then
    if sqlerrm<>'This crop is not ready yet.' then raise; end if;
  end;
  update eddie_farm.plots set planted_at=now()-interval '11 seconds' where student_id=s;
  snap:=eddie_farm.harvest(token,'bed-1',harvesting);
  snap:=eddie_farm.harvest(token,'bed-1',harvesting);
  assert jsonb_array_length(snap->'plots')=0,'harvest clears bed';
  assert (select quantity from eddie_farm.harvests where student_id=s and seed_id='carrot')=1,'harvest retry is idempotent';
  assert not (snap ?| array['rules','counters','source_counts','ledger']),'student response leaks mechanism';
  assert (snap->>'id')::uuid=s,'snapshot ownership';
  begin
    perform eddie_farm.snapshot(gen_random_uuid());
    raise exception 'Invalid session accepted';
  exception when insufficient_privilege then null; end;

  -- Bonus follows HKT days and is once per day, including concurrent replays
  -- (all visits take the same per-student wallet row lock).
  insert into eddie_farm.activity_days values(other_s,(now() at time zone 'Asia/Hong_Kong')::date-1);
  perform eddie_farm.visit_student(other_s);
  select balance into n from eddie_farm.wallets where student_id=other_s;
  assert n=(select points from eddie_farm.rules where system_key='daily-return'),'next-day bonus';
  perform eddie_farm.visit_student(other_s);
  assert (select balance from eddie_farm.wallets where student_id=other_s)=n,'repeat visit bonus';

  -- Adapter tests exercise all answer-bearing source families without changing
  -- their protected progress rows or their integrity/sync protocols.
  select sum(units) into n from eddie_farm.source_rows('sentence_structure_attempts',jsonb_build_object('student_id',s,'id',gen_random_uuid(),'result','{"correctIds":["q1"],"questionState":{"q1":{"status":"correct","lastAnswer":"yes"},"q2":{"status":"wrong","lastAnswer":"no"},"q3":{"status":"wrong","lastAnswer":""}},"rounds":[{"checkedIds":["q1","q2","q3"]}]}'::jsonb));
  assert n=2,'unique answered questions only; blanks must not earn rewards';
  select * into r from eddie_farm.source_rows('flashcard_student_state',jsonb_build_object('student_id',s,'key','edmundFlashcardAttempts','value','[{"id":"qa-flash","totalCards":10,"answeredCount":3,"cardOutcomes":[{"key":"x","status":"red"},{"key":"x","status":"green"}]}]'::jsonb));
  assert r.units=3 and r.system_key='flashcards','flashcard partial completion';
  select * into r from eddie_farm.source_rows('reading_comprehension_question_results',jsonb_build_object('student_id',s,'attempt_id',gen_random_uuid(),'question_number',2));
  assert r.units=1 and r.system_key='reading-comprehension','reading question';
  select * into r from eddie_farm.source_rows('song_appreciation_attempts',jsonb_build_object('student_id',s,'id',gen_random_uuid(),'total_count',4));
  assert r.units=4 and r.system_key='song-appreciation','song questions';
  select * into r from eddie_farm.source_rows('speaking_exam_attempts',jsonb_build_object('student_id',s,'id',gen_random_uuid(),'completed_at',now(),'question_manifest','[{}, {}, {}]'::jsonb,'skipped_question_orders','[1]'::jsonb));
  assert r.units=2,'skip unanswered speaking questions';
  select * into r from eddie_farm.source_rows('common_expression_question_completions',jsonb_build_object('student_id',s,'system_key','written','lesson_id','one','question_id','two'));
  assert r.units=1 and r.source_key='common:one:two' and r.system_key='common-expression-written','common-expression question';
  select * into r from eddie_farm.source_rows('learning_portal_progress_events',jsonb_build_object('student_id',s,'id',gen_random_uuid(),'system_key','grammar','event_key','question-1','activity_count',1));
  assert r.units=1 and r.system_key='grammar','other portal events';

  insert into public.writing_student_accounts(id,name,password_hash)
  values(writer,'Farm transactional QA '||s,'disabled-qa-login');
  select * into r from eddie_farm.source_rows('writing_practice_attempts',jsonb_build_object(
    'student_id',writer,'id',gen_random_uuid(),'total_count',10,'correct_count',3,
    'attempt','{"mistakeDetails":[{"blankId":"one","userAnswer":"answer"},{"blankId":"one","userAnswer":"duplicate"},{"blankId":"two","userAnswer":"answer"},{"blankId":"three","userAnswer":""}]}'::jsonb));
  assert r.student_id=s and r.units=5 and r.system_key='writing-practice','writing identity mapping and nonblank answers';

  perform eddie_farm.listening_submit(token,'{"1":"answer one","2":"answer two"}');
  select balance into n from eddie_farm.wallets where student_id=s;
  perform eddie_farm.listening_submit(token,'{"1":"edited answer","2":"answer two"}');
  assert (select balance from eddie_farm.wallets where student_id=s)=n,'listening recheck must not duplicate';

  insert into eddie_farm.admin_accounts(id,name,password_hash) values(admin,'Farm QA admin '||admin,'disabled-qa-login');
  insert into eddie_farm.admin_sessions values(extensions.digest(admin_token::text,'sha256'),admin,now()+interval '1 hour');
  perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
  begin perform eddie_farm.admin_rules(token); raise exception 'Student accessed admin settings'; exception when insufficient_privilege then null; end;
  snap:=eddie_farm.admin_update_rule(admin_token,'qa-system',4,3,true,1);
  assert (snap->>'revision')::integer=2,'admin rule version';
  begin
    perform eddie_farm.admin_update_rule(admin_token,'qa-system',4,3,true,1);
    raise exception 'Stale settings overwritten';
  exception when raise_exception then if sqlerrm<>'Settings changed. Refresh before saving.' then raise; end if; end;
  perform eddie_farm.observe(s,'qa-system','next-attempt',4);
  assert (select balance from eddie_farm.wallets where student_id=s)=n+3,'new reward rule applies';
  assert not has_function_privilege('anon','eddie_farm.observe(uuid,text,text,bigint,boolean)','EXECUTE'),'anon must not credit wallets';
  assert not has_function_privilege('authenticated','eddie_farm.observe(uuid,text,text,bigint,boolean)','EXECUTE'),'students must not credit wallets';
  assert not has_table_privilege('authenticated','eddie_farm.rules','SELECT'),'students must not read rules';
  assert not has_table_privilege('anon','eddie_farm.wallets','UPDATE'),'clients must not change balances';
  assert (select count(*) from eddie_farm.seeds)=18,'all farm seed types';
  assert (select bool_and(price=5) from eddie_farm.seeds),'seed prices';
  perform set_config('test.farm_token',token::text,true);
end $$;
set local role anon;
select public.eddie_farm_snapshot(current_setting('test.farm_token')::uuid)->>'balance' as own_balance_visible;
reset role;
rollback;
