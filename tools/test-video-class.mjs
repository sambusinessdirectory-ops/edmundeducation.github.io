#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

const [recordedHtml, portalHtml, portalJs, portalCss, frameGuardJs, portalConfig, sql, workerSource, wranglerSource, workerPackageSource, workerLockSource] = await Promise.all([
  read("recorded.html"),
  read("video-class.html"),
  read("video-class.js"),
  read("video-class.css"),
  read("video-class-frame-guard.js"),
  read("video-class-config.js"),
  read("supabase-video-class.sql"),
  read("workers/video-class/src/index.js"),
  read("workers/video-class/wrangler.jsonc"),
  read("workers/video-class/package.json"),
  read("workers/video-class/package-lock.json")
]);

const wrangler = JSON.parse(wranglerSource);
const workerPackage = JSON.parse(workerPackageSource);
const workerLock = JSON.parse(workerLockSource);
const workerModule = await import(new URL("workers/video-class/src/index.js", root));
const { __test, default: worker } = workerModule;

const tests = [];
const test = (name, run) => tests.push({ name, run });
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const sorted = (values) => [...values].sort();

function sqlFunctionBlock(name) {
  const expression = new RegExp(
    `create\\s+or\\s+replace\\s+function\\s+public\\.${escapeRegExp(name)}\\s*\\([\\s\\S]*?\\n\\$\\$;`,
    "i"
  );
  const block = sql.match(expression)?.[0] || "";
  assert.ok(block, `missing SQL function ${name}`);
  return block;
}

function sqlTableBlock(name) {
  const expression = new RegExp(
    `create\\s+table\\s+if\\s+not\\s+exists\\s+public\\.${escapeRegExp(name)}\\s*\\([\\s\\S]*?\\n\\);`,
    "i"
  );
  const block = sql.match(expression)?.[0] || "";
  assert.ok(block, `missing SQL table ${name}`);
  return block;
}

async function withMockedFetch(mock, run) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = mock;
  try {
    return await run();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

function assertWorkerRoute(pathSource, methodSource) {
  assert.ok(
    workerSource.includes(`url.pathname === "${pathSource}"`) && workerSource.includes(`request.method === "${methodSource}"`),
    `Worker must route ${methodSource} ${pathSource}`
  );
}

test("recorded-class CTA follows the three advantages and links to the portal", () => {
  const advantages = recordedHtml.indexOf('<section class="advantage-strip"');
  const finalAdvantage = recordedHtml.indexOf("隨時重溫，彈性學習", advantages);
  const entry = recordedHtml.indexOf('<div class="video-class-entry">', finalAdvantage);
  const recommendation = recordedHtml.indexOf('<section class="recommended"', entry);

  assert.ok(advantages >= 0, "recorded.html must retain the advantages strip");
  assert.ok(finalAdvantage > advantages, "all three recorded-class advantages must precede the CTA");
  assert.ok(entry > finalAdvantage, "the login CTA must appear below the advantages");
  assert.ok(recommendation > entry, "the CTA must appear before recommendations");
  assert.match(
    recordedHtml.slice(entry, recommendation),
    /<a\s+class="video-class-login"\s+href="video-class\.html">登入錄影班<\/a>/
  );
});

test("public files contain no direct R2 media URL or plaintext administrator credential", () => {
  const browserAndDeploymentSource = [recordedHtml, portalHtml, portalJs, portalConfig, sql, workerSource, wranglerSource].join("\n");
  assert.doesNotMatch(
    browserAndDeploymentSource,
    /https?:\/\/[^\s"'<>]*\.r2\.dev(?:[\/\s"'<>]|$)/i,
    "a public r2.dev media URL bypasses the authenticated Worker"
  );
  assert.doesNotMatch(portalHtml + portalJs + portalConfig, /https?:\/\/[^\s"'<>]+\.mp4(?:[?\s"'<>]|$)/i);
  assert.doesNotMatch(portalConfig, /(?:password|service[_-]?secret|signing[_-]?key|admin[_-]?secret)/i);
  assert.doesNotMatch(workerSource, /\b(?:ADMIN_PASSWORD|ADMIN_PLAINTEXT_PASSWORD)\b/);
  assert.doesNotMatch(
    sql,
    /insert\s+into\s+public\.video_class_admin_accounts\b/i,
    "administrator provisioning must happen separately with a bcrypt hash"
  );
  assert.match(sql, /password_hash\s+text\s+not\s+null\s+check\s*\(password_hash\s+like\s+'\$2%'\)/i);

  const passwordInputs = portalHtml.match(/<input\b[^>]*\btype="password"[^>]*>/gi) || [];
  assert.equal(passwordInputs.length, 2, "student and administrator forms each need a password input");
  for (const input of passwordInputs) assert.doesNotMatch(input, /\bvalue\s*=/i, "password inputs must never be prefilled in source");
});

test("student login reuses the established account and supports shared-session exchange", () => {
  assert.doesNotMatch(sql, /create\s+table[^;]*video_class_student_accounts/i, "do not fork student identities");

  const login = sqlFunctionBlock("video_class_student_login");
  assert.match(login, /from\s+public\.flashcard_students\s+student/i);
  assert.match(login, /v_password_hash\s*=\s*extensions\.crypt\(p_password,\s*v_password_hash\)/i);
  assert.match(login, /for\s+no\s+key\s+update\s+of\s+student/i);
  assert.match(login, /insert\s+into\s+public\.flashcard_student_sessions\s*\(student_id,\s*expires_at\)/i);

  const exchange = sqlFunctionBlock("video_class_student_exchange");
  assert.doesNotMatch(exchange, /public\.flashcard_session_student_id\(p_flashcard_token\)/i);
  const exchangeParentLock = exchange.indexOf("for key share of student");
  const exchangeSessionLock = exchange.indexOf("for key share of session");
  assert.ok(exchangeParentLock >= 0 && exchangeSessionLock > exchangeParentLock, "exchange must lock student before revalidating the shared session");
  assert.match(exchange, /session\.token\s*=\s*p_flashcard_token[\s\S]*?session\.expires_at\s*>\s*clock_timestamp\(\)[\s\S]*?for\s+key\s+share\s+of\s+session/i);
  assert.match(exchange, /join\s+public\.video_class_student_access\s+access/i);
  assert.match(exchange, /access\.enabled\s*=\s*true/i);

  assert.match(portalHtml, /使用你現有的 EdmundEducation 用戶名稱及密碼登入/);
  assert.match(portalHtml, /src="shared-system-nav\.js[^"\n]*"/);
  assert.match(portalJs, /EdmundSystemNav\?\.getStudentSession\?\.\(\)/);
  assert.match(portalJs, /apiRequest\("\/v1\/student\/exchange"/);
  assert.match(workerSource, /url\.pathname === "\/v1\/student\/exchange"/);
  assert.match(workerSource, /serviceRpc\(env,\s*"video_class_student_exchange"/);
});

test("adaptive login protection tracks accounts without weakening the existing IP limits", () => {
  const attempts = sqlTableBlock("video_class_login_attempts");
  assert.match(attempts, /realm\s+text\s+not\s+null\s+check\s*\(realm\s+in\s*\('student',\s*'admin'\)\)/i);
  assert.match(attempts, /identifier_hash\s+bytea\s+not\s+null\s+check\s*\(octet_length\(identifier_hash\)\s*=\s*32\)/i);
  assert.match(attempts, /failure_count\s+smallint\s+not\s+null\s+default\s+0\s+check\s*\(failure_count\s+between\s+0\s+and\s+10\)/i);
  assert.match(attempts, /primary\s+key\s*\(realm,\s*identifier_hash\)/i);
  assert.doesNotMatch(attempts, /\b(?:username|password|turnstile|ip_address|remote_ip)\b/i);
  assert.match(sql, /create\s+index\s+if\s+not\s+exists\s+video_class_login_attempts_updated_idx\s+on\s+public\.video_class_login_attempts\s*\(updated_at\)/i);
  assert.match(sql, /alter\s+table\s+public\.video_class_login_attempts\s+enable\s+row\s+level\s+security/i);
  assert.match(sql, /revoke\s+all\s+on\s+table\s+public\.video_class_login_attempts\s+from\s+public,\s*anon,\s*authenticated/i);

  const identifierHash = sqlFunctionBlock("_video_class_login_identifier_hash");
  assert.match(identifierHash, /extensions\.hmac\s*\(/i);
  assert.match(identifierHash, /convert_to\(p_realm,\s*'UTF8'\)[\s\S]*?decode\('00',\s*'hex'\)[\s\S]*?convert_to\(pg_catalog\.lower\(pg_catalog\.btrim\(p_name\)\),\s*'UTF8'\)/i);
  assert.match(identifierHash, /convert_to\(p_service_secret,\s*'UTF8'\)[\s\S]*?decode\('00',\s*'hex'\)[\s\S]*?convert_to\('edmund-video-class-login-v1',\s*'UTF8'\)/i);
  assert.match(identifierHash, /'sha256'/i);

  const delay = sqlFunctionBlock("_video_class_login_delay_seconds");
  assert.match(delay, /when\s+p_failure_count\s*>=\s*10\s+then\s+900/i);
  assert.match(delay, /when\s+p_failure_count\s*>=\s*7\s+then\s+300/i);
  assert.match(delay, /when\s+p_failure_count\s*>=\s*5\s+then\s+60/i);

  for (const [functionName, realm] of [
    ["video_class_student_login", "student"],
    ["video_class_admin_login", "admin"]
  ]) {
    const login = sqlFunctionBlock(functionName);
    assert.match(login, /p_turnstile_verified\s+boolean/i);
    assert.match(login, new RegExp(`_video_class_login_identifier_hash\\(\\s*p_service_secret,\\s*'${realm}',\\s*p_name`, "i"));
    assert.match(login, /insert\s+into\s+public\.video_class_login_attempts[\s\S]*?on\s+conflict\s*\(realm,\s*identifier_hash\)\s+do\s+nothing/i);
    assert.match(login, /from\s+public\.video_class_login_attempts\s+attempt[\s\S]*?for\s+update/i);
    assert.match(login, /for\s+update\s+skip\s+locked/i);
    assert.match(login, /loop[\s\S]*?on\s+conflict[\s\S]*?for\s+update;[\s\S]*?exit\s+when\s+found;[\s\S]*?end\s+loop/i);
    assert.match(login, /end\s+loop;\s*v_now\s*:=\s*clock_timestamp\(\)/i);
    assert.match(login, /v_last_failed_at\s*<=\s*v_now\s*-\s*interval\s*'30 minutes'/i);
    assert.match(login, /if\s+v_blocked_until\s+is\s+not\s+null\s+and\s+v_blocked_until\s*>\s*v_now\s+then[\s\S]*?outcome\s*:=\s*'blocked'/i);
    assert.match(login, /if\s+v_failure_count\s*>=\s*3\s+and\s+p_turnstile_verified\s+is\s+not\s+true\s+then[\s\S]*?outcome\s*:=\s*'challenge_required'/i);
    assert.match(login, /least\(10,\s*v_failure_count\s*\+\s*1\)/i);
    assert.match(login, /_video_class_login_delay_seconds\(v_failure_count\)/i);
    assert.match(login, /extensions\.crypt\(p_password,\s*extensions\.gen_salt\('bf',\s*10\)\)/i);
    assert.match(login, new RegExp(`delete\\s+from\\s+public\\.video_class_login_attempts\\s+attempt\\s+where\\s+attempt\\.realm\\s*=\\s*'${realm}'[\\s\\S]*?(?:insert\\s+into\\s+public\\.(?:flashcard_student_sessions|video_class_admin_sessions))`, "i"));
  }

  const studentLimit = wrangler.ratelimits.find(item => item.name === "STUDENT_LOGIN_RATE_LIMITER");
  const adminLimit = wrangler.ratelimits.find(item => item.name === "ADMIN_LOGIN_RATE_LIMITER");
  assert.deepEqual(studentLimit?.simple, { limit: 10, period: 60 });
  assert.deepEqual(adminLimit?.simple, { limit: 5, period: 60 });
  assert.match(workerSource, /async\s+function\s+studentLogin[\s\S]*?await\s+enforceRateLimit[\s\S]*?await\s+readJson[\s\S]*?await\s+validateTurnstile[\s\S]*?serviceRpc/i);
  assert.match(workerSource, /async\s+function\s+adminLogin[\s\S]*?await\s+enforceRateLimit[\s\S]*?await\s+readJson[\s\S]*?await\s+validateTurnstile[\s\S]*?serviceRpc/i);

  const challenges = portalHtml.match(/<fieldset\b[^>]*data-turnstile-challenge="(?:student|admin)"[^>]*hidden[^>]*>/gi) || [];
  assert.equal(challenges.length, 2, "student and admin challenges must both begin hidden");
  assert.match(portalConfig, /turnstileSiteKey\s*:\s*"0x[0-9A-Za-z_-]{20,}"/);
  assert.doesNotMatch(portalConfig, /1x00000000000000000000AA|2x00000000000000000000AB|3x00000000000000000000FF/);
  assert.doesNotMatch(portalConfig, /turnstileSecret|secretKey/i);
  assert.match(portalJs, /error\.challengeRequired/);
  assert.doesNotMatch(portalJs, /failureCount\s*\+\+|failedAttempts\s*\+\+/i, "the browser must not own the account counter");
  assert.match(portalJs, /loginProtection\.token\s*=\s*""/);
  assert.match(portalJs, /resetTurnstileAfterAttempt\(role\)/);
  assert.match(portalJs, /formatCooldown\(remaining\)/);
  assert.match(portalJs, /turnstile\.required\s*=\s*turnstile\.required\s*\|\|\s*challengeRequired/);
  assert.match(portalJs, /startLoginCooldown\(role,\s*username,\s*error\.retryAfterSeconds,\s*error\.challengeRequired\)/);
  assert.match(portalJs, /turnstile\.generation\s*!==\s*generation/);
  assert.doesNotMatch(portalJs, /turnstile\?*\.ready\s*\(/, "the dynamic loader must render only after its load event");
  assert.match(portalJs, /setTurnstileStatus\(role,\s*"請完成安全驗證。",\s*""\)/);
  assert.match(workerSource, /Access-Control-Expose-Headers[^\n]*Retry-After/);
});

test("Worker validates adaptive Turnstile challenges and returns enforceable cooldowns", async () => {
  const allowedOrigin = "https://edmundeducation.com";
  const serviceSecret = "login-test-service-secret-".padEnd(48, "s");
  const turnstileSecret = "login-test-turnstile-secret";
  const studentId = "11111111-1111-4111-8111-111111111111";
  const studentToken = "22222222-2222-4222-8222-222222222222";
  const flashcardToken = "33333333-3333-4333-8333-333333333333";
  const adminToken = "44444444-4444-4444-8444-444444444444";

  const makeEnv = (limitLog = []) => ({
    ALLOWED_ORIGIN: allowedOrigin,
    SUPABASE_URL: "https://database.invalid",
    SUPABASE_ANON_KEY: "test-publishable-key",
    VIDEO_CLASS_SERVICE_SECRET: serviceSecret,
    VIDEO_CLASS_TURNSTILE_SECRET: turnstileSecret,
    STUDENT_LOGIN_RATE_LIMITER: {
      limit: async ({ key }) => {
        limitLog.push({ kind: "limit", key });
        return { success: true };
      }
    },
    ADMIN_LOGIN_RATE_LIMITER: {
      limit: async ({ key }) => {
        limitLog.push({ kind: "limit", key });
        return { success: true };
      }
    }
  });

  const makeLoginRequest = (role, turnstileToken = "") => new Request(`https://worker.invalid/v1/${role}/login`, {
    method: "POST",
    headers: {
      Origin: allowedOrigin,
      "Content-Type": "application/json",
      "CF-Connecting-IP": "203.0.113.19"
    },
    body: JSON.stringify({
      username: role === "admin" ? "Test Admin" : "Test Student",
      password: "wrong-or-right-test-password",
      ...(turnstileToken ? { turnstileToken } : {})
    })
  });

  for (const role of ["student", "admin"]) {
    const action = `${role}_login`;
    const calls = [];
    const env = makeEnv(calls);
    const mockedFetch = async (input, init = {}) => {
      const url = new URL(typeof input === "string" ? input : input.url);
      if (url.hostname === "challenges.cloudflare.com") {
        calls.push({ kind: "turnstile", body: new URLSearchParams(String(init.body || "")) });
        return new Response(JSON.stringify({ success: true, hostname: "edmundeducation.com", action }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      const parameters = JSON.parse(String(init.body || "{}"));
      calls.push({ kind: "rpc", parameters, url: url.href });
      const row = role === "student"
        ? {
            outcome: "success",
            challenge_required: false,
            retry_after_seconds: 0,
            video_token: studentToken,
            flashcard_token: flashcardToken,
            student_id: studentId,
            name: "Test Student",
            video_key: "EDU-TEST-0001",
            expires_at: "2099-01-01T00:00:00Z"
          }
        : {
            outcome: "success",
            challenge_required: false,
            retry_after_seconds: 0,
            admin_token: adminToken,
            name: "Test Admin",
            expires_at: "2099-01-01T00:00:00Z"
          };
      return new Response(JSON.stringify([row]), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    };

    await withMockedFetch(mockedFetch, async () => {
      const response = await worker.fetch(makeLoginRequest(role, `${role}-valid-token`), env, {});
      assert.equal(response.status, 200);
    });

    assert.deepEqual(calls.map(call => call.kind), ["limit", "turnstile", "rpc"]);
    assert.match(calls[0].key, new RegExp(`^${role}-login:203\\.0\\.113\\.19$`));
    assert.equal(calls[1].body.get("secret"), turnstileSecret);
    assert.equal(calls[1].body.get("response"), `${role}-valid-token`);
    assert.equal(calls[1].body.get("remoteip"), "203.0.113.19");
    assert.equal(calls[2].parameters.p_service_secret, serviceSecret);
    assert.equal(calls[2].parameters.p_turnstile_verified, true);
    assert.match(calls[2].url, new RegExp(`/rpc/video_class_${role}_login$`));
  }

  {
    let rpcCalled = false;
    const env = makeEnv();
    const mockedFetch = async (input, init = {}) => {
      const url = new URL(typeof input === "string" ? input : input.url);
      if (url.hostname === "challenges.cloudflare.com") {
        return new Response(JSON.stringify({
          success: true,
          hostname: "copied-site.example",
          action: "admin_login"
        }), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      rpcCalled = true;
      return new Response("unexpected database call", { status: 500 });
    };
    await withMockedFetch(mockedFetch, async () => {
      const response = await worker.fetch(makeLoginRequest("student", "wrong-host-token"), env, {});
      const payload = await response.json();
      assert.equal(response.status, 403);
      assert.equal(payload.error.code, "TURNSTILE_INVALID");
      assert.equal(payload.error.challengeRequired, true);
    });
    assert.equal(rpcCalled, false, "hostname/action mismatches must fail closed before password checking");
  }

  {
    const env = makeEnv();
    await withMockedFetch(async (input, init = {}) => {
      const url = new URL(typeof input === "string" ? input : input.url);
      assert.notEqual(url.hostname, "challenges.cloudflare.com", "missing tokens must not call Siteverify");
      const parameters = JSON.parse(String(init.body || "{}"));
      assert.equal(parameters.p_turnstile_verified, false);
      return new Response(JSON.stringify([{
        outcome: "challenge_required",
        challenge_required: true,
        retry_after_seconds: 0
      }]), { status: 200, headers: { "Content-Type": "application/json" } });
    }, async () => {
      const response = await worker.fetch(makeLoginRequest("admin"), env, {});
      const payload = await response.json();
      assert.equal(response.status, 403);
      assert.equal(payload.error.code, "TURNSTILE_REQUIRED");
      assert.equal(payload.error.challengeRequired, true);
    });
  }

  {
    let fetchCount = 0;
    const env = makeEnv();
    const mockedFetch = async (input, init = {}) => {
      fetchCount += 1;
      const parameters = JSON.parse(String(init.body || "{}"));
      assert.equal(parameters.p_turnstile_verified, false);
      return new Response(JSON.stringify([{
        outcome: "blocked",
        challenge_required: true,
        retry_after_seconds: 300
      }]), { status: 200, headers: { "Content-Type": "application/json" } });
    };
    await withMockedFetch(mockedFetch, async () => {
      const response = await worker.fetch(makeLoginRequest("student"), env, {});
      const payload = await response.json();
      assert.equal(response.status, 429);
      assert.equal(response.headers.get("Retry-After"), "300");
      assert.match(response.headers.get("Access-Control-Expose-Headers") || "", /Retry-After/);
      assert.equal(payload.error.code, "LOGIN_DELAYED");
      assert.equal(payload.error.retryAfterSeconds, 300);
      assert.equal(payload.error.challengeRequired, true);
    });
    assert.equal(fetchCount, 1, "a blocked account without a token must skip Siteverify and call only Supabase");
  }

  {
    let fetchCount = 0;
    const env = makeEnv();
    env.STUDENT_LOGIN_RATE_LIMITER.limit = async () => ({ success: false });
    await withMockedFetch(async () => {
      fetchCount += 1;
      throw new Error("rate-limited requests must never reach Siteverify or Supabase");
    }, async () => {
      const response = await worker.fetch(makeLoginRequest("student", "unused-token"), env, {});
      const payload = await response.json();
      assert.equal(response.status, 429);
      assert.equal(response.headers.get("Retry-After"), "60");
      assert.equal(payload.error.code, "IP_RATE_LIMITED");
      assert.equal(payload.error.challengeRequired, false);
    });
    assert.equal(fetchCount, 0);
  }

  {
    let rpcCalled = false;
    const env = makeEnv();
    await withMockedFetch(async input => {
      const url = new URL(typeof input === "string" ? input : input.url);
      if (url.hostname !== "challenges.cloudflare.com") rpcCalled = true;
      return new Response("upstream unavailable", { status: 503 });
    }, async () => {
      const response = await worker.fetch(makeLoginRequest("admin", "temporary-token"), env, {});
      const payload = await response.json();
      assert.equal(response.status, 503);
      assert.equal(payload.error.code, "TURNSTILE_UNAVAILABLE");
      assert.equal(payload.error.challengeRequired, true);
    });
    assert.equal(rpcCalled, false, "Siteverify failure must fail closed before password checking");
  }
});

test("video keys are manually controlled after a one-time current-student backfill", () => {
  const accessTable = sql.match(
    /create\s+table\s+if\s+not\s+exists\s+public\.video_class_student_access\s*\([\s\S]*?\n\);/i
  )?.[0] || "";
  assert.ok(accessTable, "missing video_class_student_access table");
  assert.match(accessTable, /student_id\s+uuid\s+primary\s+key\s+references\s+public\.flashcard_students\(id\)/i);
  assert.match(accessTable, /video_key\s+text\s+not\s+null\s+unique/i);
  assert.doesNotMatch(accessTable, /video_key[^,\n]*\bdefault\b/i, "keys must not be generated by a column default");
  assert.doesNotMatch(
    sql,
    /create\s+trigger[\s\S]{0,250}?after\s+insert[\s\S]{0,250}?\bon\s+public\.flashcard_students\b/i,
    "new students must not receive a key from an insert trigger"
  );
  const passwordRevocation = sqlFunctionBlock("video_class_revoke_student_sessions_on_password_change");
  assert.match(passwordRevocation, /delete\s+from\s+public\.flashcard_student_sessions\s+session/i);
  assert.match(passwordRevocation, /delete\s+from\s+public\.video_class_student_sessions/i);
  assert.doesNotMatch(passwordRevocation, /insert\s+into\s+public\.video_class_student_access/i);
  assert.match(
    sql,
    /create\s+trigger\s+video_class_student_password_revoke\s+after\s+update\s+of\s+password_hash\s+on\s+public\.flashcard_students/i,
    "shared-account password changes must revoke existing video sessions using an update-only trigger"
  );

  const accessInserts = sql.match(/insert\s+into\s+public\.video_class_student_access\b/gi) || [];
  assert.equal(accessInserts.length, 2, "only the admin issuer and one-time rollout may create entitlements");
  assert.match(sqlFunctionBlock("video_class_admin_issue_key"), /insert\s+into\s+public\.video_class_student_access/i);
  assert.match(
    sqlFunctionBlock("video_class_admin_issue_key"),
    /values\s*\(p_student_id,\s*v_key,\s*coalesce\(v_existing\.enabled,\s*true\),\s*v_admin_id\)/i,
    "rotating a disabled student's key must not silently re-enable access"
  );
  assert.match(
    sqlFunctionBlock("video_class_admin_issue_key"),
    /enabled\s*=\s*public\.video_class_student_access\.enabled/i
  );
  assert.match(
    sqlFunctionBlock("video_class_admin_issue_key"),
    /on\s+conflict\s+on\s+constraint\s+video_class_student_access_pkey\s+do\s+update/i,
    "RETURNS TABLE output names must not make the key upsert conflict target ambiguous"
  );
  assert.match(
    sql,
    /insert\s+into\s+public\.video_class_student_access\s*\(student_id,\s*video_key,\s*enabled\)\s*select\s+student\.id,\s*public\._video_class_next_key\(\),\s*true\s*from\s+public\.flashcard_students\s+student\s*where\s+student\.deleted_at\s+is\s+null\s*on\s+conflict\s*\(student_id\)\s+do\s+nothing;/i,
    "active students at rollout must receive an idempotent initial key"
  );
  assert.match(sql, /create\s+table\s+if\s+not\s+exists\s+public\.video_class_rollouts/i);
  assert.match(
    sql,
    /insert\s+into\s+public\.video_class_rollouts\s*\(rollout_key\)\s*values\s*\('initial-current-students'\)\s*on\s+conflict\s*\(rollout_key\)\s+do\s+nothing;[\s\S]*?if\s+found\s+and\s+not\s+exists\s*\(\s*select\s+1\s+from\s+public\.video_class_student_access\s+access\s*\)\s+then[\s\S]*?insert\s+into\s+public\.video_class_student_access/i,
    "the current-student key backfill must be guarded by a durable one-time marker"
  );
  assert.match(sqlFunctionBlock("video_class_admin_list_students"), /left\s+join\s+public\.video_class_student_access\s+access/i);
  assert.match(portalHtml, /新學生不會自動獲發 Video Class Key/);
});

test("the canonical nine-course catalogue and DSE pilot mapping stay stable", () => {
  const expectedCourses = [
    ["dse", "DSE 中學文憑試", 10],
    ["ielts", "IELTS 國際英文課程", 20],
    ["toefl", "TOEFL 託福", 30],
    ["toeic", "TOEIC 多益", 40],
    ["pte", "Pearson Test of English (PTE)", 50],
    ["igcse", "IGCSE", 60],
    ["sat", "SAT", 70],
    ["ib", "IB 課程", 80],
    ["grammar", "Grammar", 90]
  ];

  const courseTable = sqlTableBlock("video_class_courses");
  assert.match(courseTable, /code\s+text\s+primary\s+key/i);
  assert.match(courseTable, /title\s+text\s+not\s+null/i);
  assert.match(courseTable, /sort_order\s+integer\s+not\s+null/i);
  assert.match(courseTable, /published\s+boolean\s+not\s+null/i);

  const courseSeed = sql.match(
    /insert\s+into\s+public\.video_class_courses\s*\(code,\s*title,\s*description,\s*sort_order,\s*published\)\s*values([\s\S]*?)on\s+conflict\s*\(code\)/i
  )?.[1] || "";
  const seededCourses = Array.from(
    courseSeed.matchAll(/\(\s*'([^']+)',\s*'([^']+)',\s*'[^']*',\s*(\d+),\s*true\s*\)/g),
    match => [match[1], match[2], Number(match[3])]
  );
  assert.deepEqual(seededCourses, expectedCourses, "database catalogue order/title/code is an API contract");

  const browserCatalogue = portalJs.match(/const\s+COURSE_CATALOG\s*=\s*Object\.freeze\(\[([\s\S]*?)\]\);/)?.[1] || "";
  const browserCourses = Array.from(
    browserCatalogue.matchAll(/\{\s*id:\s*"([^"]+)",\s*slug:\s*"[^"]+",\s*title:\s*"([^"]+)"/g),
    match => [match[1], match[2]]
  );
  assert.deepEqual(browserCourses, expectedCourses.map(([code, title]) => [code, title]));

  const lessonTable = sqlTableBlock("video_class_lessons");
  assert.match(lessonTable, /course_code\s+text\s+not\s+null\s+references\s+public\.video_class_courses\(code\)/i);
  const pilot = sql.match(
    /insert\s+into\s+public\.video_class_lessons\s*\([\s\S]*?\)\s*values\s*\([\s\S]*?'bourree'[\s\S]*?\)\s*on\s+conflict\s*\(slug\)\s+do\s+nothing;/i
  )?.[0] || "";
  assert.match(pilot, /slug,\s*title,\s*description,\s*course_code,\s*course_label,\s*object_key/i);
  assert.match(pilot, /'bourree',[\s\S]*?'dse',[\s\S]*?'lessons\/bourree\.mp4'/i);

  assert.match(
    sql,
    /values\s*\('dse-current-keyed-students'\)\s*on\s+conflict\s*\(rollout_key\)\s+do\s+nothing;[\s\S]*?if\s+found\s+then[\s\S]*?insert\s+into\s+public\.video_class_student_courses\s*\(\s*student_id,\s*course_code,\s*enabled\s*\)[\s\S]*?select\s+access\.student_id,\s*'dse',\s*true\s+from\s+public\.video_class_student_access\s+access[\s\S]*?on\s+conflict\s*\(student_id,\s*course_code\)\s+do\s+nothing;/i,
    "current key holders must receive DSE exactly once"
  );
  assert.doesNotMatch(
    sqlFunctionBlock("video_class_admin_issue_key"),
    /video_class_student_courses/i,
    "issuing a future key must not silently assign a course"
  );
  assert.doesNotMatch(
    sql,
    /create\s+trigger[\s\S]{0,250}?after\s+insert[\s\S]{0,250}?on\s+public\.(?:flashcard_students|video_class_student_access)/i,
    "future students and keys need explicit administrator course assignment"
  );
});

test("course entitlements are per student and required for listing, playback, and progress", () => {
  const entitlementTable = sqlTableBlock("video_class_student_courses");
  assert.match(entitlementTable, /student_id\s+uuid\s+not\s+null\s+references\s+public\.flashcard_students\(id\)/i);
  assert.match(entitlementTable, /course_code\s+text\s+not\s+null\s+references\s+public\.video_class_courses\(code\)/i);
  assert.match(entitlementTable, /primary\s+key\s*\(student_id,\s*course_code\)/i);

  const roster = sqlFunctionBlock("video_class_admin_list_students");
  assert.match(roster, /array_agg\(student_course\.course_code\s+order\s+by\s+course\.sort_order/i);
  assert.match(roster, /where\s+student_course\.student_id\s*=\s*student\.id\s+and\s+student_course\.enabled\s*=\s*true/i);

  const adminCourseUpdate = sqlFunctionBlock("video_class_admin_set_course_access");
  assert.match(adminCourseUpdate, /on\s+conflict\s+on\s+constraint\s+video_class_student_courses_pkey\s+do\s+update/i);
  assert.match(adminCourseUpdate, /where\s+access\.student_id\s*=\s*p_student_id\s+and\s+access\.course_code\s*=\s*p_course_code/i);
  assert.doesNotMatch(
    sqlFunctionBlock("video_class_admin_clear_key"),
    /video_class_student_courses/i,
    "course assignments are deliberately independent from the global video key"
  );

  const listCourses = sqlFunctionBlock("video_class_student_list_courses");
  assert.match(listCourses, /where\s+access\.student_id\s*=\s*v_student_id\s+and\s+access\.enabled\s*=\s*true/i);
  assert.match(listCourses, /course\.published\s*=\s*true/i);

  const listLessons = sqlFunctionBlock("video_class_student_list_lessons");
  assert.match(listLessons, /join\s+public\.video_class_student_courses\s+access/i);
  assert.match(listLessons, /access\.student_id\s*=\s*v_student_id/i);
  assert.match(listLessons, /access\.course_code\s*=\s*lesson\.course_code/i);
  assert.match(listLessons, /access\.enabled\s*=\s*true/i);
  assert.match(
    workerSource,
    /async\s+function\s+listLessons[\s\S]*?Promise\.all\(\[[\s\S]*?video_class_student_list_courses[\s\S]*?video_class_student_library[\s\S]*?courses:\s*courseRows\.map\(mapCourse\)[\s\S]*?lessons:\s*lessonRows\.map\(mapLesson\)/,
    "the lesson response must preserve entitled courses that currently contain zero lessons"
  );
  assert.match(portalJs, /const\s+returnedCourses\s*=\s*Array\.isArray\(value\?\.courses\)/);

  for (const name of ["video_class_create_playback", "video_class_authorize_playback", "video_class_record_progress"]) {
    const block = sqlFunctionBlock(name);
    assert.match(block, /join\s+public\.video_class_student_courses\s+course_access/i, `${name}: course entitlement join`);
    assert.match(block, /course_access\.student_id\s*=/i, `${name}: student ownership`);
    assert.match(block, /course_access\.course_code\s*=\s*lesson\.course_code/i, `${name}: lesson/course mapping`);
    assert.match(block, /course_access\.enabled\s*=\s*true/i, `${name}: live enablement`);
  }
  assert.match(
    sqlFunctionBlock("video_class_record_progress"),
    /on\s+conflict\s+on\s+constraint\s+video_class_progress_pkey\s+do\s+update/i
  );

  const courseRevocation = sqlFunctionBlock("video_class_revoke_playbacks_on_course_change");
  assert.match(courseRevocation, /update\s+public\.video_class_playback_sessions\s+playback\s+set\s+revoked_at/i);
  assert.match(courseRevocation, /playback\.student_id\s*=\s*v_student_id/i);
  assert.match(courseRevocation, /lesson\.course_code\s*=\s*v_course_code/i);
  assert.match(
    sql,
    /create\s+trigger\s+video_class_course_access_revoke_playbacks\s+after\s+update\s+of\s+student_id,\s*course_code,\s*enabled\s+or\s+delete\s+on\s+public\.video_class_student_courses/i
  );
});

test("bookmarks and notes are isolated by student, entitlement checked, and safely bounded", () => {
  const bookmarkTable = sqlTableBlock("video_class_bookmarks");
  const noteTable = sqlTableBlock("video_class_notes");
  for (const table of [bookmarkTable, noteTable]) {
    assert.match(table, /student_id\s+uuid\s+not\s+null\s+references\s+public\.flashcard_students\(id\)/i);
    assert.match(table, /lesson_id\s+uuid\s+not\s+null\s+references\s+public\.video_class_lessons\(id\)/i);
    assert.match(table, /primary\s+key\s*\(student_id,\s*lesson_id\)/i);
  }
  assert.match(noteTable, /note\s+text\s+not\s+null\s+check\s*\(length\(note\)\s+between\s+1\s+and\s+5000\)/i);

  const bookmark = sqlFunctionBlock("video_class_student_toggle_bookmark");
  assert.doesNotMatch(bookmark, /p_student_id\s+uuid/i, "the browser cannot select another student");
  assert.match(bookmark, /v_student_id\s*:=\s*public\._video_class_student_id\(p_student_token\)/i);
  assert.match(bookmark, /join\s+public\.video_class_student_courses\s+access[\s\S]*?access\.student_id\s*=\s*v_student_id[\s\S]*?access\.enabled\s*=\s*true/i);
  assert.match(bookmark, /insert\s+into\s+public\.video_class_bookmarks\s*\(student_id,\s*lesson_id\)\s*values\s*\(v_student_id,\s*p_lesson_id\)/i);
  assert.match(bookmark, /on\s+conflict\s+on\s+constraint\s+video_class_bookmarks_pkey\s+do\s+nothing/i);
  assert.match(bookmark, /delete\s+from\s+public\.video_class_bookmarks\s+bookmark\s+where\s+bookmark\.student_id\s*=\s*v_student_id\s+and\s+bookmark\.lesson_id\s*=\s*p_lesson_id/i);

  const note = sqlFunctionBlock("video_class_student_save_note");
  assert.doesNotMatch(note, /p_student_id\s+uuid/i, "the browser cannot select another student's note row");
  assert.match(note, /v_student_id\s*:=\s*public\._video_class_student_id\(p_student_token\)/i);
  assert.match(note, /length\(p_note\)\s*>\s*5000/i);
  assert.match(note, /join\s+public\.video_class_student_courses\s+access[\s\S]*?access\.student_id\s*=\s*v_student_id[\s\S]*?access\.enabled\s*=\s*true/i);
  assert.match(note, /delete\s+from\s+public\.video_class_notes\s+saved_note\s+where\s+saved_note\.student_id\s*=\s*v_student_id\s+and\s+saved_note\.lesson_id\s*=\s*p_lesson_id/i);
  assert.match(note, /on\s+conflict\s+on\s+constraint\s+video_class_notes_pkey\s+do\s+update/i);

  const listLessons = sqlFunctionBlock("video_class_student_list_lessons");
  assert.match(listLessons, /left\s+join\s+public\.video_class_bookmarks\s+bookmark\s+on\s+bookmark\.lesson_id\s*=\s*lesson\.id\s+and\s+bookmark\.student_id\s*=\s*v_student_id/i);
  assert.match(listLessons, /left\s+join\s+public\.video_class_notes\s+note\s+on\s+note\.lesson_id\s*=\s*lesson\.id\s+and\s+note\.student_id\s*=\s*v_student_id/i);

  assert.match(portalHtml, /data-student-route="bookmarks"/);
  assert.match(portalHtml, /data-student-route="notes"/);
  assert.match(portalHtml, /<textarea[^>]*data-note-content[^>]*maxlength="5000"/i);
  assert.match(portalJs, /body:\s*\{\s*bookmarked\s*\}/);
  assert.match(portalJs, /body:\s*\{\s*note:\s*text\s*\}/);
  assert.match(portalJs, /content\.textContent\s*=\s*lesson\.note/, "saved note text must not be injected as HTML");
  assert.match(portalJs, /elements\.printNotes\?\.addEventListener\("click",\s*\(\)\s*=>\s*window\.print\(\)\)/);
  assert.match(workerSource, /if\s*\(note\.length\s*>\s*5000\)\s*throw\s+new\s+HttpError\(400,\s*"Note is too long"\)/);
});

test("watermark preference is administered, granted, rendered, and revokes stale playback", () => {
  const accessTable = sqlTableBlock("video_class_student_access");
  assert.match(accessTable, /watermark_enabled\s+boolean\s+not\s+null\s+default\s+true/i);

  const adminWatermark = sqlFunctionBlock("video_class_admin_set_watermark");
  assert.match(adminWatermark, /set\s+watermark_enabled\s*=\s*p_enabled/i);
  assert.match(adminWatermark, /where\s+access\.student_id\s*=\s*p_student_id/i);
  assert.match(adminWatermark, /case\s+when\s+p_enabled\s+then\s+'enable_watermark'\s+else\s+'disable_watermark'/i);

  const revoke = sqlFunctionBlock("video_class_revoke_playbacks_on_access_change");
  assert.match(revoke, /old\.watermark_enabled\s+is\s+distinct\s+from\s+new\.watermark_enabled/i);
  assert.match(revoke, /set\s+revoked_at\s*=\s*coalesce\(playback\.revoked_at,\s*now\(\)\)/i);
  assert.match(
    sql,
    /create\s+trigger\s+video_class_access_revoke_playbacks\s+after\s+update\s+of\s+video_key,\s*enabled,\s*watermark_enabled\s+or\s+delete/i
  );

  const grant = sqlFunctionBlock("video_class_create_playback");
  assert.match(grant, /watermark_enabled\s+boolean/i);
  assert.match(grant, /access\.watermark_enabled/i);
  assert.match(grant, /v_watermark_enabled/);
  assert.match(workerSource, /const\s+watermarkEnabled\s*=\s*row\.watermark_enabled\s*!==\s*false/);
  assert.match(workerSource, /enabled:\s*watermarkEnabled/);
  assert.match(workerSource, /videoKey:\s*watermarkEnabled\s*\?\s*String\(row\.video_key\s*\|\|\s*""\)\s*:\s*""/);
  assert.match(workerSource, /sessionCode:\s*watermarkEnabled\s*\?\s*sessionCode\s*:\s*""/);

  assert.match(portalHtml, /data-disable-watermarks/);
  assert.match(portalJs, /watermarkEnabled:\s*!watermarksDisabled/);
  assert.match(portalJs, /elements\.watermarkLayer\.hidden\s*=\s*!enabled/);
  assert.match(portalJs, /if\s*\(!enabled\)\s*\{[\s\S]{0,260}?watermarkMain\.textContent\s*=\s*""/);
  assert.match(portalJs, /\/watermark`,\s*\{\s*method:\s*"PATCH"[\s\S]{0,180}?body:\s*\{\s*enabled:\s*watermarkEnabled\s*\}/);
});

test("Worker learning/admin mutations use bearer-derived ownership without touching a real database", async () => {
  const originalFetch = globalThis.fetch;
  const studentToken = "11111111-1111-4111-8111-111111111111";
  const adminToken = "22222222-2222-4222-8222-222222222222";
  const lessonId = "33333333-3333-4333-8333-333333333333";
  const studentId = "44444444-4444-4444-8444-444444444444";
  const serviceSecret = "test-only-service-secret-".padEnd(48, "x");
  const allowedOrigin = "https://edmundeducation.com";
  const env = {
    ALLOWED_ORIGIN: allowedOrigin,
    SUPABASE_URL: "https://database.invalid",
    SUPABASE_ANON_KEY: "test-publishable-key",
    VIDEO_CLASS_SERVICE_SECRET: serviceSecret
  };
  const calls = [];

  const responseRows = (name, body) => {
    switch (name) {
      case "video_class_student_me":
        return [{ student_id: studentId, name: "Test Student", video_key: "EDU-TEST-ONLY-0001", expires_at: "2099-01-01T00:00:00Z" }];
      case "video_class_admin_me":
        return [{ admin_id: adminToken, name: "Test Admin", expires_at: "2099-01-01T00:00:00Z" }];
      case "video_class_student_toggle_bookmark":
        return [{ lesson_id: body.p_lesson_id, bookmarked: body.p_bookmarked, updated_at: "2099-01-01T00:00:00Z" }];
      case "video_class_student_save_note":
        return [{ lesson_id: body.p_lesson_id, note: body.p_note || null, updated_at: "2099-01-01T00:00:00Z" }];
      case "video_class_admin_set_course_access":
        return [{ student_id: body.p_student_id, course_code: body.p_course_code, enabled: body.p_enabled, updated_at: "2099-01-01T00:00:00Z" }];
      case "video_class_admin_set_watermark":
        return [{ student_id: body.p_student_id, watermark_enabled: body.p_enabled, updated_at: "2099-01-01T00:00:00Z" }];
      default:
        return { unexpectedRpc: name };
    }
  };

  const mockedFetch = async (input, init = {}) => {
    const url = new URL(typeof input === "string" ? input : input.url);
    const name = decodeURIComponent(url.pathname.split("/").at(-1));
    const body = JSON.parse(String(init.body || "{}"));
    calls.push({ name, body, method: init.method, headers: init.headers });
    return new Response(JSON.stringify(responseRows(name, body)), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  };

  const makeRequest = (path, method, token, body) => new Request(`https://worker.invalid${path}`, {
    method,
    headers: {
      Origin: allowedOrigin,
      Authorization: `Bearer ${token}`,
      ...(body === undefined ? {} : { "Content-Type": "application/json" })
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  await withMockedFetch(mockedFetch, async () => {
    const bookmarkResponse = await worker.fetch(
      makeRequest(`/v1/lessons/${lessonId}/bookmark`, "PATCH", studentToken, { bookmarked: true }),
      env,
      {}
    );
    assert.equal(bookmarkResponse.status, 200);
    assert.equal((await bookmarkResponse.json()).bookmark.bookmarked, true);

    const noteResponse = await worker.fetch(
      makeRequest(`/v1/lessons/${lessonId}/note`, "PUT", studentToken, { note: "student-owned note" }),
      env,
      {}
    );
    assert.equal(noteResponse.status, 200);
    assert.equal((await noteResponse.json()).note.text, "student-owned note");

    const courseResponse = await worker.fetch(
      makeRequest(`/v1/admin/students/${studentId}/courses/dse`, "PATCH", adminToken, { enabled: true }),
      env,
      {}
    );
    assert.equal(courseResponse.status, 200);
    assert.equal((await courseResponse.json()).courseAccess.courseCode, "dse");

    const watermarkResponse = await worker.fetch(
      makeRequest(`/v1/admin/students/${studentId}/watermark`, "PATCH", adminToken, { enabled: false }),
      env,
      {}
    );
    assert.equal(watermarkResponse.status, 200);
    assert.equal((await watermarkResponse.json()).watermarkEnabled, false);

    const callsBeforeRejectedNote = calls.length;
    const oversizedResponse = await worker.fetch(
      makeRequest(`/v1/lessons/${lessonId}/note`, "PUT", studentToken, { note: "n".repeat(5001) }),
      env,
      {}
    );
    assert.equal(oversizedResponse.status, 400);
    assert.equal(calls.length, callsBeforeRejectedNote, "an oversized note must be rejected before any Supabase RPC");
  });

  assert.equal(globalThis.fetch, originalFetch, "the fetch mock must always be cleaned up");
  assert.ok(calls.length > 0);
  assert.ok(calls.every(call => call.method === "POST"));
  assert.ok(calls.every(call => call.body.p_service_secret === serviceSecret));
  assert.ok(calls.every(call => call.headers.apikey === env.SUPABASE_ANON_KEY));
  assert.ok(calls.every(call => !Object.hasOwn(call.body, "p_student_id") || call.name.startsWith("video_class_admin_")));

  const bookmarkCall = calls.find(call => call.name === "video_class_student_toggle_bookmark");
  assert.deepEqual(
    { token: bookmarkCall?.body.p_student_token, lesson: bookmarkCall?.body.p_lesson_id, bookmarked: bookmarkCall?.body.p_bookmarked },
    { token: studentToken, lesson: lessonId, bookmarked: true }
  );
  assert.equal(Object.hasOwn(bookmarkCall.body, "p_student_id"), false);

  const noteCall = calls.find(call => call.name === "video_class_student_save_note");
  assert.deepEqual(
    { token: noteCall?.body.p_student_token, lesson: noteCall?.body.p_lesson_id, note: noteCall?.body.p_note },
    { token: studentToken, lesson: lessonId, note: "student-owned note" }
  );
  assert.equal(Object.hasOwn(noteCall.body, "p_student_id"), false);

  const courseCall = calls.find(call => call.name === "video_class_admin_set_course_access");
  assert.deepEqual(
    { admin: courseCall?.body.p_admin_token, student: courseCall?.body.p_student_id, course: courseCall?.body.p_course_code, enabled: courseCall?.body.p_enabled },
    { admin: adminToken, student: studentId, course: "dse", enabled: true }
  );

  const watermarkCall = calls.find(call => call.name === "video_class_admin_set_watermark");
  assert.deepEqual(
    { admin: watermarkCall?.body.p_admin_token, student: watermarkCall?.body.p_student_id, enabled: watermarkCall?.body.p_enabled },
    { admin: adminToken, student: studentId, enabled: false }
  );
});

test("database access is RLS-protected, revoked, and Worker-secret gated", () => {
  const tables = new Set(
    Array.from(sql.matchAll(/create\s+table\s+if\s+not\s+exists\s+public\.(video_class_[a-z0-9_]+)/gi), match => match[1])
  );
  assert.ok(tables.size >= 14, "expected the complete course, entitlement, learning-state, and playback data model");
  for (const table of tables) {
    const name = escapeRegExp(table);
    assert.match(sql, new RegExp(`alter\\s+table\\s+public\\.${name}\\s+enable\\s+row\\s+level\\s+security;`, "i"), `${table}: RLS`);
    assert.match(
      sql,
      new RegExp(`revoke\\s+all\\s+on\\s+table\\s+public\\.${name}\\s+from\\s+public,\\s*anon,\\s*authenticated;`, "i"),
      `${table}: table privileges`
    );
  }

  const workerGate = sqlFunctionBlock("_video_class_worker_ok");
  assert.match(workerGate, /coalesce\(length\(p_service_secret\),\s*0\)\s*>=\s*48/i);
  assert.match(workerGate, /secret\.secret_hash\s*=\s*extensions\.digest\(p_service_secret,\s*'sha256'\)/i);
  assert.match(workerSource, /String\(env\.VIDEO_CLASS_SERVICE_SECRET\s*\|\|\s*""\)\.length\s*<\s*48/);
  assert.match(workerSource, /JSON\.stringify\(\{\s*p_service_secret:\s*env\.VIDEO_CLASS_SERVICE_SECRET,\s*\.\.\.parameters\s*\}\)/);
});

test("private R2 lesson metadata and the Worker/RPC contracts stay aligned", () => {
  assert.equal(wrangler.name, "edmund-video-class");
  assert.deepEqual(wrangler.r2_buckets, [{
    binding: "VIDEO_CLASSES",
    bucket_name: "edmund-video-classes-private"
  }]);
  assert.match(sql, /'lessons\/bourree\.mp4'/);
  assert.match(sql, /'lessons\/bourree\/v1\/480p\.mp4'[\s\S]{0,80}?4690550/i);
  assert.match(sql, /'lessons\/bourree\/v1\/720p\.mp4'[\s\S]{0,80}?8736537/i);
  assert.match(sql, /'lessons\/bourree\.mp4'[\s\S]{0,80}?11147309/i);
  assert.match(sql, /'lessons\/bourree\/v1\/poster\.jpg'[\s\S]{0,80}?'image\/jpeg'[\s\S]{0,80}?24703/i);
  assert.match(sql, /'bourree',[\s\S]{0,400}?'lessons\/bourree\.mp4',[\s\S]{0,80}?true\s*\)/i);
  assert.match(workerSource, /env\.VIDEO_CLASSES\.head\(objectKey\)/);
  assert.match(workerSource, /env\.VIDEO_CLASSES\.get\(objectKey/);

  const expectedRpcs = sorted([
    "video_class_student_login",
    "video_class_student_exchange",
    "video_class_student_me",
    "video_class_student_logout",
    "video_class_admin_login",
    "video_class_admin_me",
    "video_class_admin_logout",
    "video_class_admin_list_students",
    "video_class_admin_list_courses",
    "video_class_admin_list_lessons",
    "video_class_admin_list_feedback",
    "video_class_admin_issue_key",
    "video_class_admin_clear_key",
    "video_class_admin_set_enabled",
    "video_class_admin_set_course_access",
    "video_class_admin_set_watermark",
    "video_class_admin_set_lesson_private",
    "video_class_student_list_courses",
    "video_class_student_list_lessons",
    "video_class_student_library",
    "video_class_student_toggle_bookmark",
    "video_class_student_save_note",
    "video_class_student_create_playlist",
    "video_class_student_rename_playlist",
    "video_class_student_delete_playlist",
    "video_class_student_set_playlist_lesson",
    "video_class_student_create_clip",
    "video_class_student_delete_clip",
    "video_class_student_save_feedback",
    "video_class_create_playback",
    "video_class_playback_list_renditions",
    "video_class_authorize_thumbnail",
    "video_class_authorize_rendition",
    "video_class_record_progress"
  ]);
  const workerRpcs = sorted(new Set(
    Array.from(workerSource.matchAll(/serviceRpc\(env,\s*"([a-z0-9_]+)"/g), match => match[1])
  ));
  assert.deepEqual(workerRpcs, expectedRpcs, "Worker RPC calls must match the reviewed database boundary");

  for (const rpc of expectedRpcs) {
    const block = sqlFunctionBlock(rpc);
    assert.match(block, /p_service_secret\s+text/i, `${rpc}: service-secret parameter`);
    assert.match(block, /security\s+definer/i, `${rpc}: SECURITY DEFINER`);
    assert.match(block, /set\s+search_path\s*=\s*''/i, `${rpc}: empty search_path`);
    assert.match(block, /public\._video_class_worker_ok\(p_service_secret\)/i, `${rpc}: service-secret check`);
    assert.match(sql, new RegExp(`revoke\\s+all\\s+on\\s+function\\s+public\\.${escapeRegExp(rpc)}\\(`, "i"), `${rpc}: revoke`);
    assert.match(sql, new RegExp(`grant\\s+execute\\s+on\\s+function\\s+public\\.${escapeRegExp(rpc)}\\(`, "i"), `${rpc}: narrow PostgREST grant`);
  }

  assertWorkerRoute("/v1/student/login", "POST");
  assertWorkerRoute("/v1/student/exchange", "POST");
  assertWorkerRoute("/v1/student/session", "GET");
  assertWorkerRoute("/v1/admin/login", "POST");
  assertWorkerRoute("/v1/admin/session", "GET");
  assertWorkerRoute("/v1/admin/students", "GET");
  assertWorkerRoute("/v1/admin/courses", "GET");
  assertWorkerRoute("/v1/admin/feedback", "GET");
  assertWorkerRoute("/v1/courses", "GET");
  assertWorkerRoute("/v1/lessons", "GET");
  assertWorkerRoute("/v1/playback/grant", "POST");
  assertWorkerRoute("/v1/playback/heartbeat", "POST");
  assert.match(workerSource, /\^\\\/v1\\\/admin\\\/students\\\/\(\[\^\/\]\+\)\\\/key\$/);
  assert.match(workerSource, /\^\\\/v1\\\/admin\\\/students\\\/\(\[\^\/\]\+\)\\\/access\$/);
  assert.match(workerSource, /\^\\\/v1\\\/admin\\\/students\\\/\(\[\^\/\]\+\)\\\/courses\\\/\(\[\^\/\]\+\)\$/);
  assert.match(workerSource, /\^\\\/v1\\\/admin\\\/students\\\/\(\[\^\/\]\+\)\\\/watermark\$/);
  assert.match(workerSource, /\^\\\/v1\\\/lessons\\\/\(\[\^\/\]\+\)\\\/bookmark\$/);
  assert.match(workerSource, /\^\\\/v1\\\/lessons\\\/\(\[\^\/\]\+\)\\\/note\$/);
  assert.match(workerSource, /\^\\\/v1\\\/lessons\\\/\(\[\^\/\]\+\)\\\/thumbnail\$/);
  assert.match(workerSource, /\^\\\/v1\\\/lessons\\\/\(\[\^\/\]\+\)\\\/clips\$/);
  assert.match(workerSource, /\^\\\/v1\\\/lessons\\\/\(\[\^\/\]\+\)\\\/feedback\$/);
  assert.match(workerSource, /\^\\\/v1\\\/playlists\\\/\(\[\^\/\]\+\)\\\/lessons\\\/\(\[\^\/\]\+\)\$/);
  assert.match(workerSource, /\^\\\/v1\\\/video\\\/\(\[\^\/\]\+\)\$/);

  for (const clientContract of [
    /apiRequest\(`\/v1\/\$\{role\}\/login`/,
    /apiRequest\("\/v1\/student\/exchange"/,
    /apiRequest\(`\/v1\/\$\{role\}\/session`/,
    /apiRequest\("\/v1\/lessons"/,
    /apiRequest\("\/v1\/playback\/grant"/,
    /apiRequest\("\/v1\/playback\/heartbeat"/,
    /apiRequest\("\/v1\/admin\/students"/,
    /apiRequest\("\/v1\/admin\/courses"/,
    /apiRequest\("\/v1\/admin\/feedback"/,
    /`\/v1\/admin\/students\/\$\{encodeURIComponent\(student\.id\)\}\/key`/,
    /`\/v1\/admin\/students\/\$\{encodeURIComponent\(student\.id\)\}\/access`/,
    /`\/v1\/admin\/students\/\$\{encodeURIComponent\(student\.id\)\}\/courses\/\$\{encodeURIComponent\(course\.id\)\}`/,
    /`\/v1\/admin\/students\/\$\{encodeURIComponent\(student\.id\)\}\/watermark`/,
    /`\/v1\/lessons\/\$\{encodeURIComponent\(lesson\.id\)\}\/bookmark`/,
    /`\/v1\/lessons\/\$\{encodeURIComponent\(lesson\.id\)\}\/note`/,
    /`\/v1\/lessons\/\$\{encodeURIComponent\(lesson\.id\)\}\/clips`/,
    /`\/v1\/lessons\/\$\{encodeURIComponent\(lesson\.id\)\}\/feedback`/,
    /`\$\{apiBase\}\/v1\/video\/\$\{encodeURIComponent\(lesson\.slug\s*\|\|\s*lesson\.id\)\}\?token=/
  ]) assert.match(portalJs, clientContract);
});

test("student media tools remain wired through private, per-student contracts", () => {
  for (const table of [
    "video_class_lesson_renditions",
    "video_class_lesson_thumbnails",
    "video_class_tags",
    "video_class_student_playlists",
    "video_class_student_clips",
    "video_class_lesson_feedback"
  ]) {
    assert.ok(sqlTableBlock(table), `${table}: schema table`);
    assert.match(sql, new RegExp(`alter\\s+table\\s+public\\.${table}\\s+enable\\s+row\\s+level\\s+security`, "i"), `${table}: RLS`);
    assert.match(sql, new RegExp(`revoke\\s+all\\s+on\\s+table\\s+public\\.${table}`, "i"), `${table}: direct access revoked`);
  }

  assert.match(portalHtml, /data-lesson-search/);
  assert.match(portalHtml, /data-lesson-summary/);
  assert.match(portalHtml, /data-student-route="playlists">我的播放列表/);
  assert.match(portalHtml, /data-note-panel/);
  assert.doesNotMatch(portalHtml, /<dialog[^>]+data-note/i, "notes must expand below the player, not cover it");
  assert.deepEqual(
    Array.from(portalHtml.matchAll(/<option value="(0\.25|0\.5|0\.75|1|1\.25|1\.5|2)"[^>]*>/g), match => Number(match[1])),
    [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]
  );
  for (const quality of ["480p", "720p", "1080p", "max"]) assert.match(portalHtml, new RegExp(`<option value="${quality}"`));
  assert.match(portalHtml, /data-pin-clip/);
  assert.match(portalHtml, /data-clip-rail/);
  assert.match(portalHtml, /data-feedback-rating="videoQuality"/);
  assert.match(portalHtml, /data-feedback-rating="explanation"/);
  assert.match(portalHtml, /data-feedback-rating="audioQuality"/);
  assert.match(portalHtml, /data-ended-overlay[^>]*role="dialog"[^>]*aria-modal="true"/);
  assert.match(portalCss, /\.watermark-repeat\s*\{[^}]*opacity:\s*0\.15/i);
  assert.match(portalCss, /\.company-watermark\.is-visible\s*\{\s*opacity:\s*0\.3/i);
  assert.match(portalCss, /\.seek-marker\s*\{[^}]*width:\s*44px[^}]*height:\s*44px/i);
  assert.match(portalJs, /function\s+loadLessonThumbnails/);
  assert.match(portalJs, /generation\s*!==\s*state\.lessonLoadGeneration/);
  assert.match(portalJs, /URL\.createObjectURL\(blob\)/);
  assert.match(portalJs, /function\s+renderClips/);
  assert.match(portalJs, /`精彩回顧：\$\{clip\.title\}`/);
  assert.match(portalJs, /function\s+saveLessonFeedback/);
  assert.match(portalJs, /lesson\.viewCount\s*\+=\s*1/);
  assert.match(portalJs, /if\s*\(!closeNoteDialog\(false,\s*\{\s*restoreFocus:\s*false\s*\}\)\)\s*return\s+false/);
  assert.match(portalJs, /function\s+renderAdminFeedback/);
});

test("logout, session errors, and concurrent grants fail safely", () => {
  const sessionTable = sql.match(
    /create\s+table\s+if\s+not\s+exists\s+public\.video_class_student_sessions\s*\([\s\S]*?\n\);/i
  )?.[0] || "";
  assert.match(sessionTable, /minted_flashcard_token\s+uuid\s+references\s+public\.flashcard_student_sessions\(token\)\s+on\s+delete\s+set\s+null/i);

  const login = sqlFunctionBlock("video_class_student_login");
  assert.match(login, /token_hash,\s*student_id,\s*minted_flashcard_token,\s*expires_at/i);
  assert.match(login, /insert\s+into\s+public\.flashcard_student_sessions\s*\(student_id,\s*expires_at\)\s*values\s*\(v_student_id,\s*v_expires_at\)/i);
  const exchange = sqlFunctionBlock("video_class_student_exchange");
  assert.doesNotMatch(exchange, /minted_flashcard_token/i, "an exchanged shared session must remain valid after video logout");

  const logout = sqlFunctionBlock("video_class_student_logout");
  assert.match(logout, /returning\s+session\.minted_flashcard_token\s+into\s+v_minted_flashcard_token/i);
  assert.match(logout, /delete\s+from\s+public\.flashcard_student_sessions\s+session\s+where\s+session\.token\s*=\s*v_minted_flashcard_token/i);

  const playback = sqlFunctionBlock("video_class_create_playback");
  const parentLock = playback.indexOf("for key share");
  const childLock = playback.indexOf("for update of session, access");
  assert.ok(parentLock >= 0 && childLock > parentLock, "playback grants must lock student before session/access");
  assert.match(playback, /select\s+student\.id\s+into\s+v_student_id[\s\S]*?from\s+public\.flashcard_students\s+student[\s\S]*?for\s+key\s+share/i);
  assert.match(playback, /for\s+update\s+of\s+session,\s*access/i, "playback grants must lock session and entitlement before playback rows");

  const authorization = sqlFunctionBlock("video_class_authorize_playback");
  assert.doesNotMatch(authorization, /update\s+public\.video_class_playback_sessions/i, "range authorization must be read-only");
  assert.match(authorization, /join\s+public\.video_class_student_sessions\s+session/i);

  assert.match(workerSource, /async\s+function\s+assertStudentSession\(env,\s*token\)/);
  assert.match(workerSource, /async\s+function\s+listLessons[\s\S]{0,220}?await\s+assertStudentSession\(env,\s*token\)/);
  assert.match(workerSource, /async\s+function\s+grantPlayback[\s\S]{0,260}?await\s+assertStudentSession\(env,\s*studentToken\)/);

  const adminLogin = sqlFunctionBlock("video_class_admin_login");
  assert.match(adminLogin, /for\s+no\s+key\s+update\s+of\s+admin/i);
});

test("byte ranges, 206/416 responses, exact-origin CORS, and security headers are enforced", async () => {
  assert.ok(Object.isFrozen(__test), "Worker test helpers must be immutable");
  assert.deepEqual(__test.parseByteRange("bytes=0-99", 1000), { offset: 0, end: 99, length: 100 });
  assert.deepEqual(__test.parseByteRange("bytes=900-", 1000), { offset: 900, end: 999, length: 100 });
  assert.deepEqual(__test.parseByteRange("bytes=-200", 1000), { offset: 800, end: 999, length: 200 });
  assert.deepEqual(__test.parseByteRange("bytes=950-5000", 1000), { offset: 950, end: 999, length: 50 });
  assert.equal(__test.parseByteRange("bytes=1000-", 1000), null);
  assert.equal(__test.parseByteRange("bytes=0-1,4-5", 1000), null);
  assert.equal(__test.parseByteRange("bytes=-0", 1000), null);
  assert.equal(__test.parseByteRange("items=0-10", 1000), null);
  assert.equal(__test.safeVideoContentType("VIDEO/MP4"), "video/mp4");
  assert.equal(__test.safeVideoContentType("text/html"), "video/mp4");

  assert.match(workerSource, /if\s*\(rangeHeader\s*&&\s*!range\)\s*return\s+rangeNotSatisfiable/);
  assert.match(workerSource, /status:\s*range\s*\?\s*206\s*:\s*200/);
  assert.match(workerSource, /return\s+new\s+Response\(null,\s*\{\s*status:\s*416,\s*headers\s*\}\)/);
  assert.match(workerSource, /headers\.set\("Content-Range",\s*`bytes \$\{range\.offset\}-\$\{range\.end\}\/\$\{head\.size\}`\)/);
  assert.match(workerSource, /headers\.set\("Content-Range",\s*`bytes \*\/\$\{size\}`\)/);
  assert.match(workerSource, /range:\s*\{\s*offset:\s*range\.offset,\s*length:\s*range\.length\s*\}/);

  const allowedOrigin = "https://edmundeducation.com";
  const allowedHealth = await worker.fetch(new Request("https://worker.example/v1/health", {
    headers: { Origin: allowedOrigin }
  }), {}, {});
  assert.equal(allowedHealth.status, 200);
  assert.equal(allowedHealth.headers.get("Access-Control-Allow-Origin"), allowedOrigin);
  assert.equal(allowedHealth.headers.get("Cache-Control"), "private, no-store, max-age=0");
  assert.equal(allowedHealth.headers.get("X-Content-Type-Options"), "nosniff");
  assert.equal(allowedHealth.headers.get("X-Frame-Options"), "DENY");

  const preflight = await worker.fetch(new Request("https://worker.example/v1/lessons", {
    method: "OPTIONS",
    headers: { Origin: allowedOrigin }
  }), {}, {});
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("Access-Control-Allow-Origin"), allowedOrigin);
  assert.match(preflight.headers.get("Access-Control-Allow-Headers") || "", /Authorization/);
  assert.match(preflight.headers.get("Access-Control-Allow-Headers") || "", /Range/);

  const rejected = await worker.fetch(new Request("https://worker.example/v1/lessons", {
    headers: { Origin: "https://untrusted.example" }
  }), {}, {});
  assert.equal(rejected.status, 403);
  assert.equal(rejected.headers.get("Access-Control-Allow-Origin"), null);
  assert.doesNotMatch(workerSource, /Access-Control-Allow-Origin"\s*,\s*"\*"/);
  assert.match(workerSource, /origin === String\(env\.ALLOWED_ORIGIN \|\| DEFAULT_ALLOWED_ORIGIN\)/);
  assert.match(workerSource, /headers\.set\("Referrer-Policy",\s*"no-referrer"\)/);
  assert.match(workerSource, /headers\.set\("X-Robots-Tag",\s*"noindex, nofollow, noarchive"\)/);
});

test("the protected player watermarks video and disables casual extraction paths", () => {
  const videoTag = portalHtml.match(/<video\b[^>]*\bdata-video\b[^>]*><\/video>/i)?.[0] || "";
  assert.ok(videoTag, "missing protected video element");
  for (const attribute of [
    /\bcrossorigin="anonymous"/i,
    /\bplaysinline\b/i,
    /\bcontrolslist="[^"]*nodownload[^"]*noremoteplayback[^"]*"/i,
    /\bdisablepictureinpicture\b/i,
    /\bdisableremoteplayback\b/i
  ]) assert.match(videoTag, attribute);
  assert.ok((portalHtml.match(/data-watermark-repeat/g) || []).length >= 6, "watermark must cover multiple screen areas");
  assert.match(portalHtml, /data-watermark-main/);
  assert.match(portalJs, /watermarkMain\.textContent\s*=\s*`\$\{state\.playback\.videoKey\}\s*·\s*\$\{state\.playback\.sessionCode\}\s*·\s*\$\{timestamp\}`/);
  assert.match(portalJs, /setInterval\(updateText,\s*1000\)/);
  assert.match(portalJs, /setInterval\(moveWatermark,\s*23000\)/);
  assert.match(portalJs, /elements\.video\.disablePictureInPicture\s*=\s*true/);
  assert.match(portalJs, /elements\.video\.disableRemotePlayback\s*=\s*true/);
  assert.match(portalJs, /addEventListener\("enterpictureinpicture"/);
  assert.ok((portalJs.match(/addEventListener\("contextmenu"/g) || []).length >= 2);
  assert.match(portalJs, /if\s*\(parsed\.origin\s*!==\s*apiOrigin\)\s*return\s+""/);
  assert.match(portalJs, /elements\.player\.requestFullscreen\(\)/, "fullscreen must keep the overlay inside the fullscreen element");
  assert.match(portalJs, /resumeAt:\s*lesson\.completed\s*\?\s*0\s*:/, "completed lessons must restart from the beginning");
});

test("clips, keyboard playback, ratings, and playlist bulk tools follow the requested learning flow", () => {
  const workspaceStart = portalHtml.indexOf('<div class="player-workspace"');
  const workspaceEnd = portalHtml.indexOf('<div class="player-notice">', workspaceStart);
  const workspace = portalHtml.slice(workspaceStart, workspaceEnd);
  const rail = workspace.indexOf('data-clip-rail');
  const player = workspace.indexOf('data-player tabindex');
  assert.ok(workspaceStart >= 0 && rail >= 0 && player > rail, "clip rail must be a sibling before the protected player");
  assert.match(portalCss, /\.player-workspace\s*\{[^}]*display:\s*flex/i);
  assert.match(portalCss, /\.seek-marker::before\s*\{/);
  assert.match(portalCss, /\.seek-marker::after\s*\{/);
  assert.match(portalCss, /cursor:\s*url\("data:image\/svg\+xml/);
  assert.match(portalJs, /className\s*=\s*"clip-item__delete"/);
  assert.match(portalJs, /\/v1\/clips\/[\s\S]{0,180}?method:\s*"DELETE"/);
  assert.match(portalJs, /item\.classList\.add\("is-actions-visible"\)/);

  assert.match(portalJs, /event\.code\s*!==\s*"Space"/);
  assert.match(portalJs, /document\.addEventListener\("keydown",\s*handlePlaybackSpacebar,\s*true\)/);
  assert.match(portalJs, /elements\.centrePlay\.hidden\s*=\s*true/);
  assert.doesNotMatch(portalJs, /elements\.centrePlay\.hidden\s*=\s*!paused/);

  assert.match(portalJs, /selectedCount\s*===\s*3[\s\S]{0,80}?saveLessonFeedback/);
  assert.match(portalJs, /setTimeout\(\(\)\s*=>\s*\{[\s\S]{0,120}?saveLessonFeedback\(\);[\s\S]{0,40}?\},\s*2000\)/);
  assert.match(portalHtml, /data-playlist-summary/);
  assert.match(portalHtml, /data-playlist-select-toggle/);
  assert.match(portalHtml, /data-playlist-remove-selected/);
  assert.match(portalJs, /playlistProgressSummary\(lessons\)/);
  assert.match(portalJs, /Promise\.all\(lessonIds\.map[\s\S]{0,220}?method:\s*"DELETE"/);
});

test("lesson privacy is database-enforced and administered without exposing R2 keys", () => {
  const lessonsTable = sqlTableBlock("video_class_lessons");
  assert.match(lessonsTable, /is_private\s+boolean\s+not\s+null\s+default\s+false/i);

  const library = sqlFunctionBlock("video_class_student_library");
  assert.match(library, /'is_private',\s*lesson\.is_private/i);
  assert.doesNotMatch(library, /where\s+lesson\.published\s*=\s*true\s+and\s+lesson\.is_private\s*=\s*false/i, "private lessons remain visible in the library");

  for (const name of [
    "video_class_authorize_thumbnail",
    "video_class_playback_list_renditions",
    "video_class_create_playback",
    "video_class_authorize_playback",
    "video_class_record_progress"
  ]) assert.match(sqlFunctionBlock(name), /lesson\.is_private\s*=\s*false/i, `${name} must deny private lessons`);

  const list = sqlFunctionBlock("video_class_admin_list_lessons");
  assert.match(list, /_video_class_worker_ok\(p_service_secret\)/i);
  assert.match(list, /_video_class_admin_id\(p_admin_token\)/i);
  assert.doesNotMatch(list, /'object_key'/i);
  const setter = sqlFunctionBlock("video_class_admin_set_lesson_private");
  assert.match(setter, /set\s+is_private\s*=\s*p_is_private/i);
  assert.match(setter, /update\s+public\.video_class_playback_sessions[\s\S]*?set\s+revoked_at/i);
  assert.match(setter, /video_class_admin_audit_events/i);

  assert.match(workerSource, /url\.pathname\s*===\s*"\/v1\/admin\/lessons"/);
  assert.match(workerSource, /adminLessonPrivacyMatch[\s\S]{0,180}?request\.method\s*===\s*"PATCH"/);
  assert.match(workerSource, /p_is_private:\s*body\.private/);
  assert.match(workerSource, /This video is private and cannot be played/);
  assert.match(portalJs, /lesson\.isPrivate\s*\?\s*"影片為私人/);
  assert.match(portalJs, /body:\s*\{\s*private:\s*isPrivate\s*\}/);
});

test("admin exports complete feedback and activates students through random server-side keys", () => {
  for (const heading of ["Student name", "UUID", "Video class key", "Video title", "Rate 1", "Rate 2", "Rate 3", "Update time", "Exported date"]) {
    assert.ok(portalJs.includes(`"${heading}"`), `CSV must include ${heading}`);
  }
  assert.match(portalJs, /item\.pictureQuality\s*\?\?\s*""/);
  assert.match(portalJs, /item\.explanationQuality\s*\?\?\s*""/);
  assert.match(portalJs, /item\.audioQuality\s*\?\?\s*""/);
  assert.match(portalJs, /type:\s*"text\/csv;charset=utf-8"/);
  assert.match(portalJs, /videoKey:\s*String\(row\.videoKey\s*\|\|\s*row\.video_key/);
  assert.match(sqlFunctionBlock("video_class_admin_list_feedback"), /'video_key',\s*student_access\.video_key/i);

  assert.match(portalHtml, /data-admin-panel-tab="lessons"/);
  assert.match(portalHtml, /data-admin-panel-tab="add-student"/);
  assert.match(portalJs, /state\.students\.filter\(student\s*=>\s*!student\.videoKey\)/);
  assert.match(portalJs, /activateVideoStudent[\s\S]*?body:\s*\{\s*rotate:\s*false\s*\}/);
  assert.match(sqlFunctionBlock("video_class_admin_issue_key"), /_video_class_next_key\(\)/i);
});

test("portal clickjacking guard, CSP, and Worker deployment are reproducible", () => {
  assert.match(portalHtml, /<html\s+lang="zh-Hant"\s+class="frame-guard">/);
  assert.match(portalHtml, /\.frame-guard body\{display:none!important\}/);
  assert.match(portalHtml, /<script\s+src="video-class-frame-guard\.js[^"\n]*"><\/script>/);
  assert.match(frameGuardJs, /window\.self\s*===\s*window\.top/);
  assert.match(frameGuardJs, /document\.documentElement\.classList\.remove\("frame-guard"\)/);
  assert.match(frameGuardJs, /window\.stop\(\)/);

  const csp = portalHtml.match(/<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)">/i)?.[1] || "";
  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /script-src 'self' https:\/\/challenges\.cloudflare\.com/);
  assert.match(csp, /frame-src https:\/\/challenges\.cloudflare\.com/);
  assert.match(csp, /connect-src 'self' https:\/\/edmund-video-class\.edmundeducation\.workers\.dev https:\/\/challenges\.cloudflare\.com/);
  assert.doesNotMatch(csp, /(?:script-src|frame-src)[^;]*\*/);
  assert.match(csp, /media-src https:\/\/edmund-video-class\.edmundeducation\.workers\.dev/);

  assert.match(workerPackage.devDependencies.wrangler, /^\d+\.\d+\.\d+$/, "Wrangler must be pinned exactly");
  assert.equal(workerLock.lockfileVersion, 3);
  assert.equal(workerLock.packages[""].devDependencies.wrangler, workerPackage.devDependencies.wrangler);
  assert.equal(workerLock.packages["node_modules/wrangler"].version, workerPackage.devDependencies.wrangler);
  assert.doesNotMatch(workerPackageSource + workerLockSource, /wrangler@latest|"wrangler"\s*:\s*"[~^]/);
});

test("administrator UI exposes UUID/key controls and playback grants expire within two hours", () => {
  assert.match(portalHtml, /<th\s+scope="col">Internal UUID<\/th>/);
  assert.match(portalHtml, /<th\s+scope="col">Video Class Key<\/th>/);
  assert.match(portalHtml, /<tbody\s+data-student-rows><\/tbody>/);
  assert.match(portalJs, /id\.className\s*=\s*"uuid"/);
  assert.match(portalJs, /key\.className\s*=\s*`video-key/);
  assert.match(portalJs, /issue\.dataset\.action\s*=\s*student\.videoKey\s*\?\s*"rotate"\s*:\s*"issue"/);
  assert.match(portalJs, /clear\.dataset\.action\s*=\s*"clear"/);
  assert.match(portalJs, /toggle\.disabled\s*=\s*!student\.videoKey/);
  assert.match(portalJs, /method:\s*"PATCH"[\s\S]{0,100}?body:\s*\{\s*enabled\s*\}/);
  assert.match(portalCss, /\.entitlement-student-picker\s*\{[^}]*min-width:\s*0;[^}]*width:\s*min\(620px,\s*100%\)/i);
  assert.match(portalCss, /\.entitlement-student-picker\s+>\s+span,\s*\.entitlement-student-picker\s+select\s*\{[^}]*min-width:\s*0;[^}]*max-width:\s*100%;[^}]*width:\s*100%;/i);

  assert.match(workerSource, /const\s+PLAYBACK_TOKEN_TTL_SECONDS\s*=\s*2\s*\*\s*60\s*\*\s*60\s*;/);
  assert.match(workerSource, /databaseExpiryMs\s*=\s*Date\.parse\(String\(row\.expires_at\s*\|\|\s*""\)\)/);
  assert.match(
    workerSource,
    /expiresSeconds\s*=\s*Math\.min\(nowSeconds\s*\+\s*PLAYBACK_TOKEN_TTL_SECONDS,\s*databaseExpiresSeconds\)/,
    "the signed URL must never outlive its database playback/session expiry"
  );
  assert.match(workerSource, /exp:\s*expiresSeconds/);
  assert.match(workerSource, /payload\.exp\s*-\s*payload\.iat\s*>\s*PLAYBACK_TOKEN_TTL_SECONDS\s*\+\s*60/);
  assert.match(workerSource, /tokenExpiresAt:\s*expiresAt/);
  assert.doesNotMatch(workerSource, /filtered\.slice\(/, "admin roster must not silently stop after 100 students");
});

let failed = 0;
for (const { name, run } of tests) {
  try {
    await run();
    console.log(`✓ ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`✗ ${name}`);
    console.error(error?.stack || error);
  }
}

console.log(`\n${tests.length - failed}/${tests.length} video-class architecture checks passed.`);
if (failed) process.exitCode = 1;
