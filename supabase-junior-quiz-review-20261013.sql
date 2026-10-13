-- Card 72: Jayden-only Last Train dictation. The static reading text is separate;
-- this stores sentence hashes and each student's submitted text, never plaintext keys.
begin;

insert into public.junior_exam_module_access(module_key, student_id)
values ('the-last-train-2026', 'df2a3ba9-25be-4b0c-823a-304d4c29c2ba'::uuid)
on conflict do nothing;

create table if not exists public.junior_quiz_sentence_hashes (
  module_key text not null,
  sentence_number integer not null check(sentence_number between 1 and 39),
  answer_sha256 text not null check(answer_sha256 ~ '^[0-9a-f]{64}$'),
  primary key(module_key, sentence_number)
);
create table if not exists public.junior_quiz_responses (
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  module_key text not null,
  sentence_number integer not null check(sentence_number between 1 and 39),
  answer text not null check(char_length(answer) between 1 and 500),
  correct boolean not null default false,
  attempts integer not null default 1 check(attempts between 1 and 10000),
  submitted_at timestamptz not null default now(),
  primary key(student_id, module_key, sentence_number),
  foreign key(module_key, sentence_number) references public.junior_quiz_sentence_hashes(module_key, sentence_number)
);
create table if not exists public.junior_quiz_submissions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  module_key text not null,
  submitted_count integer not null check(submitted_count between 1 and 39),
  correct_count integer not null check(correct_count between 0 and 39),
  is_final boolean not null default false,
  submitted_at timestamptz not null default now()
);
create index if not exists junior_quiz_submissions_student_module_idx on public.junior_quiz_submissions(student_id,module_key,submitted_at desc);

alter table public.junior_quiz_sentence_hashes enable row level security;
alter table public.junior_quiz_responses enable row level security;
alter table public.junior_quiz_submissions enable row level security;
revoke all on public.junior_quiz_sentence_hashes, public.junior_quiz_responses, public.junior_quiz_submissions from public, anon, authenticated;

insert into public.junior_quiz_sentence_hashes(module_key,sentence_number,answer_sha256)
values
  ('the-last-train-2026', 1, '49c5c8df95cd6a386e6619891e45448647fb824363c5610c5013054bd1cba980'),
  ('the-last-train-2026', 2, 'b77ecd702d846d10d8d1e301dc9620d3ceb3fee1af417f231f7cad4450812676'),
  ('the-last-train-2026', 3, '44801a4c72140c7daf97b51cdcfceba8977627926dbaab7a1fbbbd82d80da25d'),
  ('the-last-train-2026', 4, '8c529c5e73bc4f1adbfadd419424644dc7a16cdba8088ced1beedd3e2bd5c7ae'),
  ('the-last-train-2026', 5, '0f2e463f99e7750329cfdab3a1b88371b7ae9615e201377a73bed877ef7b4edd'),
  ('the-last-train-2026', 6, '15d25c5e3ac0ec1a6c36146e2d1271885fc48439003031554c3cc61546344aee'),
  ('the-last-train-2026', 7, '1dc33f9e9e016d1916b3d1ced764254d0431eae976fc52705ced095e567e8c4c'),
  ('the-last-train-2026', 8, 'aa63c3b182e2130de67f0a6cb0d2dbb4fcc2fc44fea9717a110e1204dc306910'),
  ('the-last-train-2026', 9, '5978ca63ea208ee4dd5105e21af85288401fe67f0c483a86566a422456052464'),
  ('the-last-train-2026', 10, '61f1090ba3650687a495c523961c0fa2f62f32d6795e44a5024a8a70475e5e8d'),
  ('the-last-train-2026', 11, 'e215440ad715718c0ba56a0f682f7f83a5a5d713f97ce000db8119797e918e92'),
  ('the-last-train-2026', 12, '49a90273c625cf40d61de4a186e3e74bf5721664bae5fa190394198700899e5b'),
  ('the-last-train-2026', 13, 'e4e1f9e695419c560f76cf6064e8e3fd3f0bc8cd7ad6d08d894615fa168193ce'),
  ('the-last-train-2026', 14, 'e215e32bf0eaa5a6012466429debee7a56effde990d44594c822575c06ef5b69'),
  ('the-last-train-2026', 15, '0e3f8095ba6142bbd82a5fcfe3f2aa9bd06694d310cee2328643a2197ade1142'),
  ('the-last-train-2026', 16, 'c75189855b901a10650204ef604adfcbf755639a5dc007808eb8994f219002c2'),
  ('the-last-train-2026', 17, '66d22149aac7b9315ed9a524b87341e0b49f92b848d87a58b6f95e3663ce40dc'),
  ('the-last-train-2026', 18, 'b95ab33a5b91c2eb6d35465c99f5c203b5f2a3c4e1a654c889ebf7c71b58b8d9'),
  ('the-last-train-2026', 19, 'fd509b7c7a6c0b2a74791c94806ca3beb7be8544efca65c4c0d0dbfda5793a65'),
  ('the-last-train-2026', 20, '33743c0e6d0c9ff5a40de93fb08579ecb5531e6a99b1254be6886a834806553c'),
  ('the-last-train-2026', 21, 'd1bc8584ae2319259dc6bfb64ec1c4bee836dbdef0e22d2807a857ad3d5df603'),
  ('the-last-train-2026', 22, '348f87fd392850b32f0c3972d511af9cb9ff564a4d77392d08a99574fc86bdeb'),
  ('the-last-train-2026', 23, '946be3823206ebefabb3ef2c562434b5289688a6482d6af35264c5c938c922c1'),
  ('the-last-train-2026', 24, '916608efd4ae0cc102cd5c28e8a60c7ba7be5fdfbd0d0eb88f3bcd45baf30a71'),
  ('the-last-train-2026', 25, '270e82ab9e150bc6a6c3ea5772a2bde3f21c4b2659aeb17d9f6275ba8439aa54'),
  ('the-last-train-2026', 26, '4f4ec5219dbb204adc89af2a3113fd4203e9d44a9a2ee8841663456d5b7b0165'),
  ('the-last-train-2026', 27, 'ed8ff99ccb2549cd322bdb10a9e03ed5e63eaccaf66e27694cda25eb631fe0f8'),
  ('the-last-train-2026', 28, '55c4f9ff56335fad6941f6c61bede253a16c1800b5134f7efe6167c824b484e0'),
  ('the-last-train-2026', 29, '35379d9c009e290d702b72abf3f5f9bdbaa7e00a63fc37b5174fc3825c8095e3'),
  ('the-last-train-2026', 30, 'f8deea0169b4947401c709f8b0a9f562ecb56a642579936e0cd1b01ca1f67625'),
  ('the-last-train-2026', 31, '1e1b5ddeeaaf607859e7ef6d97e31d15167702da7369185a7ce04307c2ec8e59'),
  ('the-last-train-2026', 32, '45f789fc17ac1b7fa8772479ccf6820e2a22ba15a681e9e1c6a30f8c6f4d8085'),
  ('the-last-train-2026', 33, '7c642731bbd4251fe6880388058417d748b1e5562c46a14f4a491db995c61a9b'),
  ('the-last-train-2026', 34, '3a7a6928c1076c05e3e1ed8d651ee833c62f4a4b4d727ea606c199e942ef5b31'),
  ('the-last-train-2026', 35, 'a99e5e6da3ce8f88db421c84f3a2e4cd0ccf736e3e77fcf63cc109e10f0512b2'),
  ('the-last-train-2026', 36, '00d38cb0f9cc4ff5fa7cbc1a68f3b581df9ddbf161dc5f3369d284085fbb4d90'),
  ('the-last-train-2026', 37, 'f2792d7ec8a7b9532695a3bad6d91f9418c71662b97132daeeb3056573d88f78'),
  ('the-last-train-2026', 38, '1fd697dd342cec3764630c61b01bbdae119cb723c0aa069efabb95cc4efc1c03'),
  ('the-last-train-2026', 39, '2fab2a33f11fe914a7066bb48232d5b46fd5d9950390fa39bd865d6e1453c454')
on conflict(module_key,sentence_number) do update set answer_sha256=excluded.answer_sha256;

create or replace function public.junior_quiz_list_responses(p_token uuid,p_module_key text)
returns table(sentence_number integer,answer text,correct boolean,attempts integer,submitted_at timestamptz)
language plpgsql stable security definer set search_path = ''
as $$
declare v_student_id uuid;
begin
  if auth.uid() is null or p_token is null or p_module_key <> 'the-last-train-2026' then
    raise exception 'Student authentication is required' using errcode='42501';
  end if;
  select session_row.student_id into v_student_id
  from public.flashcard_student_sessions session_row
  join public.flashcard_students student on student.id=session_row.student_id
  join public.junior_exam_module_access access_row on access_row.student_id=student.id and access_row.module_key=p_module_key
  where session_row.token=p_token and session_row.expires_at>pg_catalog.now() and student.deleted_at is null
    and student.id='df2a3ba9-25be-4b0c-823a-304d4c29c2ba'::uuid
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
  v_number integer; v_correct boolean; v_count integer:=0; v_correct_count integer:=0;
  v_results jsonb:='{}'::jsonb;
begin
  if auth.uid() is null or p_token is null or p_module_key <> 'the-last-train-2026' then
    raise exception 'Student authentication is required' using errcode='42501';
  end if;
  if p_answers is null or pg_catalog.jsonb_typeof(p_answers)<>'object' or p_final is null
     or pg_catalog.octet_length(p_answers::text)>25000 then
    raise exception 'Invalid submission' using errcode='22023';
  end if;
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
    if v_number not between 1 and 39 or pg_catalog.char_length(v_answer) not between 1 and 500 then
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
  if v_count=0 or (p_final and v_count<>39) then
    raise exception 'Submit at least one sentence; full submission needs all 39' using errcode='22023';
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
