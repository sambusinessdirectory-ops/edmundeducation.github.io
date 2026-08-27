-- Transaction-only integration test. No existing student data is read or edited;
-- every synthetic student, session, attempt and result is rolled back.
begin;
do $$
declare
  v_student uuid:=gen_random_uuid(); v_other uuid:=gen_random_uuid();
  v_token uuid:=gen_random_uuid(); v_other_token uuid:=gen_random_uuid();
  v_payload jsonb; v_attempt uuid; v_answers jsonb; v_answer text;
begin
  if not public._reading_comprehension_mark_answer('  TRUE ', '{"accepted":["TRUE"]}', '{}','q1') then raise exception 'Case/space normalization'; end if;
  if not public._reading_comprehension_mark_answer('C, A', '{"accepted":["A, C"]}', '{}','q1') then raise exception 'Multiple-choice order'; end if;
  if public._reading_comprehension_mark_answer('A', '{"accepted":["A","B"],"unorderedGroup":["q1","q2"]}', '{"q1":"A","q2":"A"}','q1') then raise exception 'Duplicate choices'; end if;
  if public._reading_comprehension_mark_answer('A', '{"accepted":["A"],"requiresReview":true}', '{}','q1') then raise exception 'Review-only grading'; end if;
  if exists(select 1 from public.reading_comprehension_catalogue c cross join lateral jsonb_each(c.answer_key) k
    where not coalesce((k.value->>'requiresReview')::boolean,false)
    and not public._reading_comprehension_mark_answer(k.value->'accepted'->>0,k.value,'{}',k.key)) then raise exception 'Accepted answer round-trip'; end if;
  perform set_config('request.jwt.claim.sub','',true);
  perform set_config('request.jwt.claims','{}',true);
  begin
    perform public.reading_comprehension_current_attempt(v_token,'p1-001');
    raise exception 'Unauthenticated request accepted';
  exception when insufficient_privilege then null; end;
  insert into public.flashcard_students(id,name,password_hash) values
    (v_student,'__reading_qa_'||v_student::text,'test-fixture-not-a-password'),
    (v_other,'__reading_qa_'||v_other::text,'test-fixture-not-a-password');
  insert into public.flashcard_student_sessions(token,student_id) values(v_token,v_student),(v_other_token,v_other);
  perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
  select answer_key->'q1'->'accepted'->>0 into v_answer from public.reading_comprehension_catalogue where id='p1-001';
  v_payload:=public.reading_comprehension_save_attempt(v_token,null,'p1-001',jsonb_build_object('q1',v_answer),12345,true,false);
  v_attempt:=(v_payload->>'attempt_id')::uuid;
  if v_payload->>'status'<>'in_progress' or (v_payload->>'correct_count')::integer<>1 then raise exception 'Partial submit grading'; end if;
  if (public.reading_comprehension_current_attempt(v_token,'p1-001')->>'attempt_id')::uuid<>v_attempt then raise exception 'Draft restoration'; end if;
  if public.reading_comprehension_current_attempt(v_other_token,'p1-001') is not null then raise exception 'Another student can see draft'; end if;
  begin
    perform public.reading_comprehension_save_attempt(v_other_token,v_attempt,'p1-001','{}',0,false,false);
    raise exception 'Another student can edit attempt';
  exception when no_data_found then null; end;
  begin
    perform public.reading_comprehension_save_attempt(v_token,v_attempt,'p1-002','{}',0,false,false);
    raise exception 'Cross-article update accepted';
  exception when no_data_found then null; end;
  begin
    perform public.reading_comprehension_save_attempt(v_token,null,'p1-008','{}',0,false,false);
    raise exception 'Held article accepted';
  exception when invalid_parameter_value then null; end;
  v_payload:=public.reading_comprehension_save_attempt(v_token,v_attempt,'p1-001','{"q1":"__incorrect_test_answer__"}',12345,false,false);
  if (v_payload->>'answered_count')::integer<>0 then raise exception 'Edited answer retains old correctness'; end if;
  v_payload:=public.reading_comprehension_save_attempt(v_token,v_attempt,'p1-001','{}',12345,false,false);
  if v_payload->'answers'<>'{}'::jsonb then raise exception 'Cleared answer reappeared'; end if;
  select jsonb_object_agg(k.key,k.value->'accepted'->>0) into v_answers from public.reading_comprehension_catalogue c cross join lateral jsonb_each(c.answer_key) k where c.id='p1-001';
  v_payload:=public.reading_comprehension_save_attempt(v_token,v_attempt,'p1-001',v_answers,54321,true,false);
  if v_payload->>'status'<>'submitted' or (v_payload->>'correct_count')::integer<>13 then raise exception 'Full submission'; end if;
  if public.reading_comprehension_current_attempt(v_token,'p1-001') is not null then raise exception 'Finalized attempt resumed as draft'; end if;
  v_payload:=public.reading_comprehension_save_attempt(v_token,null,'p1-002','{"q1":"TRUE"}',100,true,true);
  if v_payload->>'status'<>'force_submitted' then raise exception 'Timer force submission'; end if;
  v_payload:=public.reading_comprehension_save_attempt(v_token,null,'p1-052','{"q9":"A"}',100,true,false);
  if (v_payload->>'review_count')::integer<>1 or (v_payload->>'answered_count')::integer<>0 then raise exception 'Review-only question counted'; end if;
  if has_table_privilege('authenticated','public.reading_comprehension_catalogue','SELECT') then raise exception 'Private marking keys exposed'; end if;
  if has_function_privilege('anon','public.reading_comprehension_current_attempt(uuid,text)','EXECUTE') then raise exception 'Anonymous draft access'; end if;
end;
$$;
rollback;
select 'Reading integration checks passed; all synthetic records rolled back' as result,
  (select count(*) from public.reading_comprehension_attempts) as real_attempts,
  (select count(*) from public.reading_comprehension_question_results) as real_results;
