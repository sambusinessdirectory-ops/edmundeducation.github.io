-- Flashcard integrity phase 1 / stage 12 of 14: post-cutover catch-up.
-- This closes the bounded time gap between stage 07's backfill and stage 11's trigger
-- cut-over. It is pure idempotent DML and holds no ALTER TABLE lock.

begin;
set local lock_timeout = '3s';
set local statement_timeout = '10min';

do $$
begin
  if exists (
    select 1
    from public.flashcard_student_state state
    left join flashcard_integrity.state_key_rules rules on rules.state_key = state.key
    where rules.state_key is null
       or not rules.enabled
       or pg_catalog.jsonb_typeof(state.value) <> rules.expected_json_type
       or pg_catalog.octet_length(state.value::text) > rules.max_payload_bytes
  ) then
    raise exception 'Post-cutover state-key registry/type/size invariant failed.';
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
    raise exception 'Post-cutover attempt state still contains duplicate logical IDs.';
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

-- Stage 07 may already hold attempts that a stale legacy blob removed before the
-- stage-11 trigger cut-over. Re-create any missing public blob row first, then rewrite
-- every current blob from the normalized canonical set. These INSERT/UPDATE statements
-- deliberately pass through the live protection and revision triggers installed in
-- stage 11; the trigger performs one final lossless merge and rebuild before commit.
select pg_catalog.set_config(
  'flashcard_integrity.actor_kind',
  'migration_post_cutover_catchup',
  true
);

insert into public.flashcard_student_state (student_id, key, value)
select
  record.student_id,
  'edmundFlashcardAttempts',
  pg_catalog.jsonb_agg(
    record.payload order by record.started_at_ms, record.attempt_id
  )
from flashcard_integrity.attempt_records record
where not exists (
  select 1
  from public.flashcard_student_state state
  where state.student_id = record.student_id
    and state.key = 'edmundFlashcardAttempts'
)
group by record.student_id;

with canonical as (
  select
    state.student_id,
    coalesce(
      pg_catalog.jsonb_agg(
        record.payload order by record.started_at_ms, record.attempt_id
      ) filter (where record.attempt_id is not null),
      '[]'::jsonb
    ) as canonical_value
  from public.flashcard_student_state state
  left join flashcard_integrity.attempt_records record
    on record.student_id = state.student_id
  where state.key = 'edmundFlashcardAttempts'
  group by state.student_id
)
update public.flashcard_student_state state
set value = canonical.canonical_value
from canonical
where state.student_id = canonical.student_id
  and state.key = 'edmundFlashcardAttempts'
  and state.value is distinct from canonical.canonical_value;

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
    raise exception 'Post-cutover Flashcard revision catch-up is incomplete.';
  end if;

  if exists (
    with all_attempt_students as (
      select state.student_id
      from public.flashcard_student_state state
      where state.key = 'edmundFlashcardAttempts'
      union
      select record.student_id
      from flashcard_integrity.attempt_records record
    ),
    canonical as (
      select
        student.student_id,
        coalesce(
          pg_catalog.jsonb_agg(
            record.payload order by record.started_at_ms, record.attempt_id
          ) filter (where record.attempt_id is not null),
          '[]'::jsonb
        ) as canonical_value
      from all_attempt_students student
      left join flashcard_integrity.attempt_records record
        on record.student_id = student.student_id
      group by student.student_id
    )
    select 1
    from canonical
    left join public.flashcard_student_state state
      on state.student_id = canonical.student_id
     and state.key = 'edmundFlashcardAttempts'
    where state.student_id is null
       or pg_catalog.jsonb_typeof(state.value) <> 'array'
       or state.value is distinct from canonical.canonical_value
  ) then
    raise exception 'Post-cutover attempts blob and normalized records are not exactly bidirectionally equal.';
  end if;
end;
$$;

commit;
