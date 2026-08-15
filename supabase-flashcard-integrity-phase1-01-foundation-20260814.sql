-- Flashcard integrity phase 1 / stage 01 of 14: short foundation DDL.
-- Safe to retry. This stage never scans or backfills the public state table.

begin;
set local lock_timeout = '3s';
set local statement_timeout = '30s';

create extension if not exists pgcrypto with schema extensions;

create schema if not exists flashcard_integrity;
revoke all on schema flashcard_integrity from public, anon, authenticated, service_role;

alter default privileges in schema flashcard_integrity
  revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema flashcard_integrity
  revoke execute on functions from public, anon, authenticated, service_role;

create or replace function flashcard_integrity.jsonb_checksum(p_value jsonb)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select pg_catalog.encode(
    extensions.digest(pg_catalog.convert_to(p_value::text, 'UTF8'), 'sha256'),
    'hex'
  );
$$;

create or replace function flashcard_integrity.safe_nonnegative_bigint(
  p_value jsonb,
  p_key text
)
returns bigint
language sql
immutable
set search_path = ''
as $$
  select case
    when coalesce(p_value ->> p_key, '') ~ '^[0-9]{1,18}$'
      then (p_value ->> p_key)::bigint
    else 0::bigint
  end;
$$;

create or replace function flashcard_integrity.current_request_id()
returns uuid
language plpgsql
stable
set search_path = ''
as $$
declare
  v_setting text := nullif(
    pg_catalog.current_setting('flashcard_integrity.request_id', true),
    ''
  );
begin
  if v_setting is null then
    return null;
  end if;
  return v_setting::uuid;
exception
  when invalid_text_representation then
    return null;
end;
$$;

create or replace function flashcard_integrity.current_actor_kind()
returns text
language sql
stable
set search_path = ''
as $$
  select coalesce(
    nullif(
      pg_catalog.current_setting('flashcard_integrity.actor_kind', true),
      ''
    ),
    'legacy_or_database_writer'
  );
$$;

create or replace function flashcard_integrity.current_session_fingerprint()
returns text
language sql
stable
set search_path = ''
as $$
  select nullif(
    pg_catalog.current_setting('flashcard_integrity.session_fingerprint', true),
    ''
  );
$$;

-- ---------------------------------------------------------------------------
-- State-key contract and current-row integrity metadata
-- ---------------------------------------------------------------------------

create table if not exists flashcard_integrity.state_key_rules (
  state_key text primary key,
  expected_json_type text not null
    check (expected_json_type in ('array', 'object', 'string', 'number', 'boolean')),
  max_payload_bytes integer not null check (max_payload_bytes between 1 and 33554432),
  write_strategy text not null
    check (write_strategy in ('attempt_union', 'versioned_replace')),
  v2_writable boolean not null default true,
  enabled boolean not null default true,
  description text not null default '',
  updated_at timestamptz not null default now()
);

alter table flashcard_integrity.state_key_rules
  add column if not exists v2_writable boolean not null default true;

insert into flashcard_integrity.state_key_rules (
  state_key,
  expected_json_type,
  max_payload_bytes,
  write_strategy,
  v2_writable,
  description
)
values
  ('edmundFlashcardCards', 'object', 8388608, 'versioned_replace', true, 'Student-created card definitions'),
  ('edmundFlashcardAttempts', 'array', 16777216, 'attempt_union', true, 'Append/advance-only attempt history'),
  ('edmundFlashcardProgress', 'object', 8388608, 'versioned_replace', true, 'In-progress deck sessions'),
  ('edmundFlashcardResetLogs', 'array', 2097152, 'versioned_replace', true, 'Reset audit entries'),
  ('edmundFlashcardFamiliarity', 'object', 8388608, 'versioned_replace', true, 'Per-deck familiarity state'),
  ('edmundFlashcardNotes', 'object', 8388608, 'versioned_replace', true, 'Student notes'),
  ('edmundFlashcardBookmarks', 'object', 8388608, 'versioned_replace', true, 'Student bookmarks'),
  ('edmundFlashcardStudentMessages', 'object', 4194304, 'versioned_replace', true, 'Teacher/student messages'),
  ('edmundFlashcardDashboardLayouts', 'object', 1048576, 'versioned_replace', true, 'Dashboard layout state'),
  ('edmundFlashcardUiPreferences', 'object', 262144, 'versioned_replace', true, 'Flashcard UI preferences'),
  ('edmundStudentDisplayPreferences', 'object', 262144, 'versioned_replace', false, 'Shared portal display preferences; validated but not writable through Flashcard v2'),
  ('speaking-access-v1', 'object', 262144, 'versioned_replace', false, 'Shared speaking access bridge; validated but not writable through Flashcard v2'),
  ('speaking-bookmarks-v1', 'array', 4194304, 'versioned_replace', false, 'Shared speaking bookmarks bridge; validated but not writable through Flashcard v2')
on conflict (state_key) do update
set expected_json_type = excluded.expected_json_type,
    max_payload_bytes = excluded.max_payload_bytes,
    write_strategy = excluded.write_strategy,
    v2_writable = excluded.v2_writable,
    description = excluded.description,
    updated_at = now();
create table if not exists flashcard_integrity.alerts (
  alert_id bigint generated always as identity primary key,
  student_id uuid,
  state_key text,
  severity text not null check (severity in ('info', 'warning', 'critical')),
  code text not null,
  request_id uuid,
  current_metrics jsonb not null default '{}'::jsonb,
  incoming_metrics jsonb not null default '{}'::jsonb,
  action_taken text not null,
  actor_kind text not null default 'unknown',
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolution text
);

create index if not exists flashcard_integrity_alerts_open_idx
  on flashcard_integrity.alerts (severity, created_at)
  where resolved_at is null;
create index if not exists flashcard_integrity_alerts_student_time_idx
  on flashcard_integrity.alerts (student_id, created_at desc);

create table if not exists flashcard_integrity.alert_outbox (
  outbox_id bigint generated always as identity primary key,
  alert_id bigint not null references flashcard_integrity.alerts(alert_id) on delete restrict,
  destination text not null default 'flashcard-integrity-monitor',
  attempts smallint not null default 0 check (attempts >= 0),
  next_attempt_at timestamptz not null default now(),
  delivered_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);

create index if not exists flashcard_integrity_outbox_pending_idx
  on flashcard_integrity.alert_outbox (next_attempt_at, outbox_id)
  where delivered_at is null;

create table if not exists flashcard_integrity.write_receipts (
  student_id uuid not null,
  request_id uuid not null,
  actor_kind text not null,
  state_key text not null,
  payload_checksum text not null,
  expected_version bigint not null,
  outcome text not null check (outcome in ('accepted', 'noop', 'conflict', 'rejected')),
  resulting_version bigint not null,
  resulting_checksum text,
  alert_id bigint references flashcard_integrity.alerts(alert_id) on delete restrict,
  canonical_receipt jsonb not null,
  created_at timestamptz not null default now(),
  primary key (student_id, request_id)
);

create index if not exists flashcard_integrity_receipts_time_idx
  on flashcard_integrity.write_receipts (created_at desc);

create table if not exists flashcard_integrity.state_revisions (
  revision_id bigint generated always as identity primary key,
  student_id uuid not null,
  state_key text not null,
  version_before bigint,
  version_after bigint,
  change_kind text not null,
  before_value jsonb,
  after_value jsonb,
  before_checksum text,
  after_checksum text,
  before_metrics jsonb not null default '{}'::jsonb,
  after_metrics jsonb not null default '{}'::jsonb,
  request_id uuid,
  actor_kind text not null default 'unknown',
  session_fingerprint text,
  created_at timestamptz not null default now()
);

create index if not exists flashcard_integrity_revisions_student_key_time_idx
  on flashcard_integrity.state_revisions (student_id, state_key, created_at desc);
create unique index if not exists flashcard_integrity_revisions_version_idx
  on flashcard_integrity.state_revisions (student_id, state_key, version_after)
  where version_after is not null;
create table if not exists flashcard_integrity.attempt_records (
  student_id uuid not null references public.flashcard_students(id) on delete restrict,
  attempt_id text not null,
  payload jsonb not null check (pg_catalog.jsonb_typeof(payload) = 'object'),
  payload_checksum text not null,
  revision bigint not null default 1 check (revision >= 1),
  deck_id text not null default '',
  started_at_ms bigint not null default 0,
  answered_count bigint not null default 0 check (answered_count >= 0),
  duration_ms bigint not null default 0 check (duration_ms >= 0),
  completed boolean not null default false,
  completed_at_ms bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (student_id, attempt_id)
);

create index if not exists flashcard_integrity_attempt_records_student_time_idx
  on flashcard_integrity.attempt_records (student_id, started_at_ms desc, attempt_id);

create table if not exists flashcard_integrity.attempt_mutations (
  mutation_id bigint generated always as identity primary key,
  student_id uuid not null,
  attempt_id text not null,
  revision_before bigint,
  revision_after bigint not null,
  before_payload jsonb,
  before_checksum text,
  after_checksum text not null,
  before_metrics jsonb not null default '{}'::jsonb,
  after_metrics jsonb not null default '{}'::jsonb,
  request_id uuid,
  actor_kind text not null default 'unknown',
  created_at timestamptz not null default now()
);

create index if not exists flashcard_integrity_attempt_mutations_idx
  on flashcard_integrity.attempt_mutations (student_id, attempt_id, created_at desc);
create unique index if not exists flashcard_integrity_attempt_mutation_revision_idx
  on flashcard_integrity.attempt_mutations (student_id, attempt_id, revision_after);
create table if not exists flashcard_integrity.snapshot_runs (
  run_id uuid primary key default gen_random_uuid(),
  snapshot_date date not null,
  snapshot_kind text not null default 'nightly',
  scheduled_for timestamptz not null,
  status text not null check (status in ('running', 'completed', 'failed')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  student_count integer,
  snapshot_count integer,
  state_row_count integer,
  attempt_count bigint,
  completed_attempt_count bigint,
  total_duration_ms bigint,
  total_bytes bigint,
  manifest_checksum text,
  offsite_provider text,
  offsite_object_key text,
  offsite_checksum text,
  offsite_verified_at timestamptz,
  error_message text,
  unique (snapshot_date, snapshot_kind)
);

-- Idempotent upgrades for a database on which an earlier draft created the table.
-- These columns are only metadata on the new private table; no public-table rewrite is
-- involved. A future retention worker may delete a local snapshot only after all four
-- offsite_* fields have been populated and independently verified.
alter table flashcard_integrity.snapshot_runs
  add column if not exists attempt_count bigint,
  add column if not exists completed_attempt_count bigint,
  add column if not exists total_duration_ms bigint,
  add column if not exists manifest_checksum text,
  add column if not exists offsite_provider text,
  add column if not exists offsite_object_key text,
  add column if not exists offsite_checksum text,
  add column if not exists offsite_verified_at timestamptz;

create table if not exists flashcard_integrity.student_snapshots (
  snapshot_id uuid primary key default gen_random_uuid(),
  run_id uuid not null references flashcard_integrity.snapshot_runs(run_id) on delete restrict,
  student_id uuid not null,
  captured_at timestamptz not null default now(),
  state_payload jsonb not null,
  attempts_payload jsonb not null,
  snapshot_checksum text not null,
  state_row_count integer not null,
  attempt_count integer not null,
  completed_attempt_count integer not null,
  total_duration_ms bigint not null,
  total_bytes bigint not null,
  unique (run_id, student_id)
);

create index if not exists flashcard_integrity_snapshots_student_time_idx
  on flashcard_integrity.student_snapshots (student_id, captured_at desc);

-- Nullable first: existing rows are populated in stage 02. Constant defaults and
-- NOT NULL are deliberately deferred so this ACCESS EXCLUSIVE lock stays brief.
alter table public.flashcard_student_state
  add column if not exists version bigint;
alter table public.flashcard_student_state
  add column if not exists value_checksum text;

-- Preserve historical updated_at during metadata-only repairs. This replaces the
-- already-used touch helper without altering its normal behavior.
create or replace function public.flashcard_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if pg_catalog.current_setting('flashcard_integrity.preserve_updated_at', true) = 'on' then
    new.updated_at := old.updated_at;
  else
    new.updated_at := now();
  end if;
  return new;
end;
$$;

-- Temporary online guard: new writes receive metadata while existing rows are being
-- backfilled. Stage 11 atomically swaps this for the full protection trigger.
create or replace function flashcard_integrity.maintain_state_metadata()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.version := greatest(coalesce(new.version, 1), 1);
  elsif new.value is distinct from old.value then
    new.version := greatest(coalesce(old.version, 0), 0) + 1;
  else
    new.version := greatest(coalesce(old.version, new.version, 1), 1);
  end if;
  new.value_checksum := flashcard_integrity.jsonb_checksum(new.value);
  return new;
end;
$$;

drop trigger if exists flashcard_state_metadata_guard on public.flashcard_student_state;
create trigger flashcard_state_metadata_guard
before insert or update on public.flashcard_student_state
for each row
execute function flashcard_integrity.maintain_state_metadata();

commit;
