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
assert.match(mutationWriter, /if \(!flashcardMutationAllowed\(context, key\)\)/);
assert.match(mutationWriter, /supabaseState\.outboxBlockedKeys\.has\(key\)/);
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
for (const field of ["mutationId", "logicalMutationId", "logicalMutationIds", "owner", "accountKey", "studentId", "studentName", "syncEpoch", "key", "payload", "baseValue", "baseChecksum", "expectedVersion", "createdAt", "retries", "status", "nextAttemptAt"]) {
  assert.match(outboxRecord, new RegExp(`\\b${field}:`), `Missing durable outbox field: ${field}`);
}
assert.match(outboxRecord, /transport: usesV2 \? "v2" : "v1-rollout-fallback"/);

const outboxPersistence = sourceBetween("async function persistFlashcardOutboxMutation", "async function listFlashcardOutboxMutations");
assert.match(outboxPersistence, /store\.getAll\(\)/);
assert.match(outboxPersistence, /createCoalescedFlashcardOutboxMutation/);
assert.match(outboxPersistence, /store\.add\(persistedRecord\)/);
assert.match(outboxPersistence, /get\(persistedRecord\.mutationId\)/);
assert.match(outboxPersistence, /verified\.owner !== record\.owner/);
assert.match(outboxPersistence, /supersededRows\.some\(Boolean\)/);

const atomicSupersession = extractFunction("supersedeFlashcardOutboxMutation");
assert.match(atomicSupersession, /store\.get\(previousMutationId\)/);
assert.match(atomicSupersession, /if \(!previousRecord\)/);
assert.match(atomicSupersession, /return null/);
assert.ok(
  atomicSupersession.indexOf("store.get(previousMutationId)")
    < atomicSupersession.indexOf("store.add(replacement)"),
  "A cross-tab supersession must claim the old row before adding a replacement"
);
assert.ok(
  atomicSupersession.indexOf("store.add(replacement)")
    < atomicSupersession.indexOf("store.delete(previousMutationId)"),
  "Replacement creation and old-row deletion must remain in one ordered transaction"
);
assert.match(atomicSupersession, /previousLogicalId !== replacement\.logicalMutationId/);

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

const progressRebaseRuntime = vm.runInNewContext(`(() => {
  ${extractFunction("cloneFlashcardSyncPayload")}
  ${extractFunction("flashcardJsonEqual")}
  ${extractFunction("isPlainFlashcardStateObject")}
  ${extractFunction("flashcardProgressAttemptId")}
  ${extractFunction("flashcardProgressNumber")}
  ${extractFunction("flashcardProgressSnapshotStrength")}
  ${extractFunction("compareFlashcardProgressSnapshotStrength")}
  ${extractFunction("mergeFlashcardProgressMap")}
  ${extractFunction("mergeFlashcardProgressEntry")}
  ${extractFunction("rebaseFlashcardProgressState")}
  return rebaseFlashcardProgressState;
})()`);
const progressKey = "Hayley::dse";
const baseProgressEntry = {
  attemptId: "attempt-a",
  roundNumber: 1,
  roundQueue: [0, 1, 2],
  initialQueue: [0, 1, 2],
  currentPosition: 0,
  answers: { 0: "red" },
  outcomes: { 0: "red" },
  outcomeTimes: { 0: 100 },
  cardAttemptCounts: { 0: 1 },
  elapsedMs: 1000,
  startedAt: 10,
  savedAt: 100
};
const localProgressEntry = {
  ...baseProgressEntry,
  roundNumber: 2,
  roundQueue: [0],
  currentPosition: 0,
  answers: { 0: "green" },
  outcomes: { 0: "green" },
  outcomeTimes: { 0: 300 },
  cardAttemptCounts: { 0: 2 },
  elapsedMs: 3000,
  savedAt: 300
};
const serverProgressEntry = {
  ...baseProgressEntry,
  currentPosition: 2,
  answers: { 0: "red", 2: "green" },
  outcomes: { 0: "red", 2: "green" },
  outcomeTimes: { 0: 200, 2: 250 },
  cardAttemptCounts: { 0: 1, 2: 1 },
  elapsedMs: 2500,
  savedAt: 250
};
const mergedProgress = progressRebaseRuntime(
  { [progressKey]: baseProgressEntry },
  { [progressKey]: localProgressEntry },
  { [progressKey]: serverProgressEntry }
);
assert.equal(mergedProgress.safe, true, "The same practice attempt must recover monotonically");
assert.equal(mergedProgress.value[progressKey].roundNumber, 2);
assert.deepEqual({ ...mergedProgress.value[progressKey].answers }, { 0: "green" }, "A newer round must not inherit stale answers from the previous round");
assert.deepEqual({ ...mergedProgress.value[progressKey].outcomes }, { 0: "green", 2: "green" });
assert.deepEqual({ ...mergedProgress.value[progressKey].cardAttemptCounts }, { 0: 2, 2: 1 });
assert.equal(mergedProgress.value[progressKey].elapsedMs, 3000);
assert.equal(progressRebaseRuntime(
  { [progressKey]: baseProgressEntry },
  { [progressKey]: { ...localProgressEntry, attemptId: "attempt-local" } },
  { [progressKey]: { ...serverProgressEntry, attemptId: "attempt-server" } }
).safe, false, "Different attempt IDs must remain quarantined");
assert.equal(progressRebaseRuntime(
  { [progressKey]: baseProgressEntry },
  {},
  { [progressKey]: serverProgressEntry }
).safe, false, "Completion/deletion racing with an edit must remain quarantined");

const coalesceRuntime = vm.runInNewContext(`(() => {
  const ATTEMPTS_KEY = "attempts";
  const PROGRESS_KEY = "edmundFlashcardProgress";
  const supabaseState = { v2Availability: "available" };
  let uuidSequence = 0;
  const window = { crypto: { randomUUID: () => {
    uuidSequence += 1;
    return \`ffffffff-ffff-4fff-8fff-\${String(uuidSequence).padStart(12, "0")}\`;
  } } };
  ${extractFunction("normalizedLegacyOwnerName")}
  ${extractFunction("cloneFlashcardSyncPayload")}
  ${extractFunction("flashcardJsonEqual")}
  ${extractFunction("isPlainFlashcardStateObject")}
  ${extractFunction("rebaseFlashcardGenericState")}
  ${extractFunction("flashcardProgressAttemptId")}
  ${extractFunction("flashcardProgressNumber")}
  ${extractFunction("flashcardProgressSnapshotStrength")}
  ${extractFunction("compareFlashcardProgressSnapshotStrength")}
  ${extractFunction("mergeFlashcardProgressMap")}
  ${extractFunction("mergeFlashcardProgressEntry")}
  ${extractFunction("rebaseFlashcardProgressState")}
  ${extractFunction("flashcardAttemptIdentity")}
  ${extractFunction("flashcardAttemptStrength")}
  ${extractFunction("compareFlashcardAttemptStrength")}
  ${extractFunction("mergeFlashcardAttempts")}
  ${extractFunction("attemptsForBackup")}
  ${extractFunction("flashcardOutboxMutationId")}
  ${extractFunction("flashcardOutboxRecordRequiresResolution")}
  ${extractFunction("flashcardOutboxLogicalMutationIds")}
  ${extractFunction("flashcardAttemptsPayloadBelongsToRecord")}
  ${extractFunction("reconcileFlashcardStateMutation")}
  ${extractFunction("createCoalescedFlashcardOutboxMutation")}
  return createCoalescedFlashcardOutboxMutation;
})()`);

function queuedRecord(index, key, payload, baseValue = []) {
  const mutationId = `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`;
  return {
    mutationId,
    logicalMutationId: mutationId,
    logicalMutationIds: [mutationId],
    owner: "student:id::hayley",
    transportType: "student",
    studentId: "id",
    studentName: "Hayley",
    key,
    payload,
    baseValue,
    expectedVersion: 4,
    baseChecksum: "v4",
    order: index,
    createdAt: index,
    status: "queued"
  };
}

const attemptBacklog = Array.from({ length: 195 }, (_, index) => queuedRecord(
  index + 1,
  "attempts",
  [{ id: `local-${index + 1}`, studentName: "Hayley", answeredCount: index + 1 }]
));
const coalescedBacklog = coalesceRuntime(
  attemptBacklog,
  [{ id: "server", studentName: "Hayley", answeredCount: 5 }],
  9,
  "canonical-v9"
);
assert.ok(coalescedBacklog, "A 195-row attempts backlog must be coalesced safely");
assert.equal(coalescedBacklog.payload.length, 196, "Coalescing must retain every local attempt and the server attempt");
assert.equal(coalescedBacklog.logicalMutationIds.length, 195, "Every logical save must remain traceable after coalescing");
assert.equal(coalescedBacklog.expectedVersion, 9);
assert.equal(coalescedBacklog.baseChecksum, "canonical-v9");
assert.ok(!attemptBacklog.some(record => record.mutationId === coalescedBacklog.mutationId));

const genericChain = coalesceRuntime([
  queuedRecord(201, "progress", { local: 2, external: 1 }, { local: 1, external: 1 }),
  queuedRecord(202, "progress", { local: 2, external: 3 }, { local: 2, external: 1 })
], { local: 1, external: 1 }, 4, "progress-v4");
assert.deepEqual({ ...genericChain.payload }, { local: 2, external: 3 });
assert.equal(coalesceRuntime([
  queuedRecord(203, "progress", { value: 2 }, { value: 1 }),
  queuedRecord(204, "progress", { value: 3 }, { value: 1 })
], { value: 1 }, 4, "progress-v4"), null, "Overlapping generic snapshots must not be coalesced");
assert.equal(coalesceRuntime([
  queuedRecord(205, "attempts", [{ id: "a", studentName: "Hayley" }]),
  queuedRecord(206, "progress", { value: 2 }, { value: 1 })
], [], 4, "mixed-v4"), null, "Different state keys must never be coalesced together");

const terminalRecoveryRuntime = vm.runInNewContext(`(() => {
  const ATTEMPTS_KEY = "attempts";
  const PROGRESS_KEY = "edmundFlashcardProgress";
  const FLASHCARD_TERMINAL_RECOVERY_CODES = new Set(["version_conflict", "request_id_reuse"]);
  const supabaseState = { v2Availability: "available" };
  let uuidSequence = 0;
  const window = { crypto: { randomUUID: () => {
    uuidSequence += 1;
    return \`eeeeeeee-eeee-4eee-8eee-\${String(uuidSequence).padStart(12, "0")}\`;
  } } };
  const flashcardStateVersions = new Map([[ATTEMPTS_KEY, 11], ["progress", 7], [PROGRESS_KEY, 8]]);
  const flashcardStateChecksums = new Map([[ATTEMPTS_KEY, "attempts-v11"], ["progress", "progress-v7"], [PROGRESS_KEY, "saved-progress-v8"]]);
  const flashcardCanonicalValues = new Map([
    [ATTEMPTS_KEY, [{ id: "server", studentName: "Hayley", answeredCount: 5 }]],
    ["progress", { local: 1, external: 2 }],
    [PROGRESS_KEY, { [${JSON.stringify("Hayley::dse")}]: ${JSON.stringify(serverProgressEntry)} }]
  ]);
  ${extractFunction("cloneFlashcardSyncPayload")}
  ${extractFunction("flashcardIntegrityError")}
  ${extractFunction("flashcardStateVersion")}
  ${extractFunction("flashcardStateChecksum")}
  ${extractFunction("flashcardCanonicalValue")}
  ${extractFunction("flashcardJsonEqual")}
  ${extractFunction("isPlainFlashcardStateObject")}
  ${extractFunction("rebaseFlashcardGenericState")}
  ${extractFunction("flashcardProgressAttemptId")}
  ${extractFunction("flashcardProgressNumber")}
  ${extractFunction("flashcardProgressSnapshotStrength")}
  ${extractFunction("compareFlashcardProgressSnapshotStrength")}
  ${extractFunction("mergeFlashcardProgressMap")}
  ${extractFunction("mergeFlashcardProgressEntry")}
  ${extractFunction("rebaseFlashcardProgressState")}
  ${extractFunction("flashcardAttemptIdentity")}
  ${extractFunction("flashcardAttemptStrength")}
  ${extractFunction("compareFlashcardAttemptStrength")}
  ${extractFunction("mergeFlashcardAttempts")}
  ${extractFunction("attemptsForBackup")}
  ${extractFunction("flashcardOutboxMutationId")}
  ${extractFunction("flashcardOutboxRecordRequiresResolution")}
  ${extractFunction("flashcardOutboxLogicalMutationIds")}
  ${extractFunction("flashcardAttemptsPayloadBelongsToRecord")}
  ${extractFunction("reconcileFlashcardStateMutation")}
  ${extractFunction("createFastForwardedFlashcardOutboxMutation")}
  ${extractFunction("flashcardTerminalRecoveryCode")}
  ${extractFunction("createRecoveredFlashcardOutboxMutation")}
  return createRecoveredFlashcardOutboxMutation;
})()`);
const oldTerminalAttempt = queuedRecord(
  301,
  "attempts",
  [{ id: "local", studentName: "Hayley", answeredCount: 8 }]
);
oldTerminalAttempt.status = "rejected";
oldTerminalAttempt.requiresResolution = true;
oldTerminalAttempt.receipt = { status: "rejected", code: "request_id_reuse" };
const recoveredAttempt = terminalRecoveryRuntime(oldTerminalAttempt);
assert.ok(recoveredAttempt);
assert.notEqual(recoveredAttempt.mutationId, oldTerminalAttempt.mutationId, "Terminal recovery must always use a fresh request ID");
assert.deepEqual([...recoveredAttempt.payload.map(row => row.id)], ["server", "local"]);
assert.equal(recoveredAttempt.status, "queued");
assert.equal(recoveredAttempt.recoveredFromTerminalCode, "request_id_reuse");

const disjointTerminal = queuedRecord(
  302,
  "progress",
  { local: 2, external: 1 },
  { local: 1, external: 1 }
);
disjointTerminal.status = "conflict";
disjointTerminal.requiresResolution = true;
disjointTerminal.receipt = { status: "conflict", code: "version_conflict" };
assert.deepEqual({ ...terminalRecoveryRuntime(disjointTerminal).payload }, { local: 2, external: 2 });

const sameAttemptProgressTerminal = queuedRecord(
  304,
  "edmundFlashcardProgress",
  { [progressKey]: localProgressEntry },
  { [progressKey]: baseProgressEntry }
);
sameAttemptProgressTerminal.status = "conflict";
sameAttemptProgressTerminal.requiresResolution = true;
sameAttemptProgressTerminal.receipt = { status: "conflict", code: "version_conflict" };
const recoveredProgress = terminalRecoveryRuntime(sameAttemptProgressTerminal);
assert.ok(recoveredProgress, "A same-attempt progress conflict should recover under a fresh request ID");
assert.notEqual(recoveredProgress.mutationId, sameAttemptProgressTerminal.mutationId);
assert.equal(recoveredProgress.payload[progressKey].roundNumber, 2);
assert.deepEqual({ ...recoveredProgress.payload[progressKey].outcomes }, { 0: "green", 2: "green" });

const overlappingTerminal = {
  ...disjointTerminal,
  mutationId: "00000000-0000-4000-8000-000000000303",
  logicalMutationId: "00000000-0000-4000-8000-000000000303",
  logicalMutationIds: ["00000000-0000-4000-8000-000000000303"],
  payload: { local: 1, external: 3 },
  baseValue: { local: 1, external: 1 }
};
assert.equal(terminalRecoveryRuntime(overlappingTerminal), null, "A true generic overlap must stay quarantined");
assert.equal(terminalRecoveryRuntime({
  ...oldTerminalAttempt,
  receipt: { status: "rejected", code: "invalid_request" }
}), null, "Validation/auth-style rejections must not be auto-recovered");

const queuedFastForwardRuntime = vm.runInNewContext(`(() => {
  const ATTEMPTS_KEY = "attempts";
  const PROGRESS_KEY = "edmundFlashcardProgress";
  const supabaseState = { v2Availability: "available" };
  const window = { crypto: { randomUUID: () => "ffffffff-ffff-4fff-8fff-ffffffffffff" } };
  const flashcardStateVersions = new Map([[ATTEMPTS_KEY, 5], ["progress", 8], ["overlap", 8]]);
  const flashcardStateChecksums = new Map([[ATTEMPTS_KEY, "attempts-v5"], ["progress", "progress-v8"], ["overlap", "overlap-v8"]]);
  const flashcardCanonicalValues = new Map([
    [ATTEMPTS_KEY, [{ id: "a", studentName: "Hayley", answeredCount: 1 }]],
    ["progress", { local: 1, external: 2 }],
    ["overlap", { local: 2, external: 1 }]
  ]);
  ${extractFunction("cloneFlashcardSyncPayload")}
  ${extractFunction("flashcardIntegrityError")}
  ${extractFunction("flashcardStateVersion")}
  ${extractFunction("flashcardStateChecksum")}
  ${extractFunction("flashcardCanonicalValue")}
  ${extractFunction("flashcardJsonEqual")}
  ${extractFunction("isPlainFlashcardStateObject")}
  ${extractFunction("rebaseFlashcardGenericState")}
  ${extractFunction("flashcardProgressAttemptId")}
  ${extractFunction("flashcardProgressNumber")}
  ${extractFunction("flashcardProgressSnapshotStrength")}
  ${extractFunction("compareFlashcardProgressSnapshotStrength")}
  ${extractFunction("mergeFlashcardProgressMap")}
  ${extractFunction("mergeFlashcardProgressEntry")}
  ${extractFunction("rebaseFlashcardProgressState")}
  ${extractFunction("flashcardAttemptIdentity")}
  ${extractFunction("flashcardAttemptStrength")}
  ${extractFunction("compareFlashcardAttemptStrength")}
  ${extractFunction("mergeFlashcardAttempts")}
  ${extractFunction("attemptsForBackup")}
  ${extractFunction("flashcardAttemptsPayloadBelongsToRecord")}
  ${extractFunction("reconcileFlashcardStateMutation")}
  ${extractFunction("flashcardOutboxMutationId")}
  ${extractFunction("createFastForwardedFlashcardOutboxMutation")}
  ${extractFunction("prepareFlashcardOutboxRecordForV2")}
  return prepareFlashcardOutboxRecordForV2;
})()`);
const fastForwardedAttempts = queuedFastForwardRuntime({
  mutationId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  logicalMutationId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  studentId: "id",
  studentName: "Hayley",
  key: "attempts",
  expectedVersion: 4,
  baseChecksum: "attempts-v4",
  status: "retry",
  retries: 3,
  lastAttemptAt: 100,
  lastError: "response lost",
  baseValue: [],
  payload: [
    { id: "a", studentName: "Hayley", answeredCount: 1 },
    { id: "b", studentName: "Hayley", answeredCount: 1 }
  ]
});
assert.equal(fastForwardedAttempts.expectedVersion, 5);
assert.equal(fastForwardedAttempts.baseChecksum, "attempts-v5");
assert.notEqual(fastForwardedAttempts.mutationId, "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
assert.equal(fastForwardedAttempts.logicalMutationId, "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
assert.equal(fastForwardedAttempts.supersedesMutationId, "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
assert.equal(fastForwardedAttempts.status, "queued");
assert.equal(fastForwardedAttempts.retries, 0);
assert.equal(fastForwardedAttempts.lastAttemptAt, 0);
assert.equal(fastForwardedAttempts.lastError, "");
assert.equal(fastForwardedAttempts.receipt, null);
assert.deepEqual([...fastForwardedAttempts.payload.map(row => row.id)], ["a", "b"]);
const fastForwardedProgress = queuedFastForwardRuntime({
  mutationId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  key: "progress",
  expectedVersion: 7,
  baseChecksum: "progress-v7",
  baseValue: { local: 1, external: 1 },
  payload: { local: 2, external: 1 }
});
assert.equal(fastForwardedProgress.expectedVersion, 8);
assert.deepEqual({ ...fastForwardedProgress.payload }, { local: 2, external: 2 });
assert.throws(() => queuedFastForwardRuntime({
  mutationId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  key: "overlap",
  expectedVersion: 7,
  baseChecksum: "overlap-v7",
  baseValue: { local: 1, external: 1 },
  payload: { local: 3, external: 1 }
}), /needs review/, "Overlapping queued/server edits must remain fail-closed");
assert.throws(() => queuedFastForwardRuntime({
  mutationId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
  key: "progress",
  expectedVersion: 9,
  baseChecksum: "progress-v9",
  baseValue: { local: 1, external: 2 },
  payload: { local: 2, external: 2 }
}), /ahead of the verified canonical version/);

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
assert.match(drain, /flashcardOutboxTerminalBlocksAccount\(originalRecord\)/);
assert.match(drain, /if \(globalBlock\) break;\s*continue;/);
assert.match(drain, /outboxBlockedKeys\.has\(originalRecord\.key\)/);
assert.ok(
  drain.indexOf("isFlashcardAuthenticationError(error)")
    < drain.indexOf('status: "retry"'),
  "Authentication failures must be quarantined instead of entering the automatic retry loop"
);
assert.ok(
  drain.indexOf("supersedeFlashcardOutboxMutation(")
    < drain.indexOf("sendFlashcardOutboxMutation(record, context)"),
  "A locally fast-forwarded request must be atomically superseded under a fresh ID before transport"
);
assert.match(drain, /record = persistedReplacement/);
assert.doesNotMatch(
  drain,
  /record = prepareFlashcardOutboxRecordForV2\(originalRecord\)/,
  "An unpersisted replacement must not become the record later written by the integrity-error handler"
);

const wakeups = sourceBetween("function setupFlashcardOutboxWakeups", "async function requestFlashcardDurableStorage");
assert.match(wakeups, /addEventListener\("online"/);
assert.match(wakeups, /addEventListener\("focus"/);
assert.match(wakeups, /visibilitychange/);

const statusGuard = sourceBetween("function protectedFlashcardSyncStatus", "function updateSupabaseStatus");
assert.match(statusGuard, /待同步/);
assert.match(statusGuard, /離線/);
assert.match(statusGuard, /最後同步/);
assert.match(statusGuard, /系統已切換為唯讀/);
assert.match(statusGuard, /同步衝突需處理/);
assert.match(statusGuard, /請按「安全復原」/);
assert.match(statusGuard, /系統將自動重試/);
assert.match(statusGuard, /暫存進度同步已隔離/);
assert.doesNotMatch(statusGuard, /同步未完成 · \$\{pending\} 項變更將自動重試/);

const outboxStatusSummaryRuntime = vm.runInNewContext(`(() => {
  const PROGRESS_KEY = "edmundFlashcardProgress";
  const FLASHCARD_TERMINAL_RECOVERY_CODES = new Set(["version_conflict", "request_id_reuse"]);
  ${extractFunction("flashcardOutboxRecordRequiresResolution")}
  ${extractFunction("flashcardOutboxTerminalScope")}
  ${extractFunction("flashcardOutboxTerminalBlocksAccount")}
  ${extractFunction("flashcardOutboxStatusSummary")}
  return flashcardOutboxStatusSummary;
})()`);
assert.equal(outboxStatusSummaryRuntime([
  { status: "rejected", requiresResolution: true, lastError: "review" },
  { status: "retry", lastError: "offline" }
]).errorClass, "terminal", "Terminal recovery must never be mislabeled as an automatic retry");
assert.equal(outboxStatusSummaryRuntime([
  { status: "retry", lastError: "offline" }
]).errorClass, "retryable");
const isolatedProgressSummary = outboxStatusSummaryRuntime([
  {
    key: "edmundFlashcardProgress",
    status: "conflict",
    requiresResolution: true,
    receipt: { status: "conflict", code: "version_conflict" },
    lastError: "different attempt"
  },
  { key: "attempts", status: "queued" }
]);
assert.equal(isolatedProgressSummary.globalBlock, false, "An unresolved progress key must not freeze unrelated attempt synchronization");
assert.deepEqual([...isolatedProgressSummary.blockedKeys], ["edmundFlashcardProgress"]);
assert.equal(outboxStatusSummaryRuntime([
  {
    key: "edmundFlashcardProgress",
    status: "rejected",
    requiresResolution: true,
    receipt: { status: "rejected", code: "invalid_request" }
  }
]).globalBlock, true, "Validation/auth-style terminal failures must remain account-wide fail-closed");
assert.equal(outboxStatusSummaryRuntime([
  { key: "attempts", status: "conflict", requiresResolution: true, receipt: { code: "version_conflict" } }
]).globalBlock, true, "A critical attempts conflict must remain account-wide fail-closed");

const enqueueOutbox = sourceBetween("function enqueueFlashcardOutboxMutation", "function setupFlashcardOutboxWakeups");
assert.match(enqueueOutbox, /supabaseState\.outboxPersisting \+= 1/);
assert.match(enqueueOutbox, /await persistFlashcardOutboxMutation\(record\)/);
assert.match(enqueueOutbox, /supabaseState\.phase = FLASHCARD_SYNC_PHASES\.DEGRADED_READ_ONLY/);
assert.ok(
  enqueueOutbox.indexOf("supabaseState.outboxPersisting += 1") < enqueueOutbox.indexOf("await persistFlashcardOutboxMutation(record)"),
  "Ignored async call sites must immediately expose a pending state before IndexedDB persistence completes"
);

const directSave = sourceBetween("async function saveSupabaseState", "function displayPreferenceOwner");
assert.match(directSave, /!flashcardMutationAllowed\(context, key\)/);
assert.match(directSave, /isSupabaseStateContextCurrent\(context\)/);
assert.match(directSave, /enqueueFlashcardOutboxMutation\(mutation\)/);
assert.doesNotMatch(directSave, /supabaseClient\.rpc/);

const hydration = sourceBetween("async function loadStudentStateFromSupabase", "async function saveStudentAccessToSupabase");
assert.match(hydration, /const requestContext = captureSupabaseStateSaveContext\(\)/);
assert.match(hydration, /isSupabaseStateContextCurrent\(requestContext\)/);
assert.match(hydration, /callFlashcardStateReadForHydration\(requestContext\)/);
assert.match(hydration, /setFlashcardStateMetadata/);
assert.match(hydration, /mergeFlashcardAttempts\(remoteAttempts, accountBackup\)/);
assert.match(hydration, /await prepareFlashcardOutboxForHydration\(requestContext\)/);
assert.match(hydration, /supabaseState\.hydratedOwner = requestContext\.owner/);
assert.match(hydration, /pendingOutboxRows\.some\(flashcardOutboxTerminalBlocksAccount\)/);
assert.ok(
  hydration.includes("pendingOutboxRows.some(flashcardOutboxRecordRequiresResolution)")
    || hydration.includes('outboxErrorClass === "terminal"'),
  "Hydration must detect terminal rows that still need a visible warning"
);
assert.match(
  hydration,
  /protectedFlashcardSyncStatus\(\)/,
  "An isolated terminal row must remain visible even when it does not block the whole account"
);

const hydrationPreparation = extractFunction("prepareFlashcardOutboxForHydration");
assert.ok(
  hydrationPreparation.indexOf("recoverFlashcardTerminalOutboxRows")
    < hydrationPreparation.indexOf("coalesceFlashcardOutboxForContext"),
  "Allowlisted terminal rows must be recovered before the backlog is coalesced"
);
assert.ok(
  hydrationPreparation.indexOf("coalesceFlashcardOutboxForContext")
    < hydrationPreparation.indexOf("overlayFlashcardOutboxForContext"),
  "Hydration must overlay the final durable queue, not stale pre-recovery rows"
);

const terminalRecovery = extractFunction("createRecoveredFlashcardOutboxMutation");
assert.match(terminalRecovery, /flashcardTerminalRecoveryCode/);
assert.match(terminalRecovery, /reconcileFlashcardStateMutation\(record, canonicalValue\)/);
assert.match(terminalRecovery, /replacement\.mutationId === record\.mutationId/);

const hydrationRetryRuntime = vm.runInNewContext(`(() => {
  const FLASHCARD_HYDRATION_READ_ATTEMPTS = 3;
  const FLASHCARD_HYDRATION_RETRY_BASE_MS = 400;
  const FLASHCARD_HYDRATION_RETRY_CAP_MS = 1600;
  const supabaseState = { outboxErrorClass: "", outboxLastError: "" };
  const window = { setTimeout: (callback) => { callback(); return 1; } };
  let mode = "";
  let calls = 0;
  const updateSupabaseStatus = () => undefined;
  const isSupabaseStateContextCurrent = () => true;
  async function callFlashcardStateReadV2() {
    calls += 1;
    if ((mode === "transient" && calls < 3) || mode === "always-transient") {
      const error = new TypeError("Failed to fetch");
      throw error;
    }
    if (mode === "auth") throw { status: 401, message: "session token expired" };
    return { rows: [], transport: "v2" };
  }
  ${extractFunction("flashcardIntegrityError")}
  ${extractFunction("isFlashcardIntegrityError")}
  ${extractFunction("isFlashcardAuthenticationError")}
  ${extractFunction("isTransientFlashcardStateReadError")}
  ${extractFunction("flashcardHydrationRetryDelay")}
  ${extractFunction("callFlashcardStateReadForHydration").replace(/^function /, "async function ")}
  return async requestedMode => {
    mode = requestedMode;
    calls = 0;
    supabaseState.outboxErrorClass = "";
    supabaseState.outboxLastError = "";
    try {
      await callFlashcardStateReadForHydration({ owner: "student:id::hayley" });
      return { ok: true, calls, errorClass: supabaseState.outboxErrorClass };
    } catch {
      return { ok: false, calls, errorClass: supabaseState.outboxErrorClass };
    }
  };
})()`);
assert.deepEqual(
  { ...(await hydrationRetryRuntime("transient")) },
  { ok: true, calls: 3, errorClass: "" },
  "A transient hydration read should succeed within the bounded three-attempt budget"
);
assert.deepEqual(
  { ...(await hydrationRetryRuntime("auth")) },
  { ok: false, calls: 1, errorClass: "hydration-auth" },
  "Authentication failures must not be retried as transient network failures"
);
assert.deepEqual(
  { ...(await hydrationRetryRuntime("always-transient")) },
  { ok: false, calls: 3, errorClass: "hydration-transient" },
  "Hydration retries must stop after the bounded three-attempt budget"
);

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

const mutationGate = extractFunction("flashcardMutationAllowed");
assert.match(mutationGate, /outboxBlockedKeys\.has\(String\(key\)\)/);
assert.ok(
  mutationGate.indexOf("outboxBlockedKeys.has(String(key))")
    < mutationGate.indexOf('currentUser?.role === "admin"'),
  "A quarantined key must remain blocked even during admin impersonation"
);

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
