const UPSTREAM_ORIGIN = "https://edmund-writing-submission.edmundeducation.workers.dev";
const MAX_BODY_BYTES = 512 * 1024;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const PROOFREAD_IDS = new Set('articles plural pronouns spelling tense sentence capitals punctuation missing-words verb-form be-verbs prepositions reference possessives contractions formal word-meaning consistency timeline answer-topic paragraph-idea explanation support opening-ending'.split(' '));
const ALLOWED_ORIGINS = new Set([
  "https://edmundeducation.com",
  "https://www.edmundeducation.com",
  "https://edmundeducation.github.io"
]);

function responseHeaders(origin) {
  const headers = new Headers({
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Expose-Headers": "Retry-After",
    "Cache-Control": "no-store",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff"
  });
  if (ALLOWED_ORIGINS.has(origin)) headers.set("Access-Control-Allow-Origin", origin);
  return headers;
}

function jsonError(origin, status, code, message) {
  const headers = responseHeaders(origin);
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Response(JSON.stringify({ code, error: message }), { status, headers });
}

function validChecklist(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const record = value;
  if (Object.keys(record).sort().join(',') !== 'checkedIds,toggleCount,touchedIds,version'
    || record.version !== 1 || !Number.isSafeInteger(record.toggleCount)
    || record.toggleCount < 0 || record.toggleCount > 100000) return false;
  const validIds = (items) => Array.isArray(items) && items.length <= 24
    && new Set(items).size === items.length && items.every(item => typeof item === 'string' && PROOFREAD_IDS.has(item));
  if (!validIds(record.checkedIds) || !validIds(record.touchedIds)) return false;
  return record.checkedIds.every(id => record.touchedIds.includes(id))
    && record.toggleCount >= record.touchedIds.length;
}

async function databaseRpc(name, payload) {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new Error('Supabase service credentials unavailable');
  const response = await fetch(`${url.replace(/\/+$/u, '')}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json'},
    body: JSON.stringify(payload),
    redirect: 'error'
  });
  if (!response.ok) throw new Error(`Supabase RPC ${name} failed with ${response.status}`);
  return response.json();
}

Deno.serve(async (request) => {
  const origin = String(request.headers.get("Origin") || "");
  if (!ALLOWED_ORIGINS.has(origin)) {
    return jsonError(origin, 403, "ORIGIN_NOT_ALLOWED", "Origin is not allowed");
  }
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: responseHeaders(origin) });
  }
  if (!["GET", "PUT", "POST"].includes(request.method)) {
    return jsonError(origin, 405, "METHOD_NOT_ALLOWED", "Method is not allowed");
  }

  const requestUrl = new URL(request.url);
  const submissionId = String(requestUrl.searchParams.get("submissionId") || "").toLowerCase();
  const operation = String(requestUrl.searchParams.get("operation") || "");
  const adminSubmission = request.method === "POST" && operation === "admin-submission";
  const adminDetail = request.method === "GET" && operation === "admin-submission-detail" && UUID_RE.test(submissionId);
  const studentSubmission = request.method === "PUT" && !operation && UUID_RE.test(submissionId);
  const authorization = String(request.headers.get("Authorization") || "");
  const sessionToken = authorization.replace(/^Bearer\s+/iu, "");
  if ((!adminSubmission && !adminDetail && !studentSubmission) || !UUID_RE.test(sessionToken)) {
    return jsonError(origin, 401, "AUTH_REQUIRED", "A valid session is required");
  }
  if (request.method !== 'GET' && !String(request.headers.get("Content-Type") || "").toLowerCase().startsWith("application/json")) {
    return jsonError(origin, 415, "UNSUPPORTED_MEDIA_TYPE", "Content-Type must be application/json");
  }

  const declaredLength = Number(request.headers.get("Content-Length") || 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return jsonError(origin, 413, "PAYLOAD_TOO_LARGE", "Request body is too large");
  }
  const body = request.method === 'GET' ? new ArrayBuffer(0) : await request.arrayBuffer();
  if (body.byteLength > MAX_BODY_BYTES) {
    return jsonError(origin, 413, "PAYLOAD_TOO_LARGE", "Request body is too large");
  }

  try {
    let upstreamBody = request.method === 'GET' ? undefined : body;
    let checklist = null;
    if (studentSubmission) {
      let submission;
      try { submission = JSON.parse(new TextDecoder().decode(body)); }
      catch { return jsonError(origin, 400, 'INVALID_SUBMISSION', 'Submission payload is invalid'); }
      if (!submission || typeof submission !== 'object' || Array.isArray(submission)) {
        return jsonError(origin, 400, 'INVALID_SUBMISSION', 'Submission payload is invalid');
      }
      if (Object.prototype.hasOwnProperty.call(submission, 'proofreadChecklist')) {
        if (!validChecklist(submission.proofreadChecklist)) {
          return jsonError(origin, 400, 'INVALID_SUBMISSION', 'Proofreading checklist is invalid');
        }
        checklist = submission.proofreadChecklist;
        delete submission.proofreadChecklist;
        upstreamBody = JSON.stringify(submission);
      }
    }
    const upstreamPath = adminSubmission
      ? "/v1/admin/submissions"
      : adminDetail ? `/v1/admin/submissions/${submissionId}` : `/v1/submissions/${submissionId}`;
    const response = await fetch(`${UPSTREAM_ORIGIN}${upstreamPath}`, {
      method: request.method,
      headers: {
        "Authorization": authorization,
        ...(request.method === 'GET' ? {} : {"Content-Type": "application/json"}),
        "Origin": origin
      },
      body: upstreamBody,
      redirect: "manual"
    });
    if (!response.ok || adminSubmission || (studentSubmission && !checklist)) {
      return new Response(response.body, {status: response.status, headers: response.headers});
    }
    if (studentSubmission && checklist) {
      const saved = await databaseRpc('writing_submission_proofread_checklist_save', {
        p_student_token: sessionToken, p_id: submissionId, p_record: checklist
      });
      if (!saved) return jsonError(origin, 502, 'PROOFREAD_SAVE_FAILED', '文章已保存，但校對紀錄未能同步；請再按提交重試。');
      return new Response(response.body, {status: response.status, headers: response.headers});
    }
    if (adminDetail) {
      const rows = await databaseRpc('writing_submission_admin_get_submission_v3', {
        p_admin_token: sessionToken, p_id: submissionId
      });
      if (!Array.isArray(rows) || rows.length !== 1) {
        return jsonError(origin, 502, 'PROOFREAD_READ_FAILED', '暫時未能讀取校對紀錄。');
      }
      const detail = await response.json();
      detail.submission.proofreadChecklist = rows[0].proofread_checklist ?? null;
      const headers = responseHeaders(origin);
      headers.set('Content-Type', 'application/json; charset=utf-8');
      return new Response(JSON.stringify(detail), {status: response.status, headers});
    }
    return new Response(response.body, {
      status: response.status,
      headers: response.headers
    });
  } catch (error) {
    console.error("Writing Submission upstream request failed", {
      operation: adminSubmission ? "admin-submission" : adminDetail ? "admin-detail" : "student-submission",
      submissionId: adminSubmission ? null : submissionId,
      cause: error instanceof Error ? error.message : "Unknown upstream error"
    });
    return jsonError(
      origin,
      502,
      "SUBMISSION_SERVICE_UNREACHABLE",
      "Writing Submission service is temporarily unreachable"
    );
  }
});
