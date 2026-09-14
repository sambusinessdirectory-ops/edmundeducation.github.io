begin;
create schema if not exists language_learning;
revoke all on schema language_learning from public,anon,authenticated;
create table language_learning.state (
 language text not null check(language in ('it','fr')), system text not null check(system in ('flashcard','writing')),
 student_id uuid not null, key text not null, value jsonb not null,
 version bigint not null default 1, value_checksum text not null, updated_at timestamptz not null default now(),
 primary key(language,system,student_id,key)
);
create table language_learning.receipts (
 language text not null, system text not null, student_id uuid not null, request_id uuid not null,
 fingerprint text not null, receipt jsonb not null, primary key(language,system,student_id,request_id)
);
create table language_learning.attempts (
 language text not null check(language in ('it','fr')), student_id uuid not null references public.writing_student_accounts(id) on delete cascade,
 attempt_id text not null, exercise_id text not null, attempt jsonb not null, created_at timestamptz not null,
 primary key(language,student_id,attempt_id)
);
create index language_attempt_history on language_learning.attempts(language,student_id,created_at desc,attempt_id desc);
create table language_learning.resets (
 language text not null, student_id uuid not null references public.writing_student_accounts(id) on delete cascade,
 exercise_id text not null, reset_at timestamptz not null, primary key(language,student_id,exercise_id)
);
alter table language_learning.state enable row level security;
alter table language_learning.receipts enable row level security;
alter table language_learning.attempts enable row level security;
alter table language_learning.resets enable row level security;
revoke all on all tables in schema language_learning from public,anon,authenticated;
-- This RPC accepts only a fixed set of learning-record operations. Account login
-- continues through the existing validated account services; no English records
-- are read or copied into the new language stores.
create function public.language_learning_rpc(p_language text,p_system text,p_operation text,p_args jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 student uuid; actor text; k text; v jsonb; result jsonb; old language_learning.state;
 request uuid; expected bigint; fingerprint text; oldfp text; receipt jsonb; checksum text;
 op text; at timestamptz; cutoff timestamptz; n integer; attemptid text; exercise text;
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 if p_language is null or p_language not in ('it','fr') or p_system is null or p_system not in ('flashcard','writing') or p_args is null or jsonb_typeof(p_args)<>'object' then raise exception 'Invalid language system';end if;
 if p_operation is null or p_operation not like p_system||'_%' then raise exception 'Invalid operation';end if;
 actor:=case when p_operation like '%_admin_%' then 'admin' else 'student' end;
 op:=substr(p_operation,length(p_system)+length(actor)+3);
 if op not in ('get_state','get_state_v2','get_student_state','get_student_state_v2','upsert_state','upsert_state_v2','upsert_student_state','upsert_student_state_v2','append_attempt','append_student_attempt','list_attempts','list_student_attempts','delete_attempts_by_exercise','delete_student_attempts_by_exercise') then raise exception 'Unsupported language record operation';end if;
 if p_system='flashcard' then
  if actor='student' then student:=public.flashcard_session_student_id((p_args->>'p_token')::uuid);
  else
   if not public.flashcard_admin_ok(p_args->>'p_admin_name',p_args->>'p_admin_password') then raise exception 'Invalid admin credentials' using errcode='42501';end if;
   select id into student from public.flashcard_students where name=btrim(p_args->>'p_student_name') and deleted_at is null;
  end if;
 else
  if actor='student' then student:=public._writing_practice_student_id((p_args->>'p_token')::uuid);
  else student:=public._writing_practice_admin_student_id(p_args->>'p_admin_name',p_args->>'p_admin_password',p_args->>'p_student_name');end if;
 end if;
 if student is null then raise exception 'Invalid student session' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_language||':'||p_system||':'||student::text,90812));
 if op in ('get_state','get_state_v2','get_student_state','get_student_state_v2') then
  select coalesce(jsonb_agg(jsonb_build_object('key',s.key,'value',s.value,'version',s.version,'value_checksum',s.value_checksum,'updated_at',s.updated_at) order by s.key),'[]') into result from language_learning.state s where language=p_language and system=p_system and student_id=student;
  return result;
 elsif op in ('upsert_state','upsert_state_v2','upsert_student_state','upsert_student_state_v2') then
  k:=p_args->>'p_key';v:=p_args->'p_value';
  if k is null or length(k) not between 1 and 150 or v is null or octet_length(v::text)>16000000 then raise exception 'Invalid state';end if;
  if p_system='flashcard' then
   if not exists(select 1 from flashcard_integrity.state_key_rules where state_key=k and enabled and v2_writable) then raise exception 'Invalid state key';end if;
   if op not like '%_v2' then raise exception 'Language Flashcards require versioned saves';end if;
  elsif k not in ('writing-bookmarks-v1','writing-paragraph-mastery-v1','writing-progress-preferences-v1') then raise exception 'Invalid writing state key';end if;
  select * into old from language_learning.state where language=p_language and system=p_system and student_id=student and key=k;
  checksum:=flashcard_integrity.jsonb_checksum(v);
  if p_system='flashcard' then
   request:=(p_args->>'p_request_id')::uuid;expected:=(p_args->>'p_expected_version')::bigint;
   if request is null or expected is null or expected<0 then raise exception 'Invalid mutation';end if;
   fingerprint:=flashcard_integrity.jsonb_checksum(jsonb_build_object('key',k,'value',v,'version',expected,'actor',actor));
   select r.fingerprint,r.receipt into oldfp,receipt from language_learning.receipts r where language=p_language and system=p_system and student_id=student and request_id=request;
   if found then
    if oldfp<>fingerprint then return flashcard_integrity.build_receipt(request,actor,k,'rejected','request_id_reuse',expected,coalesce(old.version,0),old.value_checksum,null,now());end if;
    return receipt;
   end if;
   if expected<>coalesce(old.version,0) then receipt:=flashcard_integrity.build_receipt(request,actor,k,'conflict','version_conflict',expected,coalesce(old.version,0),old.value_checksum,null,now());
   else
    insert into language_learning.state(language,system,student_id,key,value,version,value_checksum) values(p_language,p_system,student,k,v,expected+1,checksum)
    on conflict(language,system,student_id,key) do update set value=excluded.value,version=excluded.version,value_checksum=excluded.value_checksum,updated_at=now();
    receipt:=flashcard_integrity.build_receipt(request,actor,k,'accepted','saved',expected,expected+1,checksum,null,now());
   end if;
   insert into language_learning.receipts values(p_language,p_system,student,request,fingerprint,receipt);return receipt;
  end if;
  insert into language_learning.state(language,system,student_id,key,value,value_checksum) values(p_language,p_system,student,k,v,checksum)
  on conflict(language,system,student_id,key) do update set value=excluded.value,version=language_learning.state.version+1,value_checksum=excluded.value_checksum,updated_at=now();return 'true';
 elsif p_system='writing' and op in ('append_attempt','append_student_attempt') then
  v:=p_args->'p_attempt';attemptid:=v->>'id';exercise:=v->>'exerciseId';
  if coalesce(jsonb_typeof(v),'')<>'object' or coalesce(length(attemptid),0) not between 1 and 240 or coalesce(length(exercise),0) not between 1 and 180 or octet_length(v::text)>200000 or coalesce(jsonb_typeof(v->'createdAt'),'')<>'number' then raise exception 'Invalid writing attempt';end if;
  at:=to_timestamp((v->>'createdAt')::numeric/1000);
  if at<'2020-01-01' or at>now()+interval '5 minutes' then raise exception 'Invalid attempt date';end if;
  if exists(select 1 from language_learning.resets where language=p_language and student_id=student and exercise_id=exercise and reset_at>=at) then return '"ignored_reset"';end if;
  if exists(select 1 from language_learning.attempts where language=p_language and student_id=student and attempt_id=attemptid) then return '"existing"';end if;
  insert into language_learning.attempts values(p_language,student,attemptid,exercise,v,at);return '"inserted"';
 elsif p_system='writing' and op in ('list_attempts','list_student_attempts') then
  n:=greatest(1,least(500,coalesce((p_args->>'p_limit')::integer,250)));at:=(p_args->>'p_before_created_at')::timestamptz;attemptid:=p_args->>'p_before_attempt_id';
  select coalesce(jsonb_agg(to_jsonb(rows) order by created_at desc,attempt_id desc),'[]') into result from (select a.attempt_id,a.attempt,a.created_at from language_learning.attempts a where language=p_language and student_id=student and (at is null or (a.created_at,a.attempt_id)<(at,attemptid)) order by created_at desc,attempt_id desc limit n) rows;return result;
 elsif p_system='writing' and op in ('delete_attempts_by_exercise','delete_student_attempts_by_exercise') then
  cutoff:=(p_args->>'p_reset_at')::timestamptz;
  if cutoff is null or cutoff>now()+interval '5 minutes' or coalesce(jsonb_typeof(p_args->'p_exercise_ids'),'')<>'array' or jsonb_array_length(p_args->'p_exercise_ids')>250 then raise exception 'Invalid reset';end if;
  for exercise in select jsonb_array_elements_text(p_args->'p_exercise_ids') loop
   insert into language_learning.resets values(p_language,student,exercise,cutoff) on conflict(language,student_id,exercise_id) do update set reset_at=greatest(language_learning.resets.reset_at,excluded.reset_at);
  end loop;
  delete from language_learning.attempts where language=p_language and student_id=student and exercise_id in (select jsonb_array_elements_text(p_args->'p_exercise_ids')) and created_at<=cutoff;
  get diagnostics n=row_count;return to_jsonb(n);
 end if;
 raise exception 'Unsupported operation';
end $$;
revoke all on function public.language_learning_rpc(text,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.language_learning_rpc(text,text,text,jsonb) to authenticated;
commit;
