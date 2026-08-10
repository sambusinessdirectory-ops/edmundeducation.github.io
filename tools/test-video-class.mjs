#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

const [recordedHtml, portalHtml, portalJs, frameGuardJs, portalConfig, sql, workerSource, wranglerSource, workerPackageSource, workerLockSource] = await Promise.all([
  read("recorded.html"),
  read("video-class.html"),
  read("video-class.js"),
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
  assert.match(login, /student\.password_hash\s*=\s*extensions\.crypt\(p_password,\s*student\.password_hash\)/i);
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

test("database access is RLS-protected, revoked, and Worker-secret gated", () => {
  const tables = new Set(
    Array.from(sql.matchAll(/create\s+table\s+if\s+not\s+exists\s+public\.(video_class_[a-z0-9_]+)/gi), match => match[1])
  );
  assert.ok(tables.size >= 9, "expected the complete video-class data model");
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
    "video_class_admin_issue_key",
    "video_class_admin_clear_key",
    "video_class_admin_set_enabled",
    "video_class_student_list_lessons",
    "video_class_create_playback",
    "video_class_authorize_playback",
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
  assertWorkerRoute("/v1/lessons", "GET");
  assertWorkerRoute("/v1/playback/grant", "POST");
  assertWorkerRoute("/v1/playback/heartbeat", "POST");
  assert.match(workerSource, /\^\\\/v1\\\/admin\\\/students\\\/\(\[\^\/\]\+\)\\\/key\$/);
  assert.match(workerSource, /\^\\\/v1\\\/admin\\\/students\\\/\(\[\^\/\]\+\)\\\/access\$/);
  assert.match(workerSource, /\^\\\/v1\\\/video\\\/\(\[\^\/\]\+\)\$/);

  for (const clientContract of [
    /apiRequest\(`\/v1\/\$\{role\}\/login`/,
    /apiRequest\("\/v1\/student\/exchange"/,
    /apiRequest\(`\/v1\/\$\{role\}\/session`/,
    /apiRequest\("\/v1\/lessons"/,
    /apiRequest\("\/v1\/playback\/grant"/,
    /apiRequest\("\/v1\/playback\/heartbeat"/,
    /apiRequest\("\/v1\/admin\/students"/,
    /`\/v1\/admin\/students\/\$\{encodeURIComponent\(student\.id\)\}\/key`/,
    /`\/v1\/admin\/students\/\$\{encodeURIComponent\(student\.id\)\}\/access`/,
    /`\$\{apiBase\}\/v1\/video\/\$\{encodeURIComponent\(lesson\.slug\s*\|\|\s*lesson\.id\)\}\?token=/
  ]) assert.match(portalJs, clientContract);
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
  assert.match(csp, /frame-src 'none'/);
  assert.match(csp, /connect-src 'self' https:\/\/edmund-video-class\.edmundeducation\.workers\.dev/);
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
