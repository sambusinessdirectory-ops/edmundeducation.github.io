-- Homework email-design scaffolding and linked-account homework synchronisation.
-- No Gmail/OAuth transport is connected by this migration.
begin;

do $$
begin
  if pg_catalog.to_regclass('public.schedule_entries') is null
    or pg_catalog.to_regclass('public.schedule_student_reminder_emails') is null
    or pg_catalog.to_regprocedure('public._schedule_admin_id(uuid)') is null
  then
    raise exception 'Apply the Schedule base and reminder-email migrations first';
  end if;
end;
$$;

create table if not exists public.schedule_email_templates (
  admin_id uuid not null references public.schedule_admin_accounts(id) on delete cascade,
  slot smallint not null check (slot between 1 and 4),
  content text not null default '' check (
    char_length(content) <= 8000
    and octet_length(content) <= 24000
    and regexp_replace(content,E'[\n\r\t]','','g') !~ '[[:cntrl:]]'
  ),
  enabled boolean not null default false,
  cadence text not null default '24h' check (cadence in ('15m','30m','45m','1h','24h','daily')),
  daily_time time,
  updated_at timestamptz not null default now(),
  primary key (admin_id,slot),
  check ((cadence='daily' and daily_time is not null) or (cadence<>'daily' and daily_time is null))
);
create table if not exists public.schedule_email_template_recipients (
  admin_id uuid not null,
  slot smallint not null,
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key(admin_id,slot,student_id),
  foreign key(admin_id,slot) references public.schedule_email_templates(admin_id,slot) on delete cascade
);
create index if not exists schedule_email_recipients_student_idx on public.schedule_email_template_recipients(student_id,admin_id,slot);
create table if not exists public.schedule_email_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.schedule_admin_accounts(id) on delete cascade,
  template_slot smallint not null check(template_slot between 1 and 4),
  student_id uuid references public.flashcard_students(id) on delete set null,
  recipient_email text not null,
  subject text not null default 'EdmundEducation 學習提醒',
  rendered_content text not null,
  status text not null check(status in ('queued','accepted','failed','cancelled')),
  provider_message_id text,
  created_at timestamptz not null default now()
);
create index if not exists schedule_email_logs_admin_created_idx on public.schedule_email_logs(admin_id,created_at desc,id);
create index if not exists schedule_email_logs_student_idx on public.schedule_email_logs(student_id);

create table if not exists public.schedule_homework_link_groups (
  id uuid primary key default gen_random_uuid(),
  created_by_admin uuid not null references public.schedule_admin_accounts(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.schedule_homework_link_members (
  group_id uuid not null references public.schedule_homework_link_groups(id) on delete cascade,
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(group_id,student_id),
  unique(student_id)
);
create index if not exists schedule_homework_link_members_student_idx on public.schedule_homework_link_members(student_id,group_id);
create index if not exists schedule_homework_link_groups_admin_idx on public.schedule_homework_link_groups(created_by_admin);
alter table public.schedule_entries add column if not exists homework_sync_group_id uuid references public.schedule_homework_link_groups(id) on delete set null;
create index if not exists schedule_entries_sync_group_idx on public.schedule_entries(homework_sync_group_id,schedule_date,slot_index) where homework_sync_group_id is not null;

alter table public.schedule_email_templates enable row level security;
alter table public.schedule_email_template_recipients enable row level security;
alter table public.schedule_email_logs enable row level security;
alter table public.schedule_homework_link_groups enable row level security;
alter table public.schedule_homework_link_members enable row level security;
revoke all on table public.schedule_email_templates,public.schedule_email_template_recipients,public.schedule_email_logs,public.schedule_homework_link_groups,public.schedule_homework_link_members from public,anon,authenticated;

create or replace function public.schedule_admin_email_designer_snapshot(p_admin_token uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v_admin uuid;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required' using errcode='42501'; end if;
  v_admin:=public._schedule_admin_id(p_admin_token);
  if v_admin is null then raise exception 'Invalid or expired admin session' using errcode='42501'; end if;
  return jsonb_build_object(
    'transportConnected',false,
    'students',coalesce((select jsonb_agg(jsonb_build_object('studentId',s.id,'studentName',s.name,'email',e.email) order by lower(s.name)) from public.flashcard_students s left join public.schedule_student_reminder_emails e on e.student_id=s.id where s.deleted_at is null),'[]'::jsonb),
    'templates',coalesce((select jsonb_agg(jsonb_build_object('slot',n,'configured',t.slot is not null,'content',coalesce(t.content,''),'enabled',coalesce(t.enabled,false),'cadence',coalesce(t.cadence,'24h'),'dailyTime',t.daily_time,'recipientIds',coalesce((select jsonb_agg(r.student_id) from public.schedule_email_template_recipients r where r.admin_id=v_admin and r.slot=n and r.enabled),'[]'::jsonb)) order by n) from generate_series(1,4) n left join public.schedule_email_templates t on t.admin_id=v_admin and t.slot=n),'[]'::jsonb)
  );
end $$;

create or replace function public.schedule_admin_save_email_template(p_admin_token uuid,p_slot integer,p_content text,p_enabled boolean,p_cadence text,p_daily_time time,p_recipient_ids jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_admin uuid; v_ids uuid[];
begin
  if (select auth.uid()) is null then raise exception 'Authentication required' using errcode='42501'; end if;
  v_admin:=public._schedule_admin_id(p_admin_token);
  if v_admin is null then raise exception 'Invalid or expired admin session' using errcode='42501'; end if;
  if p_slot not between 1 and 4
    or p_content is null
    or char_length(p_content)>8000
    or octet_length(p_content)>24000
    or regexp_replace(p_content,E'[\n\r\t]','','g') ~ '[[:cntrl:]]'
    or p_enabled is null
    or p_cadence is null
    or p_cadence not in ('15m','30m','45m','1h','24h','daily')
    or (p_cadence='daily')<>(p_daily_time is not null)
    or p_recipient_ids is null
    or jsonb_typeof(p_recipient_ids)<>'array'
    or jsonb_array_length(p_recipient_ids)>1000
  then raise exception 'Invalid email-template payload' using errcode='22023'; end if;
  select coalesce(array_agg(distinct value::uuid),'{}'::uuid[]) into v_ids from jsonb_array_elements_text(p_recipient_ids);
  if exists(select 1 from unnest(v_ids) id where not exists(select 1 from public.flashcard_students s join public.schedule_student_reminder_emails e on e.student_id=s.id where s.id=id and s.deleted_at is null)) then raise exception 'Recipient unavailable' using errcode='22023'; end if;
  insert into public.schedule_email_templates(admin_id,slot,content,enabled,cadence,daily_time,updated_at) values(v_admin,p_slot,p_content,p_enabled,p_cadence,p_daily_time,clock_timestamp()) on conflict(admin_id,slot) do update set content=excluded.content,enabled=excluded.enabled,cadence=excluded.cadence,daily_time=excluded.daily_time,updated_at=excluded.updated_at;
  delete from public.schedule_email_template_recipients where admin_id=v_admin and slot=p_slot;
  insert into public.schedule_email_template_recipients(admin_id,slot,student_id,enabled) select v_admin,p_slot,id,true from unnest(v_ids) id;
  return jsonb_build_object('slot',p_slot,'saved',true,'transportConnected',false);
end $$;

create or replace function public.schedule_admin_list_email_logs(p_admin_token uuid,p_limit integer default 100,p_offset integer default 0)
returns table(id uuid,template_slot smallint,student_name text,recipient_email text,subject text,rendered_content text,status text,provider_message_id text,created_at timestamptz,total_count bigint)
language plpgsql stable security definer set search_path='' as $$
declare v_admin uuid;
begin
 if (select auth.uid()) is null then raise exception 'Authentication required' using errcode='42501'; end if; v_admin:=public._schedule_admin_id(p_admin_token); if v_admin is null then raise exception 'Invalid or expired admin session' using errcode='42501'; end if;
 if p_limit is null or p_limit not between 1 and 500 or p_offset is null or p_offset not between 0 and 100000 then raise exception 'Invalid log page' using errcode='22023'; end if;
 return query select l.id,l.template_slot,s.name,l.recipient_email,l.subject,l.rendered_content,l.status,l.provider_message_id,l.created_at,count(*) over() from public.schedule_email_logs l left join public.flashcard_students s on s.id=l.student_id where l.admin_id=v_admin order by l.created_at desc,l.id limit p_limit offset p_offset;
end $$;

create or replace function public.schedule_admin_list_homework_links(p_admin_token uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$ declare v_admin uuid; begin
 if (select auth.uid()) is null then raise exception 'Authentication required' using errcode='42501'; end if; v_admin:=public._schedule_admin_id(p_admin_token); if v_admin is null then raise exception 'Invalid or expired admin session' using errcode='42501'; end if;
 return coalesce((select jsonb_agg(jsonb_build_object('groupId',g.id,'members',(select jsonb_agg(jsonb_build_object('studentId',s.id,'studentName',s.name) order by lower(s.name)) from public.schedule_homework_link_members m join public.flashcard_students s on s.id=m.student_id where m.group_id=g.id)) order by g.created_at) from public.schedule_homework_link_groups g where g.created_by_admin=v_admin),'[]'::jsonb);
end $$;

create or replace function public.schedule_admin_link_homework_accounts(p_admin_token uuid,p_student_ids jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$ declare v_admin uuid; v_ids uuid[]; v_group uuid; begin
 if (select auth.uid()) is null then raise exception 'Authentication required' using errcode='42501'; end if; v_admin:=public._schedule_admin_id(p_admin_token); if v_admin is null then raise exception 'Invalid or expired admin session' using errcode='42501'; end if;
 if p_student_ids is null or jsonb_typeof(p_student_ids)<>'array' or jsonb_array_length(p_student_ids) not between 2 and 10 then raise exception 'Choose 2 to 10 students' using errcode='22023'; end if; select array_agg(distinct value::uuid) into v_ids from jsonb_array_elements_text(p_student_ids); if cardinality(v_ids)<2 or exists(select 1 from unnest(v_ids) id where not exists(select 1 from public.flashcard_students s where s.id=id and s.deleted_at is null)) or exists(select 1 from public.schedule_homework_link_members m where m.student_id=any(v_ids)) then raise exception 'Student unavailable or already linked' using errcode='22023'; end if;
 insert into public.schedule_homework_link_groups(created_by_admin) values(v_admin) returning id into v_group; insert into public.schedule_homework_link_members(group_id,student_id) select v_group,id from unnest(v_ids) id; return jsonb_build_object('groupId',v_group,'linked',cardinality(v_ids));
end $$;
create or replace function public.schedule_admin_unlink_homework_accounts(p_admin_token uuid,p_group_id uuid)
returns boolean language plpgsql security definer set search_path='' as $$ declare v_admin uuid; begin if (select auth.uid()) is null then raise exception 'Authentication required' using errcode='42501'; end if; v_admin:=public._schedule_admin_id(p_admin_token); if v_admin is null then raise exception 'Invalid or expired admin session' using errcode='42501'; end if; delete from public.schedule_homework_link_groups g where g.id=p_group_id and g.created_by_admin=v_admin; return found; end $$;

create or replace function public._schedule_linked_homework_sync()
returns trigger language plpgsql security definer set search_path='' as $$ declare v_group uuid; v_member uuid; begin
 if pg_trigger_depth()>1 then return coalesce(new,old); end if;
 if tg_op='DELETE' then if old.source='admin' and old.homework_sync_group_id is not null then delete from public.schedule_entries e where e.homework_sync_group_id=old.homework_sync_group_id and e.schedule_date=old.schedule_date and e.slot_index=old.slot_index and e.student_id<>old.student_id; end if; return old; end if;
 if new.source<>'admin' then return new; end if;
 select m.group_id into v_group from public.schedule_homework_link_members m where m.student_id=new.student_id; if v_group is null then return new; end if;
 if tg_op='UPDATE' and old.homework_sync_group_id is not null and (old.schedule_date,old.slot_index) is distinct from (new.schedule_date,new.slot_index) then
   delete from public.schedule_entries e where e.homework_sync_group_id=old.homework_sync_group_id and e.schedule_date=old.schedule_date and e.slot_index=old.slot_index and e.student_id<>old.student_id;
 end if;
 if new.homework_sync_group_id is distinct from v_group then update public.schedule_entries set homework_sync_group_id=v_group where id=new.id; end if;
 for v_member in select m.student_id from public.schedule_homework_link_members m where m.group_id=v_group and m.student_id<>new.student_id loop
   insert into public.schedule_entries(student_id,schedule_date,slot_index,message,source,created_by_admin,is_completed,completed_at,completion_source,completed_by_admin,created_at,updated_at,homework_sync_group_id)
   values(v_member,new.schedule_date,new.slot_index,new.message,'admin',new.created_by_admin,false,null,null,null,now(),now(),v_group)
   on conflict(student_id,schedule_date,slot_index) do update set message=excluded.message,source='admin',created_by_admin=excluded.created_by_admin,updated_at=now(),homework_sync_group_id=v_group where public.schedule_entries.homework_sync_group_id=v_group;
 end loop; return new;
end $$;
drop trigger if exists schedule_linked_homework_sync_trigger on public.schedule_entries;
create trigger schedule_linked_homework_sync_trigger after insert or update or delete on public.schedule_entries for each row execute function public._schedule_linked_homework_sync();

revoke all on function public.schedule_admin_email_designer_snapshot(uuid),public.schedule_admin_save_email_template(uuid,integer,text,boolean,text,time,jsonb),public.schedule_admin_list_email_logs(uuid,integer,integer),public.schedule_admin_list_homework_links(uuid),public.schedule_admin_link_homework_accounts(uuid,jsonb),public.schedule_admin_unlink_homework_accounts(uuid,uuid),public._schedule_linked_homework_sync() from public,anon,authenticated;
grant execute on function public.schedule_admin_email_designer_snapshot(uuid),public.schedule_admin_save_email_template(uuid,integer,text,boolean,text,time,jsonb),public.schedule_admin_list_email_logs(uuid,integer,integer),public.schedule_admin_list_homework_links(uuid),public.schedule_admin_link_homework_accounts(uuid,jsonb),public.schedule_admin_unlink_homework_accounts(uuid,uuid) to authenticated;
commit;
