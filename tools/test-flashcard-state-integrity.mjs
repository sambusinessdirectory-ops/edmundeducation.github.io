import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(toolsDir, "..");
const source = readFileSync(path.join(siteDir, "flashcards.html"), "utf8");
const migration = readFileSync(
  path.join(siteDir, "supabase-flashcard-attempt-integrity-20260814.sql"),
  "utf8"
);
const integrityMigration = readFileSync(
  path.join(siteDir, "supabase-flashcard-integrity-phase1-05-v2-routines-20260814.sql"),
  "utf8"
);
const baseSchema = readFileSync(path.join(siteDir, "supabase-flashcard-accounts.sql"), "utf8");
const sharedAccountsSchema = readFileSync(
  path.join(siteDir, "supabase-shared-student-accounts.sql"),
  "utf8"
);

const appScriptMarker = "<script>\n    const ADMIN_NAME";
const appScriptTagStart = source.indexOf(appScriptMarker);
assert.notEqual(appScriptTagStart, -1, "Missing Flashcard application script");
const appScriptStart = source.indexOf(">", appScriptTagStart) + 1;
const appScriptEnd = source.indexOf("</script>", appScriptStart);
assert.notEqual(appScriptEnd, -1, "Unterminated Flashcard application script");
assert.doesNotThrow(
  () => new vm.Script(source.slice(appScriptStart, appScriptEnd), { filename: "flashcards-inline.js" }),
  "The protected Flashcard application script must remain valid JavaScript"
);

function sourceBetween(startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  assert.notEqual(start, -1, `Missing source marker: ${startMarker}`);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(end, -1, `Missing source marker: ${endMarker}`);
  return source.slice(start, end);
}

function extractFunction(name) {
  const marker = `function ${name}(`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `Missing function: ${name}`);
  const paramsStart = source.indexOf("(", start);
  let paramsDepth = 0;
  let paramsEnd = -1;
  for (let index = paramsStart; index < source.length; index += 1) {
    if (source[index] === "(") paramsDepth += 1;
    if (source[index] === ")") {
      paramsDepth -= 1;
      if (paramsDepth === 0) {
        paramsEnd = index;
        break;
      }
    }
  }
  const bodyStart = source.indexOf("{", paramsEnd);
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let index = bodyStart; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = "";
      continue;
    }
    if (character === '"' || character === "'" || character === "`") {
      quote = character;
      continue;
    }
    if (character === "{") depth += 1;
    if (character === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  throw new Error(`Unterminated function: ${name}`);
}

const mergeRuntime = vm.runInNewContext(`(() => {
  ${extractFunction("flashcardAttemptIdentity")}
  ${extractFunction("flashcardAttemptStrength")}
  ${extractFunction("compareFlashcardAttemptStrength")}
  ${extractFunction("mergeFlashcardAttempts")}
  return mergeFlashcardAttempts;
})()`);

const merged = mergeRuntime(
  [
    { id: "complete", completed: true, answeredCount: 10, updatedAt: 100 },
    { id: "older", answeredCount: 2, updatedAt: 90 },
    { id: "improves", answeredCount: 1, updatedAt: 80 }
  ],
  [
    { id: "new-empty", answeredCount: 0, updatedAt: 200 },
    { id: "complete", completed: false, answeredCount: 0, updatedAt: 300 },
    { id: "improves", answeredCount: 3, updatedAt: 110 }
  ]
);
assert.deepEqual([...merged.map(row => row.id)], ["complete", "older", "improves", "new-empty"]);
assert.equal(merged.find(row => row.id === "complete")?.answeredCount, 10);
assert.equal(merged.find(row => row.id === "complete")?.completed, true);
assert.equal(merged.find(row => row.id === "improves")?.answeredCount, 3);

assert.match(source, /const ATTEMPTS_BACKUP_LOCAL_PREFIX = "edmundFlashcardAttemptsBackup::account::";/);
assert.match(source, /hydratingOwner: "",\s*hydratingEpoch: 0,\s*hydratedOwner: "",\s*hydratedEpoch: 0/);
assert.match(source, /phase: FLASHCARD_SYNC_PHASES\.SIGNED_OUT,\s*epoch: 0/);

const ownershipRuntime = vm.runInNewContext(`(() => {
  ${extractFunction("normalizedLegacyOwnerName")}
  ${extractFunction("classifyLegacyAttemptOwnership")}
  return classifyLegacyAttemptOwnership;
})()`);
assert.equal(ownershipRuntime(JSON.stringify([{ studentName: "Hayley" }])).status, "single-owner");
assert.equal(ownershipRuntime(JSON.stringify([{ studentName: "Hayley" }, { studentName: "Mary" }])).status, "mixed-owner");
assert.equal(ownershipRuntime(JSON.stringify([{ studentName: "" }])).status, "ambiguous");

const strictBackupRuntime = vm.runInNewContext(`(() => {
  ${extractFunction("attemptsForBackup")}
  return attemptsForBackup;
})()`);
assert.deepEqual(
  [...strictBackupRuntime(
    [{ id: "owned", studentName: "Hayley" }, { id: "blank" }, { id: "other", studentName: "Mary" }],
    { name: "Hayley" }
  ).map(row => row.id)],
  ["owned"],
  "Blank-owner legacy attempts must remain quarantined instead of being attributed automatically"
);

const quarantine = sourceBetween("async function quarantineLegacyFlashcardSyncState", "function claimBootLegacyAttemptsForStudent");
assert.match(quarantine, /SUPABASE_SYNC_KEYS\.forEach/);
assert.match(quarantine, /legacySyncStateDigest/);
assert.match(quarantine, /storeLegacyQuarantineInIndexedDb/);
assert.match(quarantine, /storeLegacyQuarantineInLocalStorage/);
assert.match(quarantine, /RECOVERY_BLOCKED/);

const clearCache = sourceBetween("function clearFlashcardSyncedStateCache", "function familiarityPendingLocalKey");
assert.match(clearCache, /if \(!legacySyncQuarantineReady\)/);
assert.ok(
  clearCache.indexOf("if (!legacySyncQuarantineReady)") < clearCache.indexOf("localStorage.removeItem(key)"),
  "Legacy state must be quarantined before any generic synchronized key can be removed"
);

const mutationWriter = sourceBetween("function writeJson", "function advanceFlashcardSyncEpoch");
assert.match(mutationWriter, /if \(!flashcardMutationAllowed\(\)\)/);
assert.match(mutationWriter, /return false/);
assert.match(mutationWriter, /createFlashcardOutboxMutation/);
assert.match(mutationWriter, /await enqueueFlashcardOutboxMutation\(mutation\)/);
assert.match(mutationWriter, /flashcardStagedValues\.set/);
assert.match(mutationWriter, /flashcardStagedValues\.delete/);
assert.match(mutationWriter, /isSupabaseStateHydrated\(context\)/);
assert.ok(
  mutationWriter.indexOf("await enqueueFlashcardOutboxMutation(mutation)") < mutationWriter.indexOf("remoteStore[key] = payload", mutationWriter.indexOf("await enqueueFlashcardOutboxMutation(mutation)")),
  "A synchronized UI mutation must be durably enqueued before its canonical browser value is accepted"
);

const isolatedReads = sourceBetween("function readJson", "async function writeJson");
assert.match(isolatedReads, /cloneFlashcardSyncPayload\(staged\.value\)/);
assert.match(isolatedReads, /SUPABASE_SYNC_KEYS\.includes\(key\)[\s\S]*cloneFlashcardSyncPayload\(remoteStore\[key\]\)/);

assert.match(source, /const FLASHCARD_OUTBOX_DB = "edmund-flashcard-sync-outbox";/);
assert.match(source, /const FLASHCARD_OUTBOX_STORE = "mutations";/);
const outboxRecord = sourceBetween("function createFlashcardOutboxMutation", "function flashcardOutboxOwnerMatches");
for (const field of ["mutationId", "logicalMutationId", "owner", "accountKey", "studentId", "studentName", "syncEpoch", "key", "payload", "baseValue", "baseChecksum", "expectedVersion", "createdAt", "retries", "status", "nextAttemptAt"]) {
  assert.match(outboxRecord, new RegExp(`\\b${field}:`), `Missing durable outbox field: ${field}`);
}
assert.match(outboxRecord, /transport: usesV2 \? "v2" : "v1-rollout-fallback"/);

const outboxPersistence = sourceBetween("async function persistFlashcardOutboxMutation", "async function listFlashcardOutboxMutations");
assert.match(outboxPersistence, /\.add\(record\)/);
assert.match(outboxPersistence, /get\(record\.mutationId\)/);
assert.match(outboxPersistence, /verified\.owner !== record\.owner/);

const ownerRuntime = vm.runInNewContext(`(() => {
  ${extractFunction("normalizedLegacyOwnerName")}
  ${extractFunction("flashcardOutboxOwnerMatches")}
  return flashcardOutboxOwnerMatches;
})()`);
const ownerContext = { owner: "student:id::hayley", type: "student", studentId: "id", studentName: "Hayley" };
assert.equal(ownerRuntime({ ...ownerContext, transportType: "student" }, ownerContext), true);
assert.equal(ownerRuntime({ ...ownerContext, owner: "student:other::hayley", transportType: "student" }, ownerContext), false);
assert.equal(ownerRuntime({ ...ownerContext, transportType: "admin" }, ownerContext), false);

const retryRuntime = vm.runInNewContext(`(() => {
  const FLASHCARD_OUTBOX_RETRY_BASE_MS = 1200;
  const FLASHCARD_OUTBOX_RETRY_CAP_MS = 5 * 60 * 1000;
  ${extractFunction("flashcardOutboxRetryDelay")}
  return flashcardOutboxRetryDelay;
})()`);
assert.equal(retryRuntime(1, 0.5), 1200);
assert.ok(retryRuntime(20, 1) <= 5 * 60 * 1000, "Outbox retry delay must remain capped");
assert.notEqual(retryRuntime(3, 0), retryRuntime(3, 1), "Outbox retry delay must include jitter");

assert.match(source, /const FLASHCARD_STUDENT_STATE_READ_V2_RPC = "flashcard_student_get_state_v2";/);
assert.match(source, /const FLASHCARD_ADMIN_STATE_READ_V2_RPC = "flashcard_admin_get_student_state_v2";/);
assert.match(source, /const FLASHCARD_STUDENT_STATE_WRITE_V2_RPC = "flashcard_student_upsert_state_v2";/);
assert.match(source, /const FLASHCARD_ADMIN_STATE_WRITE_V2_RPC = "flashcard_admin_upsert_student_state_v2";/);

const v2Transport = extractFunction("sendFlashcardOutboxMutationV2");
assert.match(v2Transport, /p_request_id: record\.mutationId/);
assert.match(v2Transport, /p_expected_version: Number\(record\.expectedVersion\)/);
assert.match(v2Transport, /parseFlashcardV2Receipt\(receipt, record, context\)/);

const transport = extractFunction("sendFlashcardOutboxMutation");
assert.match(transport, /supabaseState\.v2Availability === "missing"/);
assert.match(transport, /supabaseState\.v2Availability === "unknown"/);
assert.match(transport, /isMissingFlashcardV2RpcError\(error, rpcName\)/);
assert.match(transport, /sendFlashcardOutboxMutationV1RolloutFallback/);
assert.ok(
  transport.indexOf('supabaseState.v2Availability === "unknown"')
    < transport.indexOf("sendFlashcardOutboxMutationV1RolloutFallback(record, context)", transport.indexOf("catch (error)")),
  "The v1 fallback must only be reachable while v2 availability is still unknown"
);

const missingRpcRuntime = vm.runInNewContext(`(() => {
  ${extractFunction("isMissingFlashcardV2RpcError")}
  return isMissingFlashcardV2RpcError;
})()`);
assert.equal(missingRpcRuntime(
  { code: "PGRST202", message: "Could not find the function public.flashcard_student_get_state_v2(p_token) in the schema cache" },
  "flashcard_student_get_state_v2"
), true);
assert.equal(missingRpcRuntime(
  { code: "401", message: "flashcard_student_get_state_v2 is unauthorized" },
  "flashcard_student_get_state_v2"
), false);
assert.equal(missingRpcRuntime(
  { code: "PGRST202", message: "Could not find a different function in the schema cache" },
  "flashcard_student_get_state_v2"
), false);
assert.equal(missingRpcRuntime(
  { message: "Network error while calling flashcard_student_get_state_v2" },
  "flashcard_student_get_state_v2"
), false);

const receiptRuntime = vm.runInNewContext(`(() => {
  ${extractFunction("flashcardIntegrityError")}
  ${extractFunction("parseFlashcardV2Receipt")}
  return parseFlashcardV2Receipt;
})()`);
const receiptRecord = { mutationId: "11111111-1111-4111-8111-111111111111", key: "state", expectedVersion: 7 };
const parsedConflictReceipt = receiptRuntime({
  requestId: receiptRecord.mutationId,
  actorKind: "student",
  key: "state",
  status: "conflict",
  code: "version_conflict",
  expectedVersion: 7,
  resultingVersion: 8,
  resultingChecksum: "abc"
}, receiptRecord, { type: "student" });
assert.equal(parsedConflictReceipt.status, "conflict");
assert.equal(parsedConflictReceipt.hasCanonicalValue, false, "Canonical values may be omitted from compact v2 receipts");
assert.throws(() => receiptRuntime({
  requestId: "22222222-2222-4222-8222-222222222222",
  actorKind: "student",
  key: "state",
  status: "accepted",
  expectedVersion: 7,
  resultingVersion: 8
}, receiptRecord, { type: "student" }), /does not match/);

const genericRebaseRuntime = vm.runInNewContext(`(() => {
  ${extractFunction("cloneFlashcardSyncPayload")}
  ${extractFunction("flashcardJsonEqual")}
  ${extractFunction("isPlainFlashcardStateObject")}
  ${extractFunction("rebaseFlashcardGenericState")}
  return rebaseFlashcardGenericState;
})()`);
const disjointRebase = genericRebaseRuntime(
  { left: 1, right: 1 },
  { left: 2, right: 1 },
  { left: 1, right: 2 }
);
assert.equal(disjointRebase.safe, true);
assert.deepEqual({ ...disjointRebase.value }, { left: 2, right: 2 });
assert.equal(genericRebaseRuntime(
  { value: 1 },
  { value: 2 },
  { value: 3 }
).safe, false, "Overlapping generic edits must not silently overwrite one another");
assert.equal(genericRebaseRuntime([1], [2], [1]).safe, true);
assert.equal(genericRebaseRuntime([1], [2], [3]).safe, false, "Concurrent array edits require review");

const canonicalReload = extractFunction("resolveFlashcardCanonicalState");
assert.match(canonicalReload, /record\.key !== ATTEMPTS_KEY && receipt\?\.hasCanonicalValue/);
assert.match(canonicalReload, /await callFlashcardStateReadV2\(context\)/);
assert.match(canonicalReload, /canonicalVersion !== Number\(receipt\.resultingVersion\)/);
assert.match(canonicalReload, /canonicalChecksum !== String\(receipt\.resultingChecksum \|\| ""\)/);

const compactReceipt = extractFunction("compactFlashcardV2Receipt");
assert.match(compactReceipt, /delete compact\.canonicalValue/);
assert.match(extractFunction("createRebasedFlashcardOutboxMutation"), /receipt: compactFlashcardV2Receipt\(receipt\)/);
assert.match(extractFunction("blockFlashcardOutboxMutation"), /record\.key === ATTEMPTS_KEY \? undefined/);

const drain = sourceBetween("async function drainFlashcardOutboxUnlocked", "async function drainFlashcardOutbox");
assert.match(drain, /!flashcardOutboxOwnerMatches\(originalRecord, context\)/);
assert.match(drain, /!isSupabaseStateContextCurrent\(context\)/);
assert.match(drain, /status: "inflight"/);
assert.match(drain, /status: "retry"/);
assert.ok(
  drain.indexOf("receipt?.requestId !== record.mutationId") < drain.indexOf("deleteFlashcardOutboxMutation(record.mutationId)"),
  "A durable row must not be deleted before its request ID is verified"
);
assert.ok(
  drain.indexOf("!['accepted', 'noop'].includes(receipt.status)") < drain.indexOf("deleteFlashcardOutboxMutation(record.mutationId)"),
  "Only accepted/noop receipts may delete a durable outbox row"
);
assert.match(drain, /receipt\.status === "conflict"/);
assert.match(drain, /handleFlashcardOutboxConflict/);
assert.match(drain, /receipt\.status === "rejected"/);
assert.match(drain, /blockFlashcardOutboxMutation/);

const wakeups = sourceBetween("function setupFlashcardOutboxWakeups", "async function requestFlashcardDurableStorage");
assert.match(wakeups, /addEventListener\("online"/);
assert.match(wakeups, /addEventListener\("focus"/);
assert.match(wakeups, /visibilitychange/);

const statusGuard = sourceBetween("function protectedFlashcardSyncStatus", "function updateSupabaseStatus");
assert.match(statusGuard, /待同步/);
assert.match(statusGuard, /離線/);
assert.match(statusGuard, /最後同步/);
assert.match(statusGuard, /系統已切換為唯讀/);

const enqueueOutbox = sourceBetween("function enqueueFlashcardOutboxMutation", "function setupFlashcardOutboxWakeups");
assert.match(enqueueOutbox, /supabaseState\.outboxPersisting \+= 1/);
assert.match(enqueueOutbox, /await persistFlashcardOutboxMutation\(record\)/);
assert.match(enqueueOutbox, /supabaseState\.phase = FLASHCARD_SYNC_PHASES\.DEGRADED_READ_ONLY/);
assert.ok(
  enqueueOutbox.indexOf("supabaseState.outboxPersisting += 1") < enqueueOutbox.indexOf("await persistFlashcardOutboxMutation(record)"),
  "Ignored async call sites must immediately expose a pending state before IndexedDB persistence completes"
);

const directSave = sourceBetween("async function saveSupabaseState", "function displayPreferenceOwner");
assert.match(directSave, /!isSupabaseStateHydrated\(context\)/);
assert.match(directSave, /isSupabaseStateContextCurrent\(context\)/);
assert.match(directSave, /enqueueFlashcardOutboxMutation\(mutation\)/);
assert.doesNotMatch(directSave, /supabaseClient\.rpc/);

const hydration = sourceBetween("async function loadStudentStateFromSupabase", "async function saveStudentAccessToSupabase");
assert.match(hydration, /const requestContext = captureSupabaseStateSaveContext\(\)/);
assert.match(hydration, /isSupabaseStateContextCurrent\(requestContext\)/);
assert.match(hydration, /callFlashcardStateReadV2\(requestContext\)/);
assert.match(hydration, /setFlashcardStateMetadata/);
assert.match(hydration, /mergeFlashcardAttempts\(remoteAttempts, accountBackup\)/);
assert.match(hydration, /await overlayFlashcardOutboxForContext\(requestContext\)/);
assert.match(hydration, /supabaseState\.hydratedOwner = requestContext\.owner/);

const boot = sourceBetween("async function initialiseFlashcardPortal", "void initialiseFlashcardPortal");
assert.ok(
  boot.indexOf("await quarantineLegacyFlashcardSyncState()") < boot.indexOf("restoreSession()"),
  "Raw legacy browser state must be quarantined before session restoration can clear it"
);
assert.ok(
  boot.indexOf("await initSupabaseState()") < boot.indexOf("showAppPanel("),
  "A restored dashboard must not become interactive before state hydration finishes"
);
assert.match(boot, /isSupabaseStateHydrated\(context\)/);
assert.match(boot, /await verifyFlashcardOutboxAvailable\(\)/);
assert.match(boot, /setupFlashcardOutboxWakeups\(\)/);
assert.match(boot, /scheduleFlashcardOutboxDrain\("startup", 0\)/);

const readiness = sourceBetween("function requireFlashcardStateReady", "async function flushSupabaseStateSaves");
assert.match(readiness, /currentUser\?\.role !== "student"/);
assert.match(readiness, /if \(context && isSupabaseStateHydrated\(context\)\) return true/);
assert.match(readiness, /未有有效的網上帳戶連線/);

const login = sourceBetween("async function login", "function getKnownDeckIds");
assert.doesNotMatch(login, /getStudents\(\)\.find\(item => item\.name === trimmedName && item\.password === password\)/);
assert.match(login, /離線本機登入已停用/);

const adminSwitch = sourceBetween("async function switchAdminToStudent", "function returnToAdminAccount");
assert.match(adminSwitch, /if \(!stateLoaded\)/);
assert.ok(
  adminSwitch.indexOf("if (!stateLoaded)") < adminSwitch.indexOf('showAppPanel("dashboard", false)'),
  "Admin impersonation must not open a student dashboard after hydration failure"
);

const deckStart = sourceBetween("function startDeckSession", "function startRedCrossSession");
assert.match(deckStart, /requireFlashcardStateReady\(status\)/);

const logoutHandler = sourceBetween('if (event.target.closest("[data-logout]"))', 'if (event.target.closest("[data-speak-card]"))');
assert.match(logoutHandler, /await flushSupabaseStateSaves\(\)/);
assert.match(logoutHandler, /if \(!flushResult\.safeToLogout\)/);
assert.ok(
  logoutHandler.indexOf("if (!flushResult.safeToLogout)") < logoutHandler.indexOf("clearSession()"),
  "Logout must be blocked if a mutation has not yet reached durable IndexedDB storage"
);
assert.doesNotMatch(logoutHandler, /deleteFlashcardOutboxMutation/);

assert.match(migration, /create or replace function public\.flashcard_merge_attempt_arrays/);
assert.equal(
  (migration.match(/then public\.flashcard_merge_attempt_arrays\(state\.value, excluded\.value\)/g) || []).length,
  2,
  "Both student and admin state writers must merge attempt history"
);
assert.match(migration, /answered_score desc,[\s\S]*updated_score desc/);
assert.match(migration, /revoke all on function public\.flashcard_merge_attempt_arrays/);
assert.match(baseSchema, /create or replace function public\.flashcard_merge_attempt_arrays/);
assert.equal(
  (baseSchema.match(/then public\.flashcard_merge_attempt_arrays\(state\.value, excluded\.value\)/g) || []).length,
  2,
  "Fresh Flashcard account installations must include the same merge protection"
);
assert.match(sharedAccountsSchema, /create or replace function public\.flashcard_merge_attempt_arrays/);
assert.equal(
  (sharedAccountsSchema.match(/then public\.flashcard_merge_attempt_arrays\(state\.value, excluded\.value\)/g) || []).length,
  2,
  "The shared-account installer must not redeploy destructive Flashcard attempt replacement"
);

for (const match of sharedAccountsSchema.matchAll(
  /create or replace function public\.flashcard_(?:student_upsert_state|admin_upsert_student_state)[\s\S]*?\$\$;/g
)) {
  assert.doesNotMatch(
    match[0],
    /set\s+value\s*=\s*excluded\.value\s*,/i,
    "A Flashcard state writer may not blindly replace the whole attempt document"
  );
}

for (const signature of [
  /create or replace function public\.flashcard_student_get_state_v2\(p_token uuid\)/,
  /create or replace function public\.flashcard_student_upsert_state_v2\([\s\S]*?p_request_id uuid,[\s\S]*?p_expected_version bigint/,
  /create or replace function public\.flashcard_admin_get_student_state_v2\([\s\S]*?p_student_name text/,
  /create or replace function public\.flashcard_admin_upsert_student_state_v2\([\s\S]*?p_request_id uuid,[\s\S]*?p_expected_version bigint/
]) {
  assert.match(integrityMigration, signature, "The stable v2 RPC contract must be present in the integrity migration");
}
assert.match(integrityMigration, /'requestId', p_request_id/);
assert.match(integrityMigration, /'status', p_status/);
assert.match(integrityMigration, /'resultingVersion', p_resulting_version/);
assert.match(integrityMigration, /'resultingChecksum', p_resulting_checksum/);

console.log("Flashcard state-integrity checks passed.");
