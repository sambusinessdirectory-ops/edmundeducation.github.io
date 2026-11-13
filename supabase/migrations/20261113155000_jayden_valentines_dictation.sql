-- Add Jayden's second Reading Text 2 dictation and generalize the existing
-- private quiz RPCs to derive each module's sentence count from its hash set.
begin;

insert into public.junior_exam_module_access(module_key, student_id)
values ('valentines-day-landmines-2026', 'df2a3ba9-25be-4b0c-823a-304d4c29c2ba'::uuid)
on conflict do nothing;

insert into public.junior_quiz_sentence_hashes(module_key,sentence_number,answer_sha256)
values
  ('valentines-day-landmines-2026', 1, '2476f06588a4cdeb48aa31f3b1476ccb3de3a8d90c3b1c818fef18304a1d98a5'),
  ('valentines-day-landmines-2026', 2, '91bff06416843fdf61a3584d708627e202945e1153132f7e5d23583198226f06'),
  ('valentines-day-landmines-2026', 3, '299e063dfddbc9d1923bec33074c7d634674ff0f25e08296f855d82033954f0a'),
  ('valentines-day-landmines-2026', 4, 'aca4ea966fc846977b1148a1798da961711aace161984b8f1c5f55b6969685f6'),
  ('valentines-day-landmines-2026', 5, 'ab2a6d255cc3b7917998ea38d4a89dfac119e989d35fc5c7f9656ff8be927345'),
  ('valentines-day-landmines-2026', 6, '96320a159f55dacc42d269d3d165c7fe6e1d6fd1c3a7c4b11ce865e4cb297aea'),
  ('valentines-day-landmines-2026', 7, '95bbac57793941a97f6a22a7e629efaf31ec33655ab1f0e5da9c414b74fa8823'),
  ('valentines-day-landmines-2026', 8, '3207d63b7f6a536669786ca72626fccc4453ca70758d9dd6b863f3ea07dd0bde'),
  ('valentines-day-landmines-2026', 9, '18d4a63203d9ed08c73fe82bf9d3b77658f5d310073bde1ff7a9300b46a3ffa9'),
  ('valentines-day-landmines-2026', 10, '0ddcd2a37eb175247e8f75c817f808240ff3bcc9f05a7f3a0dcea4b95111ee93'),
  ('valentines-day-landmines-2026', 11, '7cf8b2f269e79f8b9d8aa441bbb9e305742c06d01c05a6eb2841438f7764cc36'),
  ('valentines-day-landmines-2026', 12, '725bcd19267f6db4195281b476978e9daecf0fa1e5acbd571817306f815217ad'),
  ('valentines-day-landmines-2026', 13, 'bbe6d96dafdf912ca97dbe7d129dcd00e1deca6e1509d981d7f5c95229d73dfe'),
  ('valentines-day-landmines-2026', 14, 'cbe90eaf459443e2e1cc859fb11b49561a188d65555d9e94f55af70091b93379'),
  ('valentines-day-landmines-2026', 15, '677a9ca6938cf5ceb69c7fd068e60c9cd2ba963de640ebd1fd8d25a12a4410fe'),
  ('valentines-day-landmines-2026', 16, '0e71b155475f40e203aeb35e4a6c1fe6d89f9530f36c838a35226aa83e6dc512'),
  ('valentines-day-landmines-2026', 17, '951a01b72d5daef29bb49f820d796b5b6c3f0a5c017098d8d0687a534afc394c'),
  ('valentines-day-landmines-2026', 18, 'd77ae4194b9d64be13a6c80003ca74faf94472e083ac1bb063fb68b920fd65aa'),
  ('valentines-day-landmines-2026', 19, 'dbad7d0244822cc16297c4af0c7a3fc4ae44b82249e2037c80ad13d0911215ff'),
  ('valentines-day-landmines-2026', 20, 'c8bd7aa3aebdbb1f039c698995981fc16bf11a116c5b6322865d040712404b45'),
  ('valentines-day-landmines-2026', 21, '2f36810bbdb95a584d762f1afe2b49a3696f634f3be251a1d85879c80202241e'),
  ('valentines-day-landmines-2026', 22, 'fca8fa7f7ca3d46df30f8a2d8ff0adc52a54b88d20f4314bb280a656a12a745e'),
  ('valentines-day-landmines-2026', 23, 'f50da6ce0c0d655c06a0668a94b7ca80df27813ad688efb72a84117d1194ef7a'),
  ('valentines-day-landmines-2026', 24, '4cf5e6f71d9e8719ea72db76dbc560aede103ef422a7efc9296904ef6ba06c1f'),
  ('valentines-day-landmines-2026', 25, 'e57987d1018b20475b3f8a8a8d915dfd869b122aff503f2bc1a15f6f66965d07'),
  ('valentines-day-landmines-2026', 26, '72c1a90b73fc965f98e05d98f5b6bee27b810d066b39157468868c5291abd3d2'),
  ('valentines-day-landmines-2026', 27, '89355824fefe18161facd6fdf65543dd6f0740f37cc8ee9b0bef7d54f1d34e24'),
  ('valentines-day-landmines-2026', 28, '7ceb27f5dcf11c7d171fa36bbd509243e7d512472785329b14863fa059e4b888'),
  ('valentines-day-landmines-2026', 29, 'e2d981ed6f6ecc00bac9c1ddf231381e6cef0fab854a85ffd429f065430ad02e'),
  ('valentines-day-landmines-2026', 30, 'f0f2bc60cafe3a3a3ded78fd438b8c6f9f339a2a03f76f4b118fb17d0951fb20'),
  ('valentines-day-landmines-2026', 31, 'c0450a390a4255a83ff1306df942bc1b5164dfffc925ea1e060f199df3f91d38')
on conflict(module_key,sentence_number) do update set answer_sha256=excluded.answer_sha256;

create or replace function public.junior_quiz_list_responses(p_token uuid,p_module_key text)
returns table(sentence_number integer,answer text,correct boolean,attempts integer,submitted_at timestamptz)
language plpgsql stable security definer set search_path = ''
as $$
declare v_student_id uuid;
begin
  if auth.uid() is null or p_token is null or p_module_key is null then
    raise exception 'Student authentication is required' using errcode='42501';
  end if;
  select session_row.student_id into v_student_id
  from public.flashcard_student_sessions session_row
  join public.flashcard_students student on student.id=session_row.student_id
  join public.junior_exam_module_access access_row on access_row.student_id=student.id and access_row.module_key=p_module_key
  where session_row.token=p_token and session_row.expires_at>pg_catalog.now() and student.deleted_at is null
    and student.id='df2a3ba9-25be-4b0c-823a-304d4c29c2ba'::uuid
    and exists(select 1 from public.junior_quiz_sentence_hashes key_row where key_row.module_key=p_module_key)
  limit 1;
  if v_student_id is null then raise exception 'This module is not assigned to this student' using errcode='42501'; end if;
  return query select response.sentence_number,response.answer,response.correct,response.attempts,response.submitted_at
    from public.junior_quiz_responses response
    where response.student_id=v_student_id and response.module_key=p_module_key
    order by response.sentence_number;
end;
$$;

create or replace function public.junior_quiz_submit(p_token uuid,p_module_key text,p_answers jsonb,p_final boolean default false)
returns jsonb language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_student_id uuid; v_key text; v_raw text; v_answer text; v_normalized text;
  v_number integer; v_expected_count integer; v_correct boolean; v_count integer:=0; v_correct_count integer:=0;
  v_results jsonb:='{}'::jsonb;
begin
  if auth.uid() is null or p_token is null or p_module_key is null then
    raise exception 'Student authentication is required' using errcode='42501';
  end if;
  if p_answers is null or pg_catalog.jsonb_typeof(p_answers)<>'object' or p_final is null
     or pg_catalog.octet_length(p_answers::text)>25000 then
    raise exception 'Invalid submission' using errcode='22023';
  end if;
  select pg_catalog.count(*)::integer into v_expected_count
    from public.junior_quiz_sentence_hashes key_row where key_row.module_key=p_module_key;
  if v_expected_count not between 1 and 39 then raise exception 'Unknown quiz module' using errcode='22023'; end if;
  select session_row.student_id into v_student_id
  from public.flashcard_student_sessions session_row
  join public.flashcard_students student on student.id=session_row.student_id
  join public.junior_exam_module_access access_row on access_row.student_id=student.id and access_row.module_key=p_module_key
  where session_row.token=p_token and session_row.expires_at>pg_catalog.now() and student.deleted_at is null
    and student.id='df2a3ba9-25be-4b0c-823a-304d4c29c2ba'::uuid
  limit 1;
  if v_student_id is null then raise exception 'This module is not assigned to this student' using errcode='42501'; end if;
  for v_key,v_raw in select item.key,item.value from pg_catalog.jsonb_each_text(p_answers) item(key,value) loop
    if v_key !~ '^[0-9]{2}$' then raise exception 'Invalid sentence number' using errcode='22023'; end if;
    v_number:=v_key::integer;
    v_answer:=pg_catalog.btrim(v_raw);
    if pg_catalog.char_length(v_answer) not between 1 and 500 then
      raise exception 'Invalid answer' using errcode='22023';
    end if;
    v_normalized:=pg_catalog.btrim(pg_catalog.regexp_replace(pg_catalog.lower(v_answer),'[^[:alnum:]]+',' ','g'));
    select key_row.answer_sha256=pg_catalog.encode(extensions.digest(v_normalized,'sha256'),'hex')
      into v_correct from public.junior_quiz_sentence_hashes key_row
      where key_row.module_key=p_module_key and key_row.sentence_number=v_number;
    if v_correct is null then raise exception 'Sentence is not part of this module' using errcode='22023'; end if;
    insert into public.junior_quiz_responses as existing(student_id,module_key,sentence_number,answer,correct,attempts,submitted_at)
      values(v_student_id,p_module_key,v_number,v_answer,v_correct,1,pg_catalog.now())
      on conflict(student_id,module_key,sentence_number) do update
      set answer=excluded.answer,correct=existing.correct or excluded.correct,attempts=existing.attempts+1,submitted_at=excluded.submitted_at;
    v_count:=v_count+1;
    v_correct_count:=v_correct_count+case when v_correct then 1 else 0 end;
    v_results:=pg_catalog.jsonb_set(v_results,array[v_key],pg_catalog.to_jsonb(v_correct),true);
  end loop;
  if v_count=0 or (p_final and v_count<>v_expected_count) then
    raise exception 'Submit at least one sentence; full submission needs every sentence' using errcode='22023';
  end if;
  insert into public.junior_quiz_submissions(student_id,module_key,submitted_count,correct_count,is_final)
    values(v_student_id,p_module_key,v_count,v_correct_count,p_final);
  return pg_catalog.jsonb_build_object('submitted',v_count,'correct',v_correct_count,'final',p_final,'results',v_results);
end;
$$;

revoke all on function public.junior_quiz_list_responses(uuid,text) from public,anon,authenticated;
revoke all on function public.junior_quiz_submit(uuid,text,jsonb,boolean) from public,anon,authenticated;
grant execute on function public.junior_quiz_list_responses(uuid,text) to authenticated;
grant execute on function public.junior_quiz_submit(uuid,text,jsonb,boolean) to authenticated;

commit;
