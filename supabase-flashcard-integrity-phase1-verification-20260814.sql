-- Flashcard integrity phase 1: post-stage-13 acceptance checks.
--
-- Apply the numbered migration series, never the deprecated monolith. Section A is
-- read-only. Section B is an optional INTERNAL transactional smoke test and rolls back.
-- Public student/admin wrapper Auth-role tests belong in a quarantined end-to-end test
-- account after this file; see FLASHCARD-INTEGRITY-PHASE1-RUNBOOK-20260814.md.

-- ==========================================================================
-- A. READ-ONLY ACCEPTANCE MATRIX — every row must return passed = true
-- ==========================================================================

with
required_tables(table_name) as (
  values
    ('state_key_rules'),
    ('alerts'),
    ('alert_outbox'),
    ('write_receipts'),
    ('state_revisions'),
    ('attempt_records'),
    ('attempt_mutations'),
    ('snapshot_runs'),
    ('student_snapshots')
),
client_roles(role_name) as (
  values ('anon'), ('authenticated'), ('service_role')
),
canonical_attempts as (
  select
    state.student_id,
    flashcard_integrity.attempt_key(item) as attempt_id,
    item as payload
  from public.flashcard_student_state state
  cross join lateral pg_catalog.jsonb_array_elements(
    flashcard_integrity.merge_attempt_arrays('[]'::jsonb, state.value)
  ) entries(item)
  where state.key = 'edmundFlashcardAttempts'
    and pg_catalog.jsonb_typeof(state.value) = 'array'
),
snapshot_actual as (
  select
    snapshot.run_id,
    pg_catalog.count(*)::integer as snapshot_count,
    coalesce(pg_catalog.sum(snapshot.state_row_count), 0)::integer as state_row_count,
    coalesce(pg_catalog.sum(snapshot.attempt_count), 0)::bigint as attempt_count,
    coalesce(
      pg_catalog.sum(snapshot.completed_attempt_count), 0
    )::bigint as completed_attempt_count,
    coalesce(pg_catalog.sum(snapshot.total_duration_ms), 0)::bigint as total_duration_ms,
    coalesce(pg_catalog.sum(snapshot.total_bytes), 0)::bigint as total_bytes,
    pg_catalog.count(*) filter (
      where snapshot.snapshot_checksum is distinct from
        flashcard_integrity.jsonb_checksum(pg_catalog.jsonb_build_object(
          'state', snapshot.state_payload,
          'attempts', snapshot.attempts_payload
        ))
    )::integer as bad_checksums,
    flashcard_integrity.jsonb_checksum(coalesce(
      pg_catalog.jsonb_agg(
        pg_catalog.jsonb_build_object(
          'studentId', snapshot.student_id,
          'snapshotChecksum', snapshot.snapshot_checksum,
          'stateRows', snapshot.state_row_count,
          'attempts', snapshot.attempt_count,
          'completedAttempts', snapshot.completed_attempt_count,
          'durationMs', snapshot.total_duration_ms,
          'bytes', snapshot.total_bytes
        ) order by snapshot.student_id
      ),
      '[]'::jsonb
    )) as manifest_checksum
  from flashcard_integrity.student_snapshots snapshot
  group by snapshot.run_id
),
checks as (
  select
    10 as sort_order,
    'private schema and exactly nine integrity tables exist'::text as check_name,
    pg_catalog.to_regnamespace('flashcard_integrity') is not null
      and (select pg_catalog.count(*) from required_tables required
           where pg_catalog.to_regclass(
             'flashcard_integrity.' || required.table_name
           ) is not null) = 9 as passed,
    pg_catalog.concat(
      'tables=', (select pg_catalog.count(*) from required_tables required
        where pg_catalog.to_regclass('flashcard_integrity.' || required.table_name) is not null)
    ) as details

  union all
  select
    20,
    'state metadata columns are typed, defaulted, and NOT NULL',
    pg_catalog.count(*) = 2
      and pg_catalog.count(*) filter (
        where column_name = 'version'
          and data_type = 'bigint'
          and is_nullable = 'NO'
          and column_default is not null
      ) = 1
      and pg_catalog.count(*) filter (
        where column_name = 'value_checksum'
          and data_type = 'text'
          and is_nullable = 'NO'
      ) = 1,
    pg_catalog.concat('matching_columns=', pg_catalog.count(*))
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'flashcard_student_state'
    and column_name in ('version', 'value_checksum')

  union all
  select
    30,
    'metadata constraints exist and are validated',
    pg_catalog.count(*) = 2 and pg_catalog.bool_and(constraint_row.convalidated),
    pg_catalog.concat(
      'constraints=', pg_catalog.count(*),
      ', validated=', pg_catalog.count(*) filter (where constraint_row.convalidated)
    )
  from pg_catalog.pg_constraint constraint_row
  where constraint_row.conrelid = 'public.flashcard_student_state'::regclass
    and constraint_row.conname in (
      'flashcard_state_version_present_positive',
      'flashcard_state_checksum_present'
    )

  union all
  select
    40,
    'every current state row has a positive version and exact checksum',
    pg_catalog.count(*) filter (
      where state.version is null
         or state.version < 1
         or state.value_checksum is distinct from
           flashcard_integrity.jsonb_checksum(state.value)
    ) = 0,
    pg_catalog.concat(
      'rows=', pg_catalog.count(*),
      ', bad=', pg_catalog.count(*) filter (
        where state.version is null
           or state.version < 1
           or state.value_checksum is distinct from
             flashcard_integrity.jsonb_checksum(state.value)
      )
    )
  from public.flashcard_student_state state

  union all
  select
    50,
    'every live key is registered, enabled, type-valid, and size-bounded',
    pg_catalog.count(*) filter (
      where rules.state_key is null
         or not rules.enabled
         or pg_catalog.jsonb_typeof(state.value) <> rules.expected_json_type
         or pg_catalog.octet_length(state.value::text) > rules.max_payload_bytes
    ) = 0,
    pg_catalog.concat(
      'rows=', pg_catalog.count(*),
      ', invalid=', pg_catalog.count(*) filter (
        where rules.state_key is null
           or not rules.enabled
           or pg_catalog.jsonb_typeof(state.value) <> rules.expected_json_type
           or pg_catalog.octet_length(state.value::text) > rules.max_payload_bytes
      )
    )
  from public.flashcard_student_state state
  left join flashcard_integrity.state_key_rules rules on rules.state_key = state.key

  union all
  select
    60,
    'the ten Flashcard keys are v2-writable; shared/grandfathered keys are not',
    not exists (
      select required.state_key
      from (values
        ('edmundFlashcardCards'), ('edmundFlashcardAttempts'),
        ('edmundFlashcardProgress'), ('edmundFlashcardResetLogs'),
        ('edmundFlashcardFamiliarity'), ('edmundFlashcardNotes'),
        ('edmundFlashcardBookmarks'), ('edmundFlashcardStudentMessages'),
        ('edmundFlashcardDashboardLayouts'), ('edmundFlashcardUiPreferences')
      ) required(state_key)
      left join flashcard_integrity.state_key_rules rules
        on rules.state_key = required.state_key and rules.enabled and rules.v2_writable
      where rules.state_key is null
    )
    and not exists (
      select 1
      from flashcard_integrity.state_key_rules rules
      where rules.v2_writable
        and rules.state_key not in (
          'edmundFlashcardCards', 'edmundFlashcardAttempts',
          'edmundFlashcardProgress', 'edmundFlashcardResetLogs',
          'edmundFlashcardFamiliarity', 'edmundFlashcardNotes',
          'edmundFlashcardBookmarks', 'edmundFlashcardStudentMessages',
          'edmundFlashcardDashboardLayouts', 'edmundFlashcardUiPreferences'
        )
    ),
    pg_catalog.concat(
      'enabled_v2_keys=', (select pg_catalog.count(*)
        from flashcard_integrity.state_key_rules where enabled and v2_writable)
    )

  union all
  select
    70,
    'attempt arrays contain objects only and no duplicate logical IDs',
    not exists (
      select 1
      from public.flashcard_student_state state
      cross join lateral pg_catalog.jsonb_array_elements(
        case when pg_catalog.jsonb_typeof(state.value) = 'array'
          then state.value else '[]'::jsonb end
      ) entries(item)
      where state.key = 'edmundFlashcardAttempts'
        and pg_catalog.jsonb_typeof(entries.item) <> 'object'
    )
    and not exists (
      select 1
      from public.flashcard_student_state state
      cross join lateral pg_catalog.jsonb_array_elements(
        case when pg_catalog.jsonb_typeof(state.value) = 'array'
          then state.value else '[]'::jsonb end
      ) entries(item)
      where state.key = 'edmundFlashcardAttempts'
      group by state.student_id, flashcard_integrity.attempt_key(entries.item)
      having pg_catalog.count(*) > 1
    ),
    'non-object and duplicate counts must both be zero'

  union all
  select
    80,
    'normalized attempts exactly equal the canonical source merge',
    not exists (
      select 1
      from canonical_attempts source
      full join flashcard_integrity.attempt_records record
        on record.student_id = source.student_id
       and record.attempt_id = source.attempt_id
      where source.attempt_id is null
         or record.attempt_id is null
         or record.payload is distinct from source.payload
    ),
    pg_catalog.concat(
      'source=', (select pg_catalog.count(*) from canonical_attempts),
      ', normalized=', (select pg_catalog.count(*) from flashcard_integrity.attempt_records)
    )

  union all
  select
    90,
    'normalized attempt checksums and derived columns are valid',
    pg_catalog.count(*) filter (
      where record.payload_checksum is distinct from
              flashcard_integrity.jsonb_checksum(record.payload)
         or record.attempt_id <> flashcard_integrity.attempt_key(record.payload)
         or record.answered_count <>
              flashcard_integrity.attempt_answered_score(record.payload)
         or record.duration_ms <>
              flashcard_integrity.safe_nonnegative_bigint(record.payload, 'durationMs')
         or record.completed <>
              (flashcard_integrity.attempt_completed_score(record.payload) = 1)
    ) = 0,
    pg_catalog.concat(
      'rows=', pg_catalog.count(*),
      ', invalid=', pg_catalog.count(*) filter (
        where record.payload_checksum is distinct from
                flashcard_integrity.jsonb_checksum(record.payload)
           or record.attempt_id <> flashcard_integrity.attempt_key(record.payload)
           or record.answered_count <>
                flashcard_integrity.attempt_answered_score(record.payload)
           or record.duration_ms <>
                flashcard_integrity.safe_nonnegative_bigint(record.payload, 'durationMs')
           or record.completed <>
                (flashcard_integrity.attempt_completed_score(record.payload) = 1)
      )
    )
  from flashcard_integrity.attempt_records record

  union all
  select
    100,
    'current v2 state versions have revision coverage',
    not exists (
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
    ),
    'missing current-version revisions must be zero'

  union all
  select
    110,
    'revision values, checksums, metrics, and attempt redaction are coherent',
    pg_catalog.count(*) filter (
      where (revision.before_value is not null and (
          revision.before_checksum is distinct from
            flashcard_integrity.jsonb_checksum(revision.before_value)
          or revision.before_metrics is distinct from
            flashcard_integrity.state_metrics(revision.state_key, revision.before_value)
        ))
        or (revision.after_value is not null and (
          revision.after_checksum is distinct from
            flashcard_integrity.jsonb_checksum(revision.after_value)
          or revision.after_metrics is distinct from
            flashcard_integrity.state_metrics(revision.state_key, revision.after_value)
        ))
        or (revision.state_key = 'edmundFlashcardAttempts'
          and (revision.before_value is not null or revision.after_value is not null))
        or (revision.before_checksum is not null
          and revision.before_checksum !~ '^[0-9a-f]{64}$')
        or (revision.after_checksum is not null
          and revision.after_checksum !~ '^[0-9a-f]{64}$')
    ) = 0,
    pg_catalog.concat('rows=', pg_catalog.count(*))
  from flashcard_integrity.state_revisions revision

  union all
  select
    120,
    'attempt mutation before-images/checksums/metrics and revisions are coherent',
    pg_catalog.count(*) filter (
      where (mutation.before_payload is not null and (
          mutation.before_checksum is distinct from
            flashcard_integrity.jsonb_checksum(mutation.before_payload)
          or mutation.before_metrics is distinct from
            flashcard_integrity.attempt_metrics(mutation.before_payload)
        ))
        or mutation.after_checksum !~ '^[0-9a-f]{64}$'
        or mutation.revision_after < 1
        or (mutation.revision_before is not null
          and mutation.revision_after <> mutation.revision_before + 1)
    ) = 0,
    pg_catalog.concat('rows=', pg_catalog.count(*))
  from flashcard_integrity.attempt_mutations mutation

  union all
  select
    130,
    'public-state, hard-delete, and four immutable evidence triggers are enabled',
    (select pg_catalog.count(*)
     from pg_catalog.pg_trigger trigger_row
     where trigger_row.tgrelid in (
       'public.flashcard_student_state'::regclass,
       'public.flashcard_students'::regclass
     )
       and trigger_row.tgname in (
         'flashcard_state_zz_integrity_protect',
         'flashcard_state_revision_audit',
         'flashcard_student_hard_delete_protected'
       )
       and trigger_row.tgenabled <> 'D'
       and not trigger_row.tgisinternal) = 3
    and (select pg_catalog.count(*)
     from pg_catalog.pg_trigger trigger_row
     where trigger_row.tgname in (
       'flashcard_integrity_state_revisions_immutable',
       'flashcard_integrity_receipts_immutable',
       'flashcard_integrity_attempt_mutations_immutable',
       'flashcard_integrity_snapshots_immutable'
     )
       and trigger_row.tgenabled <> 'D'
       and not trigger_row.tgisinternal) = 4,
    'expected enabled trigger counts: public=3, immutable=4'

  union all
  select
    135,
    'soft rejections durably alert and legacy RPCs expose skipped rows as false',
    pg_catalog.strpos(
      pg_catalog.lower(
        pg_catalog.pg_get_functiondef(
          'flashcard_integrity.protect_state_write()'::regprocedure
        )
      ),
      'flashcard_integrity.record_alert'
    ) > 0
    and pg_catalog.strpos(
      pg_catalog.lower(
        pg_catalog.pg_get_functiondef(
          'flashcard_integrity.protect_state_write()'::regprocedure
        )
      ),
      'return null'
    ) > 0
    and pg_catalog.strpos(
      pg_catalog.lower(
        pg_catalog.pg_get_functiondef(
          'flashcard_integrity.protect_student_hard_delete()'::regprocedure
        )
      ),
      'flashcard_integrity.record_alert'
    ) > 0
    and pg_catalog.strpos(
      pg_catalog.lower(
        pg_catalog.pg_get_functiondef(
          'public.flashcard_student_upsert_state(uuid,text,jsonb)'::regprocedure
        )
      ),
      'row_count'
    ) > 0
    and pg_catalog.strpos(
      pg_catalog.lower(
        pg_catalog.pg_get_functiondef(
          'public.flashcard_admin_upsert_student_state(text,text,text,text,jsonb)'::regprocedure
        )
      ),
      'row_count'
    ) > 0
    and pg_catalog.strpos(
      pg_catalog.lower(
        pg_catalog.pg_get_functiondef(
          'public.flashcard_student_delete_state(uuid,text)'::regprocedure
        )
      ),
      'row_count'
    ) > 0
    and pg_catalog.strpos(
      pg_catalog.lower(
        pg_catalog.pg_get_functiondef(
          'public.flashcard_admin_delete_student_with_state(text,text,text)'::regprocedure
        )
      ),
      'delete from public.flashcard_student_state'
    ) = 0,
    'trigger alert+skip, three ROW_COUNT-aware state RPCs, hard-delete RPC has no child deletion'

  union all
  select
    140,
    'all nine private tables have RLS and no client-role privileges',
    (select pg_catalog.count(*)
     from required_tables required
     join pg_catalog.pg_class class
       on class.relname = required.table_name
     join pg_catalog.pg_namespace namespace
       on namespace.oid = class.relnamespace
      and namespace.nspname = 'flashcard_integrity'
     where class.relkind in ('r', 'p') and class.relrowsecurity) = 9
    and not exists (
      select 1
      from required_tables required
      cross join client_roles role_row
      where pg_catalog.has_table_privilege(
        role_row.role_name,
        'flashcard_integrity.' || required.table_name,
        'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER'
      )
    ),
    'RLS=9; effective anon/authenticated/service_role table privileges=0'

  union all
  select
    150,
    'private schema has no client USAGE/CREATE grants',
    not exists (
      select 1 from client_roles role_row
      where pg_catalog.has_schema_privilege(
        role_row.role_name, 'flashcard_integrity', 'USAGE'
      ) or pg_catalog.has_schema_privilege(
        role_row.role_name, 'flashcard_integrity', 'CREATE'
      )
    ),
    'effective anon/authenticated/service_role schema privileges=0'

  union all
  select
    160,
    'private functions have no client EXECUTE grants',
    not exists (
      select 1
      from pg_catalog.pg_proc procedure_row
      join pg_catalog.pg_namespace namespace
        on namespace.oid = procedure_row.pronamespace
      cross join client_roles role_row
      where namespace.nspname = 'flashcard_integrity'
        and pg_catalog.has_function_privilege(
          role_row.role_name, procedure_row.oid, 'EXECUTE'
        )
    ),
    pg_catalog.concat(
      'private_functions=', (select pg_catalog.count(*)
        from pg_catalog.pg_proc procedure_row
        join pg_catalog.pg_namespace namespace
          on namespace.oid = procedure_row.pronamespace
        where namespace.nspname = 'flashcard_integrity')
    )

  union all
  select
    170,
    'private sequences have no client privileges',
    not exists (
      select 1
      from pg_catalog.pg_class class
      join pg_catalog.pg_namespace namespace on namespace.oid = class.relnamespace
      cross join client_roles role_row
      where namespace.nspname = 'flashcard_integrity'
        and class.relkind = 'S'
        and pg_catalog.has_sequence_privilege(
          role_row.role_name, class.oid, 'USAGE,SELECT,UPDATE'
        )
    ),
    pg_catalog.concat(
      'private_sequences=', (select pg_catalog.count(*)
        from pg_catalog.pg_class class
        join pg_catalog.pg_namespace namespace on namespace.oid = class.relnamespace
        where namespace.nspname = 'flashcard_integrity' and class.relkind = 'S')
    )

  union all
  select
    180,
    'v2 wrappers are authenticated-only after stage 13',
    pg_catalog.has_function_privilege(
      'authenticated', 'public.flashcard_student_get_state_v2(uuid)', 'EXECUTE'
    )
    and pg_catalog.has_function_privilege(
      'authenticated',
      'public.flashcard_student_upsert_state_v2(uuid,text,jsonb,uuid,bigint)',
      'EXECUTE'
    )
    and pg_catalog.has_function_privilege(
      'authenticated',
      'public.flashcard_admin_get_student_state_v2(text,text,text)',
      'EXECUTE'
    )
    and pg_catalog.has_function_privilege(
      'authenticated',
      'public.flashcard_admin_upsert_student_state_v2(text,text,text,text,jsonb,uuid,bigint)',
      'EXECUTE'
    )
    and not pg_catalog.has_function_privilege(
      'anon', 'public.flashcard_student_get_state_v2(uuid)', 'EXECUTE'
    )
    and not pg_catalog.has_function_privilege(
      'anon',
      'public.flashcard_student_upsert_state_v2(uuid,text,jsonb,uuid,bigint)',
      'EXECUTE'
    ),
    'authenticated=true for four v2 wrappers; anon=false for student v2 wrappers'

  union all
  select
    190,
    'hard-delete RPC is unavailable and parent hard-delete trigger is active',
    not pg_catalog.has_function_privilege(
      'anon',
      'public.flashcard_admin_delete_student_with_state(text,text,text)',
      'EXECUTE'
    )
    and not pg_catalog.has_function_privilege(
      'authenticated',
      'public.flashcard_admin_delete_student_with_state(text,text,text)',
      'EXECUTE'
    )
    and exists (
      select 1 from pg_catalog.pg_trigger trigger_row
      where trigger_row.tgrelid = 'public.flashcard_students'::regclass
        and trigger_row.tgname = 'flashcard_student_hard_delete_protected'
        and trigger_row.tgenabled <> 'D'
    ),
    'destructive RPC execute=false; hard-delete trigger enabled'

  union all
  select
    200,
    'automatic same-project snapshot cron remains disabled',
    (flashcard_integrity.snapshot_scheduler_status() ->> 'jobCount')::bigint = 0,
    flashcard_integrity.snapshot_scheduler_status()::text

  union all
  select
    210,
    'completed snapshot manifests, metrics, payload scope, and checksums match',
    not exists (
      select 1
      from flashcard_integrity.snapshot_runs run
      left join snapshot_actual actual on actual.run_id = run.run_id
      where run.status = 'completed'
        and (
          run.student_count is distinct from coalesce(actual.snapshot_count, 0)
          or run.snapshot_count is distinct from coalesce(actual.snapshot_count, 0)
          or run.state_row_count is distinct from coalesce(actual.state_row_count, 0)
          or run.attempt_count is distinct from coalesce(actual.attempt_count, 0)
          or run.completed_attempt_count is distinct from
            coalesce(actual.completed_attempt_count, 0)
          or run.total_duration_ms is distinct from
            coalesce(actual.total_duration_ms, 0)
          or run.total_bytes is distinct from coalesce(actual.total_bytes, 0)
          or run.manifest_checksum is distinct from coalesce(
            actual.manifest_checksum,
            flashcard_integrity.jsonb_checksum('[]'::jsonb)
          )
          or coalesce(actual.bad_checksums, 0) <> 0
        )
    )
    and not exists (
      select 1
      from flashcard_integrity.student_snapshots snapshot
      where pg_catalog.jsonb_typeof(snapshot.attempts_payload) <> 'array'
         or pg_catalog.jsonb_typeof(snapshot.state_payload) <> 'object'
    )
    and not exists (
      select 1
      from flashcard_integrity.student_snapshots snapshot
      cross join lateral pg_catalog.jsonb_object_keys(snapshot.state_payload) payload_key(key)
      left join flashcard_integrity.state_key_rules rules
        on rules.state_key = payload_key.key and rules.enabled and rules.v2_writable
      where rules.state_key is null
         or payload_key.key = 'edmundFlashcardAttempts'
    )
    and not exists (
      select 1
      from flashcard_integrity.student_snapshots snapshot
      cross join lateral pg_catalog.jsonb_array_elements(
        case when pg_catalog.jsonb_typeof(snapshot.attempts_payload) = 'array'
          then snapshot.attempts_payload else '[]'::jsonb end
      ) entries(item)
      where pg_catalog.jsonb_typeof(entries.item) <> 'object'
    ),
    pg_catalog.concat(
      'completed_runs=', (select pg_catalog.count(*)
        from flashcard_integrity.snapshot_runs where status = 'completed')
    )

  union all
  select
    220,
    'offsite verification metadata is all-or-nothing and SHA-256 shaped',
    pg_catalog.count(*) filter (
      where run.offsite_verified_at is not null
        and (
          nullif(pg_catalog.btrim(run.offsite_provider), '') is null
          or nullif(pg_catalog.btrim(run.offsite_object_key), '') is null
          or run.offsite_checksum !~ '^[0-9a-f]{64}$'
        )
    ) = 0,
    pg_catalog.concat(
      'verified_runs=', pg_catalog.count(*) filter (where run.offsite_verified_at is not null)
    )
  from flashcard_integrity.snapshot_runs run

  union all
  select
    230,
    'receipts are compact, column-consistent, and contain no canonical state copy',
    pg_catalog.count(*) filter (
      where receipt.canonical_receipt ? 'canonicalValue'
         or pg_catalog.octet_length(receipt.canonical_receipt::text) > 65536
         or receipt.canonical_receipt -> 'requestId' is distinct from
              pg_catalog.to_jsonb(receipt.request_id)
         or receipt.canonical_receipt -> 'status' is distinct from
              pg_catalog.to_jsonb(receipt.outcome)
         or receipt.canonical_receipt -> 'resultingVersion' is distinct from
              pg_catalog.to_jsonb(receipt.resulting_version)
         or receipt.canonical_receipt -> 'resultingChecksum' is distinct from
              pg_catalog.to_jsonb(receipt.resulting_checksum)
    ) = 0,
    pg_catalog.concat('receipts=', pg_catalog.count(*))
  from flashcard_integrity.write_receipts receipt
)
select sort_order, check_name, passed, details
from checks
order by sort_order;

-- Operational queues: rows require review but are not automatically migration failures.
select
  alert.severity,
  alert.code,
  pg_catalog.count(*) as open_alerts,
  pg_catalog.min(alert.created_at) as oldest,
  pg_catalog.max(alert.created_at) as newest
from flashcard_integrity.alerts alert
where alert.resolved_at is null
group by alert.severity, alert.code
order by
  case alert.severity when 'critical' then 1 when 'warning' then 2 else 3 end,
  oldest;

select
  pg_catalog.count(*) filter (where outbox.delivered_at is null) as pending,
  pg_catalog.count(*) filter (
    where outbox.delivered_at is null
      and outbox.next_attempt_at < now() - interval '15 minutes'
  ) as overdue,
  pg_catalog.min(outbox.next_attempt_at) filter (
    where outbox.delivered_at is null
  ) as oldest_pending
from flashcard_integrity.alert_outbox outbox;

select
  run.snapshot_date,
  run.status,
  run.student_count,
  run.snapshot_count,
  run.state_row_count,
  run.attempt_count,
  run.completed_attempt_count,
  run.total_duration_ms,
  run.total_bytes,
  run.manifest_checksum,
  run.offsite_provider,
  run.offsite_object_key,
  run.offsite_checksum,
  run.offsite_verified_at,
  run.error_message
from flashcard_integrity.snapshot_runs run
order by run.snapshot_date desc
limit 14;

-- Auth cut-over visibility. Before optional stage 14, legacy anon/PUBLIC grants may be
-- intentionally present. After stage 14, anon_execute should be false and authenticated
-- execute true. This is informational because stage 14 is deliberately optional.
select
  pg_catalog.has_function_privilege(
    'anon', 'public.flashcard_student_get_state(uuid)', 'EXECUTE'
  ) as legacy_anon_execute,
  pg_catalog.has_function_privilege(
    'authenticated', 'public.flashcard_student_get_state(uuid)', 'EXECUTE'
  ) as legacy_authenticated_execute;

-- ==========================================================================
-- B. OPTIONAL INTERNAL TRANSACTIONAL SMOKE TEST — ALL ROW CHANGES ROLL BACK
-- Identity sequence values are non-transactional; harmless numeric gaps are expected.
-- ==========================================================================

begin;

do $smoke$
declare
  v_student_id uuid := gen_random_uuid();
  v_name text := '__flashcard_integrity_smoke__' || v_student_id::text;
  v_request_1 uuid := gen_random_uuid();
  v_request_2 uuid := gen_random_uuid();
  v_request_3 uuid := gen_random_uuid();
  v_request_4 uuid := gen_random_uuid();
  v_request_5 uuid := gen_random_uuid();
  v_legacy_token uuid := gen_random_uuid();
  v_receipt_1 jsonb;
  v_replay jsonb;
  v_receipt_2 jsonb;
  v_rejected jsonb;
  v_state public.flashcard_student_state%rowtype;
  v_merge jsonb;
  v_count bigint;
  v_legacy_result boolean;
begin
  insert into public.flashcard_students (id, name, password_hash, access)
  values (v_student_id, v_name, 'smoke-test-never-used-for-login', '{}'::jsonb);
  insert into public.flashcard_student_sessions (token, student_id, expires_at)
  values (v_legacy_token, v_student_id, now() + interval '1 hour');

  v_receipt_1 := flashcard_integrity.write_state_v2(
    v_student_id, 'acceptance_test', 'smoke-session',
    'edmundFlashcardAttempts',
    '[
      {"id":"attempt-a","deckId":"deck-1","startedAt":100,"answeredCount":2,"durationMs":2000},
      {"id":"attempt-b","deckId":"deck-1","startedAt":200,"answeredCount":1,"durationMs":1000}
    ]'::jsonb,
    v_request_1, 0
  );
  if v_receipt_1 ->> 'status' <> 'accepted' then
    raise exception 'Initial v2 write failed: %', v_receipt_1;
  end if;

  v_replay := flashcard_integrity.write_state_v2(
    v_student_id, 'acceptance_test', 'smoke-session',
    'edmundFlashcardAttempts',
    '[
      {"id":"attempt-a","deckId":"deck-1","startedAt":100,"answeredCount":2,"durationMs":2000},
      {"id":"attempt-b","deckId":"deck-1","startedAt":200,"answeredCount":1,"durationMs":1000}
    ]'::jsonb,
    v_request_1, 0
  );
  if v_replay is distinct from v_receipt_1 then
    raise exception 'Idempotent request did not return the stored receipt.';
  end if;

  v_receipt_2 := flashcard_integrity.write_state_v2(
    v_student_id, 'acceptance_test', 'smoke-session',
    'edmundFlashcardAttempts',
    '[{"id":"attempt-b","deckId":"deck-1","startedAt":200,"answeredCount":3,"durationMs":3000,"completed":true,"completedAt":300}]'::jsonb,
    v_request_2, 1
  );
  if v_receipt_2 ->> 'status' <> 'accepted'
     or v_receipt_2 ->> 'code' <> 'lossless_server_merge'
     or v_receipt_2 ->> 'reloadRequired' <> 'true'
     or v_receipt_2 ? 'canonicalValue' then
    raise exception 'Stale subset merge receipt is wrong or unbounded: %', v_receipt_2;
  end if;

  select * into v_state
  from public.flashcard_student_state
  where student_id = v_student_id and key = 'edmundFlashcardAttempts';
  select pg_catalog.count(*) into v_count
  from pg_catalog.jsonb_array_elements(v_state.value) entries(item)
  where item ->> 'id' in ('attempt-a', 'attempt-b');
  if v_state.version <> 2 or v_count <> 2 then
    raise exception 'Lossless merge lost an attempt or version.';
  end if;

  v_merge := flashcard_integrity.merge_attempt_objects(
    '{"id":"tie","answeredCount":2,"updatedAt":5,"durationMs":10,"cardOutcomes":[{"source":"existing"}],"cardAttempts":[{"source":"existing"}]}'::jsonb,
    '{"id":"tie","answeredCount":2,"updatedAt":5,"durationMs":10,"cardOutcomes":[{"source":"stale"}],"cardAttempts":[{"source":"stale"}]}'::jsonb
  );
  if v_merge #>> '{cardOutcomes,0,source}' <> 'existing'
     or v_merge #>> '{cardAttempts,0,source}' <> 'existing' then
    raise exception 'Equal-quality nested attempt arrays replaced stronger existing data.';
  end if;

  v_rejected := flashcard_integrity.write_state_v2(
    v_student_id, 'acceptance_test', 'smoke-session',
    'edmundFlashcardAttempts', '[{"id":"ok"},"bad"]'::jsonb,
    v_request_3, 2
  );
  if v_rejected ->> 'status' <> 'rejected'
     or v_rejected ->> 'code' <> 'attempt_element_not_object'
     or not exists (
       select 1 from flashcard_integrity.write_receipts
       where student_id = v_student_id and request_id = v_request_3
     )
     or not exists (
       select 1 from flashcard_integrity.alerts
       where student_id = v_student_id
         and request_id = v_request_3
         and code = 'attempt_element_not_object'
     ) then
    raise exception 'Malformed attempt rejection was not durable: %', v_rejected;
  end if;

  v_rejected := flashcard_integrity.write_state_v2(
    v_student_id, 'acceptance_test', 'smoke-session',
    'future-unregistered-key', '{}'::jsonb, v_request_4, 0
  );
  if v_rejected ->> 'status' <> 'rejected'
     or v_rejected ->> 'code' <> 'unknown_state_key' then
    raise exception 'Unknown v2 key was not rejected durably: %', v_rejected;
  end if;

  v_rejected := flashcard_integrity.write_state_v2(
    v_student_id, 'acceptance_test', 'smoke-session',
    'edmundFlashcardAttempts', '[]'::jsonb, v_request_1, 2
  );
  if v_rejected ->> 'status' <> 'rejected'
     or v_rejected ->> 'code' <> 'request_id_reuse'
     or not exists (
       select 1 from flashcard_integrity.alerts
       where student_id = v_student_id
         and code = 'request_id_reused_with_different_payload'
     ) then
    raise exception 'Request-ID reuse was not rejected/alerted: %', v_rejected;
  end if;

  -- Invalid direct and legacy writes are skipped, not raised. Their alerts and outbox
  -- entries remain in this transaction, and legacy RPCs report `false` instead of a
  -- false success.
  insert into public.flashcard_student_state (student_id, key, value)
  values (v_student_id, 'another-unregistered-key', '{}'::jsonb);
  get diagnostics v_count = row_count;
  if v_count <> 0
     or exists (
       select 1 from public.flashcard_student_state
       where student_id = v_student_id and key = 'another-unregistered-key'
     )
     or not exists (
       select 1
       from flashcard_integrity.alerts alert
       join flashcard_integrity.alert_outbox outbox on outbox.alert_id = alert.alert_id
       where alert.student_id = v_student_id
         and alert.state_key = 'another-unregistered-key'
         and alert.code = 'unknown_state_key'
         and alert.action_taken = 'rejected_and_preserved'
     ) then
    raise exception 'Direct unknown-key insert was not skipped and durably alerted.';
  end if;

  -- Execute the volatile RPC in its own PL/pgSQL statement. Combining the call and
  -- the evidence subqueries in one SQL expression can make the subqueries use the
  -- statement snapshot from before the function's trigger side effects.
  v_legacy_result := public.flashcard_student_upsert_state(
    v_legacy_token, 'legacy-unregistered-key', '{}'::jsonb
  );
  if v_legacy_result
     or exists (
       select 1 from public.flashcard_student_state
       where student_id = v_student_id and key = 'legacy-unregistered-key'
     )
     or not exists (
       select 1
       from flashcard_integrity.alerts alert
       join flashcard_integrity.alert_outbox outbox on outbox.alert_id = alert.alert_id
       where alert.student_id = v_student_id
         and alert.state_key = 'legacy-unregistered-key'
         and alert.code = 'unknown_state_key'
     ) then
    raise exception 'Legacy unknown-key RPC did not return false with durable evidence.';
  end if;

  update public.flashcard_student_state
  set value = '["not-an-object"]'::jsonb
  where student_id = v_student_id and key = 'edmundFlashcardAttempts';
  get diagnostics v_count = row_count;
  if v_count <> 0
     or exists (
       select 1
       from public.flashcard_student_state state
       cross join lateral pg_catalog.jsonb_array_elements(state.value) entries(item)
       where state.student_id = v_student_id
         and state.key = 'edmundFlashcardAttempts'
         and pg_catalog.jsonb_typeof(item) <> 'object'
     )
     or not exists (
       select 1
       from flashcard_integrity.alerts alert
       join flashcard_integrity.alert_outbox outbox on outbox.alert_id = alert.alert_id
       where alert.student_id = v_student_id
         and alert.state_key = 'edmundFlashcardAttempts'
         and alert.code = 'attempt_element_not_object'
         and alert.action_taken = 'rejected_and_preserved'
     ) then
    raise exception 'Malformed direct attempt update was not skipped and durably alerted.';
  end if;

  insert into public.flashcard_student_state (student_id, key, value)
  values (
    v_student_id,
    'edmundFlashcardProgress',
    '{"a":1,"b":2,"c":3,"d":4,"e":5,"f":6}'::jsonb
  );
  update public.flashcard_student_state
  set value = '{"a":1}'::jsonb
  where student_id = v_student_id and key = 'edmundFlashcardProgress';
  if not exists (
    select 1 from flashcard_integrity.state_revisions
    where student_id = v_student_id
      and state_key = 'edmundFlashcardProgress'
      and before_value = '{"a":1,"b":2,"c":3,"d":4,"e":5,"f":6}'::jsonb
      and after_value = '{"a":1}'::jsonb
  ) or not exists (
    select 1 from flashcard_integrity.alerts
    where student_id = v_student_id and code = 'state_regression_archived'
  ) then
    raise exception 'Regression revision/alert evidence is incomplete.';
  end if;

  if public.flashcard_student_delete_state(
       v_legacy_token, 'edmundFlashcardProgress'
     ) then
    raise exception 'Protected legacy state delete falsely reported success.';
  end if;
  if not exists (
       select 1 from public.flashcard_student_state
       where student_id = v_student_id and key = 'edmundFlashcardProgress'
     )
     or not exists (
       select 1
       from flashcard_integrity.alerts alert
       join flashcard_integrity.alert_outbox outbox on outbox.alert_id = alert.alert_id
       where alert.student_id = v_student_id
         and alert.state_key = 'edmundFlashcardProgress'
         and alert.code = 'state_physical_delete_blocked'
         and alert.action_taken = 'rejected_and_preserved'
     ) then
    raise exception 'Protected state delete did not preserve state and durable evidence.';
  end if;

  delete from public.flashcard_students where id = v_student_id;
  get diagnostics v_count = row_count;
  if v_count <> 0
     or not exists (
       select 1 from public.flashcard_students where id = v_student_id
     )
     or not exists (
       select 1
       from flashcard_integrity.alerts alert
       join flashcard_integrity.alert_outbox outbox on outbox.alert_id = alert.alert_id
       where alert.student_id = v_student_id
         and alert.code = 'student_hard_delete_blocked'
         and alert.action_taken = 'rejected_and_preserved'
     ) then
    raise exception 'Protected hard delete did not preserve account and durable evidence.';
  end if;

  -- Exercise one unused valid request so static reviewers can see independent request
  -- IDs are available for concurrency tests performed outside this single transaction.
  perform v_request_5;
  raise notice 'Internal Flashcard integrity smoke test PASSED; rolling back.';
end;
$smoke$;

rollback;
