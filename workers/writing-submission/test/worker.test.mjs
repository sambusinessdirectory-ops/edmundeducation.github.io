import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import worker from "../src/index.js";

const ORIGIN = "https://edmundeducation.github.io";
const BAD_ORIGIN = "https://attacker.example";
const STUDENT_TOKEN = "11111111-1111-4111-8111-111111111111";
const STUDENT_ID = "22222222-2222-4222-8222-222222222222";
const SUBMISSION_ID = "33333333-3333-4333-8333-333333333333";
const OCCURRENCE_ID = "44444444-4444-4444-8444-444444444444";
const ADMIN_TOKEN = "55555555-5555-4555-8555-555555555555";
const ADMIN_ID = "66666666-6666-4666-8666-666666666666";
const FINGERPRINT = "a".repeat(64);

function limiter(success = true) {
  return {
    calls: [],
    async limit(value) {
      this.calls.push(value);
      return { success };
    }
  };
}

function environment(overrides = {}) {
  return {
    ALLOWED_ORIGINS: ORIGIN,
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "x".repeat(64),
    ADMIN_LOGIN_RATE_LIMITER: limiter(),
    SUBMISSION_WRITE_RATE_LIMITER: limiter(),
    GRAMMAR_WRITE_RATE_LIMITER: limiter(),
    ...overrides
  };
}

function jsonResponse(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function rpcRequest(input, init = {}) {
  const url = new URL(String(input));
  return {
    name: decodeURIComponent(url.pathname.split("/").at(-1)),
    body: JSON.parse(String(init.body || "{}")),
    headers: new Headers(init.headers)
  };
}

function studentProfile() {
  return [{
    id: STUDENT_ID,
    name: "Test Student",
    session_expires_at: "2026-08-30T00:00:00.000Z"
  }];
}

function adminProfile() {
  return [{
    id: ADMIN_ID,
    name: "Writing Administrator",
    expires_at: "2026-08-01T00:00:00.000Z"
  }];
}

function occurrence(overrides = {}) {
  return {
    id: OCCURRENCE_ID,
    fingerprint: FINGERPRINT,
    ruleId: "SubjectVerbAgreement",
    title: "Subject–verb agreement",
    message: "A plural subject takes the base verb form.",
    originalText: "companies requires",
    suggestedText: "companies require",
    sentenceText: "More companies requires staff to wear uniforms.",
    detectedAt: new Date().toISOString(),
    ...overrides
  };
}

test("health fails closed unless every security binding is configured", async () => {
  const complete = await worker.fetch(
    new Request("https://worker.example/v1/health"),
    environment()
  );
  assert.equal(complete.status, 200);
  assert.equal((await complete.json()).ok, true);

  const missing = environment();
  delete missing.GRAMMAR_WRITE_RATE_LIMITER;
  const incomplete = await worker.fetch(
    new Request("https://worker.example/v1/health"),
    missing
  );
  assert.equal(incomplete.status, 503);
  assert.equal((await incomplete.json()).ok, false);
});

test("protected routes enforce the exact configured origin before Supabase", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let upstreamCalled = false;
  globalThis.fetch = async () => {
    upstreamCalled = true;
    throw new Error("must not be called");
  };

  const response = await worker.fetch(new Request("https://worker.example/v1/student/me", {
    headers: { Origin: BAD_ORIGIN, Authorization: `Bearer ${STUDENT_TOKEN}` }
  }), environment());
  assert.equal(response.status, 403);
  assert.equal((await response.json()).code, "ORIGIN_NOT_ALLOWED");
  assert.equal(upstreamCalled, false);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), null);
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

  const response = await worker.fetch(new Request("https://worker.example/v1/student/me", {
    headers: { Origin: ORIGIN, Authorization: `Bearer ${STUDENT_TOKEN}` }
  }), env);
  assert.equal(response.status, 401);
  assert.equal((await response.json()).code, "STUDENT_AUTH_REQUIRED");
});

test("a valid submission derives its owner and word count on the Worker", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let submittedPayload = null;

  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") {
      assert.equal(rpc.body.p_token, STUDENT_TOKEN);
      return jsonResponse(studentProfile());
    }
    if (rpc.name === "writing_submission_submit") {
      submittedPayload = rpc.body;
      return jsonResponse([{
        id: rpc.body.p_id,
        topic: rpc.body.p_topic,
        answer: rpc.body.p_answer,
        word_count: rpc.body.p_word_count,
        submitted_at: "2026-07-31T00:00:00.000Z"
      }]);
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const response = await worker.fetch(new Request(
    `https://worker.example/v1/submissions/${SUBMISSION_ID}`,
    {
      method: "PUT",
      headers: {
        Origin: ORIGIN,
        Authorization: `Bearer ${STUDENT_TOKEN}`,
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        topic: "Should companies require uniforms?",
        answer: "Many companies require staff to wear uniforms."
      })
    }
  ), environment());

  const responseText = await response.text();
  assert.equal(response.status, 200, responseText);
  assert.equal(submittedPayload.p_student_id, STUDENT_ID);
  assert.equal(submittedPayload.p_id, SUBMISSION_ID);
  assert.equal(submittedPayload.p_word_count, 7);
  assert.equal(JSON.parse(responseText).submission.wordCount, 7);
});

test("submission payloads cannot choose a student ID or add unknown fields", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let submitCalled = false;
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    if (rpc.name === "writing_submission_submit") submitCalled = true;
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const response = await worker.fetch(new Request(
    `https://worker.example/v1/submissions/${SUBMISSION_ID}`,
    {
      method: "PUT",
      headers: {
        Origin: ORIGIN,
        Authorization: `Bearer ${STUDENT_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        topic: "A prompt",
        answer: "A complete answer.",
        studentId: "77777777-7777-4777-8777-777777777777"
      })
    }
  ), environment());
  assert.equal(response.status, 400);
  assert.equal((await response.json()).code, "INVALID_SUBMISSION");
  assert.equal(submitCalled, false);
});

test("submission writes require JSON and are bounded before the storage RPC", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let submitCalled = false;
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    if (rpc.name === "writing_submission_submit") submitCalled = true;
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const response = await worker.fetch(new Request(
    `https://worker.example/v1/submissions/${SUBMISSION_ID}`,
    {
      method: "PUT",
      headers: { Origin: ORIGIN, Authorization: `Bearer ${STUDENT_TOKEN}` },
      body: JSON.stringify({ topic: "Prompt", answer: "Answer." })
    }
  ), environment());
  assert.equal(response.status, 415);
  assert.equal(submitCalled, false);
});

test("student history is paginated and full detail includes grammar occurrences", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  const rows = Array.from({ length: 3 }, (_, index) => ({
    id: index === 0 ? SUBMISSION_ID : `${index + 3}3333333-3333-4333-8333-333333333333`,
    topic: `Prompt ${index + 1}`,
    answer_preview: `Preview ${index + 1}`,
    word_count: 10 + index,
    submitted_at: `2026-07-${31 - index}T00:00:00.000Z`
  }));

  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    if (rpc.name === "writing_submission_list") {
      assert.equal(rpc.body.p_limit, 3);
      assert.equal(rpc.body.p_offset, 0);
      return jsonResponse(rows);
    }
    if (rpc.name === "writing_submission_get") {
      return jsonResponse([{
        id: SUBMISSION_ID,
        topic: "Prompt 1",
        answer: "Full answer.",
        word_count: 2,
        submitted_at: "2026-07-31T00:00:00.000Z"
      }]);
    }
    if (rpc.name === "writing_submission_list_occurrences") {
      return jsonResponse([{
        ...occurrence(),
        document_id: SUBMISSION_ID,
        rule_id: "SubjectVerbAgreement",
        original_text: "companies requires",
        suggested_text: "companies require",
        sentence_text: "More companies requires staff.",
        detected_at: "2026-07-31T00:00:00.000Z"
      }]);
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const listResponse = await worker.fetch(new Request(
    "https://worker.example/v1/submissions?page=1&pageSize=2",
    { headers: { Origin: ORIGIN, Authorization: `Bearer ${STUDENT_TOKEN}` } }
  ), environment());
  assert.equal(listResponse.status, 200);
  const listBody = await listResponse.json();
  assert.equal(listBody.submissions.length, 2);
  assert.equal(listBody.hasMore, true);
  assert.equal(listBody.submissions[0].answerPreview, "Preview 1");

  const detailResponse = await worker.fetch(new Request(
    `https://worker.example/v1/submissions/${SUBMISSION_ID}`,
    { headers: { Origin: ORIGIN, Authorization: `Bearer ${STUDENT_TOKEN}` } }
  ), environment());
  assert.equal(detailResponse.status, 200);
  const detailBody = await detailResponse.json();
  assert.equal(detailBody.submission.answer, "Full answer.");
  assert.equal(detailBody.grammarOccurrences[0].ruleId, "SubjectVerbAgreement");
});

test("grammar batches preserve stable identifiers and return dedupe counts", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let issuePayload = null;
  const beforeRequest = Date.now();
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    if (rpc.name === "writing_submission_record_issue_batch") {
      issuePayload = rpc.body;
      return jsonResponse([{ accepted_count: 1, inserted_count: 1 }]);
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const response = await worker.fetch(new Request(
    "https://worker.example/v1/grammar-occurrences/batch",
    {
      method: "POST",
      headers: {
        Origin: ORIGIN,
        Authorization: `Bearer ${STUDENT_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        documentId: SUBMISSION_ID,
        occurrences: [occurrence({ detectedAt: "2099-01-01T00:00:00.000Z" })]
      })
    }
  ), environment());
  assert.equal(response.status, 200);
  assert.equal(issuePayload.p_student_id, STUDENT_ID);
  assert.equal(issuePayload.p_document_id, SUBMISSION_ID);
  assert.equal(issuePayload.p_occurrences[0].fingerprint, FINGERPRINT);
  const storedDetectedAt = Date.parse(issuePayload.p_occurrences[0].detectedAt);
  assert.ok(storedDetectedAt >= beforeRequest);
  assert.ok(storedDetectedAt <= Date.now());
  assert.deepEqual(await response.json(), { acceptedCount: 1, insertedCount: 1 });
});

test("duplicate grammar fingerprints are rejected before the storage RPC", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let issueRpcCalled = false;
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    if (rpc.name === "writing_submission_record_issue_batch") issueRpcCalled = true;
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const response = await worker.fetch(new Request(
    "https://worker.example/v1/grammar-occurrences/batch",
    {
      method: "POST",
      headers: {
        Origin: ORIGIN,
        Authorization: `Bearer ${STUDENT_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        documentId: SUBMISSION_ID,
        occurrences: [
          occurrence(),
          occurrence({ id: "77777777-7777-4777-8777-777777777777" })
        ]
      })
    }
  ), environment());
  assert.equal(response.status, 400);
  assert.equal((await response.json()).code, "INVALID_GRAMMAR_BATCH");
  assert.equal(issueRpcCalled, false);
});

test("grammar writes fail closed when the per-student limiter denies them", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let issueRpcCalled = false;
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    issueRpcCalled = true;
    throw new Error("unexpected storage call");
  };
  const denied = limiter(false);
  const response = await worker.fetch(new Request(
    "https://worker.example/v1/grammar-occurrences/batch",
    {
      method: "POST",
      headers: {
        Origin: ORIGIN,
        Authorization: `Bearer ${STUDENT_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ documentId: SUBMISSION_ID, occurrences: [occurrence()] })
    }
  ), environment({ GRAMMAR_WRITE_RATE_LIMITER: denied }));
  assert.equal(response.status, 429);
  assert.equal((await response.json()).code, "TOO_MANY_GRAMMAR_WRITES");
  assert.deepEqual(denied.calls, [{ key: `writing-submission-grammar:${STUDENT_ID}` }]);
  assert.equal(issueRpcCalled, false);
});

test("grammar problem log maps durable per-rule aggregates", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    if (rpc.name === "writing_submission_problem_summary") {
      assert.equal(rpc.body.p_student_id, STUDENT_ID);
      return jsonResponse([{
        rule_id: "SubjectVerbAgreement",
        title: "Subject–verb agreement",
        occurrence_count: 4,
        first_seen_at: "2026-07-01T00:00:00.000Z",
        last_seen_at: "2026-07-31T00:00:00.000Z"
      }]);
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };
  const response = await worker.fetch(new Request(
    "https://worker.example/v1/grammar-problems",
    { headers: { Origin: ORIGIN, Authorization: `Bearer ${STUDENT_TOKEN}` } }
  ), environment());
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.grammarProblems[0].occurrenceCount, 4);
});

test("admin login is rate limited before password parsing or bcrypt RPC", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let upstreamCalled = false;
  globalThis.fetch = async () => {
    upstreamCalled = true;
    throw new Error("must not be called");
  };
  const denied = limiter(false);
  const response = await worker.fetch(new Request(
    "https://worker.example/v1/admin/login",
    {
      method: "POST",
      headers: {
        Origin: ORIGIN,
        "CF-Connecting-IP": "203.0.113.9",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username: "Admin", password: "not-logged" })
    }
  ), environment({ ADMIN_LOGIN_RATE_LIMITER: denied }));
  assert.equal(response.status, 429);
  assert.equal((await response.json()).code, "TOO_MANY_ATTEMPTS");
  assert.deepEqual(denied.calls, [{ key: "writing-submission-admin:203.0.113.9" }]);
  assert.equal(upstreamCalled, false);
});

test("administrator list and detail routes use only the dedicated admin token", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_admin_me") {
      assert.equal(rpc.body.p_admin_token, ADMIN_TOKEN);
      return jsonResponse(adminProfile());
    }
    if (rpc.name === "writing_submission_admin_list_students") {
      return jsonResponse([{
        id: STUDENT_ID,
        name: "Test Student",
        submission_count: 2,
        grammar_occurrence_count: 5,
        grammar_rule_count: 3,
        last_submission_at: "2026-07-31T00:00:00.000Z"
      }]);
    }
    if (rpc.name === "writing_submission_admin_list_submissions") {
      assert.equal(rpc.body.p_student_id, STUDENT_ID);
      return jsonResponse([{
        id: SUBMISSION_ID,
        student_id: STUDENT_ID,
        student_name: "Test Student",
        topic: "Prompt",
        answer_preview: "Preview",
        word_count: 20,
        submitted_at: "2026-07-31T00:00:00.000Z"
      }]);
    }
    if (rpc.name === "writing_submission_admin_get_submission") {
      return jsonResponse([{
        id: SUBMISSION_ID,
        student_id: STUDENT_ID,
        student_name: "Test Student",
        topic: "Prompt",
        answer: "Full answer",
        word_count: 2,
        submitted_at: "2026-07-31T00:00:00.000Z"
      }]);
    }
    if (rpc.name === "writing_submission_admin_list_occurrences") return jsonResponse([]);
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const authHeaders = { Origin: ORIGIN, Authorization: `Bearer ${ADMIN_TOKEN}` };
  const studentsResponse = await worker.fetch(new Request(
    "https://worker.example/v1/admin/students",
    { headers: authHeaders }
  ), environment());
  assert.equal(studentsResponse.status, 200);
  assert.equal((await studentsResponse.json()).students[0].grammarRuleCount, 3);

  const listResponse = await worker.fetch(new Request(
    `https://worker.example/v1/admin/submissions?studentId=${STUDENT_ID}`,
    { headers: authHeaders }
  ), environment());
  assert.equal(listResponse.status, 200);
  assert.equal((await listResponse.json()).submissions[0].studentName, "Test Student");

  const detailResponse = await worker.fetch(new Request(
    `https://worker.example/v1/admin/submissions/${SUBMISSION_ID}`,
    { headers: authHeaders }
  ), environment());
  assert.equal(detailResponse.status, 200);
  assert.equal((await detailResponse.json()).submission.answer, "Full answer");
});

test("the migration keeps tables private and provisioning unavailable to service_role", () => {
  const migration = fs.readFileSync(
    new URL("../../../supabase-writing-submission.sql", import.meta.url),
    "utf8"
  );
  for (const table of [
    "writing_submission_admin_accounts",
    "writing_submission_admin_sessions",
    "writing_submissions",
    "writing_submission_issue_occurrences"
  ]) {
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security;`));
    assert.match(migration, new RegExp(`revoke all on table public\\.${table}`));
  }
  assert.match(
    migration,
    /revoke all on function public\.writing_submission_provision_admin\(text, text\)[\s\S]*?from public, anon, authenticated, service_role;/
  );
  assert.doesNotMatch(
    migration,
    /grant execute on function public\.writing_submission_provision_admin/
  );

  const occurrenceValidator = migration.match(
    /create or replace function public\._writing_submission_occurrence_batch_valid[\s\S]*?\n\$\$;/
  )?.[0] || "";
  assert.match(occurrenceValidator, /language plpgsql\s+set search_path/);
  assert.doesNotMatch(occurrenceValidator, /\bimmutable\b/);

  const studentLocks = migration.match(
    /hashtextextended\('writing-submission-student:' \|\| p_student_id::text, 0\)/g
  ) || [];
  assert.equal(studentLocks.length, 2, "submit and grammar batch must share the student lock");
  const documentLocks = migration.match(
    /hashtextextended\('writing-submission-document:' \|\| p_(?:id|document_id)::text, 0\)/g
  ) || [];
  assert.equal(documentLocks.length, 2, "submit and grammar batch must share the document lock");

  for (const functionName of [
    "writing_submission_submit",
    "writing_submission_record_issue_batch"
  ]) {
    const definition = migration.match(
      new RegExp(`create or replace function public\\.${functionName}[\\s\\S]*?\\n\\$\\$;`)
    )?.[0] || "";
    const studentPosition = definition.indexOf("writing-submission-student:");
    const documentPosition = definition.indexOf("writing-submission-document:");
    assert.ok(studentPosition >= 0, `${functionName} must take the student lock`);
    assert.ok(documentPosition > studentPosition, `${functionName} must take the document lock second`);
  }
});
