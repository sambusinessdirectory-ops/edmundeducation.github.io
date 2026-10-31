-- IELTS Writing Preview: private accounts, live presence and saved Task 2 choices.
-- The one admin password is provisioned separately; no credential belongs in source.
create schema if not exists ielts_preview_private;
revoke all on schema ielts_preview_private from public, anon, authenticated;

create table if not exists ielts_preview_private.admin_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  password_hash text not null,
  is_active boolean not null default true,
  failed_count integer not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now()
);
create unique index if not exists ielts_preview_admin_name_unique on ielts_preview_private.admin_accounts (lower(name));
create table if not exists ielts_preview_private.admin_sessions (
  token_hash bytea primary key,
  admin_id uuid not null references ielts_preview_private.admin_accounts(id) on delete cascade,
  expires_at timestamptz not null
);
create table if not exists ielts_preview_private.presence (
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  device_id uuid not null,
  seen_at timestamptz not null default now(),
  primary key (student_id, device_id)
);
create index if not exists ielts_preview_presence_seen on ielts_preview_private.presence (seen_at desc);
create table if not exists ielts_preview_private.answers (
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  question_id text not null check (question_id ~ '^T2-[0-9]{3}$'),
  answer text not null check (answer in ('Opinions','Discuss both views + Opinions','Advantages & Disadvantages','Cause & Solution','Direct question')),
  updated_at timestamptz not null default now(),
  primary key (student_id, question_id)
);
alter table ielts_preview_private.admin_accounts enable row level security;
alter table ielts_preview_private.admin_sessions enable row level security;
alter table ielts_preview_private.presence enable row level security;
alter table ielts_preview_private.answers enable row level security;
revoke all on all tables in schema ielts_preview_private from public, anon, authenticated;

create or replace function public.ielts_preview_student_sync(
  p_token uuid, p_device uuid, p_initial_answers jsonb default null,
  p_question_id text default null, p_answer text default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_student uuid;
  v_answers jsonb;
begin
  v_student := public.flashcard_session_student_id(p_token);
  if v_student is null or p_device is null then raise exception 'Valid student sign-in required' using errcode = '28000'; end if;
  insert into ielts_preview_private.presence(student_id,device_id,seen_at)
  values(v_student,p_device,pg_catalog.clock_timestamp())
  on conflict(student_id,device_id) do update set seen_at=excluded.seen_at;
  if p_initial_answers is not null then
    if jsonb_typeof(p_initial_answers) <> 'object' or pg_catalog.length(p_initial_answers::text) > 20000 then
      raise exception 'Invalid initial answers';
    end if;
    insert into ielts_preview_private.answers(student_id,question_id,answer)
    select v_student, entry.key, entry.value
    from jsonb_each_text(p_initial_answers) entry
    where entry.key ~ '^T2-[0-9]{3}$'
      and entry.value in ('Opinions','Discuss both views + Opinions','Advantages & Disadvantages','Cause & Solution','Direct question')
    on conflict(student_id,question_id) do nothing;
  end if;
  if p_question_id is not null then
    if p_question_id !~ '^T2-[0-9]{3}$' then raise exception 'Invalid question'; end if;
    if p_answer = '' then
      delete from ielts_preview_private.answers where student_id=v_student and question_id=p_question_id;
    elsif p_answer in ('Opinions','Discuss both views + Opinions','Advantages & Disadvantages','Cause & Solution','Direct question') then
      insert into ielts_preview_private.answers(student_id,question_id,answer,updated_at)
      values(v_student,p_question_id,p_answer,pg_catalog.clock_timestamp())
      on conflict(student_id,question_id) do update set answer=excluded.answer,updated_at=excluded.updated_at;
    else raise exception 'Invalid answer'; end if;
  end if;
  select coalesce(jsonb_object_agg(question_id,answer),'{}'::jsonb) into v_answers
  from ielts_preview_private.answers where student_id=v_student;
  return jsonb_build_object('answers',v_answers,'serverTime',pg_catalog.clock_timestamp());
end; $$;

create or replace function public.ielts_preview_student_leave(p_token uuid,p_device uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_student uuid;
begin
  v_student := public.flashcard_session_student_id(p_token);
  if v_student is null or p_device is null then return false; end if;
  delete from ielts_preview_private.presence where student_id=v_student and device_id=p_device;
  return true;
end; $$;

create or replace function public.ielts_preview_admin_login(p_name text,p_password text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_admin ielts_preview_private.admin_accounts%rowtype;
  v_token uuid := gen_random_uuid();
  v_expiry timestamptz := pg_catalog.clock_timestamp() + interval '8 hours';
begin
  if pg_catalog.length(coalesce(p_name,'')) > 100 or pg_catalog.length(coalesce(p_password,'')) > 200 then return null; end if;
  select * into v_admin from ielts_preview_private.admin_accounts
  where pg_catalog.lower(name)=pg_catalog.lower(pg_catalog.btrim(p_name)) for update;
  if not found then
    perform extensions.crypt(coalesce(p_password,''),extensions.gen_salt('bf',12));
    return null;
  end if;
  if not v_admin.is_active or v_admin.locked_until > pg_catalog.clock_timestamp() then return null; end if;
  if v_admin.password_hash <> extensions.crypt(coalesce(p_password,''),v_admin.password_hash) then
    update ielts_preview_private.admin_accounts set failed_count=failed_count+1,
      locked_until=case when failed_count+1>=5 then pg_catalog.clock_timestamp()+interval '5 minutes' else null end
    where id=v_admin.id;
    return null;
  end if;
  update ielts_preview_private.admin_accounts set failed_count=0,locked_until=null where id=v_admin.id;
  delete from ielts_preview_private.admin_sessions where expires_at < pg_catalog.clock_timestamp();
  insert into ielts_preview_private.admin_sessions(token_hash,admin_id,expires_at)
  values(extensions.digest(v_token::text,'sha256'),v_admin.id,v_expiry);
  return jsonb_build_object('token',v_token,'name',v_admin.name,'expiresAt',v_expiry);
end; $$;

create or replace function public.ielts_preview_admin_snapshot(p_token uuid,p_student_ids uuid[] default '{}')
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_admin uuid; v_online jsonb; v_answers jsonb;
begin
  select s.admin_id into v_admin from ielts_preview_private.admin_sessions s
  join ielts_preview_private.admin_accounts a on a.id=s.admin_id
  where s.token_hash=extensions.digest(p_token::text,'sha256')
    and s.expires_at>pg_catalog.clock_timestamp() and a.is_active limit 1;
  if v_admin is null then raise exception 'Admin sign-in required' using errcode='28000'; end if;
  if coalesce(array_length(p_student_ids,1),0)>10 then raise exception 'Too many students'; end if;
  select coalesce(jsonb_agg(jsonb_build_object('id',student.id,'name',student.name) order by student.name),'[]'::jsonb)
    into v_online
  from public.flashcard_students student
  where student.deleted_at is null and exists (
    select 1 from ielts_preview_private.presence presence
    where presence.student_id=student.id and presence.seen_at>pg_catalog.clock_timestamp()-interval '25 seconds');
  select coalesce(jsonb_object_agg(student_id::text,answers),'{}'::jsonb) into v_answers from (
    select student_id,coalesce(jsonb_object_agg(question_id,answer),'{}'::jsonb) answers
    from ielts_preview_private.answers where student_id=any(p_student_ids) group by student_id
  ) grouped;
  return jsonb_build_object('students',v_online,'answers',v_answers,'serverTime',pg_catalog.clock_timestamp());
end; $$;

create or replace function public.ielts_preview_admin_logout(p_token uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  delete from ielts_preview_private.admin_sessions where token_hash=extensions.digest(p_token::text,'sha256');
  return true;
end; $$;

revoke all on function public.ielts_preview_student_sync(uuid,uuid,jsonb,text,text) from public;
revoke all on function public.ielts_preview_student_leave(uuid,uuid) from public;
revoke all on function public.ielts_preview_admin_login(text,text) from public;
revoke all on function public.ielts_preview_admin_snapshot(uuid,uuid[]) from public;
revoke all on function public.ielts_preview_admin_logout(uuid) from public;
grant execute on function public.ielts_preview_student_sync(uuid,uuid,jsonb,text,text) to anon,authenticated;
grant execute on function public.ielts_preview_student_leave(uuid,uuid) to anon,authenticated;
grant execute on function public.ielts_preview_admin_login(text,text) to anon,authenticated;
grant execute on function public.ielts_preview_admin_snapshot(uuid,uuid[]) to anon,authenticated;
grant execute on function public.ielts_preview_admin_logout(uuid) to anon,authenticated;
