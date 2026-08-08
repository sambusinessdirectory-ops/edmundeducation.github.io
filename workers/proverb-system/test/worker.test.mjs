import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";

import { ACCEPTED_ANSWERS } from "../src/catalog.js";
import worker from "../src/index.js";

const ORIGIN = "https://edmundeducation.github.io";
const STUDENT_TOKEN = "11111111-1111-4111-8111-111111111111";
const STUDENT_ID = "22222222-2222-4222-8222-222222222222";
const ATTEMPT_ID = "33333333-3333-4333-8333-333333333333";
const LESSON_IDS = ["proverb-01", "proverb-02", "proverb-03"];
const LESSON_ID = LESSON_IDS[0];
const QUESTION_IDS = Array.from(
  { length: 50 },
  (_, index) => `${LESSON_ID}-q${String(index + 1).padStart(2, "0")}`
);
const ALL_QUESTION_IDS = LESSON_IDS.flatMap(lessonId => Array.from(
  { length: 50 },
  (_, index) => `${lessonId}-q${String(index + 1).padStart(2, "0")}`
));
const CANONICAL_CATALOG_SHA256 = "49768240a6cd3494d4f554665b811e0081eeafd79a885986593295340272343f";

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
  answer = ACCEPTED_ANSWERS[QUESTION_IDS[0]]?.[0] || "Catalogue pending",
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

test("the protected answer catalogue contains all 150 validated entries", () => {
  const ids = Object.keys(ACCEPTED_ANSWERS);
  assert.deepEqual(ids, ALL_QUESTION_IDS);
  for (const [questionId, answers] of Object.entries(ACCEPTED_ANSWERS)) {
    assert.ok(Array.isArray(answers) && answers.length >= 1, `${questionId} needs a canonical answer`);
    for (const answer of answers) {
      assert.equal(typeof answer, "string");
      assert.equal(answer, answer.trim());
      assert.ok(answer.length >= 1 && answer.length <= 1000);
      assert.doesNotMatch(answer, /canonical answer|placeholder|todo/i);
    }
  }
});

test("the protected catalogue exactly matches the canonical browser answers", () => {
  const source = fs.readFileSync(
    new URL("../../../proverb-system-data.js", import.meta.url),
    "utf8"
  );
  const sandbox = { window: {} };
  runInNewContext(source, sandbox, {
    filename: "proverb-system-data.js",
    timeout: 1000
  });
  const data = sandbox.window.EDMUND_PROVERB_SYSTEM_DATA;
  assert.equal(data?.system, "proverb");
  assert.equal(data?.version, "1");
  assert.equal(data?.lessonCount, 3);
  assert.equal(data?.questionCount, 150);
  assert.equal(data?.lessons?.length, 3);

  const canonicalRows = data.lessons.flatMap((lesson, lessonIndex) => {
    assert.equal(lesson.id, LESSON_IDS[lessonIndex]);
    assert.equal(lesson.version, "1");
    assert.equal(lesson.questions?.length, 50);
    return lesson.questions.map((question, index) => {
      const questionId = `${lesson.id}-q${String(index + 1).padStart(2, "0")}`;
      assert.equal(question.id, questionId);
      assert.equal(question.number, index + 1);
      assert.equal(typeof question.answer, "string");
      assert.ok(question.answer.length >= 1);
      const variants = Array.isArray(question.acceptedAnswers)
        ? Array.from(question.acceptedAnswers)
        : [];
      assert.ok(variants.every(answer => typeof answer === "string" && answer.length >= 1));
      return [questionId, [question.answer, ...variants]];
    });
  });
  const expectedCatalog = Object.fromEntries(canonicalRows);
  assert.deepEqual(ACCEPTED_ANSWERS, expectedCatalog);

  const digest = createHash("sha256")
    .update(JSON.stringify(canonicalRows), "utf8")
    .digest("hex");
  assert.equal(digest, CANONICAL_CATALOG_SHA256);
});

test("worker, SQL, and Wrangler contracts are independently proverb-namespaced", () => {
  const workerSource = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
  const sqlSource = fs.readFileSync(
    new URL("../../../supabase-proverb-system.sql", import.meta.url),
    "utf8"
  );
  const forwardMigrationSource = fs.readFileSync(
    new URL("../../../supabase-proverb-system-lessons-2-3.sql", import.meta.url),
    "utf8"
  );
  const wrangler = JSON.parse(
    fs.readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8")
  );
  const packageJson = JSON.parse(
    fs.readFileSync(new URL("../package.json", import.meta.url), "utf8")
  );
  const readme = fs.readFileSync(new URL("../README.md", import.meta.url), "utf8");

  assert.match(workerSource, /const LESSON_IDS = new Set\(\["proverb-01", "proverb-02", "proverb-03"\]\);/);
  assert.match(workerSource, /\^\(proverb-\\d\{2\}\)-q\(\\d\{2\}\)\$/);
  assert.match(sqlSource, /p_lesson_id not in \('proverb-01', 'proverb-02', 'proverb-03'\)/);
  assert.match(sqlSource, /v_question_pattern := '\^' \|\| p_lesson_id \|\| '-q\(0\[1-9\]\|\[1-4\]\[0-9\]\|50\)\$'/);
  assert.match(
    forwardMigrationSource,
    /^--[^]*?begin;\n\nset local lock_timeout = '5s';\nset local statement_timeout = '2min';\n\nselect pg_catalog\.pg_advisory_xact_lock\(/
  );
  assert.match(forwardMigrationSource, /\ncommit;\n$/);
  assert.match(sqlSource, /\^\\\$2a\\\$12\\\$/);
  assert.doesNotMatch(sqlSource, /\\\$2\[aby\]\\\$12/);
  assert.doesNotMatch(workerSource, /sentence-structure/i);
  assert.doesNotMatch(workerSource, /idiom[-_]|idiom-01/i);
  assert.doesNotMatch(sqlSource, /sentence-structure|\^ss|idiom_system|idiom-01/i);
  assert.match(readme, /Sam Proverb Admin/);
  assert.match(sqlSource, /from public\.flashcard_student_sessions session_row/);
  assert.match(sqlSource, /join public\.flashcard_students student/);
  assert.match(
    sqlSource,
    /revoke all on function public\.proverb_system_provision_admin\(text, text\)[\s\S]*?from public, anon, authenticated, service_role;/
  );

  const limiterIds = Object.fromEntries(
    wrangler.ratelimits.map(binding => [binding.name, binding.namespace_id])
  );
  assert.equal(wrangler.name, "edmund-proverb-system");
  assert.equal(
    wrangler.vars.ALLOWED_ORIGINS,
    "https://edmundeducation.com,https://www.edmundeducation.com,https://edmundeducation.github.io"
  );
  assert.equal(limiterIds.ADMIN_LOGIN_RATE_LIMITER, "914072034");
  assert.equal(limiterIds.ATTEMPT_WRITE_RATE_LIMITER, "914072035");
  assert.notEqual(limiterIds.ADMIN_LOGIN_RATE_LIMITER, limiterIds.ATTEMPT_WRITE_RATE_LIMITER);
  assert.match(packageJson.scripts.deploy, /release-check/);

  const workersDirectory = new URL("../../", import.meta.url);
  const siblingLimiterIds = fs.readdirSync(workersDirectory, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name !== "proverb-system")
    .flatMap(entry => {
      const configUrl = new URL(`${entry.name}/wrangler.jsonc`, workersDirectory);
      if (!fs.existsSync(configUrl)) return [];
      const config = JSON.parse(fs.readFileSync(configUrl, "utf8"));
      return (config.ratelimits || []).map(binding => binding.namespace_id);
    });
  assert.ok(!siblingLimiterIds.includes(limiterIds.ADMIN_LOGIN_RATE_LIMITER));
  assert.ok(!siblingLimiterIds.includes(limiterIds.ATTEMPT_WRITE_RATE_LIMITER));
});

test("health reports bookmark limits and canonical catalogue readiness", async () => {
  const response = await worker.fetch(
    new Request("https://worker.example/v1/health"),
    environment()
  );
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.deepEqual(payload.catalog, {
    ready: true,
    acceptedQuestions: 150,
    expectedQuestions: 150
  });
  assert.deepEqual(payload.limits, {
    maxAttemptBodyBytes: 128 * 1024,
    maxAttemptResultBytes: 96 * 1024,
    maxBookmarks: 153,
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

test("admin login uses its proverb-specific rate-limit key", async t => {
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
    assert.equal(rpcName(input), "proverb_system_admin_login");
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
  assert.equal(limiterKey, "proverb-system-admin:203.0.113.7");
});

test("a canonical answer reaches the Proverb attempt RPC unchanged", async t => {
  let upsertPayload = null;
  let attemptLimiterKey = null;
  installFetch(t, async (input, init = {}) => {
    const functionName = rpcName(input);
    const body = JSON.parse(String(init.body || "{}"));
    if (functionName === "proverb_system_student_profile") return jsonResponse(studentProfile());
    if (functionName === "proverb_system_upsert_attempt") {
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
  assert.equal(attemptLimiterKey, `proverb-system-attempt:${STUDENT_ID}`);
  assert.equal(upsertPayload.p_lesson_id, LESSON_ID);
  assert.deepEqual(upsertPayload.p_result.correctIds, [QUESTION_IDS[0]]);
  assert.equal(
    upsertPayload.p_result.questionState[QUESTION_IDS[0]].lastAnswer,
    ACCEPTED_ANSWERS[QUESTION_IDS[0]][0]
  );
});

test("claimed-correct answers fail closed before upsert when unavailable or unapproved", async t => {
  let upsertCalls = 0;
  installFetch(t, async (input, init = {}) => {
    const functionName = rpcName(input);
    if (functionName === "proverb_system_student_profile") return jsonResponse(studentProfile());
    if (functionName === "proverb_system_upsert_attempt") {
      upsertCalls += 1;
      return jsonResponse(attemptRow(JSON.parse(String(init.body || "{}"))));
    }
    throw new Error(`Unexpected RPC: ${functionName}`);
  });

  const response = await worker.fetch(
    attemptRequest(attemptPayload({ answer: "Definitely not an approved canonical Proverb answer." })),
    environment()
  );
  assert.equal(response.status, 400);
  assert.equal((await response.json()).code, "INVALID_ATTEMPT");
  assert.equal(upsertCalls, 0);
});

test("all 153 possible bookmarks round-trip and a 154th is rejected", async t => {
  const bookmarks = LESSON_IDS.flatMap(lessonId => [
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
    if (functionName === "proverb_system_student_profile") return jsonResponse(studentProfile());
    if (functionName === "proverb_system_replace_bookmarks") {
      replaceCalls += 1;
      assert.deepEqual(body.p_bookmarks, bookmarks);
      return jsonResponse(rows);
    }
    if (functionName === "proverb_system_list_bookmarks_page") {
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
  assert.equal((await validResponse.json()).bookmarks.length, 153);
  assert.deepEqual(pageCalls, [[0, 100], [100, 100]]);

  const invalidResponse = await worker.fetch(new Request("https://worker.example/v1/bookmarks", {
    method: "PUT",
    headers: {
      Origin: ORIGIN,
      Authorization: `Bearer ${STUDENT_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ bookmarks: [...bookmarks, bookmarks[0]] })
  }), environment());
  assert.equal(invalidResponse.status, 400);
  assert.equal((await invalidResponse.json()).code, "INVALID_BOOKMARKS");
  assert.equal(replaceCalls, 1, "an oversized list must fail before the replacement RPC");
});

test("attempt byte validation matches PostgreSQL jsonb spacing", async t => {
  let upsertCalled = false;
  installFetch(t, async input => {
    const functionName = rpcName(input);
    if (functionName === "proverb_system_student_profile") return jsonResponse(studentProfile());
    if (functionName === "proverb_system_upsert_attempt") upsertCalled = true;
    throw new Error(`Unexpected RPC: ${functionName}`);
  });

  const startedAt = new Date(Date.now() - 1000).toISOString();
  const roundNumber = 50;
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
    if (functionName === "proverb_system_student_profile") return jsonResponse(studentProfile());
    if (functionName === "proverb_system_upsert_attempt") upsertCalls += 1;
    throw new Error(`Unexpected RPC: ${functionName}`);
  });

  const foreignResponse = await worker.fetch(attemptRequest(attemptPayload({
    lessonId: "ss1",
    questionId: "ss1-q01",
    answer: "Not part of the proverb catalogue."
  })), environment());
  assert.equal(foreignResponse.status, 400);
  assert.equal((await foreignResponse.json()).code, "INVALID_ATTEMPT");

  const questionId = "proverb-01-q51";
  const outOfRangeResponse = await worker.fetch(attemptRequest(attemptPayload({
    questionId,
    answer: "Not part of the proverb catalogue."
  })), environment());
  assert.equal(outOfRangeResponse.status, 400);
  assert.equal((await outOfRangeResponse.json()).code, "INVALID_ATTEMPT");
  assert.equal(upsertCalls, 0);
});
