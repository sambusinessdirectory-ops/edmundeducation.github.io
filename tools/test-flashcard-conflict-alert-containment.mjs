import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const withoutComments = (sql) => sql.replace(/^\s*--.*$/gm, '');

const migration = read('supabase-flashcard-integrity-conflict-alert-containment-20260815.sql');
const verification = read('supabase-flashcard-integrity-conflict-alert-containment-verification-20260815.sql');
const rollback = read('supabase-flashcard-integrity-conflict-alert-containment-rollback-20260815.sql');
const runbook = read('FLASHCARD-CONFLICT-ALERT-CONTAINMENT-RUNBOOK-20260815.md');
const workflow = read('.github/workflows/flashcard-integrity.yml');
const executableMigration = withoutComments(migration);
const executableRollback = withoutComments(rollback);
const productionSql = `${executableMigration}\n${executableRollback}`;

assert.match(migration, /begin;[\s\S]*commit;/i, 'migration must be atomic');
assert.match(migration, /lock_timeout = '3s'/i);
assert.match(migration, /statement_timeout = '2min'/i);
assert.match(migration, /write_state_v2\(uuid,text,text,text,jsonb,uuid,bigint\)/i);
assert.match(migration, /add column if not exists occurrence_count bigint not null default 1/i);
assert.match(migration, /add column if not exists last_seen_at timestamptz/i);
assert.match(migration, /add column if not exists last_request_id uuid/i);
assert.match(migration, /add column if not exists dedup_fingerprint text/i);
assert.match(migration, /add column if not exists dedup_window_start timestamptz/i);

assert.match(
  migration,
  /create unique index if not exists flashcard_integrity_alerts_conflict_dedup_unique_idx[\s\S]*severity = 'warning'[\s\S]*code = 'optimistic_version_conflict'[\s\S]*resolved_at is null/i,
  'only open warning conflict alerts may occupy a deduplication bucket',
);
assert.match(migration, /create index if not exists must not silently accept/i);
assert.match(migration, /pg_get_indexdef/i);
assert.match(migration, /pg_get_expr/i);
assert.match(migration, /missing or weaker than the reviewed definition/i);
assert.match(
  migration,
  /create unique index if not exists flashcard_integrity_outbox_one_pending_per_alert_idx[\s\S]*\(alert_id, destination\)[\s\S]*where delivered_at is null/i,
  'database must enforce one pending notification per canonical alert/destination',
);
assert.match(migration, /Pending-outbox uniqueness index is missing or weaker/i);
assert.match(migration, /date_part\('epoch', pg_catalog\.transaction_timestamp\(\)\) \/ 900/i);
assert.match(migration, /extensions\.digest[\s\S]*'sha256'/i);
assert.match(migration, /currentMetrics[\s\S]*incomingMetrics[\s\S]*actionTaken[\s\S]*actorKind/i);
assert.match(migration, /pg_advisory_xact_lock[\s\S]*hashtextextended/i);
assert.match(
  migration,
  /if v_severity = 'warning' and p_code = 'optimistic_version_conflict' then/i,
  'deduplication must be exact and warning-only',
);
assert.match(migration, /occurrence_count = occurrence_count \+ 1/i);
assert.match(migration, /last_seen_at = v_now/i);
assert.match(migration, /last_request_id = p_request_id/i);
assert.match(
  migration,
  /insert into flashcard_integrity\.alert_outbox \(alert_id\)[\s\S]*where not exists[\s\S]*destination = 'flashcard-integrity-monitor'[\s\S]*delivered_at is null/i,
  'duplicate path must keep at most one pending notification per canonical alert/destination',
);

assert.doesNotMatch(
  executableMigration,
  /create or replace function flashcard_integrity\.write_state_v2/i,
  'containment must not replace or weaken CAS',
);
assert.doesNotMatch(
  executableMigration,
  /(?:insert into|update|delete from|truncate) public\.flashcard_student_state/i,
  'containment must not write student state',
);
assert.doesNotMatch(
  executableMigration,
  /(?:insert into|update|delete from|truncate) flashcard_integrity\.state_revisions/i,
  'containment must not fabricate or rewrite revisions',
);
assert.doesNotMatch(executableMigration, /\bgrant\b/i, 'migration must grant no new access');
assert.doesNotMatch(executableMigration, /\bdelete\s+from\b/i, 'migration must delete no evidence');
assert.doesNotMatch(
  executableMigration,
  /update\s+flashcard_integrity\.alert_outbox[\s\S]*set\s+delivered_at/i,
  'containment must not compete with the external delivery acknowledgement path',
);
assert.doesNotMatch(
  productionSql,
  /acknowledge_optimistic_conflict_alerts|delivery_reference|delivered_by/i,
  'containment and rollback must not stage a second delivery or resolver mechanism',
);
assert.doesNotMatch(
  executableMigration,
  /update\s+flashcard_integrity\.alerts[\s\S]*set[\s\S]{0,160}resolved_at/i,
  'delivery containment must not claim semantic alert resolution',
);

assert.match(verification, /v_receipt_1 ->> 'status' <> 'conflict'/i);
assert.match(verification, /v_receipt_1 ->> 'code' <> 'version_conflict'/i);
assert.match(verification, /v_receipt_1 ->> 'reloadRequired' <> 'true'/i);
assert.match(verification, /v_alert_id_2 is distinct from v_alert_id_1/i);
assert.match(verification, /v_occurrence_count <> 2/i);
assert.match(verification, /v_count <> 1/i);
assert.match(verification, /flashcard_integrity\.write_receipts/i);
assert.match(verification, /state\.value is distinct from v_baseline_value/i);
assert.match(verification, /v_count <> v_baseline_revisions/i);
assert.match(verification, /v_receipt_replay is distinct from v_receipt_2/i);
assert.match(verification, /v_non_target_alert_1 = v_non_target_alert_2/i);
assert.match(verification, /set delivered_at = pg_catalog\.clock_timestamp\(\)/i);
assert.match(
  verification,
  /begin;[\s\S]*set delivered_at = pg_catalog\.clock_timestamp\(\)[\s\S]*rollback;/i,
  'synthetic delivery is allowed only inside the verification transaction that rolls back',
);
assert.match(verification, /v_alert_id_after_delivery is distinct from v_alert_id_1/i);
assert.match(verification, /v_count <> 2/i);
assert.match(verification, /outbox\.delivered_at is null\) <> 1/i);
assert.match(verification, /alert\.occurrence_count = 3/i);
assert.match(verification, /alert\.resolved_at is null/i);
assert.match(verification, /rollback;/i);

assert.match(rollback, /conflict_alert_containment_rollback_approved/i);
assert.match(rollback, /confirmed-disable-dedup-20260815/i);
assert.match(rollback, /create or replace function flashcard_integrity\.record_alert/i);
assert.doesNotMatch(executableRollback, /\bdrop\b/i, 'rollback must retain schema and evidence');
assert.doesNotMatch(executableRollback, /\bdelete\s+from\b/i, 'rollback must delete no evidence');
assert.doesNotMatch(
  executableRollback,
  /create or replace function flashcard_integrity\.write_state_v2/i,
  'rollback must not change CAS',
);

assert.match(runbook, /at most four canonical alerts per hour/i);
assert.match(runbook, /does not weaken optimistic concurrency/i);
assert.match(runbook, /existing warning outbox rows/i);
assert.match(runbook, /external issue/i);
assert.match(runbook, /never mark.*delivered.*quiet/i);
assert.match(runbook, /do not reapply the[\s\S]{0,80}base watchdog/i);
assert.match(runbook, /rollback/i);
assert.match(
  workflow,
  /node tools\/test-flashcard-conflict-alert-containment\.mjs/i,
  'integrity CI must execute the containment regression test',
);

console.log('Flashcard optimistic-conflict alert containment source checks passed.');
