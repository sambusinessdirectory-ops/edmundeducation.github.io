import {
  GRAMMAR_AI_ENGINE,
  GRAMMAR_AI_MODEL,
  GRAMMAR_AI_REPAIR_MODEL,
  GRAMMAR_AI_VERSION,
  grammarAiConfigured,
  normalizeGrammarCheckPayload,
  runGrammarAi
} from "./grammar-ai.js";

const SERVICE_NAME = "edmund-writing-submission";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256_RE = /^[0-9a-f]{64}$/;
const CONTROL_RE = /[\u0000-\u001f\u007f]/;
const TEXT_CONTROL_RE = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;
const MAX_LOGIN_BODY_BYTES = 4096;
const MAX_GRAMMAR_CHECK_BODY_BYTES = 12 * 1024;
const MAX_SUBMISSION_BODY_BYTES = 512 * 1024;
const MAX_ISSUE_BATCH_BODY_BYTES = 512 * 1024;
const MAX_TOPIC_CHARACTERS = 4000;
const MAX_TOPIC_BYTES = 16000;
const MAX_ANSWER_CHARACTERS = 100000;
const MAX_ANSWER_BYTES = 400000;
const MAX_OCCURRENCES_PER_BATCH = 50;
const MAX_OCCURRENCES_PER_DOCUMENT_RESPONSE = 2000;
const MAX_PAGE_SIZE = 100;
const MAX_ADMIN_PAGE_SIZE = 100;
const decoder = new TextDecoder("utf-8", { fatal: true });
const encoder = new TextEncoder();

export default {
  async fetch(request, env) {
    try {
      return await route(request, env);
    } catch (error) {
      if (error instanceof HttpError) {
        return json({ error: error.message, code: error.code }, error.status, request, env);
      }
      console.error("Writing Submission Worker request failed", safeErrorMessage(error));
      return json(
        { error: "Writing Submission service error", code: "SERVICE_ERROR" },
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
        limits: {
          maxTopicCharacters: MAX_TOPIC_CHARACTERS,
          maxAnswerCharacters: MAX_ANSWER_CHARACTERS,
          maxGrammarOccurrencesPerBatch: MAX_OCCURRENCES_PER_BATCH,
          maxPageSize: MAX_PAGE_SIZE
        },
        rateLimiters: {
          adminLogin: rateLimiterConfigured(env.ADMIN_LOGIN_RATE_LIMITER),
          submissionWrite: rateLimiterConfigured(env.SUBMISSION_WRITE_RATE_LIMITER),
          grammarWrite: rateLimiterConfigured(env.GRAMMAR_WRITE_RATE_LIMITER),
          grammarCheck: rateLimiterConfigured(env.GRAMMAR_CHECK_RATE_LIMITER)
        },
        grammarAi: {
          configured: grammarAiConfigured(env),
          version: GRAMMAR_AI_VERSION,
          model: GRAMMAR_AI_MODEL,
          repairModel: GRAMMAR_AI_REPAIR_MODEL
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
  if (url.pathname === "/v1/grammar-check" && request.method === "POST") {
    return grammarCheck(request, env);
  }

  if (url.pathname === "/v1/submissions" && request.method === "GET") {
    return listSubmissions(request, env, url);
  }
  const submissionMatch = url.pathname.match(/^\/v1\/submissions\/([0-9a-f-]{36})$/i);
  if (submissionMatch && request.method === "GET") {
    return getSubmission(request, env, submissionMatch[1]);
  }
  if (submissionMatch && request.method === "PUT") {
    return putSubmission(request, env, submissionMatch[1]);
  }

  if (url.pathname === "/v1/grammar-occurrences/batch" && request.method === "POST") {
    return postOccurrenceBatch(request, env);
  }
  if (url.pathname === "/v1/grammar-problems" && request.method === "GET") {
    return getGrammarProblems(request, env);
  }

  if (url.pathname === "/v1/admin/students" && request.method === "GET") {
    return listAdminStudents(request, env);
  }
  if (url.pathname === "/v1/admin/submissions" && request.method === "GET") {
    return listAdminSubmissions(request, env, url);
  }
  const adminSubmissionMatch = url.pathname.match(/^\/v1\/admin\/submissions\/([0-9a-f-]{36})$/i);
  if (adminSubmissionMatch && request.method === "GET") {
    return getAdminSubmission(request, env, adminSubmissionMatch[1]);
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
      // Invalid values are ignored, causing configuration to fail closed.
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
  headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
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
    if (!rateLimiterConfigured(env.SUBMISSION_WRITE_RATE_LIMITER)) return false;
    if (!rateLimiterConfigured(env.GRAMMAR_WRITE_RATE_LIMITER)) return false;
    return true;
  } catch {
    return false;
  }
}

function assertConfigured(env) {
  if (!isConfigured(env)) {
    throw new HttpError(503, "NOT_CONFIGURED", "Writing Submission service is not configured");
  }
}

function assertJsonContentType(request) {
  const contentType = String(request.headers.get("Content-Type") || "")
    .split(";", 1)[0]
    .trim()
    .toLowerCase();
  if (contentType !== "application/json") {
    throw new HttpError(415, "UNSUPPORTED_MEDIA_TYPE", "Content-Type must be application/json");
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
  assertJsonContentType(request);
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

async function supabaseFetch(env, path, options = {}, timeoutMs = 20000) {
  const key = supabaseServerKey(env);
  const headers = new Headers(options.headers || {});
  headers.set("apikey", key);
  if (key.startsWith("sb_secret_")) {
    headers.delete("Authorization");
  } else {
    headers.set("Authorization", `Bearer ${key}`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort("Supabase request timed out"), timeoutMs);
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
      "Writing Submission data service is temporarily unavailable"
    );
  }
  if (!response.ok) {
    console.error("Supabase RPC rejected", functionName, response.status);
    try { await response.arrayBuffer(); } catch { /* Discard upstream details. */ }
    throw new HttpError(
      502,
      "SUPABASE_UNAVAILABLE",
      "Writing Submission data service is temporarily unavailable"
    );
  }
  try {
    return await response.json();
  } catch {
    throw new HttpError(
      502,
      "INVALID_UPSTREAM_RESPONSE",
      "Writing Submission data service returned an invalid response"
    );
  }
}

function singleRow(value) {
  return Array.isArray(value) && value.length === 1 ? value[0] : null;
}

async function authenticateStudent(request, env) {
  const token = bearerToken(request);
  if (!token) return null;
  const row = singleRow(await rpc(env, "writing_submission_student_profile", { p_token: token }));
  if (!row || !UUID_RE.test(String(row.id || ""))) return null;
  return {
    kind: "student",
    id: String(row.id).toLowerCase(),
    name: String(row.name || ""),
    expiresAt: String(row.session_expires_at || ""),
    token
  };
}

async function authenticateAdmin(request, env) {
  const token = bearerToken(request);
  if (!token) return null;
  const row = singleRow(await rpc(env, "writing_submission_admin_me", { p_admin_token: token }));
  if (!row || !UUID_RE.test(String(row.id || ""))) return null;
  return {
    kind: "admin",
    id: String(row.id).toLowerCase(),
    name: String(row.name || ""),
    expiresAt: String(row.expires_at || ""),
    token
  };
}

async function enforceRateLimit(binding, key, unavailableMessage, exceededCode, exceededMessage) {
  if (!rateLimiterConfigured(binding)) {
    throw new HttpError(503, "RATE_LIMIT_NOT_CONFIGURED", unavailableMessage);
  }
  let result;
  try {
    result = await binding.limit({ key });
  } catch {
    throw new HttpError(503, "RATE_LIMIT_UNAVAILABLE", unavailableMessage);
  }
  if (!result.success) throw new HttpError(429, exceededCode, exceededMessage);
}

async function grammarCheck(request, env) {
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");

  await enforceRateLimit(
    env.GRAMMAR_CHECK_RATE_LIMITER,
    `writing-submission-grammar-check:${student.id}`,
    "Advanced grammar checking is temporarily unavailable",
    "TOO_MANY_GRAMMAR_CHECKS",
    "Too many grammar checks; please wait and try again"
  );

  let sentence;
  try {
    sentence = normalizeGrammarCheckPayload(
      await readLimitedJson(request, MAX_GRAMMAR_CHECK_BODY_BYTES)
    );
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, "INVALID_GRAMMAR_CHECK", "Invalid grammar check request");
  }

  if (!grammarAiConfigured(env)) {
    throw new HttpError(
      503,
      "GRAMMAR_CHECK_UNAVAILABLE",
      "Advanced grammar checking is temporarily unavailable"
    );
  }

  let issues;
  try {
    issues = await runGrammarAi(sentence, env);
  } catch (error) {
    // Student text and provider output must never appear in logs.
    const inconclusive = error?.code === "GRAMMAR_AI_INCONCLUSIVE";
    console.error(inconclusive
      ? "Writing Submission grammar result was inconclusive"
      : "Writing Submission grammar provider failed");
    throw new HttpError(
      inconclusive ? 502 : 503,
      inconclusive ? "GRAMMAR_CHECK_INCONCLUSIVE" : "GRAMMAR_CHECK_UNAVAILABLE",
      inconclusive
        ? "Advanced grammar checking could not safely analyse this sentence"
        : "Advanced grammar checking is temporarily unavailable"
    );
  }

  return json({ engine: GRAMMAR_AI_ENGINE, issues }, 200, request, env);
}

async function adminLogin(request, env) {
  const clientIp = String(request.headers.get("CF-Connecting-IP") || "missing-client-ip").slice(0, 80);
  await enforceRateLimit(
    env.ADMIN_LOGIN_RATE_LIMITER,
    `writing-submission-admin:${clientIp}`,
    "Admin login is temporarily unavailable",
    "TOO_MANY_ATTEMPTS",
    "Too many login attempts"
  );

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

  const row = singleRow(await rpc(env, "writing_submission_admin_login", {
    p_name: username,
    p_password: password
  }));
  if (!row || !UUID_RE.test(String(row.admin_token || ""))) {
    throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid username or password");
  }

  return json({
    admin: {
      id: String(row.admin_id || ""),
      adminToken: String(row.admin_token),
      name: String(row.name || ""),
      expiresAt: String(row.expires_at || "")
    }
  }, 200, request, env);
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
  await rpc(env, "writing_submission_admin_logout", { p_admin_token: admin.token });
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

function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasExactKeys(value, expected) {
  if (!isPlainObject(value)) return false;
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  return actual.length === wanted.length && actual.every((key, index) => key === wanted[index]);
}

function hasOnlyKeys(value, allowed) {
  return isPlainObject(value) && Object.keys(value).every(key => allowed.has(key));
}

function utf8Length(value) {
  return encoder.encode(value).byteLength;
}

function normalizeWritingText(value, label, maxCharacters, maxBytes) {
  if (typeof value !== "string") {
    throw new HttpError(400, "INVALID_SUBMISSION", `${label} must be text`);
  }
  const normalized = value.replace(/\r\n?/g, "\n");
  if (
    !normalized.trim()
    || normalized.length > maxCharacters
    || utf8Length(normalized) > maxBytes
    || TEXT_CONTROL_RE.test(normalized)
  ) {
    throw new HttpError(400, "INVALID_SUBMISSION", `${label} is invalid`);
  }
  return normalized;
}

function wordCount(value) {
  const trimmed = value.trim();
  return trimmed ? trimmed.split(/\s+/u).length : 0;
}

function normalizeSubmissionPayload(payload) {
  if (!hasExactKeys(payload, ["topic", "answer"])) {
    throw new HttpError(400, "INVALID_SUBMISSION", "Submission payload has an invalid shape");
  }
  const topic = normalizeWritingText(
    payload.topic,
    "topic",
    MAX_TOPIC_CHARACTERS,
    MAX_TOPIC_BYTES
  );
  const answer = normalizeWritingText(
    payload.answer,
    "answer",
    MAX_ANSWER_CHARACTERS,
    MAX_ANSWER_BYTES
  );
  const words = wordCount(answer);
  if (words < 1 || words > 50000) {
    throw new HttpError(400, "INVALID_SUBMISSION", "answer has an invalid word count");
  }
  return { topic, answer, wordCount: words };
}

function submissionResponse(row) {
  const response = {
    id: String(row.id || ""),
    topic: String(row.topic || ""),
    wordCount: Number(row.word_count || 0),
    submittedAt: String(row.submitted_at || "")
  };
  if (Object.prototype.hasOwnProperty.call(row, "answer")) {
    response.answer = String(row.answer || "");
  }
  if (Object.prototype.hasOwnProperty.call(row, "answer_preview")) {
    response.answerPreview = String(row.answer_preview || "");
  }
  if (Object.prototype.hasOwnProperty.call(row, "student_id")) {
    response.studentId = String(row.student_id || "");
    response.studentName = String(row.student_name || "");
  }
  return response;
}

function positiveIntegerParameter(value, fallback, minimum, maximum, label) {
  if (value === null || value === "") return fallback;
  if (!/^[0-9]+$/.test(value)) {
    throw new HttpError(400, "INVALID_PAGE", `${label} is invalid`);
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new HttpError(400, "INVALID_PAGE", `${label} is invalid`);
  }
  return parsed;
}

function pageParameters(url, maximumPageSize) {
  const page = positiveIntegerParameter(url.searchParams.get("page"), 1, 1, 10000, "page");
  const pageSize = positiveIntegerParameter(
    url.searchParams.get("pageSize"),
    20,
    1,
    maximumPageSize,
    "pageSize"
  );
  const offset = (page - 1) * pageSize;
  if (!Number.isSafeInteger(offset) || offset > 1000000) {
    throw new HttpError(400, "INVALID_PAGE", "page is outside the supported range");
  }
  return { page, pageSize, offset };
}

async function listSubmissions(request, env, url) {
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  const { page, pageSize, offset } = pageParameters(url, MAX_PAGE_SIZE);
  const rows = await rpc(env, "writing_submission_list", {
    p_student_id: student.id,
    p_limit: pageSize + 1,
    p_offset: offset
  });
  if (!Array.isArray(rows)) {
    throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Submission history returned an invalid response");
  }
  const hasMore = rows.length > pageSize;
  return json({
    submissions: rows.slice(0, pageSize).map(submissionResponse),
    page,
    pageSize,
    hasMore
  }, 200, request, env);
}

async function getSubmission(request, env, submissionId) {
  if (!UUID_RE.test(submissionId)) {
    throw new HttpError(404, "SUBMISSION_NOT_FOUND", "Submission not found");
  }
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  const normalizedId = submissionId.toLowerCase();
  const row = singleRow(await rpc(env, "writing_submission_get", {
    p_student_id: student.id,
    p_id: normalizedId
  }));
  if (!row) throw new HttpError(404, "SUBMISSION_NOT_FOUND", "Submission not found");
  const occurrenceRows = await rpc(env, "writing_submission_list_occurrences", {
    p_student_id: student.id,
    p_document_id: normalizedId,
    p_limit: MAX_OCCURRENCES_PER_DOCUMENT_RESPONSE
  });
  if (!Array.isArray(occurrenceRows)) {
    throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Grammar history returned an invalid response");
  }
  return json({
    submission: submissionResponse(row),
    grammarOccurrences: occurrenceRows.map(occurrenceResponse)
  }, 200, request, env);
}

async function putSubmission(request, env, submissionId) {
  if (!UUID_RE.test(submissionId)) {
    throw new HttpError(404, "SUBMISSION_NOT_FOUND", "Submission not found");
  }
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  await enforceRateLimit(
    env.SUBMISSION_WRITE_RATE_LIMITER,
    `writing-submission-submit:${student.id}`,
    "Submission saving is temporarily unavailable",
    "TOO_MANY_SUBMISSION_WRITES",
    "Too many submission attempts; please wait and try again"
  );
  const payload = normalizeSubmissionPayload(
    await readLimitedJson(request, MAX_SUBMISSION_BODY_BYTES)
  );
  const row = singleRow(await rpc(env, "writing_submission_submit", {
    p_id: submissionId.toLowerCase(),
    p_student_id: student.id,
    p_topic: payload.topic,
    p_answer: payload.answer,
    p_word_count: payload.wordCount
  }));
  if (!row) {
    throw new HttpError(409, "SUBMISSION_LIMIT_REACHED", "Submission could not be saved");
  }
  return json({ submission: submissionResponse(row) }, 200, request, env);
}

function validateClientTimestamp(value, label) {
  if (typeof value !== "string" || value.length < 20 || value.length > 40 || CONTROL_RE.test(value)) {
    throw new HttpError(400, "INVALID_GRAMMAR_BATCH", `${label} is invalid`);
  }
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    throw new HttpError(400, "INVALID_GRAMMAR_BATCH", `${label} is invalid`);
  }
}

function boundedOccurrenceText(value, label, maximumCharacters, allowEmpty = false) {
  if (typeof value !== "string") {
    throw new HttpError(400, "INVALID_GRAMMAR_BATCH", `${label} must be text`);
  }
  const normalized = value.replace(/\r\n?/g, "\n");
  if (
    (!allowEmpty && !normalized.trim())
    || normalized.length > maximumCharacters
    || utf8Length(normalized) > maximumCharacters * 4
    || TEXT_CONTROL_RE.test(normalized)
  ) {
    throw new HttpError(400, "INVALID_GRAMMAR_BATCH", `${label} is invalid`);
  }
  return normalized;
}

function normalizeOccurrenceBatch(payload) {
  if (!hasExactKeys(payload, ["documentId", "occurrences"])) {
    throw new HttpError(400, "INVALID_GRAMMAR_BATCH", "Grammar batch has an invalid shape");
  }
  const documentId = String(payload.documentId || "").toLowerCase();
  if (!UUID_RE.test(documentId)) {
    throw new HttpError(400, "INVALID_GRAMMAR_BATCH", "documentId is invalid");
  }
  if (
    !Array.isArray(payload.occurrences)
    || payload.occurrences.length < 1
    || payload.occurrences.length > MAX_OCCURRENCES_PER_BATCH
  ) {
    throw new HttpError(
      400,
      "INVALID_GRAMMAR_BATCH",
      `occurrences must contain 1 to ${MAX_OCCURRENCES_PER_BATCH} items`
    );
  }

  const ids = new Set();
  const fingerprints = new Set();
  const detectedAt = new Date().toISOString();
  const occurrences = payload.occurrences.map((item, index) => {
    if (!hasExactKeys(item, [
      "id", "fingerprint", "ruleId", "title", "message",
      "originalText", "suggestedText", "sentenceText", "detectedAt"
    ])) {
      throw new HttpError(400, "INVALID_GRAMMAR_BATCH", `occurrences[${index}] has an invalid shape`);
    }
    const id = String(item.id || "").toLowerCase();
    const fingerprint = String(item.fingerprint || "").toLowerCase();
    if (!UUID_RE.test(id) || !SHA256_RE.test(fingerprint)) {
      throw new HttpError(400, "INVALID_GRAMMAR_BATCH", `occurrences[${index}] has an invalid identifier`);
    }
    if (ids.has(id) || fingerprints.has(fingerprint)) {
      throw new HttpError(400, "INVALID_GRAMMAR_BATCH", "Grammar batch contains a duplicate occurrence");
    }
    ids.add(id);
    fingerprints.add(fingerprint);

    const ruleId = boundedOccurrenceText(item.ruleId, `occurrences[${index}].ruleId`, 120);
    if (CONTROL_RE.test(ruleId)) {
      throw new HttpError(400, "INVALID_GRAMMAR_BATCH", `occurrences[${index}].ruleId is invalid`);
    }
    const title = boundedOccurrenceText(item.title, `occurrences[${index}].title`, 200);
    if (CONTROL_RE.test(title)) {
      throw new HttpError(400, "INVALID_GRAMMAR_BATCH", `occurrences[${index}].title is invalid`);
    }
    const originalText = boundedOccurrenceText(
      item.originalText,
      `occurrences[${index}].originalText`,
      2000,
      true
    );
    const suggestedText = boundedOccurrenceText(
      item.suggestedText,
      `occurrences[${index}].suggestedText`,
      2000,
      true
    );
    if (!originalText && !suggestedText) {
      throw new HttpError(400, "INVALID_GRAMMAR_BATCH", "An occurrence needs original or suggested text");
    }
    validateClientTimestamp(item.detectedAt, `occurrences[${index}].detectedAt`);
    return {
      id,
      fingerprint,
      ruleId,
      title,
      message: boundedOccurrenceText(item.message, `occurrences[${index}].message`, 2000),
      originalText,
      suggestedText,
      sentenceText: boundedOccurrenceText(item.sentenceText, `occurrences[${index}].sentenceText`, 10000),
      detectedAt
    };
  });

  return { documentId, occurrences };
}

function occurrenceResponse(row) {
  return {
    id: String(row.id || ""),
    documentId: String(row.document_id || ""),
    fingerprint: String(row.fingerprint || ""),
    ruleId: String(row.rule_id || ""),
    title: String(row.title || ""),
    message: String(row.message || ""),
    originalText: String(row.original_text || ""),
    suggestedText: String(row.suggested_text || ""),
    sentenceText: String(row.sentence_text || ""),
    detectedAt: String(row.detected_at || "")
  };
}

async function postOccurrenceBatch(request, env) {
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  await enforceRateLimit(
    env.GRAMMAR_WRITE_RATE_LIMITER,
    `writing-submission-grammar:${student.id}`,
    "Grammar history saving is temporarily unavailable",
    "TOO_MANY_GRAMMAR_WRITES",
    "Too many grammar updates; please wait and try again"
  );
  const payload = normalizeOccurrenceBatch(
    await readLimitedJson(request, MAX_ISSUE_BATCH_BODY_BYTES)
  );
  const row = singleRow(await rpc(env, "writing_submission_record_issue_batch", {
    p_student_id: student.id,
    p_document_id: payload.documentId,
    p_occurrences: payload.occurrences
  }));
  if (!row) {
    throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Grammar history returned an invalid response");
  }
  return json({
    acceptedCount: Number(row.accepted_count || 0),
    insertedCount: Number(row.inserted_count || 0)
  }, 200, request, env);
}

async function getGrammarProblems(request, env) {
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  const rows = await rpc(env, "writing_submission_problem_summary", { p_student_id: student.id });
  if (!Array.isArray(rows)) {
    throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Grammar summary returned an invalid response");
  }
  return json({
    grammarProblems: rows.map(row => ({
      ruleId: String(row.rule_id || ""),
      title: String(row.title || ""),
      occurrenceCount: Number(row.occurrence_count || 0),
      firstSeenAt: String(row.first_seen_at || ""),
      lastSeenAt: String(row.last_seen_at || "")
    }))
  }, 200, request, env);
}

async function listAdminStudents(request, env) {
  const admin = await authenticateAdmin(request, env);
  if (!admin) throw new HttpError(401, "ADMIN_AUTH_REQUIRED", "Administrator authentication required");
  const rows = await rpc(env, "writing_submission_admin_list_students", {
    p_admin_token: admin.token
  });
  if (!Array.isArray(rows)) {
    throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Student list returned an invalid response");
  }
  return json({
    students: rows.map(row => ({
      id: String(row.id || ""),
      name: String(row.name || ""),
      submissionCount: Number(row.submission_count || 0),
      grammarOccurrenceCount: Number(row.grammar_occurrence_count || 0),
      grammarRuleCount: Number(row.grammar_rule_count || 0),
      lastSubmissionAt: row.last_submission_at ? String(row.last_submission_at) : null
    }))
  }, 200, request, env);
}

async function listAdminSubmissions(request, env, url) {
  const admin = await authenticateAdmin(request, env);
  if (!admin) throw new HttpError(401, "ADMIN_AUTH_REQUIRED", "Administrator authentication required");
  const { page, pageSize, offset } = pageParameters(url, MAX_ADMIN_PAGE_SIZE);
  const rawStudentId = url.searchParams.get("studentId");
  const studentId = rawStudentId === null || rawStudentId === ""
    ? null
    : rawStudentId.toLowerCase();
  if (studentId !== null && !UUID_RE.test(studentId)) {
    throw new HttpError(400, "INVALID_STUDENT", "studentId is invalid");
  }
  const rows = await rpc(env, "writing_submission_admin_list_submissions", {
    p_admin_token: admin.token,
    p_student_id: studentId,
    p_limit: pageSize + 1,
    p_offset: offset
  });
  if (!Array.isArray(rows)) {
    throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Submission list returned an invalid response");
  }
  const hasMore = rows.length > pageSize;
  return json({
    submissions: rows.slice(0, pageSize).map(submissionResponse),
    page,
    pageSize,
    hasMore
  }, 200, request, env);
}

async function getAdminSubmission(request, env, submissionId) {
  if (!UUID_RE.test(submissionId)) {
    throw new HttpError(404, "SUBMISSION_NOT_FOUND", "Submission not found");
  }
  const admin = await authenticateAdmin(request, env);
  if (!admin) throw new HttpError(401, "ADMIN_AUTH_REQUIRED", "Administrator authentication required");
  const normalizedId = submissionId.toLowerCase();
  const row = singleRow(await rpc(env, "writing_submission_admin_get_submission", {
    p_admin_token: admin.token,
    p_id: normalizedId
  }));
  if (!row) throw new HttpError(404, "SUBMISSION_NOT_FOUND", "Submission not found");
  const occurrenceRows = await rpc(env, "writing_submission_admin_list_occurrences", {
    p_admin_token: admin.token,
    p_document_id: normalizedId,
    p_limit: MAX_OCCURRENCES_PER_DOCUMENT_RESPONSE
  });
  if (!Array.isArray(occurrenceRows)) {
    throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Grammar history returned an invalid response");
  }
  return json({
    submission: submissionResponse(row),
    grammarOccurrences: occurrenceRows.map(occurrenceResponse)
  }, 200, request, env);
}
