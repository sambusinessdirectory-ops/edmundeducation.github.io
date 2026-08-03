import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import worker from "../src/index.js";

const ORIGIN = "https://edmundeducation.github.io";
const OTHER_ORIGIN = "https://attacker.example";
const STUDENT_TOKEN = "11111111-1111-4111-8111-111111111111";
const STUDENT_ID = "22222222-2222-4222-8222-222222222222";
const ADMIN_TOKEN = "33333333-3333-4333-8333-333333333333";
const ADMIN_ID = "44444444-4444-4444-8444-444444444444";
const SELECTED_STUDENT_ID = "55555555-5555-4555-8555-555555555555";

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
  const url = new URL(String(input));
  return decodeURIComponent(url.pathname.split("/").at(-1));
}

function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Origin")) headers.set("Origin", ORIGIN);
  return new Request(`https://worker.example${path}`, { ...options, headers });
}

function progressSnapshot(studentId = STUDENT_ID) {
  return {
    schemaVersion: 1,
    generatedAt: "2026-08-03T01:02:03.000Z",
    timeZone: "Asia/Hong_Kong",
    student: { id: studentId, name: "Test Student" },
    sources: {
      flashcards: {
        activityDays: [{ date: "2026-08-03", questions: 3 }],
        timeDays: [{ date: "2026-08-03", totalMs: 120000 }]
      },
      writingSubmission: {
        activityDays: [{ date: "2026-08-03", articles: 1, totalMs: 60000 }],
        timeDays: [{ date: "2026-08-03", totalMs: 60000 }]
      }
    }
  };
}

test("health reports configuration and applies no-store security headers", async () => {
  const ready = await worker.fetch(request("/v1/health"), environment());
  assert.equal(ready.status, 200);
  assert.equal(ready.headers.get("Cache-Control"), "no-store");
  assert.equal(ready.headers.get("Access-Control-Allow-Origin"), ORIGIN);
  assert.equal(ready.headers.get("X-Content-Type-Options"), "nosniff");
  assert.deepEqual(await ready.json(), {
    ok: true,
    service: "edmund-student-progress",
    storage: "supabase-private",
    snapshot: "transactional",
    rateLimiters: { adminLogin: true }
  });

  const unavailable = await worker.fetch(
    request("/v1/health"),
    environment({ SUPABASE_SERVICE_ROLE_KEY: "" })
  );
  assert.equal(unavailable.status, 503);
  assert.equal((await unavailable.json()).ok, false);
});

test("CORS allowlist fails closed and preflight advertises only required methods", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let fetchCalled = false;
  globalThis.fetch = async () => {
    fetchCalled = true;
    throw new Error("must not reach Supabase");
  };

  const rejected = await worker.fetch(
    request("/v1/student/me", {
      headers: { Origin: OTHER_ORIGIN, Authorization: `Bearer ${STUDENT_TOKEN}` }
    }),
    environment()
  );
  assert.equal(rejected.status, 403);
  assert.equal(rejected.headers.get("Access-Control-Allow-Origin"), null);
  assert.equal(fetchCalled, false);

  const preflight = await worker.fetch(
    request("/v1/progress", {
      method: "OPTIONS",
      headers: {
        Origin: ORIGIN,
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "authorization"
      }
    }),
    environment()
  );
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("Access-Control-Allow-Origin"), ORIGIN);
  assert.equal(preflight.headers.get("Access-Control-Allow-Methods"), "GET, POST, OPTIONS");
});

test("student profile accepts the shared Flashcard bearer token and trims modern server secrets", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  const secret = `sb_secret_${"s".repeat(48)}`;
  globalThis.fetch = async (input, init = {}) => {
    assert.equal(rpcName(input), "student_progress_student_me");
    const headers = new Headers(init.headers);
    assert.equal(headers.get("apikey"), secret);
    assert.equal(headers.get("Authorization"), null);
    assert.deepEqual(JSON.parse(String(init.body)), { p_token: STUDENT_TOKEN });
    return jsonResponse([{
      id: STUDENT_ID,
      name: "Test Student",
      session_expires_at: "2026-08-04T00:00:00.000Z"
    }]);
  };

  const response = await worker.fetch(
    request("/v1/student/me", { headers: { Authorization: `Bearer ${STUDENT_TOKEN}` } }),
    environment({
      SUPABASE_SERVICE_ROLE_KEY: "",
      SUPABASE_SECRET_KEY: `  ${secret}\n`
    })
  );
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    student: {
      id: STUDENT_ID,
      name: "Test Student",
      expiresAt: "2026-08-04T00:00:00.000Z"
    }
  });
});

test("student progress returns the one transactional snapshot without changing its totals", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  const expected = progressSnapshot();
  const calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const name = rpcName(input);
    const body = JSON.parse(String(init.body || "{}"));
    calls.push({ name, body });
    if (name === "student_progress_student_me") {
      return jsonResponse([{ id: STUDENT_ID, name: "Test Student", session_expires_at: "later" }]);
    }
    if (name === "student_progress_student_snapshot") {
      return jsonResponse([{ snapshot: expected }]);
    }
    throw new Error(`Unexpected RPC: ${name}`);
  };

  const response = await worker.fetch(
    request("/v1/progress", { headers: { Authorization: `Bearer ${STUDENT_TOKEN}` } }),
    environment()
  );
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { snapshot: expected });
  assert.deepEqual(calls, [
    { name: "student_progress_student_me", body: { p_token: STUDENT_TOKEN } },
    { name: "student_progress_student_snapshot", body: { p_token: STUDENT_TOKEN } }
  ]);
});

test("missing or malformed student tokens are rejected before Supabase", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let fetchCalled = false;
  globalThis.fetch = async () => {
    fetchCalled = true;
    throw new Error("must not reach Supabase");
  };

  const response = await worker.fetch(
    request("/v1/progress", { headers: { Authorization: "Bearer not-a-uuid" } }),
    environment()
  );
  assert.equal(response.status, 401);
  assert.equal((await response.json()).code, "STUDENT_AUTH_REQUIRED");
  assert.equal(fetchCalled, false);
});

test("admin login is rate-limited and maps credentials only to the private login RPC", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let limiterKey = "";
  const calls = [];
  globalThis.fetch = async (input, init = {}) => {
    calls.push({ name: rpcName(input), body: JSON.parse(String(init.body || "{}")) });
    return jsonResponse([{
      admin_id: ADMIN_ID,
      admin_token: ADMIN_TOKEN,
      name: "Sam Admin Dashboard",
      expires_at: "2026-08-03T09:00:00.000Z"
    }]);
  };
  const env = environment({
    ADMIN_LOGIN_RATE_LIMITER: {
      async limit({ key }) {
        limiterKey = key;
        return { success: true };
      }
    }
  });

  const response = await worker.fetch(
    request("/v1/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CF-Connecting-IP": "203.0.113.8"
      },
      body: JSON.stringify({ username: "Sam Admin Dashboard", password: "test-password" })
    }),
    env
  );
  assert.equal(response.status, 200);
  assert.equal(limiterKey, "student-progress-admin:203.0.113.8");
  assert.deepEqual(calls, [{
    name: "student_progress_admin_login",
    body: { p_name: "Sam Admin Dashboard", p_password: "test-password" }
  }]);
  const body = await response.json();
  assert.equal(body.admin.adminToken, ADMIN_TOKEN);
  assert.equal(JSON.stringify(body).includes("test-password"), false);
});

test("admin login limiter rejects before reading credentials or calling Supabase", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let fetchCalled = false;
  globalThis.fetch = async () => {
    fetchCalled = true;
    throw new Error("must not reach Supabase");
  };
  const response = await worker.fetch(
    request("/v1/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "Someone", password: "anything" })
    }),
    environment({
      ADMIN_LOGIN_RATE_LIMITER: { async limit() { return { success: false }; } }
    })
  );
  assert.equal(response.status, 429);
  assert.equal((await response.json()).code, "TOO_MANY_ATTEMPTS");
  assert.equal(fetchCalled, false);
});

test("administrator list authenticates first and exposes profiles without credentials", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  const calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const name = rpcName(input);
    calls.push({ name, body: JSON.parse(String(init.body || "{}")) });
    if (name === "student_progress_admin_me") {
      return jsonResponse([{ id: ADMIN_ID, name: "Sam Admin Dashboard", expires_at: "later" }]);
    }
    if (name === "student_progress_admin_students") {
      return jsonResponse([{
        id: SELECTED_STUDENT_ID,
        name: "Selected Student",
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-08-03T00:00:00.000Z"
      }]);
    }
    throw new Error(`Unexpected RPC: ${name}`);
  };

  const response = await worker.fetch(
    request("/v1/admin/students", { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } }),
    environment()
  );
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    students: [{
      id: SELECTED_STUDENT_ID,
      name: "Selected Student",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-08-03T00:00:00.000Z"
    }]
  });
  assert.deepEqual(calls, [
    { name: "student_progress_admin_me", body: { p_admin_token: ADMIN_TOKEN } },
    { name: "student_progress_admin_students", body: { p_admin_token: ADMIN_TOKEN } }
  ]);
});

test("administrator detail binds the selected UUID to its snapshot RPC", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  const expected = progressSnapshot(SELECTED_STUDENT_ID);
  const calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const name = rpcName(input);
    const body = JSON.parse(String(init.body || "{}"));
    calls.push({ name, body });
    if (name === "student_progress_admin_me") {
      return jsonResponse([{ id: ADMIN_ID, name: "Sam Admin Dashboard", expires_at: "later" }]);
    }
    if (name === "student_progress_admin_snapshot") {
      return jsonResponse([{ snapshot: expected }]);
    }
    throw new Error(`Unexpected RPC: ${name}`);
  };

  const response = await worker.fetch(
    request(`/v1/admin/students/${SELECTED_STUDENT_ID}/progress`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    }),
    environment()
  );
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { snapshot: expected });
  assert.deepEqual(calls.at(-1), {
    name: "student_progress_admin_snapshot",
    body: { p_admin_token: ADMIN_TOKEN, p_student_id: SELECTED_STUDENT_ID }
  });
});

test("admin logout validates the session and revokes exactly that token", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  const calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const name = rpcName(input);
    const body = JSON.parse(String(init.body || "{}"));
    calls.push({ name, body });
    if (name === "student_progress_admin_me") {
      return jsonResponse([{ id: ADMIN_ID, name: "Sam Admin Dashboard", expires_at: "later" }]);
    }
    if (name === "student_progress_admin_logout") return jsonResponse([{ revoked: true }]);
    throw new Error(`Unexpected RPC: ${name}`);
  };

  const response = await worker.fetch(
    request("/v1/admin/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    }),
    environment()
  );
  assert.equal(response.status, 204);
  assert.equal(await response.text(), "");
  assert.deepEqual(calls.at(-1), {
    name: "student_progress_admin_logout",
    body: { p_admin_token: ADMIN_TOKEN }
  });
});

test("missing admin sessions and missing selected students get distinct safe errors", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input) => {
    const name = rpcName(input);
    if (name === "student_progress_admin_me") {
      return jsonResponse([{ id: ADMIN_ID, name: "Sam Admin Dashboard", expires_at: "later" }]);
    }
    if (name === "student_progress_admin_snapshot") return jsonResponse([]);
    throw new Error(`Unexpected RPC: ${name}`);
  };

  const noToken = await worker.fetch(request("/v1/admin/students"), environment());
  assert.equal(noToken.status, 401);
  assert.equal((await noToken.json()).code, "ADMIN_AUTH_REQUIRED");

  const missingStudent = await worker.fetch(
    request(`/v1/admin/students/${SELECTED_STUDENT_ID}/progress`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    }),
    environment()
  );
  assert.equal(missingStudent.status, 404);
  assert.equal((await missingStudent.json()).code, "STUDENT_NOT_FOUND");
});

test("mismatched or malformed snapshots are never forwarded", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async input => {
    const name = rpcName(input);
    if (name === "student_progress_student_me") {
      return jsonResponse([{ id: STUDENT_ID, name: "Test Student", session_expires_at: "later" }]);
    }
    if (name === "student_progress_student_snapshot") {
      return jsonResponse([{ snapshot: progressSnapshot(SELECTED_STUDENT_ID) }]);
    }
    throw new Error(`Unexpected RPC: ${name}`);
  };
  const response = await worker.fetch(
    request("/v1/progress", { headers: { Authorization: `Bearer ${STUDENT_TOKEN}` } }),
    environment()
  );
  assert.equal(response.status, 502);
  assert.equal((await response.json()).code, "INVALID_UPSTREAM_RESPONSE");
});

test("upstream error bodies and repository files do not expose private credential values", async t => {
  const originalFetch = globalThis.fetch;
  const originalConsoleError = console.error;
  t.after(() => {
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
  });
  console.error = () => {};
  globalThis.fetch = async () => jsonResponse({ message: "database-private-detail" }, 500);

  const response = await worker.fetch(
    request("/v1/student/me", { headers: { Authorization: `Bearer ${STUDENT_TOKEN}` } }),
    environment()
  );
  const body = await response.text();
  assert.equal(response.status, 502);
  assert.equal(body.includes("database-private-detail"), false);

  for (const relative of ["../src/index.js", "../README.md", "../wrangler.jsonc"]) {
    const contents = fs.readFileSync(new URL(relative, import.meta.url), "utf8");
    assert.doesNotMatch(contents, /sb_secret_[A-Za-z0-9_-]{24,}/, relative);
    assert.doesNotMatch(contents, /\$2[aby]\$12\$[./A-Za-z0-9]{53}/, relative);
  }
});
