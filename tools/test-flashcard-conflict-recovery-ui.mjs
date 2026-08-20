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
const focusRecoveryAction = extractFunction("focusFlashcardRecoveryAction");
assert.match(renderRecoveryPanel, /data-flashcard-recovery-panel/);
assert.match(renderRecoveryPanel, /data-flashcard-recovery-code/);
assert.match(renderRecoveryPanel, /outboxErrorClass|flashcardOutboxRecordRequiresResolution/);
assert.match(renderRecoveryPanel, /focusFlashcardRecoveryAction\(panel\)/);
assert.doesNotMatch(
  focusRecoveryAction,
  /currentView !== "login"/,
  "Recovery remains available after accepted credentials reveal the dashboard"
);
assert.match(focusRecoveryAction, /requestAnimationFrame/);
assert.match(focusRecoveryAction, /prefers-reduced-motion: reduce/);
assert.match(focusRecoveryAction, /scrollIntoView/);
assert.match(focusRecoveryAction, /data-flashcard-recovery-action/);
assert.match(focusRecoveryAction, /focus\(\{ preventScroll: true \}\)/);
assert.doesNotMatch(source, /按上方「安全復原」/);

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
    new RegExp(`${field}: sanitizeFlashcardRecoveryStateValue\\(record\\.key, record\\.${field}\\)`),
    `Recovery download must sanitize ${field}`
  );
}
assert.match(recoveryDownload, /lastError: sanitizeFlashcardRecoveryDiagnosticText\(record\.lastError\)/);
assert.match(recoveryDownload, /recoveryClass: String\(record\.recoveryClass/);
assert.match(recoveryDownload, /new Blob/);
assert.doesNotMatch(
  recoveryDownload,
  /deleteFlashcardOutboxMutation|supersedeFlashcardOutboxMutation|updateFlashcardOutboxMutation|persistFlashcardOutboxMutation|localStorage\.clear|indexedDB\.deleteDatabase|callSupabaseRpc/,
  "Downloading a recovery copy must be read-only"
);

const sanitizeRecoveryState = vm.runInNewContext(`(() => {
  const PROGRESS_KEY = "edmundFlashcardProgress";
  const CARDS_KEY = "edmundFlashcardCards";
  const FAMILIARITY_KEY = "edmundFlashcardFamiliarity";
  const NOTES_KEY = "edmundFlashcardNotes";
  const BOOKMARKS_KEY = "edmundFlashcardBookmarks";
  const DASHBOARD_LAYOUT_KEY = "edmundFlashcardDashboardLayouts";
  ${extractFunction("sanitizeFlashcardRecoveryExportValue")}
  ${extractFunction("redactFlashcardRecoveryCustomDeckId")}
  ${extractFunction("sanitizeFlashcardRecoveryStructuralDeckIds")}
  ${extractFunction("sanitizeFlashcardRecoveryStateValue")}
  return sanitizeFlashcardRecoveryStateValue;
})()`);
assert.deepEqual(
  JSON.parse(JSON.stringify(sanitizeRecoveryState("edmundFlashcardProgress", {
    "Danny::deck-a": { savedAt: 1 },
    "Another Student::deck-b": { savedAt: 2 }
  }))),
  {
    "student::deck-a": { savedAt: 1 },
    "student::deck-b": { savedAt: 2 }
  },
  "Recovery exports must redact dynamic student-name prefixes from progress keys"
);
for (const stateKey of ["edmundFlashcardFamiliarity", "edmundFlashcardNotes"]) {
  assert.deepEqual(
    JSON.parse(JSON.stringify(sanitizeRecoveryState(stateKey, {
      "Danny::deck-a": { card: 1 },
      "Another Student::deck-b": { card: 2 }
    }))),
    {
      "student::deck-a": { card: 1 },
      "student::deck-b": { card: 2 }
    },
    `Recovery exports must redact owner prefixes for ${stateKey}`
  );
}
assert.deepEqual(
  JSON.parse(JSON.stringify(sanitizeRecoveryState("edmundFlashcardProgress", {
    "陳大文（中三）::deck-a": { savedAt: 1 },
    "Danny (S1)::deck-b": { savedAt: 2 }
  }))),
  {
    "student::deck-a": { savedAt: 1 },
    "student::deck-b": { savedAt: 2 }
  },
  "Recovery exports must redact Chinese and parenthesized owner prefixes"
);
assert.deepEqual(
  JSON.parse(JSON.stringify(sanitizeRecoveryState("edmundFlashcardProgress", {
    "陳大文（中三）::student-custom/2ex-2b9-2ff/my-deck": {
      deckId: "student-custom/2ex-2b9-2ff/my-deck",
      deckTitle: "保留這個學習內容"
    }
  }))),
  {
    "student::student-custom/student/my-deck": {
      deckId: "student-custom/student/my-deck",
      deckTitle: "保留這個學習內容"
    }
  },
  "Recovery exports must redact custom-deck owner slugs nested in progress keys and deckId fields"
);
for (const stateKey of ["edmundFlashcardBookmarks", "edmundFlashcardDashboardLayouts"]) {
  assert.deepEqual(
    JSON.parse(JSON.stringify(sanitizeRecoveryState(stateKey, {
      Danny: ["deck-a"],
      "Another Student": ["deck-b"]
    }))),
    {
      student: ["deck-a"],
      "student-2": ["deck-b"]
    },
    `Recovery exports must redact top-level owner names for ${stateKey}`
  );
}
assert.deepEqual(
  JSON.parse(JSON.stringify(sanitizeRecoveryState("edmundFlashcardCards", {
    "__studentCustomDecks": [
      {
        id: "student-custom/danny-s1/my-vocabulary-abc123",
        title: "My vocabulary",
        studentName: "already removed by the generic sanitizer"
      }
    ],
    "student-custom/danny-s1/my-vocabulary-abc123": [
      {
        front: "Keep this exact learning content (Danny)",
        meaning: { en: "student-custom/danny-s1 is part of this example" }
      }
    ]
  }))),
  {
    "__studentCustomDecks": [
      {
        id: "student-custom/student/my-vocabulary-abc123",
        title: "My vocabulary"
      }
    ],
    "student-custom/student/my-vocabulary-abc123": [
      {
        front: "Keep this exact learning content (Danny)",
        meaning: { en: "student-custom/danny-s1 is part of this example" }
      }
    ]
  },
  "Recovery exports must redact custom-deck owner slugs without rewriting card learning content"
);
assert.deepEqual(
  JSON.parse(JSON.stringify(sanitizeRecoveryState("unrelatedState", {
    "Danny::content-key": { value: 1 }
  }))),
  { "Danny::content-key": { value: 1 } },
  "Unrelated content maps must not be structurally rewritten"
);

const sanitizeRecoveryDiagnostic = vm.runInNewContext(`(() => {
  ${extractFunction("redactFlashcardRecoveryCustomDeckId")}
  ${extractFunction("sanitizeFlashcardRecoveryDiagnosticText")}
  return sanitizeFlashcardRecoveryDiagnosticText;
})()`);
assert.equal(
  sanitizeRecoveryDiagnostic("A queued mutation needs review (progress-delete-edit-overlap:Danny::deck-a)."),
  "A queued mutation needs review (progress-delete-edit-overlap:student::deck-a)."
);
assert.equal(
  sanitizeRecoveryDiagnostic("A queued mutation needs review (different-progress-attempt:Danny (S1)::deck-a)."),
  "A queued mutation needs review (different-progress-attempt:student::deck-a)."
);
assert.equal(
  sanitizeRecoveryDiagnostic("A queued mutation needs review (different-progress-attempt:陳大文（中三）::deck-a)."),
  "A queued mutation needs review (different-progress-attempt:student::deck-a)."
);
assert.equal(
  sanitizeRecoveryDiagnostic("A queued mutation needs review (different-progress-attempt:陳大文（中三）::student-custom/2ex-2b9-2ff/my-deck)."),
  "A queued mutation needs review (different-progress-attempt:student::student-custom/student/my-deck)."
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
  const PROGRESS_KEY = "edmundFlashcardProgress";
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
assert.equal(terminalCodeRuntime({
  key: "edmundFlashcardProgress",
  status: "blocked",
  requiresResolution: true,
  terminalScope: "key",
  receipt: null,
  recoveryClass: "fresh-canonical-rebase",
  lastError: "A queued mutation needs review (progress-delete-edit-overlap:Danny::deck)."
}), "local_rebase_review", "A locally isolated progress rebase must be retried after fresh hydration");
assert.equal(terminalCodeRuntime({
  key: "edmundFlashcardProgress",
  status: "blocked",
  requiresResolution: true,
  terminalScope: "key",
  receipt: null,
  lastError: "A queued mutation needs review (progress-delete-edit-overlap:Danny::deck)."
}), "local_rebase_review", "Rows created by the immediately preceding client must remain recoverable");
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
for (const unsafeLocalRow of [
  {
    key: "edmundFlashcardProgress",
    status: "blocked",
    requiresResolution: true,
    terminalScope: "account",
    receipt: null,
    recoveryClass: "fresh-canonical-rebase",
    lastError: "A queued mutation needs review (progress-delete-edit-overlap:Danny::deck)."
  },
  {
    key: "edmundFlashcardProgress",
    status: "blocked",
    requiresResolution: true,
    terminalScope: "key",
    receipt: null,
    lastError: "Authentication rejected this pending change; it remains quarantined and was not retried."
  }
]) {
  assert.equal(
    terminalCodeRuntime(unsafeLocalRow),
    "",
    "Only a key-isolated canonical-rebase review may enter automatic local recovery"
  );
}

const outboxDrain = extractFunction("drainFlashcardOutboxUnlocked");
assert.match(outboxDrain, /recoveryClass:[\s\S]{0,180}fresh-canonical-rebase/);
assert.doesNotMatch(
  outboxDrain,
  /hasOwnProperty\.call\(remoteStore, record\.key\)/,
  "Terminal evidence must never label the UI-overlaid pending value as verified canonical state"
);
assert.match(outboxDrain, /const canonicalValue = flashcardCanonicalValue\(record\.key\)/);
assert.match(outboxDrain, /canonicalVersion: flashcardStateVersion\(record\.key\)/);
assert.match(outboxDrain, /canonicalChecksum: flashcardStateChecksum\(record\.key\)/);

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

// If canonical hydration succeeds but safe reconciliation still cannot repair
// stale browser rows, login availability takes priority. Preserve a verified
// local archive first, then remove only same-account terminal rows.
const availabilityArchive = extractFunction("archiveFlashcardTerminalOutboxRows");
const availabilityRelease = extractFunction("releaseFlashcardTerminalOutboxRows");
assert.match(availabilityArchive, /sanitizeFlashcardRecoveryExportValue/);
assert.match(availabilityArchive, /storeLegacyQuarantineInIndexedDb/);
assert.match(availabilityArchive, /storeLegacyQuarantineInLocalStorage/);
assert.match(availabilityRelease, /flashcardOutboxOwnerMatches\(record, context\)/);
assert.match(availabilityRelease, /flashcardOutboxRecordRequiresResolution\(record\)/);
assert.ok(
  availabilityRelease.indexOf("archiveFlashcardTerminalOutboxRows")
    < availabilityRelease.indexOf("deleteFlashcardOutboxMutation"),
  "Terminal rows must be archived before the active queue releases them"
);
assert.match(availabilityRelease, /isSupabaseStateContextCurrent\(context\)/);
assert.match(availabilityRelease, /flashcardOutboxRowsForContext\(context\)/);

const releaseEvents = [];
const availabilityReleaseRuntime = vm.runInNewContext(`(() => {
  let activeRows = globalThis.initialRows.map(record => ({ ...record }));
  const releaseEvents = globalThis.releaseEvents;
  const flashcardOutboxOwnerMatches = (record, context) => record.owner === context.owner;
  const flashcardOutboxRecordRequiresResolution = record => record.requiresResolution === true;
  const archiveFlashcardTerminalOutboxRows = async (_context, rows) => {
    releaseEvents.push({ type: "archive", ids: rows.map(record => record.mutationId) });
    return { archived: rows.length, storage: "indexeddb", bundleId: "terminal-v1-test" };
  };
  const isSupabaseStateContextCurrent = () => true;
  const deleteFlashcardOutboxMutation = async mutationId => {
    releaseEvents.push({ type: "delete", id: mutationId });
    activeRows = activeRows.filter(record => record.mutationId !== mutationId);
  };
  const flashcardOutboxRowsForContext = async context => (
    activeRows.filter(record => record.owner === context.owner)
  );
  ${availabilityRelease.replace(/^function /, "async function ")}
  return releaseFlashcardTerminalOutboxRows;
})()`, {
  releaseEvents,
  initialRows: [
    { owner: "student:gina", mutationId: "terminal-1", requiresResolution: true },
    { owner: "student:gina", mutationId: "terminal-2", requiresResolution: true },
    { owner: "student:gina", mutationId: "ordinary-1", requiresResolution: false },
    { owner: "student:other", mutationId: "other-terminal", requiresResolution: true }
  ]
});
const availabilityResult = await availabilityReleaseRuntime(
  { owner: "student:gina" },
  [
    { owner: "student:gina", mutationId: "terminal-1", requiresResolution: true },
    { owner: "student:gina", mutationId: "terminal-2", requiresResolution: true },
    { owner: "student:gina", mutationId: "ordinary-1", requiresResolution: false },
    { owner: "student:other", mutationId: "other-terminal", requiresResolution: true }
  ]
);
assert.equal(availabilityResult.released, 2);
assert.deepEqual(JSON.parse(JSON.stringify(releaseEvents)), [
  { type: "archive", ids: ["terminal-1", "terminal-2"] },
  { type: "delete", id: "terminal-1" },
  { type: "delete", id: "terminal-2" }
]);
assert.match(recovery, /releaseFlashcardTerminalOutboxRows/);
assert.ok(
  recovery.indexOf("canonicalHydrationComplete") < recovery.indexOf("releaseFlashcardTerminalOutboxRows"),
  "Availability release must run only after canonical cloud hydration succeeds"
);

// Safe merge must never silently erase a terminal row; the explicit
// availability-release helper owns archive-before-delete fallback behavior.
// The UI must never advise students to erase all browser data themselves.
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

const login = extractFunction("performFlashcardLogin");
assert.match(login, /let stateLoaded = false/);
assert.match(login, /stateLoaded = await loadStudentStateFromSupabase\(\)/);
assert.match(login, /stateLoaded && stateContext && isSupabaseStateHydrated\(stateContext\)/);
assert.ok(
  login.indexOf('showAppPanel("dashboard", false)') < login.indexOf("await loadStudentStateFromSupabase()"),
  "Accepted credentials must reveal the dashboard before older records finish loading"
);
assert.ok(
  login.indexOf("dashboardPanel.inert = true") < login.indexOf("await loadStudentStateFromSupabase()"),
  "The early dashboard must remain non-interactive until canonical hydration finishes"
);
assert.match(login, /outboxErrorClass === "terminal"/);
assert.match(login, /scheduleFlashcardAutomaticTerminalRecovery\(\)/);

console.log("Flashcard actionable conflict-recovery UI checks passed.");
