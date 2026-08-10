-- EdmundEducation Schedule administrator account-management parity.
--
-- Apply after supabase-schedule-account-management.sql.
--
-- Security properties:
--   * Every public RPC authenticates an expiring Schedule admin token.
--   * Passwords remain bcrypt hashes. No function below returns a password,
--     password hash, session token, or token hash.
--   * Student-list preferences are durable per Schedule administrator, while
--     the custom order deliberately reuses flashcard_students.sort_order.
--   * Destructive deletion is a two-step operation: preview dependencies,
--     then confirm the exact name, row timestamp, dependency snapshot, and
--     retained-audit count. Non-cascading dependencies (notably undeleted
--     Speaking recordings) block deletion.
--   * Account/password audit history is retained after permanent deletion.

begin;

do $$
begin
  if pg_catalog.to_regclass('public.flashcard_students') is null
    or pg_catalog.to_regclass('public.flashcard_student_sessions') is null
    or pg_catalog.to_regclass('public.flashcard_student_password_logs') is null
    or pg_catalog.to_regclass('public.writing_student_accounts') is null
    or pg_catalog.to_regclass('public.writing_password_logs') is null
    or pg_catalog.to_regclass('public.schedule_admin_accounts') is null
    or pg_catalog.to_regprocedure('public._schedule_admin_id(uuid)') is null
    or pg_catalog.to_regprocedure('public.writing_sync_flashcard_student(uuid)') is null
    or pg_catalog.to_regprocedure(
      'public.schedule_admin_upsert_student_account(uuid,text,text,jsonb)'
    ) is null
  then
    raise exception
      'Apply shared-account, Writing, Schedule, and Schedule account-management migrations first';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_attribute attribute
    where attribute.attrelid = 'public.flashcard_students'::pg_catalog.regclass
      and attribute.attname = 'sort_order'
      and not attribute.attisdropped
  ) then
    raise exception 'Missing dependency: public.flashcard_students.sort_order';
  end if;
end;
$$;

alter table public.schedule_admin_accounts
  add column if not exists student_sort_mode text not null default 'custom';

do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_constraint constraint_row
    where constraint_row.conrelid = 'public.schedule_admin_accounts'::pg_catalog.regclass
      and constraint_row.conname = 'schedule_admin_student_sort_mode_check'
  ) then
    alter table public.schedule_admin_accounts
      add constraint schedule_admin_student_sort_mode_check
      check (student_sort_mode in ('asc', 'desc', 'custom'));
  end if;
end;
$$;

-- This table intentionally has no FK to flashcard_students: its purpose is to
-- preserve a minimal audit trail after a student account is permanently
-- removed. It stores event metadata only, never credentials or their hashes.
create table if not exists public.schedule_student_account_audit (
  id bigint generated always as identity primary key,
  student_id uuid,
  student_name text not null,
  event_type text not null,
  actor_admin_id uuid
    references public.schedule_admin_accounts(id) on delete set null,
  actor_label text not null,
  source_system text,
  source_event_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  check (pg_catalog.char_length(student_name) between 1 and 100),
  check (student_name !~ '[[:cntrl:]]'),
  check (pg_catalog.char_length(actor_label) between 1 and 160),
  check (actor_label !~ '[[:cntrl:]]'),
  check (event_type in (
    'account_created',
    'account_deactivated',
    'account_reactivated',
    'access_changed',
    'password_changed',
    'sort_order_changed',
    'permanent_delete'
  )),
  check (
    (source_system is null and source_event_id is null)
    or (
      source_system in ('flashcard_password_log', 'writing_password_log')
      and source_event_id is not null
    )
  ),
  check (pg_catalog.jsonb_typeof(metadata) = 'object'),
  check (pg_catalog.octet_length(metadata::text) <= 262144),
  check (not (metadata ?| array[
    'password', 'password_hash', 'passwordHash', 'hash',
    'secret', 'token', 'session_token', 'sessionToken'
  ]))
);

create unique index if not exists schedule_student_account_audit_source_idx
  on public.schedule_student_account_audit (source_system, source_event_id)
  where source_system is not null and source_event_id is not null;

create index if not exists schedule_student_account_audit_student_time_idx
  on public.schedule_student_account_audit
  (student_id, occurred_at desc, id desc);

create index if not exists schedule_student_account_audit_time_idx
  on public.schedule_student_account_audit (occurred_at desc, id desc);

create index if not exists flashcard_student_sessions_student_created_idx
  on public.flashcard_student_sessions (student_id, created_at desc);

create index if not exists flashcard_password_logs_student_time_idx
  on public.flashcard_student_password_logs
  (student_id, changed_at desc, id desc);

create index if not exists writing_password_logs_student_time_idx
  on public.writing_password_logs
  (student_id, changed_at desc, id desc);

create index if not exists flashcard_students_name_lower_idx
  on public.flashcard_students (pg_catalog.lower(name));

create index if not exists writing_student_accounts_name_lower_idx
  on public.writing_student_accounts (pg_catalog.lower(name));

alter table public.schedule_student_account_audit enable row level security;

revoke all on table public.schedule_student_account_audit
  from public, anon, authenticated, service_role;
revoke all on sequence public.schedule_student_account_audit_id_seq
  from public, anon, authenticated, service_role;

-- Return a complete, deterministic snapshot of every FK that references the
-- shared student master row. A special name-bridge entry covers the legacy
-- Writing account, whose relationship predates UUID-based shared accounts.
create or replace function public._schedule_student_dependency_snapshot(
  p_student_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_result jsonb := '{}'::jsonb;
  v_student_name text;
  v_fk record;
  v_row_count bigint;
  v_delete_action text;
  v_key text;
begin
  if p_student_id is null then
    raise exception 'Student ID is required' using errcode = '22023';
  end if;

  select student.name
  into v_student_name
  from public.flashcard_students student
  where student.id = p_student_id;

  if v_student_name is null then
    raise exception 'Student not found' using errcode = 'P0002';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_constraint constraint_row
    where constraint_row.contype = 'f'
      and constraint_row.confrelid = 'public.flashcard_students'::pg_catalog.regclass
      and (
        pg_catalog.cardinality(constraint_row.conkey) <> 1
        or pg_catalog.cardinality(constraint_row.confkey) <> 1
      )
  ) then
    raise exception 'Unsupported composite student-account dependency detected'
      using errcode = '0A000';
  end if;

  for v_fk in
    select
      namespace.nspname as schema_name,
      relation.relname as table_name,
      attribute.attname as column_name,
      constraint_row.conname as constraint_name,
      constraint_row.confdeltype as delete_type
    from pg_catalog.pg_constraint constraint_row
    join pg_catalog.pg_class relation
      on relation.oid = constraint_row.conrelid
    join pg_catalog.pg_namespace namespace
      on namespace.oid = relation.relnamespace
    join pg_catalog.pg_attribute attribute
      on attribute.attrelid = constraint_row.conrelid
     and attribute.attnum = constraint_row.conkey[1]
    where constraint_row.contype = 'f'
      and constraint_row.confrelid = 'public.flashcard_students'::pg_catalog.regclass
    order by namespace.nspname, relation.relname, constraint_row.conname
  loop
    execute pg_catalog.format(
      'select pg_catalog.count(*) from %I.%I where %I = $1',
      v_fk.schema_name,
      v_fk.table_name,
      v_fk.column_name
    )
    into v_row_count
    using p_student_id;

    v_delete_action := case v_fk.delete_type
      when 'a' then 'NO ACTION'
      when 'r' then 'RESTRICT'
      when 'c' then 'CASCADE'
      when 'n' then 'SET NULL'
      when 'd' then 'SET DEFAULT'
      else 'UNKNOWN'
    end;
    v_key := v_fk.schema_name || '.' || v_fk.table_name || ':' || v_fk.constraint_name;

    v_result := v_result || pg_catalog.jsonb_build_object(
      v_key,
      pg_catalog.jsonb_build_object(
        'table', v_fk.schema_name || '.' || v_fk.table_name,
        'column', v_fk.column_name,
        'constraint', v_fk.constraint_name,
        'onDelete', v_delete_action,
        'rowCount', v_row_count
      )
    );
  end loop;

  if exists (
    select 1
    from pg_catalog.pg_constraint constraint_row
    where constraint_row.contype = 'f'
      and constraint_row.confrelid = 'public.writing_student_accounts'::pg_catalog.regclass
      and (
        pg_catalog.cardinality(constraint_row.conkey) <> 1
        or pg_catalog.cardinality(constraint_row.confkey) <> 1
      )
  ) then
    raise exception 'Unsupported composite Writing-account dependency detected'
      using errcode = '0A000';
  end if;

  -- The Writing system originally used a separate UUID. Count every child of
  -- the name-matched Writing identity as part of the same deletion preview.
  for v_fk in
    select
      namespace.nspname as schema_name,
      relation.relname as table_name,
      attribute.attname as column_name,
      constraint_row.conname as constraint_name,
      constraint_row.confdeltype as delete_type
    from pg_catalog.pg_constraint constraint_row
    join pg_catalog.pg_class relation
      on relation.oid = constraint_row.conrelid
    join pg_catalog.pg_namespace namespace
      on namespace.oid = relation.relnamespace
    join pg_catalog.pg_attribute attribute
      on attribute.attrelid = constraint_row.conrelid
     and attribute.attnum = constraint_row.conkey[1]
    where constraint_row.contype = 'f'
      and constraint_row.confrelid = 'public.writing_student_accounts'::pg_catalog.regclass
    order by namespace.nspname, relation.relname, constraint_row.conname
  loop
    execute pg_catalog.format(
      'select pg_catalog.count(*) from %I.%I where %I in (' ||
      'select id from public.writing_student_accounts where ' ||
      'pg_catalog.lower(name) = pg_catalog.lower($1))',
      v_fk.schema_name,
      v_fk.table_name,
      v_fk.column_name
    )
    into v_row_count
    using v_student_name;

    v_delete_action := case v_fk.delete_type
      when 'a' then 'NO ACTION'
      when 'r' then 'RESTRICT'
      when 'c' then 'CASCADE'
      when 'n' then 'SET NULL'
      when 'd' then 'SET DEFAULT'
      else 'UNKNOWN'
    end;
    v_key := v_fk.schema_name || '.' || v_fk.table_name || ':' || v_fk.constraint_name;

    v_result := v_result || pg_catalog.jsonb_build_object(
      v_key,
      pg_catalog.jsonb_build_object(
        'table', v_fk.schema_name || '.' || v_fk.table_name,
        'column', v_fk.column_name,
        'constraint', v_fk.constraint_name,
        'via', 'public.writing_student_accounts',
        'onDelete', v_delete_action,
        'rowCount', v_row_count
      )
    );
  end loop;

  select pg_catalog.count(*)::bigint
  into v_row_count
  from public.writing_student_accounts writing_account
  where pg_catalog.lower(writing_account.name) = pg_catalog.lower(v_student_name);

  v_result := v_result || pg_catalog.jsonb_build_object(
    'public.writing_student_accounts:name_bridge',
    pg_catalog.jsonb_build_object(
      'table', 'public.writing_student_accounts',
      'column', 'name',
      'constraint', 'legacy_case_insensitive_name_bridge',
      'onDelete', 'MANUAL CASCADE',
      'rowCount', v_row_count
    )
  );

  return v_result;
end;
$$;

create or replace function public._schedule_student_retained_audit_count(
  p_student_id uuid,
  p_student_name text
)
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select
    (
      select pg_catalog.count(*)
      from public.schedule_student_account_audit audit
      where audit.student_id = p_student_id
    )
    +
    (
      select pg_catalog.count(*)
      from public.flashcard_student_password_logs password_log
      where password_log.student_id = p_student_id
        and not exists (
          select 1
          from public.schedule_student_account_audit audit
          where audit.source_system = 'flashcard_password_log'
            and audit.source_event_id = password_log.id
        )
    )
    +
    (
      select pg_catalog.count(*)
      from public.writing_password_logs password_log
      join public.writing_student_accounts writing_account
        on writing_account.id = password_log.student_id
      where pg_catalog.lower(writing_account.name) = pg_catalog.lower(p_student_name)
        and not exists (
          select 1
          from public.schedule_student_account_audit audit
          where audit.source_system = 'writing_password_log'
            and audit.source_event_id = password_log.id
        )
    );
$$;

create or replace function public.schedule_admin_list_student_accounts(
  p_admin_token uuid,
  p_status text default 'all',
  p_limit integer default 100,
  p_offset integer default 0
)
returns table (
  id uuid,
  name text,
  access jsonb,
  sort_order integer,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz,
  deleted_at timestamptz,
  last_session_at timestamptz,
  last_password_change_at timestamptz,
  total_count bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid := public._schedule_admin_id(p_admin_token);
  v_status text := pg_catalog.lower(pg_catalog.btrim(coalesce(p_status, '')));
  v_sort_mode text;
begin
  if v_admin_id is null then
    raise exception 'Invalid or expired admin session' using errcode = '28000';
  end if;
  if v_status not in ('all', 'active', 'inactive')
    or p_limit not between 1 and 200
    or p_offset not between 0 and 1000000
  then
    raise exception 'Invalid student-list filters' using errcode = '22023';
  end if;

  select admin.student_sort_mode
  into v_sort_mode
  from public.schedule_admin_accounts admin
  where admin.id = v_admin_id;
  v_sort_mode := case
    when v_sort_mode in ('asc', 'desc', 'custom') then v_sort_mode
    else 'custom'
  end;

  return query
  select
    student.id,
    student.name,
    student.access,
    student.sort_order,
    student.deleted_at is null,
    student.created_at,
    student.updated_at,
    student.deleted_at,
    (
      select pg_catalog.max(session_row.created_at)
      from public.flashcard_student_sessions session_row
      where session_row.student_id = student.id
    ),
    (
      select pg_catalog.max(change_row.changed_at)
      from (
        select password_log.changed_at
        from public.flashcard_student_password_logs password_log
        where password_log.student_id = student.id
        union all
        select password_log.changed_at
        from public.writing_password_logs password_log
        join public.writing_student_accounts writing_account
          on writing_account.id = password_log.student_id
        where pg_catalog.lower(writing_account.name) = pg_catalog.lower(student.name)
      ) change_row
    ),
    pg_catalog.count(*) over ()
  from public.flashcard_students student
  where v_status = 'all'
     or (v_status = 'active' and student.deleted_at is null)
     or (v_status = 'inactive' and student.deleted_at is not null)
  order by
    case when student.deleted_at is null then 0 else 1 end,
    case when v_sort_mode = 'custom' then student.sort_order end asc nulls last,
    case when v_sort_mode = 'asc' then pg_catalog.lower(student.name) end asc,
    case when v_sort_mode = 'desc' then pg_catalog.lower(student.name) end desc,
    pg_catalog.lower(student.name),
    student.created_at,
    student.id
  limit p_limit
  offset p_offset;
end;
$$;

create or replace function public.schedule_admin_get_student_list_preferences(
  p_admin_token uuid
)
returns table (sort_mode text, student_order jsonb)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid := public._schedule_admin_id(p_admin_token);
begin
  if v_admin_id is null then
    raise exception 'Invalid or expired admin session' using errcode = '28000';
  end if;

  return query
  select
    case
      when admin.student_sort_mode in ('asc', 'desc', 'custom')
        then admin.student_sort_mode
      else 'custom'
    end,
    coalesce((
      select pg_catalog.jsonb_agg(
        student.id order by student.sort_order nulls last,
        pg_catalog.lower(student.name), student.id
      )
      from public.flashcard_students student
      where student.deleted_at is null
    ), '[]'::jsonb)
  from public.schedule_admin_accounts admin
  where admin.id = v_admin_id;
end;
$$;

create or replace function public.schedule_admin_set_student_sort_mode(
  p_admin_token uuid,
  p_sort_mode text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid := public._schedule_admin_id(p_admin_token);
  v_sort_mode text := pg_catalog.lower(pg_catalog.btrim(coalesce(p_sort_mode, '')));
begin
  if v_admin_id is null then
    raise exception 'Invalid or expired admin session' using errcode = '28000';
  end if;
  if v_sort_mode not in ('asc', 'desc', 'custom') then
    raise exception 'Unsupported student sort mode' using errcode = '22023';
  end if;

  update public.schedule_admin_accounts admin
  set student_sort_mode = v_sort_mode,
      updated_at = pg_catalog.clock_timestamp()
  where admin.id = v_admin_id;
  return v_sort_mode;
end;
$$;

create or replace function public.schedule_admin_reorder_students(
  p_admin_token uuid,
  p_student_ids uuid[]
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid := public._schedule_admin_id(p_admin_token);
  v_admin_name text;
  v_expected_count integer;
  v_submitted_count integer := coalesce(pg_catalog.cardinality(p_student_ids), 0);
  v_distinct_count integer;
  v_matching_count integer;
  v_changed_count integer := 0;
  v_change record;
  v_order jsonb;
begin
  if v_admin_id is null then
    raise exception 'Invalid or expired admin session' using errcode = '28000';
  end if;
  if v_submitted_count > 5000 then
    raise exception 'Student order exceeds the supported maximum'
      using errcode = '22023';
  end if;

  lock table public.flashcard_students in share row exclusive mode;

  select admin.name into v_admin_name
  from public.schedule_admin_accounts admin
  where admin.id = v_admin_id;

  select pg_catalog.count(*)::integer
  into v_expected_count
  from public.flashcard_students student
  where student.deleted_at is null;

  select pg_catalog.count(distinct requested.student_id)::integer
  into v_distinct_count
  from pg_catalog.unnest(coalesce(p_student_ids, array[]::uuid[]))
    requested(student_id);

  select pg_catalog.count(*)::integer
  into v_matching_count
  from public.flashcard_students student
  join pg_catalog.unnest(coalesce(p_student_ids, array[]::uuid[]))
    requested(student_id) on requested.student_id = student.id
  where student.deleted_at is null;

  if v_submitted_count <> v_expected_count
    or v_distinct_count <> v_submitted_count
    or v_matching_count <> v_expected_count
  then
    raise exception 'Student order must contain every active student exactly once'
      using errcode = '22023';
  end if;

  for v_change in
    select
      student.id,
      student.name,
      student.sort_order as previous_sort_order,
      requested.position::integer as next_sort_order
    from public.flashcard_students student
    join pg_catalog.unnest(p_student_ids) with ordinality
      requested(student_id, position) on requested.student_id = student.id
    where student.deleted_at is null
      and student.sort_order is distinct from requested.position::integer
    order by requested.position
  loop
    update public.flashcard_students student
    set sort_order = v_change.next_sort_order,
        updated_at = pg_catalog.clock_timestamp()
    where student.id = v_change.id;

    insert into public.schedule_student_account_audit (
      student_id, student_name, event_type,
      actor_admin_id, actor_label, metadata
    ) values (
      v_change.id,
      v_change.name,
      'sort_order_changed',
      v_admin_id,
      v_admin_name,
      pg_catalog.jsonb_build_object(
        'previousSortOrder', v_change.previous_sort_order,
        'sortOrder', v_change.next_sort_order
      )
    );
    v_changed_count := v_changed_count + 1;
  end loop;

  update public.schedule_admin_accounts admin
  set student_sort_mode = 'custom',
      updated_at = pg_catalog.clock_timestamp()
  where admin.id = v_admin_id;

  select coalesce(pg_catalog.jsonb_agg(
    student.id order by student.sort_order, student.id
  ), '[]'::jsonb)
  into v_order
  from public.flashcard_students student
  where student.deleted_at is null;

  return pg_catalog.jsonb_build_object(
    'reorderedCount', v_changed_count,
    'studentOrder', v_order
  );
end;
$$;

create or replace function public.schedule_admin_set_student_access(
  p_admin_token uuid,
  p_student_id uuid,
  p_access jsonb,
  p_expected_updated_at timestamptz default null
)
returns table (
  id uuid,
  name text,
  access jsonb,
  sort_order integer,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz,
  deleted_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid := public._schedule_admin_id(p_admin_token);
  v_admin_name text;
  v_student public.flashcard_students%rowtype;
begin
  if v_admin_id is null then
    raise exception 'Invalid or expired admin session' using errcode = '28000';
  end if;
  if p_access is null
    or pg_catalog.jsonb_typeof(p_access) <> 'object'
    or pg_catalog.octet_length(p_access::text) > 32768
    or p_access ?| array[
      'password', 'password_hash', 'passwordHash', 'hash',
      'secret', 'token', 'session_token', 'sessionToken'
    ]
  then
    raise exception 'Access must be a safe JSON object of at most 32 KB'
      using errcode = '22023';
  end if;

  select student.* into v_student
  from public.flashcard_students student
  where student.id = p_student_id
  for update;
  if not found then
    raise exception 'Student not found' using errcode = 'P0002';
  end if;
  if p_expected_updated_at is not null
    and v_student.updated_at is distinct from p_expected_updated_at
  then
    raise exception 'Student account changed in another session; reload and try again'
      using errcode = '40001';
  end if;

  select admin.name into v_admin_name
  from public.schedule_admin_accounts admin
  where admin.id = v_admin_id;

  if v_student.access is distinct from p_access then
    update public.flashcard_students student
    set access = p_access,
        updated_at = pg_catalog.clock_timestamp()
    where student.id = p_student_id;

    insert into public.schedule_student_account_audit (
      student_id, student_name, event_type,
      actor_admin_id, actor_label, metadata
    ) values (
      v_student.id,
      v_student.name,
      'access_changed',
      v_admin_id,
      v_admin_name,
      pg_catalog.jsonb_build_object(
        'previousAccess', v_student.access,
        'access', p_access
      )
    );
  end if;

  return query
  select student.id, student.name, student.access, student.sort_order,
    student.deleted_at is null, student.created_at, student.updated_at,
    student.deleted_at
  from public.flashcard_students student
  where student.id = p_student_id;
end;
$$;

create or replace function public.schedule_admin_get_student_account_audit(
  p_admin_token uuid,
  p_student_id uuid default null,
  p_limit integer default 50,
  p_offset integer default 0
)
returns table (
  event_id text,
  event_type text,
  student_id uuid,
  student_name text,
  actor_label text,
  metadata jsonb,
  occurred_at timestamptz,
  total_count bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if public._schedule_admin_id(p_admin_token) is null then
    raise exception 'Invalid or expired admin session' using errcode = '28000';
  end if;
  if p_limit not between 1 and 200
    or p_offset not between 0 and 1000000
  then
    raise exception 'Invalid audit pagination' using errcode = '22023';
  end if;

  return query
  with combined as (
    select
      'audit:' || audit.id::text as event_id,
      audit.event_type,
      audit.student_id,
      audit.student_name,
      audit.actor_label,
      audit.metadata,
      audit.occurred_at
    from public.schedule_student_account_audit audit
    where p_student_id is null or audit.student_id = p_student_id

    union all

    select
      'flashcard-password:' || password_log.id::text,
      'password_changed',
      password_log.student_id,
      password_log.student_name,
      password_log.changed_by,
      pg_catalog.jsonb_build_object('source', 'legacy_flashcard_password_log'),
      password_log.changed_at
    from public.flashcard_student_password_logs password_log
    where (p_student_id is null or password_log.student_id = p_student_id)
      and not exists (
        select 1
        from public.schedule_student_account_audit audit
        where audit.source_system = 'flashcard_password_log'
          and audit.source_event_id = password_log.id
      )

    union all

    select
      'writing-password:' || password_log.id::text,
      'password_changed',
      student.id,
      student.name,
      password_log.changed_by,
      pg_catalog.jsonb_build_object('source', 'legacy_writing_password_log'),
      password_log.changed_at
    from public.writing_password_logs password_log
    join public.writing_student_accounts writing_account
      on writing_account.id = password_log.student_id
    join public.flashcard_students student
      on pg_catalog.lower(student.name) = pg_catalog.lower(writing_account.name)
    where (p_student_id is null or student.id = p_student_id)
      and not exists (
        select 1
        from public.schedule_student_account_audit audit
        where audit.source_system = 'writing_password_log'
          and audit.source_event_id = password_log.id
      )
  ), counted as (
    select combined.*, pg_catalog.count(*) over () as total_count
    from combined
  )
  select counted.event_id, counted.event_type, counted.student_id,
    counted.student_name, counted.actor_label, counted.metadata,
    counted.occurred_at, counted.total_count
  from counted
  order by counted.occurred_at desc, counted.event_id desc
  limit p_limit
  offset p_offset;
end;
$$;

create or replace function public.schedule_admin_reactivate_student(
  p_admin_token uuid,
  p_student_id uuid,
  p_expected_deleted_at timestamptz
)
returns table (
  id uuid,
  name text,
  access jsonb,
  sort_order integer,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz,
  deleted_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid := public._schedule_admin_id(p_admin_token);
  v_admin_name text;
  v_student public.flashcard_students%rowtype;
  v_sort_order integer;
begin
  if v_admin_id is null then
    raise exception 'Invalid or expired admin session' using errcode = '28000';
  end if;
  if p_expected_deleted_at is null then
    raise exception 'Expected deletion timestamp is required' using errcode = '22023';
  end if;

  lock table public.flashcard_students in share row exclusive mode;

  select student.* into v_student
  from public.flashcard_students student
  where student.id = p_student_id
  for update;
  if not found then
    raise exception 'Student not found' using errcode = 'P0002';
  end if;
  if v_student.deleted_at is null then
    raise exception 'Student account is already active' using errcode = '55000';
  end if;
  if v_student.deleted_at is distinct from p_expected_deleted_at then
    raise exception 'Student account changed in another session; reload and try again'
      using errcode = '40001';
  end if;

  select coalesce(pg_catalog.max(student.sort_order), 0) + 1
  into v_sort_order
  from public.flashcard_students student
  where student.deleted_at is null;

  select admin.name into v_admin_name
  from public.schedule_admin_accounts admin
  where admin.id = v_admin_id;

  update public.flashcard_students student
  set deleted_at = null,
      sort_order = v_sort_order,
      updated_at = pg_catalog.clock_timestamp()
  where student.id = p_student_id;

  delete from public.flashcard_student_sessions session_row
  where session_row.student_id = p_student_id;
  perform public.writing_sync_flashcard_student(p_student_id);

  insert into public.schedule_student_account_audit (
    student_id, student_name, event_type,
    actor_admin_id, actor_label, metadata
  ) values (
    v_student.id,
    v_student.name,
    'account_reactivated',
    v_admin_id,
    v_admin_name,
    pg_catalog.jsonb_build_object(
      'previousDeletedAt', v_student.deleted_at,
      'sortOrder', v_sort_order
    )
  );

  return query
  select student.id, student.name, student.access, student.sort_order,
    student.deleted_at is null, student.created_at, student.updated_at,
    student.deleted_at
  from public.flashcard_students student
  where student.id = p_student_id;
end;
$$;

create or replace function public.schedule_admin_get_student_deletion_impact(
  p_admin_token uuid,
  p_student_id uuid
)
returns table (
  id uuid,
  name text,
  is_active boolean,
  updated_at timestamptz,
  dependency_counts jsonb,
  dependency_total bigint,
  retained_audit_count bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_student public.flashcard_students%rowtype;
  v_dependencies jsonb;
begin
  if public._schedule_admin_id(p_admin_token) is null then
    raise exception 'Invalid or expired admin session' using errcode = '28000';
  end if;

  select student.* into v_student
  from public.flashcard_students student
  where student.id = p_student_id;
  if not found then
    raise exception 'Student not found' using errcode = 'P0002';
  end if;

  v_dependencies := public._schedule_student_dependency_snapshot(p_student_id);

  return query
  select
    v_student.id,
    v_student.name,
    v_student.deleted_at is null,
    v_student.updated_at,
    v_dependencies,
    coalesce((
      select pg_catalog.sum((dependency.value ->> 'rowCount')::bigint)
      from pg_catalog.jsonb_each(v_dependencies) dependency
    ), 0),
    public._schedule_student_retained_audit_count(
      v_student.id, v_student.name
    );
end;
$$;

create or replace function public.schedule_admin_permanently_delete_student(
  p_admin_token uuid,
  p_student_id uuid,
  p_typed_name text,
  p_expected_updated_at timestamptz,
  p_expected_dependency_counts jsonb,
  p_expected_audit_count bigint
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid := public._schedule_admin_id(p_admin_token);
  v_admin_name text;
  v_student public.flashcard_students%rowtype;
  v_dependencies jsonb;
  v_audit_count bigint;
  v_blockers text;
begin
  if v_admin_id is null then
    raise exception 'Invalid or expired admin session' using errcode = '28000';
  end if;
  if p_student_id is null
    or p_typed_name is null
    or p_typed_name ~ '[[:cntrl:]]'
    or p_expected_updated_at is null
    or p_expected_dependency_counts is null
    or pg_catalog.jsonb_typeof(p_expected_dependency_counts) <> 'object'
    or p_expected_audit_count is null
    or p_expected_audit_count < 0
  then
    raise exception 'Complete deletion confirmation is required'
      using errcode = '22023';
  end if;

  lock table public.flashcard_students in share row exclusive mode;

  select student.* into v_student
  from public.flashcard_students student
  where student.id = p_student_id
  for update;
  if not found then
    raise exception 'Student not found' using errcode = 'P0002';
  end if;
  if v_student.deleted_at is null then
    raise exception 'Deactivate the student account before permanent deletion'
      using errcode = '55000';
  end if;
  if p_typed_name <> v_student.name then
    raise exception 'Typed student name does not match exactly'
      using errcode = '22023';
  end if;
  if v_student.updated_at is distinct from p_expected_updated_at then
    raise exception 'Student account changed in another session; preview deletion again'
      using errcode = '40001';
  end if;

  v_dependencies := public._schedule_student_dependency_snapshot(p_student_id);
  v_audit_count := public._schedule_student_retained_audit_count(
    v_student.id, v_student.name
  );
  if v_dependencies is distinct from p_expected_dependency_counts
    or v_audit_count is distinct from p_expected_audit_count
  then
    raise exception 'Student dependencies changed; preview deletion again'
      using errcode = '40001';
  end if;

  select pg_catalog.string_agg(dependency.key, ', ' order by dependency.key)
  into v_blockers
  from pg_catalog.jsonb_each(v_dependencies) dependency
  where (dependency.value ->> 'rowCount')::bigint > 0
    and dependency.value ->> 'onDelete'
      not in ('CASCADE', 'SET NULL', 'MANUAL CASCADE');
  if v_blockers is not null then
    raise exception 'Permanent deletion is blocked by protected data: %', v_blockers
      using errcode = '23503';
  end if;

  select admin.name into v_admin_name
  from public.schedule_admin_accounts admin
  where admin.id = v_admin_id;

  -- Copy every legacy password audit before cascade deletion. Only event IDs,
  -- actors, timestamps, and the student identity are retained.
  insert into public.schedule_student_account_audit (
    student_id, student_name, event_type, actor_label,
    source_system, source_event_id, metadata, occurred_at
  )
  select
    v_student.id,
    v_student.name,
    'password_changed',
    password_log.changed_by,
    'flashcard_password_log',
    password_log.id,
    pg_catalog.jsonb_build_object('source', 'legacy_flashcard_password_log'),
    password_log.changed_at
  from public.flashcard_student_password_logs password_log
  where password_log.student_id = v_student.id
  on conflict (source_system, source_event_id)
    where source_system is not null and source_event_id is not null
  do nothing;

  insert into public.schedule_student_account_audit (
    student_id, student_name, event_type, actor_label,
    source_system, source_event_id, metadata, occurred_at
  )
  select
    v_student.id,
    v_student.name,
    'password_changed',
    password_log.changed_by,
    'writing_password_log',
    password_log.id,
    pg_catalog.jsonb_build_object('source', 'legacy_writing_password_log'),
    password_log.changed_at
  from public.writing_password_logs password_log
  join public.writing_student_accounts writing_account
    on writing_account.id = password_log.student_id
  where pg_catalog.lower(writing_account.name) = pg_catalog.lower(v_student.name)
  on conflict (source_system, source_event_id)
    where source_system is not null and source_event_id is not null
  do nothing;

  insert into public.schedule_student_account_audit (
    student_id, student_name, event_type,
    actor_admin_id, actor_label, metadata
  ) values (
    v_student.id,
    v_student.name,
    'permanent_delete',
    v_admin_id,
    v_admin_name,
    pg_catalog.jsonb_build_object(
      'deletedAt', pg_catalog.clock_timestamp(),
      'dependencyCounts', v_dependencies
    )
  );

  -- Remove the legacy name-linked Writing identity first. Its children cascade
  -- from writing_student_accounts. The shared student master then cascades all
  -- UUID-linked learning data while preserving SET NULL audit/event records.
  delete from public.writing_student_accounts writing_account
  where pg_catalog.lower(writing_account.name) = pg_catalog.lower(v_student.name);

  delete from public.flashcard_students student
  where student.id = v_student.id;
  if not found then
    raise exception 'Student deletion did not complete' using errcode = 'P0002';
  end if;

  return pg_catalog.jsonb_build_object(
    'deleted', true,
    'id', v_student.id,
    'name', v_student.name,
    'retainedAuditCount', v_audit_count + 1
  );
end;
$$;

-- Replace the existing Schedule account-opening/reset/deactivation RPCs only
-- to add durable audit events. Their public signatures and result shapes stay
-- compatible with the existing Schedule UI.
create or replace function public.schedule_admin_upsert_student_account(
  p_admin_token uuid,
  p_student_name text,
  p_student_password text,
  p_access jsonb default '{}'::jsonb
)
returns table (
  id uuid,
  name text,
  access jsonb,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid := public._schedule_admin_id(p_admin_token);
  v_admin_name text;
  v_name text := pg_catalog.btrim(coalesce(p_student_name, ''));
  v_student_id uuid;
  v_deleted_at timestamptz;
  v_sort_order integer;
  v_password_log_id uuid;
  v_created boolean := false;
begin
  if v_admin_id is null then
    raise exception 'Invalid or expired admin session' using errcode = '28000';
  end if;
  if pg_catalog.char_length(v_name) not between 1 and 100
    or v_name ~ '[[:cntrl:]]'
    or p_student_password is null
    or pg_catalog.char_length(p_student_password) not between 8 and 200
    or p_student_password ~ '[[:cntrl:]]'
    or p_access is null
    or pg_catalog.jsonb_typeof(p_access) <> 'object'
    or pg_catalog.octet_length(p_access::text) > 32768
    or p_access ?| array[
      'password', 'password_hash', 'passwordHash', 'hash',
      'secret', 'token', 'session_token', 'sessionToken'
    ]
  then
    raise exception 'A valid name, password and access object are required'
      using errcode = '22023';
  end if;

  lock table public.flashcard_students in share row exclusive mode;

  select admin.name into v_admin_name
  from public.schedule_admin_accounts admin
  where admin.id = v_admin_id;

  select student.id, student.deleted_at
  into v_student_id, v_deleted_at
  from public.flashcard_students student
  where pg_catalog.lower(student.name) = pg_catalog.lower(v_name)
  limit 1
  for update;

  select coalesce(pg_catalog.max(student.sort_order), 0) + 1
  into v_sort_order
  from public.flashcard_students student
  where student.deleted_at is null;

  if v_student_id is null then
    insert into public.flashcard_students (
      name, password_hash, access, sort_order, deleted_at
    ) values (
      v_name,
      extensions.crypt(p_student_password, extensions.gen_salt('bf', 12)),
      p_access,
      v_sort_order,
      null
    ) returning flashcard_students.id into v_student_id;
    v_created := true;
  elsif v_deleted_at is null then
    raise exception 'A student account with this name already exists'
      using errcode = '23505';
  else
    update public.flashcard_students student
    set name = v_name,
        password_hash = extensions.crypt(
          p_student_password, extensions.gen_salt('bf', 12)
        ),
        sort_order = v_sort_order,
        deleted_at = null,
        updated_at = pg_catalog.clock_timestamp()
    where student.id = v_student_id;
  end if;

  delete from public.flashcard_student_sessions session_row
  where session_row.student_id = v_student_id;
  perform public.writing_sync_flashcard_student(v_student_id);

  insert into public.flashcard_student_password_logs (
    student_id, student_name, changed_by
  ) values (
    v_student_id, v_name, v_admin_name
  ) returning id into v_password_log_id;

  insert into public.schedule_student_account_audit (
    student_id, student_name, event_type,
    actor_admin_id, actor_label, metadata
  ) values (
    v_student_id,
    v_name,
    case when v_created then 'account_created' else 'account_reactivated' end,
    v_admin_id,
    v_admin_name,
    pg_catalog.jsonb_build_object('sortOrder', v_sort_order)
  );

  insert into public.schedule_student_account_audit (
    student_id, student_name, event_type,
    actor_admin_id, actor_label,
    source_system, source_event_id, metadata
  ) values (
    v_student_id,
    v_name,
    'password_changed',
    v_admin_id,
    v_admin_name,
    'flashcard_password_log',
    v_password_log_id,
    pg_catalog.jsonb_build_object(
      'reason', case when v_created then 'account_created' else 'account_reactivated' end
    )
  );

  return query
  select student.id, student.name, student.access,
    student.created_at, student.updated_at
  from public.flashcard_students student
  where student.id = v_student_id;
end;
$$;

create or replace function public.schedule_admin_reset_student_password(
  p_admin_token uuid,
  p_student_id uuid,
  p_new_password text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid := public._schedule_admin_id(p_admin_token);
  v_admin_name text;
  v_student_name text;
  v_password_log_id uuid;
begin
  if v_admin_id is null then
    raise exception 'Invalid or expired admin session' using errcode = '28000';
  end if;
  if p_new_password is null
    or pg_catalog.char_length(p_new_password) not between 8 and 200
    or p_new_password ~ '[[:cntrl:]]'
  then
    raise exception 'Password must contain 8 to 200 visible characters'
      using errcode = '22023';
  end if;

  select admin.name into v_admin_name
  from public.schedule_admin_accounts admin
  where admin.id = v_admin_id;

  update public.flashcard_students student
  set password_hash = extensions.crypt(
        p_new_password, extensions.gen_salt('bf', 12)
      ),
      updated_at = pg_catalog.clock_timestamp()
  where student.id = p_student_id and student.deleted_at is null
  returning student.name into v_student_name;
  if v_student_name is null then
    raise exception 'Active student not found' using errcode = 'P0002';
  end if;

  delete from public.flashcard_student_sessions session_row
  where session_row.student_id = p_student_id;
  perform public.writing_sync_flashcard_student(p_student_id);

  insert into public.flashcard_student_password_logs (
    student_id, student_name, changed_by
  ) values (
    p_student_id, v_student_name, v_admin_name
  ) returning id into v_password_log_id;

  insert into public.schedule_student_account_audit (
    student_id, student_name, event_type,
    actor_admin_id, actor_label,
    source_system, source_event_id, metadata
  ) values (
    p_student_id,
    v_student_name,
    'password_changed',
    v_admin_id,
    v_admin_name,
    'flashcard_password_log',
    v_password_log_id,
    pg_catalog.jsonb_build_object('reason', 'admin_reset')
  );
  return true;
end;
$$;

create or replace function public.schedule_admin_deactivate_student(
  p_admin_token uuid,
  p_student_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid := public._schedule_admin_id(p_admin_token);
  v_admin_name text;
  v_student_name text;
  v_now timestamptz := pg_catalog.clock_timestamp();
begin
  if v_admin_id is null then
    raise exception 'Invalid or expired admin session' using errcode = '28000';
  end if;

  select admin.name into v_admin_name
  from public.schedule_admin_accounts admin
  where admin.id = v_admin_id;

  update public.flashcard_students student
  set deleted_at = v_now,
      updated_at = v_now
  where student.id = p_student_id and student.deleted_at is null
  returning student.name into v_student_name;
  if v_student_name is null then
    raise exception 'Active student not found' using errcode = 'P0002';
  end if;

  delete from public.flashcard_student_sessions session_row
  where session_row.student_id = p_student_id;

  -- Preserve Writing history while preventing its legacy independent login.
  update public.writing_student_accounts writing_account
  set password_hash = extensions.crypt(
        gen_random_uuid()::text, extensions.gen_salt('bf', 12)
      ),
      session_token = gen_random_uuid(),
      updated_at = v_now
  where pg_catalog.lower(writing_account.name) = pg_catalog.lower(v_student_name);

  insert into public.schedule_student_account_audit (
    student_id, student_name, event_type,
    actor_admin_id, actor_label, metadata
  ) values (
    p_student_id,
    v_student_name,
    'account_deactivated',
    v_admin_id,
    v_admin_name,
    pg_catalog.jsonb_build_object('deletedAt', v_now)
  );
  return true;
end;
$$;

revoke all on function public._schedule_student_dependency_snapshot(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public._schedule_student_retained_audit_count(uuid, text)
  from public, anon, authenticated, service_role;
revoke all on function public.schedule_admin_list_student_accounts(uuid, text, integer, integer)
  from public, anon, authenticated, service_role;
revoke all on function public.schedule_admin_get_student_list_preferences(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.schedule_admin_set_student_sort_mode(uuid, text)
  from public, anon, authenticated, service_role;
revoke all on function public.schedule_admin_reorder_students(uuid, uuid[])
  from public, anon, authenticated, service_role;
revoke all on function public.schedule_admin_set_student_access(uuid, uuid, jsonb, timestamptz)
  from public, anon, authenticated, service_role;
revoke all on function public.schedule_admin_get_student_account_audit(uuid, uuid, integer, integer)
  from public, anon, authenticated, service_role;
revoke all on function public.schedule_admin_reactivate_student(uuid, uuid, timestamptz)
  from public, anon, authenticated, service_role;
revoke all on function public.schedule_admin_get_student_deletion_impact(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.schedule_admin_permanently_delete_student(
  uuid, uuid, text, timestamptz, jsonb, bigint
)
  from public, anon, authenticated, service_role;
revoke all on function public.schedule_admin_upsert_student_account(uuid, text, text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.schedule_admin_reset_student_password(uuid, uuid, text)
  from public, anon, authenticated, service_role;
revoke all on function public.schedule_admin_deactivate_student(uuid, uuid)
  from public, anon, authenticated, service_role;

grant execute on function public.schedule_admin_list_student_accounts(uuid, text, integer, integer)
  to authenticated;
grant execute on function public.schedule_admin_get_student_list_preferences(uuid)
  to authenticated;
grant execute on function public.schedule_admin_set_student_sort_mode(uuid, text)
  to authenticated;
grant execute on function public.schedule_admin_reorder_students(uuid, uuid[])
  to authenticated;
grant execute on function public.schedule_admin_set_student_access(uuid, uuid, jsonb, timestamptz)
  to authenticated;
grant execute on function public.schedule_admin_get_student_account_audit(uuid, uuid, integer, integer)
  to authenticated;
grant execute on function public.schedule_admin_reactivate_student(uuid, uuid, timestamptz)
  to authenticated;
grant execute on function public.schedule_admin_get_student_deletion_impact(uuid, uuid)
  to authenticated;
grant execute on function public.schedule_admin_permanently_delete_student(
  uuid, uuid, text, timestamptz, jsonb, bigint
)
  to authenticated;
grant execute on function public.schedule_admin_upsert_student_account(uuid, text, text, jsonb)
  to authenticated;
grant execute on function public.schedule_admin_reset_student_password(uuid, uuid, text)
  to authenticated;
grant execute on function public.schedule_admin_deactivate_student(uuid, uuid)
  to authenticated;

notify pgrst, 'reload schema';

commit;
