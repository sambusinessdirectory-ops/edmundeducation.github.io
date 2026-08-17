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

function roundFingerprint(round) {
  return JSON.stringify([
    Number(round?.round || 0),
    String(round?.kind || ""),
    String(round?.submittedAt || ""),
    [...(round?.checkedIds || [])].map(String).sort(),
    [...(round?.correctIds || [])].map(String).sort(),
    [...(round?.incorrectIds || [])].map(String).sort()
  ]);
}

function canonicalRoundsRemainPrefix(existing, candidate) {
  const existingRounds = Array.isArray(existing?.rounds) ? existing.rounds : [];
  const candidateRounds = Array.isArray(candidate?.rounds) ? candidate.rounds : [];
  return candidateRounds.length <= existingRounds.length
    && candidateRounds.every((round, index) => (
      roundFingerprint(round) === roundFingerprint(existingRounds[index])
    ));
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

test("409 recovery preserves the canonical round prefix when an offline round is chronologically earlier", () => {
  const canonical = payload({
    correctId: "phrasal-verb-01-q01",
    answer: "Traffic is building up.",
    submittedAt: "2026-08-17T01:02:00.000Z",
    durationMs: 2400
  });
  const offline = payload({
    correctId: "phrasal-verb-01-q02",
    answer: "They built the team up.",
    submittedAt: "2026-08-17T01:01:00.000Z",
    durationMs: 1800
  });

  const recovered = runMerge(canonical, offline);
  assert.equal(
    roundFingerprint(recovered.result.rounds[0]),
    roundFingerprint(canonical.result.rounds[0]),
    "The verified server history must remain the immutable prefix even when the offline event is earlier"
  );
  assert.equal(
    roundFingerprint(recovered.result.rounds[1]),
    roundFingerprint(offline.result.rounds[0])
  );
  assert.equal(
    canonicalRoundsRemainPrefix(recovered.result, canonical.result),
    true,
    "The fresh merged mutation must dominate the canonical prefix accepted by the V2 SQL guard"
  );

  const secondRecovery = runMerge(canonical, recovered);
  assert.deepEqual(
    Array.from(secondRecovery.result.rounds, roundFingerprint),
    Array.from(recovered.result.rounds, roundFingerprint),
    "Repeating 409 recovery must be idempotent instead of reordering history into another conflict"
  );
  assert.equal(canonicalRoundsRemainPrefix(secondRecovery.result, canonical.result), true);
});

test("equal control revisions preserve canonical controls instead of looping on a stale exit", () => {
  const canonical = payload({
    correctId: "phrasal-verb-01-q01",
    answer: "Traffic is building up.",
    submittedAt: "2026-08-17T01:02:00.000Z"
  });
  canonical.result.questionState["phrasal-verb-01-q02"] = {
    status: "wrong",
    lastAnswer: "They built the team.",
    reveal: false
  };
  canonical.result.correctionMode = true;
  canonical.result.correctionIds = ["phrasal-verb-01-q02"];
  canonical.result.controlRevision = 7;

  const staleExit = structuredClone(canonical);
  staleExit.result.correctionMode = false;
  staleExit.result.correctionIds = [];
  staleExit.result.controlRevision = 7;

  const recovered = runMerge(canonical, staleExit);
  assert.equal(recovered.result.controlRevision, 7);
  assert.equal(recovered.result.correctionMode, true);
  assert.deepEqual(Array.from(recovered.result.correctionIds), ["phrasal-verb-01-q02"]);

  const secondRecovery = runMerge(canonical, recovered);
  assert.equal(secondRecovery.result.controlRevision, 7);
  assert.equal(secondRecovery.result.correctionMode, true);
  assert.deepEqual(Array.from(secondRecovery.result.correctionIds), ["phrasal-verb-01-q02"]);
});

test("a higher control revision permits a legitimate same-round correction exit", () => {
  const canonical = payload({
    correctId: "phrasal-verb-01-q01",
    answer: "Traffic is building up.",
    submittedAt: "2026-08-17T01:02:00.000Z"
  });
  canonical.result.questionState["phrasal-verb-01-q02"] = {
    status: "wrong",
    lastAnswer: "They built the team.",
    reveal: false
  };
  canonical.result.correctionMode = true;
  canonical.result.correctionIds = ["phrasal-verb-01-q02"];
  canonical.result.controlRevision = 7;

  const legitimateExit = structuredClone(canonical);
  legitimateExit.result.correctionMode = false;
  legitimateExit.result.correctionIds = [];
  legitimateExit.result.controlRevision = 8;

  const merged = runMerge(canonical, legitimateExit);
  assert.equal(merged.result.controlRevision, 8);
  assert.equal(merged.result.correctionMode, false);
  assert.deepEqual(Array.from(merged.result.correctionIds), []);
  assert.equal(merged.result.awaitingNextRound, false);
});

test("structural progress normalization advances the chosen control revision once", () => {
  const canonical = payload({
    correctId: "phrasal-verb-01-q01",
    answer: "Traffic is building up.",
    submittedAt: "2026-08-17T01:02:00.000Z"
  });
  canonical.result.questionState["phrasal-verb-01-q02"] = {
    status: "wrong",
    lastAnswer: "They built the team.",
    reveal: false
  };
  canonical.result.correctionMode = true;
  canonical.result.correctionIds = ["phrasal-verb-01-q02"];
  canonical.result.controlRevision = 3;

  const correctedOffline = payload({
    correctId: "phrasal-verb-01-q02",
    answer: "They built the team up.",
    submittedAt: "2026-08-17T01:03:00.000Z"
  });
  correctedOffline.result.controlRevision = 3;

  const merged = runMerge(canonical, correctedOffline);
  assert.equal(merged.result.controlRevision, 4);
  assert.equal(merged.result.correctionMode, false);
  assert.deepEqual(Array.from(merged.result.correctionIds), []);

  const repeated = runMerge(merged, correctedOffline);
  assert.equal(repeated.result.controlRevision, 4, "idempotent recovery must not invent another revision");
});

test("control revisions initialize, serialize, and advance once per actual UI control mutation", () => {
  assert.match(functionSource("normalizeAttempt", "newAttemptSyncEpoch"), /controlRevision:\s*normalizeAttemptControlRevision/);
  assert.match(functionSource("createExercise", "exerciseFromAttempt"), /controlRevision:\s*0/);
  assert.match(functionSource("exerciseFromAttempt", "ensureExercise"), /controlRevision:\s*normalizeAttemptControlRevision/);
  assert.match(functionSource("serializeExerciseResult", "persistExercise"), /controlRevision:\s*normalizeAttemptControlRevision/);

  const context = {};
  vm.createContext(context);
  vm.runInContext(`${functionSource("uniqueAttemptIds", "attemptQuestionStateRank")}
    exercise = {
      awaitingNextRound: false,
      correctionMode: false,
      correctionIds: [],
      collapsedCorrectIds: [],
      controlRevision: 0
    };
    before = attemptControlState(exercise);
    unchanged = bumpAttemptControlRevisionIfChanged(exercise, before);
    exercise.awaitingNextRound = true;
    firstChange = bumpAttemptControlRevisionIfChanged(exercise, before);
    beforeSecond = attemptControlState(exercise);
    exercise.awaitingNextRound = false;
    exercise.correctionMode = true;
    exercise.correctionIds = ["phrasal-verb-01-q02"];
    secondChange = bumpAttemptControlRevisionIfChanged(exercise, beforeSecond);
  `, context);
  assert.equal(context.unchanged, false);
  assert.equal(context.firstChange, true);
  assert.equal(context.secondChange, true);
  assert.equal(context.exercise.controlRevision, 2);

  for (const [name, nextName, persistenceCall] of [
    ["openLesson", "setLessonPage", "scheduleExercisePersistence"],
    ["submitExercise", "startCorrectionRound", "persistExercise"],
    ["startCorrectionRound", "exitCorrectionRound", "persistExercise"],
    ["exitCorrectionRound", "toggleCorrectCard", "persistExercise"],
    ["toggleCorrectCard", "toggleAllCorrectCards", "scheduleExercisePersistence"],
    ["toggleAllCorrectCards", "clearQuestionAnswer", "scheduleExercisePersistence"],
    ["startNextRound", "saveBookmarks", "persistExercise"]
  ]) {
    const source = functionSource(name, nextName);
    assert.equal(
      [...source.matchAll(/bumpAttemptControlRevisionIfChanged/g)].length,
      1,
      `${name}() must evaluate and bump its control mutation exactly once`
    );
    assert.ok(
      source.indexOf("bumpAttemptControlRevisionIfChanged") < source.lastIndexOf(persistenceCall),
      `${name}() must advance the revision before persistence`
    );
  }
});

test("409 recovery fails closed instead of discarding a round above the history limit", () => {
  const canonical = payload({
    correctId: "phrasal-verb-01-q01",
    answer: "Traffic is building up.",
    submittedAt: "2026-08-17T01:02:00.000Z",
    durationMs: 2400
  });
  canonical.result.rounds = Array.from({ length: 250 }, (_, index) => ({
    ...canonical.result.rounds[0],
    round: index + 1,
    submittedAt: new Date(Date.UTC(2026, 7, 17, 1, 2, index)).toISOString()
  }));
  const offline = payload({
    correctId: "phrasal-verb-01-q02",
    answer: "They built the team up.",
    submittedAt: "2026-08-17T01:01:00.000Z",
    durationMs: 1800
  });

  assert.throws(
    () => runMerge(canonical, offline),
    /超出安全上限/,
    "The client must quarantine an oversized union instead of silently dropping the local round"
  );
});

test("exercise submission reports durable local safety instead of remote data loss", () => {
  const submit = functionSource("submitExercise", "startCorrectionRound");
  assert.match(submit, /已安全儲存在此裝置，正在同步/);
  assert.match(submit, /此裝置未能建立安全待同步記錄/);
  assert.doesNotMatch(submit, /未能同步練習記錄/);
  assert.match(functionSource("persistExercise", "scheduleExercisePersistence"), /enqueueAttemptOutboxRecord/);
  assert.doesNotMatch(functionSource("persistExercise", "scheduleExercisePersistence"), /method:\s*"PUT"/);
});
