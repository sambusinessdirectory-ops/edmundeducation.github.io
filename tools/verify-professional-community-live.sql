-- Run as one transaction. Every QA account, response, event and session rolls back.
begin;
do $$
declare a uuid:=gen_random_uuid();b uuid:=gen_random_uuid();teacher uuid:=gen_random_uuid();cid uuid:=gen_random_uuid();did uuid:=gen_random_uuid();card uuid:=gen_random_uuid();atoken uuid;btoken uuid;ttoken uuid:=gen_random_uuid();batch uuid:=gen_random_uuid();response_id uuid:=gen_random_uuid();r jsonb;denied boolean:=false;
begin
 insert into public.special_flash_accounts(id,username,role) values(a,'Community QA '||a,'student'),(b,'Community QA '||b,'student');
 insert into public.special_flash_accounts(id,username,role,password_hash) values(teacher,'Community QA '||teacher,'admin','synthetic-not-a-login-hash');
 insert into public.special_flash_sessions(token_hash,account_id) values(extensions.digest(ttoken::text,'sha256'),teacher);
 atoken:=(public.special_flash_login('Community QA '||a)->>'token')::uuid;btoken:=(public.special_flash_login('Community QA '||b)->>'token')::uuid;
 assert atoken is not null and btoken is not null,'Student login';
 insert into public.special_flash_courses(id,title) values(cid,'Synthetic community verification');
 insert into public.special_flash_decks(id,course_id,title,cards) values(did,cid,'Class 1',jsonb_build_array(jsonb_build_object('id',card,'front','Welcome','back','歡迎')));
 insert into public.special_flash_enrollments(account_id,course_id,all_decks) values(a,cid,true),(b,cid,true);
 perform public.special_flash_save(atoken,did,1,jsonb_build_object(card,'green'),null,0,gen_random_uuid());
 begin perform public.special_flash_save(atoken,did,1,'{}',null,0,gen_random_uuid());exception when sqlstate 'PT409' then denied:=true;end;
 assert denied,'Conflict must return PT409 promptly';denied:=false;
 perform public.special_flash_assessment_submit(response_id,'[1,2,3,4,5,6,7,7]','Synthetic response; rolled back');
 perform public.special_flash_assessment_submit(response_id,'[1,2,3,4,5,6,7,7]','Synthetic response; rolled back');
 assert (select count(*) from public.special_course_assessments where id=response_id)=1,'Idempotent feedback';
 begin perform public.special_flash_assessment_results(atoken);exception when insufficient_privilege then denied:=true;end;
 assert denied,'Student cannot read feedback';
 r:=public.special_flash_assessment_results(ttoken);assert exists(select 1 from jsonb_array_elements(r->'rows') x where x->>'id'=response_id::text),'Admin feedback';
 perform public.special_flash_encouragement(atoken,cid,batch,200,0,0);perform public.special_flash_encouragement(atoken,cid,batch,200,0,0);
 r:=public.special_flash_encouragement(btoken,cid,gen_random_uuid(),10,2,3);assert (r->>'heart')::int=210 and (r->>'thumb')::int=2,'Shared idempotent encouragement';
 r:=jsonb_build_array(jsonb_build_object('deck',did,'card',card,'attempt','QA1','mark','red'),jsonb_build_object('deck',did,'card',card,'attempt','QA2','mark','green'));
 perform public.special_flash_record_marks(atoken,r);perform public.special_flash_record_marks(atoken,r);
 r:=public.special_flash_card_records(atoken,cid);assert (r->0->>'attempts')::int=2,'Deduplicated records';assert public.special_flash_card_records(btoken,cid)='[]'::jsonb,'Private records';
 perform public.special_flash_learning_state(atoken,'draft:l2d1:hard:first','{"credited":["1:2","1:3"],"contentVersion":1}');
 perform public.special_flash_learning_state(atoken,'draft:l2d1:last','{"difficulty":"hard","hint":"first"}');
 r:=public.special_flash_exercise_progress(atoken);assert (r->'drafts'->'draft:l2d1:hard:first'->>'credited')::int=2 and r->'drafts'->'draft:l2d1:last'->>'hint'='first','Mode progress';
 insert into public.special_learning_events(account_id,course_id,event_key,kind,points) values(a,cid,'qa-card','card',10),(a,cid,'qa-blank','blank',3),(a,cid,'qa-poly','polysemy',2);
 r:=public.special_flash_team_effort(atoken)->'courses'->0;assert (r->>'total_cards')::int=15,'Team total';
 assert not has_table_privilege('anon','public.special_course_assessments','SELECT'),'Anonymous direct read denied';
end $$;
rollback;
select 'PASS: synthetic login/save/conflict, anonymous feedback privacy, peer encouragement, private records and mode progress; all QA data rolled back.' result;
