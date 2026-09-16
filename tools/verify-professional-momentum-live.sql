-- Synthetic accounts and activity exist only inside this rolled-back transaction.
begin;
do $$
declare a uuid:=gen_random_uuid();b uuid:=gen_random_uuid();hidden uuid:=gen_random_uuid();cid uuid:=gen_random_uuid();did uuid:=gen_random_uuid();card uuid:=gen_random_uuid();atoken uuid;btoken uuid;r jsonb;denied boolean:=false;
begin
 insert into public.special_flash_accounts(id,username,role,team_effort_visible) values(a,'Momentum QA '||a,'student',true),(b,'Momentum QA '||b,'student',true),(hidden,'Momentum QA '||hidden,'student',false);
 atoken:=(public.special_flash_login('Momentum QA '||a)->>'token')::uuid;btoken:=(public.special_flash_login('Momentum QA '||b)->>'token')::uuid;
 assert atoken is not null and btoken is not null,'Login remains healthy';
 insert into public.special_flash_courses(id,title) values(cid,'Synthetic momentum verification');
 insert into public.special_flash_decks(id,course_id,title,cards) values(did,cid,'Class 1',jsonb_build_array(jsonb_build_object('id',card,'front','Welcome','back','歡迎')));
 insert into public.special_flash_enrollments(account_id,course_id,all_decks) values(a,cid,true),(b,cid,true),(hidden,cid,true);
 insert into public.special_learning_events(account_id,course_id,event_key,kind,points,occurred_at) values
  (a,cid,'before','card',150,now()-interval '24 hours 0.000001 seconds'),
  (a,cid,'boundary','card',10,now()-interval '24 hours'),
  (a,cid,'recent','blank',5,now()-interval '12 hours'),
  (a,cid,'now','polysemy',5,now()),(hidden,cid,'hidden','card',1000,now());
 r:=public.special_flash_team_effort(atoken)->'courses'->0;
 assert (r->>'total_cards')::int=170 and (r->>'last_24h_questions')::int=20 and (r->>'total_before_24h')::int=150,'Exact rolling 24h boundary';
 assert jsonb_array_length(r->'members')=2,'Hidden account excluded';
 delete from public.special_learning_events where account_id=a;
 insert into public.special_learning_events(account_id,course_id,event_key,kind,points,occurred_at) values
  (a,cid,'card:'||did||':round:1:'||card,'card',1,'2026-09-15T16:00:00Z'),
  (a,cid,'blank:l2d1:attempt:0:2','blank',1,'2026-09-16T08:00:00Z'),
  (a,cid,'polysemy:lesson-1:listed:attempt:word','polysemy',1,'2026-09-16T15:59:59.999Z'),
  (a,cid,'next-day','card',1,'2026-09-16T16:00:00Z');
 r:=public.special_flash_learning_details(atoken,cid,'2026-09-16','2026-09-16');
 assert (r->>'questions')::int=3 and jsonb_array_length(r->'rows')=3,'Hong Kong day boundaries';
 assert exists(select 1 from jsonb_array_elements(r->'rows') x where x->>'front'='Welcome' and x->>'exercise'=did::text),'Card source';
 assert (public.special_flash_learning_details(btoken,cid,'2026-09-16','2026-09-16')->>'total')::int=0,'Per-account history isolation';
 begin perform public.special_flash_learning_details(null,cid,'2026-09-16','2026-09-16');exception when insufficient_privilege then denied:=true;end;
 assert denied,'Anonymous history denied';
 r:=public.special_flash_learning_summary(atoken,cid);
 assert exists(select 1 from jsonb_array_elements(r->'daily') d where d->>'date'='2026-09-16' and (d->>'cards')::int=1 and (d->>'blanks')::int=1 and (d->>'words')::int=1),'Daily breakdowns';
 assert not has_table_privilege('anon','public.special_learning_events','SELECT'),'No direct public event access';
end $$;
rollback;
select 'PASS: login, exact 24h growth, hidden-member exclusion, private dated records and day breakdowns. All synthetic data rolled back.' result;
