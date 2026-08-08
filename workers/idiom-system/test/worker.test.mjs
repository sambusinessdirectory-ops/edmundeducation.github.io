import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

import { ACCEPTED_ANSWERS } from "../src/catalog.js";
import worker from "../src/index.js";

const ORIGIN = "https://edmundeducation.github.io";
const STUDENT_TOKEN = "11111111-1111-4111-8111-111111111111";
const STUDENT_ID = "22222222-2222-4222-8222-222222222222";
const ATTEMPT_ID = "33333333-3333-4333-8333-333333333333";
const lessonDataContext = { window: {} };
vm.runInNewContext(
  fs.readFileSync(new URL("../../../idiom-system-data.js", import.meta.url), "utf8"),
  lessonDataContext,
  { filename: "idiom-system-data.js" }
);
const LESSON_DATA = lessonDataContext.window.EDMUND_IDIOM_SYSTEM_DATA;
const LESSON_IDS = Array.from(
  { length: 138 },
  (_, index) => `idiom-${String(index + 1).padStart(2, "0")}`
);
const LESSON_ID = "idiom-01";
const QUESTION_IDS = Array.from(
  { length: 50 },
  (_, index) => `${LESSON_ID}-q${String(index + 1).padStart(2, "0")}`
);
const ALL_QUESTION_IDS = LESSON_IDS.flatMap((lessonId) => Array.from(
  { length: 50 },
  (_, index) => `${lessonId}-q${String(index + 1).padStart(2, "0")}`
));
const MAX_BOOKMARKS = 138 * 51;

function environment(overrides = {}) {
  return {
    ALLOWED_ORIGINS: ORIGIN,
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "x".repeat(64),
    ADMIN_LOGIN_RATE_LIMITER: {
      async limit() {
        return { success: true };
      }
    },
    ATTEMPT_WRITE_RATE_LIMITER: {
      async limit() {
        return { success: true };
      }
    },
    ...overrides
  };
}

function jsonResponse(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function rpcName(input) {
  return decodeURIComponent(new URL(String(input)).pathname.split("/").at(-1));
}

function studentProfile() {
  return [{
    id: STUDENT_ID,
    name: "Test Student",
    session_expires_at: "2099-01-01T00:00:00.000Z"
  }];
}

function attemptRow(body) {
  return [{
    id: ATTEMPT_ID,
    lesson_id: body.p_lesson_id,
    lesson_version: body.p_lesson_version,
    status: body.p_status,
    round_number: body.p_round_number,
    correct_count: body.p_correct_count,
    total_count: body.p_total_count,
    duration_ms: body.p_duration_ms,
    started_at: body.p_started_at,
    completed_at: body.p_status === "completed" ? body.p_started_at : null,
    updated_at: body.p_started_at,
    result: body.p_result
  }];
}

function attemptPayload({
  lessonId = LESSON_ID,
  questionId = QUESTION_IDS[0],
  answer = ACCEPTED_ANSWERS[QUESTION_IDS[0]][0],
  startedAt = new Date(Date.now() - 1000).toISOString()
} = {}) {
  return {
    lessonId,
    lessonVersion: "1",
    status: "in_progress",
    roundNumber: 1,
    correctCount: 1,
    totalCount: 50,
    durationMs: 1000,
    startedAt,
    completedAt: null,
    result: {
      round: 1,
      correctIds: [questionId],
      questionState: {
        [questionId]: {
          status: "correct",
          lastAnswer: answer,
          reveal: true
        }
      },
      rounds: [{
        round: 1,
        kind: "partial",
        checkedIds: [questionId],
        correctIds: [questionId],
        incorrectIds: [],
        submittedAt: startedAt
      }],
      awaitingNextRound: false,
      correctionMode: false,
      correctionIds: [],
      collapsedCorrectIds: [questionId],
      contentVersion: "1"
    }
  };
}

function attemptRequest(payload) {
  return new Request(`https://worker.example/v1/attempts/${ATTEMPT_ID}`, {
    method: "PUT",
    headers: {
      Origin: ORIGIN,
      Authorization: `Bearer ${STUDENT_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

function installFetch(t, implementation) {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  globalThis.fetch = implementation;
}

test("the protected answer catalogue contains all 6,900 PDF answers under canonical IDs", () => {
  assert.deepEqual(Object.keys(ACCEPTED_ANSWERS), ALL_QUESTION_IDS);
  const publicQuestions = new Map(
    LESSON_DATA.lessons.flatMap((lesson) => lesson.questions.map((question) => [question.id, question]))
  );
  for (const [questionId, answers] of Object.entries(ACCEPTED_ANSWERS)) {
    assert.ok(answers.length >= 1, `${questionId} must have an authoritative answer`);
    assert.equal(typeof answers[0], "string");
    assert.equal(answers[0], publicQuestions.get(questionId)?.answer);
    assert.ok(answers[0].length > 5);
  }

  assert.equal(
    ACCEPTED_ANSWERS["idiom-01-q12"][0],
    "The nurse’s first suggestion started the ball rolling on a check of how medicines were kept at the hospital."
  );
  assert.equal(
    ACCEPTED_ANSWERS["idiom-01-q25"][0],
    "The café started the ball rolling on home delivery by testing it with ten customers."
  );
  assert.equal(
    ACCEPTED_ANSWERS["idiom-01-q50"][0],
    "A local school finally started the ball rolling on the shared garden by offering a small piece of land and some tools."
  );
  assert.equal(
    ACCEPTED_ANSWERS["idiom-138-q50"][0],
    LESSON_DATA.lessons[137].questions[49].answer
  );

});

test("worker, SQL, and Wrangler contracts are independently Idiom-namespaced", () => {
  const workerSource = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
  const sqlSource = fs.readFileSync(
    new URL("../../../supabase-idiom-system.sql", import.meta.url),
    "utf8"
  );
  const wrangler = JSON.parse(
    fs.readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8")
  );

  assert.match(workerSource, /Array\.from\(\{ length: 138 \}/);
  assert.match(workerSource, /idiom-\(\?:0\[1-9\]\|\[1-9\]\[0-9\]\|1\[0-2\]\[0-9\]\|13\[0-8\]\)/);
  assert.match(sqlSource, /\^idiom-\(0\[1-9\]\|\[1-9\]\[0-9\]\|1\[0-2\]\[0-9\]\|13\[0-8\]\)\$/);
  assert.match(sqlSource, /7038/);
  assert.match(sqlSource, /\^\\\$2a\\\$12\\\$/);
  assert.doesNotMatch(sqlSource, /\\\$2\[aby\]\\\$12/);
  assert.doesNotMatch(workerSource, /sentence-structure/i);
  assert.doesNotMatch(sqlSource, /sentence-structure|\^ss/i);

  const limiterIds = Object.fromEntries(
    wrangler.ratelimits.map(binding => [binding.name, binding.namespace_id])
  );
  assert.equal(wrangler.name, "edmund-idiom-system");
  assert.equal(limiterIds.ADMIN_LOGIN_RATE_LIMITER, "914072032");
  assert.equal(limiterIds.ATTEMPT_WRITE_RATE_LIMITER, "914072033");
  assert.notEqual(limiterIds.ADMIN_LOGIN_RATE_LIMITER, limiterIds.ATTEMPT_WRITE_RATE_LIMITER);
});

test("health reports the 138-lesson bookmark ceiling", async () => {
  const response = await worker.fetch(
    new Request("https://worker.example/v1/health"),
    environment()
  );
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).limits, {
    maxAttemptBodyBytes: 128 * 1024,
    maxAttemptResultBytes: 96 * 1024,
    maxBookmarks: MAX_BOOKMARKS,
    maxPageSize: 100
  });
});

test("Supabase server credentials are trimmed before becoming HTTP headers", async t => {
  const key = "s".repeat(64);
  const env = environment({ SUPABASE_SECRET_KEY: `  ${key}\n` });
  delete env.SUPABASE_SERVICE_ROLE_KEY;

  installFetch(t, async (_input, init = {}) => {
    const headers = new Headers(init.headers);
    assert.equal(headers.get("apikey"), key);
    assert.equal(headers.get("Authorization"), `Bearer ${key}`);
    return jsonResponse([]);
  });

  const response = await worker.fetch(new Request("https://worker.example/v1/student/me", {
    headers: {
      Origin: ORIGIN,
      Authorization: `Bearer ${STUDENT_TOKEN}`
    }
  }), env);
  assert.equal(response.status, 401);
  assert.equal((await response.json()).code, "STUDENT_AUTH_REQUIRED");
});

test("admin login uses its Idiom-specific rate-limit key", async t => {
  let limiterKey = null;
  const env = environment({
    ADMIN_LOGIN_RATE_LIMITER: {
      async limit({ key }) {
        limiterKey = key;
        return { success: true };
      }
    }
  });
  installFetch(t, async input => {
    assert.equal(rpcName(input), "idiom_system_admin_login");
    return jsonResponse([]);
  });

  const response = await worker.fetch(new Request("https://worker.example/v1/admin/login", {
    method: "POST",
    headers: {
      Origin: ORIGIN,
      "CF-Connecting-IP": "203.0.113.7",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username: "Unknown Admin", password: "test-placeholder-only" })
  }), env);
  assert.equal(response.status, 401);
  assert.equal(limiterKey, "idiom-system-admin:203.0.113.7");
});

test("a valid PDF answer reaches the Idiom attempt RPC unchanged", async t => {
  let upsertPayload = null;
  let attemptLimiterKey = null;
  installFetch(t, async (input, init = {}) => {
    const functionName = rpcName(input);
    const body = JSON.parse(String(init.body || "{}"));
    if (functionName === "idiom_system_student_profile") return jsonResponse(studentProfile());
    if (functionName === "idiom_system_upsert_attempt") {
      upsertPayload = body;
      return jsonResponse(attemptRow(body));
    }
    throw new Error(`Unexpected RPC: ${functionName}`);
  });
  const env = environment({
    ATTEMPT_WRITE_RATE_LIMITER: {
      async limit({ key }) {
        attemptLimiterKey = key;
        return { success: true };
      }
    }
  });
  const payload = attemptPayload();

  const response = await worker.fetch(attemptRequest(payload), env);
  assert.equal(response.status, 200);
  assert.equal(attemptLimiterKey, `idiom-system-attempt:${STUDENT_ID}`);
  assert.equal(upsertPayload.p_lesson_id, LESSON_ID);
  assert.deepEqual(upsertPayload.p_result.correctIds, [QUESTION_IDS[0]]);
  assert.equal(
    upsertPayload.p_result.questionState[QUESTION_IDS[0]].lastAnswer,
    ACCEPTED_ANSWERS[QUESTION_IDS[0]][0]
  );
});

test("British and American spelling variants validate identically", async t => {
  let upsertPayload = null;
  installFetch(t, async (input, init = {}) => {
    const functionName = rpcName(input);
    const body = JSON.parse(String(init.body || "{}"));
    if (functionName === "idiom_system_student_profile") return jsonResponse(studentProfile());
    if (functionName === "idiom_system_upsert_attempt") {
      upsertPayload = body;
      return jsonResponse(attemptRow(body));
    }
    throw new Error(`Unexpected RPC: ${functionName}`);
  });

  const questionId = "idiom-01-q22";
  const british = ACCEPTED_ANSWERS[questionId][0];
  assert.match(british, /colours/);
  const american = british.replace("colours", "colors");
  const response = await worker.fetch(
    attemptRequest(attemptPayload({ questionId, answer: american })),
    environment()
  );
  assert.equal(response.status, 200);
  assert.equal(upsertPayload.p_result.questionState[questionId].lastAnswer, american);
});

test("all 7,038 possible bookmarks round-trip and a 7,039th is rejected", async t => {
  const bookmarks = LESSON_IDS.flatMap((lessonId) => [
    { lessonId, questionId: "__section__", includeAnswer: false },
    ...Array.from({ length: 50 }, (_, index) => ({
      lessonId,
      questionId: `${lessonId}-q${String(index + 1).padStart(2, "0")}`,
      includeAnswer: index % 2 === 0
    }))
  ]);
  const rows = bookmarks.map((bookmark, index) => ({
    lesson_id: bookmark.lessonId,
    question_id: bookmark.questionId,
    include_answer: bookmark.includeAnswer,
    created_at: new Date(Date.UTC(2026, 6, 27, 0, 0, index)).toISOString()
  }));
  let replaceCalls = 0;
  const pageCalls = [];
  installFetch(t, async (input, init = {}) => {
    const functionName = rpcName(input);
    const body = JSON.parse(String(init.body || "{}"));
    if (functionName === "idiom_system_student_profile") return jsonResponse(studentProfile());
    if (functionName === "idiom_system_replace_bookmarks") {
      replaceCalls += 1;
      assert.deepEqual(body.p_bookmarks, bookmarks);
      return jsonResponse(rows);
    }
    if (functionName === "idiom_system_list_bookmarks_page") {
      pageCalls.push([body.p_offset, body.p_limit]);
      return jsonResponse(rows.slice(body.p_offset, body.p_offset + body.p_limit));
    }
    throw new Error(`Unexpected RPC: ${functionName}`);
  });

  const validResponse = await worker.fetch(new Request("https://worker.example/v1/bookmarks", {
    method: "PUT",
    headers: {
      Origin: ORIGIN,
      Authorization: `Bearer ${STUDENT_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ bookmarks })
  }), environment());
  assert.equal(validResponse.status, 200);
  assert.equal((await validResponse.json()).bookmarks.length, MAX_BOOKMARKS);
  assert.deepEqual(
    pageCalls,
    Array.from({ length: Math.ceil(MAX_BOOKMARKS / 100) }, (_, index) => [index * 100, 100])
  );

  const invalidResponse = await worker.fetch(new Request("https://worker.example/v1/bookmarks", {
    method: "PUT",
    headers: {
      Origin: ORIGIN,
      Authorization: `Bearer ${STUDENT_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ bookmarks: [...bookmarks, {
      lessonId: LESSON_ID,
      questionId: "idiom-02-q01",
      includeAnswer: true
    }] })
  }), environment());
  assert.equal(invalidResponse.status, 400);
  assert.equal((await invalidResponse.json()).code, "INVALID_BOOKMARKS");
  assert.equal(replaceCalls, 1, "an oversized list must fail before the replacement RPC");
});

test("attempt byte validation matches PostgreSQL jsonb spacing", async t => {
  let upsertCalled = false;
  installFetch(t, async input => {
    const functionName = rpcName(input);
    if (functionName === "idiom_system_student_profile") return jsonResponse(studentProfile());
    if (functionName === "idiom_system_upsert_attempt") upsertCalled = true;
    throw new Error(`Unexpected RPC: ${functionName}`);
  });

  const startedAt = new Date(Date.now() - 1000).toISOString();
  const roundNumber = 55;
  const result = {
    round: roundNumber,
    correctIds: [],
    questionState: Object.fromEntries(QUESTION_IDS.map(questionId => [
      questionId,
      { status: "wrong", lastAnswer: "not correct", reveal: true }
    ])),
    rounds: Array.from({ length: roundNumber }, (_, index) => ({
      round: index + 1,
      kind: "all",
      checkedIds: QUESTION_IDS,
      correctIds: [],
      incorrectIds: QUESTION_IDS,
      submittedAt: startedAt
    })),
    awaitingNextRound: false,
    correctionMode: false,
    correctionIds: [],
    collapsedCorrectIds: [],
    contentVersion: "1"
  };
  assert.ok(
    Buffer.byteLength(JSON.stringify(result), "utf8") < 96 * 1024,
    "fixture must fit a compact-JSON-only check"
  );

  const response = await worker.fetch(attemptRequest({
    lessonId: LESSON_ID,
    lessonVersion: "1",
    status: "in_progress",
    roundNumber,
    correctCount: 0,
    totalCount: 50,
    durationMs: 55_000,
    startedAt,
    completedAt: null,
    result
  }), environment());
  assert.equal(response.status, 413);
  assert.equal((await response.json()).code, "ATTEMPT_TOO_LARGE");
  assert.equal(upsertCalled, false);
});

test("foreign lesson and out-of-catalog question IDs fail before upsert", async t => {
  let upsertCalls = 0;
  installFetch(t, async input => {
    const functionName = rpcName(input);
    if (functionName === "idiom_system_student_profile") return jsonResponse(studentProfile());
    if (functionName === "idiom_system_upsert_attempt") upsertCalls += 1;
    throw new Error(`Unexpected RPC: ${functionName}`);
  });

  const foreignResponse = await worker.fetch(attemptRequest(attemptPayload({
    lessonId: "ss1",
    questionId: "ss1-q01",
    answer: "Not part of the Idiom catalogue."
  })), environment());
  assert.equal(foreignResponse.status, 400);
  assert.equal((await foreignResponse.json()).code, "INVALID_ATTEMPT");

  const questionId = "idiom-01-q51";
  const outOfRangeResponse = await worker.fetch(attemptRequest(attemptPayload({
    questionId,
    answer: "Not part of the Idiom catalogue."
  })), environment());
  assert.equal(outOfRangeResponse.status, 400);
  assert.equal((await outOfRangeResponse.json()).code, "INVALID_ATTEMPT");

  const mismatchedResponse = await worker.fetch(attemptRequest(attemptPayload({
    lessonId: "idiom-02",
    questionId: "idiom-03-q01",
    answer: ACCEPTED_ANSWERS["idiom-03-q01"]?.[0] || "Mismatched lesson and question."
  })), environment());
  assert.equal(mismatchedResponse.status, 400);
  assert.equal((await mismatchedResponse.json()).code, "INVALID_ATTEMPT");
  assert.equal(upsertCalls, 0);
});
