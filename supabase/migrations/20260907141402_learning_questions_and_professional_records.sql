begin;
create table public.learning_questions (
 id uuid primary key, student_id uuid not null references public.flashcard_students(id) on delete cascade,
 body text not null check(length(body) between 1 and 12000), context jsonb not null default '{}' check(pg_column_size(context)<=40000),
 status text not null check(status in ('draft','sent','answered')), answer text not null default '' check(length(answer)<=20000),
 version integer not null default 1,created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create index learning_questions_student_date on public.learning_questions(student_id,updated_at desc);
create table public.speaking_professional_records (
 id uuid primary key, owner_id uuid not null,owner_kind text not null check(owner_kind in ('student','admin')),
 session jsonb not null check(pg_column_size(session)<=1500000), member_ids uuid[] not null default '{}',
 version integer not null default 1,created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create index speaking_professional_members on public.speaking_professional_records using gin(member_ids);
create index speaking_professional_owner on public.speaking_professional_records(owner_id,updated_at desc);
create table public.speaking_professional_join_codes(code uuid primary key default gen_random_uuid(),student_id uuid not null references public.flashcard_students(id) on delete cascade,expires_at timestamptz not null default now()+interval '24 hours');
alter table public.learning_questions enable row level security;
alter table public.speaking_professional_records enable row level security;
alter table public.speaking_professional_join_codes enable row level security;
revoke all on public.learning_questions,public.speaking_professional_records,public.speaking_professional_join_codes from public,anon,authenticated;
create function public.learning_hub_identity(p_token uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare sid uuid; a record;
begin
 sid:=public.flashcard_session_student_id(p_token);
 if sid is not null then return jsonb_build_object('id',sid,'kind','student','name',(select name from public.flashcard_students where id=sid));end if;
 select * into a from public.speaking_admin_me(p_token);
 if a.id is not null then return jsonb_build_object('id',a.id,'kind','admin','name',a.name);end if;
 raise exception 'Please sign in' using errcode='42501';
end $$;
create function public.learning_question_action(p_token uuid,p_action text,p_payload jsonb default '{}') returns jsonb language plpgsql security definer set search_path='' as $$
declare actor jsonb:=public.learning_hub_identity(p_token); uid uuid:=(actor->>'id')::uuid; isadmin boolean:=actor->>'kind'='admin'; q public.learning_questions%rowtype; qid uuid; result jsonb;
begin
 if p_action='list' then
 return coalesce((select jsonb_agg(row_data order by updated_at desc,id) from (select entry.updated_at,entry.id,to_jsonb(entry)||jsonb_build_object('student_name',s.name) row_data from public.learning_questions entry join public.flashcard_students s on s.id=entry.student_id where (isadmin and entry.status<>'draft') or entry.student_id=uid order by entry.updated_at desc,entry.id limit 50 offset least(100000,greatest(0,coalesce((p_payload->>'offset')::int,0)))) rows),'[]');
 end if;
 qid:=(p_payload->>'id')::uuid;
 perform pg_advisory_xact_lock(hashtextextended(qid::text,0));
 select * into q from public.learning_questions where id=qid for update;
 if p_action='reply' then
  if not isadmin or q.id is null or q.status='draft' then raise exception 'Forbidden' using errcode='42501';end if;
  if q.version is distinct from (p_payload->>'version')::int then raise exception 'Question changed. Refresh before replying.' using errcode='40001';end if;
  if length(btrim(coalesce(p_payload->>'answer','')))=0 then raise exception 'Answer required';end if;
  update public.learning_questions set answer=btrim(p_payload->>'answer'),status='answered',version=version+1,updated_at=now() where id=qid returning * into q;
 elsif p_action='save' then
  if isadmin then raise exception 'Student account required' using errcode='42501';end if;
  if q.id is not null and q.student_id<>uid then raise exception 'Forbidden' using errcode='42501';end if;
  if q.id is not null and q.status<>'draft' then
   if q.body=btrim(p_payload->>'body') then return to_jsonb(q);end if;
   raise exception 'Sent questions cannot be overwritten';
  end if;
  if q.id is not null and q.version is distinct from (p_payload->>'version')::int then raise exception 'Draft changed. Refresh before saving.' using errcode='40001';end if;
  insert into public.learning_questions(id,student_id,body,context,status) values(qid,uid,btrim(p_payload->>'body'),coalesce(p_payload->'context','{}'),case when p_payload->>'status'='sent' then 'sent' else 'draft' end)
  on conflict(id) do update set body=excluded.body,context=excluded.context,status=excluded.status,version=learning_questions.version+1,updated_at=now() returning * into q;
 else raise exception 'Unknown action';end if;
 return to_jsonb(q);
end $$;
create function public.speaking_professional_action(p_token uuid,p_action text,p_payload jsonb default '{}') returns jsonb language plpgsql security definer set search_path='' as $$
declare actor jsonb:=public.learning_hub_identity(p_token); uid uuid:=(actor->>'id')::uuid; isadmin boolean:=actor->>'kind'='admin'; r public.speaking_professional_records%rowtype; sid uuid; ids uuid[]:='{}'; c jsonb; code uuid; rid uuid; result jsonb;
begin
 if p_action='join-code' then
  if isadmin then raise exception 'Student account required';end if;
  delete from public.speaking_professional_join_codes where student_id=uid or expires_at<now();
  insert into public.speaking_professional_join_codes(student_id) values(uid) returning speaking_professional_join_codes.code into code;
  return jsonb_build_object('code',code,'name',actor->>'name');
 elsif p_action='resolve' then
  select student_id into sid from public.speaking_professional_join_codes where speaking_professional_join_codes.code=(p_payload->>'code')::uuid and expires_at>now();
  if sid is null then raise exception 'Join code is invalid or expired';end if;
  return jsonb_build_object('id',sid,'name',(select name from public.flashcard_students where id=sid));
 elsif p_action='students' then
  if not isadmin then raise exception 'Forbidden' using errcode='42501';end if;
  return coalesce((select jsonb_agg(jsonb_build_object('id',id,'name',name) order by name) from public.flashcard_students),'[]');
 elsif p_action='list' then
  return coalesce((select jsonb_agg(row_data order by updated_at desc,id) from (select record_row.updated_at,record_row.id,jsonb_build_object('id',record_row.id,'version',record_row.version,'session',record_row.session,'canEdit',record_row.owner_id=uid and record_row.owner_kind=actor->>'kind') row_data from public.speaking_professional_records record_row where (record_row.owner_id=uid and record_row.owner_kind=actor->>'kind') or (not isadmin and uid=any(record_row.member_ids)) order by record_row.updated_at desc,record_row.id limit 30 offset least(100000,greatest(0,coalesce((p_payload->>'offset')::int,0)))) rows),'[]');
 elsif p_action='get' then
  select * into r from public.speaking_professional_records where id=(p_payload->>'id')::uuid;
  if r.id is null or not ((r.owner_id=uid and r.owner_kind=actor->>'kind') or (not isadmin and uid=any(r.member_ids))) then raise exception 'Forbidden' using errcode='42501';end if;
  return jsonb_build_object('id',r.id,'version',r.version,'session',r.session,'canEdit',r.owner_id=uid and r.owner_kind=actor->>'kind');
 elsif p_action<>'save' then raise exception 'Unknown action';end if;
 rid:=(p_payload->'session'->>'id')::uuid;
 if jsonb_typeof(p_payload->'session'->'candidates')<>'array' or jsonb_array_length(p_payload->'session'->'candidates') not between 1 and 4 then raise exception 'Invalid candidates';end if;
 perform pg_advisory_xact_lock(hashtextextended(rid::text,0));
 select * into r from public.speaking_professional_records where id=rid for update;
 if r.id is not null and (r.owner_id<>uid or r.owner_kind<>actor->>'kind') then raise exception 'Only the session host can edit this record' using errcode='42501';end if;
 if r.id is not null and r.version is distinct from (p_payload->>'version')::int then
  if r.session=p_payload->'session' then return jsonb_build_object('version',r.version);end if;
  raise exception 'Record changed on another device. Reload before saving.' using errcode='40001';
 end if;
 for c in select value from jsonb_array_elements(p_payload->'session'->'candidates') loop
  sid:=nullif(c->>'accountId','')::uuid;
  if sid is not null then
   if not exists(select 1 from public.flashcard_students where id=sid) then raise exception 'Student not found';end if;
   if not isadmin and sid<>uid and not (sid=any(coalesce(r.member_ids,'{}'::uuid[]))) and not exists(select 1 from public.speaking_professional_join_codes j where j.student_id=sid and j.expires_at>now() and j.code::text in (select value->>'code' from jsonb_array_elements(coalesce(p_payload->'links','[]')))) then raise exception 'Student must supply a join code' using errcode='42501';end if;
   if sid=any(ids) then raise exception 'Choose a different account for each candidate';end if;
   ids:=array_append(ids,sid);
  end if;
 end loop;
 insert into public.speaking_professional_records(id,owner_id,owner_kind,session,member_ids) values(rid,uid,actor->>'kind',p_payload->'session',ids)
 on conflict(id) do update set session=excluded.session,member_ids=excluded.member_ids,version=speaking_professional_records.version+1,updated_at=now() returning * into r;
 return jsonb_build_object('version',r.version,'id',r.id);
end $$;
revoke all on function public.learning_hub_identity(uuid),public.learning_question_action(uuid,text,jsonb),public.speaking_professional_action(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.learning_hub_identity(uuid),public.learning_question_action(uuid,text,jsonb),public.speaking_professional_action(uuid,text,jsonb) to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('speaking-professional-audio','speaking-professional-audio',false,20971520,array['audio/webm','audio/ogg','audio/mp4']) on conflict(id) do nothing;
notify pgrst,'reload schema';
commit;
