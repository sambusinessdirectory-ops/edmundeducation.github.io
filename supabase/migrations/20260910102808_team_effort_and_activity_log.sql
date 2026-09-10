-- Reconcile legacy/current marked-card progress with the repeat-attempt ledger.
-- SQL functions cannot RAISE inside a CASE, so keep auth failure explicit and reusable.
create or replace function public._special_flash_raise_auth_error()
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  raise exception 'Please sign in again.' using errcode = '42501';
end
$$;

-- Recreate after the helper exists (Postgres resolves function references at creation time).
create or replace function public.special_flash_team_effort(p_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with viewer as (select (public._special_flash_account(p_token)).*),
  visible_courses as (
    select c.id, c.title from public.special_flash_courses c, viewer v
    where c.active and v.id is not null and (v.role = 'admin' or exists (
      select 1 from public.special_flash_enrollments e where e.account_id = v.id and e.course_id = c.id
    ))
  ),
  members as (
    select vc.id course_id, a.id account_id, a.username from visible_courses vc
    join public.special_flash_enrollments e on e.course_id = vc.id
    join public.special_flash_accounts a on a.id = e.account_id and a.role = 'student' and a.active
  ),
  member_decks as (
    select m.course_id,m.account_id,m.username,d.id deck_id from members m
    join public.special_flash_decks d on d.course_id=m.course_id and d.active
  ),
  attempt_totals as (
    select md.course_id,md.account_id,md.deck_id,sum(a.cards)::bigint cards from member_decks md
    join public.special_flash_attempts a on a.account_id=md.account_id and a.deck_id=md.deck_id
    group by md.course_id,md.account_id,md.deck_id
  ),
  mark_totals as (
    select md.course_id,md.account_id,md.deck_id,count(mark.key)::bigint cards,max(p.updated_at) updated_at
    from member_decks md left join public.special_flash_progress p on p.account_id=md.account_id and p.deck_id=md.deck_id
    left join lateral jsonb_each_text(coalesce(p.marks,'{}'::jsonb)) mark on mark.value in ('green','red')
    group by md.course_id,md.account_id,md.deck_id
  ),
  deck_effort as (
    select md.course_id,md.account_id,md.username,md.deck_id,
      greatest(coalesce(a.cards,0),coalesce(m.cards,0))::bigint cards,
      greatest(coalesce(m.cards,0)-coalesce(a.cards,0),0)::bigint reconciliation_cards,m.updated_at
    from member_decks md left join attempt_totals a using(course_id,account_id,deck_id)
    left join mark_totals m using(course_id,account_id,deck_id)
  ),
  daily_attempts as (
    select md.course_id,md.account_id,md.username,to_char(a.ended_at at time zone 'Asia/Hong_Kong','YYYY-MM-DD') practice_date,sum(a.cards)::bigint cards
    from member_decks md join public.special_flash_attempts a on a.account_id=md.account_id and a.deck_id=md.deck_id
    group by md.course_id,md.account_id,md.username,practice_date
  ),
  daily_reconciliation as (
    select course_id,account_id,username,to_char(coalesce(updated_at,now()) at time zone 'Asia/Hong_Kong','YYYY-MM-DD') practice_date,sum(reconciliation_cards)::bigint cards
    from deck_effort where reconciliation_cards>0 group by course_id,account_id,username,practice_date
  ),
  daily as (
    select course_id,account_id,username,practice_date,sum(cards)::bigint cards from (
      select * from daily_attempts union all select * from daily_reconciliation
    ) x group by course_id,account_id,username,practice_date
  )
  select case when not exists(select 1 from viewer where id is not null) then public._special_flash_raise_auth_error()
    else jsonb_build_object('courses',coalesce((select jsonb_agg(jsonb_build_object(
      'course_id',vc.id,'course_title',vc.title,
      'total_cards',coalesce((select sum(de.cards) from deck_effort de where de.course_id=vc.id),0),
      'members',coalesce((select jsonb_agg(jsonb_build_object('account_id',m.account_id,'username',m.username,'cards',coalesce((select sum(de.cards) from deck_effort de where de.course_id=vc.id and de.account_id=m.account_id),0)) order by coalesce((select sum(de.cards) from deck_effort de where de.course_id=vc.id and de.account_id=m.account_id),0) desc,lower(m.username)) from members m where m.course_id=vc.id),'[]'::jsonb),
      'daily',coalesce((select jsonb_agg(jsonb_build_object('date',d.practice_date,'account_id',d.account_id,'username',d.username,'cards',d.cards) order by d.practice_date,lower(d.username)) from daily d where d.course_id=vc.id),'[]'::jsonb)
    ) order by vc.title) from visible_courses vc),'[]'::jsonb)) end;
$$;

revoke all on function public._special_flash_raise_auth_error() from public, anon, authenticated, service_role;
revoke all on function public.special_flash_team_effort(uuid) from public, anon, authenticated, service_role;
grant execute on function public.special_flash_team_effort(uuid) to anon, authenticated;

create table if not exists public.student_system_activity_log (
  id bigint generated always as identity primary key,
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  system_id text not null check (length(system_id) between 1 and 100),
  session_fingerprint text not null check (length(session_fingerprint) = 32),
  visited_at timestamptz not null default now(),
  unique (student_id, system_id, session_fingerprint)
);

create index if not exists student_system_activity_log_recent_idx
  on public.student_system_activity_log (visited_at desc);

alter table public.student_system_activity_log enable row level security;
revoke all on public.student_system_activity_log from public, anon, authenticated, service_role;

create or replace function public.schedule_student_record_system_visit(p_token uuid, p_system text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  student uuid := public.flashcard_session_student_id(p_token);
  cleaned text := lower(btrim(coalesce(p_system, '')));
begin
  if student is null then raise exception 'Please sign in again.' using errcode = '42501'; end if;
  if cleaned !~ '^[a-z0-9][a-z0-9_-]{0,99}$' then raise exception 'Invalid system.' using errcode = '22023'; end if;
  insert into public.student_system_activity_log(student_id, system_id, session_fingerprint)
  values(student, cleaned, md5(p_token::text)) on conflict do nothing;
  return true;
end
$$;

create or replace function public.schedule_admin_list_student_activity(p_admin_token uuid, p_limit integer default 100, p_offset integer default 0)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  admin_id uuid := public._schedule_admin_id(p_admin_token);
begin
  if admin_id is null then raise exception 'Invalid or expired admin session' using errcode = '42501'; end if;
  return jsonb_build_object(
    'total', (select count(*) from public.student_system_activity_log),
    'rows', coalesce((select jsonb_agg(row_data order by visited_at desc, id desc) from (
      select l.id, l.student_id, s.name as student_name, l.system_id, l.visited_at
      from public.student_system_activity_log l
      join public.flashcard_students s on s.id = l.student_id
      order by l.visited_at desc, l.id desc
      limit least(250, greatest(1, coalesce(p_limit,100)))
      offset least(100000, greatest(0, coalesce(p_offset,0)))
    ) row_data), '[]'::jsonb)
  );
end
$$;

revoke all on function public.schedule_student_record_system_visit(uuid,text) from public, anon, authenticated, service_role;
revoke all on function public.schedule_admin_list_student_activity(uuid,integer,integer) from public, anon, authenticated, service_role;
grant execute on function public.schedule_student_record_system_visit(uuid,text) to anon, authenticated;
grant execute on function public.schedule_admin_list_student_activity(uuid,integer,integer) to anon, authenticated;

-- Professional English support tickets. Audio and practice data are never attached.
create table if not exists public.professional_bug_reports (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,
  account_id uuid not null references public.special_flash_accounts(id) on delete cascade,
  subject text not null check(length(subject) between 1 and 160),
  body text not null check(length(body) between 1 and 5000),
  page_url text not null default '',
  user_agent text not null default '',
  status text not null default 'open' check(status in ('open','reviewing','resolved','closed')),
  created_at timestamptz not null default now()
);
create index if not exists professional_bug_reports_recent_idx on public.professional_bug_reports(created_at desc);
alter table public.professional_bug_reports enable row level security;
revoke all on public.professional_bug_reports from public,anon,authenticated,service_role;

create or replace function public.special_flash_report_bug(p_token uuid,p_subject text,p_body text,p_page_url text default '',p_user_agent text default '')
returns jsonb language plpgsql security definer set search_path='' as $$
declare viewer record; ticket public.professional_bug_reports%rowtype; settings public.writing_submission_email_settings%rowtype; email_body text;
begin
 select * into viewer from public._special_flash_account(p_token);
 if viewer.id is null or viewer.role<>'student' then raise exception 'Please sign in again.' using errcode='42501'; end if;
 if length(btrim(coalesce(p_subject,''))) not between 1 and 160 or length(btrim(coalesce(p_body,''))) not between 1 and 5000 then raise exception 'Please complete the subject and details.' using errcode='22023'; end if;
 insert into public.professional_bug_reports(account_id,subject,body,page_url,user_agent)
 values(viewer.id,btrim(p_subject),btrim(p_body),left(coalesce(p_page_url,''),2000),left(coalesce(p_user_agent,''),1000)) returning * into ticket;
 email_body:='A Professional English student reported a website problem.'||E'\n\nTicket: #'||ticket.id::text||E'\nAccount: '||viewer.username||E'\nSubject: '||ticket.subject||E'\nPage: '||ticket.page_url||E'\nSubmitted (Hong Kong): '||to_char(ticket.created_at at time zone 'Asia/Hong_Kong','YYYY-MM-DD HH24:MI:SS')||E'\n\nDetails:\n'||ticket.body;
 select * into settings from public.writing_submission_email_settings where singleton and enabled;
 if found then
  insert into public.schedule_email_delivery_jobs(admin_id,recipient_name,recipient_email,subject,content,idempotency_key,kind,topic,request_id,action_url,requested_sender_email)
  select settings.admin_id,'Sam Business Directory',recipient.email,'EdmundEducation — Professional bug ticket #'||ticket.id::text,email_body,
   'professional-bug:'||ticket.public_id::text||':'||recipient.email,'writing_submission','professional-bug',ticket.public_id,
   'https://edmundeducation.com/professional-english/',settings.sender_email
  from (select distinct lower(btrim(value)) email from unnest(settings.recipients) value) recipient
  on conflict(idempotency_key) do nothing;
 end if;
 return jsonb_build_object('ticket_number',ticket.id,'ticket_id',ticket.public_id,'status',ticket.status);
end $$;
revoke all on function public.special_flash_report_bug(uuid,text,text,text,text) from public,anon,authenticated,service_role;
grant execute on function public.special_flash_report_bug(uuid,text,text,text,text) to anon,authenticated;
