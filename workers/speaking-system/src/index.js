const BUCKET_NAME = "speaking-recordings";
const SERVICE_NAME = "edmund-speaking-system";
const SQL_MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const SQL_MAX_DURATION_MS = 30 * 60 * 1000;
const DEFAULT_MAX_UPLOAD_BYTES = 3 * 1024 * 1024;
const DEFAULT_MAX_DURATION_MS = 300 * 1000;
const MP3_ENCODER_PADDING_TOLERANCE_MS = 1000;
const DEFAULT_MAX_EXPORT_BATCH_BYTES = 64 * 1024 * 1024;
const DEFAULT_EXPORT_PAGE_SIZE = 10;
const DEFAULT_MAX_EXPORT_FILES_PER_BATCH = 40;
const FREE_PLAN_SUBREQUEST_SAFE_EXPORT_FILES = 40;
const MULTIPART_OVERHEAD_BYTES = 512 * 1024;
const DEFAULT_MAX_ID3_BYTES = 64 * 1024;
const ABSOLUTE_MAX_ID3_BYTES = 256 * 1024;
const MAX_ID3_FILE_RATIO = 0.25;
const MIN_MP3_FRAMES = 24;
const MIN_MP3_DURATION_MS = 1000;
const MAX_TRAILING_PADDING_BYTES = 1024;
const RECONCILE_MAX_ITEMS = 10;
const RECONCILE_UPLOAD_GRACE_MS = 10 * 60 * 1000;
const SPEAKING_ACCESS_STATE_KEY = "speaking-access-v1";
const SPEAKING_BOOKMARKS_STATE_KEY = "speaking-bookmarks-v1";
const MAX_BOOKMARKS = 200;
const MAX_ADMIN_STUDENTS = 2000;
const MAX_EXAM_ATTEMPT_PAGES = 100;
const MAX_EXAM_PROMPT_LENGTH = 800;
const MAX_EXAM_SOURCE_ID_LENGTH = 120;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EXERCISE_ID_RE = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,119}$/;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const SPEAKING_EXAMS = new Set(["dse", "ielts", "business", "interview", "civil-service"]);
const EXAM_MODE_PARTS = new Map([
  ["full", [1, 2, 3]],
  ["p1", [1]],
  ["p2", [2]],
  ["p3", [3]],
  ["p1-p2", [1, 2]],
  ["p1-p3", [1, 3]],
  ["p2-p3", [2, 3]]
]);
const SPEAKING_ACCESS_KEYS = new Set([
  "exam.dse",
  "exam.ielts",
  "exam.business",
  "exam.interview",
  "exam.civil-service",
  "bookmarks",
  ...[1, 2, 3].map(part => `ielts.part.${part}`),
  ...[1, 2, 3].flatMap(part => (
    Array.from({ length: 16 }, (_, index) => `ielts.part.${part}.book.${index + 1}`)
  ))
]);

const RECORDING_PUBLIC_FIELDS = [
  "id",
  "student_id",
  "exercise_id",
  "exercise_title",
  "exam",
  "part_number",
  "book_number",
  "original_filename",
  "size_bytes",
  "duration_ms",
  "client_duration_ms",
  "created_at"
].join(",");

const RECORDING_PRIVATE_FIELDS = [
  RECORDING_PUBLIC_FIELDS,
  "object_path",
  "sha256_hex",
  "crc32_value",
  "storage_state",
  "delete_requested_at",
  "last_storage_error",
  "updated_at"
].join(",");

const EXAM_ATTEMPT_PUBLIC_FIELDS = [
  "id",
  "attempt_number",
  "mode_id",
  "natural_exchange",
  "manifest_version",
  "question_manifest",
  "nervousness_rating",
  "rated_at",
  "started_at",
  "completed_at",
  "updated_at"
].join(",");

const CRC32_TABLES = buildCrc32Tables();

export default {
  async fetch(request, env, ctx) {
    try {
      return await route(request, env, ctx);
    } catch (error) {
      if (error instanceof HttpError) {
        return json({ error: error.message, code: error.code }, error.status, request, env);
      }
      console.error("Speaking Worker request failed", safeErrorMessage(error));
      return json({ error: "Speaking service error", code: "SERVICE_ERROR" }, 500, request, env);
    }
  }
};

async function route(request, env, ctx) {
  const url = new URL(request.url);
  const origin = request.headers.get("Origin") || "";

  if (request.method === "OPTIONS") {
    if (!isAllowedOrigin(origin, env)) {
      return json({ error: "Origin not allowed", code: "ORIGIN_NOT_ALLOWED" }, 403, request, env);
    }
    return new Response(null, { status: 204, headers: corsHeaders(origin, env) });
  }

  if (url.pathname === "/v1/health" && request.method === "GET") {
    const configured = isConfigured(env);
    return json(
      {
        ok: configured,
        service: SERVICE_NAME,
        storage: "supabase-private",
        maxUploadBytes: maxUploadBytes(env),
        maxDurationMs: maxDurationMs(env),
        maxExportFilesPerBatch: maxExportFiles(env),
        defaultExportPageSize: defaultExportPageSize(env),
        rateLimiters: {
          adminLogin: rateLimiterConfigured(env.ADMIN_LOGIN_RATE_LIMITER),
          upload: rateLimiterConfigured(env.UPLOAD_RATE_LIMITER)
        }
      },
      configured ? 200 : 503,
      request,
      env
    );
  }

  if (!isAllowedOrigin(origin, env)) {
    return json({ error: "Origin not allowed", code: "ORIGIN_NOT_ALLOWED" }, 403, request, env);
  }
  assertConfigured(env);

  if (url.pathname === "/v1/admin/login" && request.method === "POST") {
    return adminLogin(request, env);
  }
  if (url.pathname === "/v1/admin/me" && request.method === "GET") {
    return adminMe(request, env);
  }
  if (url.pathname === "/v1/admin/logout" && request.method === "POST") {
    return adminLogout(request, env);
  }
  if (url.pathname === "/v1/student/me" && request.method === "GET") {
    return studentMe(request, env);
  }
  if (url.pathname === "/v1/bookmarks" && request.method === "GET") {
    return getBookmarks(request, env);
  }
  if (url.pathname === "/v1/bookmarks" && request.method === "PUT") {
    return putBookmarks(request, env);
  }
  if (url.pathname === "/v1/exam-attempts/latest" && request.method === "GET") {
    return getLatestExamAttempt(request, env);
  }
  if (url.pathname === "/v1/exam-attempts" && request.method === "GET") {
    return listExamAttempts(request, env);
  }
  const examAttemptMatch = url.pathname.match(/^\/v1\/exam-attempts\/([0-9a-f-]{36})$/i);
  if (examAttemptMatch && request.method === "PUT") {
    return putExamAttempt(request, env, examAttemptMatch[1]);
  }
  if (examAttemptMatch && request.method === "PATCH") {
    return completeExamAttempt(request, env, examAttemptMatch[1]);
  }

  if (url.pathname === "/v1/admin/students" && request.method === "GET") {
    return listAdminStudents(request, env);
  }
  const adminStudentAccessMatch = url.pathname.match(/^\/v1\/admin\/students\/([0-9a-f-]{36})\/access$/i);
  if (adminStudentAccessMatch && request.method === "PUT") {
    return putAdminStudentAccess(request, env, adminStudentAccessMatch[1]);
  }

  if (url.pathname === "/v1/admin/recordings" && request.method === "GET") {
    return listRecordings(request, env, { forceAdmin: true });
  }
  if (url.pathname === "/v1/admin/reconcile" && request.method === "POST") {
    return reconcileRecordings(request, env);
  }

  const adminRecordingMatch = url.pathname.match(/^\/v1\/admin\/recordings\/([0-9a-f-]{36})$/i);
  if (adminRecordingMatch && request.method === "DELETE") {
    return deleteRecording(request, env, adminRecordingMatch[1], { forceAdmin: true });
  }

  if (
    (url.pathname === "/v1/recordings/export" || url.pathname === "/v1/recordings/export.zip")
    && request.method === "GET"
  ) {
    return exportRecordings(request, env, ctx);
  }

  if (url.pathname === "/v1/recordings" && request.method === "POST") {
    return uploadRecording(request, env);
  }
  if (url.pathname === "/v1/recordings" && request.method === "GET") {
    return listRecordings(request, env);
  }

  const recordingMatch = url.pathname.match(/^\/v1\/recordings\/([0-9a-f-]{36})$/i);
  if (recordingMatch && request.method === "GET") {
    return downloadRecording(request, env, recordingMatch[1]);
  }
  if (recordingMatch && request.method === "DELETE") {
    return deleteRecording(request, env, recordingMatch[1]);
  }

  return json({ error: "Not found", code: "NOT_FOUND" }, 404, request, env);
}

class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
  }
}

function safeErrorMessage(error) {
  if (!error || typeof error !== "object") return "Unknown error";
  const name = String(error.name || "Error").slice(0, 80);
  const message = String(error.message || "").slice(0, 300);
  return `${name}: ${message}`;
}

function configuredOrigins(env) {
  const values = [env.ALLOWED_ORIGINS, env.ALLOWED_ORIGIN]
    .filter(value => typeof value === "string")
    .flatMap(value => value.split(","))
    .map(value => value.trim())
    .filter(Boolean);
  const origins = new Set();
  for (const value of values) {
    try {
      const parsed = new URL(value);
      if (
        parsed.protocol === "https:"
        && parsed.origin === value.replace(/\/$/, "")
        && parsed.username === ""
        && parsed.password === ""
      ) {
        origins.add(parsed.origin);
      }
    } catch (error) {
      // Invalid configuration is ignored and causes health/config checks to fail.
    }
  }
  return origins;
}

function isAllowedOrigin(origin, env) {
  if (!origin || origin === "null") return false;
  return configuredOrigins(env).has(origin);
}

function corsHeaders(origin, env) {
  const headers = securityHeaders();
  headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
  headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  headers.set(
    "Access-Control-Expose-Headers",
    [
      "Accept-Ranges",
      "Content-Disposition",
      "Content-Length",
      "Content-Range",
      "ETag",
      "X-Export-File-Count",
      "X-Export-Has-More",
      "X-Export-Page",
      "X-Export-Page-Size",
      "X-Export-Total-Files",
      "X-Export-Total-Pages"
    ].join(", ")
  );
  headers.set("Vary", "Origin");
  if (isAllowedOrigin(origin, env)) headers.set("Access-Control-Allow-Origin", origin);
  return headers;
}

function securityHeaders() {
  return new Headers({
    "Cache-Control": "no-store",
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
    "Cross-Origin-Resource-Policy": "cross-origin",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY"
  });
}

function json(value, status, request, env) {
  const headers = corsHeaders(request.headers.get("Origin") || "", env);
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(value), { status, headers });
}

function emptyResponse(status, request, env) {
  return new Response(null, {
    status,
    headers: corsHeaders(request.headers.get("Origin") || "", env)
  });
}

function isConfigured(env) {
  try {
    supabaseOrigin(env);
    if (supabaseServerKey(env).length < 32) return false;
    if (configuredOrigins(env).size < 1) return false;
    if (!rateLimiterConfigured(env.ADMIN_LOGIN_RATE_LIMITER)) return false;
    if (!rateLimiterConfigured(env.UPLOAD_RATE_LIMITER)) return false;
    return true;
  } catch (error) {
    return false;
  }
}

function rateLimiterConfigured(binding) {
  return Boolean(binding && typeof binding.limit === "function");
}

function supabaseServerKey(env) {
  return String(env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || "");
}

function assertConfigured(env) {
  if (!isConfigured(env)) {
    throw new HttpError(503, "NOT_CONFIGURED", "Speaking service is not configured");
  }
}

function supabaseOrigin(env) {
  const value = String(env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
  const parsed = new URL(value);
  if (
    parsed.protocol !== "https:"
    || parsed.username
    || parsed.password
    || parsed.search
    || parsed.hash
  ) {
    throw new Error("Invalid Supabase URL configuration");
  }
  return parsed.origin;
}

function configuredInteger(value, fallback, minimum, maximum) {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < minimum || parsed > maximum) return fallback;
  return parsed;
}

function maxUploadBytes(env) {
  return configuredInteger(env.MAX_UPLOAD_BYTES, DEFAULT_MAX_UPLOAD_BYTES, 512, SQL_MAX_UPLOAD_BYTES);
}

function maxDurationMs(env) {
  return configuredInteger(
    env.MAX_DURATION_MS,
    DEFAULT_MAX_DURATION_MS,
    1000,
    SQL_MAX_DURATION_MS - MP3_ENCODER_PADDING_TOLERANCE_MS
  );
}

function maxExportBytes(env) {
  return configuredInteger(
    env.MAX_EXPORT_BATCH_BYTES || env.MAX_EXPORT_BYTES,
    DEFAULT_MAX_EXPORT_BATCH_BYTES,
    SQL_MAX_UPLOAD_BYTES,
    128 * 1024 * 1024
  );
}

function maxExportFiles(env) {
  return configuredInteger(
    env.MAX_EXPORT_FILES_PER_BATCH || env.MAX_EXPORT_FILES,
    DEFAULT_MAX_EXPORT_FILES_PER_BATCH,
    1,
    FREE_PLAN_SUBREQUEST_SAFE_EXPORT_FILES
  );
}

function defaultExportPageSize(env) {
  return Math.min(
    maxExportFiles(env),
    configuredInteger(env.DEFAULT_EXPORT_PAGE_SIZE, DEFAULT_EXPORT_PAGE_SIZE, 1, FREE_PLAN_SUBREQUEST_SAFE_EXPORT_FILES)
  );
}

function maxId3Bytes(env) {
  return configuredInteger(env.MAX_ID3_BYTES, DEFAULT_MAX_ID3_BYTES, 0, ABSOLUTE_MAX_ID3_BYTES);
}

async function readLimitedBytes(request, maximumBytes) {
  const declared = request.headers.get("Content-Length");
  if (declared !== null) {
    const parsed = Number(declared);
    if (!Number.isSafeInteger(parsed) || parsed < 0) {
      throw new HttpError(400, "INVALID_CONTENT_LENGTH", "Invalid Content-Length header");
    }
    if (parsed > maximumBytes) {
      throw new HttpError(413, "BODY_TOO_LARGE", "Request body is too large");
    }
  }
  if (!request.body) return new Uint8Array();

  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maximumBytes) {
        await reader.cancel("Request body is too large");
        throw new HttpError(413, "BODY_TOO_LARGE", "Request body is too large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

async function readLimitedJson(request, maximumBytes) {
  const bytes = await readLimitedBytes(request, maximumBytes);
  try {
    return JSON.parse(decoder.decode(bytes));
  } catch (error) {
    throw new HttpError(400, "INVALID_JSON", "Invalid JSON request");
  }
}

function bearerToken(request) {
  const authorization = request.headers.get("Authorization") || "";
  const match = authorization.match(/^Bearer\s+([^\s]+)$/i);
  if (!match || !UUID_RE.test(match[1])) return null;
  return match[1].toLowerCase();
}

async function supabaseFetch(env, path, options = {}, timeoutMs = 20000) {
  const key = supabaseServerKey(env);
  const headers = new Headers(options.headers || {});
  headers.set("apikey", key);
  if (key.startsWith("sb_secret_")) {
    // Opaque secret keys belong only in `apikey`; they are not JWTs. Supabase's
    // gateway maps a valid secret key to the service_role database role.
    headers.delete("Authorization");
  } else {
    // Backward-compatible path for a legacy JWT-based service_role key.
    headers.set("Authorization", `Bearer ${key}`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort("Supabase request timed out"), timeoutMs);
  try {
    return await fetch(`${supabaseOrigin(env)}${path}`, {
      ...options,
      headers,
      // Cloudflare Workers supports "follow" and "manual", not the browser-only
      // "error" mode. Manual keeps credentials on the configured Supabase
      // origin and lets every caller reject a 3xx as a non-success response.
      redirect: "manual",
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function rpc(env, functionName, payload) {
  let response;
  try {
    response = await supabaseFetch(
      env,
      `/rest/v1/rpc/${encodeURIComponent(functionName)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );
  } catch (error) {
    console.error("Supabase RPC transport failed", functionName, safeErrorMessage(error));
    throw new HttpError(502, "SUPABASE_UNAVAILABLE", "Speaking data service is temporarily unavailable");
  }
  if (!response.ok) {
    console.error("Supabase RPC rejected", functionName, response.status);
    await discardResponse(response);
    throw new HttpError(502, "SUPABASE_UNAVAILABLE", "Speaking data service is temporarily unavailable");
  }
  try {
    return await response.json();
  } catch (error) {
    throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Speaking data service returned an invalid response");
  }
}

async function discardResponse(response) {
  try {
    await response.arrayBuffer();
  } catch (error) {
    // Nothing else can safely be done with a failed upstream response.
  }
}

async function parseUpstreamArray(response, resourceLabel) {
  let value;
  try {
    value = await response.json();
  } catch (error) {
    throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", `${resourceLabel} returned an invalid response`);
  }
  if (!Array.isArray(value)) {
    throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", `${resourceLabel} returned an invalid response`);
  }
  return value;
}

async function authenticateStudent(request, env) {
  const token = bearerToken(request);
  if (!token) return null;
  const rows = await rpc(env, "speaking_student_profile", { p_token: token });
  const row = Array.isArray(rows) && rows.length === 1 ? rows[0] : null;
  if (!row || !UUID_RE.test(String(row.id || ""))) return null;
  return {
    kind: "student",
    id: String(row.id).toLowerCase(),
    name: String(row.name || ""),
    expiresAt: String(row.session_expires_at || "")
  };
}

async function authenticateAdmin(request, env) {
  const token = bearerToken(request);
  if (!token) return null;
  const rows = await rpc(env, "speaking_admin_me", { p_admin_token: token });
  const row = Array.isArray(rows) && rows.length === 1 ? rows[0] : null;
  if (!row || !UUID_RE.test(String(row.id || ""))) return null;
  return {
    kind: "admin",
    id: String(row.id).toLowerCase(),
    name: String(row.name || ""),
    expiresAt: String(row.expires_at || ""),
    token
  };
}

async function authenticateEither(request, env) {
  const student = await authenticateStudent(request, env);
  if (student) return student;
  return authenticateAdmin(request, env);
}

async function adminLogin(request, env) {
  if (!env.ADMIN_LOGIN_RATE_LIMITER || typeof env.ADMIN_LOGIN_RATE_LIMITER.limit !== "function") {
    throw new HttpError(503, "RATE_LIMIT_NOT_CONFIGURED", "Admin login is not configured");
  }

  const clientIp = String(request.headers.get("CF-Connecting-IP") || "missing-client-ip").slice(0, 80);
  let rateLimit;
  try {
    rateLimit = await env.ADMIN_LOGIN_RATE_LIMITER.limit({ key: `speaking-admin:${clientIp}` });
  } catch (error) {
    throw new HttpError(503, "RATE_LIMIT_UNAVAILABLE", "Admin login is temporarily unavailable");
  }
  if (!rateLimit.success) {
    throw new HttpError(429, "TOO_MANY_ATTEMPTS", "Too many login attempts");
  }

  const payload = await readLimitedJson(request, 4096);
  const username = String(payload?.username ?? payload?.name ?? "").trim();
  const password = String(payload?.password ?? "");
  if (
    !username
    || username.length > 100
    || /[\u0000-\u001f\u007f]/.test(username)
    || !password
    || password.length > 200
  ) {
    throw new HttpError(400, "INVALID_LOGIN_REQUEST", "Invalid login request");
  }

  const rows = await rpc(env, "speaking_admin_login", {
    p_name: username,
    p_password: password
  });
  const row = Array.isArray(rows) && rows.length === 1 ? rows[0] : null;
  if (!row || !UUID_RE.test(String(row.admin_token || ""))) {
    throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid username or password");
  }

  return json(
    {
      admin: {
        adminToken: String(row.admin_token),
        name: String(row.name || ""),
        expiresAt: String(row.expires_at || "")
      }
    },
    200,
    request,
    env
  );
}

async function adminMe(request, env) {
  const admin = await authenticateAdmin(request, env);
  if (!admin) throw new HttpError(401, "ADMIN_AUTH_REQUIRED", "Administrator authentication required");
  return json(
    { admin: { id: admin.id, name: admin.name, expiresAt: admin.expiresAt } },
    200,
    request,
    env
  );
}

async function adminLogout(request, env) {
  const token = bearerToken(request);
  if (!token) throw new HttpError(401, "ADMIN_AUTH_REQUIRED", "Administrator authentication required");
  await rpc(env, "speaking_admin_logout", { p_admin_token: token });
  return emptyResponse(204, request, env);
}

async function studentMe(request, env) {
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  const access = await studentSpeakingAccess(env, student.id);
  return json(
    {
      student: { id: student.id, name: student.name, expiresAt: student.expiresAt },
      access
    },
    200,
    request,
    env
  );
}

function isJsonObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function hasExactKeys(value, expected) {
  if (!isJsonObject(value)) return false;
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  return actual.length === wanted.length && actual.every((key, index) => key === wanted[index]);
}

function normalizeSpeakingAccess(value, strict = false) {
  if (!isJsonObject(value)) {
    if (strict) throw new HttpError(400, "INVALID_ACCESS", "access must be an object");
    return {};
  }

  const normalized = {};
  for (const [key, allowed] of Object.entries(value)) {
    if (!SPEAKING_ACCESS_KEYS.has(key) || typeof allowed !== "boolean") {
      if (strict) {
        throw new HttpError(400, "INVALID_ACCESS", "access contains an unknown key or non-boolean value");
      }
      continue;
    }
    normalized[key] = allowed;
  }
  return normalized;
}

function normalizeBookmark(bookmark, strict = false) {
  const invalid = () => {
    if (strict) throw new HttpError(400, "INVALID_BOOKMARKS", "bookmarks contains an invalid route");
    return null;
  };
  if (!isJsonObject(bookmark) || typeof bookmark.kind !== "string") return invalid();

  if (bookmark.kind === "exam") {
    if (!hasExactKeys(bookmark, ["kind", "exam"]) || !SPEAKING_EXAMS.has(bookmark.exam)) return invalid();
    return { kind: "exam", exam: bookmark.exam };
  }

  if (bookmark.kind === "part") {
    if (
      !hasExactKeys(bookmark, ["kind", "exam", "part"])
      || bookmark.exam !== "ielts"
      || !Number.isInteger(bookmark.part)
      || bookmark.part < 1
      || bookmark.part > 3
    ) return invalid();
    return { kind: "part", exam: "ielts", part: bookmark.part };
  }

  if (bookmark.kind === "book") {
    if (
      !hasExactKeys(bookmark, ["kind", "exam", "part", "book"])
      || bookmark.exam !== "ielts"
      || !Number.isInteger(bookmark.part)
      || bookmark.part < 1
      || bookmark.part > 3
      || !Number.isInteger(bookmark.book)
      || bookmark.book < 1
      || bookmark.book > (bookmark.part === 1 ? 14 : 16)
    ) return invalid();
    return { kind: "book", exam: "ielts", part: bookmark.part, book: bookmark.book };
  }

  if (bookmark.kind === "exercise") {
    if (
      !hasExactKeys(bookmark, ["kind", "exam", "part", "book", "exerciseId"])
      || bookmark.exam !== "ielts"
      || !Number.isInteger(bookmark.part)
      || bookmark.part < 1
      || bookmark.part > 3
      || !Number.isInteger(bookmark.book)
      || bookmark.book < 1
      || bookmark.book > (bookmark.part === 1 ? 14 : 16)
      || typeof bookmark.exerciseId !== "string"
      || !EXERCISE_ID_RE.test(bookmark.exerciseId)
    ) return invalid();
    return {
      kind: "exercise",
      exam: "ielts",
      part: bookmark.part,
      book: bookmark.book,
      exerciseId: bookmark.exerciseId
    };
  }

  if (bookmark.kind === "question") {
    if (
      !hasExactKeys(bookmark, ["kind", "exam", "part", "book", "exerciseId", "questionNumber"])
      || bookmark.exam !== "ielts"
      || !Number.isInteger(bookmark.part)
      || bookmark.part < 1
      || bookmark.part > 3
      || !Number.isInteger(bookmark.book)
      || bookmark.book < 1
      || bookmark.book > (bookmark.part === 1 ? 14 : 16)
      || typeof bookmark.exerciseId !== "string"
      || !EXERCISE_ID_RE.test(bookmark.exerciseId)
      || !Number.isInteger(bookmark.questionNumber)
      || bookmark.questionNumber < 1
      || bookmark.questionNumber > 99
      || (bookmark.part !== 1 && bookmark.questionNumber !== 1)
    ) return invalid();
    return {
      kind: "question",
      exam: "ielts",
      part: bookmark.part,
      book: bookmark.book,
      exerciseId: bookmark.exerciseId,
      questionNumber: bookmark.questionNumber
    };
  }

  return invalid();
}

function normalizeBookmarks(value, strict = false) {
  if (!Array.isArray(value)) {
    if (strict) throw new HttpError(400, "INVALID_BOOKMARKS", "bookmarks must be an array");
    return [];
  }
  if (strict && value.length > MAX_BOOKMARKS) {
    throw new HttpError(400, "TOO_MANY_BOOKMARKS", `A student may save at most ${MAX_BOOKMARKS} bookmarks`);
  }

  const normalized = [];
  const seen = new Set();
  for (const rawBookmark of value.slice(0, MAX_BOOKMARKS)) {
    const bookmark = normalizeBookmark(rawBookmark, strict);
    if (!bookmark) continue;
    const stableKey = JSON.stringify(bookmark);
    if (seen.has(stableKey)) continue;
    seen.add(stableKey);
    normalized.push(bookmark);
  }
  return normalized;
}

async function getStudentState(env, studentId, key) {
  const params = new URLSearchParams({
    select: "value,updated_at",
    student_id: `eq.${studentId}`,
    key: `eq.${key}`,
    limit: "1"
  });
  let response;
  try {
    response = await supabaseFetch(env, `/rest/v1/flashcard_student_state?${params}`, { method: "GET" });
  } catch (error) {
    throw new HttpError(502, "STATE_UNAVAILABLE", "Student settings are temporarily unavailable");
  }
  if (!response.ok) {
    await discardResponse(response);
    throw new HttpError(502, "STATE_UNAVAILABLE", "Student settings are temporarily unavailable");
  }
  let rows;
  try {
    rows = await response.json();
  } catch (error) {
    throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Student settings returned an invalid response");
  }
  if (!Array.isArray(rows) || rows.length > 1) {
    throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Student settings returned an invalid response");
  }
  return rows[0] || null;
}

async function upsertStudentState(env, studentId, key, value) {
  const params = new URLSearchParams({ on_conflict: "student_id,key" });
  let response;
  try {
    response = await supabaseFetch(
      env,
      `/rest/v1/flashcard_student_state?${params}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=representation"
        },
        body: JSON.stringify({ student_id: studentId, key, value })
      }
    );
  } catch (error) {
    throw new HttpError(502, "STATE_UNAVAILABLE", "Student settings are temporarily unavailable");
  }
  if (!response.ok) {
    await discardResponse(response);
    throw new HttpError(502, "STATE_SAVE_FAILED", "Student settings could not be saved");
  }
  let rows;
  try {
    rows = await response.json();
  } catch (error) {
    throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Student settings returned an invalid response");
  }
  if (!Array.isArray(rows) || rows.length !== 1) {
    throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Student settings returned an invalid response");
  }
  return rows[0];
}

async function studentSpeakingAccess(env, studentId) {
  const row = await getStudentState(env, studentId, SPEAKING_ACCESS_STATE_KEY);
  return normalizeSpeakingAccess(row?.value);
}

async function getBookmarks(request, env) {
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  const access = await studentSpeakingAccess(env, student.id);
  if (access.bookmarks === false) {
    throw new HttpError(403, "SECTION_ACCESS_DENIED", "Your account does not have access to bookmarks");
  }
  const row = await getStudentState(env, student.id, SPEAKING_BOOKMARKS_STATE_KEY);
  return json({ bookmarks: normalizeBookmarks(row?.value) }, 200, request, env);
}

async function putBookmarks(request, env) {
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  const access = await studentSpeakingAccess(env, student.id);
  if (access.bookmarks === false) {
    throw new HttpError(403, "SECTION_ACCESS_DENIED", "Your account does not have access to bookmarks");
  }
  const payload = await readLimitedJson(request, 32768);
  if (!hasExactKeys(payload, ["bookmarks"])) {
    throw new HttpError(400, "INVALID_BOOKMARKS", "Request body must contain only bookmarks");
  }
  const bookmarks = normalizeBookmarks(payload.bookmarks, true);
  await upsertStudentState(env, student.id, SPEAKING_BOOKMARKS_STATE_KEY, bookmarks);
  return json({ bookmarks }, 200, request, env);
}

function expectedExamQuestionCount(modeId) {
  const parts = EXAM_MODE_PARTS.get(String(modeId || ""));
  return parts?.reduce((total, part) => total + (part === 1 ? 12 : part === 2 ? 1 : 6), 0) || 0;
}

function expectedExamPartForOrder(modeId, order) {
  const parts = EXAM_MODE_PARTS.get(String(modeId || ""));
  const wanted = Number(order);
  if (!parts || !Number.isInteger(wanted) || wanted < 1) return null;
  let cursor = 0;
  for (const part of parts) {
    const count = part === 1 ? 12 : part === 2 ? 1 : 6;
    if (wanted <= cursor + count) return part;
    cursor += count;
  }
  return null;
}

function normalizeExamContentKey(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLocaleLowerCase("en")
    .replace(/[’]/g, "'")
    .replace(/[^\p{L}\p{N}']+/gu, " ")
    .trim();
}

function examSourceKey(part, sourceId, questionNumber) {
  return Number(part) === 1
    ? `p1:${sourceId}:q${questionNumber}`
    : `p${part}:${sourceId}`;
}

function normalizeExamQuestionManifest(modeId, value) {
  const expected = expectedExamQuestionCount(modeId);
  if (!expected || !Array.isArray(value) || value.length !== expected) {
    throw new HttpError(400, "INVALID_EXAM_MANIFEST", "questions does not match the selected exam mode");
  }
  const sourceKeys = new Set();
  const contentKeys = new Set();
  return value.map((raw, index) => {
    if (!hasExactKeys(raw, [
      "order",
      "part",
      "sourceId",
      "sourceBook",
      "sourceIndex",
      "questionNumber",
      "promptEn",
      "promptZh"
    ])) {
      throw new HttpError(400, "INVALID_EXAM_MANIFEST", "questions contains an invalid item shape");
    }
    if (
      !Number.isInteger(raw.order)
      || !Number.isInteger(raw.part)
      || typeof raw.sourceId !== "string"
      || !Number.isInteger(raw.sourceBook)
      || !Number.isInteger(raw.sourceIndex)
      || (raw.questionNumber !== null && !Number.isInteger(raw.questionNumber))
      || typeof raw.promptEn !== "string"
      || typeof raw.promptZh !== "string"
    ) {
      throw new HttpError(400, "INVALID_EXAM_MANIFEST", "questions contains invalid field types");
    }
    const order = raw.order;
    const part = raw.part;
    const sourceId = raw.sourceId.trim();
    const sourceBook = raw.sourceBook;
    const sourceIndex = raw.sourceIndex;
    const questionNumber = raw.questionNumber;
    const promptEn = raw.promptEn.normalize("NFKC").trim();
    const promptZh = raw.promptZh.normalize("NFKC").trim();
    if (
      order !== index + 1
      || expectedExamPartForOrder(modeId, order) !== part
      || !EXERCISE_ID_RE.test(sourceId)
      || sourceId.length > MAX_EXAM_SOURCE_ID_LENGTH
      || !Number.isInteger(sourceBook)
      || sourceBook < 1
      || sourceBook > (part === 1 ? 14 : 16)
      || !Number.isInteger(sourceIndex)
      || sourceIndex < 1
      || sourceIndex > 9999
      || (part === 1 && (!Number.isInteger(questionNumber) || questionNumber < 1 || questionNumber > 99))
      || (part !== 1 && questionNumber !== null)
      || !promptEn
      || !promptZh
      || promptEn.length > MAX_EXAM_PROMPT_LENGTH
      || promptZh.length > MAX_EXAM_PROMPT_LENGTH
      || /[\u0000-\u001f\u007f]/.test(`${promptEn}${promptZh}`)
    ) {
      throw new HttpError(400, "INVALID_EXAM_MANIFEST", "questions contains invalid source or prompt data");
    }
    const sourceKey = examSourceKey(part, sourceId, questionNumber);
    const contentKey = normalizeExamContentKey(promptEn || promptZh);
    if (!contentKey || sourceKeys.has(sourceKey) || contentKeys.has(contentKey)) {
      throw new HttpError(400, "INVALID_EXAM_MANIFEST", "questions contains a duplicate or empty question");
    }
    sourceKeys.add(sourceKey);
    contentKeys.add(contentKey);
    return {
      order,
      part,
      sourceKey,
      contentKey,
      sourceId,
      sourceBook,
      sourceIndex,
      questionNumber,
      promptEn,
      promptZh
    };
  });
}

async function enforceExamManifestAccess(env, studentId, manifest) {
  const access = await studentSpeakingAccess(env, studentId);
  const required = new Set(["exam.ielts"]);
  for (const question of manifest) {
    required.add(`ielts.part.${question.part}`);
    required.add(`ielts.part.${question.part}.book.${question.sourceBook}`);
  }
  if ([...required].some(key => access[key] === false)) {
    throw new HttpError(403, "SECTION_ACCESS_DENIED", "Your account does not have access to every selected exam question");
  }
}

function publicExamAttempt(row) {
  if (!row || typeof row !== "object") return null;
  return {
    id: String(row.id || "").toLowerCase(),
    attemptNumber: Number(row.attempt_number || 0),
    modeId: String(row.mode_id || ""),
    naturalExchange: row.natural_exchange === true,
    manifestVersion: Number(row.manifest_version || 1),
    questions: Array.isArray(row.question_manifest) ? row.question_manifest : [],
    nervousness: row.nervousness_rating === null || row.nervousness_rating === undefined
      ? null
      : Number(row.nervousness_rating),
    ratedAt: row.rated_at ? String(row.rated_at) : null,
    startedAt: String(row.started_at || ""),
    completedAt: row.completed_at ? String(row.completed_at) : null,
    updatedAt: String(row.updated_at || "")
  };
}

async function queryLatestExamAttempt(env, studentId) {
  const params = new URLSearchParams({
    select: EXAM_ATTEMPT_PUBLIC_FIELDS,
    student_id: `eq.${studentId}`,
    order: "attempt_number.desc",
    limit: "1"
  });
  let response;
  try {
    response = await supabaseFetch(env, `/rest/v1/speaking_exam_attempts?${params}`, { method: "GET" });
  } catch (error) {
    throw new HttpError(502, "EXAM_ATTEMPTS_UNAVAILABLE", "Exam attempts are temporarily unavailable");
  }
  if (!response.ok) {
    await discardResponse(response);
    throw new HttpError(502, "EXAM_ATTEMPTS_UNAVAILABLE", "Exam attempts are temporarily unavailable");
  }
  const rows = await parseUpstreamArray(response, "Exam attempts");
  if (!Array.isArray(rows) || rows.length > 1) {
    throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Exam attempts returned an invalid response");
  }
  return rows[0] || null;
}

async function getLatestExamAttempt(request, env) {
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  const row = await queryLatestExamAttempt(env, student.id);
  return json({ attempt: publicExamAttempt(row) }, 200, request, env);
}

async function putExamAttempt(request, env, attemptId) {
  if (!UUID_RE.test(attemptId)) throw new HttpError(404, "EXAM_ATTEMPT_NOT_FOUND", "Exam attempt not found");
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  await enforceExamStartRateLimit(env, student.id);
  const payload = await readLimitedJson(request, 65536);
  if (!hasExactKeys(payload, ["modeId", "naturalExchange", "questions"])) {
    throw new HttpError(400, "INVALID_EXAM_ATTEMPT", "Request body must contain modeId, naturalExchange and questions");
  }
  const modeId = String(payload.modeId || "");
  if (!EXAM_MODE_PARTS.has(modeId) || typeof payload.naturalExchange !== "boolean") {
    throw new HttpError(400, "INVALID_EXAM_ATTEMPT", "Invalid exam mode or naturalExchange value");
  }
  const manifest = normalizeExamQuestionManifest(modeId, payload.questions);
  await enforceExamManifestAccess(env, student.id, manifest);
  const value = rpcObject(await rpc(env, "speaking_create_exam_attempt", {
    p_id: attemptId.toLowerCase(),
    p_student_id: student.id,
    p_mode_id: modeId,
    p_natural_exchange: payload.naturalExchange,
    p_question_manifest: manifest
  }));
  if (!value) throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Exam attempt service returned an invalid response");
  if (value.ok !== true) {
    if (value.code === "STUDENT_NOT_FOUND") throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
    if (value.code === "EXAM_COOLDOWN_CONFLICT") {
      throw new HttpError(409, value.code, "The latest attempt changed; rebuild without its questions");
    }
    throw new HttpError(409, "EXAM_ATTEMPT_CONFLICT", "This exam attempt identifier is already in use");
  }
  const response = json({ attempt: publicExamAttempt(value.attempt), idempotent: value.idempotent === true }, value.idempotent ? 200 : 201, request, env);
  response.headers.set("Location", new URL(`/v1/exam-attempts/${attemptId.toLowerCase()}`, request.url).toString());
  return response;
}

function expectedExamExerciseIds(attempt) {
  const modeId = String(attempt?.mode_id || "");
  const id = String(attempt?.id || "").toLowerCase();
  const parts = EXAM_MODE_PARTS.get(modeId) || [];
  const ids = [];
  if (attempt?.natural_exchange === true && parts.length) ids.push(`exam:${modeId}:${id}:p${parts[0]}:intro`);
  const count = expectedExamQuestionCount(modeId);
  for (let order = 1; order <= count; order += 1) {
    ids.push(`exam:${modeId}:${id}:p${expectedExamPartForOrder(modeId, order)}:q${String(order).padStart(2, "0")}`);
  }
  return ids;
}

async function completeExamAttempt(request, env, attemptId) {
  if (!UUID_RE.test(attemptId)) throw new HttpError(404, "EXAM_ATTEMPT_NOT_FOUND", "Exam attempt not found");
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  const payload = await readLimitedJson(request, 2048);
  if (!hasExactKeys(payload, ["nervousness"]) || !Number.isInteger(payload.nervousness) || payload.nervousness < 1 || payload.nervousness > 7) {
    throw new HttpError(400, "INVALID_NERVOUSNESS_RATING", "nervousness must be an integer from 1 to 7");
  }
  const value = rpcObject(await rpc(env, "speaking_complete_exam_attempt", {
    p_id: attemptId.toLowerCase(),
    p_student_id: student.id,
    p_nervousness_rating: payload.nervousness
  }));
  if (!value || value.ok !== true || !value.attempt) {
    if (value?.code === "EXAM_ATTEMPT_NOT_FOUND") throw new HttpError(404, value.code, "Exam attempt not found");
    if (value?.code === "EXAM_RECORDINGS_INCOMPLETE") {
      throw new HttpError(409, value.code, "All exam recordings must be saved before self-evaluation");
    }
    if (value?.code === "EXAM_ATTEMPT_ALREADY_COMPLETED") {
      throw new HttpError(409, value.code, "This exam attempt already has a different self-evaluation");
    }
    throw new HttpError(502, "EXAM_ATTEMPT_SAVE_FAILED", "The self-evaluation could not be saved");
  }
  return json({ attempt: publicExamAttempt(value.attempt), idempotent: value.idempotent === true }, 200, request, env);
}

async function listExamAttempts(request, env) {
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  const url = new URL(request.url);
  const { page, pageSize } = parsePage(url);
  if (page > MAX_EXAM_ATTEMPT_PAGES) {
    throw new HttpError(400, "INVALID_PAGINATION", "Exam-attempt page is too large");
  }
  const params = new URLSearchParams({
    select: EXAM_ATTEMPT_PUBLIC_FIELDS,
    student_id: `eq.${student.id}`,
    order: "attempt_number.desc",
    limit: String(pageSize),
    offset: String((page - 1) * pageSize)
  });
  let response;
  try {
    response = await supabaseFetch(env, `/rest/v1/speaking_exam_attempts?${params}`, {
      method: "GET",
      headers: { Prefer: "count=exact" }
    });
  } catch (error) {
    throw new HttpError(502, "EXAM_ATTEMPTS_UNAVAILABLE", "Exam attempts are temporarily unavailable");
  }
  if (!response.ok) {
    await discardResponse(response);
    throw new HttpError(502, "EXAM_ATTEMPTS_UNAVAILABLE", "Exam attempts are temporarily unavailable");
  }
  const rows = await parseUpstreamArray(response, "Exam attempts");
  const contentRange = response.headers.get("Content-Range") || "";
  const totalMatch = contentRange.match(/\/(\d+)$/);
  return json({
    attempts: rows.map(publicExamAttempt).filter(Boolean),
    page,
    pageSize,
    total: totalMatch ? Number(totalMatch[1]) : null
  }, 200, request, env);
}

async function fetchPostgrestRows(env, table, baseParams, maximumRows, errorCode, errorMessage) {
  const rows = [];
  const pageSize = 1000;
  while (rows.length < maximumRows) {
    const params = new URLSearchParams(baseParams);
    params.set("limit", String(Math.min(pageSize, maximumRows - rows.length)));
    params.set("offset", String(rows.length));
    let response;
    try {
      response = await supabaseFetch(env, `/rest/v1/${table}?${params}`, { method: "GET" });
    } catch (error) {
      throw new HttpError(502, errorCode, errorMessage);
    }
    if (!response.ok) {
      await discardResponse(response);
      throw new HttpError(502, errorCode, errorMessage);
    }
    let page;
    try {
      page = await response.json();
    } catch (error) {
      throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", `${errorMessage} returned an invalid response`);
    }
    if (!Array.isArray(page)) {
      throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", `${errorMessage} returned an invalid response`);
    }
    rows.push(...page);
    if (page.length < pageSize) break;
  }
  return rows.slice(0, maximumRows);
}

async function listAdminStudents(request, env) {
  const admin = await authenticateAdmin(request, env);
  if (!admin) throw new HttpError(401, "ADMIN_AUTH_REQUIRED", "Administrator authentication required");

  const students = await fetchPostgrestRows(
    env,
    "flashcard_students",
    new URLSearchParams({
      select: "id,name,created_at,updated_at",
      deleted_at: "is.null",
      order: "name.asc,id.asc"
    }),
    MAX_ADMIN_STUDENTS,
    "STUDENTS_UNAVAILABLE",
    "Student accounts are temporarily unavailable"
  );
  const stateRows = await fetchPostgrestRows(
    env,
    "flashcard_student_state",
    new URLSearchParams({
      select: "student_id,value,updated_at",
      key: `eq.${SPEAKING_ACCESS_STATE_KEY}`,
      order: "student_id.asc"
    }),
    MAX_ADMIN_STUDENTS,
    "STATE_UNAVAILABLE",
    "Student settings are temporarily unavailable"
  );
  const accessByStudent = new Map(stateRows.map(row => [String(row.student_id || "").toLowerCase(), row]));
  return json(
    {
      students: students.map(student => {
        const id = String(student.id || "").toLowerCase();
        const state = accessByStudent.get(id);
        return {
          id,
          name: String(student.name || ""),
          createdAt: String(student.created_at || ""),
          updatedAt: String(student.updated_at || ""),
          access: normalizeSpeakingAccess(state?.value),
          accessUpdatedAt: state ? String(state.updated_at || "") : null
        };
      })
    },
    200,
    request,
    env
  );
}

async function findActiveStudent(env, studentId) {
  const rows = await fetchPostgrestRows(
    env,
    "flashcard_students",
    new URLSearchParams({
      select: "id,name,created_at,updated_at",
      id: `eq.${studentId}`,
      deleted_at: "is.null"
    }),
    1,
    "STUDENTS_UNAVAILABLE",
    "Student accounts are temporarily unavailable"
  );
  return rows[0] || null;
}

async function putAdminStudentAccess(request, env, studentId) {
  if (!UUID_RE.test(studentId)) throw new HttpError(404, "STUDENT_NOT_FOUND", "Student not found");
  const admin = await authenticateAdmin(request, env);
  if (!admin) throw new HttpError(401, "ADMIN_AUTH_REQUIRED", "Administrator authentication required");
  const payload = await readLimitedJson(request, 16384);
  if (!hasExactKeys(payload, ["access"])) {
    throw new HttpError(400, "INVALID_ACCESS", "Request body must contain only access");
  }
  const access = normalizeSpeakingAccess(payload.access, true);
  const student = await findActiveStudent(env, studentId.toLowerCase());
  if (!student) throw new HttpError(404, "STUDENT_NOT_FOUND", "Student not found");
  const row = await upsertStudentState(env, studentId.toLowerCase(), SPEAKING_ACCESS_STATE_KEY, access);
  return json(
    {
      student: {
        id: String(student.id || "").toLowerCase(),
        name: String(student.name || "")
      },
      access,
      updatedAt: String(row.updated_at || "")
    },
    200,
    request,
    env
  );
}

async function reconcileRecordings(request, env) {
  const admin = await authenticateAdmin(request, env);
  if (!admin) throw new HttpError(401, "ADMIN_AUTH_REQUIRED", "Administrator authentication required");

  let limit = 10;
  if (request.body) {
    const payload = await readLimitedJson(request, 2048);
    limit = Number(payload?.limit ?? limit);
  }
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > RECONCILE_MAX_ITEMS) {
    throw new HttpError(400, "INVALID_RECONCILE_LIMIT", `limit must be between 1 and ${RECONCILE_MAX_ITEMS}`);
  }

  const staleBefore = new Date(Date.now() - RECONCILE_UPLOAD_GRACE_MS).toISOString();
  const deleting = await queryLifecycleRows(env, "deleting", limit);
  const uploading = deleting.length < limit
    ? await queryLifecycleRows(env, "uploading", limit - deleting.length, staleBefore)
    : [];
  const candidates = [
    ...deleting.map(row => ({ row, sourceState: "deleting" })),
    ...uploading.map(row => ({ row, sourceState: "uploading" }))
  ];
  const items = [];

  for (const candidate of candidates) {
    let row = candidate.row;
    let deletionClaimed = candidate.sourceState === "deleting";

    try {
      if (candidate.sourceState === "uploading") {
        const claim = rpcObject(await rpc(env, "speaking_claim_stale_recording_upload", {
          p_id: String(row.id),
          p_updated_before: staleBefore
        }));
        if (!claim || claim.ok !== true || !claim.recording) {
          items.push({ id: String(row.id), status: "skipped-state-changed" });
          continue;
        }
        row = claim.recording;
        deletionClaimed = true;
      }

      await removeStorageObject(env, String(row.object_path));
      const finalized = await rpc(env, "speaking_finalize_recording_delete", { p_id: String(row.id) });
      const removed = finalized === true || (Array.isArray(finalized) && finalized[0] === true);
      if (!removed) throw new Error("Metadata finalization did not confirm deletion");
      items.push({ id: String(row.id), status: "removed" });
    } catch (error) {
      if (deletionClaimed) {
        await noteLifecycleError(env, String(row.id), "Admin reconciliation retry required");
      }
      items.push({ id: String(row.id), status: "retry-required" });
    }
  }

  return json(
    {
      reconciliation: {
        processed: items.length,
        removed: items.filter(item => item.status === "removed").length,
        retryRequired: items.filter(item => item.status === "retry-required").length,
        staleUploadGraceSeconds: RECONCILE_UPLOAD_GRACE_MS / 1000,
        items
      }
    },
    200,
    request,
    env
  );
}

async function queryLifecycleRows(env, state, limit, updatedBefore = "") {
  if (limit < 1) return [];
  const params = new URLSearchParams({
    select: RECORDING_PRIVATE_FIELDS,
    storage_state: `eq.${state}`,
    order: "updated_at.asc,id.asc",
    limit: String(limit)
  });
  if (updatedBefore) params.set("updated_at", `lt.${updatedBefore}`);

  let response;
  try {
    response = await supabaseFetch(env, `/rest/v1/speaking_recording_attempts?${params}`, { method: "GET" });
  } catch (error) {
    throw new HttpError(502, "METADATA_UNAVAILABLE", "Recording metadata is temporarily unavailable");
  }
  if (!response.ok) {
    await discardResponse(response);
    throw new HttpError(502, "METADATA_UNAVAILABLE", "Recording metadata is temporarily unavailable");
  }
  const rows = await response.json();
  if (!Array.isArray(rows)) {
    throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Recording metadata returned an invalid response");
  }
  return rows;
}

async function parseMultipartUpload(request, env) {
  const contentType = request.headers.get("Content-Type") || "";
  if (!/^multipart\/form-data\s*;/i.test(contentType) || !/boundary=/i.test(contentType)) {
    throw new HttpError(415, "MULTIPART_REQUIRED", "Upload must be multipart/form-data");
  }

  const wireBytes = await readLimitedBytes(
    request,
    maxUploadBytes(env) + MULTIPART_OVERHEAD_BYTES
  );
  let form;
  try {
    form = await new Response(wireBytes, {
      headers: { "Content-Type": contentType }
    }).formData();
  } catch (error) {
    throw new HttpError(400, "INVALID_MULTIPART", "Invalid multipart upload");
  }

  const files = form.getAll("file");
  if (files.length !== 1) {
    throw new HttpError(400, "ONE_FILE_REQUIRED", "Exactly one MP3 file is required");
  }
  const file = files[0];
  if (!file || typeof file.arrayBuffer !== "function" || !Number.isSafeInteger(file.size)) {
    throw new HttpError(400, "INVALID_FILE", "Invalid MP3 file");
  }
  if (file.size < 512) {
    throw new HttpError(422, "MP3_TOO_SHORT", "The MP3 recording is too short");
  }
  if (file.size > maxUploadBytes(env)) {
    throw new HttpError(413, "MP3_TOO_LARGE", "The MP3 recording is too large");
  }
  const suppliedMime = String(file.type || "").toLowerCase().split(";", 1)[0].trim();
  if (!new Set(["audio/mpeg", "audio/mp3", "audio/x-mp3"]).has(suppliedMime)) {
    throw new HttpError(415, "MP3_MIME_REQUIRED", "The recording must use an MP3 MIME type");
  }

  const exerciseId = singleFormText(form, "exerciseId", true);
  if (!EXERCISE_ID_RE.test(exerciseId)) {
    throw new HttpError(400, "INVALID_EXERCISE_ID", "Invalid exerciseId");
  }

  const exerciseTitle = normalizeTitle(singleFormText(form, "exerciseTitle", true));
  const exam = normalizeExam(singleFormText(form, "exam", true));
  const partNumber = parseNumberedField(singleFormText(form, "part", exam === "ielts"), "part", 1, 99);
  const bookNumber = parseNumberedField(singleFormText(form, "book", exam === "ielts"), "book", 1, 999);
  if (exam === "ielts" && (partNumber < 1 || partNumber > 3 || bookNumber < 1 || bookNumber > 16)) {
    throw new HttpError(400, "INVALID_IELTS_LOCATION", "IELTS part must be 1-3 and book must be 1-16");
  }

  const durationValue = singleFormText(form, "durationMs", false);
  let clientDurationMs = null;
  if (durationValue !== "") {
    if (!/^\d{1,10}$/.test(durationValue)) {
      throw new HttpError(400, "INVALID_DURATION", "Invalid durationMs");
    }
    clientDurationMs = Number(durationValue);
    if (!Number.isSafeInteger(clientDurationMs) || clientDurationMs > maxDurationMs(env)) {
      throw new HttpError(400, "INVALID_DURATION", "Invalid durationMs");
    }
  }

  const fileBytes = new Uint8Array(await file.arrayBuffer());
  const mp3 = inspectMp3(fileBytes, { maxId3Bytes: maxId3Bytes(env) });
  if (!mp3) {
    throw new HttpError(415, "INVALID_MP3", "The uploaded file is not a valid MPEG Layer III recording");
  }
  if (mp3.durationMs > maxDurationMs(env) + MP3_ENCODER_PADDING_TOLERANCE_MS) {
    throw new HttpError(413, "RECORDING_TOO_LONG", "The MP3 recording is too long");
  }

  return {
    bytes: fileBytes,
    exerciseId,
    exerciseTitle,
    exam,
    partNumber,
    bookNumber,
    clientDurationMs,
    durationMs: mp3.durationMs,
    originalFilename: normalizeOriginalFilename(String(file.name || "recording.mp3"))
  };
}

function singleFormText(form, name, required) {
  const values = form.getAll(name);
  if (values.length > 1 || (required && values.length !== 1)) {
    throw new HttpError(400, "INVALID_UPLOAD_METADATA", `Invalid ${name}`);
  }
  if (values.length === 0) return "";
  if (typeof values[0] !== "string") {
    throw new HttpError(400, "INVALID_UPLOAD_METADATA", `Invalid ${name}`);
  }
  return values[0].trim();
}

function normalizeTitle(value) {
  const normalized = value.normalize("NFC").trim();
  if (!normalized || normalized.length > 240 || /[\u0000-\u001f\u007f]/.test(normalized)) {
    throw new HttpError(400, "INVALID_EXERCISE_TITLE", "Invalid exerciseTitle");
  }
  return normalized;
}

function normalizeOriginalFilename(value) {
  const normalized = value
    .normalize("NFC")
    .replace(/[\u0000-\u001f\u007f/\\]+/g, "_")
    .trim()
    .slice(0, 240);
  return normalized || "recording.mp3";
}

function normalizeExam(value) {
  const key = value.toLowerCase().replace(/[\s_/]+/g, "-").replace(/-+/g, "-");
  const aliases = new Map([
    ["ielts", "ielts"],
    ["dse", "dse"],
    ["business", "business-english"],
    ["business-english", "business-english"],
    ["school-job-interview", "school-job-interview"],
    ["school-interview", "school-job-interview"],
    ["job-interview", "school-job-interview"],
    ["civil-service", "civil-service-interview"],
    ["civil-service-interview", "civil-service-interview"]
  ]);
  const normalized = aliases.get(key);
  if (!normalized) throw new HttpError(400, "INVALID_EXAM", "Invalid exam");
  return normalized;
}

function parseNumberedField(value, required, minimum, maximum) {
  if (!value && !required) return null;
  const match = value.match(/^(?:part|book)?[\s_-]*(\d{1,3})$/i);
  if (!match) throw new HttpError(400, "INVALID_UPLOAD_METADATA", "Invalid part or book number");
  const parsed = Number(match[1]);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new HttpError(400, "INVALID_UPLOAD_METADATA", "Invalid part or book number");
  }
  return parsed;
}

async function uploadRecording(request, env) {
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  await enforceUploadRateLimit(env, student.id);

  const upload = await parseMultipartUpload(request, env);
  await enforceRecordingAccess(env, student.id, upload);
  const attemptId = crypto.randomUUID();
  const objectPath = `students/${student.id}/${attemptId}.mp3`;
  const digest = await crypto.subtle.digest("SHA-256", upload.bytes);
  const metadata = {
    id: attemptId,
    student_id: student.id,
    object_path: objectPath,
    exercise_id: upload.exerciseId,
    exercise_title: upload.exerciseTitle,
    exam: upload.exam,
    part_number: upload.partNumber,
    book_number: upload.bookNumber,
    original_filename: upload.originalFilename,
    content_type: "audio/mpeg",
    size_bytes: upload.bytes.byteLength,
    duration_ms: upload.durationMs,
    client_duration_ms: upload.clientDurationMs,
    sha256_hex: bytesToHex(new Uint8Array(digest)),
    crc32_value: crc32(upload.bytes)
  };

  const reservation = await reserveRecordingMetadata(env, metadata);
  if (reservation.idempotent === true && reservation.recording?.storage_state === "ready") {
    const existingId = String(reservation.recording.id || "");
    const response = json(
      {
        recording: publicRecording(reservation.recording, request),
        quota: reservation.quota || null,
        usage: reservation.usage || null,
        idempotent: true
      },
      200,
      request,
      env
    );
    response.headers.set("Location", new URL(`/v1/recordings/${existingId}`, request.url).toString());
    return response;
  }
  try {
    await putStorageObject(env, objectPath, upload.bytes);
  } catch (error) {
    try {
      await removeStorageObject(env, objectPath);
      await cancelRecordingReservation(env, attemptId);
    } catch (cleanupError) {
      await noteLifecycleError(env, attemptId, "Upload cleanup requires reconciliation");
      console.error("Speaking upload cleanup queued", attemptId);
    }
    throw error;
  }

  let row;
  try {
    row = await markRecordingReady(env, attemptId, student.id);
  } catch (error) {
    // Do not compensate an uncertain commit by deleting Storage: the ready RPC
    // may have committed just before a timeout. A remaining `uploading` row is
    // hidden and can be removed safely by the reconciliation endpoint.
    await noteLifecycleError(env, attemptId, "Ready transition requires reconciliation");
    console.error("Speaking ready transition uncertain", attemptId);
    throw error;
  }

  const response = json(
    {
      recording: publicRecording(row, request),
      quota: reservation.quota || null,
      usage: reservation.usage || null
    },
    201,
    request,
    env
  );
  response.headers.set("Location", new URL(`/v1/recordings/${attemptId}`, request.url).toString());
  return response;
}

async function enforceRecordingAccess(env, studentId, upload) {
  const access = await studentSpeakingAccess(env, studentId);
  const examAccessKeys = {
    dse: "exam.dse",
    ielts: "exam.ielts",
    "business-english": "exam.business",
    "school-job-interview": "exam.interview",
    "civil-service-interview": "exam.civil-service"
  };
  const keys = [examAccessKeys[upload.exam]];
  if (upload.exam === "ielts") {
    keys.push(`ielts.part.${upload.partNumber}`);
    keys.push(`ielts.part.${upload.partNumber}.book.${upload.bookNumber}`);
  }
  if (keys.some(key => !key || access[key] === false)) {
    throw new HttpError(403, "SECTION_ACCESS_DENIED", "Your account does not have access to this speaking section");
  }
}

async function enforceUploadRateLimit(env, studentId) {
  if (!env.UPLOAD_RATE_LIMITER || typeof env.UPLOAD_RATE_LIMITER.limit !== "function") {
    throw new HttpError(503, "UPLOAD_RATE_LIMIT_NOT_CONFIGURED", "Recording uploads are not configured");
  }
  let result;
  try {
    result = await env.UPLOAD_RATE_LIMITER.limit({ key: `speaking-upload:${studentId}` });
  } catch (error) {
    throw new HttpError(503, "UPLOAD_RATE_LIMIT_UNAVAILABLE", "Recording uploads are temporarily unavailable");
  }
  if (!result.success) {
    throw new HttpError(429, "UPLOAD_RATE_LIMITED", "Too many recording uploads; wait one minute and try again");
  }
}

async function enforceExamStartRateLimit(env, studentId) {
  if (!env.UPLOAD_RATE_LIMITER || typeof env.UPLOAD_RATE_LIMITER.limit !== "function") {
    throw new HttpError(503, "EXAM_START_RATE_LIMIT_NOT_CONFIGURED", "Exam practice is not configured");
  }
  let result;
  try {
    result = await env.UPLOAD_RATE_LIMITER.limit({ key: `speaking-exam-start:${studentId}` });
  } catch (error) {
    throw new HttpError(503, "EXAM_START_RATE_LIMIT_UNAVAILABLE", "Exam practice is temporarily unavailable");
  }
  if (!result.success) {
    throw new HttpError(429, "EXAM_START_RATE_LIMITED", "Too many exam attempts were started; wait one minute and try again");
  }
}

async function putStorageObject(env, objectPath, bytes) {
  let response;
  try {
    response = await supabaseFetch(
      env,
      `/storage/v1/object/${encodeURIComponent(BUCKET_NAME)}/${encodeStoragePath(objectPath)}`,
      {
        method: "POST",
        headers: {
          "Cache-Control": "private, max-age=0, no-store",
          "Content-Length": String(bytes.byteLength),
          "Content-Type": "audio/mpeg",
          "x-upsert": "false"
        },
        body: bytes
      },
      60000
    );
  } catch (error) {
    throw new HttpError(502, "STORAGE_UNAVAILABLE", "Recording storage is temporarily unavailable");
  }
  if (!response.ok) {
    await discardResponse(response);
    throw new HttpError(502, "STORAGE_UPLOAD_FAILED", "The recording could not be stored");
  }
  await discardResponse(response);
}

async function removeStorageObject(env, objectPath) {
  let response;
  try {
    response = await supabaseFetch(
      env,
      `/storage/v1/object/${encodeURIComponent(BUCKET_NAME)}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prefixes: [objectPath] })
      },
      30000
    );
  } catch (error) {
    throw new HttpError(502, "STORAGE_UNAVAILABLE", "Recording storage is temporarily unavailable");
  }
  if (!response.ok && response.status !== 404) {
    await discardResponse(response);
    throw new HttpError(502, "STORAGE_DELETE_FAILED", "The recording could not be deleted");
  }
  await discardResponse(response);
}

function encodeStoragePath(path) {
  return path.split("/").map(segment => encodeURIComponent(segment)).join("/");
}

function rpcObject(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) return value;
  if (Array.isArray(value) && value.length === 1 && value[0] && typeof value[0] === "object") {
    return value[0];
  }
  return null;
}

async function reserveRecordingMetadata(env, metadata) {
  const value = rpcObject(await rpc(env, "speaking_reserve_recording_attempt", {
    p_id: metadata.id,
    p_student_id: metadata.student_id,
    p_object_path: metadata.object_path,
    p_exercise_id: metadata.exercise_id,
    p_exercise_title: metadata.exercise_title,
    p_exam: metadata.exam,
    p_part_number: metadata.part_number,
    p_book_number: metadata.book_number,
    p_original_filename: metadata.original_filename,
    p_size_bytes: metadata.size_bytes,
    p_duration_ms: metadata.duration_ms,
    p_client_duration_ms: metadata.client_duration_ms,
    p_sha256_hex: metadata.sha256_hex,
    p_crc32_value: metadata.crc32_value
  }));
  if (!value) {
    throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Recording quota service returned an invalid response");
  }
  if (value.ok !== true) {
    if (value.code === "STUDENT_FILE_QUOTA_REACHED") {
      throw new HttpError(409, value.code, "Your recording file quota is full; export and delete older attempts first");
    }
    if (value.code === "STUDENT_STORAGE_QUOTA_REACHED") {
      throw new HttpError(413, value.code, "Your recording storage quota is full; export and delete older attempts first");
    }
    if (value.code === "STUDENT_NOT_FOUND") {
      throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
    }
    if (value.code === "RECORDING_UPLOAD_IN_PROGRESS") {
      throw new HttpError(409, value.code, "This exam answer is already being saved; retry shortly");
    }
    throw new HttpError(409, "RECORDING_RESERVATION_REJECTED", "The recording could not be reserved");
  }
  return value;
}

async function markRecordingReady(env, id, studentId) {
  const value = rpcObject(await rpc(env, "speaking_mark_recording_ready", {
    p_id: id,
    p_student_id: studentId
  }));
  if (!value || value.ok !== true || !value.recording) {
    throw new HttpError(502, "READY_TRANSITION_FAILED", "The recording could not be finalized");
  }
  return value.recording;
}

async function cancelRecordingReservation(env, id) {
  return rpc(env, "speaking_cancel_recording_upload", { p_id: id });
}

async function noteLifecycleError(env, id, message) {
  try {
    await rpc(env, "speaking_recording_lifecycle_error", {
      p_id: id,
      p_message: String(message || "Storage operation failed").slice(0, 500)
    });
    return true;
  } catch (error) {
    console.error("Speaking lifecycle status update failed", id);
    return false;
  }
}

function parsePage(url) {
  const pageText = url.searchParams.get("page") || "1";
  const pageSizeText = url.searchParams.get("pageSize") || "100";
  if (!/^\d+$/.test(pageText) || !/^\d+$/.test(pageSizeText)) {
    throw new HttpError(400, "INVALID_PAGINATION", "Invalid pagination");
  }
  const page = Number(pageText);
  const pageSize = Number(pageSizeText);
  if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 200) {
    throw new HttpError(400, "INVALID_PAGINATION", "pageSize must be between 1 and 200");
  }
  return { page, pageSize };
}

async function listRecordings(request, env, options = {}) {
  const url = new URL(request.url);
  const scope = options.forceAdmin ? "all" : (url.searchParams.get("scope") || "mine");
  const { page, pageSize } = parsePage(url);
  let studentId = null;
  let includeStudent = false;

  if (scope === "mine" && !options.forceAdmin) {
    const student = await authenticateStudent(request, env);
    if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
    studentId = student.id;
  } else if (scope === "all") {
    const admin = await authenticateAdmin(request, env);
    if (!admin) throw new HttpError(401, "ADMIN_AUTH_REQUIRED", "Administrator authentication required");
    includeStudent = true;
    const filterStudent = url.searchParams.get("studentId");
    if (filterStudent) {
      if (!UUID_RE.test(filterStudent)) {
        throw new HttpError(400, "INVALID_STUDENT_ID", "Invalid studentId");
      }
      studentId = filterStudent.toLowerCase();
    }
  } else {
    throw new HttpError(400, "INVALID_SCOPE", "scope must be mine or all");
  }

  const result = await queryRecordingPage(env, {
    studentId,
    includeStudent,
    page,
    pageSize
  });
  return json(
    {
      recordings: result.rows.map(row => publicRecording(row, request, includeStudent)),
      page,
      pageSize,
      total: result.total
    },
    200,
    request,
    env
  );
}

async function queryRecordingPage(env, options) {
  const select = options.includeStudent
    ? `${RECORDING_PUBLIC_FIELDS},student:flashcard_students!speaking_recording_attempts_student_id_fkey(name)`
    : RECORDING_PUBLIC_FIELDS;
  const params = new URLSearchParams({
    select,
    order: "created_at.desc,id.desc",
    limit: String(options.pageSize),
    offset: String((options.page - 1) * options.pageSize),
    storage_state: "eq.ready"
  });
  if (options.studentId) params.set("student_id", `eq.${options.studentId}`);

  let response;
  try {
    response = await supabaseFetch(env, `/rest/v1/speaking_recording_attempts?${params}`, {
      method: "GET",
      headers: { "Prefer": "count=exact" }
    });
  } catch (error) {
    throw new HttpError(502, "METADATA_UNAVAILABLE", "Recording metadata is temporarily unavailable");
  }
  if (!response.ok) {
    await discardResponse(response);
    throw new HttpError(502, "METADATA_UNAVAILABLE", "Recording metadata is temporarily unavailable");
  }
  let rows;
  try {
    rows = await response.json();
  } catch (error) {
    throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Recording metadata returned an invalid response");
  }
  const contentRange = response.headers.get("Content-Range") || "";
  const totalMatch = contentRange.match(/\/(\d+)$/);
  return { rows: Array.isArray(rows) ? rows : [], total: totalMatch ? Number(totalMatch[1]) : null };
}

function publicRecording(row, request, includeStudent = false) {
  const id = String(row.id || "");
  const value = {
    id,
    exerciseId: String(row.exercise_id || ""),
    exerciseTitle: String(row.exercise_title || ""),
    exam: String(row.exam || ""),
    part: row.part_number === null ? null : Number(row.part_number),
    book: row.book_number === null ? null : Number(row.book_number),
    originalFilename: String(row.original_filename || ""),
    sizeBytes: Number(row.size_bytes || 0),
    durationMs: Number(row.duration_ms || 0),
    clientDurationMs: row.client_duration_ms === null ? null : Number(row.client_duration_ms),
    createdAt: String(row.created_at || ""),
    downloadUrl: new URL(`/v1/recordings/${id}`, request.url).toString()
  };
  if (includeStudent) {
    value.studentId = String(row.student_id || "");
    value.studentName = String(row.student?.name || "");
  }
  return value;
}

async function findRecording(env, id, studentId = null, options = {}) {
  if (!UUID_RE.test(id)) return null;
  const params = new URLSearchParams({
    select: RECORDING_PRIVATE_FIELDS,
    id: `eq.${id.toLowerCase()}`,
    limit: "1"
  });
  if (studentId) params.set("student_id", `eq.${studentId}`);
  if (!options.includeLifecycle) params.set("storage_state", "eq.ready");

  let response;
  try {
    response = await supabaseFetch(env, `/rest/v1/speaking_recording_attempts?${params}`, { method: "GET" });
  } catch (error) {
    throw new HttpError(502, "METADATA_UNAVAILABLE", "Recording metadata is temporarily unavailable");
  }
  if (!response.ok) {
    await discardResponse(response);
    throw new HttpError(502, "METADATA_UNAVAILABLE", "Recording metadata is temporarily unavailable");
  }
  const rows = await response.json();
  return Array.isArray(rows) && rows.length === 1 ? rows[0] : null;
}

async function deleteRecording(request, env, id, options = {}) {
  if (!UUID_RE.test(id)) throw new HttpError(404, "RECORDING_NOT_FOUND", "Recording not found");
  let actor;
  if (options.forceAdmin) {
    actor = await authenticateAdmin(request, env);
  } else {
    actor = await authenticateEither(request, env);
  }
  if (!actor) throw new HttpError(401, "AUTH_REQUIRED", "Authentication required");
  if (options.forceAdmin && actor.kind !== "admin") {
    throw new HttpError(401, "ADMIN_AUTH_REQUIRED", "Administrator authentication required");
  }

  const value = rpcObject(await rpc(env, "speaking_begin_recording_delete", {
    p_id: id,
    p_student_id: actor.kind === "student" ? actor.id : null
  }));
  if (!value || value.ok !== true || !value.recording) {
    if (value?.code === "RECORDING_NOT_FOUND") {
      throw new HttpError(404, "RECORDING_NOT_FOUND", "Recording not found");
    }
    throw new HttpError(502, "DELETE_STATE_FAILED", "Recording deletion could not be started");
  }
  const row = value.recording;

  try {
    await removeStorageObject(env, String(row.object_path));
  } catch (error) {
    await noteLifecycleError(env, String(row.id), "Storage deletion requires retry");
    throw error;
  }

  try {
    const finalized = await rpc(env, "speaking_finalize_recording_delete", { p_id: String(row.id) });
    if (finalized === true || (Array.isArray(finalized) && finalized[0] === true)) {
      return emptyResponse(204, request, env);
    }
  } catch (error) {
    console.error("Speaking metadata deletion queued", String(row.id));
  }
  await noteLifecycleError(env, String(row.id), "Metadata deletion requires reconciliation");
  return json(
    { deletion: { id: String(row.id), status: "pending-reconciliation" } },
    202,
    request,
    env
  );
}

async function downloadRecording(request, env, id) {
  const actor = await authenticateEither(request, env);
  if (!actor) throw new HttpError(401, "AUTH_REQUIRED", "Authentication required");
  const row = await findRecording(env, id, actor.kind === "student" ? actor.id : null);
  if (!row) throw new HttpError(404, "RECORDING_NOT_FOUND", "Recording not found");

  const range = request.headers.get("Range");
  if (range && (range.length > 100 || !/^bytes=\d*-\d*$/.test(range))) {
    throw new HttpError(416, "INVALID_RANGE", "Invalid byte range");
  }
  const upstreamHeaders = range ? { Range: range } : {};
  let upstream;
  try {
    upstream = await supabaseFetch(
      env,
      `/storage/v1/object/authenticated/${encodeURIComponent(BUCKET_NAME)}/${encodeStoragePath(String(row.object_path))}`,
      { method: "GET", headers: upstreamHeaders },
      30000
    );
  } catch (error) {
    throw new HttpError(502, "STORAGE_UNAVAILABLE", "Recording storage is temporarily unavailable");
  }
  if (upstream.status !== 200 && upstream.status !== 206) {
    await discardResponse(upstream);
    if (upstream.status === 404) throw new HttpError(404, "RECORDING_NOT_FOUND", "Recording not found");
    throw new HttpError(502, "STORAGE_DOWNLOAD_FAILED", "The recording could not be downloaded");
  }

  const headers = corsHeaders(request.headers.get("Origin") || "", env);
  headers.set("Content-Type", "audio/mpeg");
  headers.set("Content-Disposition", contentDisposition(recordingFilename(row), new URL(request.url).searchParams.get("download") === "1"));
  for (const name of ["Accept-Ranges", "Content-Length", "Content-Range", "ETag"]) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set("Vary", "Origin, Range");
  return new Response(upstream.body, { status: upstream.status, headers });
}

function recordingFilename(row) {
  const exam = String(row.exam || "speaking").toUpperCase();
  const part = row.part_number === null ? "" : `-Part-${Number(row.part_number)}`;
  const book = row.book_number === null ? "" : `-Book-${String(Number(row.book_number)).padStart(2, "0")}`;
  const title = asciiSlug(String(row.exercise_title || row.exercise_id || "attempt"), 60);
  const stamp = String(row.created_at || "").replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z").replace("T", "-");
  return `${exam}${part}${book}-${title}-${stamp || String(row.id).slice(0, 8)}.mp3`;
}

function contentDisposition(filename, attachment = true) {
  const ascii = filename
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]+/g, "")
    .replace(/["\\\r\n]/g, "_")
    .slice(0, 180) || "speaking-recording.mp3";
  const disposition = attachment ? "attachment" : "inline";
  return `${disposition}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

async function exportRecordings(request, env, ctx) {
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  const url = new URL(request.url);
  const { page, pageSize } = parseExportPage(url, env);
  const batch = await studentRecordingBatch(env, student.id, page, pageSize);
  if (batch.rows.length === 0) {
    throw new HttpError(404, "NO_RECORDINGS", "There are no recordings to export");
  }

  const totalAudioBytes = batch.rows.reduce((sum, row) => sum + Number(row.size_bytes || 0), 0);
  if (totalAudioBytes > maxExportBytes(env)) {
    throw new HttpError(413, "EXPORT_BATCH_TOO_LARGE", "This export batch is too large; retry with a smaller pageSize");
  }
  const zip = prepareZip(batch.rows);
  if (zip.totalLength >= 0xFFFFFFFF) {
    throw new HttpError(413, "ZIP32_LIMIT", "The recording archive is too large for ZIP32");
  }

  const usesFixedLength = typeof globalThis.FixedLengthStream === "function";
  const stream = usesFixedLength
    ? new globalThis.FixedLengthStream(zip.totalLength)
    : new TransformStream();
  const pump = pumpZip(stream.writable, zip, env).catch(error => {
    console.error("Speaking ZIP stream failed", safeErrorMessage(error));
  });
  if (ctx && typeof ctx.waitUntil === "function") ctx.waitUntil(pump);

  const date = new Date().toISOString().slice(0, 10);
  const totalPages = Math.ceil(batch.total / pageSize);
  const batchLabel = `${String(page).padStart(3, "0")}-of-${String(totalPages).padStart(3, "0")}`;
  const headers = corsHeaders(request.headers.get("Origin") || "", env);
  headers.set("Content-Type", "application/zip");
  if (usesFixedLength) headers.set("Content-Length", String(zip.totalLength));
  headers.set("Content-Disposition", contentDisposition(`Edmund-Speaking-Recordings-${date}-Batch-${batchLabel}.zip`, true));
  headers.set("X-Export-Page", String(page));
  headers.set("X-Export-Page-Size", String(pageSize));
  headers.set("X-Export-File-Count", String(batch.rows.length));
  headers.set("X-Export-Total-Files", String(batch.total));
  headers.set("X-Export-Total-Pages", String(totalPages));
  headers.set("X-Export-Has-More", page < totalPages ? "true" : "false");
  return new Response(stream.readable, { status: 200, headers });
}

function parseExportPage(url, env) {
  const pageText = url.searchParams.get("page") || "1";
  const pageSizeText = url.searchParams.get("pageSize") || String(defaultExportPageSize(env));
  if (!/^\d+$/.test(pageText) || !/^\d+$/.test(pageSizeText)) {
    throw new HttpError(400, "INVALID_EXPORT_PAGE", "Invalid export page or pageSize");
  }
  const page = Number(pageText);
  const pageSize = Number(pageSizeText);
  if (
    !Number.isSafeInteger(page)
    || page < 1
    || page > 1000000
    || !Number.isSafeInteger(pageSize)
    || pageSize < 1
    || pageSize > maxExportFiles(env)
  ) {
    throw new HttpError(400, "INVALID_EXPORT_PAGE", `Export pageSize must be between 1 and ${maxExportFiles(env)}`);
  }
  return { page, pageSize };
}

async function studentRecordingBatch(env, studentId, page, pageSize) {
  const params = new URLSearchParams({
    select: RECORDING_PRIVATE_FIELDS,
    student_id: `eq.${studentId}`,
    storage_state: "eq.ready",
    order: "created_at.asc,id.asc",
    limit: String(pageSize),
    offset: String((page - 1) * pageSize)
  });
  let response;
  try {
    response = await supabaseFetch(env, `/rest/v1/speaking_recording_attempts?${params}`, {
      method: "GET",
      headers: { "Prefer": "count=exact" }
    });
  } catch (error) {
    throw new HttpError(502, "METADATA_UNAVAILABLE", "Recording metadata is temporarily unavailable");
  }
  if (!response.ok) {
    await discardResponse(response);
    throw new HttpError(502, "METADATA_UNAVAILABLE", "Recording metadata is temporarily unavailable");
  }
  const rows = await response.json();
  const contentRange = response.headers.get("Content-Range") || "";
  const totalMatch = contentRange.match(/\/(\d+)$/);
  if (!Array.isArray(rows) || !totalMatch) {
    throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Recording metadata returned an invalid response");
  }
  return { rows, total: Number(totalMatch[1]) };
}

function prepareZip(rows) {
  let offset = 0;
  const entries = rows.map(row => {
    const archiveName = archiveFilename(row);
    const nameBytes = encoder.encode(archiveName);
    if (nameBytes.length > 65535) throw new HttpError(413, "ZIP_NAME_TOO_LONG", "An archive filename is too long");
    const size = Number(row.size_bytes);
    const crc = Number(row.crc32_value);
    if (!Number.isSafeInteger(size) || size < 0 || !Number.isSafeInteger(crc) || crc < 0 || crc > 0xFFFFFFFF) {
      throw new HttpError(502, "INVALID_METADATA", "Recording metadata is invalid");
    }
    const entry = {
      id: String(row.id),
      key: String(row.object_path),
      size,
      crc,
      archiveName,
      nameBytes,
      offset,
      date: new Date(String(row.created_at || ""))
    };
    offset += 30 + nameBytes.length + size;
    return entry;
  });
  const centralOffset = offset;
  const centralSize = entries.reduce((sum, entry) => sum + 46 + entry.nameBytes.length, 0);
  return {
    entries,
    centralOffset,
    centralSize,
    totalLength: centralOffset + centralSize + 22
  };
}

function archiveFilename(row) {
  const exam = asciiSlug(String(row.exam || "speaking"), 30).toUpperCase();
  const part = row.part_number === null ? "General" : `Part-${Number(row.part_number)}`;
  const book = row.book_number === null ? "" : `Book-${String(Number(row.book_number)).padStart(2, "0")}`;
  const exercise = asciiSlug(String(row.exercise_title || row.exercise_id || "Attempt"), 70);
  const date = String(row.created_at || "").replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z").replace("T", "-");
  const id = String(row.id || "").slice(0, 8);
  return [exam, part, book, `${exercise}-${date || id}-${id}.mp3`].filter(Boolean).join("/");
}

function asciiSlug(value, maximumLength) {
  const result = value
    .normalize("NFKD")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maximumLength)
    .replace(/-+$/g, "");
  return result || "Attempt";
}

async function pumpZip(writable, zip, env) {
  const writer = writable.getWriter();
  try {
    for (const entry of zip.entries) {
      await writer.write(makeLocalHeader(entry));
      await writeStorageObjectToZip(writer, entry, env);
    }
    for (const entry of zip.entries) {
      await writer.write(makeCentralHeader(entry));
    }
    await writer.write(makeEndOfCentralDirectory(zip.entries.length, zip.centralSize, zip.centralOffset));
    await writer.close();
  } catch (error) {
    try {
      await writer.abort(error);
    } catch (abortError) {
      // The browser may already have disconnected.
    }
    throw error;
  } finally {
    writer.releaseLock();
  }
}

async function writeStorageObjectToZip(writer, entry, env) {
  const response = await supabaseFetch(
    env,
    `/storage/v1/object/authenticated/${encodeURIComponent(BUCKET_NAME)}/${encodeStoragePath(entry.key)}`,
    { method: "GET" },
    30000
  );
  if (!response.ok || !response.body) {
    await discardResponse(response);
    throw new Error(`Storage object unavailable for attempt ${entry.id}`);
  }
  const declared = response.headers.get("Content-Length");
  if (declared !== null && Number(declared) !== entry.size) {
    await response.body.cancel("Stored object length does not match metadata");
    throw new Error(`Storage object length mismatch for attempt ${entry.id}`);
  }

  const reader = response.body.getReader();
  let bytesWritten = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytesWritten += value.byteLength;
      if (bytesWritten > entry.size) throw new Error(`Storage object is too large for attempt ${entry.id}`);
      await writer.write(value);
    }
  } finally {
    reader.releaseLock();
  }
  // CRC-32 and SHA-256 were computed from the validated bytes before the
  // immutable object was uploaded. Recomputing CRC in JavaScript for every
  // export would exceed the Free Worker CPU budget for otherwise streamed
  // batches; retain a strict stored-length check here.
  if (bytesWritten !== entry.size) {
    throw new Error(`Storage object length mismatch for attempt ${entry.id}`);
  }
}

function dosDateTime(input) {
  const valid = input instanceof Date && Number.isFinite(input.getTime()) ? input : new Date("2026-01-01T00:00:00Z");
  const year = Math.min(2107, Math.max(1980, valid.getUTCFullYear()));
  const time = (valid.getUTCHours() << 11) | (valid.getUTCMinutes() << 5) | Math.floor(valid.getUTCSeconds() / 2);
  const day = ((year - 1980) << 9) | ((valid.getUTCMonth() + 1) << 5) | valid.getUTCDate();
  return { time, day };
}

function makeLocalHeader(entry) {
  const { time, day } = dosDateTime(entry.date);
  const bytes = new Uint8Array(30 + entry.nameBytes.length);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, 0x04034B50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 0x0800, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, time, true);
  view.setUint16(12, day, true);
  view.setUint32(14, entry.crc >>> 0, true);
  view.setUint32(18, entry.size, true);
  view.setUint32(22, entry.size, true);
  view.setUint16(26, entry.nameBytes.length, true);
  view.setUint16(28, 0, true);
  bytes.set(entry.nameBytes, 30);
  return bytes;
}

function makeCentralHeader(entry) {
  const { time, day } = dosDateTime(entry.date);
  const bytes = new Uint8Array(46 + entry.nameBytes.length);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, 0x02014B50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint16(8, 0x0800, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, time, true);
  view.setUint16(14, day, true);
  view.setUint32(16, entry.crc >>> 0, true);
  view.setUint32(20, entry.size, true);
  view.setUint32(24, entry.size, true);
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

function inspectMp3(bytes, options = {}) {
  if (!(bytes instanceof Uint8Array) || bytes.byteLength < 512) return null;
  let offset = 0;
  const end = bytes.byteLength;
  const allowedId3Bytes = Number.isSafeInteger(options.maxId3Bytes)
    ? Math.max(0, Math.min(options.maxId3Bytes, ABSOLUTE_MAX_ID3_BYTES))
    : DEFAULT_MAX_ID3_BYTES;
  let metadataBytes = 0;
  let audioBytes = 0;
  let paddingBytes = 0;

  if (end >= 10 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
    const version = bytes[3];
    const flags = bytes[5];
    if (version < 2 || version > 4 || bytes[4] === 0xFF || !validId3Flags(version, flags)) return null;
    if ((bytes[6] | bytes[7] | bytes[8] | bytes[9]) & 0x80) return null;
    const tagSize = (bytes[6] << 21) | (bytes[7] << 14) | (bytes[8] << 7) | bytes[9];
    if (tagSize > allowedId3Bytes) return null;
    const footerBytes = version === 4 && (flags & 0x10) ? 10 : 0;
    offset = 10 + tagSize + footerBytes;
    if (offset >= end) return null;
    metadataBytes = offset;
    if (metadataBytes > Math.floor(end * MAX_ID3_FILE_RATIO)) return null;
  }

  let frames = 0;
  let durationSeconds = 0;
  let streamVersion = null;
  let streamSampleRate = null;

  while (offset < end) {
    if (end - offset === 128 && bytes[offset] === 0x54 && bytes[offset + 1] === 0x41 && bytes[offset + 2] === 0x47) {
      metadataBytes += 128;
      offset = end;
      break;
    }
    if (frames > 0 && end - offset <= MAX_TRAILING_PADDING_BYTES && allZero(bytes, offset, end)) {
      paddingBytes = end - offset;
      offset = end;
      break;
    }
    const frame = parseMp3Frame(bytes, offset);
    if (!frame || offset + frame.length > end) return null;
    if (streamVersion === null) {
      streamVersion = frame.version;
      streamSampleRate = frame.sampleRate;
    } else if (frame.version !== streamVersion || frame.sampleRate !== streamSampleRate) {
      return null;
    }
    frames += 1;
    audioBytes += frame.length;
    durationSeconds += frame.samplesPerFrame / frame.sampleRate;
    offset += frame.length;
  }

  if (offset !== end || frames < MIN_MP3_FRAMES) return null;
  const durationMs = Math.round(durationSeconds * 1000);
  if (!Number.isSafeInteger(durationMs) || durationMs < MIN_MP3_DURATION_MS) return null;
  if (metadataBytes + paddingBytes > Math.floor(end * MAX_ID3_FILE_RATIO)) return null;
  return {
    durationMs,
    frames,
    sampleRate: streamSampleRate,
    audioBytes,
    metadataBytes,
    paddingBytes
  };
}

function validId3Flags(version, flags) {
  if (version === 2) return (flags & 0x3F) === 0;
  if (version === 3) return (flags & 0x1F) === 0;
  return (flags & 0x0F) === 0;
}

function parseMp3Frame(bytes, offset) {
  if (offset + 4 > bytes.byteLength) return null;
  const first = bytes[offset];
  const second = bytes[offset + 1];
  const third = bytes[offset + 2];
  const fourth = bytes[offset + 3];
  if (first !== 0xFF || (second & 0xE0) !== 0xE0) return null;

  const versionBits = (second >> 3) & 0x03;
  const layerBits = (second >> 1) & 0x03;
  if (versionBits === 0x01 || layerBits !== 0x01) return null;
  const bitrateIndex = (third >> 4) & 0x0F;
  const sampleRateIndex = (third >> 2) & 0x03;
  if (bitrateIndex === 0 || bitrateIndex === 15 || sampleRateIndex === 3) return null;
  if ((fourth & 0x03) === 0x02) return null;

  const version = versionBits === 3 ? 1 : (versionBits === 2 ? 2 : 2.5);
  const mpeg1Rates = [44100, 48000, 32000];
  const divisor = version === 1 ? 1 : (version === 2 ? 2 : 4);
  const sampleRate = mpeg1Rates[sampleRateIndex] / divisor;
  const mpeg1Bitrates = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
  const mpeg2Bitrates = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0];
  const bitrateKbps = (version === 1 ? mpeg1Bitrates : mpeg2Bitrates)[bitrateIndex];
  const padding = (third >> 1) & 0x01;
  const coefficient = version === 1 ? 144000 : 72000;
  const length = Math.floor((coefficient * bitrateKbps) / sampleRate) + padding;
  if (!Number.isInteger(length) || length < 24) return null;
  return {
    version,
    sampleRate,
    samplesPerFrame: version === 1 ? 1152 : 576,
    length
  };
}

function allZero(bytes, start, end) {
  for (let index = start; index < end; index += 1) {
    if (bytes[index] !== 0) return false;
  }
  return true;
}

function bytesToHex(bytes) {
  let value = "";
  for (const byte of bytes) value += byte.toString(16).padStart(2, "0");
  return value;
}

function buildCrc32Tables() {
  const tables = Array.from({ length: 8 }, () => new Uint32Array(256));
  const table = tables[0];
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = (value & 1) ? (0xEDB88320 ^ (value >>> 1)) : (value >>> 1);
    }
    table[index] = value >>> 0;
  }
  for (let tableIndex = 1; tableIndex < tables.length; tableIndex += 1) {
    const previous = tables[tableIndex - 1];
    const current = tables[tableIndex];
    for (let index = 0; index < 256; index += 1) {
      const value = previous[index];
      current[index] = (table[value & 0xFF] ^ (value >>> 8)) >>> 0;
    }
  }
  return tables;
}

function crc32Update(state, bytes) {
  let value = state >>> 0;
  let index = 0;
  const [table0, table1, table2, table3, table4, table5, table6, table7] = CRC32_TABLES;
  for (; index + 8 <= bytes.length; index += 8) {
    value ^= (
      bytes[index]
      | (bytes[index + 1] << 8)
      | (bytes[index + 2] << 16)
      | (bytes[index + 3] << 24)
    );
    value = (
      table7[value & 0xFF]
      ^ table6[(value >>> 8) & 0xFF]
      ^ table5[(value >>> 16) & 0xFF]
      ^ table4[(value >>> 24) & 0xFF]
      ^ table3[bytes[index + 4]]
      ^ table2[bytes[index + 5]]
      ^ table1[bytes[index + 6]]
      ^ table0[bytes[index + 7]]
    ) >>> 0;
  }
  for (; index < bytes.length; index += 1) {
    value = table0[(value ^ bytes[index]) & 0xFF] ^ (value >>> 8);
  }
  return value >>> 0;
}

function crc32(bytes) {
  return (crc32Update(0xFFFFFFFF, bytes) ^ 0xFFFFFFFF) >>> 0;
}
