import assert from "node:assert/strict";
import worker from "../workers/schedule-system/src/index.js";

const origin = "https://edmundeducation.com";
const baseEnv = {
  ALLOWED_ORIGIN: origin,
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_ANON_KEY: "publishable-test-key",
  SCHEDULE_SERVICE_SECRET: "a".repeat(64),
  ADMIN_LOGIN_RATE_LIMITER: { limit: async () => ({ success: true }) }
};

const health = await worker.fetch(new Request("https://worker.example/v1/health"), baseEnv);
assert.equal(health.status, 200);
assert.deepEqual(await health.json(), { ok: true, service: "edmund-schedule-system" });

const forbidden = await worker.fetch(new Request("https://worker.example/v1/admin/login", {
  method: "POST",
  headers: { "Content-Type": "application/json", "Origin": "https://attacker.example" },
  body: JSON.stringify({ name: "Admin", password: "guess" })
}), baseEnv);
assert.equal(forbidden.status, 403);

const throttledEnv = {
  ...baseEnv,
  ADMIN_LOGIN_RATE_LIMITER: { limit: async () => ({ success: false }) }
};
const throttled = await worker.fetch(new Request("https://worker.example/v1/admin/login", {
  method: "POST",
  headers: { "Content-Type": "application/json", "Origin": origin },
  body: JSON.stringify({ name: "Admin", password: "guess" })
}), throttledEnv);
assert.equal(throttled.status, 429);

const oversized = await worker.fetch(new Request("https://worker.example/v1/admin/login", {
  method: "POST",
  headers: { "Content-Type": "application/json", "Origin": origin },
  body: JSON.stringify({ name: "Admin", password: "x".repeat(5000) })
}), baseEnv);
assert.equal(oversized.status, 413);

const realFetch = globalThis.fetch;
let forwardedBody = null;
globalThis.fetch = async (url, options) => {
  assert.equal(url, "https://example.supabase.co/rest/v1/rpc/schedule_admin_login");
  assert.equal(options.method, "POST");
  assert.equal(options.headers.apikey, baseEnv.SUPABASE_ANON_KEY);
  forwardedBody = JSON.parse(options.body);
  return new Response(JSON.stringify([{
    admin_token: "11111111-1111-4111-8111-111111111111",
    name: "Schedule Admin",
    expires_at: "2026-07-14T20:00:00Z"
  }]), { status: 200, headers: { "Content-Type": "application/json" } });
};

try {
  const success = await worker.fetch(new Request("https://worker.example/v1/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": origin },
    body: JSON.stringify({ name: "Schedule Admin", password: "private-test-password" })
  }), baseEnv);
  assert.equal(success.status, 200);
  const successBody = await success.json();
  assert.equal(successBody.admin.name, "Schedule Admin");
  assert.equal(forwardedBody.p_service_secret, baseEnv.SCHEDULE_SERVICE_SECRET);
  assert.equal(forwardedBody.p_name, "Schedule Admin");
  assert.equal(forwardedBody.p_password, "private-test-password");
} finally {
  globalThis.fetch = realFetch;
}

const preflight = await worker.fetch(new Request("https://worker.example/v1/admin/login", {
  method: "OPTIONS",
  headers: { "Origin": origin }
}), baseEnv);
assert.equal(preflight.status, 204);
assert.equal(preflight.headers.get("access-control-allow-origin"), origin);
assert.equal(preflight.headers.get("access-control-allow-methods"), "POST, OPTIONS");

console.log("Schedule Worker checks passed: health, CORS, throttling, body cap, and secure admin forwarding.");
