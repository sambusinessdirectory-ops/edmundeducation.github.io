-- Read-only post-deploy verification for the August 2026 sync incidents.
-- Results contain only aggregate counts and irreversible short hashes.

begin transaction read only;
set local statement_timeout = '30s';

-- 1. Canonical Flashcard rows must match their stored checksums.
select
  count(*) as state_rows,
  count(*) filter (
    where state.value_checksum is distinct from
      flashcard_integrity.jsonb_checksum(state.value)
  ) as checksum_mismatches,
  count(distinct state.student_id) as students
from public.flashcard_student_state state;

-- 2. The newest immutable revision must exactly match each hardened current row.
with latest_revision as (
  select distinct on (revision.student_id, revision.state_key)
    revision.student_id,
    revision.state_key,
    revision.version_after,
    revision.after_checksum,
    revision.after_value
  from flashcard_integrity.state_revisions revision
  order by revision.student_id, revision.state_key, revision.revision_id desc
)
select
  count(*) as hardened_rows,
  count(*) filter (where latest.student_id is null) as missing_latest_revision,
  count(*) filter (
    where latest.student_id is not null
      and (
        latest.version_after is distinct from state.version
        or latest.after_checksum is distinct from state.value_checksum
        or (
          state.key <> 'edmundFlashcardAttempts'
          and latest.after_value is distinct from state.value
        )
      )
  ) as latest_revision_mismatches
from public.flashcard_student_state state
left join latest_revision latest
  on latest.student_id = state.student_id
 and latest.state_key = state.key
where state.key in (
  'edmundFlashcardAttempts',
  'edmundFlashcardProgress',
  'edmundFlashcardFamiliarity'
);

-- 3. Revision chains must be continuous after the first captured revision.
with ordered as (
  select
    revision.*,
    lag(revision.version_after) over chain as prior_version_after,
    lag(revision.after_checksum) over chain as prior_after_checksum
  from flashcard_integrity.state_revisions revision
  window chain as (
    partition by revision.student_id, revision.state_key
    order by revision.revision_id
  )
)
select
  count(*) filter (
    where change_kind <> 'baseline'
      and prior_version_after is not null
      and version_before is distinct from prior_version_after
  ) as version_chain_breaks,
  count(*) filter (
    where change_kind <> 'baseline'
      and prior_after_checksum is not null
      and before_checksum is distinct from prior_after_checksum
  ) as checksum_chain_breaks
from ordered;

-- 3b. Normalized attempt records must reproduce each canonical attempt array.
with attempt_state as (
  select
    state.student_id,
    flashcard_integrity.state_metrics(state.key, state.value) as metrics
  from public.flashcard_student_state state
  where state.key = 'edmundFlashcardAttempts'
), normalized as (
  select
    attempt.student_id,
    count(*) as items,
    coalesce(sum(attempt.answered_count), 0) as answered,
    coalesce(sum(attempt.duration_ms), 0) as duration_ms,
    count(*) filter (where attempt.completed) as completed,
    count(*) filter (
      where attempt.payload_checksum is distinct from
        flashcard_integrity.jsonb_checksum(attempt.payload)
    ) as checksum_mismatches
  from flashcard_integrity.attempt_records attempt
  group by attempt.student_id
)
select
  count(*) as attempt_state_rows,
  count(*) filter (
    where normalized.checksum_mismatches <> 0
       or normalized.items is distinct from
         (attempt_state.metrics ->> 'items')::bigint
       or normalized.answered is distinct from
         (attempt_state.metrics ->> 'answered')::bigint
       or normalized.duration_ms is distinct from
         (attempt_state.metrics ->> 'durationMs')::bigint
       or normalized.completed is distinct from
         (attempt_state.metrics ->> 'completed')::bigint
  ) as normalized_attempt_mismatches
from attempt_state
left join normalized using (student_id);

-- 4. Summarize recent write outcomes without exposing account identifiers.
select
  date_trunc('hour', receipt.created_at) as utc_hour,
  receipt.state_key,
  receipt.outcome,
  coalesce(receipt.canonical_receipt ->> 'code', '') as receipt_code,
  count(*) as writes,
  count(distinct receipt.student_id) as affected_students
from flashcard_integrity.write_receipts receipt
where receipt.created_at >= now() - interval '48 hours'
group by 1, 2, 3, 4
order by 1 desc, 2, 3, 4;

-- 5. Open/critical integrity alerts. A short hash supports internal correlation
-- without printing a student UUID or name.
select
  left(md5(alert.student_id::text), 8) as student_ref,
  alert.state_key,
  alert.severity,
  alert.code,
  alert.action_taken,
  alert.occurrence_count,
  alert.created_at,
  alert.last_seen_at
from flashcard_integrity.alerts alert
where alert.resolved_at is null
   or alert.severity = 'critical'
order by alert.last_seen_at desc nulls last, alert.created_at desc;

-- 6. Nightly snapshot freshness and offsite-verification status are a separate
-- backup-risk check; they do not diagnose browser synchronization failures.
select
  snapshot.snapshot_date,
  snapshot.status,
  snapshot.scheduled_for,
  snapshot.completed_at,
  snapshot.student_count,
  snapshot.snapshot_count,
  snapshot.state_row_count,
  snapshot.attempt_count,
  snapshot.manifest_checksum is not null as manifest_present,
  snapshot.offsite_provider,
  snapshot.offsite_object_key is not null as offsite_object_recorded,
  snapshot.offsite_checksum is not null as offsite_checksum_recorded,
  snapshot.offsite_verified_at
from flashcard_integrity.snapshot_runs snapshot
order by snapshot.scheduled_for desc
limit 7;

-- 7. Cross-system attempt rows remain structurally self-consistent.
with attempts as (
  select 'sentence_structure' system_key, status, round_number, correct_count,
         total_count, duration_ms, result, completed_at, updated_at
  from public.sentence_structure_attempts
  union all
  select 'idiom', status, round_number, correct_count,
         total_count, duration_ms, result, completed_at, updated_at
  from public.idiom_system_attempts
  union all
  select 'proverb', status, round_number, correct_count,
         total_count, duration_ms, result, completed_at, updated_at
  from public.proverb_system_attempts
  union all
  select 'phrasal_verb', status, round_number, correct_count,
         total_count, duration_ms, result, completed_at, updated_at
  from public.phrasal_verb_system_attempts
)
select
  system_key,
  count(*) as rows,
  count(*) filter (
    where correct_count < 0
       or total_count < 0
       or correct_count > total_count
       or duration_ms < 0
       or case
         when jsonb_typeof(result -> 'correctIds') = 'array'
           then jsonb_array_length(result -> 'correctIds') <> correct_count
         else true
       end
       or jsonb_typeof(result -> 'questionState') is distinct from 'object'
       or coalesce(
         case
           when coalesce(result ->> 'round', '') ~ '^[0-9]+$'
             then (result ->> 'round')::integer
         end,
         round_number
       ) <> round_number
       or (status = 'completed' and completed_at is null)
       or (status <> 'completed' and completed_at is not null)
  ) as inconsistent_rows,
  max(updated_at) as latest_update
from attempts
group by system_key
order by system_key;

rollback;
