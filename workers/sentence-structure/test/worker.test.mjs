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

function environment() {
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
    }
  };
}

function jsonResponse(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

test("the Worker answer catalog exactly matches the published lesson data", () => {
  const dataPath = new URL("../../../sentence-structure-data.js", import.meta.url);
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(dataPath, "utf8"), context);
  const published = context.window.EDMUND_SENTENCE_STRUCTURE_DATA;
  const expected = {};
  for (const lesson of published.lessons) {
    for (const question of lesson.questions) {
      expected[question.id] = [question.answer, ...Array.from(question.acceptedAnswers || [])];
    }
  }
  assert.equal(Object.keys(expected).length, 100);
  assert.deepEqual(ACCEPTED_ANSWERS, expected);
});

test("Supabase server credentials are trimmed before becoming HTTP headers", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });

  const key = "s".repeat(64);
  const env = environment();
  delete env.SUPABASE_SERVICE_ROLE_KEY;
  env.SUPABASE_SECRET_KEY = `  ${key}\n`;

  globalThis.fetch = async (_input, init = {}) => {
    const headers = new Headers(init.headers);
    assert.equal(headers.get("apikey"), key);
    assert.equal(headers.get("Authorization"), `Bearer ${key}`);
    return jsonResponse([]);
  };

  const request = new Request("https://worker.example/v1/student/me", {
    headers: {
      Origin: ORIGIN,
      Authorization: `Bearer ${STUDENT_TOKEN}`
    }
  });
  const response = await worker.fetch(request, env);
  assert.equal(response.status, 401);
  assert.equal((await response.json()).code, "STUDENT_AUTH_REQUIRED");
});

test("a valid non-empty correctIds array reaches the attempt RPC unchanged", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });

  let upsertPayload = null;
  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(String(input));
    const functionName = decodeURIComponent(url.pathname.split("/").at(-1));
    const body = JSON.parse(String(init.body || "{}"));

    if (functionName === "sentence_structure_student_profile") {
      assert.equal(body.p_token, STUDENT_TOKEN);
      return jsonResponse([{
        id: STUDENT_ID,
        name: "Test Student",
        session_expires_at: "2026-07-23T00:00:00.000Z"
      }]);
    }
    if (functionName === "sentence_structure_upsert_attempt") {
      upsertPayload = body;
      return jsonResponse([{
        id: ATTEMPT_ID,
        lesson_id: body.p_lesson_id,
        lesson_version: body.p_lesson_version,
        status: body.p_status,
        round_number: body.p_round_number,
        correct_count: body.p_correct_count,
        total_count: body.p_total_count,
        duration_ms: body.p_duration_ms,
        started_at: body.p_started_at,
        completed_at: null,
        updated_at: "2026-07-22T00:01:00.000Z",
        result: body.p_result
      }]);
    }
    throw new Error(`Unexpected RPC: ${functionName}`);
  };

  const startedAt = new Date().toISOString();
  const request = new Request(`https://worker.example/v1/attempts/${ATTEMPT_ID}`, {
    method: "PUT",
    headers: {
      Origin: ORIGIN,
      Authorization: `Bearer ${STUDENT_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      lessonId: "ss1",
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
        correctIds: ["ss1-q01"],
        questionState: {
          "ss1-q01": {
            status: "correct",
            lastAnswer: "I went to the library to borrow a book.",
            reveal: true
          }
        },
        rounds: [{
          round: 1,
          kind: "partial",
          checkedIds: ["ss1-q01"],
          correctIds: ["ss1-q01"],
          incorrectIds: [],
          submittedAt: startedAt
        }],
        awaitingNextRound: false,
        correctionMode: false,
        correctionIds: [],
        collapsedCorrectIds: ["ss1-q01"],
        contentVersion: "1"
      }
    })
  });

  const response = await worker.fetch(request, environment());
  assert.equal(response.status, 200);
  assert.deepEqual(upsertPayload.p_result.correctIds, ["ss1-q01"]);
  assert.equal(upsertPayload.p_result.correctIds.length, 1);
  assert.deepEqual(upsertPayload.p_result.collapsedCorrectIds, ["ss1-q01"]);
  const responseBody = await response.json();
  assert.deepEqual(responseBody.attempt.result.correctIds, ["ss1-q01"]);
});

test("an out-of-catalog question ID is rejected before the attempt RPC", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });

  let upsertCalled = false;
  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(String(input));
    const functionName = decodeURIComponent(url.pathname.split("/").at(-1));
    if (functionName === "sentence_structure_student_profile") {
      return jsonResponse([{
        id: STUDENT_ID,
        name: "Test Student",
        session_expires_at: "2026-07-23T00:00:00.000Z"
      }]);
    }
    if (functionName === "sentence_structure_upsert_attempt") upsertCalled = true;
    throw new Error(`Unexpected RPC: ${functionName}; body=${String(init.body || "")}`);
  };

  const startedAt = new Date().toISOString();
  const request = new Request(`https://worker.example/v1/attempts/${ATTEMPT_ID}`, {
    method: "PUT",
    headers: {
      Origin: ORIGIN,
      Authorization: `Bearer ${STUDENT_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      lessonId: "ss1",
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
        correctIds: ["ss1-q51"],
        questionState: {
          "ss1-q51": { status: "correct", lastAnswer: "Invalid catalog entry.", reveal: true }
        },
        rounds: [],
        awaitingNextRound: false,
        contentVersion: "1"
      }
    })
  });

  const response = await worker.fetch(request, environment());
  assert.equal(response.status, 400);
  assert.equal(upsertCalled, false);
  assert.equal((await response.json()).code, "INVALID_ATTEMPT");
});
