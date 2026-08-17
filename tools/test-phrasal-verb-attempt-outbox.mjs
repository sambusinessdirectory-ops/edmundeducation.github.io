import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const app = fs.readFileSync(path.join(root, "phrasal-verb-system.js"), "utf8");

function functionSource(name, nextName) {
  const start = app.indexOf(`function ${name}(`);
  const end = app.indexOf(`function ${nextName}(`, start + 1);
  assert.ok(start >= 0 && end > start, `could not isolate ${name}()`);
  return app.slice(start, end);
}

function mergeSource() {
  return [
    functionSource("isPlainObject", "validLessonContract"),
    functionSource("parseJsonObject", "lessonList"),
    functionSource("normalizeAttempt", "newAttemptSyncEpoch"),
    functionSource("cloneAttemptSyncValue", "attemptSyncAccountKey"),
    functionSource("attemptPayloadFromValue", "uniqueAttemptIds"),
    functionSource("uniqueAttemptIds", "attemptQuestionStateRank"),
    functionSource("attemptQuestionStateRank", "mergeAttemptQuestionStates"),
    functionSource("mergeAttemptQuestionStates", "attemptRoundFingerprint"),
    functionSource("attemptRoundFingerprint", "mergeAttemptRounds"),
    functionSource("mergeAttemptRounds", "earlierAttemptTimestamp"),
    functionSource("earlierAttemptTimestamp", "laterAttemptTimestamp"),
    functionSource("laterAttemptTimestamp", "mergeAttemptPayloadLosslessly"),
    functionSource("mergeAttemptPayloadLosslessly", "attemptOutboxRequest")
  ].join("\n");
}

function runMerge(canonical, incoming) {
  const context = {
    structuredClone,
    CONTENT: { version: "1" },
    getLesson: () => ({ questions: Array.from({ length: 2 }) }),
    lessonQuestionCount: () => 2,
    canonical,
    incoming
  };
  vm.createContext(context);
  vm.runInContext(`${mergeSource()}\nresult = mergeAttemptPayloadLosslessly(canonical, incoming);`, context);
  return context.result;
}

function payload({ correctId, answer, submittedAt, status = "in_progress", durationMs = 1000 }) {
  const correctIds = correctId ? [correctId] : [];
  return {
    lessonId: "phrasal-verb-01",
    lessonVersion: "1",
    status,
    roundNumber: 1,
    correctCount: correctIds.length,
    totalCount: 2,
    durationMs,
    startedAt: "2026-08-17T01:00:00.000Z",
    completedAt: status === "completed" ? submittedAt : null,
    result: {
      round: 1,
      correctIds,
      questionState: correctId ? {
        [correctId]: { status: "correct", lastAnswer: answer, reveal: true }
      } : {},
      rounds: correctId ? [{
        round: 1,
        kind: "partial",
        checkedIds: [correctId],
        correctIds: [correctId],
        incorrectIds: [],
        submittedAt
      }] : [],
      awaitingNextRound: false,
      correctionMode: false,
      correctionIds: [],
      collapsedCorrectIds: correctIds,
      contentVersion: "1"
    }
  };
}

test("durable attempt outbox is account-, token-, and epoch-bound", () => {
  assert.match(app, /ATTEMPT_OUTBOX_DB_NAME\s*=\s*"edmund-phrasal-verb-attempt-outbox-v1"/);
  assert.match(app, /createObjectStore\(ATTEMPT_OUTBOX_STORE, \{ keyPath: "mutationId" \}\)/);
  assert.match(app, /createIndex\("ownerKey", "ownerKey"/);
  assert.match(app, /createIndex\("accountKey", "accountKey"/);
  assert.match(app, /tokenFingerprint:\s*context\.tokenFingerprint/);
  assert.match(app, /syncEpoch:\s*context\.syncEpoch/);
  assert.match(app, /originalOwnerKey:\s*context\.ownerKey/);
  assert.match(app, /crypto\.subtle\.digest\("SHA-256"/);
  assert.doesNotMatch(functionSource("createAttemptOutboxRecord", "enqueueAttemptOutboxRecord"), /authToken/);
  const accountKey = functionSource("attemptSyncAccountKey", "attemptTokenFingerprint").replace(/\basync\s*$/, "");
  assert.match(accountKey, /UUID_RE\.test\(studentId\)/);
  assert.doesNotMatch(accountKey, /user\?\.name/, "renaming a student must not strand that UUID's durable rows");
  assert.match(functionSource("adoptAttemptOutboxForContext", "renderAttemptOutboxStatus"), /record\.studentId[\s\S]*context\.studentId/);
});

test("drain is ordered, single-writer, durable, and wakes after interruptions", () => {
  assert.match(app, /navigator\.locks\?\.request/);
  assert.match(app, /ATTEMPT_OUTBOX_LEASE_STORE/);
  assert.match(app, /sort\(\(left, right\) => \(\s*Number\(left\.createdAt/);
  assert.match(app, /window\.addEventListener\("online"/);
  assert.match(app, /window\.addEventListener\("focus"/);
  assert.match(app, /document\.visibilityState === "visible"/);
  assert.match(app, /window\.addEventListener\("pagehide"[\s\S]*persist: true, keepalive: true/);
  assert.match(app, /adoptAttemptOutboxForContext/);
  assert.match(app, /record\.accountKey === context\.accountKey/);
  assert.match(app, /attemptOutboxBlocked/);
  assert.match(app, /同步保護已暫停/);
});

test("Retry-After and bounded exponential backoff cover transient write failures", () => {
  const source = [
    "const ATTEMPT_OUTBOX_RETRY_BASE_MS = 1500; const ATTEMPT_OUTBOX_RETRY_CAP_MS = 300000;",
    functionSource("retryAfterMilliseconds", "parseApiError").replace(/\basync\s*$/, ""),
    functionSource("attemptOutboxRetryDelay", "retryableAttemptSyncError"),
    functionSource("retryableAttemptSyncError", "scheduleAttemptOutboxDrain")
  ].join("\n");
  const context = {};
  vm.createContext(context);
  vm.runInContext(`${source}\nresults = {
    seconds: retryAfterMilliseconds("5", 0),
    date: retryAfterMilliseconds("Thu, 01 Jan 1970 00:00:10 GMT", 1000),
    honored: attemptOutboxRetryDelay(1, 9000, 0),
    capped: attemptOutboxRetryDelay(30, 999999, 1),
    network: retryableAttemptSyncError({ status: 0 }),
    timeout: retryableAttemptSyncError({ status: 408 }),
    early: retryableAttemptSyncError({ status: 425 }),
    rate: retryableAttemptSyncError({ status: 429 }),
    server: retryableAttemptSyncError({ status: 500 }),
    unavailable: retryableAttemptSyncError({ status: 503 }),
    validation: retryableAttemptSyncError({ status: 400 })
  };`, context);
  assert.deepEqual({ ...context.results }, {
    seconds: 5000,
    date: 9000,
    honored: 9000,
    capped: 300000,
    network: true,
    timeout: true,
    early: true,
    rate: true,
    server: true,
    unavailable: true,
    validation: false
  });
  assert.match(functionSource("parseApiError", "apiJson"), /Retry-After/);
});

test("409 recovery fetches canonical state and retries under a fresh mutation id", () => {
  const conflict = functionSource("replaceAttemptConflictWithFreshMutation", "markAttemptOutboxRetry");
  assert.match(conflict, /attemptOutboxApiJson\(\s*`\/v1\/attempts\/\$\{encodeURIComponent\(record\.attemptId\)\}`/);
  assert.match(conflict, /mergeAttemptPayloadLosslessly\(canonicalPayload, record\.payload\)/);
  assert.match(conflict, /mutationId:\s*globalThis\.crypto\?\.randomUUID/);
  assert.match(conflict, /replaceAttemptOutboxRecord\(record, replacement\)/);
  assert.match(functionSource("drainAttemptOutboxUnlocked", "drainAttemptOutbox"), /status \|\| 0\) === 409/);
});

test("lossless merge preserves progress from concurrent canonical and local snapshots", () => {
  const first = payload({
    correctId: "phrasal-verb-01-q01",
    answer: "Traffic is building up.",
    submittedAt: "2026-08-17T01:01:00.000Z",
    durationMs: 1200
  });
  const second = payload({
    correctId: "phrasal-verb-01-q02",
    answer: "They built the team up.",
    submittedAt: "2026-08-17T01:02:00.000Z",
    durationMs: 2400
  });
  const merged = runMerge(first, second);
  assert.deepEqual(Array.from(merged.result.correctIds).sort(), ["phrasal-verb-01-q01", "phrasal-verb-01-q02"]);
  assert.equal(merged.correctCount, 2);
  assert.equal(merged.status, "in_progress", "completion is never invented without a completed snapshot");
  assert.equal(merged.durationMs, 2400);
  assert.equal(merged.result.rounds.length, 2);
  assert.equal(merged.result.questionState["phrasal-verb-01-q01"].lastAnswer, "Traffic is building up.");
  assert.equal(merged.result.questionState["phrasal-verb-01-q02"].lastAnswer, "They built the team up.");
});

test("exercise submission reports durable local safety instead of remote data loss", () => {
  const submit = functionSource("submitExercise", "startCorrectionRound");
  assert.match(submit, /已安全儲存在此裝置，正在同步/);
  assert.match(submit, /此裝置未能建立安全待同步記錄/);
  assert.doesNotMatch(submit, /未能同步練習記錄/);
  assert.match(functionSource("persistExercise", "scheduleExercisePersistence"), /enqueueAttemptOutboxRecord/);
  assert.doesNotMatch(functionSource("persistExercise", "scheduleExercisePersistence"), /method:\s*"PUT"/);
});
