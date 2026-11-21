create schema if not exists grammar_qna_private;
revoke all on schema grammar_qna_private from public, anon, authenticated;

create table if not exists grammar_qna_private.threads (
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  module_id text not null check (module_id ~ '^[a-z0-9-]{1,100}$'),
  block_id text not null check (block_id ~ '^[a-z0-9-]{1,140}$'),
  status text not null default 'open' check (status in ('open','answered','resolved')),
  updated_at timestamptz not null default now(),
  primary key(student_id,module_id,block_id)
);

create table if not exists grammar_qna_private.messages (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  module_id text not null,
  block_id text not null,
  author_role text not null check (author_role in ('student','teacher')),
  body text not null check (char_length(trim(body)) between 1 and 3000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  foreign key(student_id,module_id,block_id) references grammar_qna_private.threads(student_id,module_id,block_id) on delete cascade
);

create index if not exists grammar_qna_messages_thread_idx on grammar_qna_private.messages(student_id,module_id,block_id,created_at);
alter table grammar_qna_private.threads enable row level security;
alter table grammar_qna_private.messages enable row level security;
revoke all on grammar_qna_private.threads, grammar_qna_private.messages from public, anon, authenticated;

create or replace function public.grammar_qna_student_thread(p_token uuid,p_module_id text,p_block_id text)
returns table(id uuid,author_role text,body text,created_at timestamptz,updated_at timestamptz,status text)
language sql stable security definer set search_path=''
as $$
  select message.id,message.author_role,message.body,message.created_at,message.updated_at,thread.status
  from grammar_qna_private.messages message
  join grammar_qna_private.threads thread using(student_id,module_id,block_id)
  where message.student_id=public.flashcard_session_student_id(p_token)
    and message.module_id=lower(trim(p_module_id)) and message.block_id=lower(trim(p_block_id))
    and message.deleted_at is null order by message.created_at,message.id;
$$;

create or replace function public.grammar_qna_student_post(p_token uuid,p_module_id text,p_block_id text,p_body text)
returns table(id uuid,created_at timestamptz)
language plpgsql security definer set search_path=''
as $$
declare student uuid:=public.flashcard_session_student_id(p_token); module text:=lower(trim(coalesce(p_module_id,''))); block text:=lower(trim(coalesce(p_block_id,''))); created_id uuid;
begin
  if student is null then raise exception 'Please log in again' using errcode='42501'; end if;
  if module !~ '^[a-z0-9-]{1,100}$' or block !~ '^[a-z0-9-]{1,140}$' or char_length(trim(coalesce(p_body,''))) not between 1 and 3000 then raise exception 'Invalid question' using errcode='22023'; end if;
  insert into grammar_qna_private.threads(student_id,module_id,block_id,status,updated_at) values(student,module,block,'open',now()) on conflict(student_id,module_id,block_id) do update set status='open',updated_at=now();
  insert into grammar_qna_private.messages(student_id,module_id,block_id,author_role,body) values(student,module,block,'student',trim(p_body)) returning messages.id into created_id;
  return query select created_id,now();
end; $$;

create or replace function public.grammar_qna_student_summary(p_token uuid)
returns table(module_id text,block_id text,message_count bigint,status text,updated_at timestamptz)
language sql stable security definer set search_path=''
as $$
  select thread.module_id,thread.block_id,count(message.id),thread.status,thread.updated_at
  from grammar_qna_private.threads thread left join grammar_qna_private.messages message on message.student_id=thread.student_id and message.module_id=thread.module_id and message.block_id=thread.block_id and message.deleted_at is null
  where thread.student_id=public.flashcard_session_student_id(p_token)
  group by thread.student_id,thread.module_id,thread.block_id,thread.status,thread.updated_at order by thread.updated_at desc;
$$;

create or replace function public.grammar_qna_admin_queue(p_admin_name text,p_admin_password text,p_only_open boolean default true)
returns table(student_id uuid,student_name text,module_id text,block_id text,status text,message_count bigint,updated_at timestamptz)
language plpgsql security definer set search_path=''
as $$ begin
  if not public.flashcard_admin_ok(p_admin_name,p_admin_password) then return; end if;
  return query select thread.student_id,student.name,thread.module_id,thread.block_id,thread.status,count(message.id),thread.updated_at
  from grammar_qna_private.threads thread join public.flashcard_students student on student.id=thread.student_id left join grammar_qna_private.messages message on message.student_id=thread.student_id and message.module_id=thread.module_id and message.block_id=thread.block_id and message.deleted_at is null
  where student.deleted_at is null and (not p_only_open or thread.status='open') group by thread.student_id,student.name,thread.module_id,thread.block_id,thread.status,thread.updated_at order by thread.updated_at desc;
end; $$;

create or replace function public.grammar_qna_admin_thread(p_admin_name text,p_admin_password text,p_student_id uuid,p_module_id text,p_block_id text)
returns table(id uuid,author_role text,body text,created_at timestamptz,updated_at timestamptz,status text)
language plpgsql security definer set search_path=''
as $$ begin
  if not public.flashcard_admin_ok(p_admin_name,p_admin_password) then return; end if;
  return query select message.id,message.author_role,message.body,message.created_at,message.updated_at,thread.status from grammar_qna_private.messages message join grammar_qna_private.threads thread using(student_id,module_id,block_id) where message.student_id=p_student_id and message.module_id=lower(trim(p_module_id)) and message.block_id=lower(trim(p_block_id)) and message.deleted_at is null order by message.created_at,message.id;
end; $$;

create or replace function public.grammar_qna_admin_reply(p_admin_name text,p_admin_password text,p_student_id uuid,p_module_id text,p_block_id text,p_body text,p_status text default 'answered')
returns table(id uuid,created_at timestamptz)
language plpgsql security definer set search_path=''
as $$ declare created_id uuid; next_status text:=lower(trim(coalesce(p_status,'answered'))); begin
  if not public.flashcard_admin_ok(p_admin_name,p_admin_password) then raise exception 'Invalid administrator credentials' using errcode='42501'; end if;
  if next_status not in ('open','answered','resolved') or char_length(trim(coalesce(p_body,''))) not between 1 and 3000 then raise exception 'Invalid reply' using errcode='22023'; end if;
  update grammar_qna_private.threads set status=next_status,updated_at=now() where student_id=p_student_id and module_id=lower(trim(p_module_id)) and block_id=lower(trim(p_block_id));
  if not found then raise exception 'Thread not found' using errcode='P0002'; end if;
  insert into grammar_qna_private.messages(student_id,module_id,block_id,author_role,body) values(p_student_id,lower(trim(p_module_id)),lower(trim(p_block_id)),'teacher',trim(p_body)) returning messages.id into created_id;
  return query select created_id,now();
end; $$;

do $$ declare signature text; begin
  foreach signature in array array['grammar_qna_student_thread(uuid,text,text)','grammar_qna_student_post(uuid,text,text,text)','grammar_qna_student_summary(uuid)','grammar_qna_admin_queue(text,text,boolean)','grammar_qna_admin_thread(text,text,uuid,text,text)','grammar_qna_admin_reply(text,text,uuid,text,text,text,text)'] loop execute format('revoke all on function public.%s from public',signature); execute format('grant execute on function public.%s to anon, authenticated, service_role',signature); end loop;
end $$;
