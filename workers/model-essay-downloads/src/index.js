import { CATALOG } from "./catalog.js";

const encoder = new TextEncoder();
const catalogById = new Map(CATALOG.map(item => [item.id, item]));
const COOKIE_NAME = "__Host-edmund_dl";
const SESSION_TTL_SECONDS = 15 * 60;
const ZIP_UTF8_FLAG = 0x0800;
const ZIP_BUILD_DATE = new Date("2026-07-14T00:00:00Z");

export default {
  async fetch(request, env, ctx) {
    try {
      return await route(request, env, ctx);
    } catch (error) {
      console.error("Download Worker error", error);
      return json({ error: "Download service error" }, 500, request, env);
    }
  }
};

async function route(request, env, ctx) {
  const url = new URL(request.url);
  const origin = request.headers.get("Origin") || "";

  if (request.method === "OPTIONS") {
    if (!isAllowedOrigin(origin, env)) return json({ error: "Origin not allowed" }, 403, request, env);
    return new Response(null, { status: 204, headers: corsHeaders(origin, env) });
  }

  if (url.pathname === "/v1/health" && request.method === "GET") {
    return json({ ok: true, files: CATALOG.length, service: "edmund-model-essay-downloads" }, 200, request, env);
  }

  if (url.pathname === "/v1/session" && request.method === "POST") {
    return createDownloadSession(request, env);
  }

  if (url.pathname === "/v1/session" && request.method === "DELETE") {
    if (!isAllowedOrigin(origin, env)) return json({ error: "Origin not allowed" }, 403, request, env);
    const headers = corsHeaders(origin, env);
    headers.set("Set-Cookie", `${COOKIE_NAME}=; Max-Age=0; Path=/; Secure; HttpOnly; SameSite=None`);
    headers.set("Cache-Control", "no-store");
    return new Response(null, { status: 204, headers });
  }

  if (url.pathname === "/v1/admin/login" && request.method === "POST") {
    return adminLogin(request, env);
  }

  if (url.pathname.startsWith("/v1/files/") && request.method === "POST") {
    if (!isAllowedOrigin(origin, env)) return json({ error: "Origin not allowed" }, 403, request, env);
    const form = await parseDownloadForm(request, env);
    if (form instanceof Response) return form;
    const student = await authenticateRequest(request, env, form);
    if (!student) return json({ error: "Authentication required" }, 401, request, env);
    const id = decodeURIComponent(url.pathname.slice("/v1/files/".length));
    return downloadFile(request, env, ctx, student, id);
  }

  if (url.pathname === "/v1/zip" && request.method === "POST") {
    if (!isAllowedOrigin(origin, env)) return json({ error: "Origin not allowed" }, 403, request, env);
    const form = await parseDownloadForm(request, env);
    if (form instanceof Response) return form;
    const student = await authenticateRequest(request, env, form);
    if (!student) return json({ error: "Authentication required" }, 401, request, env);
    return downloadZip(request, env, ctx, student, form);
  }

  return json({ error: "Not found" }, 404, request, env);
}

function isAllowedOrigin(origin, env) {
  return Boolean(origin) && origin === String(env.ALLOWED_ORIGIN || "https://edmundeducation.com");
}

function corsHeaders(origin, env) {
  const headers = new Headers({
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Expose-Headers": "Content-Disposition, Content-Length, ETag",
    "Vary": "Origin"
  });
  if (isAllowedOrigin(origin, env)) headers.set("Access-Control-Allow-Origin", origin);
  return headers;
}

function json(value, status, request, env) {
  const headers = corsHeaders(request.headers.get("Origin") || "", env);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(JSON.stringify(value), { status, headers });
}

async function readLimitedText(request, maxBytes) {
  const declaredLength = Number(request.headers.get("Content-Length") || 0);
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new Error("BODY_TOO_LARGE");
  }
  if (!request.body) return "";

  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel("Request body is too large");
      throw new Error("BODY_TOO_LARGE");
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

async function parseDownloadForm(request, env) {
  const contentType = request.headers.get("Content-Type") || "";
  if (!contentType.toLowerCase().startsWith("application/x-www-form-urlencoded")) {
    return json({ error: "Invalid archive request" }, 400, request, env);
  }
  try {
    return new URLSearchParams(await readLimitedText(request, 32 * 1024));
  } catch (error) {
    return json(
      { error: error?.message === "BODY_TOO_LARGE" ? "Download request is too large" : "Invalid archive request" },
      error?.message === "BODY_TOO_LARGE" ? 413 : 400,
      request,
      env
    );
  }
}

async function adminLogin(request, env) {
  const origin = request.headers.get("Origin") || "";
  if (!isAllowedOrigin(origin, env)) return json({ error: "Origin not allowed" }, 403, request, env);
  if (!env.ADMIN_LOGIN_RATE_LIMITER || !env.MODEL_ESSAY_SERVICE_SECRET) {
    return json({ error: "Admin login is not configured" }, 503, request, env);
  }

  const actor = request.headers.get("CF-Connecting-IP") || "missing-client-ip";
  const rateLimit = await env.ADMIN_LOGIN_RATE_LIMITER.limit({ key: `model-essay-admin:${actor}` });
  if (!rateLimit.success) return json({ error: "Too many login attempts" }, 429, request, env);

  let payload;
  try {
    payload = JSON.parse(await readLimitedText(request, 4096));
  } catch (error) {
    if (error?.message === "BODY_TOO_LARGE") return json({ error: "Login request is too large" }, 413, request, env);
    return json({ error: "Invalid login request" }, 400, request, env);
  }

  const name = String(payload?.name || "").trim();
  const password = String(payload?.password || "");
  if (!name || name.length > 100 || !password || password.length > 200) {
    return json({ error: "Invalid login request" }, 400, request, env);
  }

  const endpoint = `${String(env.SUPABASE_URL || "").replace(/\/+$/, "")}/rest/v1/rpc/model_essay_admin_login`;
  if (!endpoint.startsWith("https://") || !env.SUPABASE_ANON_KEY) {
    return json({ error: "Admin login is not configured" }, 503, request, env);
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "apikey": env.SUPABASE_ANON_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        p_service_secret: env.MODEL_ESSAY_SERVICE_SECRET,
        p_name: name,
        p_password: password
      })
    });
    if (!response.ok) return json({ error: "Admin login is temporarily unavailable" }, 502, request, env);
    const rows = await response.json();
    const admin = Array.isArray(rows) && rows.length ? rows[0] : null;
    return json({ admin }, 200, request, env);
  } catch (error) {
    return json({ error: "Admin login is temporarily unavailable" }, 502, request, env);
  }
}

async function createDownloadSession(request, env) {
  const origin = request.headers.get("Origin") || "";
  if (!isAllowedOrigin(origin, env)) return json({ error: "Origin not allowed" }, 403, request, env);
  if (!env.SESSION_SIGNING_KEY) return json({ error: "Download service is not configured" }, 503, request, env);

  let payload;
  try {
    payload = JSON.parse(await readLimitedText(request, 8192));
  } catch (error) {
    if (error?.message === "BODY_TOO_LARGE") return json({ error: "Session request is too large" }, 413, request, env);
    return json({ error: "Invalid request" }, 400, request, env);
  }

  const token = String(payload?.token || "");
  const accessToken = String(payload?.accessToken || "");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token)) {
    return json({ error: "Invalid student session" }, 401, request, env);
  }
  if (!accessToken || accessToken.length > 4096) return json({ error: "Invalid Supabase session" }, 401, request, env);

  const student = await validateStudentSession(token, accessToken, env);
  if (!student) return json({ error: "Invalid or expired student session" }, 401, request, env);
  if (!student.ielts) return json({ error: "IELTS access is not enabled for this account" }, 403, request, env);

  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const cookieValue = await signCookie({ sub: student.id, exp: expiresAt }, env.SESSION_SIGNING_KEY);
  const headers = corsHeaders(origin, env);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Set-Cookie", `${COOKIE_NAME}=${cookieValue}; Max-Age=${SESSION_TTL_SECONDS}; Path=/; Secure; HttpOnly; SameSite=None`);
  headers.set("Cache-Control", "no-store");
  return new Response(JSON.stringify({ token: cookieValue, expiresAt }), { status: 200, headers });
}

async function validateStudentSession(token, accessToken, env) {
  const endpoint = `${String(env.SUPABASE_URL || "").replace(/\/+$/, "")}/rest/v1/rpc/model_essay_student_profile`;
  if (!endpoint.startsWith("https://") || !env.SUPABASE_ANON_KEY) return null;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "apikey": env.SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ p_token: token })
    });
    if (!response.ok) return null;
    const rows = await response.json();
    if (!Array.isArray(rows) || !rows.length) return null;
    const profile = rows[0];
    return typeof profile.id === "string" && /^[0-9a-f-]{36}$/i.test(profile.id)
      ? { id: profile.id, ielts: profile.ielts === true }
      : null;
  } catch (error) {
    return null;
  }
}

async function authenticateRequest(request, env, form = null) {
  if (!env.SESSION_SIGNING_KEY) return null;
  const rawCookie = request.headers.get("Cookie") || "";
  let value = rawCookie.split(";").map(item => item.trim()).find(item => item.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
  const authorization = request.headers.get("Authorization") || "";
  if (!value && authorization.startsWith("Bearer ")) value = authorization.slice(7).trim();
  if (!value && form) value = String(form.get("downloadToken") || "");
  if (!value) return null;
  return verifyCookie(value, env.SESSION_SIGNING_KEY);
}

async function signCookie(payload, secret) {
  const encodedPayload = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const key = await hmacKey(secret, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(encodedPayload));
  return `${encodedPayload}.${base64UrlEncode(new Uint8Array(signature))}`;
}

async function verifyCookie(value, secret) {
  const parts = value.split(".");
  if (parts.length !== 2) return null;
  try {
    const key = await hmacKey(secret, ["verify"]);
    const valid = await crypto.subtle.verify("HMAC", key, base64UrlDecode(parts[1]), encoder.encode(parts[0]));
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[0])));
    if (!payload?.sub || !Number.isFinite(payload.exp) || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch (error) {
    return null;
  }
}

function hmacKey(secret, usages) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(String(secret)),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usages
  );
}

function base64UrlEncode(bytes) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) binary += String.fromCharCode(bytes[index]);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function base64UrlDecode(value) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

async function downloadFile(request, env, ctx, student, id) {
  const item = catalogById.get(id);
  if (!item) return json({ error: "File not found" }, 404, request, env);

  const requestId = await recordDownload(env, student, [item], "single_pdf");
  if (!requestId) return json({ error: "Download access could not be verified" }, 403, request, env);
  let object;
  try {
    object = await env.ESSAYS.get(item.key);
  } catch (error) {
    await finishDownload(env, requestId, "failed");
    return json({ error: "File is temporarily unavailable" }, 503, request, env);
  }
  if (!object || object.size !== item.bytes) {
    await finishDownload(env, requestId, "failed");
    return json({ error: "File is temporarily unavailable" }, 503, request, env);
  }

  const { readable, writable } = new FixedLengthStream(item.bytes);
  const pump = (async () => {
    try {
      await object.body.pipeTo(writable, { preventClose: true });
      const closingWriter = writable.getWriter();
      await closingWriter.close();
      if (!(await finishDownload(env, requestId, "completed"))) {
        console.error("Single-file completion audit failed", requestId);
      }
    } catch (error) {
      try {
        const abortingWriter = writable.getWriter();
        await abortingWriter.abort(error);
      } catch (abortError) {
        // The response stream may already be closed or aborted.
      }
      await finishDownload(env, requestId, "failed");
      throw error;
    }
  })();
  ctx.waitUntil(pump.catch(error => console.error("Single-file stream failed", error)));

  const headers = corsHeaders(request.headers.get("Origin") || "", env);
  headers.set("Content-Type", "application/pdf");
  headers.set("Content-Length", String(item.bytes));
  headers.set("Content-Disposition", contentDisposition(item.filename));
  headers.set("Cache-Control", "private, no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  if (object.httpEtag) headers.set("ETag", object.httpEtag);
  return new Response(readable, { status: 200, headers });
}

function contentDisposition(filename) {
  const ascii = String(filename)
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]+/g, "")
    .replace(/["\\\r\n]/g, "_")
    .slice(0, 160) || "download.pdf";
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

async function downloadZip(request, env, ctx, student, form) {
  const all = form.get("all") === "1";
  if (all && form.get("confirmAll") !== "1") return json({ error: "Download-all confirmation required" }, 400, request, env);

  let items;
  if (all) {
    items = [...CATALOG];
  } else {
    let ids;
    try {
      ids = JSON.parse(String(form.get("ids") || "[]"));
    } catch (error) {
      return json({ error: "Invalid file selection" }, 400, request, env);
    }
    if (!Array.isArray(ids) || ids.length < 1 || ids.length > CATALOG.length) {
      return json({ error: "Select between 1 and 238 files" }, 400, request, env);
    }
    const uniqueIds = [...new Set(ids.map(value => String(value)))];
    items = uniqueIds.map(id => catalogById.get(id));
    if (items.some(item => !item)) return json({ error: "Unknown file selection" }, 400, request, env);
    if (items.length <= 10) return json({ error: "ZIP downloads require more than 10 files" }, 400, request, env);
    if (items.length === CATALOG.length) {
      return json({ error: "Use the confirmed download-all request for the full catalog" }, 400, request, env);
    }
  }

  const zip = prepareZip(items);
  if (zip.totalLength >= 0xFFFFFFFF) return json({ error: "Archive is too large for ZIP32" }, 413, request, env);
  const requestId = await recordDownload(env, student, items, all ? "all_bundle" : "selected_zip");
  if (!requestId) return json({ error: "Download access could not be verified" }, 403, request, env);

  const requestedName = String(form.get("filename") || "Edmund-IELTS-Task-2-Model-Essays.zip");
  const zipName = requestedName.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100) || "model-essays.zip";
  const { readable, writable } = new FixedLengthStream(zip.totalLength);

  const pump = (async () => {
    try {
      for (const entry of zip.entries) {
        await writeStreamChunk(writable, makeLocalHeader(entry));
        const object = await env.ESSAYS.get(entry.key);
        if (!object || object.size !== entry.bytes) throw new Error(`R2 catalog mismatch: ${entry.id}`);
        await object.body.pipeTo(writable, { preventClose: true, preventAbort: true });
      }

      for (const entry of zip.entries) {
        await writeStreamChunk(writable, makeCentralHeader(entry));
      }
      await writeStreamChunk(writable, makeEndOfCentralDirectory(zip.entries.length, zip.centralSize, zip.centralOffset));
      const closingWriter = writable.getWriter();
      await closingWriter.close();
      if (!(await finishDownload(env, requestId, "completed"))) {
        console.error("ZIP completion audit failed", requestId);
      }
    } catch (error) {
      try {
        const abortingWriter = writable.getWriter();
        await abortingWriter.abort(error);
      } catch (abortError) {
        // The stream may already be aborted by the runtime.
      }
      await finishDownload(env, requestId, "failed");
      throw error;
    }
  })();
  ctx.waitUntil(pump.catch(error => console.error("ZIP stream failed", error)));

  const headers = corsHeaders(request.headers.get("Origin") || "", env);
  headers.set("Content-Type", "application/zip");
  headers.set("Content-Length", String(zip.totalLength));
  headers.set("Content-Disposition", contentDisposition(zipName));
  headers.set("Cache-Control", "private, no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(readable, { status: 200, headers });
}

async function recordDownload(env, student, items, eventType) {
  const endpoint = `${String(env.SUPABASE_URL || "").replace(/\/+$/, "")}/rest/v1/rpc/model_essay_record_download`;
  if (!endpoint.startsWith("https://") || !env.SUPABASE_ANON_KEY || !env.MODEL_ESSAY_SERVICE_SECRET) return null;
  const requestId = crypto.randomUUID();
  const payload = JSON.stringify({
    p_service_secret: env.MODEL_ESSAY_SERVICE_SECRET,
    p_request_id: requestId,
    p_student_id: student.sub,
    p_section: "ielts",
    p_task: "task-2",
    p_event_type: eventType,
    p_essay_ids: items.map(item => item.id),
    p_total_bytes: items.reduce((sum, item) => sum + item.bytes, 0)
  });

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "apikey": env.SUPABASE_ANON_KEY,
          "Content-Type": "application/json"
        },
        body: payload
      });
      if (response.ok) return (await response.json()) === requestId ? requestId : null;
      const message = await response.text();
      console.error("Download audit RPC failed", response.status, message);
      if (response.status < 500) return null;
    } catch (error) {
      console.error("Download audit request failed", error);
    }
  }
  return null;
}

async function finishDownload(env, requestId, status) {
  const endpoint = `${String(env.SUPABASE_URL || "").replace(/\/+$/, "")}/rest/v1/rpc/model_essay_finish_download`;
  if (!endpoint.startsWith("https://") || !env.SUPABASE_ANON_KEY || !env.MODEL_ESSAY_SERVICE_SECRET) return false;
  const payload = JSON.stringify({
    p_service_secret: env.MODEL_ESSAY_SERVICE_SECRET,
    p_request_id: requestId,
    p_status: status
  });

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "apikey": env.SUPABASE_ANON_KEY,
          "Content-Type": "application/json"
        },
        body: payload
      });
      if (response.ok) return (await response.json()) === true;
      const message = await response.text();
      console.error("Download completion RPC failed", response.status, message);
      if (response.status < 500) return false;
    } catch (error) {
      console.error("Download completion request failed", error);
    }
  }
  return false;
}

async function writeStreamChunk(writable, bytes) {
  const writer = writable.getWriter();
  try {
    await writer.ready;
    await writer.write(bytes);
  } finally {
    writer.releaseLock();
  }
}

function prepareZip(items) {
  let offset = 0;
  const entries = items.map(item => {
    const archiveName = sanitizeArchiveName(item.filename);
    const nameBytes = encoder.encode(archiveName);
    const entry = { ...item, archiveName, nameBytes, offset };
    offset += 30 + nameBytes.length + item.bytes;
    return entry;
  });
  const centralOffset = offset;
  const centralSize = entries.reduce((sum, entry) => sum + 46 + entry.nameBytes.length, 0);
  return { entries, centralOffset, centralSize, totalLength: centralOffset + centralSize + 22 };
}

function sanitizeArchiveName(filename) {
  return String(filename)
    .replaceAll("\\", "_")
    .replaceAll("/", "_")
    .replaceAll("\0", "")
    .replace(/^\.+/, "")
    .slice(0, 220) || "model-essay.pdf";
}

function dosDateTime(date) {
  const year = Math.max(1980, date.getUTCFullYear());
  const time = (date.getUTCHours() << 11) | (date.getUTCMinutes() << 5) | Math.floor(date.getUTCSeconds() / 2);
  const day = ((year - 1980) << 9) | ((date.getUTCMonth() + 1) << 5) | date.getUTCDate();
  return { time, day };
}

function makeLocalHeader(entry) {
  const { time, day } = dosDateTime(ZIP_BUILD_DATE);
  const bytes = new Uint8Array(30 + entry.nameBytes.length);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, 0x04034B50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, ZIP_UTF8_FLAG, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, time, true);
  view.setUint16(12, day, true);
  view.setUint32(14, entry.crc32 >>> 0, true);
  view.setUint32(18, entry.bytes, true);
  view.setUint32(22, entry.bytes, true);
  view.setUint16(26, entry.nameBytes.length, true);
  view.setUint16(28, 0, true);
  bytes.set(entry.nameBytes, 30);
  return bytes;
}

function makeCentralHeader(entry) {
  const { time, day } = dosDateTime(ZIP_BUILD_DATE);
  const bytes = new Uint8Array(46 + entry.nameBytes.length);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, 0x02014B50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint16(8, ZIP_UTF8_FLAG, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, time, true);
  view.setUint16(14, day, true);
  view.setUint32(16, entry.crc32 >>> 0, true);
  view.setUint32(20, entry.bytes, true);
  view.setUint32(24, entry.bytes, true);
  view.setUint16(28, entry.nameBytes.length, true);
  view.setUint16(30, 0, true);
  view.setUint16(32, 0, true);
  view.setUint16(34, 0, true);
  view.setUint16(36, 0, true);
  view.setUint32(38, 0, true);
  view.setUint32(42, entry.offset, true);
  bytes.set(entry.nameBytes, 46);
  return bytes;
}

function makeEndOfCentralDirectory(count, centralSize, centralOffset) {
  const bytes = new Uint8Array(22);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, 0x06054B50, true);
  view.setUint16(4, 0, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, count, true);
  view.setUint16(10, count, true);
  view.setUint32(12, centralSize, true);
  view.setUint32(16, centralOffset, true);
  view.setUint16(20, 0, true);
  return bytes;
}
