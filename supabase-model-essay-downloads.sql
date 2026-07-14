-- EdmundEducation model essay permissions, secure admin sessions, and download audit.
-- Flashcard remains the master student-account system.

begin;

create extension if not exists pgcrypto with schema extensions;

-- Dependencies: deploy the Flashcard account/session schema before this file.
do $$
begin
  if to_regclass('public.flashcard_students') is null then
    raise exception 'Missing dependency: public.flashcard_students';
  end if;
  if to_regprocedure('public.flashcard_session_student_id(uuid)') is null then
    raise exception 'Missing dependency: public.flashcard_session_student_id(uuid)';
  end if;
  if not exists (
    select 1
    from pg_catalog.pg_extension extension
    join pg_catalog.pg_namespace namespace on namespace.oid = extension.extnamespace
    where extension.extname = 'pgcrypto' and namespace.nspname = 'extensions'
  ) then
    raise exception 'pgcrypto must be installed in the extensions schema';
  end if;
end;
$$;

create table if not exists public.model_essay_admin_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists model_essay_admin_accounts_name_lower_idx
  on public.model_essay_admin_accounts (lower(name));

create table if not exists public.model_essay_student_permissions (
  student_id uuid primary key references public.flashcard_students(id) on delete cascade,
  dse boolean not null default false,
  ielts boolean not null default true,
  toeic boolean not null default false,
  toefl boolean not null default false,
  pte boolean not null default false,
  government boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.model_essay_admin_accounts(id) on delete set null
);

create table if not exists public.model_essay_admin_sessions (
  token_hash bytea primary key,
  admin_id uuid not null references public.model_essay_admin_accounts(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  check (expires_at > created_at)
);

create index if not exists model_essay_admin_sessions_expires_idx
  on public.model_essay_admin_sessions (expires_at);

create table if not exists public.model_essay_worker_secrets (
  name text primary key check (name = 'download-worker'),
  secret_hash bytea not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.model_essay_download_events (
  id bigint generated always as identity primary key,
  request_id uuid not null unique,
  student_id uuid references public.flashcard_students(id) on delete set null,
  student_name text not null,
  section text not null check (section in ('dse', 'ielts', 'toeic', 'toefl', 'pte', 'government')),
  task text not null check (length(task) between 1 and 80),
  event_type text not null check (event_type in ('single_pdf', 'selected_zip', 'all_bundle')),
  essay_ids text[] not null,
  file_count integer not null check (file_count between 1 and 1000),
  total_bytes bigint not null check (total_bytes >= 0),
  status text not null default 'started' check (status in ('started', 'completed', 'failed')),
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  check (file_count = cardinality(essay_ids)),
  check (array_position(essay_ids, null) is null),
  check (event_type <> 'single_pdf' or file_count = 1),
  check ((status = 'completed') = (completed_at is not null))
);

create index if not exists model_essay_events_time_idx
  on public.model_essay_download_events (requested_at desc, id desc);

create index if not exists model_essay_events_student_time_idx
  on public.model_essay_download_events (student_id, requested_at desc, id desc);

alter table public.model_essay_admin_accounts enable row level security;
alter table public.model_essay_student_permissions enable row level security;
alter table public.model_essay_admin_sessions enable row level security;
alter table public.model_essay_worker_secrets enable row level security;
alter table public.model_essay_download_events enable row level security;

revoke all on table public.model_essay_admin_accounts from public, anon, authenticated;
revoke all on table public.model_essay_student_permissions from public, anon, authenticated;
revoke all on table public.model_essay_admin_sessions from public, anon, authenticated;
revoke all on table public.model_essay_worker_secrets from public, anon, authenticated;
revoke all on table public.model_essay_download_events from public, anon, authenticated;

-- Provision the first admin bcrypt and Worker-secret SHA-256 separately during
-- deployment. Credentials intentionally do not live in this public repository.

insert into public.model_essay_student_permissions (student_id)
select student.id
from public.flashcard_students student
where student.deleted_at is null
on conflict (student_id) do nothing;

create or replace function public.model_essay_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.model_essay_touch_updated_at() from public, anon, authenticated;

drop trigger if exists model_essay_admin_touch_updated_at on public.model_essay_admin_accounts;
create trigger model_essay_admin_touch_updated_at
before update on public.model_essay_admin_accounts
for each row execute function public.model_essay_touch_updated_at();

drop trigger if exists model_essay_permissions_touch_updated_at on public.model_essay_student_permissions;
create trigger model_essay_permissions_touch_updated_at
before update on public.model_essay_student_permissions
for each row execute function public.model_essay_touch_updated_at();

create or replace function public._model_essay_admin_id(p_admin_token uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select session.admin_id
  from public.model_essay_admin_sessions session
  where session.token_hash = extensions.digest(p_admin_token::text, 'sha256')
    and session.expires_at > now()
  limit 1;
$$;

revoke all on function public._model_essay_admin_id(uuid) from public, anon, authenticated;

create or replace function public.model_essay_admin_login(
  p_service_secret text,
  p_name text,
  p_password text
)
returns table (admin_token uuid, name text, expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin public.model_essay_admin_accounts%rowtype;
  v_admin_key text := lower(trim(coalesce(p_name, '')));
  v_now timestamptz := clock_timestamp();
  v_token uuid := gen_random_uuid();
  v_expires_at timestamptz := v_now + interval '8 hours';
begin
  if coalesce(length(p_service_secret), 0) < 32
    or not exists (
      select 1
      from public.model_essay_worker_secrets secret
      where secret.name = 'download-worker'
        and secret.secret_hash = extensions.digest(p_service_secret, 'sha256')
    )
    or v_admin_key = ''
    or length(v_admin_key) > 100
    or p_password is null
    or length(p_password) > 200
  then
    return;
  end if;

  select *
  into v_admin
  from public.model_essay_admin_accounts admin
  where lower(admin.name) = v_admin_key
    and admin.password_hash = extensions.crypt(p_password, admin.password_hash)
  limit 1;

  if not found then
    return;
  end if;

  delete from public.model_essay_admin_sessions session
  where session.expires_at <= v_now;

  insert into public.model_essay_admin_sessions (token_hash, admin_id, expires_at)
  values (extensions.digest(v_token::text, 'sha256'), v_admin.id, v_expires_at);

  return query select v_token, v_admin.name, v_expires_at;
end;
$$;

create or replace function public.model_essay_admin_me(p_admin_token uuid)
returns table (name text, expires_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select admin.name, session.expires_at
  from public.model_essay_admin_sessions session
  join public.model_essay_admin_accounts admin on admin.id = session.admin_id
  where session.token_hash = extensions.digest(p_admin_token::text, 'sha256')
    and session.expires_at > now()
  limit 1;
$$;

create or replace function public.model_essay_admin_logout(p_admin_token uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.model_essay_admin_sessions session
  where session.token_hash = extensions.digest(p_admin_token::text, 'sha256');
  return found;
end;
$$;

create or replace function public.model_essay_student_profile(p_token uuid)
returns table (
  id uuid,
  name text,
  dse boolean,
  ielts boolean,
  toeic boolean,
  toefl boolean,
  pte boolean,
  government boolean,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_student_id uuid := public.flashcard_session_student_id(p_token);
begin
  if v_student_id is null then
    return;
  end if;

  return query
  select
    student.id,
    student.name,
    coalesce(permission.dse, false),
    coalesce(permission.ielts, true),
    coalesce(permission.toeic, false),
    coalesce(permission.toefl, false),
    coalesce(permission.pte, false),
    coalesce(permission.government, false),
    student.created_at,
    coalesce(permission.updated_at, student.updated_at)
  from public.flashcard_students student
  left join public.model_essay_student_permissions permission on permission.student_id = student.id
  where student.id = v_student_id
    and student.deleted_at is null;
end;
$$;

create or replace function public.model_essay_admin_list_students(p_admin_token uuid)
returns table (
  id uuid,
  name text,
  dse boolean,
  ielts boolean,
  toeic boolean,
  toefl boolean,
  pte boolean,
  government boolean,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if public._model_essay_admin_id(p_admin_token) is null then
    raise exception 'Invalid or expired admin session';
  end if;

  return query
  select
    student.id,
    student.name,
    coalesce(permission.dse, false),
    coalesce(permission.ielts, true),
    coalesce(permission.toeic, false),
    coalesce(permission.toefl, false),
    coalesce(permission.pte, false),
    coalesce(permission.government, false),
    student.created_at,
    coalesce(permission.updated_at, student.updated_at)
  from public.flashcard_students student
  left join public.model_essay_student_permissions permission on permission.student_id = student.id
  where student.deleted_at is null
  order by student.created_at desc, student.name asc;
end;
$$;

create or replace function public.model_essay_admin_set_student_access(
  p_admin_token uuid,
  p_student_id uuid,
  p_access jsonb
)
returns table (
  id uuid,
  name text,
  dse boolean,
  ielts boolean,
  toeic boolean,
  toefl boolean,
  pte boolean,
  government boolean,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid := public._model_essay_admin_id(p_admin_token);
begin
  if v_admin_id is null then
    raise exception 'Invalid or expired admin session';
  end if;

  if p_access is null
    or jsonb_typeof(p_access) <> 'object'
    or coalesce(jsonb_typeof(p_access -> 'dse'), '') <> 'boolean'
    or coalesce(jsonb_typeof(p_access -> 'ielts'), '') <> 'boolean'
    or coalesce(jsonb_typeof(p_access -> 'toeic'), '') <> 'boolean'
    or coalesce(jsonb_typeof(p_access -> 'toefl'), '') <> 'boolean'
    or coalesce(jsonb_typeof(p_access -> 'pte'), '') <> 'boolean'
    or coalesce(jsonb_typeof(p_access -> 'government'), '') <> 'boolean'
  then
    raise exception 'Every section permission must be a boolean';
  end if;

  if not exists (
    select 1 from public.flashcard_students student
    where student.id = p_student_id and student.deleted_at is null
  ) then
    raise exception 'Student not found';
  end if;

  insert into public.model_essay_student_permissions (
    student_id, dse, ielts, toeic, toefl, pte, government, updated_by, updated_at
  )
  values (
    p_student_id,
    (p_access ->> 'dse')::boolean,
    (p_access ->> 'ielts')::boolean,
    (p_access ->> 'toeic')::boolean,
    (p_access ->> 'toefl')::boolean,
    (p_access ->> 'pte')::boolean,
    (p_access ->> 'government')::boolean,
    v_admin_id,
    now()
  )
  on conflict (student_id) do update
  set dse = excluded.dse,
      ielts = excluded.ielts,
      toeic = excluded.toeic,
      toefl = excluded.toefl,
      pte = excluded.pte,
      government = excluded.government,
      updated_by = excluded.updated_by,
      updated_at = now();

  return query
  select
    student.id,
    student.name,
    permission.dse,
    permission.ielts,
    permission.toeic,
    permission.toefl,
    permission.pte,
    permission.government,
    permission.updated_at
  from public.flashcard_students student
  join public.model_essay_student_permissions permission on permission.student_id = student.id
  where student.id = p_student_id;
end;
$$;

create or replace function public._model_essay_worker_ok(p_service_secret text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(length(p_service_secret), 0) >= 32
    and exists (
      select 1
      from public.model_essay_worker_secrets secret
      where secret.name = 'download-worker'
        and secret.secret_hash = extensions.digest(p_service_secret, 'sha256')
    );
$$;

revoke all on function public._model_essay_worker_ok(text) from public, anon, authenticated;

create or replace function public.model_essay_record_download(
  p_service_secret text,
  p_request_id uuid,
  p_student_id uuid,
  p_section text,
  p_task text,
  p_event_type text,
  p_essay_ids text[],
  p_total_bytes bigint
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_name text;
  v_allowed boolean;
  v_count integer := coalesce(cardinality(p_essay_ids), 0);
  v_section text := lower(trim(coalesce(p_section, '')));
  v_event_type text := lower(trim(coalesce(p_event_type, '')));
begin
  if not public._model_essay_worker_ok(p_service_secret) then
    return null;
  end if;

  if p_request_id is null
    or p_student_id is null
    or v_section not in ('dse', 'ielts', 'toeic', 'toefl', 'pte', 'government')
    or v_event_type not in ('single_pdf', 'selected_zip', 'all_bundle')
    or nullif(trim(p_task), '') is null
    or length(trim(p_task)) > 80
    or v_count < 1
    or v_count > 1000
    or p_total_bytes is null
    or p_total_bytes < 0
  then
    return null;
  end if;

  if (v_event_type = 'single_pdf' and v_count <> 1)
    or (v_event_type = 'selected_zip' and v_count <= 10)
    or (v_event_type = 'all_bundle' and v_count <= 10)
  then
    return null;
  end if;

  if exists (
    select 1 from unnest(p_essay_ids) item(essay_id)
    where item.essay_id is null or item.essay_id !~* '^[0-9a-f]{16}$'
  ) then
    return null;
  end if;

  if (select count(distinct item.essay_id) from unnest(p_essay_ids) item(essay_id)) <> v_count then
    return null;
  end if;

  select
    student.name,
    case v_section
      when 'dse' then coalesce(permission.dse, false)
      when 'ielts' then coalesce(permission.ielts, true)
      when 'toeic' then coalesce(permission.toeic, false)
      when 'toefl' then coalesce(permission.toefl, false)
      when 'pte' then coalesce(permission.pte, false)
      when 'government' then coalesce(permission.government, false)
      else false
    end
  into v_student_name, v_allowed
  from public.flashcard_students student
  left join public.model_essay_student_permissions permission on permission.student_id = student.id
  where student.id = p_student_id
    and student.deleted_at is null;

  if not found or not v_allowed then
    return null;
  end if;

  insert into public.model_essay_download_events (
    request_id, student_id, student_name, section, task, event_type, essay_ids, file_count, total_bytes
  )
  values (
    p_request_id, p_student_id, v_student_name, v_section, trim(p_task),
    v_event_type, p_essay_ids, v_count, p_total_bytes
  )
  on conflict (request_id) do nothing;

  if found then
    return p_request_id;
  end if;

  if exists (
    select 1 from public.model_essay_download_events event
    where event.request_id = p_request_id
      and event.student_id = p_student_id
      and event.section = v_section
      and event.task = trim(p_task)
      and event.event_type = v_event_type
      and event.essay_ids = p_essay_ids
      and event.file_count = v_count
      and event.total_bytes = p_total_bytes
  ) then
    return p_request_id;
  end if;

  return null;
end;
$$;

create or replace function public.model_essay_finish_download(
  p_service_secret text,
  p_request_id uuid,
  p_status text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status text := lower(trim(coalesce(p_status, '')));
begin
  if not public._model_essay_worker_ok(p_service_secret)
    or p_request_id is null
    or v_status not in ('completed', 'failed')
  then
    return false;
  end if;

  update public.model_essay_download_events event
  set status = v_status,
      completed_at = case when v_status = 'completed' then now() else null end
  where event.request_id = p_request_id
    and event.status = 'started';

  if found then
    return true;
  end if;

  return exists (
    select 1
    from public.model_essay_download_events event
    where event.request_id = p_request_id
      and event.status = v_status
  );
end;
$$;

create or replace function public.model_essay_admin_list_download_events(
  p_admin_token uuid,
  p_page integer,
  p_page_size integer,
  p_student_id uuid
)
returns table (
  total_count bigint,
  id bigint,
  student_id uuid,
  student_name text,
  event_type text,
  essay_ids text[],
  file_count integer,
  total_bytes bigint,
  status text,
  requested_at timestamptz,
  completed_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_page integer := greatest(coalesce(p_page, 1), 1);
  v_page_size integer := least(greatest(coalesce(p_page_size, 20), 1), 100);
begin
  if public._model_essay_admin_id(p_admin_token) is null then
    raise exception 'Invalid or expired admin session';
  end if;

  return query
  select
    count(*) over (),
    event.id,
    event.student_id,
    event.student_name,
    event.event_type,
    event.essay_ids,
    event.file_count,
    event.total_bytes,
    event.status,
    event.requested_at,
    event.completed_at
  from public.model_essay_download_events event
  where p_student_id is null or event.student_id = p_student_id
  order by event.requested_at desc, event.id desc
  limit v_page_size
  offset ((v_page - 1) * v_page_size);
end;
$$;

create or replace function public.model_essay_admin_student_download_totals(p_admin_token uuid)
returns table (student_id uuid, student_name text, essay_count bigint, last_download_at timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if public._model_essay_admin_id(p_admin_token) is null then
    raise exception 'Invalid or expired admin session';
  end if;

  return query
  select
    student.id,
    student.name,
    coalesce(sum(event.file_count) filter (where event.status = 'completed'), 0)::bigint,
    max(event.completed_at) filter (where event.status = 'completed')
  from public.flashcard_students student
  left join public.model_essay_download_events event on event.student_id = student.id
  where student.deleted_at is null
  group by student.id, student.name
  order by student.name;
end;
$$;

revoke all on function public.model_essay_admin_login(text, text, text) from public, anon, authenticated;
revoke all on function public.model_essay_admin_me(uuid) from public, anon, authenticated;
revoke all on function public.model_essay_admin_logout(uuid) from public, anon, authenticated;
revoke all on function public.model_essay_student_profile(uuid) from public, anon, authenticated;
revoke all on function public.model_essay_admin_list_students(uuid) from public, anon, authenticated;
revoke all on function public.model_essay_admin_set_student_access(uuid, uuid, jsonb) from public, anon, authenticated;
revoke all on function public.model_essay_record_download(text, uuid, uuid, text, text, text, text[], bigint) from public, anon, authenticated;
revoke all on function public.model_essay_finish_download(text, uuid, text) from public, anon, authenticated;
revoke all on function public.model_essay_admin_list_download_events(uuid, integer, integer, uuid) from public, anon, authenticated;
revoke all on function public.model_essay_admin_student_download_totals(uuid) from public, anon, authenticated;

-- The rate-limited Worker supplies the high-entropy service secret; browsers
-- cannot invoke the bcrypt endpoint directly.
grant execute on function public.model_essay_admin_login(text, text, text) to anon;
grant execute on function public.model_essay_admin_me(uuid) to authenticated;
grant execute on function public.model_essay_admin_logout(uuid) to authenticated;
grant execute on function public.model_essay_student_profile(uuid) to authenticated;
grant execute on function public.model_essay_admin_list_students(uuid) to authenticated;
grant execute on function public.model_essay_admin_set_student_access(uuid, uuid, jsonb) to authenticated;
grant execute on function public.model_essay_admin_list_download_events(uuid, integer, integer, uuid) to authenticated;
grant execute on function public.model_essay_admin_student_download_totals(uuid) to authenticated;

-- The Worker calls this RPC as anon; its high-entropy secret is the authorization gate.
grant execute on function public.model_essay_record_download(text, uuid, uuid, text, text, text, text[], bigint) to anon;
grant execute on function public.model_essay_finish_download(text, uuid, text) to anon;

notify pgrst, 'reload schema';

commit;
