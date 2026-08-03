const SERVICE_NAME = "edmund-student-progress";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CONTROL_RE = /[\u0000-\u001f\u007f]/;
const MAX_LOGIN_BODY_BYTES = 4096;
const RPC_TIMEOUT_MS = 30000;
const decoder = new TextDecoder("utf-8", { fatal: true });

export default {
  async fetch(request, env) {
    try {
      return await route(request, env);
    } catch (error) {
      if (error instanceof HttpError) {
        return json({ error: error.message, code: error.code }, error.status, request, env);
      }
      console.error("Student Progress Worker request failed", safeErrorMessage(error));
      return json(
        { error: "Student progress service error", code: "SERVICE_ERROR" },
        500,
        request,
        env
      );
    }
  }
};

async function route(request, env) {
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
        snapshot: "transactional",
        rateLimiters: {
          adminLogin: rateLimiterConfigured(env.ADMIN_LOGIN_RATE_LIMITER)
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
  if (url.pathname === "/v1/progress" && request.method === "GET") {
    return studentProgress(request, env);
  }
  if (url.pathname === "/v1/admin/students" && request.method === "GET") {
    return adminStudents(request, env);
  }

  const progressMatch = url.pathname.match(
    /^\/v1\/admin\/students\/([0-9a-f-]{36})\/progress$/i
  );
  if (progressMatch && request.method === "GET") {
    return adminStudentProgress(request, env, progressMatch[1]);
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

function securityHeaders() {
  return new Headers({
    "Cache-Control": "no-store",
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
    "Cross-Origin-Resource-Policy": "cross-origin",
    "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY"
  });
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
        && !parsed.username
        && !parsed.password
        && !parsed.search
        && !parsed.hash
      ) {
        origins.add(parsed.origin);
      }
    } catch {
      // Ignore invalid entries. Configuration validation fails closed if none remain.
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
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Max-Age", "600");
  headers.set("Vary", "Origin");
  if (isAllowedOrigin(origin, env)) headers.set("Access-Control-Allow-Origin", origin);
  return headers;
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

function rateLimiterConfigured(binding) {
  return Boolean(binding && typeof binding.limit === "function");
}

function supabaseServerKey(env) {
  return String(env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
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

function isConfigured(env) {
  try {
    supabaseOrigin(env);
    if (supabaseServerKey(env).length < 32) return false;
    if (configuredOrigins(env).size < 1) return false;
    if (!rateLimiterConfigured(env.ADMIN_LOGIN_RATE_LIMITER)) return false;
    return true;
  } catch {
    return false;
  }
}

function assertConfigured(env) {
  if (!isConfigured(env)) {
    throw new HttpError(503, "NOT_CONFIGURED", "Student progress service is not configured");
  }
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
  } catch {
    throw new HttpError(400, "INVALID_JSON", "Invalid JSON request");
  }
}

function bearerToken(request) {
  const authorization = request.headers.get("Authorization") || "";
  const match = authorization.match(/^Bearer\s+([^\s]+)$/i);
  if (!match || !UUID_RE.test(match[1])) return null;
  return match[1].toLowerCase();
}

async function supabaseFetch(env, path, options = {}) {
  const key = supabaseServerKey(env);
  const headers = new Headers(options.headers || {});
  headers.set("apikey", key);
  if (key.startsWith("sb_secret_")) {
    headers.delete("Authorization");
  } else {
    headers.set("Authorization", `Bearer ${key}`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort("Supabase request timed out"), RPC_TIMEOUT_MS);
  try {
    return await fetch(`${supabaseOrigin(env)}${path}`, {
      ...options,
      headers,
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
    throw new HttpError(
      502,
      "SUPABASE_UNAVAILABLE",
      "Student progress data service is temporarily unavailable"
    );
  }
  if (!response.ok) {
    console.error("Supabase RPC rejected", functionName, response.status);
    try { await response.arrayBuffer(); } catch { /* Discard upstream details. */ }
    throw new HttpError(
      502,
      "SUPABASE_UNAVAILABLE",
      "Student progress data service is temporarily unavailable"
    );
  }
  try {
    return await response.json();
  } catch {
    throw new HttpError(
      502,
      "INVALID_UPSTREAM_RESPONSE",
      "Student progress data service returned an invalid response"
    );
  }
}

function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasOnlyKeys(value, allowed) {
  return isPlainObject(value) && Object.keys(value).every(key => allowed.has(key));
}

function singleRow(value) {
  return Array.isArray(value) && value.length === 1 && isPlainObject(value[0]) ? value[0] : null;
}

function unwrapSnapshot(value, expectedStudentId) {
  let candidate = value;
  if (Array.isArray(candidate)) {
    if (candidate.length !== 1 || !isPlainObject(candidate[0])) return null;
    candidate = candidate[0];
  }
  if (isPlainObject(candidate) && Object.prototype.hasOwnProperty.call(candidate, "snapshot")) {
    candidate = candidate.snapshot;
  }
  if (!isPlainObject(candidate) || !isPlainObject(candidate.student) || !isPlainObject(candidate.sources)) {
    return null;
  }
  const studentId = String(candidate.student.id || "").toLowerCase();
  if (!UUID_RE.test(studentId) || studentId !== expectedStudentId.toLowerCase()) return null;
  return candidate;
}

async function authenticateStudent(request, env) {
  const token = bearerToken(request);
  if (!token) return null;
  const row = singleRow(await rpc(env, "student_progress_student_me", { p_token: token }));
  if (!row || !UUID_RE.test(String(row.id || ""))) return null;
  return {
    id: String(row.id).toLowerCase(),
    name: String(row.name || ""),
    expiresAt: String(row.session_expires_at || ""),
    token
  };
}

async function authenticateAdmin(request, env) {
  const token = bearerToken(request);
  if (!token) return null;
  const row = singleRow(await rpc(env, "student_progress_admin_me", { p_admin_token: token }));
  if (!row || !UUID_RE.test(String(row.id || ""))) return null;
  return {
    id: String(row.id).toLowerCase(),
    name: String(row.name || ""),
    expiresAt: String(row.expires_at || ""),
    token
  };
}

async function adminLogin(request, env) {
  if (!rateLimiterConfigured(env.ADMIN_LOGIN_RATE_LIMITER)) {
    throw new HttpError(503, "RATE_LIMIT_NOT_CONFIGURED", "Admin login is not configured");
  }

  const clientIp = String(request.headers.get("CF-Connecting-IP") || "missing-client-ip").slice(0, 80);
  let result;
  try {
    result = await env.ADMIN_LOGIN_RATE_LIMITER.limit({
      key: `student-progress-admin:${clientIp}`
    });
  } catch {
    throw new HttpError(503, "RATE_LIMIT_UNAVAILABLE", "Admin login is temporarily unavailable");
  }
  if (!result.success) {
    throw new HttpError(429, "TOO_MANY_ATTEMPTS", "Too many login attempts");
  }

  const payload = await readLimitedJson(request, MAX_LOGIN_BODY_BYTES);
  const username = String(payload?.username ?? payload?.name ?? "").trim();
  const password = String(payload?.password ?? "");
  if (
    !isPlainObject(payload)
    || !hasOnlyKeys(payload, new Set(["username", "name", "password"]))
    || !username
    || username.length > 100
    || CONTROL_RE.test(username)
    || !password
    || password.length > 200
  ) {
    throw new HttpError(400, "INVALID_LOGIN_REQUEST", "Invalid login request");
  }

  const row = singleRow(await rpc(env, "student_progress_admin_login", {
    p_name: username,
    p_password: password
  }));
  if (!row || !UUID_RE.test(String(row.admin_token || ""))) {
    throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid username or password");
  }
  if (!UUID_RE.test(String(row.admin_id || ""))) {
    throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Administrator login returned invalid data");
  }

  return json(
    {
      admin: {
        id: String(row.admin_id).toLowerCase(),
        adminToken: String(row.admin_token).toLowerCase(),
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
  const admin = await authenticateAdmin(request, env);
  if (!admin) throw new HttpError(401, "ADMIN_AUTH_REQUIRED", "Administrator authentication required");
  await rpc(env, "student_progress_admin_logout", { p_admin_token: admin.token });
  return emptyResponse(204, request, env);
}

async function studentMe(request, env) {
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  return json(
    { student: { id: student.id, name: student.name, expiresAt: student.expiresAt } },
    200,
    request,
    env
  );
}

async function studentProgress(request, env) {
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  const rows = await rpc(env, "student_progress_student_snapshot", { p_token: student.token });
  const snapshot = unwrapSnapshot(rows, student.id);
  if (!snapshot) {
    throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Progress snapshot returned invalid data");
  }
  return json({ snapshot }, 200, request, env);
}

async function adminStudents(request, env) {
  const admin = await authenticateAdmin(request, env);
  if (!admin) throw new HttpError(401, "ADMIN_AUTH_REQUIRED", "Administrator authentication required");
  const rows = await rpc(env, "student_progress_admin_students", {
    p_admin_token: admin.token
  });
  if (!Array.isArray(rows)) {
    throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Student list returned invalid data");
  }
  const students = rows.map(row => {
    const id = String(row?.id || "").toLowerCase();
    if (!isPlainObject(row) || !UUID_RE.test(id)) {
      throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Student list returned invalid data");
    }
    return {
      id,
      name: String(row.name || ""),
      createdAt: String(row.created_at || ""),
      updatedAt: String(row.updated_at || "")
    };
  });
  return json({ students }, 200, request, env);
}

async function adminStudentProgress(request, env, studentId) {
  if (!UUID_RE.test(studentId)) {
    throw new HttpError(404, "STUDENT_NOT_FOUND", "Student not found");
  }
  const admin = await authenticateAdmin(request, env);
  if (!admin) throw new HttpError(401, "ADMIN_AUTH_REQUIRED", "Administrator authentication required");
  const normalizedStudentId = studentId.toLowerCase();
  const rows = await rpc(env, "student_progress_admin_snapshot", {
    p_admin_token: admin.token,
    p_student_id: normalizedStudentId
  });
  if (Array.isArray(rows) && rows.length === 0) {
    throw new HttpError(404, "STUDENT_NOT_FOUND", "Student not found");
  }
  const snapshot = unwrapSnapshot(rows, normalizedStudentId);
  if (!snapshot) {
    throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Progress snapshot returned invalid data");
  }
  return json({ snapshot }, 200, request, env);
}
