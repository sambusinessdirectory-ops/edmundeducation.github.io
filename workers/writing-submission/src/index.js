import {
  GRAMMAR_AI_ENGINE,
  GRAMMAR_AI_VERSION,
  GRAMMAR_AI_FAILURE_KINDS,
  classifyGrammarAiFailure,
  grammarAiConfigured,
  normalizeGrammarCheckPayload,
  runGrammarAi
} from "./grammar-ai.js";
import {
  GRAMMAR_CORPUS_SIZE,
  GRAMMAR_CORPUS_VERSION,
  lookupApprovedExactCorrection
} from "./grammar-corpus.js";
import { WRITING_SUBMISSION_TOPIC_CATALOG } from "./topic-catalog.js";

const SERVICE_NAME = "edmund-writing-submission";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256_RE = /^[0-9a-f]{64}$/;
const CONTROL_RE = /[\u0000-\u001f\u007f]/;
const TEXT_CONTROL_RE = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;
const MAX_LOGIN_BODY_BYTES = 4096;
const MAX_GRAMMAR_CHECK_BODY_BYTES = 12 * 1024;
const MAX_SUBMISSION_BODY_BYTES = 512 * 1024;
const MAX_DRAFT_BODY_BYTES = 512 * 1024;
const MAX_FEEDBACK_BODY_BYTES = 512 * 1024;
const MAX_FEEDBACK_DELETE_BODY_BYTES = 1024;
const MAX_FRAGMENT_COPY_BODY_BYTES = 96 * 1024;
const MAX_BOOKMARK_BODY_BYTES = 2048;
const MAX_ISSUE_BATCH_BODY_BYTES = 512 * 1024;
const MAX_TOPIC_CHARACTERS = 4000;
const MAX_TOPIC_BYTES = 16000;
const MAX_ANSWER_CHARACTERS = 100000;
const MAX_ANSWER_BYTES = 400000;
const MAX_OCCURRENCES_PER_BATCH = 50;
const MAX_OCCURRENCES_PER_DOCUMENT_RESPONSE = 2000;
const MAX_GRAMMAR_HISTORY_PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 100;
const MAX_ADMIN_PAGE_SIZE = 100;
const MAX_FEEDBACK_FRAGMENTS = 200;
const MAX_FEEDBACK_HEADER_CHARACTERS = 20000;
const MAX_FEEDBACK_FRAGMENT_CHARACTERS = 10000;
const MAX_FEEDBACK_COMMENT_CHARACTERS = 20000;
const MAX_FEEDBACK_SUGGESTION_CHARACTERS = 20000;
const MAX_FEEDBACK_FORMATTING_RUNS = 500;
const MAX_FEEDBACK_RICH_TEXT_ITEMS = 100;
const MAX_SENTENCE_STRUCTURE_LINKS = 100;
const MAX_SENTENCE_STRUCTURE_LINK_LABEL_CHARACTERS = 200;
const MAX_SENTENCE_STRUCTURE_LINK_URL_CHARACTERS = 2048;
const FEEDBACK_HIGHLIGHTS = new Set(["", "yellow", "orange", "blue", "green", "red"]);
const FEEDBACK_ENHANCEMENT_SECTION_KEYS = new Set([
  "sentence-structure",
  "rhetorical-technique",
  "phrasal-verb",
  "writing-common-expression",
  "rhetorical-common-expression"
]);
const WRITING_IMAGE_ZOOM_TENTHS = new Set([5, 10, 20, 30, 40, 50, 70]);
const decoder = new TextDecoder("utf-8", { fatal: true });
const encoder = new TextEncoder();
const CANONICAL_WRITING_TOPICS = new Map(
  WRITING_SUBMISSION_TOPIC_CATALOG.map((topic) => [topic.id, topic])
);

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
          error.retryAfterSeconds > 0
            ? { "Retry-After": String(error.retryAfterSeconds) }
            : undefined
        );
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
        storage: "private-data-service",
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
          version: GRAMMAR_AI_VERSION
        },
        grammarCorpus: {
          version: GRAMMAR_CORPUS_VERSION,
          approvedSentenceCount: GRAMMAR_CORPUS_SIZE
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
  if (url.pathname === "/v1/preferences" && request.method === "GET") {
    return getPreferences(request, env);
  }
  if (url.pathname === "/v1/preferences" && request.method === "PUT") {
    return putPreferences(request, env);
  }
  if (url.pathname === "/v1/progress" && request.method === "GET") {
    return getProgress(request, env);
  }
  if (url.pathname === "/v1/grammar-check" && request.method === "POST") {
    return grammarCheck(request, env);
  }

  if (url.pathname === "/v1/submissions" && request.method === "GET") {
    return listSubmissions(request, env, url);
  }
  if (url.pathname === "/v1/drafts" && request.method === "GET") {
    return listDrafts(request, env, url);
  }
  const draftMatch = url.pathname.match(/^\/v1\/drafts\/([0-9a-f-]{36})$/i);
  if (draftMatch && request.method === "GET") {
    return getDraft(request, env, draftMatch[1]);
  }
  if (draftMatch && request.method === "PUT") {
    return putDraft(request, env, draftMatch[1]);
  }
  if (draftMatch && request.method === "DELETE") {
    return deleteDraft(request, env, draftMatch[1]);
  }
  const submissionMatch = url.pathname.match(/^\/v1\/submissions\/([0-9a-f-]{36})$/i);
  if (submissionMatch && request.method === "GET") {
    return getSubmission(request, env, submissionMatch[1]);
  }
  if (submissionMatch && request.method === "PUT") {
    return putSubmission(request, env, submissionMatch[1]);
  }
  if (submissionMatch && request.method === "DELETE") {
    return deleteSubmission(request, env, submissionMatch[1]);
  }
  const submissionFeedbackMatch = url.pathname.match(
    /^\/v1\/submissions\/([0-9a-f-]{36})\/feedback$/i
  );
  if (submissionFeedbackMatch && request.method === "GET") {
    return getSubmissionFeedback(request, env, submissionFeedbackMatch[1]);
  }
  const suggestionCopyMatch = url.pathname.match(
    /^\/v1\/submissions\/([0-9a-f-]{36})\/feedback\/fragments\/([0-9a-f-]{36})\/suggestion-copy$/i
  );
  if (suggestionCopyMatch && request.method === "PUT") {
    return putSuggestionCopy(request, env, suggestionCopyMatch[1], suggestionCopyMatch[2]);
  }
  const enhancementCopyMatch = url.pathname.match(
    /^\/v1\/submissions\/([0-9a-f-]{36})\/feedback\/enhancements\/(sentence-structure|rhetorical-technique|phrasal-verb|writing-common-expression|rhetorical-common-expression)\/([1-9][0-9]{0,2})\/copy$/i
  );
  if (enhancementCopyMatch && request.method === "PUT") {
    return putEnhancementCopy(
      request,
      env,
      enhancementCopyMatch[1],
      enhancementCopyMatch[2].toLowerCase(),
      Number(enhancementCopyMatch[3])
    );
  }
  const submissionTranscriptionMatch = url.pathname.match(
    /^\/v1\/submissions\/([0-9a-f-]{36})\/transcriptions$/i
  );
  if (submissionTranscriptionMatch && request.method === "PUT") {
    return putSubmissionTranscriptions(request, env, submissionTranscriptionMatch[1]);
  }
  if (url.pathname === "/v1/feedback-bookmarks" && request.method === "GET") {
    return listFeedbackBookmarks(request, env, url);
  }
  const feedbackBookmarkMatch = url.pathname.match(
    /^\/v1\/feedback-bookmarks\/([0-9a-f-]{36})$/i
  );
  if (feedbackBookmarkMatch && request.method === "PUT") {
    return putFeedbackBookmark(request, env, feedbackBookmarkMatch[1]);
  }

  if (url.pathname === "/v1/grammar-occurrences/batch" && request.method === "POST") {
    return postOccurrenceBatch(request, env);
  }
  if (url.pathname === "/v1/grammar-problems" && request.method === "GET") {
    return getGrammarProblems(request, env);
  }
  if (url.pathname === "/v1/grammar-problem-occurrences" && request.method === "GET") {
    return listGrammarProblemOccurrences(request, env, url);
  }

  if (url.pathname === "/v1/admin/students" && request.method === "GET") {
    return listAdminStudents(request, env);
  }
  if (url.pathname === "/v1/admin/submissions" && request.method === "GET") {
    return listAdminSubmissions(request, env, url);
  }
  if (url.pathname === "/v1/admin/grammar-problems" && request.method === "GET") {
    return listAdminGrammarProblems(request, env, url);
  }
  if (url.pathname === "/v1/admin/grammar-problem-occurrences" && request.method === "GET") {
    return listAdminGrammarProblemOccurrences(request, env, url);
  }
  const adminOccurrenceMatch = url.pathname.match(/^\/v1\/admin\/grammar-occurrences\/([0-9a-f-]{36})$/i);
  if (adminOccurrenceMatch && request.method === "DELETE") {
    return deleteAdminGrammarOccurrence(request, env, adminOccurrenceMatch[1]);
  }
  if (url.pathname === "/v1/admin/grammar-problem-category" && request.method === "DELETE") {
    return deleteAdminGrammarProblemCategory(request, env);
  }
  if (url.pathname === "/v1/admin/explanation-review" && request.method === "GET") {
    return listAdminExplanationReview(request, env, url);
  }
  const adminSubmissionMatch = url.pathname.match(/^\/v1\/admin\/submissions\/([0-9a-f-]{36})$/i);
  if (adminSubmissionMatch && request.method === "GET") {
    return getAdminSubmission(request, env, adminSubmissionMatch[1]);
  }
  const adminSubmissionFeedbackMatch = url.pathname.match(
    /^\/v1\/admin\/submissions\/([0-9a-f-]{36})\/feedback$/i
  );
  if (adminSubmissionFeedbackMatch && request.method === "GET") {
    return getAdminSubmissionFeedback(request, env, adminSubmissionFeedbackMatch[1]);
  }
  if (adminSubmissionFeedbackMatch && request.method === "PUT") {
    return putAdminSubmissionFeedback(request, env, adminSubmissionFeedbackMatch[1]);
  }
  if (adminSubmissionFeedbackMatch && request.method === "DELETE") {
    return deleteAdminSubmissionFeedback(request, env, adminSubmissionFeedbackMatch[1]);
  }

  return json({ error: "Not found", code: "NOT_FOUND" }, 404, request, env);
}

class HttpError extends Error {
  constructor(status, code, message, { retryAfterSeconds = 0 } = {}) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    this.retryAfterSeconds = Math.max(0, Number.parseInt(retryAfterSeconds, 10) || 0);
  }
}

function safeErrorMessage(error) {
  if (!error || typeof error !== "object") return "Unknown error";
  const name = String(error.name || "Error").slice(0, 80);
  const message = String(error.message || "").slice(0, 300);
  return `${name}: ${message}`;
}

function publicGrammarEngine(value, fallbackName = "edmund-advanced-grammar") {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const internalName = String(source.name || "");
  const name = internalName === "edmund-approved-grammar-corpus"
    ? "edmund-approved-grammar-corpus"
    : fallbackName;
  const engine = { name };
  if (source.version) engine.version = String(source.version).slice(0, 80);
  return engine;
}

function publicGrammarIssues(values, fallbackName) {
  return Array.isArray(values) ? values.map(issue => ({
    ...issue,
    engine: publicGrammarEngine(issue?.engine, fallbackName)
  })) : [];
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
  headers.set("Access-Control-Allow-Methods", "DELETE, GET, POST, PUT, OPTIONS");
  headers.set("Access-Control-Expose-Headers", "Retry-After");
  headers.set("Vary", "Origin");
  if (isAllowedOrigin(origin, env)) headers.set("Access-Control-Allow-Origin", origin);
  return headers;
}

function json(value, status, request, env, additionalHeaders = undefined) {
  const headers = corsHeaders(request.headers.get("Origin") || "", env);
  headers.set("Content-Type", "application/json; charset=utf-8");
  if (additionalHeaders && typeof additionalHeaders === "object") {
    for (const [name, value] of Object.entries(additionalHeaders)) headers.set(name, String(value));
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

async function rpc(env, functionName, payload, knownUpstreamErrors = undefined) {
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
      "Writing Submission data service is temporarily unavailable"
    );
  }
  if (!response.ok) {
    console.error("Supabase RPC rejected", functionName, response.status);
    let upstreamCode = "";
    try {
      const upstreamError = await response.json();
      upstreamCode = typeof upstreamError?.code === "string" ? upstreamError.code : "";
    } catch { /* Discard malformed upstream details. */ }
    const mapped = knownUpstreamErrors && Object.prototype.hasOwnProperty.call(
      knownUpstreamErrors,
      upstreamCode
    )
      ? knownUpstreamErrors[upstreamCode]
      : null;
    if (mapped) {
      throw new HttpError(mapped.status, mapped.code, mapped.message);
    }
    throw new HttpError(
      502,
      "DATA_SERVICE_UNAVAILABLE",
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
    access: normalizeStudentAccess(row.access),
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
  if (!result.success) {
    throw new HttpError(429, exceededCode, exceededMessage, { retryAfterSeconds: 60 });
  }
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

  const approvedReview = lookupApprovedExactCorrection(sentence);
  if (approvedReview) {
    const engine = publicGrammarEngine(approvedReview.engine, "edmund-approved-grammar-corpus");
    return json({
      engine,
      corpus: {
        version: approvedReview.corpusVersion,
        paragraphId: approvedReview.paragraphId,
        sentenceId: approvedReview.sentenceId
      },
      issues: publicGrammarIssues(approvedReview.issues, engine.name)
    }, 200, request, env);
  }

  if (!grammarAiConfigured(env)) {
    throw new HttpError(
      503,
      "GRAMMAR_CHECK_PROVIDER_FAILURE",
      "Advanced grammar checking is temporarily unavailable",
      { retryAfterSeconds: 1 }
    );
  }

  let issues;
  try {
    issues = await runGrammarAi(sentence, env);
  } catch (error) {
    // Student text and provider output must never appear in logs.
    const failureKind = classifyGrammarAiFailure(error);
    const logByFailureKind = {
      [GRAMMAR_AI_FAILURE_KINDS.quotaExhausted]: "Writing Submission grammar daily quota was exhausted",
      [GRAMMAR_AI_FAILURE_KINDS.rateLimited]: "Writing Submission grammar provider rate limited",
      [GRAMMAR_AI_FAILURE_KINDS.timeout]: "Writing Submission grammar provider timed out",
      [GRAMMAR_AI_FAILURE_KINDS.inconclusive]: "Writing Submission grammar result was inconclusive",
      [GRAMMAR_AI_FAILURE_KINDS.providerFailure]: "Writing Submission grammar provider failed"
    };
    console.error(logByFailureKind[failureKind]);
    if (failureKind === GRAMMAR_AI_FAILURE_KINDS.quotaExhausted) {
      throw new HttpError(
        503,
        "GRAMMAR_CHECK_QUOTA_EXHAUSTED",
        "Advanced grammar checking daily allowance is exhausted; it resets at 08:00 Hong Kong time"
      );
    }
    if (failureKind === GRAMMAR_AI_FAILURE_KINDS.rateLimited) {
      throw new HttpError(
        429,
        "GRAMMAR_CHECK_PROVIDER_RATE_LIMITED",
        "Advanced grammar checking provider is temporarily rate limited",
        { retryAfterSeconds: 60 }
      );
    }
    if (failureKind === GRAMMAR_AI_FAILURE_KINDS.timeout) {
      throw new HttpError(
        504,
        "GRAMMAR_CHECK_PROVIDER_TIMEOUT",
        "Advanced grammar checking provider timed out"
      );
    }
    if (failureKind === GRAMMAR_AI_FAILURE_KINDS.inconclusive) {
      throw new HttpError(
        502,
        "GRAMMAR_CHECK_INCONCLUSIVE",
        "Advanced grammar checking could not safely analyse this sentence"
      );
    }
    throw new HttpError(
      503,
      "GRAMMAR_CHECK_PROVIDER_FAILURE",
      "Advanced grammar checking is temporarily unavailable",
      { retryAfterSeconds: 1 }
    );
  }

  const engine = publicGrammarEngine(GRAMMAR_AI_ENGINE);
  return json({ engine, issues: publicGrammarIssues(issues, engine.name) }, 200, request, env);
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
  if (!student.access) {
    throw new HttpError(
      502,
      "INVALID_UPSTREAM_RESPONSE",
      "Student topic permissions returned an invalid response"
    );
  }
  return json(
    {
      student: {
        id: student.id,
        name: student.name,
        expiresAt: student.expiresAt,
        access: student.access
      }
    },
    200,
    request,
    env
  );
}

async function getPreferences(request, env) {
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  const row = singleRow(await rpc(env, "writing_submission_preferences_get", {
    p_student_id: student.id
  }));
  if (!row) {
    throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Writing preferences returned an invalid response");
  }
  return json({
    preferences: {
      grammarDetectionEnabled: row.grammar_detection_enabled !== false,
      updatedAt: row.updated_at ? String(row.updated_at) : null
    }
  }, 200, request, env);
}

async function putPreferences(request, env) {
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  await enforceRateLimit(
    env.SUBMISSION_WRITE_RATE_LIMITER,
    `writing-submission-preference:${student.id}`,
    "Writing preferences are temporarily unavailable",
    "TOO_MANY_PREFERENCE_WRITES",
    "Too many preference updates; please wait and try again"
  );
  const payload = await readLimitedJson(request, MAX_LOGIN_BODY_BYTES);
  if (!hasExactKeys(payload, ["grammarDetectionEnabled"]) || typeof payload.grammarDetectionEnabled !== "boolean") {
    throw new HttpError(400, "INVALID_PREFERENCE", "Writing preference payload is invalid");
  }
  const row = singleRow(await rpc(env, "writing_submission_preferences_set", {
    p_student_id: student.id,
    p_grammar_detection_enabled: payload.grammarDetectionEnabled
  }));
  if (!row) {
    throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Writing preferences returned an invalid response");
  }
  return json({
    preferences: {
      grammarDetectionEnabled: row.grammar_detection_enabled !== false,
      updatedAt: row.updated_at ? String(row.updated_at) : null
    }
  }, 200, request, env);
}

function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function normalizeStudentAccess(value) {
  if (!isPlainObject(value)) return null;
  const normalized = {};
  for (const [rawKey, allowed] of Object.entries(value)) {
    const key = String(rawKey || "");
    // This reserved Flashcard metadata field is display-only. Exclude it from
    // the authorization map while keeping every real permission boolean-only.
    if (key === "__adminMessage") continue;
    if (
      !key
      || key.length > 100
      || key.trim() !== key
      || CONTROL_RE.test(key)
      || typeof allowed !== "boolean"
    ) return null;
    normalized[key] = allowed;
  }
  return normalized;
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
  if (
    !hasOnlyKeys(payload, new Set(["topic", "answer", "durationSeconds", "topicResource"]))
    || !Object.prototype.hasOwnProperty.call(payload, "topic")
    || !Object.prototype.hasOwnProperty.call(payload, "answer")
  ) {
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
  const durationSeconds = payload.durationSeconds === undefined ? 0 : Number(payload.durationSeconds);
  if (
    !Number.isSafeInteger(durationSeconds)
    || durationSeconds < 0
    || durationSeconds > 31536000
  ) {
    throw new HttpError(400, "INVALID_SUBMISSION", "durationSeconds is invalid");
  }
  return {
    topic,
    answer,
    wordCount: words,
    durationSeconds,
    topicResource: payload.topicResource === undefined || payload.topicResource === null
      ? null
      : normalizeDraftTopicResource(payload.topicResource)
  };
}

function normalizeOptionalWritingText(value, label, maxCharacters, maxBytes) {
  if (typeof value !== "string") {
    throw new HttpError(400, "INVALID_DRAFT", `${label} must be text`);
  }
  const normalized = value.replace(/\r\n?/g, "\n");
  if (
    normalized.length > maxCharacters
    || utf8Length(normalized) > maxBytes
    || TEXT_CONTROL_RE.test(normalized)
  ) {
    throw new HttpError(400, "INVALID_DRAFT", `${label} is invalid`);
  }
  return normalized;
}

function boundedDraftString(value, label, maximumCharacters, { allowEmpty = false } = {}) {
  if (typeof value !== "string") {
    throw new HttpError(400, "INVALID_DRAFT", `${label} must be text`);
  }
  const normalized = value.replace(/\r\n?/g, "\n");
  if (
    (!allowEmpty && !normalized.trim())
    || normalized.length > maximumCharacters
    || utf8Length(normalized) > maximumCharacters * 4
    || TEXT_CONTROL_RE.test(normalized)
  ) {
    throw new HttpError(400, "INVALID_DRAFT", `${label} is invalid`);
  }
  return normalized;
}

function safeWritingPromptImage(value) {
  const source = String(value || "").trim();
  if (
    !source
    || source.length > 500
    || source.includes("://")
    || source.startsWith("//")
    || source.includes("\\")
    || source.startsWith("data:")
    || CONTROL_RE.test(source)
  ) return "";
  return source.startsWith("/")
    || source.startsWith("./")
    || /^[a-z0-9][a-z0-9_./%()' -]*$/i.test(source)
    ? source
    : "";
}

function normalizeDraftTopicResource(value) {
  if (value === null) return null;
  const allowed = new Set([
    "id", "type", "label", "detail", "sectionKey", "questionPrompt", "questionImages"
  ]);
  if (!hasOnlyKeys(value, allowed)) {
    throw new HttpError(400, "INVALID_DRAFT", "topicResource has an invalid shape");
  }
  const id = boundedDraftString(value.id, "topicResource.id", 240);
  const type = boundedDraftString(value.type, "topicResource.type", 30);
  const label = boundedDraftString(value.label, "topicResource.label", 500);
  if (type !== "fill-blanks") {
    throw new HttpError(400, "INVALID_DRAFT", "topicResource.type is invalid");
  }
  const detail = boundedDraftString(
    value.detail === undefined ? "Writing Practice" : value.detail,
    "topicResource.detail",
    300,
    { allowEmpty: true }
  );
  const sectionKey = boundedDraftString(
    value.sectionKey === undefined ? "" : value.sectionKey,
    "topicResource.sectionKey",
    100,
    { allowEmpty: true }
  );
  if (!Array.isArray(value.questionPrompt) || value.questionPrompt.length > 30) {
    throw new HttpError(400, "INVALID_DRAFT", "topicResource.questionPrompt is invalid");
  }
  const questionPrompt = value.questionPrompt.map((line, index) => boundedDraftString(
    line,
    `topicResource.questionPrompt[${index}]`,
    4000,
    { allowEmpty: true }
  ));
  if (!Array.isArray(value.questionImages) || value.questionImages.length > 8) {
    throw new HttpError(400, "INVALID_DRAFT", "topicResource.questionImages is invalid");
  }
  const questionImages = value.questionImages.map((image, index) => {
    if (!hasExactKeys(image, ["src", "alt"])) {
      throw new HttpError(400, "INVALID_DRAFT", `topicResource.questionImages[${index}] is invalid`);
    }
    const src = safeWritingPromptImage(image.src);
    if (!src) {
      throw new HttpError(400, "INVALID_DRAFT", `topicResource.questionImages[${index}].src is invalid`);
    }
    return {
      src,
      alt: boundedDraftString(
        image.alt,
        `topicResource.questionImages[${index}].alt`,
        300,
        { allowEmpty: true }
      )
    };
  });
  const normalized = { id, type, label, detail, sectionKey, questionPrompt, questionImages };
  const canonical = CANONICAL_WRITING_TOPICS.get(id);
  if (!canonical || JSON.stringify(normalized) !== JSON.stringify(canonical)) {
    throw new HttpError(400, "INVALID_DRAFT", "topicResource is not a canonical Writing Practice topic");
  }
  return canonical;
}

function authorizeTopicResource(resource, student) {
  if (resource === null) return null;
  if (
    !student?.access
    || !resource.sectionKey
    || student.access[resource.sectionKey] === false
  ) {
    throw new HttpError(403, "TOPIC_ACCESS_DENIED", "This Writing Practice topic is not available to this account");
  }
  return resource;
}

function normalizeDraftCountdown(value) {
  const allowed = new Set([
    "status", "durationSeconds", "remainingSeconds", "endsAt", "forceSubmit",
    "autoSubmitAttemptedAt", "autoSubmitError"
  ]);
  if (!hasOnlyKeys(value, allowed)) {
    throw new HttpError(400, "INVALID_DRAFT", "countdown has an invalid shape");
  }
  const status = String(value.status || "");
  if (!new Set(["idle", "running", "paused", "expired"]).has(status)) {
    throw new HttpError(400, "INVALID_DRAFT", "countdown.status is invalid");
  }
  const integer = (candidate, maximum, label) => {
    const parsed = Number(candidate);
    if (!Number.isSafeInteger(parsed) || parsed < 0 || parsed > maximum) {
      throw new HttpError(400, "INVALID_DRAFT", `${label} is invalid`);
    }
    return parsed;
  };
  return {
    status,
    durationSeconds: integer(value.durationSeconds, 43200, "countdown.durationSeconds"),
    remainingSeconds: integer(value.remainingSeconds, 43200, "countdown.remainingSeconds"),
    endsAt: integer(value.endsAt, 9007199254740991, "countdown.endsAt"),
    forceSubmit: value.forceSubmit === true,
    autoSubmitAttemptedAt: integer(
      value.autoSubmitAttemptedAt,
      9007199254740991,
      "countdown.autoSubmitAttemptedAt"
    ),
    autoSubmitError: boundedDraftString(
      value.autoSubmitError,
      "countdown.autoSubmitError",
      300,
      { allowEmpty: true }
    )
  };
}

function normalizeDraftStopwatch(value) {
  if (!hasExactKeys(value, ["status", "accumulatedMilliseconds", "startedAt"])) {
    throw new HttpError(400, "INVALID_DRAFT", "stopwatch has an invalid shape");
  }
  const status = String(value.status || "");
  if (!new Set(["idle", "running", "paused"]).has(status)) {
    throw new HttpError(400, "INVALID_DRAFT", "stopwatch.status is invalid");
  }
  const accumulatedMilliseconds = Number(value.accumulatedMilliseconds);
  const startedAt = Number(value.startedAt);
  if (
    !Number.isSafeInteger(accumulatedMilliseconds)
    || accumulatedMilliseconds < 0
    || accumulatedMilliseconds > 31536000000
    || !Number.isSafeInteger(startedAt)
    || startedAt < 0
  ) {
    throw new HttpError(400, "INVALID_DRAFT", "stopwatch timing is invalid");
  }
  return { status, accumulatedMilliseconds, startedAt };
}

function normalizeDraftPayload(payload) {
  const keys = [
    "topic", "answer", "topicResource", "imageZoom", "countdown", "stopwatch",
    "durationSeconds"
  ];
  if (!hasExactKeys(payload, keys)) {
    throw new HttpError(400, "INVALID_DRAFT", "Draft payload has an invalid shape");
  }
  const topic = normalizeOptionalWritingText(payload.topic, "topic", MAX_TOPIC_CHARACTERS, MAX_TOPIC_BYTES);
  const answer = normalizeOptionalWritingText(payload.answer, "answer", MAX_ANSWER_CHARACTERS, MAX_ANSWER_BYTES);
  if (!topic.trim() && !answer.trim()) {
    throw new HttpError(400, "INVALID_DRAFT", "A draft needs a topic or writing content");
  }
  const imageZoomTenths = Math.round(Number(payload.imageZoom) * 10);
  if (!Number.isFinite(Number(payload.imageZoom)) || !WRITING_IMAGE_ZOOM_TENTHS.has(imageZoomTenths)) {
    throw new HttpError(400, "INVALID_DRAFT", "imageZoom is invalid");
  }
  const durationSeconds = Number(payload.durationSeconds);
  if (!Number.isSafeInteger(durationSeconds) || durationSeconds < 0 || durationSeconds > 31536000) {
    throw new HttpError(400, "INVALID_DRAFT", "durationSeconds is invalid");
  }
  return {
    topic,
    answer,
    topicResource: normalizeDraftTopicResource(payload.topicResource),
    imageZoomTenths,
    countdown: normalizeDraftCountdown(payload.countdown),
    stopwatch: normalizeDraftStopwatch(payload.stopwatch),
    durationSeconds
  };
}

function draftResponse(row) {
  const response = {
    id: String(row.id || ""),
    topic: String(row.topic || ""),
    answerPreview: String(row.answer_preview || ""),
    wordCount: Number(row.word_count || 0),
    durationSeconds: Number(row.duration_seconds || 0),
    imageZoom: Number(row.image_zoom_tenths || 10) / 10,
    createdAt: String(row.created_at || ""),
    updatedAt: String(row.updated_at || "")
  };
  if (Object.prototype.hasOwnProperty.call(row, "answer")) response.answer = String(row.answer || "");
  if (Object.prototype.hasOwnProperty.call(row, "topic_resource")) {
    response.topicResource = row.topic_resource && typeof row.topic_resource === "object"
      ? row.topic_resource
      : null;
  }
  if (Object.prototype.hasOwnProperty.call(row, "countdown_state")) {
    response.countdown = row.countdown_state;
  }
  if (Object.prototype.hasOwnProperty.call(row, "stopwatch_state")) {
    response.stopwatch = row.stopwatch_state;
  }
  return response;
}

function submissionResponse(row) {
  const response = {
    id: String(row.id || ""),
    topic: String(row.topic || ""),
    wordCount: Number(row.word_count || 0),
    durationSeconds: Number(row.duration_seconds || 0),
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
  if (Object.prototype.hasOwnProperty.call(row, "deleted_at")) {
    response.deletedAt = row.deleted_at ? String(row.deleted_at) : null;
  }
  if (Object.prototype.hasOwnProperty.call(row, "topic_resource")) {
    response.topicResource = row.topic_resource && typeof row.topic_resource === "object"
      ? row.topic_resource
      : null;
  }
  if (Object.prototype.hasOwnProperty.call(row, "has_published_feedback")) {
    response.hasPublishedFeedback = row.has_published_feedback === true;
  }
  if (Object.prototype.hasOwnProperty.call(row, "feedback_unread")) {
    response.feedbackUnread = row.feedback_unread === true;
  }
  return response;
}

function feedbackResponse(row) {
  const fragments = Array.isArray(row.fragments) ? row.fragments : [];
  return {
    id: String(row.id || ""),
    submissionId: String(row.submission_id || ""),
    overallComment: String(row.overall_comment || ""),
    finalComment: String(row.final_comment || ""),
    improvedVersion: String(row.improved_version || ""),
    status: row.status === "published" ? "published" : "draft",
    version: Number(row.version || 0),
    publishedAt: row.published_at ? String(row.published_at) : null,
    updatedAt: String(row.updated_at || ""),
    grammarPoints: feedbackRichTextResponse(row.grammar_points),
    sentenceStructureMethods: feedbackRichTextResponse(row.sentence_structure_methods),
    sentenceStructureLinks: sentenceStructureLinksResponse(row.sentence_structure_links),
    sentenceStructureParts: feedbackStructuredPartsResponse(row.sentence_structure_parts),
    rhetoricalParts: feedbackStructuredPartsResponse(row.rhetorical_parts),
    phrasalVerbParts: feedbackStructuredPartsResponse(row.phrasal_verb_parts),
    writingCommonExpressionParts: feedbackStructuredPartsResponse(row.writing_common_expression_parts),
    rhetoricalCommonExpressionParts: feedbackStructuredPartsResponse(row.rhetorical_common_expression_parts),
    enhancementCopies: enhancementCopiesResponse(row.enhancement_copies),
    fragments: fragments.map((fragment, index) => {
      const originalFragment = String(
        fragment?.originalFragment ?? fragment?.original_fragment ?? ""
      );
      const edmundComment = String(
        fragment?.edmundComment ?? fragment?.edmund_comment ?? ""
      );
      const suggestedWriting = String(
        fragment?.suggestedWriting ?? fragment?.suggested_writing ?? ""
      );
      return {
        id: fragment && fragment.id ? String(fragment.id) : null,
        position: Number(fragment && fragment.position ? fragment.position : index + 1),
        originalFragment,
        edmundComment,
        suggestedWriting,
        originalFormatting: feedbackFormattingResponse(
          fragment?.originalFormatting ?? fragment?.original_formatting,
          originalFragment.length
        ),
        commentFormatting: feedbackFormattingResponse(
          fragment?.commentFormatting ?? fragment?.comment_formatting,
          edmundComment.length
        ),
        suggestionFormatting: feedbackFormattingResponse(
          fragment?.suggestionFormatting ?? fragment?.suggestion_formatting,
          suggestedWriting.length
        ),
        suggestionCopyText: String(
          fragment?.suggestionCopyText ?? fragment?.suggestion_copy_text ?? ""
        ),
        suggestionCopyVersion: Math.max(0, Number(
          fragment?.suggestionCopyVersion ?? fragment?.suggestion_copy_version ?? 0
        )),
        suggestionCopyUpdatedAt: (
          fragment?.suggestionCopyUpdatedAt ?? fragment?.suggestion_copy_updated_at
        ) ? String(fragment?.suggestionCopyUpdatedAt ?? fragment?.suggestion_copy_updated_at) : null,
        bookmarked: (fragment?.bookmarked ?? false) === true,
        bookmarkVersion: Math.max(0, Number(
          fragment?.bookmarkVersion ?? fragment?.bookmark_version ?? 0
        ))
      };
    }),
    transcriptionImproved: String(row.transcription_improved || ""),
    transcriptionModel: String(row.transcription_model || ""),
    transcriptionVersion: Math.max(0, Number(row.transcription_version || 0)),
    topicResource: row.topic_resource && typeof row.topic_resource === "object" ? row.topic_resource : null
  };
}

function feedbackRichTextResponse(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, MAX_FEEDBACK_RICH_TEXT_ITEMS).flatMap((item) => {
    if (!isPlainObject(item)) return [];
    const text = String(item.text || "");
    return [{
      text,
      formatting: feedbackFormattingResponse(item.formatting, text.length)
    }];
  });
}

function sentenceStructureLinksResponse(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, MAX_SENTENCE_STRUCTURE_LINKS).flatMap((item) => {
    if (!isPlainObject(item)) return [];
    return [{ label: String(item.label || ""), url: String(item.url || "") }];
  });
}

function feedbackRichTextValueResponse(value) {
  if (!isPlainObject(value)) return { text: "", formatting: [] };
  const text = String(value.text || "");
  return {
    text,
    formatting: feedbackFormattingResponse(value.formatting, text.length)
  };
}

function feedbackStructuredPartsResponse(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, MAX_FEEDBACK_RICH_TEXT_ITEMS).flatMap((item) => {
    if (!isPlainObject(item)) return [];
    return [{
      originalSentence: feedbackRichTextValueResponse(item.originalSentence),
      enhancement: feedbackRichTextValueResponse(item.enhancement),
      benefit: feedbackRichTextValueResponse(item.benefit)
    }];
  });
}

function enhancementCopiesResponse(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value.slice(0, MAX_FEEDBACK_RICH_TEXT_ITEMS * FEEDBACK_ENHANCEMENT_SECTION_KEYS.size)
    .flatMap((item) => {
      if (!isPlainObject(item)) return [];
      const sectionKey = String(item.sectionKey ?? item.section_key ?? "").toLowerCase();
      const itemPosition = Number(item.itemPosition ?? item.item_position ?? 0);
      if (
        !FEEDBACK_ENHANCEMENT_SECTION_KEYS.has(sectionKey)
        || !Number.isInteger(itemPosition)
        || itemPosition < 1
        || itemPosition > MAX_FEEDBACK_RICH_TEXT_ITEMS
      ) return [];
      const key = `${sectionKey}:${itemPosition}`;
      if (seen.has(key)) return [];
      seen.add(key);
      const updatedAt = item.updatedAt ?? item.updated_at;
      return [{
        sectionKey,
        itemPosition,
        text: String(item.text ?? item.copy_text ?? ""),
        version: Math.max(0, Number(item.version || 0)),
        updatedAt: updatedAt ? String(updatedAt) : null
      }];
    });
}

function validFeedbackFormattingRun(run, textLength) {
  const legacyShape = hasExactKeys(run, ["start", "end", "bold", "highlight"]);
  const expandedShape = hasExactKeys(run, [
    "start", "end", "bold", "italic", "strikethrough", "highlight"
  ]);
  return (legacyShape || expandedShape)
    && Number.isInteger(run.start)
    && Number.isInteger(run.end)
    && run.start >= 0
    && run.start < run.end
    && run.end <= textLength
    && typeof run.bold === "boolean"
    && (!expandedShape || (
      typeof run.italic === "boolean" && typeof run.strikethrough === "boolean"
    ))
    && typeof run.highlight === "string"
    && FEEDBACK_HIGHLIGHTS.has(run.highlight);
}

function feedbackFormattingResponse(value, textLength) {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, MAX_FEEDBACK_FORMATTING_RUNS)
    .filter(run => validFeedbackFormattingRun(run, textLength))
    .map(run => ({
      start: run.start,
      end: run.end,
      bold: run.bold,
      italic: run.italic === true,
      strikethrough: run.strikethrough === true,
      highlight: run.highlight
    }));
}

function normalizeFeedbackText(value, label, maximumCharacters) {
  if (typeof value !== "string") {
    throw new HttpError(400, "INVALID_FEEDBACK", `${label} must be text`);
  }
  const normalized = value.replace(/\r\n?/g, "\n");
  if (
    normalized.length > maximumCharacters
    || utf8Length(normalized) > maximumCharacters * 4
    || TEXT_CONTROL_RE.test(normalized)
  ) {
    throw new HttpError(400, "INVALID_FEEDBACK", `${label} is invalid`);
  }
  return normalized;
}

function normalizeFeedbackFormatting(value, label, textLength) {
  if (!Array.isArray(value) || value.length > MAX_FEEDBACK_FORMATTING_RUNS) {
    throw new HttpError(400, "INVALID_FEEDBACK", `${label} must be a valid formatting array`);
  }
  return value.map((run, index) => {
    if (!validFeedbackFormattingRun(run, textLength)) {
      throw new HttpError(400, "INVALID_FEEDBACK", `${label}[${index}] is invalid`);
    }
    const normalized = {
      start: run.start,
      end: run.end,
      bold: run.bold,
      highlight: run.highlight
    };
    if (Object.prototype.hasOwnProperty.call(run, "italic")) {
      normalized.italic = run.italic;
      normalized.strikethrough = run.strikethrough;
    }
    return normalized;
  });
}

function normalizeFeedbackRichTextItems(value, label) {
  if (!Array.isArray(value) || value.length > MAX_FEEDBACK_RICH_TEXT_ITEMS) {
    throw new HttpError(400, "INVALID_FEEDBACK", `${label} must be a valid rich-text array`);
  }
  return value.map((item, index) => {
    if (!hasExactKeys(item, ["text", "formatting"])) {
      throw new HttpError(400, "INVALID_FEEDBACK", `${label}[${index}] has an invalid shape`);
    }
    const text = normalizeFeedbackText(
      item.text,
      `${label}[${index}].text`,
      MAX_FEEDBACK_COMMENT_CHARACTERS
    );
    if (!text.trim()) {
      throw new HttpError(400, "INVALID_FEEDBACK", `${label}[${index}].text cannot be empty`);
    }
    return {
      text,
      formatting: normalizeFeedbackFormatting(
        item.formatting,
        `${label}[${index}].formatting`,
        text.length
      )
    };
  });
}

function normalizeFeedbackRichTextValue(value, label) {
  if (!hasExactKeys(value, ["text", "formatting"])) {
    throw new HttpError(400, "INVALID_FEEDBACK", `${label} has an invalid shape`);
  }
  const text = normalizeFeedbackText(value.text, `${label}.text`, MAX_FEEDBACK_COMMENT_CHARACTERS);
  return {
    text,
    formatting: normalizeFeedbackFormatting(value.formatting, `${label}.formatting`, text.length)
  };
}

function normalizeFeedbackStructuredParts(value, label) {
  if (!Array.isArray(value) || value.length > MAX_FEEDBACK_RICH_TEXT_ITEMS) {
    throw new HttpError(400, "INVALID_FEEDBACK", `${label} must be a valid structured-parts array`);
  }
  return value.map((item, index) => {
    if (!hasExactKeys(item, ["originalSentence", "enhancement", "benefit"])) {
      throw new HttpError(400, "INVALID_FEEDBACK", `${label}[${index}] has an invalid shape`);
    }
    const originalSentence = normalizeFeedbackRichTextValue(
      item.originalSentence,
      `${label}[${index}].originalSentence`
    );
    const enhancement = normalizeFeedbackRichTextValue(
      item.enhancement,
      `${label}[${index}].enhancement`
    );
    const benefit = normalizeFeedbackRichTextValue(
      item.benefit,
      `${label}[${index}].benefit`
    );
    if (!originalSentence.text.trim() && !enhancement.text.trim() && !benefit.text.trim()) {
      throw new HttpError(400, "INVALID_FEEDBACK", `${label}[${index}] is empty`);
    }
    return { originalSentence, enhancement, benefit };
  });
}

function normalizeSentenceStructureLinks(value) {
  if (!Array.isArray(value) || value.length > MAX_SENTENCE_STRUCTURE_LINKS) {
    throw new HttpError(400, "INVALID_FEEDBACK", "sentenceStructureLinks must be a valid array");
  }
  return value.map((item, index) => {
    if (!hasExactKeys(item, ["label", "url"])) {
      throw new HttpError(
        400,
        "INVALID_FEEDBACK",
        `sentenceStructureLinks[${index}] has an invalid shape`
      );
    }
    const label = normalizeFeedbackText(
      item.label,
      `sentenceStructureLinks[${index}].label`,
      MAX_SENTENCE_STRUCTURE_LINK_LABEL_CHARACTERS
    );
    const rawUrl = normalizeFeedbackText(
      item.url,
      `sentenceStructureLinks[${index}].url`,
      MAX_SENTENCE_STRUCTURE_LINK_URL_CHARACTERS
    );
    if (!label.trim() || rawUrl.trim() !== rawUrl) {
      throw new HttpError(400, "INVALID_FEEDBACK", `sentenceStructureLinks[${index}] is invalid`);
    }
    let parsed;
    try {
      parsed = new URL(rawUrl, "https://writing-links.invalid");
    } catch {
      throw new HttpError(400, "INVALID_FEEDBACK", `sentenceStructureLinks[${index}].url is invalid`);
    }
    const parameters = [...parsed.searchParams.entries()];
    const lesson = parameters.length === 1 && parameters[0][0] === "lesson"
      ? parameters[0][1]
      : "";
    if (
      !rawUrl.startsWith("/")
      || rawUrl.startsWith("//")
      || parsed.origin !== "https://writing-links.invalid"
      || parsed.pathname !== "/sentence-structure.html"
      || parsed.username
      || parsed.password
      || parsed.hash
      || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(lesson)
    ) {
      throw new HttpError(
        400,
        "INVALID_FEEDBACK",
        `sentenceStructureLinks[${index}].url must target the sentence structure system`
      );
    }
    return {
      label,
      url: `/sentence-structure.html?lesson=${encodeURIComponent(lesson)}`
    };
  });
}

function normalizeFeedbackPayload(payload) {
  if (!isPlainObject(payload)) {
    throw new HttpError(400, "INVALID_FEEDBACK", "Feedback payload has an invalid shape");
  }
  const baseKeys = new Set([
    "overallComment",
    "fragments",
    "finalComment",
    "improvedVersion",
    "status",
    "expectedVersion",
    "expectedFeedbackId"
  ]);
  const extendedKeys = new Set([
    ...baseKeys,
    "grammarPoints",
    "sentenceStructureMethods",
    "sentenceStructureLinks"
  ]);
  const legacyStructuredKeys = new Set([
    ...extendedKeys,
    "sentenceStructureParts",
    "rhetoricalParts"
  ]);
  const structuredKeys = new Set([
    ...legacyStructuredKeys,
    "phrasalVerbParts",
    "writingCommonExpressionParts",
    "rhetoricalCommonExpressionParts"
  ]);
  const hasExtendedFields = [
    "grammarPoints", "sentenceStructureMethods", "sentenceStructureLinks"
  ].some((key) => Object.prototype.hasOwnProperty.call(payload, key));
  const legacyStructuredFieldNames = ["sentenceStructureParts", "rhetoricalParts"];
  const additionalStructuredFieldNames = [
    "phrasalVerbParts",
    "writingCommonExpressionParts",
    "rhetoricalCommonExpressionParts"
  ];
  const hasLegacyStructuredFields = legacyStructuredFieldNames
    .some((key) => Object.prototype.hasOwnProperty.call(payload, key));
  const hasAdditionalStructuredFields = additionalStructuredFieldNames
    .some((key) => Object.prototype.hasOwnProperty.call(payload, key));
  const hasStructuredFields = hasLegacyStructuredFields || hasAdditionalStructuredFields;
  const allowedKeys = hasAdditionalStructuredFields
    ? structuredKeys
    : (hasStructuredFields ? legacyStructuredKeys : (hasExtendedFields ? extendedKeys : baseKeys));
  if (!hasOnlyKeys(payload, allowedKeys) || ![
    "overallComment", "fragments", "finalComment", "status", "expectedVersion", "expectedFeedbackId"
  ].every((key) => Object.prototype.hasOwnProperty.call(payload, key)) || (
    (hasExtendedFields || hasStructuredFields) && ![
      "grammarPoints", "sentenceStructureMethods", "sentenceStructureLinks"
    ].every((key) => Object.prototype.hasOwnProperty.call(payload, key))
  ) || (
    hasStructuredFields && !legacyStructuredFieldNames
      .every((key) => Object.prototype.hasOwnProperty.call(payload, key))
  ) || (
    hasAdditionalStructuredFields && !additionalStructuredFieldNames
      .every((key) => Object.prototype.hasOwnProperty.call(payload, key))
  )) {
    throw new HttpError(400, "INVALID_FEEDBACK", "Feedback payload has an invalid shape");
  }
  const expectedVersion = payload.expectedVersion;
  if (!Number.isInteger(expectedVersion) || expectedVersion < 0 || expectedVersion > 2147483647) {
    throw new HttpError(400, "INVALID_FEEDBACK", "expectedVersion is invalid");
  }
  const expectedFeedbackId = payload.expectedFeedbackId;
  if (
    (expectedVersion === 0 && expectedFeedbackId !== null)
    || (
      expectedVersion > 0
      && (typeof expectedFeedbackId !== "string" || !UUID_RE.test(expectedFeedbackId))
    )
  ) {
    throw new HttpError(400, "INVALID_FEEDBACK", "expectedFeedbackId is invalid");
  }
  const status = String(payload.status || "");
  if (status !== "draft" && status !== "published") {
    throw new HttpError(400, "INVALID_FEEDBACK", "Feedback status is invalid");
  }
  const overallComment = normalizeFeedbackText(
    payload.overallComment,
    "overallComment",
    MAX_FEEDBACK_HEADER_CHARACTERS
  );
  const finalComment = normalizeFeedbackText(
    payload.finalComment,
    "finalComment",
    MAX_FEEDBACK_HEADER_CHARACTERS
  );
  const improvedVersion = normalizeFeedbackText(
    payload.improvedVersion === undefined ? "" : payload.improvedVersion,
    "improvedVersion",
    100000
  );
  if (!Array.isArray(payload.fragments) || payload.fragments.length > MAX_FEEDBACK_FRAGMENTS) {
    throw new HttpError(400, "INVALID_FEEDBACK", "Feedback fragments are invalid");
  }
  const fragments = payload.fragments.map((fragment, index) => {
    const legacyShape = hasExactKeys(fragment, ["originalFragment", "edmundComment"]);
    const enhancedShape = hasExactKeys(fragment, [
      "originalFragment",
      "edmundComment",
      "suggestedWriting",
      "originalFormatting",
      "commentFormatting",
      "suggestionFormatting"
    ]);
    const versionedShape = hasExactKeys(fragment, [
      "id",
      "originalFragment",
      "edmundComment",
      "suggestedWriting",
      "originalFormatting",
      "commentFormatting",
      "suggestionFormatting"
    ]);
    if (!legacyShape && !enhancedShape && !versionedShape) {
      throw new HttpError(400, "INVALID_FEEDBACK", `fragments[${index}] has an invalid shape`);
    }
    if (expectedVersion > 0 && !versionedShape) {
      throw new HttpError(
        400,
        "INVALID_FEEDBACK",
        `fragments[${index}].id is required when updating feedback`
      );
    }
    const fragmentId = versionedShape ? fragment.id : null;
    if (fragmentId !== null && (typeof fragmentId !== "string" || !UUID_RE.test(fragmentId))) {
      throw new HttpError(400, "INVALID_FEEDBACK", `fragments[${index}].id is invalid`);
    }
    const originalFragment = normalizeFeedbackText(
      fragment.originalFragment,
      `fragments[${index}].originalFragment`,
      MAX_FEEDBACK_FRAGMENT_CHARACTERS
    );
    const edmundComment = normalizeFeedbackText(
      fragment.edmundComment,
      `fragments[${index}].edmundComment`,
      MAX_FEEDBACK_COMMENT_CHARACTERS
    );
    const suggestedWriting = normalizeFeedbackText(
      enhancedShape || versionedShape ? fragment.suggestedWriting : "",
      `fragments[${index}].suggestedWriting`,
      MAX_FEEDBACK_SUGGESTION_CHARACTERS
    );
    const originalFormatting = normalizeFeedbackFormatting(
      enhancedShape || versionedShape ? fragment.originalFormatting : [],
      `fragments[${index}].originalFormatting`,
      originalFragment.length
    );
    const commentFormatting = normalizeFeedbackFormatting(
      enhancedShape || versionedShape ? fragment.commentFormatting : [],
      `fragments[${index}].commentFormatting`,
      edmundComment.length
    );
    const suggestionFormatting = normalizeFeedbackFormatting(
      enhancedShape || versionedShape ? fragment.suggestionFormatting : [],
      `fragments[${index}].suggestionFormatting`,
      suggestedWriting.length
    );
    if (!originalFragment.trim() && !edmundComment.trim() && !suggestedWriting.trim()) {
      throw new HttpError(400, "INVALID_FEEDBACK", `fragments[${index}] is empty`);
    }
    if (status === "published" && (!originalFragment.trim() || !edmundComment.trim())) {
      throw new HttpError(
        400,
        "INVALID_FEEDBACK",
        `fragments[${index}] must contain an original fragment and Edmund comment before publishing`
      );
    }
    return {
      id: fragmentId === null ? null : fragmentId.toLowerCase(),
      originalFragment,
      edmundComment,
      suggestedWriting,
      originalFormatting,
      commentFormatting,
      suggestionFormatting
    };
  });
  const grammarPoints = hasExtendedFields || hasStructuredFields
    ? normalizeFeedbackRichTextItems(payload.grammarPoints, "grammarPoints")
    : null;
  const sentenceStructureMethods = hasExtendedFields || hasStructuredFields
    ? normalizeFeedbackRichTextItems(payload.sentenceStructureMethods, "sentenceStructureMethods")
    : null;
  const sentenceStructureLinks = hasExtendedFields || hasStructuredFields
    ? normalizeSentenceStructureLinks(payload.sentenceStructureLinks)
    : null;
  const sentenceStructureParts = hasStructuredFields
    ? normalizeFeedbackStructuredParts(payload.sentenceStructureParts, "sentenceStructureParts")
    : null;
  const rhetoricalParts = hasStructuredFields
    ? normalizeFeedbackStructuredParts(payload.rhetoricalParts, "rhetoricalParts")
    : null;
  const phrasalVerbParts = hasAdditionalStructuredFields
    ? normalizeFeedbackStructuredParts(payload.phrasalVerbParts, "phrasalVerbParts")
    : null;
  const writingCommonExpressionParts = hasAdditionalStructuredFields
    ? normalizeFeedbackStructuredParts(
      payload.writingCommonExpressionParts,
      "writingCommonExpressionParts"
    )
    : null;
  const rhetoricalCommonExpressionParts = hasAdditionalStructuredFields
    ? normalizeFeedbackStructuredParts(
      payload.rhetoricalCommonExpressionParts,
      "rhetoricalCommonExpressionParts"
    )
    : null;
  if (
    !overallComment.trim()
    && !finalComment.trim()
    && !improvedVersion.trim()
    && fragments.length === 0
    && (!grammarPoints || grammarPoints.length === 0)
    && (!sentenceStructureMethods || sentenceStructureMethods.length === 0)
    && (!sentenceStructureLinks || sentenceStructureLinks.length === 0)
    && (!sentenceStructureParts || sentenceStructureParts.length === 0)
    && (!rhetoricalParts || rhetoricalParts.length === 0)
    && (!phrasalVerbParts || phrasalVerbParts.length === 0)
    && (!writingCommonExpressionParts || writingCommonExpressionParts.length === 0)
    && (!rhetoricalCommonExpressionParts || rhetoricalCommonExpressionParts.length === 0)
  ) {
    throw new HttpError(400, "INVALID_FEEDBACK", "Feedback cannot be empty");
  }
  return {
    overallComment,
    fragments,
    finalComment,
    improvedVersion,
    grammarPoints,
    sentenceStructureMethods,
    sentenceStructureLinks,
    sentenceStructureParts,
    rhetoricalParts,
    phrasalVerbParts,
    writingCommonExpressionParts,
    rhetoricalCommonExpressionParts,
    status,
    expectedVersion,
    expectedFeedbackId: expectedFeedbackId === null ? null : expectedFeedbackId.toLowerCase()
  };
}

function normalizeFeedbackDeletePayload(payload) {
  if (!hasExactKeys(payload, ["expectedVersion", "expectedFeedbackId"])) {
    throw new HttpError(400, "INVALID_FEEDBACK", "Feedback deletion payload has an invalid shape");
  }
  const expectedVersion = payload.expectedVersion;
  if (!Number.isInteger(expectedVersion) || expectedVersion < 1 || expectedVersion > 2147483647) {
    throw new HttpError(400, "INVALID_FEEDBACK", "expectedVersion is invalid");
  }
  if (typeof payload.expectedFeedbackId !== "string" || !UUID_RE.test(payload.expectedFeedbackId)) {
    throw new HttpError(400, "INVALID_FEEDBACK", "expectedFeedbackId is invalid");
  }
  return {
    expectedVersion,
    expectedFeedbackId: payload.expectedFeedbackId.toLowerCase()
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
  const rows = await rpc(env, "writing_submission_list_v3", {
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

async function listDrafts(request, env, url) {
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  const { page, pageSize, offset } = pageParameters(url, MAX_PAGE_SIZE);
  const rows = await rpc(env, "writing_submission_list_drafts", {
    p_student_id: student.id,
    p_limit: pageSize + 1,
    p_offset: offset
  });
  if (!Array.isArray(rows)) {
    throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Draft history returned an invalid response");
  }
  const hasMore = rows.length > pageSize;
  return json({
    drafts: rows.slice(0, pageSize).map(draftResponse),
    page,
    pageSize,
    hasMore
  }, 200, request, env);
}

async function getDraft(request, env, draftId) {
  if (!UUID_RE.test(draftId)) throw new HttpError(404, "DRAFT_NOT_FOUND", "Draft not found");
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  const row = singleRow(await rpc(env, "writing_submission_get_draft", {
    p_student_id: student.id,
    p_id: draftId.toLowerCase()
  }));
  if (!row) throw new HttpError(404, "DRAFT_NOT_FOUND", "Draft not found");
  return json({ draft: draftResponse(row) }, 200, request, env);
}

async function putDraft(request, env, draftId) {
  if (!UUID_RE.test(draftId)) throw new HttpError(404, "DRAFT_NOT_FOUND", "Draft not found");
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  await enforceRateLimit(
    env.SUBMISSION_WRITE_RATE_LIMITER,
    `writing-submission-draft:${student.id}`,
    "Draft saving is temporarily unavailable",
    "TOO_MANY_DRAFT_WRITES",
    "Too many draft updates; please wait and try again"
  );
  const payload = normalizeDraftPayload(await readLimitedJson(request, MAX_DRAFT_BODY_BYTES));
  payload.topicResource = authorizeTopicResource(payload.topicResource, student);
  const row = singleRow(await rpc(env, "writing_submission_save_draft", {
    p_id: draftId.toLowerCase(),
    p_student_id: student.id,
    p_topic: payload.topic,
    p_answer: payload.answer,
    p_topic_resource: payload.topicResource,
    p_image_zoom_tenths: payload.imageZoomTenths,
    p_countdown_state: payload.countdown,
    p_stopwatch_state: payload.stopwatch,
    p_duration_seconds: payload.durationSeconds
  }));
  if (!row) throw new HttpError(409, "DRAFT_NOT_SAVED", "Draft could not be saved");
  return json({ draft: draftResponse(row) }, 200, request, env);
}

async function deleteDraft(request, env, draftId) {
  if (!UUID_RE.test(draftId)) throw new HttpError(404, "DRAFT_NOT_FOUND", "Draft not found");
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  await enforceRateLimit(
    env.SUBMISSION_WRITE_RATE_LIMITER,
    `writing-submission-draft-delete:${student.id}`,
    "Draft deletion is temporarily unavailable",
    "TOO_MANY_DRAFT_WRITES",
    "Too many draft updates; please wait and try again"
  );
  const deleted = Number(await rpc(env, "writing_submission_delete_draft", {
    p_student_id: student.id,
    p_id: draftId.toLowerCase()
  }));
  if (deleted !== 1) throw new HttpError(404, "DRAFT_NOT_FOUND", "Draft not found");
  return emptyResponse(204, request, env);
}

async function getSubmission(request, env, submissionId) {
  if (!UUID_RE.test(submissionId)) {
    throw new HttpError(404, "SUBMISSION_NOT_FOUND", "Submission not found");
  }
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  const normalizedId = submissionId.toLowerCase();
  const row = singleRow(await rpc(env, "writing_submission_get_v3", {
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
  payload.topicResource = authorizeTopicResource(payload.topicResource, student);
  const row = singleRow(await rpc(env, "writing_submission_submit_v4", {
    p_id: submissionId.toLowerCase(),
    p_student_id: student.id,
    p_topic: payload.topic,
    p_answer: payload.answer,
    p_word_count: payload.wordCount,
    p_duration_seconds: payload.durationSeconds,
    p_topic_resource: payload.topicResource
  }));
  if (!row) {
    throw new HttpError(409, "SUBMISSION_LIMIT_REACHED", "Submission could not be saved");
  }
  return json({ submission: submissionResponse(row) }, 200, request, env);
}

async function deleteSubmission(request, env, submissionId) {
  if (!UUID_RE.test(submissionId)) {
    throw new HttpError(404, "SUBMISSION_NOT_FOUND", "Submission not found");
  }
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  await enforceRateLimit(
    env.SUBMISSION_WRITE_RATE_LIMITER,
    `writing-submission-delete:${student.id}`,
    "Submission archive updates are temporarily unavailable",
    "TOO_MANY_SUBMISSION_WRITES",
    "Too many submission updates; please wait and try again"
  );
  const row = singleRow(await rpc(env, "writing_submission_soft_delete", {
    p_student_id: student.id,
    p_id: submissionId.toLowerCase()
  }));
  if (!row) throw new HttpError(404, "SUBMISSION_NOT_FOUND", "Submission not found");
  return json({
    deleted: {
      id: String(row.id || submissionId).toLowerCase(),
      deletedAt: String(row.deleted_at || "")
    }
  }, 200, request, env);
}

async function getSubmissionFeedback(request, env, submissionId) {
  if (!UUID_RE.test(submissionId)) {
    throw new HttpError(404, "SUBMISSION_NOT_FOUND", "Submission not found");
  }
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  const row = singleRow(await rpc(env, "writing_submission_feedback_student_open_v4", {
    p_student_id: student.id,
    p_submission_id: submissionId.toLowerCase()
  }));
  return json({ feedback: row ? feedbackResponse(row) : null }, 200, request, env);
}

function normalizeSuggestionCopyPayload(payload) {
  if (!hasExactKeys(payload, ["text", "expectedVersion"])) {
    throw new HttpError(400, "INVALID_SUGGESTION_COPY", "Suggestion-copy payload has an invalid shape");
  }
  if (typeof payload.text !== "string") {
    throw new HttpError(400, "INVALID_SUGGESTION_COPY", "Suggestion copy must be text");
  }
  const text = payload.text.replace(/\r\n?/g, "\n");
  if (
    text.length > MAX_FEEDBACK_SUGGESTION_CHARACTERS
    || utf8Length(text) > MAX_FEEDBACK_SUGGESTION_CHARACTERS * 4
    || TEXT_CONTROL_RE.test(text)
  ) {
    throw new HttpError(400, "INVALID_SUGGESTION_COPY", "Suggestion copy is invalid");
  }
  const expectedVersion = payload.expectedVersion;
  if (!Number.isInteger(expectedVersion) || expectedVersion < 0 || expectedVersion > 2147483647) {
    throw new HttpError(400, "INVALID_SUGGESTION_COPY", "expectedVersion is invalid");
  }
  return { text, expectedVersion };
}

async function putSuggestionCopy(request, env, submissionId, fragmentId) {
  if (!UUID_RE.test(submissionId) || !UUID_RE.test(fragmentId)) {
    throw new HttpError(404, "FEEDBACK_FRAGMENT_NOT_FOUND", "Feedback fragment not found");
  }
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  await enforceRateLimit(
    env.SUBMISSION_WRITE_RATE_LIMITER,
    `writing-submission-suggestion-copy:${student.id}`,
    "Suggestion-copy saving is temporarily unavailable",
    "TOO_MANY_SUBMISSION_WRITES",
    "Too many suggestion-copy updates; please wait and try again"
  );
  const payload = normalizeSuggestionCopyPayload(
    await readLimitedJson(request, MAX_FRAGMENT_COPY_BODY_BYTES)
  );
  const normalizedFragmentId = fragmentId.toLowerCase();
  const row = singleRow(await rpc(
    env,
    "writing_submission_feedback_student_save_fragment_copy_v2",
    {
      p_student_id: student.id,
      p_submission_id: submissionId.toLowerCase(),
      p_fragment_id: normalizedFragmentId,
      p_copy_text: payload.text,
      p_expected_version: payload.expectedVersion
    },
    {
      P4092: {
        status: 409,
        code: "SUGGESTION_COPY_VERSION_CONFLICT",
        message: "This suggestion copy changed in another session; reload before saving again"
      }
    }
  ));
  if (!row) throw new HttpError(404, "FEEDBACK_FRAGMENT_NOT_FOUND", "Feedback fragment not found");
  return json({
    suggestionCopy: {
      fragmentId: String(row.fragment_id || normalizedFragmentId),
      text: String(row.copy_text || ""),
      version: Math.max(0, Number(row.version || 0)),
      updatedAt: String(row.updated_at || "")
    }
  }, 200, request, env);
}

async function putEnhancementCopy(request, env, submissionId, sectionKey, itemPosition) {
  if (
    !UUID_RE.test(submissionId)
    || !FEEDBACK_ENHANCEMENT_SECTION_KEYS.has(sectionKey)
    || !Number.isInteger(itemPosition)
    || itemPosition < 1
    || itemPosition > MAX_FEEDBACK_RICH_TEXT_ITEMS
  ) {
    throw new HttpError(404, "FEEDBACK_ENHANCEMENT_NOT_FOUND", "Feedback enhancement not found");
  }
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  await enforceRateLimit(
    env.SUBMISSION_WRITE_RATE_LIMITER,
    `writing-submission-enhancement-copy:${student.id}`,
    "Enhancement-copy saving is temporarily unavailable",
    "TOO_MANY_SUBMISSION_WRITES",
    "Too many enhancement-copy updates; please wait and try again"
  );
  const payload = normalizeSuggestionCopyPayload(
    await readLimitedJson(request, MAX_FRAGMENT_COPY_BODY_BYTES)
  );
  const row = singleRow(await rpc(
    env,
    "writing_submission_feedback_student_save_enhancement_copy",
    {
      p_student_id: student.id,
      p_submission_id: submissionId.toLowerCase(),
      p_section_key: sectionKey,
      p_item_position: itemPosition,
      p_copy_text: payload.text,
      p_expected_version: payload.expectedVersion
    },
    {
      P4093: {
        status: 409,
        code: "ENHANCEMENT_COPY_VERSION_CONFLICT",
        message: "This enhancement copy changed in another session; reload before saving again"
      }
    }
  ));
  if (!row) {
    throw new HttpError(404, "FEEDBACK_ENHANCEMENT_NOT_FOUND", "Feedback enhancement not found");
  }
  return json({
    enhancementCopy: {
      sectionKey: String(row.section_key || sectionKey),
      itemPosition: Math.max(1, Number(row.item_position || itemPosition)),
      text: String(row.copy_text || ""),
      version: Math.max(0, Number(row.version || 0)),
      updatedAt: String(row.updated_at || "")
    }
  }, 200, request, env);
}

function normalizeFeedbackBookmarkPayload(payload) {
  if (
    !hasExactKeys(payload, ["bookmarked", "expectedVersion"])
    || typeof payload.bookmarked !== "boolean"
    || !Number.isInteger(payload.expectedVersion)
    || payload.expectedVersion < 0
    || payload.expectedVersion > 2147483647
  ) {
    throw new HttpError(400, "INVALID_BOOKMARK", "Bookmark payload has an invalid shape");
  }
  return { bookmarked: payload.bookmarked, expectedVersion: payload.expectedVersion };
}

function feedbackBookmarkResponse(row) {
  const originalFragment = String(row.original_fragment || "");
  const edmundComment = String(row.edmund_comment || "");
  const suggestedWriting = String(row.suggested_writing || "");
  return {
    fragmentId: String(row.fragment_id || ""),
    feedbackId: String(row.feedback_id || ""),
    submissionId: String(row.submission_id || ""),
    topic: String(row.topic || ""),
    position: Math.max(1, Number(row.position || 1)),
    originalFragment,
    edmundComment,
    suggestedWriting,
    originalFormatting: feedbackFormattingResponse(row.original_formatting, originalFragment.length),
    commentFormatting: feedbackFormattingResponse(row.comment_formatting, edmundComment.length),
    suggestionFormatting: feedbackFormattingResponse(row.suggestion_formatting, suggestedWriting.length),
    version: Math.max(1, Number(row.version || 1)),
    updatedAt: String(row.updated_at || ""),
    publishedAt: row.published_at ? String(row.published_at) : null
  };
}

async function listFeedbackBookmarks(request, env, url) {
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  const { page, pageSize, offset } = pageParameters(url, MAX_PAGE_SIZE);
  const rows = await rpc(env, "writing_submission_feedback_bookmarks_list_v2", {
    p_student_id: student.id,
    p_limit: pageSize + 1,
    p_offset: offset
  });
  if (!Array.isArray(rows)) {
    throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Feedback bookmarks returned an invalid response");
  }
  const hasMore = rows.length > pageSize;
  return json({
    bookmarks: rows.slice(0, pageSize).map(feedbackBookmarkResponse),
    page,
    pageSize,
    hasMore
  }, 200, request, env);
}

async function putFeedbackBookmark(request, env, fragmentId) {
  if (!UUID_RE.test(fragmentId)) {
    throw new HttpError(404, "FEEDBACK_FRAGMENT_NOT_FOUND", "Feedback fragment not found");
  }
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  await enforceRateLimit(
    env.SUBMISSION_WRITE_RATE_LIMITER,
    `writing-submission-feedback-bookmark:${student.id}`,
    "Bookmark saving is temporarily unavailable",
    "TOO_MANY_SUBMISSION_WRITES",
    "Too many bookmark updates; please wait and try again"
  );
  const payload = normalizeFeedbackBookmarkPayload(
    await readLimitedJson(request, MAX_BOOKMARK_BODY_BYTES)
  );
  const normalizedFragmentId = fragmentId.toLowerCase();
  const row = singleRow(await rpc(
    env,
    "writing_submission_feedback_bookmark_set_v2",
    {
      p_student_id: student.id,
      p_fragment_id: normalizedFragmentId,
      p_bookmarked: payload.bookmarked,
      p_expected_version: payload.expectedVersion
    },
    {
      P4093: {
        status: 409,
        code: "BOOKMARK_VERSION_CONFLICT",
        message: "This bookmark changed in another session; reload before saving again"
      }
    }
  ));
  if (!row) throw new HttpError(404, "FEEDBACK_FRAGMENT_NOT_FOUND", "Feedback fragment not found");
  return json({
    bookmark: {
      fragmentId: String(row.fragment_id || normalizedFragmentId),
      bookmarked: row.bookmarked === true,
      version: Math.max(1, Number(row.version || 1)),
      updatedAt: String(row.updated_at || "")
    }
  }, 200, request, env);
}

function normalizeTranscriptionPayload(payload) {
  if (!hasExactKeys(payload, ["improvedVersionCopy", "modelEssayCopy", "expectedVersion"])) {
    throw new HttpError(400, "INVALID_TRANSCRIPTION", "Transcription payload has an invalid shape");
  }
  const expectedVersion = Number(payload.expectedVersion);
  if (!Number.isSafeInteger(expectedVersion) || expectedVersion < 0 || expectedVersion > 2147483647) {
    throw new HttpError(400, "INVALID_TRANSCRIPTION", "expectedVersion is invalid");
  }
  return {
    improvedVersionCopy: normalizeFeedbackText(payload.improvedVersionCopy, "improvedVersionCopy", 100000),
    modelEssayCopy: normalizeFeedbackText(payload.modelEssayCopy, "modelEssayCopy", 100000),
    expectedVersion
  };
}

async function putSubmissionTranscriptions(request, env, submissionId) {
  if (!UUID_RE.test(submissionId)) throw new HttpError(404, "SUBMISSION_NOT_FOUND", "Submission not found");
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  await enforceRateLimit(
    env.SUBMISSION_WRITE_RATE_LIMITER,
    `writing-submission-transcription:${student.id}`,
    "Transcription saving is temporarily unavailable",
    "TOO_MANY_SUBMISSION_WRITES",
    "Too many transcription updates; please wait and try again"
  );
  const payload = normalizeTranscriptionPayload(await readLimitedJson(request, MAX_SUBMISSION_BODY_BYTES * 2));
  const row = singleRow(await rpc(env, "writing_submission_feedback_student_save_transcriptions", {
    p_student_id: student.id,
    p_submission_id: submissionId.toLowerCase(),
    p_improved_version_copy: payload.improvedVersionCopy,
    p_model_essay_copy: payload.modelEssayCopy,
    p_expected_version: payload.expectedVersion
  }, {
    P4090: {
      status: 409,
      code: "TRANSCRIPTION_VERSION_CONFLICT",
      message: "Transcriptions were changed in another session; reload before saving again"
    }
  }));
  if (!row) throw new HttpError(404, "FEEDBACK_NOT_FOUND", "Published feedback not found");
  return json({
    transcriptions: {
      improvedVersionCopy: String(row.improved_version_copy || ""),
      modelEssayCopy: String(row.model_essay_copy || ""),
      version: Number(row.version || 0),
      updatedAt: String(row.updated_at || "")
    }
  }, 200, request, env);
}

async function getProgress(request, env) {
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  const rows = await rpc(env, "writing_submission_progress", { p_student_id: student.id });
  if (!Array.isArray(rows)) {
    throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Writing progress returned an invalid response");
  }
  return json({
    progress: rows.map(row => ({
      date: String(row.activity_date || ""),
      articlesWritten: Number(row.articles_written || 0),
      timeSpentSeconds: Number(row.time_spent_seconds || 0),
      averageSeconds: Number(row.average_seconds || 0),
      cumulativeArticles: Number(row.cumulative_articles || 0),
      cumulativeTimeSeconds: Number(row.cumulative_time_seconds || 0)
    }))
  }, 200, request, env);
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

function correctedSentenceFromParts(sentenceText, originalText, suggestedText) {
  const sentence = String(sentenceText || "");
  const original = String(originalText || "");
  const suggested = String(suggestedText || "");
  if (!original) return sentence;
  const index = sentence.indexOf(original);
  if (index < 0) return sentence;
  return `${sentence.slice(0, index)}${suggested}${sentence.slice(index + original.length)}`;
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
    const requiredKeys = [
      "id", "fingerprint", "ruleId", "title", "message",
      "originalText", "suggestedText", "sentenceText", "detectedAt"
    ];
    const allowedKeys = new Set([...requiredKeys, "correctedSentence"]);
    if (
      !hasOnlyKeys(item, allowedKeys)
      || requiredKeys.some(key => !Object.prototype.hasOwnProperty.call(item, key))
    ) {
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
    const sentenceText = boundedOccurrenceText(
      item.sentenceText,
      `occurrences[${index}].sentenceText`,
      10000
    );
    const correctedSentence = Object.prototype.hasOwnProperty.call(item, "correctedSentence")
      ? boundedOccurrenceText(
        item.correctedSentence,
        `occurrences[${index}].correctedSentence`,
        10000
      )
      : correctedSentenceFromParts(sentenceText, originalText, suggestedText);
    validateClientTimestamp(item.detectedAt, `occurrences[${index}].detectedAt`);
    return {
      id,
      fingerprint,
      ruleId,
      title,
      message: boundedOccurrenceText(item.message, `occurrences[${index}].message`, 2000),
      originalText,
      suggestedText,
      sentenceText,
      correctedSentence,
      detectedAt
    };
  });

  return { documentId, occurrences };
}

function occurrenceResponse(row) {
  const sentenceText = String(row.sentence_text || "");
  const originalText = String(row.original_text || "");
  const suggestedText = String(row.suggested_text || "");
  const response = {
    id: String(row.id || ""),
    documentId: String(row.document_id || ""),
    fingerprint: String(row.fingerprint || ""),
    ruleId: String(row.rule_id || ""),
    title: String(row.title || ""),
    message: String(row.message || ""),
    originalText,
    suggestedText,
    sentenceText,
    correctedSentence: String(row.corrected_sentence || "")
      || correctedSentenceFromParts(sentenceText, originalText, suggestedText),
    detectedAt: String(row.detected_at || "")
  };
  if (Object.prototype.hasOwnProperty.call(row, "submission_id")) {
    response.submissionId = row.submission_id ? String(row.submission_id) : null;
    response.sourceTopic = row.source_topic ? String(row.source_topic) : null;
    response.sourceSubmittedAt = row.source_submitted_at
      ? String(row.source_submitted_at)
      : null;
    response.sourceDeletedAt = row.source_deleted_at ? String(row.source_deleted_at) : null;
  }
  if (Object.prototype.hasOwnProperty.call(row, "student_id")) {
    response.studentId = String(row.student_id || "");
    response.studentName = String(row.student_name || "");
  }
  return response;
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

function grammarRuleParameter(url) {
  const ruleId = String(url.searchParams.get("ruleId") || "");
  if (
    !ruleId
    || ruleId.length > 120
    || utf8Length(ruleId) > 480
    || CONTROL_RE.test(ruleId)
  ) {
    throw new HttpError(400, "INVALID_GRAMMAR_RULE", "ruleId is invalid");
  }
  return ruleId;
}

async function listGrammarProblemOccurrences(request, env, url) {
  const student = await authenticateStudent(request, env);
  if (!student) throw new HttpError(401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  const ruleId = grammarRuleParameter(url);
  const { page, pageSize, offset } = pageParameters(url, MAX_GRAMMAR_HISTORY_PAGE_SIZE);
  const rows = await rpc(env, "writing_submission_problem_occurrences", {
    p_student_id: student.id,
    p_rule_id: ruleId,
    p_limit: pageSize + 1,
    p_offset: offset
  });
  if (!Array.isArray(rows)) {
    throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Grammar history returned an invalid response");
  }
  const hasMore = rows.length > pageSize;
  return json({
    grammarOccurrences: rows.slice(0, pageSize).map(occurrenceResponse),
    page,
    pageSize,
    hasMore
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

function adminStudentParameter(url) {
  const studentId = String(url.searchParams.get("studentId") || "").toLowerCase();
  if (!UUID_RE.test(studentId)) {
    throw new HttpError(400, "INVALID_STUDENT", "studentId is invalid");
  }
  return studentId;
}

async function listAdminGrammarProblems(request, env, url) {
  const admin = await authenticateAdmin(request, env);
  if (!admin) throw new HttpError(401, "ADMIN_AUTH_REQUIRED", "Administrator authentication required");
  const studentId = adminStudentParameter(url);
  const rows = await rpc(env, "writing_submission_admin_problem_summary", {
    p_admin_token: admin.token,
    p_student_id: studentId
  });
  if (!Array.isArray(rows)) {
    throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Admin grammar summary returned an invalid response");
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

async function listAdminGrammarProblemOccurrences(request, env, url) {
  const admin = await authenticateAdmin(request, env);
  if (!admin) throw new HttpError(401, "ADMIN_AUTH_REQUIRED", "Administrator authentication required");
  const studentId = adminStudentParameter(url);
  const ruleId = grammarRuleParameter(url);
  const { page, pageSize, offset } = pageParameters(url, MAX_GRAMMAR_HISTORY_PAGE_SIZE);
  const rows = await rpc(env, "writing_submission_admin_problem_occurrences", {
    p_admin_token: admin.token,
    p_student_id: studentId,
    p_rule_id: ruleId,
    p_limit: pageSize + 1,
    p_offset: offset
  });
  if (!Array.isArray(rows)) {
    throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Admin grammar history returned an invalid response");
  }
  const hasMore = rows.length > pageSize;
  return json({
    grammarOccurrences: rows.slice(0, pageSize).map(occurrenceResponse),
    page,
    pageSize,
    hasMore
  }, 200, request, env);
}

function normalizeAdminDeletePayload(payload, expectedKeys) {
  if (!hasExactKeys(payload, expectedKeys) || payload.confirmation !== "DELETE") {
    throw new HttpError(400, "DELETE_CONFIRMATION_REQUIRED", "Explicit deletion confirmation is required");
  }
  const studentId = String(payload.studentId || "").toLowerCase();
  if (!UUID_RE.test(studentId)) {
    throw new HttpError(400, "INVALID_STUDENT", "studentId is invalid");
  }
  return studentId;
}

async function deleteAdminGrammarOccurrence(request, env, occurrenceId) {
  if (!UUID_RE.test(occurrenceId)) {
    throw new HttpError(404, "GRAMMAR_OCCURRENCE_NOT_FOUND", "Grammar occurrence not found");
  }
  const admin = await authenticateAdmin(request, env);
  if (!admin) throw new HttpError(401, "ADMIN_AUTH_REQUIRED", "Administrator authentication required");
  await enforceRateLimit(
    env.SUBMISSION_WRITE_RATE_LIMITER,
    `writing-submission-admin-grammar-delete:${admin.id}`,
    "Grammar deletion is temporarily unavailable",
    "TOO_MANY_ADMIN_WRITES",
    "Too many administrator updates; please wait and try again"
  );
  const payload = await readLimitedJson(request, MAX_LOGIN_BODY_BYTES);
  const studentId = normalizeAdminDeletePayload(payload, ["studentId", "confirmation"]);
  const deleted = Number(await rpc(env, "writing_submission_admin_delete_occurrence", {
    p_admin_token: admin.token,
    p_student_id: studentId,
    p_occurrence_id: occurrenceId.toLowerCase()
  }));
  if (deleted !== 1) {
    throw new HttpError(404, "GRAMMAR_OCCURRENCE_NOT_FOUND", "Grammar occurrence not found");
  }
  return emptyResponse(204, request, env);
}

async function deleteAdminGrammarProblemCategory(request, env) {
  const admin = await authenticateAdmin(request, env);
  if (!admin) throw new HttpError(401, "ADMIN_AUTH_REQUIRED", "Administrator authentication required");
  await enforceRateLimit(
    env.SUBMISSION_WRITE_RATE_LIMITER,
    `writing-submission-admin-grammar-delete:${admin.id}`,
    "Grammar deletion is temporarily unavailable",
    "TOO_MANY_ADMIN_WRITES",
    "Too many administrator updates; please wait and try again"
  );
  const payload = await readLimitedJson(request, MAX_LOGIN_BODY_BYTES);
  const studentId = normalizeAdminDeletePayload(
    payload,
    ["studentId", "ruleId", "confirmation"]
  );
  const ruleId = String(payload.ruleId || "");
  if (!ruleId || ruleId.length > 120 || utf8Length(ruleId) > 480 || CONTROL_RE.test(ruleId)) {
    throw new HttpError(400, "INVALID_GRAMMAR_RULE", "ruleId is invalid");
  }
  const deleted = Number(await rpc(env, "writing_submission_admin_delete_problem_category", {
    p_admin_token: admin.token,
    p_student_id: studentId,
    p_rule_id: ruleId
  }));
  if (deleted < 1) {
    throw new HttpError(404, "GRAMMAR_PROBLEM_NOT_FOUND", "Grammar problem category not found");
  }
  return json({ deletedCount: deleted }, 200, request, env);
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
  const rows = await rpc(env, "writing_submission_admin_list_submissions_v3", {
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

async function listAdminExplanationReview(request, env, url) {
  const admin = await authenticateAdmin(request, env);
  if (!admin) throw new HttpError(401, "ADMIN_AUTH_REQUIRED", "Administrator authentication required");
  const { page, pageSize, offset } = pageParameters(url, MAX_ADMIN_PAGE_SIZE);
  const rows = await rpc(env, "writing_submission_admin_explanation_review_queue", {
    p_admin_token: admin.token,
    p_limit: pageSize + 1,
    p_offset: offset
  });
  if (!Array.isArray(rows)) {
    throw new HttpError(502, "INVALID_UPSTREAM_RESPONSE", "Explanation review queue returned an invalid response");
  }
  const hasMore = rows.length > pageSize;
  return json({
    grammarOccurrences: rows.slice(0, pageSize).map(occurrenceResponse),
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
  const row = singleRow(await rpc(env, "writing_submission_admin_get_submission_v2", {
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

async function getAdminSubmissionFeedback(request, env, submissionId) {
  if (!UUID_RE.test(submissionId)) {
    throw new HttpError(404, "SUBMISSION_NOT_FOUND", "Submission not found");
  }
  const admin = await authenticateAdmin(request, env);
  if (!admin) throw new HttpError(401, "ADMIN_AUTH_REQUIRED", "Administrator authentication required");
  const row = singleRow(await rpc(env, "writing_submission_feedback_admin_get_v5", {
    p_admin_token: admin.token,
    p_submission_id: submissionId.toLowerCase()
  }));
  return json({ feedback: row ? feedbackResponse(row) : null }, 200, request, env);
}

async function putAdminSubmissionFeedback(request, env, submissionId) {
  if (!UUID_RE.test(submissionId)) {
    throw new HttpError(404, "SUBMISSION_NOT_FOUND", "Submission not found");
  }
  const admin = await authenticateAdmin(request, env);
  if (!admin) throw new HttpError(401, "ADMIN_AUTH_REQUIRED", "Administrator authentication required");
  await enforceRateLimit(
    env.SUBMISSION_WRITE_RATE_LIMITER,
    `writing-submission-admin-feedback:${admin.id}`,
    "Feedback saving is temporarily unavailable",
    "TOO_MANY_ADMIN_WRITES",
    "Too many administrator updates; please wait and try again"
  );
  const payload = normalizeFeedbackPayload(
    await readLimitedJson(request, MAX_FEEDBACK_BODY_BYTES)
  );
  const row = singleRow(await rpc(env, "writing_submission_feedback_admin_save_v4", {
    p_admin_token: admin.token,
    p_submission_id: submissionId.toLowerCase(),
    p_overall_comment: payload.overallComment,
    p_fragments: payload.fragments,
    p_final_comment: payload.finalComment,
    p_improved_version: payload.improvedVersion,
    p_grammar_points: payload.grammarPoints,
    p_sentence_structure_methods: payload.sentenceStructureMethods,
    p_sentence_structure_links: payload.sentenceStructureLinks,
    p_sentence_structure_parts: payload.sentenceStructureParts,
    p_rhetorical_parts: payload.rhetoricalParts,
    p_phrasal_verb_parts: payload.phrasalVerbParts,
    p_writing_common_expression_parts: payload.writingCommonExpressionParts,
    p_rhetorical_common_expression_parts: payload.rhetoricalCommonExpressionParts,
    p_status: payload.status,
    p_expected_version: payload.expectedVersion,
    p_expected_feedback_id: payload.expectedFeedbackId
  }, {
    P4090: {
      status: 409,
      code: "FEEDBACK_VERSION_CONFLICT",
      message: "Feedback was changed in another session; reload it before saving again"
    }
  }));
  if (!row) throw new HttpError(404, "SUBMISSION_NOT_FOUND", "Submission not found");
  return json({ feedback: feedbackResponse(row) }, 200, request, env);
}

async function deleteAdminSubmissionFeedback(request, env, submissionId) {
  if (!UUID_RE.test(submissionId)) {
    throw new HttpError(404, "SUBMISSION_NOT_FOUND", "Submission not found");
  }
  const admin = await authenticateAdmin(request, env);
  if (!admin) throw new HttpError(401, "ADMIN_AUTH_REQUIRED", "Administrator authentication required");
  await enforceRateLimit(
    env.SUBMISSION_WRITE_RATE_LIMITER,
    `writing-submission-admin-feedback:${admin.id}`,
    "Feedback deletion is temporarily unavailable",
    "TOO_MANY_ADMIN_WRITES",
    "Too many administrator updates; please wait and try again"
  );
  const payload = normalizeFeedbackDeletePayload(
    await readLimitedJson(request, MAX_FEEDBACK_DELETE_BODY_BYTES)
  );
  const deleted = Number(await rpc(env, "writing_submission_feedback_admin_delete", {
    p_admin_token: admin.token,
    p_submission_id: submissionId.toLowerCase(),
    p_expected_version: payload.expectedVersion,
    p_expected_feedback_id: payload.expectedFeedbackId
  }, {
    P4090: {
      status: 409,
      code: "FEEDBACK_VERSION_CONFLICT",
      message: "Feedback was changed in another session; reload it before deleting"
    }
  }));
  if (deleted !== 1) throw new HttpError(404, "FEEDBACK_NOT_FOUND", "Feedback not found");
  return emptyResponse(204, request, env);
}
