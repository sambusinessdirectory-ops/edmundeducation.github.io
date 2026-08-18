import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(toolsDir, "..");
const source = readFileSync(path.join(siteDir, "flashcards.html"), "utf8");

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

// The terminal state must expose a real recovery control, a stable support
// reference, and instructions that explicitly say waiting is not a remedy.
for (const selector of [
  "data-flashcard-recovery-panel",
  "data-flashcard-recovery-action",
  "data-flashcard-recovery-code",
  "data-flashcard-recovery-download"
]) {
  assert.ok(source.includes(selector), `Missing actionable recovery UI: ${selector}`);
}
assert.ok(
  /(?:等待|等候)[^。；]{0,24}(?:不會|不能|無法)[^。；]{0,24}(?:復原|解決|重試|完成|解除)/.test(source),
  "Recovery copy must tell students that waiting will not resolve a terminal conflict"
);
assert.ok(
  /(?:請勿|不要)清除瀏覽器資料/.test(source),
  "Recovery copy must tell students not to clear browser data"
);

const renderRecoveryPanel = extractFunction("renderFlashcardRecoveryPanel");
assert.match(renderRecoveryPanel, /data-flashcard-recovery-panel/);
assert.match(renderRecoveryPanel, /data-flashcard-recovery-code/);
assert.match(renderRecoveryPanel, /outboxErrorClass|flashcardOutboxRecordRequiresResolution/);

// A click must call the bounded recovery orchestrator. Merely rendering a
// button without binding it recreates the student-facing dead end.
const eventSetup = extractFunction("setupEvents");
assert.ok(
  /querySelector\("\[data-flashcard-recovery-action\]"\)\?\.addEventListener\("click",[\s\S]{0,300}runFlashcardTerminalRecovery\(\{\s*automatic:\s*false\s*\}\)/.test(eventSetup)
    || /closest\("\[data-flashcard-recovery-action\]"\)[\s\S]{0,300}runFlashcardTerminalRecovery\(\{\s*automatic:\s*false\s*\}\)/.test(eventSetup),
  "The recovery button must bind directly or through delegated click handling"
);
assert.match(
  eventSetup,
  /closest\("\[data-flashcard-recovery-download\]"\)[\s\S]{0,160}downloadFlashcardRecoveryCopy\(\)/
);

const sanitizeRecoveryExport = vm.runInNewContext(`(() => {
  ${extractFunction("sanitizeFlashcardRecoveryExportValue")}
  return sanitizeFlashcardRecoveryExportValue;
})()`);
const sensitiveRecoveryPayload = {
  answer: "kept",
  owner: "student:id::hayley",
  studentName: "Hayley",
  session_token: "secret-token",
  profile: {
    email: "student@example.test",
    password: "secret-password",
    progress: { completed: 12 }
  },
  rows: [{ user_id: "private-id", cardId: "card-7" }]
};
const sanitizedRecoveryPayload = JSON.parse(JSON.stringify(
  sanitizeRecoveryExport(sensitiveRecoveryPayload)
));
assert.deepEqual(sanitizedRecoveryPayload, {
  answer: "kept",
  profile: { progress: { completed: 12 } },
  rows: [{ cardId: "card-7" }]
});

const recoveryDownload = extractFunction("downloadFlashcardRecoveryCopy");
assert.match(recoveryDownload, /flashcardOutboxOwnerMatches\(record, context\)/);
assert.match(recoveryDownload, /flashcardOutboxRecordRequiresResolution\(record\)/);
for (const field of ["payload", "baseValue", "canonicalValue"]) {
  assert.match(
    recoveryDownload,
    new RegExp(`${field}: sanitizeFlashcardRecoveryExportValue\\(record\\.${field}\\)`),
    `Recovery download must sanitize ${field}`
  );
}
assert.match(recoveryDownload, /new Blob/);
assert.doesNotMatch(
  recoveryDownload,
  /deleteFlashcardOutboxMutation|supersedeFlashcardOutboxMutation|updateFlashcardOutboxMutation|persistFlashcardOutboxMutation|localStorage\.clear|indexedDB\.deleteDatabase|callSupabaseRpc/,
  "Downloading a recovery copy must be read-only"
);

const recovery = extractFunction("runFlashcardTerminalRecovery");
const automaticRecovery = extractFunction("scheduleFlashcardAutomaticTerminalRecovery");

// Recovery must be single-flight and automatic recovery must be one-shot;
// terminal conflicts must not become an unbounded retry loop.
assert.match(recovery, /flashcardTerminalRecoveryInFlight|flashcardTerminalRecoveryPromise/);
assert.match(recovery, /finally/);
assert.match(automaticRecovery, /flashcardAutomaticRecoveryAttemptedOwners/);
assert.doesNotMatch(automaticRecovery, /setInterval/);
assert.doesNotMatch(recovery, /while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;/);

// The recovery attempt must first refresh canonical state, then supersede safe
// terminal rows and drain their fresh mutation IDs. It must never manufacture
// a merge from a stale browser snapshot.
assert.match(recovery, /loadStudentStateFromSupabase|callFlashcardStateReadForHydration|callFlashcardStateReadV2/);
assert.match(recovery, /recoverFlashcardTerminalOutboxRows/);
assert.match(recovery, /drainFlashcardOutbox/);
assert.ok(
  Math.max(
    recovery.indexOf("loadStudentStateFromSupabase"),
    recovery.indexOf("callFlashcardStateReadForHydration"),
    recovery.indexOf("callFlashcardStateReadV2")
  ) < recovery.indexOf("recoverFlashcardTerminalOutboxRows"),
  "Recovery must load canonical state before rebasing a quarantined mutation"
);

const recoveredMutation = extractFunction("createRecoveredFlashcardOutboxMutation");
assert.match(recoveredMutation, /replacement\.mutationId === record\.mutationId/);
assert.match(recoveredMutation, /reconcileFlashcardStateMutation\(record, canonicalValue\)/);
assert.match(recoveredMutation, /if \(!reconciliation\.safe\) return null/);

const terminalCode = extractFunction("flashcardTerminalRecoveryCode");
assert.match(terminalCode, /FLASHCARD_TERMINAL_RECOVERY_CODES\.has\(code\)/);
assert.match(terminalCode, /version_conflict/);
assert.match(terminalCode, /request_id_reuse/);

const terminalCodeRuntime = vm.runInNewContext(`(() => {
  const FLASHCARD_TERMINAL_RECOVERY_CODES = new Set(["version_conflict", "request_id_reuse"]);
  ${extractFunction("flashcardOutboxRecordRequiresResolution")}
  ${terminalCode}
  return flashcardTerminalRecoveryCode;
})()`);
assert.equal(terminalCodeRuntime({
  status: "conflict",
  requiresResolution: true,
  receipt: { status: "conflict", code: "version_conflict" }
}), "version_conflict");
assert.equal(terminalCodeRuntime({
  status: "rejected",
  requiresResolution: true,
  receipt: { status: "rejected", code: "request_id_reuse" }
}), "request_id_reuse");
for (const code of ["authentication_failed", "invalid_request", "validation_failed", "checksum_mismatch"]) {
  assert.equal(
    terminalCodeRuntime({
      status: "rejected",
      requiresResolution: true,
      receipt: { status: "rejected", code }
    }),
    "",
    `${code} must remain quarantined for review instead of being auto-replayed`
  );
}

const terminalRows = extractFunction("recoverFlashcardTerminalOutboxRows");
assert.match(terminalRows, /supersedeFlashcardOutboxMutation/);
assert.doesNotMatch(terminalRows, /deleteFlashcardOutboxMutation/);
const terminalRowsAsync = terminalRows.replace(/^function /, "async function ");

const recoveredRows = [];
const recoveryLoopRuntime = vm.runInNewContext(`(() => {
  const recoveredRows = globalThis.recoveredRows;
  const flashcardOutboxRowsForContext = async () => [];
  const flashcardOutboxOwnerMatches = (record, context) => record.owner === context.owner;
  const createRecoveredFlashcardOutboxMutation = record => (
    record.kind === "safe"
      ? { ...record, mutationId: \`fresh-\${record.mutationId}\` }
      : null
  );
  const supersedeFlashcardOutboxMutation = async (previousMutationId, replacement) => {
    recoveredRows.push({ previousMutationId, replacement });
    return replacement;
  };
  ${terminalRowsAsync}
  return recoverFlashcardTerminalOutboxRows;
})()`, { recoveredRows });
await recoveryLoopRuntime(
  { owner: "student:hayley" },
  [
    { owner: "student:hayley", mutationId: "safe-1", kind: "safe" },
    { owner: "student:hayley", mutationId: "auth-1", kind: "auth" },
    { owner: "student:hayley", mutationId: "validation-1", kind: "validation" },
    { owner: "student:hayley", mutationId: "overlap-1", kind: "overlap" },
    { owner: "student:someone-else", mutationId: "other-owner-1", kind: "safe" }
  ]
);
assert.deepEqual(
  recoveredRows.map(({ previousMutationId, replacement }) => ({
    previousMutationId,
    replacementMutationId: replacement.mutationId
  })),
  [{ previousMutationId: "safe-1", replacementMutationId: "fresh-safe-1" }],
  "Only a safe, same-owner row may be superseded under a fresh mutation ID"
);

// Unsafe overlap, validation/auth failures, and unknown terminal records must
// stay quarantined. Neither the recovery orchestrator nor the UI may erase the
// IndexedDB evidence or advise students to erase it themselves.
for (const protectedSource of [recovery, terminalRows, renderRecoveryPanel]) {
  assert.doesNotMatch(protectedSource, /deleteFlashcardOutboxMutation/);
  assert.doesNotMatch(protectedSource, /localStorage\.clear|indexedDB\.deleteDatabase|caches\.delete/);
}
assert.doesNotMatch(
  renderRecoveryPanel,
  /(?:請|應|可以|先)清除瀏覽器資料/,
  "The recovery UI must never recommend clearing browser data"
);

// A successful repair is complete only after the durable queue is clean and
// the account has returned to its verified READY state. The status/banner must
// then be rendered again rather than leaving the stale red warning visible.
assert.match(recovery, /flashcardOutboxRowsForContext|refreshFlashcardOutboxStatus/);
assert.match(recovery, /FLASHCARD_SYNC_PHASES\.READY/);
assert.match(recovery, /outboxErrorClass/);
assert.match(recovery, /renderFlashcardRecoveryPanel/);
assert.match(recovery, /updateSupabaseStatus|refreshCurrentView/);
assert.match(recovery, /flashcardRecoveryUiState\.mode === "success"/);
assert.match(recovery, /flashcardRecoveryUiState = \{ mode: "idle", detail: "" \}/);
assert.ok(
  recovery.indexOf("if (!recovered)") < recovery.indexOf('showAppPanel("dashboard", false)'),
  "The student dashboard must not reopen until recovery has proved the account READY"
);

const readiness = sourceBetween("function requireFlashcardStateReady", "async function flushSupabaseStateSaves");
assert.match(readiness, /isSupabaseStateHydrated\(context\)/);
assert.match(readiness, /outboxErrorClass === "terminal"/);
assert.match(
  readiness,
  /(?:(?:等待|等候)[^。；]{0,24}(?:不會|不能|無法)|(?:不會|不能|無法)[^。；]{0,24}(?:等待|等候))/
);
assert.match(readiness, /(?:請勿|不要)清除瀏覽器資料/);

const login = extractFunction("login");
assert.match(login, /const stateLoaded = await loadStudentStateFromSupabase\(\)/);
assert.match(login, /stateLoaded && stateContext && isSupabaseStateHydrated\(stateContext\)/);
assert.ok(
  login.indexOf("isSupabaseStateHydrated(stateContext)") < login.indexOf('showAppPanel("dashboard", false)'),
  "Login must not open the dashboard before canonical hydration reaches READY"
);
assert.match(login, /outboxErrorClass === "terminal"/);
assert.match(login, /scheduleFlashcardAutomaticTerminalRecovery\(\)/);

console.log("Flashcard actionable conflict-recovery UI checks passed.");
