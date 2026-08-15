import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(toolsDir, "..");
const read = (name) => readFileSync(path.join(siteDir, name), "utf8");
const stageName = (number, suffix) =>
  `supabase-flashcard-integrity-phase1-${String(number).padStart(2, "0")}-${suffix}-20260814.sql`;

const stageFiles = [
  stageName(1, "foundation"),
  stageName(2, "state-metadata-backfill"),
  stageName(3, "attempt-routines"),
  stageName(4, "state-routines"),
  stageName(5, "v2-routines"),
  stageName(6, "snapshot-routines"),
  stageName(7, "integrity-backfill"),
  stageName(8, "add-not-valid-constraints"),
  stageName(9, "validate-constraints"),
  stageName(10, "finalize-columns"),
  stageName(11, "trigger-cutover"),
  stageName(12, "post-cutover-catchup"),
  stageName(13, "security-activation"),
  stageName(14, "auth-role-cutover")
];
const stages = stageFiles.map(read);
const series = stages.join("\n");
const [
  foundation,
  metadataBackfill,
  attemptRoutines,
  stateRoutines,
  v2Routines,
  snapshotRoutines,
  integrityBackfill,
  addConstraints,
  validateConstraints,
  finalizeColumns,
  triggerCutover,
  catchup,
  securityActivation,
  authCutover
] = stages;
const verification = read("supabase-flashcard-integrity-phase1-verification-20260814.sql");
const forwardDisable = read("supabase-flashcard-integrity-phase1-forward-disable-20260814.sql");
const monolith = read("supabase-flashcard-integrity-phase1-20260814.sql");
const runbook = read("FLASHCARD-INTEGRITY-PHASE1-RUNBOOK-20260814.md");

for (const [name, source] of [
  ...stageFiles.map((name, index) => [name, stages[index]]),
  ["verification", verification],
  ["forward-disable", forwardDisable]
]) {
  assert.doesNotMatch(
    source,
    /pg_catalog\.(?:coalesce|greatest|least|nullif)\s*\(/i,
    `${name} must not schema-qualify PostgreSQL special-form expressions`
  );
}

assert.match(monolith, /DEPRECATED SAFETY GUARD/);
assert.match(monolith, /Deprecated monolithic Flashcard migration refused/);
assert.doesNotMatch(monolith, /alter table public\.flashcard_student_state/i);

for (const [index, sql] of stages.entries()) {
  assert.match(sql, new RegExp(`stage ${String(index + 1).padStart(2, "0")}`, "i"));
  assert.match(sql, /begin;/i);
  assert.match(sql, /commit;/i);
  assert.match(sql, /set local lock_timeout = '3s'/i);
  assert.doesNotMatch(sql, /jsonb_object_length/i);
  assert.doesNotMatch(sql, /cron\.schedule\s*\(/i, `${stageFiles[index]} must not schedule cron`);
}

assert.match(foundation, /add column if not exists version bigint;/i);
assert.match(foundation, /add column if not exists value_checksum text;/i);
assert.doesNotMatch(foundation, /alter column version set not null/i);
assert.match(foundation, /create trigger flashcard_state_metadata_guard/i);

for (const key of [
  "edmundFlashcardCards",
  "edmundFlashcardAttempts",
  "edmundFlashcardProgress",
  "edmundFlashcardResetLogs",
  "edmundFlashcardFamiliarity",
  "edmundFlashcardNotes",
  "edmundFlashcardBookmarks",
  "edmundFlashcardStudentMessages",
  "edmundFlashcardDashboardLayouts",
  "edmundFlashcardUiPreferences"
]) {
  assert.match(foundation, new RegExp(`\\('${key}'[^\\n]+true,`));
}
for (const key of [
  "edmundStudentDisplayPreferences",
  "speaking-access-v1",
  "speaking-bookmarks-v1"
]) {
  assert.match(foundation, new RegExp(`\\('${key}'[^\\n]+false,`));
}

assert.match(metadataBackfill, /set_config\('flashcard_integrity\.preserve_updated_at'/i);
assert.match(metadataBackfill, /update public\.flashcard_student_state/i);
assert.doesNotMatch(metadataBackfill, /alter table public\.flashcard_student_state/i);

assert.match(attemptRoutines, /if v_incoming_quality > v_existing_quality then/i);
assert.match(attemptRoutines, /v_existing_quality >= v_incoming_quality/i);
assert.match(attemptRoutines, /merge_attempt_arrays/i);

assert.match(stateRoutines, /return 'unknown_state_key';/i);
assert.match(stateRoutines, /attempt_element_not_object/i);
assert.match(stateRoutines, /where pg_catalog\.jsonb_typeof\(item\) <> 'object'/i);
assert.match(stateRoutines, /rebuild the JSON row/i);
assert.match(stateRoutines, /'rejected_and_preserved'[\s\S]+return null;/i);
assert.match(stateRoutines, /errcode = 'PFC01'[\s\S]+when sqlstate 'PFC01'/i);
assert.match(stateRoutines, /student_hard_delete_blocked[\s\S]+return null;/i);
assert.doesNotMatch(stateRoutines, /external database\/API log monitor/i);

const requestLockIndex = v2Routines.indexOf("'request:' || p_student_id");
const stateLockIndex = v2Routines.indexOf("'state:' || p_student_id");
assert.ok(requestLockIndex > 0 && stateLockIndex > requestLockIndex, "request lock must precede state lock");
assert.match(v2Routines, /get stacked diagnostics[\s\S]+state_guard_rejected_write/i);
assert.match(v2Routines, /action_taken = 'rejected_and_preserved'/i);
assert.match(v2Routines, /v_status := 'rejected'/i);
assert.match(v2Routines, /'reloadRequired', true/i);
assert.doesNotMatch(v2Routines, /'canonicalValue'/i);
assert.match(v2Routines, /insert into flashcard_integrity\.write_receipts/i);

assert.match(snapshotRoutines, /manifest_checksum/i);
assert.match(snapshotRoutines, /snapshot_scheduler_status/i);
assert.match(snapshotRoutines, /v_expected := v_actual/i);
assert.doesNotMatch(snapshotRoutines, /create extension if not exists pg_cron/i);

assert.match(integrityBackfill, /non-object array element/i);
assert.match(integrityBackfill, /insert into flashcard_integrity\.state_revisions/i);
assert.match(integrityBackfill, /sync_attempt_records/i);
assert.match(addConstraints, /not valid/i);
assert.match(validateConstraints, /validate constraint/i);
assert.match(finalizeColumns, /alter column version set not null/i);

assert.match(triggerCutover, /lock table public\.flashcard_student_state in share row exclusive mode/i);
const inventoryIndex = triggerCutover.indexOf("Auto-registered live shared consumer");
const fullTriggerIndex = triggerCutover.indexOf("create trigger flashcard_state_zz_integrity_protect");
assert.ok(inventoryIndex > 0 && fullTriggerIndex > inventoryIndex, "live inventory must precede rejecting trigger");
assert.match(triggerCutover, /v2_writable,[\s\S]+false,[\s\S]+Auto-registered/i);
for (const signature of [
  "flashcard_admin_upsert_student_state",
  "flashcard_student_upsert_state",
  "flashcard_student_delete_state"
]) {
  assert.match(triggerCutover, new RegExp(`create or replace function public\\.${signature}[\\s\\S]+row_count`, "i"));
}
assert.match(triggerCutover, /legacy_hard_delete_request_blocked/i);
const hardDeleteReplacement = triggerCutover.slice(
  triggerCutover.indexOf("create or replace function public.flashcard_admin_delete_student_with_state"),
  triggerCutover.indexOf("drop trigger if exists flashcard_state_metadata_guard")
);
assert.doesNotMatch(hardDeleteReplacement, /delete from public\.flashcard_student_state/i);
assert.match(catchup, /rebuild attempt blobs from canonical records|normalized canonical set/i);
assert.match(catchup, /migration_post_cutover_catchup/i);
assert.match(catchup, /insert into public\.flashcard_student_state \(student_id, key, value\)/i);
assert.match(catchup, /update public\.flashcard_student_state state[\s\S]+set value = canonical\.canonical_value/i);
assert.match(catchup, /all_attempt_students[\s\S]+state\.value is distinct from canonical\.canonical_value/i);
assert.match(catchup, /not exactly bidirectionally equal/i);

assert.match(securityActivation, /grant execute on function public\.flashcard_student_get_state_v2\(uuid\) to authenticated/i);
assert.doesNotMatch(securityActivation, /revoke all on function public\.flashcard_student_get_state\(uuid\)/i);
assert.match(securityActivation, /Deliberately NO cron\.schedule/i);
assert.match(authCutover, /authenticated_client_cutover_approved/i);
assert.match(authCutover, /revoke all on function public\.flashcard_student_get_state\(uuid\)[\s\S]+from public, anon/i);

assert.match(forwardDisable, /cron\.unschedule/i);
assert.ok(
  forwardDisable.indexOf("cron.unschedule") < forwardDisable.indexOf("flashcard_student_get_state_v2"),
  "forward-disable must unschedule automation before revoking API grants"
);
assert.match(forwardDisable, /break_glass_trigger_downgrade/i);
assert.doesNotMatch(forwardDisable, /drop (table|schema|column)/i);

for (const phrase of [
  "exactly nine integrity tables",
  "normalized attempts exactly equal the canonical source merge",
  "revision values, checksums, metrics",
  "four immutable evidence triggers",
  "private functions have no client EXECUTE grants",
  "private sequences have no client privileges",
  "automatic same-project snapshot cron remains disabled",
  "completed snapshot manifests",
  "receipts are compact"
]) {
  assert.match(verification, new RegExp(phrase, "i"));
}
assert.match(verification, /OPTIONAL INTERNAL TRANSACTIONAL SMOKE TEST/i);
assert.match(verification, /Identity sequence values are non-transactional/i);
assert.match(verification, /attempt_element_not_object/i);
assert.match(verification, /Equal-quality nested attempt arrays/i);
assert.match(verification, /soft rejections durably alert/i);
assert.match(verification, /Legacy unknown-key RPC did not return false with durable evidence/i);
assert.match(verification, /rollback;/i);

for (const phrase of [
  "durable database signal",
  "not the primary or only rejection signal",
  "quarantined test account",
  "Identity sequences are non-transactional",
  "Phase 1 intentionally schedules no",
  "Safe disable and incident response"
]) {
  assert.match(runbook, new RegExp(phrase, "i"));
}

console.log(`Flashcard integrity phase-1 staged source checks passed (${stageFiles.length} stages).`);
