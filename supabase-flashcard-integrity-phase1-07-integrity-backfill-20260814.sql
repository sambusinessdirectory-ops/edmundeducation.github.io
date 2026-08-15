-- Flashcard integrity phase 1 / stage 07 of 14: initial integrity DML backfill.
-- New integrity tables already exist and no ALTER TABLE lock is held in this unit.

begin;
set local lock_timeout = '3s';
set local statement_timeout = '10min';

do $$
begin
  if exists (
    select 1
    from public.flashcard_student_state state
    join flashcard_integrity.state_key_rules rules
      on rules.state_key = state.key and rules.enabled
    where pg_catalog.jsonb_typeof(state.value) <> rules.expected_json_type
       or pg_catalog.octet_length(state.value::text) > rules.max_payload_bytes
  ) then
    raise exception 'Known live state violates its registered type or size limit.';
  end if;

  if exists (
    select 1
    from public.flashcard_student_state state
    cross join lateral pg_catalog.jsonb_array_elements(
      case when pg_catalog.jsonb_typeof(state.value) = 'array'
        then state.value else '[]'::jsonb end
    ) entries(item)
    where state.key = 'edmundFlashcardAttempts'
      and pg_catalog.jsonb_typeof(entries.item) <> 'object'
  ) then
    raise exception 'Attempt history contains a non-object array element; quarantine and repair it before backfill.';
  end if;

  if exists (
    select 1
    from public.flashcard_student_state state
    cross join lateral pg_catalog.jsonb_array_elements(
      case when pg_catalog.jsonb_typeof(state.value) = 'array'
        then state.value else '[]'::jsonb end
    ) entries(item)
    where state.key = 'edmundFlashcardAttempts'
    group by state.student_id, flashcard_integrity.attempt_key(entries.item)
    having pg_catalog.count(*) > 1
  ) then
    raise exception 'Attempt history contains duplicate logical attempt IDs; quarantine and normalize it before backfill.';
  end if;
end;
$$;

-- Baseline revision: complete values are kept for ordinary keys; attempt arrays are
-- represented by checksums/metrics plus normalized attempt_records, not duplicated.
insert into flashcard_integrity.state_revisions (
  student_id,
  state_key,
  version_before,
  version_after,
  change_kind,
  before_value,
  after_value,
  before_checksum,
  after_checksum,
  before_metrics,
  after_metrics,
  actor_kind
)
select
  state.student_id,
  state.key,
  null,
  state.version,
  'baseline',
  null,
  case when state.key = 'edmundFlashcardAttempts' then null else state.value end,
  null,
  state.value_checksum,
  '{}'::jsonb,
  flashcard_integrity.state_metrics(state.key, state.value),
  'migration_baseline'
from public.flashcard_student_state state
join flashcard_integrity.state_key_rules rules
  on rules.state_key = state.key
 and rules.enabled
 and rules.v2_writable
on conflict (student_id, state_key, version_after) where version_after is not null
do nothing;

-- Backfill normalized attempt rows. The function itself is idempotent and only writes
-- a mutation when an attempt payload becomes richer/different.
do $$
declare
  v_row record;
begin
  for v_row in
    select student_id, value
    from public.flashcard_student_state
    where key = 'edmundFlashcardAttempts'
      and pg_catalog.jsonb_typeof(value) = 'array'
    order by student_id
  loop
    perform flashcard_integrity.sync_attempt_records(
      v_row.student_id,
      v_row.value,
      null,
      'migration_backfill'
    );
  end loop;
end;
$$;

do $$
begin
  if exists (
    select 1
    from public.flashcard_student_state state
    join flashcard_integrity.state_key_rules rules
      on rules.state_key = state.key and rules.enabled and rules.v2_writable
    where not exists (
      select 1
      from flashcard_integrity.state_revisions revision
      where revision.student_id = state.student_id
        and revision.state_key = state.key
        and revision.version_after = state.version
    )
  ) then
    raise exception 'Initial Flashcard revision backfill is incomplete.';
  end if;

  if exists (
    select 1
    from public.flashcard_student_state state
    cross join lateral pg_catalog.jsonb_array_elements(
      case when pg_catalog.jsonb_typeof(state.value) = 'array'
        then state.value else '[]'::jsonb end
    ) entries(item)
    where state.key = 'edmundFlashcardAttempts'
      and pg_catalog.jsonb_typeof(state.value) = 'array'
      and pg_catalog.jsonb_typeof(item) = 'object'
      and not exists (
        select 1
        from flashcard_integrity.attempt_records record
        where record.student_id = state.student_id
          and record.attempt_id = flashcard_integrity.attempt_key(item)
      )
  ) then
    raise exception 'Initial normalized-attempt backfill is incomplete.';
  end if;
end;
$$;

commit;
