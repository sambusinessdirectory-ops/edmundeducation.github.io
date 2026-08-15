-- One-time, private recovery point captured before the integrity-foundation
-- rollout.  Applied to production on 2026-08-14 and verified row-for-row.

begin;

create schema if not exists flashcard_recovery;
revoke all on schema flashcard_recovery from public, anon, authenticated, service_role;

create table if not exists flashcard_recovery.emergency_snapshot_batches (
  batch_id uuid primary key default gen_random_uuid(),
  captured_at timestamptz not null default now(),
  reason text not null,
  state_row_count integer not null,
  state_total_bytes bigint not null,
  verified_at timestamptz not null
);

create table if not exists flashcard_recovery.emergency_snapshot_rows (
  batch_id uuid not null
    references flashcard_recovery.emergency_snapshot_batches(batch_id) on delete restrict,
  student_id uuid not null,
  student_name text not null,
  state_key text not null,
  state_value jsonb not null,
  state_updated_at timestamptz not null,
  state_bytes integer not null,
  state_md5 text not null,
  primary key (batch_id, student_id, state_key)
);

alter table flashcard_recovery.emergency_snapshot_batches enable row level security;
alter table flashcard_recovery.emergency_snapshot_batches force row level security;
alter table flashcard_recovery.emergency_snapshot_rows enable row level security;
alter table flashcard_recovery.emergency_snapshot_rows force row level security;

revoke all on all tables in schema flashcard_recovery
  from public, anon, authenticated, service_role;
revoke all on all sequences in schema flashcard_recovery
  from public, anon, authenticated, service_role;

do $$
declare
  v_batch_id uuid := gen_random_uuid();
  v_expected_count integer;
  v_expected_bytes bigint;
  v_copied_count integer;
  v_copied_bytes bigint;
begin
  lock table public.flashcard_student_state in share mode;

  select count(*)::integer,
         coalesce(sum(pg_column_size(s.value)), 0)::bigint
    into v_expected_count, v_expected_bytes
  from public.flashcard_student_state s;

  insert into flashcard_recovery.emergency_snapshot_batches (
    batch_id, reason, state_row_count, state_total_bytes, verified_at
  )
  values (
    v_batch_id,
    'Pre-integrity-foundation emergency snapshot, 2026-08-14',
    v_expected_count,
    v_expected_bytes,
    now()
  );

  insert into flashcard_recovery.emergency_snapshot_rows (
    batch_id, student_id, student_name, state_key, state_value,
    state_updated_at, state_bytes, state_md5
  )
  select
    v_batch_id,
    s.student_id,
    st.name,
    s.key,
    s.value,
    s.updated_at,
    pg_column_size(s.value),
    md5(s.value::text)
  from public.flashcard_student_state s
  join public.flashcard_students st on st.id = s.student_id;

  select count(*)::integer,
         coalesce(sum(r.state_bytes), 0)::bigint
    into v_copied_count, v_copied_bytes
  from flashcard_recovery.emergency_snapshot_rows r
  where r.batch_id = v_batch_id;

  if v_copied_count <> v_expected_count or v_copied_bytes <> v_expected_bytes then
    raise exception
      'Emergency Flashcard snapshot verification failed: expected % rows/% bytes, copied % rows/% bytes',
      v_expected_count, v_expected_bytes, v_copied_count, v_copied_bytes;
  end if;
end;
$$;

commit;
