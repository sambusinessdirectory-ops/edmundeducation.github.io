import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');

const migration = read('supabase-flashcard-integrity-legacy-object-merge-guard-20260815.sql');
const rollback = read('supabase-flashcard-integrity-legacy-object-merge-guard-rollback-20260815.sql');
const verification = read('supabase-flashcard-integrity-legacy-object-merge-guard-verification-20260815.sql');
const watchdog = read('supabase-flashcard-integrity-watchdog-20260814.sql');
const cutover = read('supabase-flashcard-integrity-phase1-11-trigger-cutover-20260814.sql');
const integrityWorkflow = read('.github/workflows/flashcard-integrity.yml');
const wrapperSources = [
  cutover,
  read('supabase-flashcard-accounts.sql'),
  read('supabase-shared-student-accounts.sql'),
  read('supabase-flashcard-attempt-integrity-20260814.sql'),
];
const bootstrapSources = wrapperSources.slice(1, 3);

assert.match(migration, /begin;[\s\S]*commit;/i, 'migration must be atomic');
assert.match(migration, /flashcard_state_zy_legacy_object_merge/i);
assert.match(migration, /before update on public\.flashcard_student_state/i);
assert.match(migration, /security definer[\s\S]*set search_path = ''/i);
assert.ok(
  'flashcard_state_zy_legacy_object_merge' < 'flashcard_state_zz_integrity_protect',
  'guard trigger must sort before the existing integrity trigger',
);
assert.match(migration, /v_actor_kind not in \('legacy_student', 'legacy_admin'\)/i);
assert.match(migration, /rules\.v2_writable/i);
assert.match(migration, /rules\.expected_json_type = 'object'/i);
assert.match(migration, /rules\.write_strategy = 'versioned_replace'/i);
assert.match(migration, /jsonb_typeof\(old\.value\) <> 'object'/i);
assert.match(migration, /jsonb_typeof\(new\.value\) <> 'object'/i);
assert.match(migration, /new\.value := old\.value \|\| v_incoming/i);
assert.match(migration, /pg_get_functiondef\(v_student_upsert\)/i);
assert.match(migration, /pg_get_functiondef\(v_admin_upsert\)/i);
assert.match(migration, /legacy_object_regression_prevented/i);
assert.match(migration, /lossless_top_level_merge/i);
assert.match(
  migration,
  /revoke all on function flashcard_integrity\.protect_legacy_object_members\(\)[\s\S]*from public, anon, authenticated, service_role/i,
);

assert.doesNotMatch(
  migration,
  /(?:grant|revoke)[\s\S]{0,120}flashcard_(?:student|admin)_upsert_state\(/i,
  'compatibility migration must not silently change existing client endpoint grants',
);
assert.doesNotMatch(
  migration,
  /before[\s\S]{0,40}(?:insert|delete)[\s\S]{0,40}on public\.flashcard_student_state/i,
  'guard trigger must not change insert or delete semantics',
);

for (const [index, wrapperSource] of wrapperSources.entries()) {
  assert.match(
    wrapperSource,
    /set_config\('flashcard_integrity\.actor_kind', 'legacy_student'/i,
    `wrapper source ${index + 1} must label student v1 writes`,
  );
  assert.match(
    wrapperSource,
    /set_config\('flashcard_integrity\.actor_kind', 'legacy_admin'/i,
    `wrapper source ${index + 1} must label admin v1 writes`,
  );
  assert.match(
    wrapperSource,
    /get diagnostics v_affected = row_count/i,
    `wrapper source ${index + 1} must expose soft-rejected writes as false`,
  );
}
for (const [index, bootstrapSource] of bootstrapSources.entries()) {
  assert.match(
    bootstrapSource,
    /create or replace function public\.flashcard_student_delete_state[\s\S]*?get diagnostics v_affected = row_count[\s\S]*?return v_affected > 0;/i,
    `bootstrap source ${index + 1} must preserve explicit-delete result semantics`,
  );
}

assert.match(verification, /flashcard_student_upsert_state\(/i);
assert.match(verification, /flashcard_admin_upsert_student_state\(/i);
assert.match(verification, /edmundFlashcardAttempts/i);
assert.match(verification, /flashcard_integrity\.write_state_v2\(/i);
assert.match(verification, /flashcard_student_delete_state\(/i);
assert.match(
  verification,
  /v_result := public\.flashcard_student_delete_state\([\s\S]*?'edmundFlashcardProgress'[\s\S]*?\);[\s\S]*?if v_result/i,
  'protected-delete verification must evaluate the volatile RPC before checking row existence',
);
assert.match(
  verification,
  /v_result := public\.flashcard_student_delete_state\([\s\S]*?'edmundStudentDisplayPreferences'[\s\S]*?\);[\s\S]*?if not v_result/i,
  'allowed-delete verification must evaluate the volatile RPC before checking row existence',
);
assert.match(verification, /edmundStudentDisplayPreferences/i);
assert.match(verification, /flashcard_integrity\.state_revisions/i);
assert.match(verification, /flashcard_integrity\.alert_outbox/i);
assert.match(verification, /rollback;/i);

assert.match(rollback, /legacy_object_guard_rollback_approved/i);
assert.match(rollback, /confirmed-legacy-object-guard-rollback-20260815/i);
assert.match(rollback, /drop trigger if exists flashcard_state_zy_legacy_object_merge/i);
assert.match(rollback, /drop function if exists flashcard_integrity\.protect_legacy_object_members\(\)/i);
assert.doesNotMatch(rollback, /delete\s+from/i, 'rollback must not delete state or audit data');

assert.match(watchdog, /Eight named triggers/i);
assert.match(
  watchdog,
  /'flashcard_state_zy_legacy_object_merge'::text/i,
  'watchdog must fail closed if the compatibility guard is absent or disabled',
);
assert.match(
  integrityWorkflow,
  /node tools\/test-flashcard-legacy-object-guard\.mjs/i,
  'staged integrity CI must execute the compatibility-guard regression test',
);

console.log('Flashcard legacy object guard source checks passed.');
