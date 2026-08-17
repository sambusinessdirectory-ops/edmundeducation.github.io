import { ACCEPTED_ANSWERS, LESSON_QUESTION_COUNTS } from "./catalog.js";
import { answersEquivalent, normalizeAnswerText } from "../../shared-answer-comparison.js";

const SERVICE_NAME = "edmund-phrasal-verb-system";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const LESSON_IDS = new Set(Object.keys(LESSON_QUESTION_COUNTS));
const CONTENT_VERSION = "1";
const SECTION_BOOKMARK_ID = "__section__";
const CONTROL_RE = /[\u0000-\u001f\u007f]/;
const MAX_LOGIN_BODY_BYTES = 4096;
const MAX_ATTEMPT_BODY_BYTES = 512 * 1024;
const MAX_ATTEMPT_RESULT_BYTES = 384 * 1024;
const MAX_BOOKMARK_BODY_BYTES = 256 * 1024;
const MAX_BOOKMARKS = 2005;
const BOOKMARK_PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 100;
const MAX_ADMIN_ATTEMPTS = 100;
const MAX_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_RESULT_ROUNDS = 250;
const decoder = new TextDecoder("utf-8", { fatal: true });
const encoder = new TextEncoder();
const SPELLING_EQUIVALENTS = Object.freeze({
  analyse: "analyze", analysed: "analyzed", analysing: "analyzing",
  apologise: "apologize", apologised: "apologized", apologising: "apologizing",
  behaviour: "behavior", behaviours: "behaviors",
  cancelled: "canceled", cancelling: "canceling",
  catalogue: "catalog", catalogues: "catalogs",
  centre: "center", centres: "centers",
  colour: "color", colours: "colors", coloured: "colored", colouring: "coloring", colourful: "colorful", colourless: "colorless",
  counsellor: "counselor", counsellors: "counselors",
  defence: "defense", defences: "defenses",
  dialogue: "dialog", dialogues: "dialogs",
  favour: "favor", favours: "favors", favourite: "favorite", favourites: "favorites",
  honour: "honor", honours: "honors", honoured: "honored",
  labour: "labor", labours: "labors",
  licence: "license", licences: "licenses",
  neighbour: "neighbor", neighbours: "neighbors", neighbourhood: "neighborhood",
  organise: "organize", organised: "organized", organises: "organizes", organising: "organizing",
  organisation: "organization", organisations: "organizations",
  practise: "practice", practised: "practiced", practises: "practices", practising: "practicing",
  programme: "program", programmes: "programs",
  realise: "realize", realised: "realized", realises: "realizes", realising: "realizing",
  recognise: "recognize", recognised: "recognized", recognises: "recognizes", recognising: "recognizing",
  theatre: "theater", theatres: "theaters",
  travelled: "traveled", travelling: "traveling", traveller: "traveler", travellers: "travelers"
});

function answerCatalogReadiness() {
  const expectedLessonIds = Array.from(
    { length: LESSON_IDS.size },
    (_, index) => `phrasal-verb-${String(index + 1).padStart(2, "0")}`
  );
  const countsReady = expectedLessonIds.every((lessonId) => (
    Number.isInteger(LESSON_QUESTION_COUNTS[lessonId])
    && LESSON_QUESTION_COUNTS[lessonId] >= 1
    && LESSON_QUESTION_COUNTS[lessonId] <= 999
  ));
  const expectedIds = countsReady ? expectedLessonIds.flatMap((lessonId) => Array.from(
    { length: LESSON_QUESTION_COUNTS[lessonId] },
    (_, index) => `${lessonId}-q${String(index + 1).padStart(2, "0")}`
  )) : [];
  const actualIds = Object.keys(ACCEPTED_ANSWERS);
  const expectedSet = new Set(expectedIds);
  const validQuestionIds = actualIds.filter(questionId => {
    const answers = ACCEPTED_ANSWERS[questionId];
    return expectedSet.has(questionId)
      && Array.isArray(answers)
      && answers.length >= 1
      && answers.every(answer => (
        typeof answer === "string"
        && answer.trim() === answer
        && answer.length >= 1
        && answer.length <= 1000
        && !CONTROL_RE.test(answer)
      ));
  });
  const valid = countsReady
    && expectedLessonIds.every((lessonId) => LESSON_IDS.has(lessonId))
    && actualIds.length === expectedIds.length
    && validQuestionIds.length === expectedIds.length;
  return Object.freeze({
    ready: valid,
    acceptedQuestions: validQuestionIds.length,
    expectedQuestions: expectedIds.length
  });
}

const CATALOG_READINESS = answerCatalogReadiness();

export default {
  async fetch(request, env) {
    try {
      return await route(request, env);
    } catch (error) {
      if (error instanceof HttpError) {
        return json(
          { error: error.message, code: error.code },
          error.status,
          request,
          env,
          error.headers
        );
      }
      console.error("Phrasal Verb System Worker request failed", safeErrorMessage(error));
      return json(
        { error: "Phrasal Verb System service error", code: "SERVICE_ERROR" },
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
    const catalog = CATALOG_READINESS;
    return json(
      {
        ok: configured && catalog.ready,
        service: SERVICE_NAME,
        storage: "supabase-private",
        catalog,
        limits: {
          maxAttemptBodyBytes: MAX_ATTEMPT_BODY_BYTES,
          maxAttemptResultBytes: MAX_ATTEMPT_RESULT_BYTES,
          maxBookmarks: MAX_BOOKMARKS,
          maxPageSize: MAX_PAGE_SIZE
        },
        rateLimiters: {
          adminLogin: rateLimiterConfigured(env.ADMIN_LOGIN_RATE_LIMITER),
          attemptWrite: rateLimiterConfigured(env.ATTEMPT_WRITE_RATE_LIMITER),
          bookmarkWrite: rateLimiterConfigured(env.BOOKMARK_WRITE_RATE_LIMITER)
        }
      },
      configured && catalog.ready ? 200 : 503,
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

  if (url.pathname === "/v1/attempts" && request.method === "GET") {
    return listAttempts(request, env, url);
  }
  const attemptMatch = url.pathname.match(/^\/v1\/attempts\/([0-9a-f-]{36})$/i);
  if (attemptMatch && request.method === "GET") {
    return getAttempt(request, env, attemptMatch[1]);
  }
  if (attemptMatch && request.method === "PUT") {
    return putAttempt(request, env, attemptMatch[1]);
  }

  if (url.pathname === "/v1/bookmarks" && request.method === "GET") {
    return getBookmarks(request, env);
  }
  if (url.pathname === "/v1/bookmarks" && request.method === "PUT") {
    return putBookmarks(request, env);
  }

  if (url.pathname === "/v1/admin/students" && request.method === "GET") {
    return listAdminStudents(request, env);
  }
  const adminStudentMatch = url.pathname.match(/^\/v1\/admin\/students\/([0-9a-f-]{36})$/i);
  if (adminStudentMatch && request.method === "GET") {
    return getAdminStudent(request, env, adminStudentMatch[1]);
  }

  return json({ error: "Not found", code: "NOT_FOUND" }, 404, request, env);
}

class HttpError extends Error {
  constructor(status, code, message, headers = undefined) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    this.headers = headers;
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
      // Invalid configuration is ignored; the health check then fails closed.
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
  headers.set("Access-Control-Expose-Headers", "Retry-After");
  headers.set("Vary", "Origin");
  if (isAllowedOrigin(origin, env)) headers.set("Access-Control-Allow-Origin", origin);
  return headers;
}

function json(value, status, request, env, extraHeaders = undefined) {
  const headers = corsHeaders(request.headers.get("Origin") || "", env);
  headers.set("Content-Type", "application/json; charset=utf-8");
  if (extraHeaders && typeof extraHeaders === "object") {
    for (const [name, headerValue] of Object.entries(extraHeaders)) {
      if (headerValue !== undefined && headerValue !== null) {
        headers.set(name, String(headerValue));
      }
    }
  }
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
  // Wrangler's stdin-based secret upload can preserve a trailing line break.
  // Header values must never contain surrounding whitespace or newlines.
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
    if (!rateLimiterConfigured(env.ATTEMPT_WRITE_RATE_LIMITER)) return false;
    if (!rateLimiterConfigured(env.BOOKMARK_WRITE_RATE_LIMITER)) return false;
    return true;
  } catch {
    return false;
  }
}

function assertConfigured(env) {
  if (!isConfigured(env)) {
    throw new HttpError(503, "NOT_CONFIGURED", "Phrasal Verb System service is not configured");
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

async function rpc(env, functionName, payload, options = {}) {
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
      "DATA_SERVICE_UNAVAILABLE",
      "Phrasal Verb System data service is temporarily unavailable"
    );
  }
  if (!response.ok) {
    console.error("Supabase RPC rejected", functionName, response.status);
    let upstreamCode = "";
    try {
      const upstreamError = await response.json();
      upstreamCode = String(upstreamError?.code || "").toUpperCase();
    } catch {
      try { await response.arrayBuffer(); } catch { /* Discard upstream details. */ }
    }
    const conflictSqlStates = new Set(
      (Array.isArray(options.conflictSqlStates) ? options.conflictSqlStates : [])
        .map(value => String(value || "").toUpperCase())
    );
    if (upstreamCode && conflictSqlStates.has(upstreamCode)) {
      throw new HttpError(
        409,
        "ATTEMPT_CONFLICT",
        "Attempt progress changed on another session; reload and merge before saving"
      );
    }
    throw new HttpError(
      502,
      "DATA_SERVICE_UNAVAILABLE",
      "Phrasal Verb System data service is temporarily unavailable"
    );
  }
  try {
    return await response.json();
  } catch {
    throw new HttpError(
      502,
      "INVALID_UPSTREAM_RESPONSE",
      "Phrasal Verb System data service returned an invalid response"
    );
  }
}

function singleRow(value) {
  return Array.isArray(value) && value.length === 1 ? value[0] : null;
}

async function authenticateStudent(request, env) {
  const token = bearerToken(request);
  if (!token) return null;
  const row = singleRow(await rpc(env, "phrasal_verb_system_student_profile", { p_token: token }));
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
  const row = singleRow(await rpc(env, "phrasal_verb_system_admin_me", { p_admin_token: token }));
  if (!row || !UUID_RE.test(String(row.id || ""))) return null;
  return {
    kind: "admin",
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
  let rateLimit;
  try {
    rateLimit = await env.ADMIN_LOGIN_RATE_LIMITER.limit({
      key: `phrasal-verb-system-admin:${clientIp}`
    });
  } catch {
    throw new HttpError(503, "RATE_LIMIT_UNAVAILABLE", "Admin login is temporarily unavailable");
  }
  if (!rateLimit.success) {
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

  const row = singleRow(await rpc(env, "phrasal_verb_system_admin_login", {
    p_name: username,
    p_password: password
  }));
  if (!row || !UUID_RE.test(String(row.admin_token || ""))) {
    throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid username or password");
  }

  return json(
    {
      admin: {
        id: String(row.admin_id || ""),
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
  const admin = await authenticateAdmin(request, env);
  if (!admin) throw new HttpError(401, "ADMIN_AUTH_REQUIRED", "Administrator authentication required");
  await rpc(env, "phrasal_verb_system_admin_logout", { p_admin_token: admin.token });
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

function postgresJsonbTextByteLength(value) {
  if (Array.isArray(value)) {
    return 2
      + Math.max(0, value.length - 1) * 2
      + value.reduce((total, item) => total + postgresJsonbTextByteLength(item), 0);
  }
  if (isPlainObject(value)) {
    const entries = Object.entries(value);
    return 2
      + Math.max(0, entries.length - 1) * 2
      + entries.reduce(
        (total, [key, item]) => total
          + encoder.encode(JSON.stringify(key)).byteLength
          + 2
          + postgresJsonbTextByteLength(item),
        0
      );
  }
  const serialized = JSON.stringify(value);
  return encoder.encode(serialized === undefined ? "null" : serialized).byteLength;
}

function validQuestionId(lessonId, questionId) {
  if (!LESSON_IDS.has(lessonId) || typeof questionId !== "string") return false;
  if (!questionId.startsWith(`${lessonId}-q`)) return false;
  return Object.prototype.hasOwnProperty.call(ACCEPTED_ANSWERS, questionId);
}

function normalizeAnswer(value) {
  return normalizeAnswerText(value, { canonicalizeToken: token => SPELLING_EQUIVALENTS[token] || token });
}

function answerMatchesCatalog(questionId, answer) {
  const accepted = ACCEPTED_ANSWERS[questionId];
  if (!Array.isArray(accepted) || !accepted.length) return false;
  return accepted.some(candidate => answersEquivalent(answer, candidate, {
    canonicalizeToken: token => SPELLING_EQUIVALENTS[token] || token
  }));
}

function normalizeIsoTimestamp(value, label, nullable = false) {
  if (nullable && value === null) return null;
  if (typeof value !== "string" || value.length < 20 || value.length > 40 || CONTROL_RE.test(value)) {
    throw new HttpError(400, "INVALID_ATTEMPT", `${label} must be an ISO timestamp`);
  }
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    throw new HttpError(400, "INVALID_ATTEMPT", `${label} must be an ISO timestamp`);
  }
  return { value: new Date(timestamp).toISOString(), timestamp };
}

function normalizeIdentifierArray(value, label, maximum, lessonId) {
  if (!Array.isArray(value) || value.length > maximum) {
    throw new HttpError(400, "INVALID_ATTEMPT", `${label} is invalid`);
  }
  const normalized = [];
  const seen = new Set();
  for (const item of value) {
    if (!validQuestionId(lessonId, item) || seen.has(item)) {
      throw new HttpError(400, "INVALID_ATTEMPT", `${label} is invalid`);
    }
    seen.add(item);
    normalized.push(item);
  }
  return normalized;
}

function normalizeAttemptResult(value, context) {
  const requiredKeys = [
    "round",
    "correctIds",
    "questionState",
    "rounds",
    "awaitingNextRound",
    "contentVersion"
  ];
  const allowedKeys = new Set([
    ...requiredKeys,
    "correctionMode",
    "correctionIds",
    "collapsedCorrectIds"
  ]);
  if (
    !hasOnlyKeys(value, allowedKeys)
    || !requiredKeys.every(key => Object.prototype.hasOwnProperty.call(value, key))
  ) {
    throw new HttpError(400, "INVALID_ATTEMPT", "result has an invalid shape");
  }

  if (!Number.isInteger(value.round) || value.round !== context.roundNumber) {
    throw new HttpError(400, "INVALID_ATTEMPT", "result.round does not match roundNumber");
  }
  const correctIds = normalizeIdentifierArray(
    value.correctIds,
    "result.correctIds",
    context.totalCount,
    context.lessonId
  );
  if (correctIds.length && !CATALOG_READINESS.ready) {
    throw new HttpError(
      503,
      "ANSWER_CATALOG_NOT_READY",
      "Phrasal Verb System answer validation is not configured"
    );
  }
  if (correctIds.length !== context.correctCount) {
    throw new HttpError(400, "INVALID_ATTEMPT", "correctCount does not match result.correctIds");
  }

  if (!isPlainObject(value.questionState) || Object.keys(value.questionState).length > context.totalCount) {
    throw new HttpError(400, "INVALID_ATTEMPT", "result.questionState is invalid");
  }
  const questionState = {};
  for (const [questionId, state] of Object.entries(value.questionState)) {
    if (
      !validQuestionId(context.lessonId, questionId)
      || !hasExactKeys(state, ["status", "lastAnswer", "reveal"])
      || !["pending", "correct", "wrong"].includes(state.status)
      || typeof state.lastAnswer !== "string"
      || state.lastAnswer.length > 1000
      || CONTROL_RE.test(state.lastAnswer)
      || typeof state.reveal !== "boolean"
    ) {
      throw new HttpError(400, "INVALID_ATTEMPT", "result.questionState contains an invalid entry");
    }
    questionState[questionId] = {
      status: state.status,
      lastAnswer: state.lastAnswer,
      // The client supplies this field for wire-format compatibility, but the
      // Worker derives the persisted entitlement from validated attempt state.
      // It is finalized after correction metadata has been normalized below.
      reveal: false
    };
  }
  for (const questionId of correctIds) {
    if (
      questionState[questionId]?.status !== "correct"
      || !answerMatchesCatalog(questionId, questionState[questionId].lastAnswer)
    ) {
      throw new HttpError(400, "INVALID_ATTEMPT", "A claimed correct answer does not match the lesson catalog");
    }
  }

  const correctSet = new Set(correctIds);
  if (Object.entries(questionState).some(([id, state]) => state.status === "correct" && !correctSet.has(id))) {
    throw new HttpError(400, "INVALID_ATTEMPT", "result.questionState contains unclaimed correct progress");
  }

  if (!Array.isArray(value.rounds) || value.rounds.length > MAX_RESULT_ROUNDS) {
    throw new HttpError(400, "INVALID_ATTEMPT", "result.rounds is invalid");
  }
  const rounds = value.rounds.map(round => {
    if (!hasExactKeys(round, [
      "round",
      "kind",
      "checkedIds",
      "correctIds",
      "incorrectIds",
      "submittedAt"
    ])) {
      throw new HttpError(400, "INVALID_ATTEMPT", "result.rounds contains an invalid entry");
    }
    if (
      !Number.isInteger(round.round)
      || round.round < 1
      || round.round > context.roundNumber
      || !["partial", "all"].includes(round.kind)
    ) {
      throw new HttpError(400, "INVALID_ATTEMPT", "result.rounds contains invalid metadata");
    }
    const checkedIds = normalizeIdentifierArray(
      round.checkedIds,
      "round.checkedIds",
      context.totalCount,
      context.lessonId
    );
    const roundCorrectIds = normalizeIdentifierArray(
      round.correctIds,
      "round.correctIds",
      context.totalCount,
      context.lessonId
    );
    const incorrectIds = normalizeIdentifierArray(
      round.incorrectIds,
      "round.incorrectIds",
      context.totalCount,
      context.lessonId
    );
    const checkedSet = new Set(checkedIds);
    const correctSet = new Set(roundCorrectIds);
    const incorrectSet = new Set(incorrectIds);
    if (
      roundCorrectIds.some(id => !checkedSet.has(id))
      || incorrectIds.some(id => !checkedSet.has(id) || correctSet.has(id))
      || checkedIds.some(id => !correctSet.has(id) && !incorrectSet.has(id))
    ) {
      throw new HttpError(400, "INVALID_ATTEMPT", "A round's question sets are inconsistent");
    }
    const submitted = normalizeIsoTimestamp(round.submittedAt, "round.submittedAt");
    if (submitted.timestamp < context.startedTimestamp || submitted.timestamp > Date.now() + 5 * 60 * 1000) {
      throw new HttpError(400, "INVALID_ATTEMPT", "round.submittedAt is outside the attempt window");
    }
    return {
      round: round.round,
      kind: round.kind,
      checkedIds,
      correctIds: roundCorrectIds,
      incorrectIds,
      submittedAt: submitted.value
    };
  });

  if (typeof value.awaitingNextRound !== "boolean") {
    throw new HttpError(400, "INVALID_ATTEMPT", "result.awaitingNextRound must be boolean");
  }
  if (value.correctionMode !== undefined && typeof value.correctionMode !== "boolean") {
    throw new HttpError(400, "INVALID_ATTEMPT", "result.correctionMode must be boolean");
  }
  const correctionMode = value.correctionMode === true;
  const correctionIds = value.correctionIds === undefined
    ? []
    : normalizeIdentifierArray(value.correctionIds, "result.correctionIds", context.totalCount, context.lessonId);
  const collapsedCorrectIds = value.collapsedCorrectIds === undefined
    ? []
    : normalizeIdentifierArray(value.collapsedCorrectIds, "result.collapsedCorrectIds", context.totalCount, context.lessonId);
  if (
    (correctionMode && (!correctionIds.length || value.awaitingNextRound))
    || (!correctionMode && correctionIds.length)
    || correctionIds.some(id => !questionState[id] || questionState[id].status === "pending")
    || collapsedCorrectIds.some(id => !correctSet.has(id))
  ) {
    throw new HttpError(400, "INVALID_ATTEMPT", "result correction state is inconsistent");
  }
  for (const [questionId, state] of Object.entries(questionState)) {
    state.reveal = state.status === "correct"
      || (
        state.status === "wrong"
        && !(correctionMode && correctionIds.includes(questionId))
      );
  }
  if (
    value.contentVersion !== CONTENT_VERSION
  ) {
    throw new HttpError(400, "INVALID_ATTEMPT", "result.contentVersion is invalid");
  }

  const normalized = {
    round: value.round,
    correctIds,
    questionState,
    rounds,
    awaitingNextRound: value.awaitingNextRound,
    correctionMode,
    correctionIds,
    collapsedCorrectIds,
    contentVersion: value.contentVersion
  };
  // PostgreSQL's jsonb::text inserts a space after each comma and colon. Match
  // that representation so a payload accepted here cannot fail the SQL guard.
  if (postgresJsonbTextByteLength(normalized) > MAX_ATTEMPT_RESULT_BYTES) {
    throw new HttpError(413, "ATTEMPT_TOO_LARGE", "Attempt result is too large");
  }
  return normalized;
}

function normalizeAttemptPayload(payload) {
  if (!hasExactKeys(payload, [
    "lessonId",
    "lessonVersion",
    "status",
    "roundNumber",
    "correctCount",
    "totalCount",
    "durationMs",
    "startedAt",
    "completedAt",
    "result"
  ])) {
    throw new HttpError(400, "INVALID_ATTEMPT", "Attempt payload has an invalid shape");
  }
  if (!LESSON_IDS.has(payload.lessonId)) {
    throw new HttpError(400, "INVALID_ATTEMPT", "lessonId is invalid");
  }
  if (
    payload.lessonVersion !== CONTENT_VERSION
  ) {
    throw new HttpError(400, "INVALID_ATTEMPT", "lessonVersion is invalid");
  }
  if (!["in_progress", "completed"].includes(payload.status)) {
    throw new HttpError(400, "INVALID_ATTEMPT", "status is invalid");
  }
  if (!Number.isInteger(payload.roundNumber) || payload.roundNumber < 1 || payload.roundNumber > 1000) {
    throw new HttpError(400, "INVALID_ATTEMPT", "roundNumber is invalid");
  }
  if (payload.totalCount !== LESSON_QUESTION_COUNTS[payload.lessonId]) {
    throw new HttpError(400, "INVALID_ATTEMPT", "totalCount is invalid");
  }
  if (
    !Number.isInteger(payload.correctCount)
    || payload.correctCount < 0
    || payload.correctCount > payload.totalCount
  ) {
    throw new HttpError(400, "INVALID_ATTEMPT", "correctCount is invalid");
  }
  if (!Number.isInteger(payload.durationMs) || payload.durationMs < 0 || payload.durationMs > MAX_DURATION_MS) {
    throw new HttpError(400, "INVALID_ATTEMPT", "durationMs is invalid");
  }

  const started = normalizeIsoTimestamp(payload.startedAt, "startedAt");
  const earliest = Date.UTC(2020, 0, 1);
  if (started.timestamp < earliest || started.timestamp > Date.now() + 5 * 60 * 1000) {
    throw new HttpError(400, "INVALID_ATTEMPT", "startedAt is outside the supported range");
  }
  const completed = normalizeIsoTimestamp(payload.completedAt, "completedAt", true);
  if (payload.status === "in_progress" && completed !== null) {
    throw new HttpError(400, "INVALID_ATTEMPT", "In-progress attempts cannot have completedAt");
  }
  if (
    payload.status === "completed"
    && (
      completed === null
      || completed.timestamp < started.timestamp
      || completed.timestamp > Date.now() + 5 * 60 * 1000
      || payload.correctCount !== payload.totalCount
    )
  ) {
    throw new HttpError(400, "INVALID_ATTEMPT", "Completed attempt metadata is inconsistent");
  }

  const result = normalizeAttemptResult(payload.result, {
    lessonId: payload.lessonId,
    roundNumber: payload.roundNumber,
    correctCount: payload.correctCount,
    totalCount: payload.totalCount,
    startedTimestamp: started.timestamp
  });
  if (payload.status === "completed" && result.awaitingNextRound) {
    throw new HttpError(400, "INVALID_ATTEMPT", "A completed attempt cannot await another round");
  }

  return {
    lessonId: payload.lessonId,
    lessonVersion: payload.lessonVersion,
    status: payload.status,
    roundNumber: payload.roundNumber,
    correctCount: payload.correctCount,
    totalCount: payload.totalCount,
    durationMs: payload.durationMs,
    startedAt: started.value,
    completedAt: completed?.value || null,
    result
  };
}

function attemptResponse(row) {
  return {
    id: String(row.id || ""),
    lessonId: String(row.lesson_id || ""),
    lessonVersion: String(row.lesson_version || ""),
    status: String(row.status || "in_progress"),
    roundNumber: Number(row.round_number || 1),
    correctCount: Number(row.correct_count || 0),
    totalCount: Number(row.total_count || 0),
    durationMs: Number(row.duration_ms || 0),
    startedAt: String(row.started_at || ""),
    completedAt: row.completed_at ? String(row.completed_at) : null,
    updatedAt: String(row.updated_at || ""),
    result: isPlainObject(row.result) ? row.result : {}
  };
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

async function listAttempts(request, env, url) {
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  const page = positiveIntegerParameter(url.searchParams.get("page"), 1, 1, 10000, "page");
  const pageSize = positiveIntegerParameter(
    url.searchParams.get("pageSize"),
    50,
    1,
    MAX_PAGE_SIZE,
    "pageSize"
  );
  const offset = (page - 1) * pageSize;
  if (!Number.isSafeInteger(offset) || offset > 1000000) {
    throw new HttpError(400, "INVALID_PAGE", "page is outside the supported range");
  }
  const rows = await rpc(env, "phrasal_verb_system_list_attempts", {
    p_student_id: student.id,
    p_limit: pageSize + 1,
    p_offset: offset
  });
  if (!Array.isArray(rows)) {
    throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Attempt history returned an invalid response");
  }
  const hasMore = rows.length > pageSize;
  return json(
    {
      attempts: rows.slice(0, pageSize).map(attemptResponse),
      page,
      pageSize,
      hasMore
    },
    200,
    request,
    env
  );
}

async function getAttempt(request, env, attemptId) {
  if (!UUID_RE.test(attemptId)) throw new HttpError(404, "ATTEMPT_NOT_FOUND", "Attempt not found");
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  const row = singleRow(await rpc(env, "phrasal_verb_system_get_attempt", {
    p_student_id: student.id,
    p_id: attemptId.toLowerCase()
  }));
  if (!row) throw new HttpError(404, "ATTEMPT_NOT_FOUND", "Attempt not found");
  return json({ attempt: attemptResponse(row) }, 200, request, env);
}

async function putAttempt(request, env, attemptId) {
  if (!UUID_RE.test(attemptId)) throw new HttpError(404, "ATTEMPT_NOT_FOUND", "Attempt not found");
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  await enforceAttemptWriteRateLimit(student.id, env);
  const payload = normalizeAttemptPayload(await readLimitedJson(request, MAX_ATTEMPT_BODY_BYTES));
  const row = singleRow(await rpc(env, "phrasal_verb_system_upsert_attempt", {
    p_id: attemptId.toLowerCase(),
    p_student_id: student.id,
    p_lesson_id: payload.lessonId,
    p_lesson_version: payload.lessonVersion,
    p_status: payload.status,
    p_round_number: payload.roundNumber,
    p_correct_count: payload.correctCount,
    p_total_count: payload.totalCount,
    p_duration_ms: payload.durationMs,
    p_started_at: payload.startedAt,
    p_result: payload.result
  }, {
    conflictSqlStates: ["22023", "23505"]
  }));
  if (!row) throw new HttpError(409, "ATTEMPT_CONFLICT", "Attempt could not be saved");
  return json({ attempt: attemptResponse(row) }, 200, request, env);
}

async function enforceAttemptWriteRateLimit(studentId, env) {
  if (!rateLimiterConfigured(env.ATTEMPT_WRITE_RATE_LIMITER)) {
    throw new HttpError(503, "RATE_LIMIT_NOT_CONFIGURED", "Attempt saving is not configured");
  }
  let result;
  try {
    result = await env.ATTEMPT_WRITE_RATE_LIMITER.limit({
      key: `phrasal-verb-system-attempt:${studentId}`
    });
  } catch {
    throw new HttpError(
      503,
      "RATE_LIMIT_UNAVAILABLE",
      "Attempt saving is temporarily unavailable",
      { "Retry-After": "5" }
    );
  }
  if (!result.success) {
    throw new HttpError(
      429,
      "TOO_MANY_ATTEMPT_WRITES",
      "Too many attempt updates; please wait and try again",
      { "Retry-After": "5" }
    );
  }
}

function normalizeBookmarks(value) {
  if (!Array.isArray(value) || value.length > MAX_BOOKMARKS) {
    throw new HttpError(400, "INVALID_BOOKMARKS", `bookmarks must contain at most ${MAX_BOOKMARKS} items`);
  }
  const seen = new Set();
  return value.map(bookmark => {
    const sectionBookmark = bookmark?.questionId === SECTION_BOOKMARK_ID;
    if (
      !hasExactKeys(bookmark, ["lessonId", "questionId", "includeAnswer"])
      || !LESSON_IDS.has(bookmark.lessonId)
      || (!sectionBookmark && !validQuestionId(bookmark.lessonId, bookmark.questionId))
      || typeof bookmark.includeAnswer !== "boolean"
      || (sectionBookmark && bookmark.includeAnswer !== false)
    ) {
      throw new HttpError(400, "INVALID_BOOKMARKS", "bookmarks contains an invalid item");
    }
    const key = `${bookmark.lessonId}\u0000${bookmark.questionId}`;
    if (seen.has(key)) {
      throw new HttpError(400, "INVALID_BOOKMARKS", "bookmarks contains a duplicate item");
    }
    seen.add(key);
    return {
      lessonId: bookmark.lessonId,
      questionId: bookmark.questionId,
      includeAnswer: bookmark.includeAnswer
    };
  });
}

function bookmarkResponse(row) {
  return {
    lessonId: String(row.lesson_id || ""),
    questionId: String(row.question_id || ""),
    includeAnswer: row.include_answer === true,
    createdAt: String(row.created_at || "")
  };
}

async function listAllBookmarkRows(env, functionName, payload) {
  const rows = [];
  for (let offset = 0; offset < MAX_BOOKMARKS; offset += BOOKMARK_PAGE_SIZE) {
    const page = await rpc(env, functionName, {
      ...payload,
      p_offset: offset,
      p_limit: BOOKMARK_PAGE_SIZE
    });
    if (!Array.isArray(page)) {
      throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Bookmarks returned an invalid response");
    }
    rows.push(...page);
    if (rows.length > MAX_BOOKMARKS) {
      throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Bookmarks exceeded the configured limit");
    }
    if (page.length < BOOKMARK_PAGE_SIZE) break;
  }
  return rows;
}

async function getBookmarks(request, env) {
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  const rows = await listAllBookmarkRows(env, "phrasal_verb_system_list_bookmarks_page", {
    p_student_id: student.id
  });
  return json({ bookmarks: rows.map(bookmarkResponse) }, 200, request, env);
}

async function putBookmarks(request, env) {
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  await enforceBookmarkWriteRateLimit(student.id, env);
  const payload = await readLimitedJson(request, MAX_BOOKMARK_BODY_BYTES);
  if (!hasExactKeys(payload, ["bookmarks"])) {
    throw new HttpError(400, "INVALID_BOOKMARKS", "Bookmark payload has an invalid shape");
  }
  const bookmarks = normalizeBookmarks(payload.bookmarks);
  const replacedRows = await rpc(env, "phrasal_verb_system_replace_bookmarks", {
    p_student_id: student.id,
    p_bookmarks: bookmarks
  });
  if (!Array.isArray(replacedRows)) {
    throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Bookmarks returned an invalid response");
  }
  const rows = await listAllBookmarkRows(env, "phrasal_verb_system_list_bookmarks_page", {
    p_student_id: student.id
  });
  return json({ bookmarks: rows.map(bookmarkResponse) }, 200, request, env);
}

async function enforceBookmarkWriteRateLimit(studentId, env) {
  if (!rateLimiterConfigured(env.BOOKMARK_WRITE_RATE_LIMITER)) {
    throw new HttpError(503, "RATE_LIMIT_NOT_CONFIGURED", "Bookmark saving is not configured");
  }
  let result;
  try {
    result = await env.BOOKMARK_WRITE_RATE_LIMITER.limit({
      key: `phrasal-verb-system-bookmark:${studentId}`
    });
  } catch {
    throw new HttpError(503, "RATE_LIMIT_UNAVAILABLE", "Bookmark saving is temporarily unavailable");
  }
  if (!result.success) {
    throw new HttpError(429, "TOO_MANY_BOOKMARK_WRITES", "Too many bookmark updates; please wait and try again");
  }
}

async function listAdminStudents(request, env) {
  const admin = await authenticateAdmin(request, env);
  if (!admin) throw new HttpError(401, "ADMIN_AUTH_REQUIRED", "Administrator authentication required");
  const rows = await rpc(env, "phrasal_verb_system_admin_list_students", {
    p_admin_token: admin.token
  });
  if (!Array.isArray(rows)) {
    throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Student list returned an invalid response");
  }
  return json(
    {
      students: rows.map(row => ({
        id: String(row.id || ""),
        name: String(row.name || ""),
        attemptCount: Number(row.attempt_count || 0),
        completedCount: Number(row.completed_count || 0),
        bookmarkCount: Number(row.bookmark_count || 0)
      }))
    },
    200,
    request,
    env
  );
}

async function getAdminStudent(request, env, studentId) {
  if (!UUID_RE.test(studentId)) throw new HttpError(404, "STUDENT_NOT_FOUND", "Student not found");
  const admin = await authenticateAdmin(request, env);
  if (!admin) throw new HttpError(401, "ADMIN_AUTH_REQUIRED", "Administrator authentication required");
  const normalizedStudentId = studentId.toLowerCase();
  const [profileRows, attemptRows, bookmarkRows] = await Promise.all([
    rpc(env, "phrasal_verb_system_admin_student_profile", {
      p_admin_token: admin.token,
      p_student_id: normalizedStudentId
    }),
    rpc(env, "phrasal_verb_system_admin_list_attempts", {
      p_admin_token: admin.token,
      p_student_id: normalizedStudentId,
      p_limit: MAX_ADMIN_ATTEMPTS
    }),
    listAllBookmarkRows(env, "phrasal_verb_system_admin_list_bookmarks_page", {
      p_admin_token: admin.token,
      p_student_id: normalizedStudentId
    })
  ]);
  const profile = singleRow(profileRows);
  if (!profile) throw new HttpError(404, "STUDENT_NOT_FOUND", "Student not found");
  if (!Array.isArray(attemptRows) || !Array.isArray(bookmarkRows)) {
    throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Student detail returned an invalid response");
  }
  return json(
    {
      student: {
        id: String(profile.id || ""),
        name: String(profile.name || ""),
        createdAt: String(profile.created_at || "")
      },
      attempts: attemptRows.map(attemptResponse),
      bookmarks: bookmarkRows.map(bookmarkResponse)
    },
    200,
    request,
    env
  );
}
