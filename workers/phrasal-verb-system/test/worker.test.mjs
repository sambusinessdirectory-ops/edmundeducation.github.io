import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";

import { ACCEPTED_ANSWERS, LESSON_QUESTION_COUNTS } from "../src/catalog.js";
import worker from "../src/index.js";

const ORIGIN = "https://edmundeducation.github.io";
const STUDENT_TOKEN = "11111111-1111-4111-8111-111111111111";
const STUDENT_ID = "22222222-2222-4222-8222-222222222222";
const ATTEMPT_ID = "33333333-3333-4333-8333-333333333333";
const lessonDataSource = fs.readFileSync(new URL("../../../phrasal-verb-system-data.js", import.meta.url), "utf8");
const lessonDataSandbox = { window: {} };
runInNewContext(lessonDataSource, lessonDataSandbox, { filename: "phrasal-verb-system-data.js", timeout: 1000 });
const LESSON_DATA = lessonDataSandbox.window.EDMUND_PHRASAL_VERB_SYSTEM_DATA;
const LESSON_IDS = Object.keys(LESSON_QUESTION_COUNTS);
const LESSON_ID = "phrasal-verb-01";
const QUESTION_IDS = Array.from(
  { length: LESSON_QUESTION_COUNTS[LESSON_ID] },
  (_, index) => `${LESSON_ID}-q${String(index + 1).padStart(2, "0")}`
);
const ALL_QUESTION_IDS = LESSON_IDS.flatMap((lessonId) => Array.from(
  { length: LESSON_QUESTION_COUNTS[lessonId] },
  (_, index) => `${lessonId}-q${String(index + 1).padStart(2, "0")}`
));
const MAX_BOOKMARKS = 2005;

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
    BOOKMARK_WRITE_RATE_LIMITER: {
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
    totalCount: LESSON_QUESTION_COUNTS[lessonId],
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

test("the protected answer catalogue contains every generated lesson entry", () => {
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
  const data = LESSON_DATA;
  assert.equal(data?.system, "phrasal-verb");
  assert.equal(data?.version, "1");
  assert.equal(data?.lessonCount, LESSON_IDS.length);
  assert.equal(data?.questionCount, ALL_QUESTION_IDS.length);
  assert.equal(data?.lessons?.length, LESSON_IDS.length);

  const canonicalRows = data.lessons.flatMap((lesson, lessonIndex) => {
    assert.equal(lesson.id, LESSON_IDS[lessonIndex]);
    assert.equal(lesson.version, "1");
    assert.equal(lesson.questions?.length, LESSON_QUESTION_COUNTS[lesson.id]);
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
  assert.ok(canonicalRows.every(([, answers]) => answers.length >= 1));
});

test("worker, SQL, and Wrangler contracts are independently phrasal-verb-namespaced", () => {
  const workerSource = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
  const sqlSource = fs.readFileSync(
    new URL("../../../supabase-phrasal-verb-system.sql", import.meta.url),
    "utf8"
  );
  const expansionSqlSource = fs.readFileSync(
    new URL("../../../supabase-phrasal-verb-system-lessons-36-329.sql", import.meta.url),
    "utf8"
  );
  const wrangler = JSON.parse(
    fs.readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8")
  );
  const packageJson = JSON.parse(
    fs.readFileSync(new URL("../package.json", import.meta.url), "utf8")
  );
  const readme = fs.readFileSync(new URL("../README.md", import.meta.url), "utf8");

  assert.match(workerSource, /const LESSON_IDS = new Set\(Object\.keys\(LESSON_QUESTION_COUNTS\)\)/);
  assert.match(workerSource, /hasOwnProperty\.call\(ACCEPTED_ANSWERS, questionId\)/);
  assert.match(sqlSource, /_phrasal_verb_system_question_count/);
  const sqlQuestionCounts = Object.fromEntries([...sqlSource.matchAll(
    /\('(?<lessonId>phrasal-verb-\d{2,3})'::text, (?<questionCount>\d+)::integer\)/g
  )].map(match => [match.groups.lessonId, Number(match.groups.questionCount)]));
  assert.deepEqual(sqlQuestionCounts, LESSON_QUESTION_COUNTS);
  assert.match(sqlSource, /_phrasal_verb_system_question_id_valid/);
  assert.doesNotMatch(sqlSource, /v_question_pattern/);
  assert.match(expansionSqlSource, /pg_catalog\.strpos\(/);
  assert.doesNotMatch(expansionSqlSource, /pg_catalog\.position\(/);
  assert.match(sqlSource, /\^\\\$2a\\\$12\\\$/);
  assert.doesNotMatch(sqlSource, /\\\$2\[aby\]\\\$12/);
  assert.doesNotMatch(workerSource, /sentence-structure/i);
  assert.doesNotMatch(workerSource, /idiom[-_]|idiom-01/i);
  assert.doesNotMatch(workerSource, /proverb[-_]|proverb-01/i);
  assert.doesNotMatch(sqlSource, /sentence-structure|\^ss|idiom_system|idiom-01|proverb_system|proverb-01/i);
  assert.match(readme, /Sam Phrasal Verb Admin/);
  assert.match(sqlSource, /from public\.flashcard_student_sessions session_row/);
  assert.match(sqlSource, /join public\.flashcard_students student/);
  assert.match(
    sqlSource,
    /revoke all on function public\.phrasal_verb_system_provision_admin\(text, text\)[\s\S]*?from public, anon, authenticated, service_role;/
  );

  const limiterIds = Object.fromEntries(
    wrangler.ratelimits.map(binding => [binding.name, binding.namespace_id])
  );
  assert.equal(wrangler.name, "edmund-phrasal-verb-system");
  assert.equal(
    wrangler.vars.ALLOWED_ORIGINS,
    "https://edmundeducation.com,https://www.edmundeducation.com,https://edmundeducation.github.io"
  );
  assert.equal(limiterIds.ADMIN_LOGIN_RATE_LIMITER, "914072036");
  assert.equal(limiterIds.ATTEMPT_WRITE_RATE_LIMITER, "914072037");
  assert.equal(limiterIds.BOOKMARK_WRITE_RATE_LIMITER, "914072038");
  assert.notEqual(limiterIds.ADMIN_LOGIN_RATE_LIMITER, limiterIds.ATTEMPT_WRITE_RATE_LIMITER);
  assert.notEqual(limiterIds.ADMIN_LOGIN_RATE_LIMITER, limiterIds.BOOKMARK_WRITE_RATE_LIMITER);
  assert.notEqual(limiterIds.ATTEMPT_WRITE_RATE_LIMITER, limiterIds.BOOKMARK_WRITE_RATE_LIMITER);
  assert.match(packageJson.scripts.deploy, /release-check/);

  const workersDirectory = new URL("../../", import.meta.url);
  const siblingLimiterIds = fs.readdirSync(workersDirectory, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name !== "phrasal-verb-system")
    .flatMap(entry => {
      const configUrl = new URL(`${entry.name}/wrangler.jsonc`, workersDirectory);
      if (!fs.existsSync(configUrl)) return [];
      const config = JSON.parse(fs.readFileSync(configUrl, "utf8"));
      return (config.ratelimits || []).map(binding => binding.namespace_id);
    });
  assert.ok(!siblingLimiterIds.includes(limiterIds.ADMIN_LOGIN_RATE_LIMITER));
  assert.ok(!siblingLimiterIds.includes(limiterIds.ATTEMPT_WRITE_RATE_LIMITER));
  assert.ok(!siblingLimiterIds.includes(limiterIds.BOOKMARK_WRITE_RATE_LIMITER));
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
    acceptedQuestions: ALL_QUESTION_IDS.length,
    expectedQuestions: ALL_QUESTION_IDS.length
  });
  assert.deepEqual(payload.limits, {
    maxAttemptBodyBytes: 512 * 1024,
    maxAttemptResultBytes: 384 * 1024,
    maxBookmarks: MAX_BOOKMARKS,
    maxPageSize: 100
  });
  assert.deepEqual(payload.rateLimiters, {
    adminLogin: true,
    attemptWrite: true,
    bookmarkWrite: true
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

test("admin login uses its phrasal-verb-specific rate-limit key", async t => {
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
    assert.equal(rpcName(input), "phrasal_verb_system_admin_login");
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
  assert.equal(limiterKey, "phrasal-verb-system-admin:203.0.113.7");
});

test("a canonical answer reaches the Phrasal Verb attempt RPC unchanged", async t => {
  let upsertPayload = null;
  let attemptLimiterKey = null;
  installFetch(t, async (input, init = {}) => {
    const functionName = rpcName(input);
    const body = JSON.parse(String(init.body || "{}"));
    if (functionName === "phrasal_verb_system_student_profile") return jsonResponse(studentProfile());
    if (functionName === "phrasal_verb_system_upsert_attempt") {
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
  assert.equal(attemptLimiterKey, `phrasal-verb-system-attempt:${STUDENT_ID}`);
  assert.equal(upsertPayload.p_lesson_id, LESSON_ID);
  assert.deepEqual(upsertPayload.p_result.correctIds, [QUESTION_IDS[0]]);
  assert.equal(
    upsertPayload.p_result.questionState[QUESTION_IDS[0]].lastAnswer,
    ACCEPTED_ANSWERS[QUESTION_IDS[0]][0]
  );
});

test("attempt state conflicts remain 409 so the browser can reload and merge", async t => {
  installFetch(t, async input => {
    const functionName = rpcName(input);
    if (functionName === "phrasal_verb_system_student_profile") {
      return jsonResponse(studentProfile());
    }
    if (functionName === "phrasal_verb_system_upsert_attempt") {
      return jsonResponse({
        code: "22023",
        message: "Attempt progress cannot move backwards"
      }, 400);
    }
    throw new Error(`Unexpected RPC: ${functionName}`);
  });

  const response = await worker.fetch(attemptRequest(attemptPayload()), environment());
  assert.equal(response.status, 409);
  assert.equal((await response.json()).code, "ATTEMPT_CONFLICT");
});

test("non-conflict Supabase failures remain generic 502 responses", async t => {
  installFetch(t, async input => {
    const functionName = rpcName(input);
    if (functionName === "phrasal_verb_system_student_profile") {
      return jsonResponse(studentProfile());
    }
    if (functionName === "phrasal_verb_system_upsert_attempt") {
      return jsonResponse({ code: "57014", message: "statement timeout" }, 500);
    }
    throw new Error(`Unexpected RPC: ${functionName}`);
  });

  const response = await worker.fetch(attemptRequest(attemptPayload()), environment());
  assert.equal(response.status, 502);
  assert.equal((await response.json()).code, "DATA_SERVICE_UNAVAILABLE");
});

test("three-digit lessons and q100-q250 remain canonical", async t => {
  const lastLessonId = "phrasal-verb-329";
  const lastQuestionId = `${lastLessonId}-q${String(LESSON_QUESTION_COUNTS[lastLessonId]).padStart(2, "0")}`;
  assert.ok(ACCEPTED_ANSWERS[lastQuestionId]?.length, "the final lesson answer must be protected");
  assert.ok(ACCEPTED_ANSWERS["phrasal-verb-269-q100"]?.length, "q100 must use the canonical unpadded ID");
  assert.ok(ACCEPTED_ANSWERS["phrasal-verb-269-q250"]?.length, "q250 must use the canonical unpadded ID");
  assert.equal(ACCEPTED_ANSWERS["phrasal-verb-269-q010"], undefined);

  let upsertPayload = null;
  installFetch(t, async (input, init = {}) => {
    const functionName = rpcName(input);
    const body = JSON.parse(String(init.body || "{}"));
    if (functionName === "phrasal_verb_system_student_profile") return jsonResponse(studentProfile());
    if (functionName === "phrasal_verb_system_upsert_attempt") {
      upsertPayload = body;
      return jsonResponse(attemptRow(body));
    }
    throw new Error(`Unexpected RPC: ${functionName}`);
  });

  const response = await worker.fetch(attemptRequest(attemptPayload({
    lessonId: lastLessonId,
    questionId: lastQuestionId,
    answer: ACCEPTED_ANSWERS[lastQuestionId][0]
  })), environment());
  assert.equal(response.status, 200);
  assert.equal(upsertPayload.p_lesson_id, lastLessonId);
  assert.deepEqual(upsertPayload.p_result.correctIds, [lastQuestionId]);
});

test("an explicitly approved Rule-4 answer variant is accepted", async t => {
  const questionId = QUESTION_IDS.find(id => ACCEPTED_ANSWERS[id]?.length > 1);
  assert.ok(questionId, "the canonical data must contain an approved variant");
  const approvedVariant = ACCEPTED_ANSWERS[questionId][1];
  let upsertPayload = null;
  installFetch(t, async (input, init = {}) => {
    const functionName = rpcName(input);
    const body = JSON.parse(String(init.body || "{}"));
    if (functionName === "phrasal_verb_system_student_profile") return jsonResponse(studentProfile());
    if (functionName === "phrasal_verb_system_upsert_attempt") {
      upsertPayload = body;
      return jsonResponse(attemptRow(body));
    }
    throw new Error(`Unexpected RPC: ${functionName}`);
  });

  const response = await worker.fetch(
    attemptRequest(attemptPayload({ questionId, answer: approvedVariant })),
    environment()
  );
  assert.equal(response.status, 200);
  assert.equal(upsertPayload.p_result.questionState[questionId].lastAnswer, approvedVariant);
});

test("answer reveal entitlement is derived from validated correction state", async t => {
  let upsertPayload = null;
  installFetch(t, async (input, init = {}) => {
    const functionName = rpcName(input);
    const body = JSON.parse(String(init.body || "{}"));
    if (functionName === "phrasal_verb_system_student_profile") return jsonResponse(studentProfile());
    if (functionName === "phrasal_verb_system_upsert_attempt") {
      upsertPayload = body;
      return jsonResponse(attemptRow(body));
    }
    throw new Error(`Unexpected RPC: ${functionName}`);
  });

  const startedAt = new Date(Date.now() - 1000).toISOString();
  const payload = {
    lessonId: LESSON_ID,
    lessonVersion: "1",
    status: "in_progress",
    roundNumber: 2,
    correctCount: 0,
    totalCount: LESSON_QUESTION_COUNTS[LESSON_ID],
    durationMs: 1000,
    startedAt,
    completedAt: null,
    result: {
      round: 2,
      correctIds: [],
      questionState: {
        [QUESTION_IDS[0]]: {
          status: "wrong",
          lastAnswer: "an incorrect answer",
          reveal: true
        },
        [QUESTION_IDS[1]]: {
          status: "pending",
          lastAnswer: "",
          reveal: true
        }
      },
      rounds: [{
        round: 2,
        kind: "partial",
        checkedIds: [QUESTION_IDS[0]],
        correctIds: [],
        incorrectIds: [QUESTION_IDS[0]],
        submittedAt: startedAt
      }],
      awaitingNextRound: false,
      correctionMode: true,
      correctionIds: [QUESTION_IDS[0]],
      collapsedCorrectIds: [],
      contentVersion: "1"
    }
  };

  const response = await worker.fetch(attemptRequest(payload), environment());
  assert.equal(response.status, 200);
  assert.equal(upsertPayload.p_result.questionState[QUESTION_IDS[0]].reveal, false);
  assert.equal(upsertPayload.p_result.questionState[QUESTION_IDS[1]].reveal, false);
});

test("claimed-correct answers fail closed before upsert when unavailable or unapproved", async t => {
  let upsertCalls = 0;
  installFetch(t, async (input, init = {}) => {
    const functionName = rpcName(input);
    if (functionName === "phrasal_verb_system_student_profile") return jsonResponse(studentProfile());
    if (functionName === "phrasal_verb_system_upsert_attempt") {
      upsertCalls += 1;
      return jsonResponse(attemptRow(JSON.parse(String(init.body || "{}"))));
    }
    throw new Error(`Unexpected RPC: ${functionName}`);
  });

  const response = await worker.fetch(
    attemptRequest(attemptPayload({ answer: "Definitely not an approved canonical Phrasal Verb answer." })),
    environment()
  );
  assert.equal(response.status, 400);
  assert.equal((await response.json()).code, "INVALID_ATTEMPT");
  assert.equal(upsertCalls, 0);
});

test("the bounded bookmark catalogue round-trips, includes high IDs, and rejects an oversized list", async t => {
  const allBookmarks = LESSON_IDS.flatMap((lessonId) => [
    { lessonId, questionId: "__section__", includeAnswer: false },
    ...Array.from({ length: LESSON_QUESTION_COUNTS[lessonId] }, (_, index) => ({
      lessonId,
      questionId: `${lessonId}-q${String(index + 1).padStart(2, "0")}`,
      includeAnswer: index % 2 === 0
    }))
  ]);
  const highestLessonId = LESSON_IDS.at(-1);
  const bookmarks = [
    ...allBookmarks.filter(bookmark => bookmark.lessonId === highestLessonId),
    ...allBookmarks.filter(bookmark => bookmark.lessonId !== highestLessonId)
  ].slice(0, MAX_BOOKMARKS);
  assert.ok(bookmarks.some(bookmark => bookmark.lessonId === "phrasal-verb-329"));
  const rows = bookmarks.map((bookmark, index) => ({
    lesson_id: bookmark.lessonId,
    question_id: bookmark.questionId,
    include_answer: bookmark.includeAnswer,
    created_at: new Date(Date.UTC(2026, 6, 27, 0, 0, index)).toISOString()
  }));
  let replaceCalls = 0;
  let bookmarkLimiterKey = null;
  const pageCalls = [];
  installFetch(t, async (input, init = {}) => {
    const functionName = rpcName(input);
    const body = JSON.parse(String(init.body || "{}"));
    if (functionName === "phrasal_verb_system_student_profile") return jsonResponse(studentProfile());
    if (functionName === "phrasal_verb_system_replace_bookmarks") {
      replaceCalls += 1;
      assert.deepEqual(body.p_bookmarks, bookmarks);
      return jsonResponse(rows);
    }
    if (functionName === "phrasal_verb_system_list_bookmarks_page") {
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
  }), environment({
    BOOKMARK_WRITE_RATE_LIMITER: {
      async limit({ key }) {
        bookmarkLimiterKey = key;
        return { success: true };
      }
    }
  }));
  assert.equal(validResponse.status, 200);
  assert.equal((await validResponse.json()).bookmarks.length, MAX_BOOKMARKS);
  assert.equal(bookmarkLimiterKey, `phrasal-verb-system-bookmark:${STUDENT_ID}`);
  assert.deepEqual(pageCalls, Array.from({ length: Math.ceil(MAX_BOOKMARKS / 100) }, (_, index) => [index * 100, 100]));

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

test("bookmark writes fail closed when the dedicated limiter rejects them", async t => {
  let replaceCalls = 0;
  installFetch(t, async input => {
    const functionName = rpcName(input);
    if (functionName === "phrasal_verb_system_student_profile") return jsonResponse(studentProfile());
    if (functionName === "phrasal_verb_system_replace_bookmarks") replaceCalls += 1;
    throw new Error(`Unexpected RPC: ${functionName}`);
  });

  const response = await worker.fetch(new Request("https://worker.example/v1/bookmarks", {
    method: "PUT",
    headers: {
      Origin: ORIGIN,
      Authorization: `Bearer ${STUDENT_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ bookmarks: [] })
  }), environment({
    BOOKMARK_WRITE_RATE_LIMITER: {
      async limit() {
        return { success: false };
      }
    }
  }));
  assert.equal(response.status, 429);
  assert.equal((await response.json()).code, "TOO_MANY_BOOKMARK_WRITES");
  assert.equal(replaceCalls, 0);
});

test("attempt write throttling is retryable and never reaches Supabase", async t => {
  let upsertCalls = 0;
  installFetch(t, async input => {
    const functionName = rpcName(input);
    if (functionName === "phrasal_verb_system_student_profile") return jsonResponse(studentProfile());
    if (functionName === "phrasal_verb_system_upsert_attempt") upsertCalls += 1;
    throw new Error(`Unexpected RPC: ${functionName}`);
  });

  const response = await worker.fetch(attemptRequest(attemptPayload()), environment({
    ATTEMPT_WRITE_RATE_LIMITER: {
      async limit() {
        return { success: false };
      }
    }
  }));

  assert.equal(response.status, 429);
  assert.equal(response.headers.get("Retry-After"), "5");
  assert.match(response.headers.get("Access-Control-Expose-Headers") || "", /\bRetry-After\b/i);
  assert.equal((await response.json()).code, "TOO_MANY_ATTEMPT_WRITES");
  assert.equal(upsertCalls, 0);
});

test("attempt limiter outages return a bounded retry interval", async t => {
  let upsertCalls = 0;
  installFetch(t, async input => {
    const functionName = rpcName(input);
    if (functionName === "phrasal_verb_system_student_profile") return jsonResponse(studentProfile());
    if (functionName === "phrasal_verb_system_upsert_attempt") upsertCalls += 1;
    throw new Error(`Unexpected RPC: ${functionName}`);
  });

  const response = await worker.fetch(attemptRequest(attemptPayload()), environment({
    ATTEMPT_WRITE_RATE_LIMITER: {
      async limit() {
        throw new Error("limiter unavailable");
      }
    }
  }));

  assert.equal(response.status, 503);
  assert.equal(response.headers.get("Retry-After"), "5");
  assert.equal((await response.json()).code, "RATE_LIMIT_UNAVAILABLE");
  assert.equal(upsertCalls, 0);
});

test("attempt byte validation matches PostgreSQL jsonb spacing", async t => {
  let upsertCalled = false;
  installFetch(t, async input => {
    const functionName = rpcName(input);
    if (functionName === "phrasal_verb_system_student_profile") return jsonResponse(studentProfile());
    if (functionName === "phrasal_verb_system_upsert_attempt") upsertCalled = true;
    throw new Error(`Unexpected RPC: ${functionName}`);
  });

  const startedAt = new Date(Date.now() - 1000).toISOString();
  const roundNumber = 116;
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
    Buffer.byteLength(JSON.stringify(result), "utf8") < 384 * 1024,
    "fixture must fit a compact-JSON-only check"
  );

  const response = await worker.fetch(attemptRequest({
    lessonId: LESSON_ID,
    lessonVersion: "1",
    status: "in_progress",
    roundNumber,
    correctCount: 0,
    totalCount: LESSON_QUESTION_COUNTS[LESSON_ID],
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
    if (functionName === "phrasal_verb_system_student_profile") return jsonResponse(studentProfile());
    if (functionName === "phrasal_verb_system_upsert_attempt") upsertCalls += 1;
    throw new Error(`Unexpected RPC: ${functionName}`);
  });

  const foreignResponse = await worker.fetch(attemptRequest(attemptPayload({
    lessonId: "ss1",
    questionId: "ss1-q01",
    answer: "Not part of the phrasal-verb catalogue."
  })), environment());
  assert.equal(foreignResponse.status, 400);
  assert.equal((await foreignResponse.json()).code, "INVALID_ATTEMPT");

  const questionId = "phrasal-verb-01-q71";
  const outOfRangeResponse = await worker.fetch(attemptRequest(attemptPayload({
    questionId,
    answer: "Not part of the phrasal-verb catalogue."
  })), environment());
  assert.equal(outOfRangeResponse.status, 400);
  assert.equal((await outOfRangeResponse.json()).code, "INVALID_ATTEMPT");
  assert.equal(upsertCalls, 0);
});
