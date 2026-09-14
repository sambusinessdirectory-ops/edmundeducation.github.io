begin;
do $$
declare f uuid:=gen_random_uuid();w uuid;ft uuid;wt uuid;request uuid:=gen_random_uuid();r jsonb;again jsonb;k text;args jsonb;attempt jsonb; lang text; other text;
begin
 perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
 insert into public.flashcard_students(id,name,password_hash) values(f,'language-qa-'||f,extensions.crypt(gen_random_uuid()::text,extensions.gen_salt('bf')));
 insert into public.flashcard_student_sessions(student_id) values(f) returning token into ft;
 insert into public.writing_student_accounts(name,password_hash) values('language-write-qa-'||f,extensions.crypt(gen_random_uuid()::text,extensions.gen_salt('bf'))) returning id,session_token into w,wt;
 select state_key into k from flashcard_integrity.state_key_rules where enabled and v2_writable limit 1;
 args:=jsonb_build_object('p_token',ft,'p_key',k,'p_value','{}'::jsonb,'p_request_id',request,'p_expected_version',0);
 r:=public.language_learning_rpc('it','flashcard','flashcard_student_upsert_state_v2',args);
 if r->>'status'<>'accepted' then raise exception 'Save failed: %',r;end if;
 again:=public.language_learning_rpc('it','flashcard','flashcard_student_upsert_state_v2',args);
 if r<>again then raise exception 'Idempotency failed';end if;
 r:=public.language_learning_rpc('it','flashcard','flashcard_student_upsert_state_v2',args||jsonb_build_object('p_request_id',gen_random_uuid()));
 if r->>'status'<>'conflict' then raise exception 'Stale version accepted';end if;
 r:=public.language_learning_rpc('fr','flashcard','flashcard_student_get_state_v2',jsonb_build_object('p_token',ft));
 if r<>'[]' then raise exception 'French state leaked';end if;
 r:=public.language_learning_rpc('it','writing','writing_student_upsert_state',jsonb_build_object('p_token',wt,'p_key','writing-bookmarks-v1','p_value','["italian"]'::jsonb));
 r:=public.language_learning_rpc('fr','writing','writing_student_get_state',jsonb_build_object('p_token',wt));
 if r<>'[]' then raise exception 'French writing state leaked';end if;
 attempt:=jsonb_build_object('id','qa-attempt','exerciseId','italian-1','createdAt',floor(extract(epoch from now()-interval '1 minute')*1000));
 r:=public.language_learning_rpc('it','writing','writing_student_append_attempt',jsonb_build_object('p_token',wt,'p_attempt',attempt));
 if r<>'"inserted"' then raise exception 'Attempt insert failed';end if;
 r:=public.language_learning_rpc('fr','writing','writing_student_list_attempts',jsonb_build_object('p_token',wt));
 if r<>'[]' then raise exception 'Attempt leaked';end if;
 r:=public.language_learning_rpc('it','writing','writing_student_list_attempts',jsonb_build_object('p_token',wt));
 if jsonb_array_length(r)<>1 then raise exception 'Attempt not preserved';end if;
 r:=public.language_learning_rpc('it','writing','writing_student_delete_attempts_by_exercise',jsonb_build_object('p_token',wt,'p_reset_at',now(),'p_exercise_ids','["italian-1"]'::jsonb));
 if r<>'1' then raise exception 'Reset failed';end if;
 r:=public.language_learning_rpc('it','writing','writing_student_append_attempt',jsonb_build_object('p_token',wt,'p_attempt',attempt));
 if r<>'"ignored_reset"' then raise exception 'Deleted attempt resurrected';end if;
 foreach lang in array array['fr','de','es','ja','ko'] loop
  r:=public.language_learning_rpc(lang,'flashcard','flashcard_student_get_state_v2',jsonb_build_object('p_token',ft));
  assert r='[]','A new language inherited progress';
  r:=public.language_learning_rpc(lang,'flashcard','flashcard_student_upsert_state_v2',args||jsonb_build_object('p_value',jsonb_build_object('language',lang),'p_request_id',gen_random_uuid()));
  assert r->>'status'='accepted','New language save rejected';
  r:=public.language_learning_rpc(lang,'writing','writing_student_upsert_state',jsonb_build_object('p_token',wt,'p_key','writing-bookmarks-v1','p_value',jsonb_build_array(lang)));
  r:=public.language_learning_rpc(lang,'writing','writing_student_append_attempt',jsonb_build_object('p_token',wt,'p_attempt',attempt));
  assert r='"inserted"','Language attempt ID collided';
  perform public.language_learning_access(lang,'writing',jsonb_build_object('p_token',wt),false);
 end loop;
 foreach lang in array array['fr','de','es','ja','ko'] loop
  r:=public.language_learning_rpc(lang,'flashcard','flashcard_student_get_state_v2',jsonb_build_object('p_token',ft));
  assert r->0->'value'->>'language'=lang,'Flashcard state crossed language boundary';
  r:=public.language_learning_rpc(lang,'writing','writing_student_get_state',jsonb_build_object('p_token',wt));
  assert r->0->'value'->>0=lang,'Writing state crossed language boundary';
  r:=public.language_learning_rpc(lang,'writing','writing_student_list_attempts',jsonb_build_object('p_token',wt));
  assert jsonb_array_length(r)=1,'Independent attempt missing';
 end loop;

 begin
  perform public.language_learning_rpc('it','writing','writing_student_get_state',jsonb_build_object('p_token',ft));
  raise exception 'Wrong-system token accepted';
 exception when insufficient_privilege then null;end;
 begin
  perform public.language_learning_access('it','writing',jsonb_build_object('p_token',wt,'p_access','{}'::jsonb),true);
  raise exception 'Student changed scope';
 exception when insufficient_privilege then null;end;
end $$;
select 'PASS: language/system isolation, CAS, idempotency, attempts, reset, authorization; all fixtures rolled back' result;
rollback;
