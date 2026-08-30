const UPSTREAM_ORIGIN = "https://edmund-writing-submission.edmundeducation.workers.dev";
const MAX_BODY_BYTES = 512 * 1024;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const ALLOWED_ORIGINS = new Set([
  "https://edmundeducation.com",
  "https://www.edmundeducation.com",
  "https://edmundeducation.github.io"
]);

function responseHeaders(origin) {
  const headers = new Headers({
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": "PUT, OPTIONS",
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

Deno.serve(async (request) => {
  const origin = String(request.headers.get("Origin") || "");
  if (!ALLOWED_ORIGINS.has(origin)) {
    return jsonError(origin, 403, "ORIGIN_NOT_ALLOWED", "Origin is not allowed");
  }
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: responseHeaders(origin) });
  }
  if (request.method !== "PUT") {
    return jsonError(origin, 405, "METHOD_NOT_ALLOWED", "Method is not allowed");
  }

  const requestUrl = new URL(request.url);
  const submissionId = String(requestUrl.searchParams.get("submissionId") || "").toLowerCase();
  const authorization = String(request.headers.get("Authorization") || "");
  const studentToken = authorization.replace(/^Bearer\s+/iu, "");
  if (!UUID_RE.test(submissionId) || !UUID_RE.test(studentToken)) {
    return jsonError(origin, 401, "STUDENT_AUTH_REQUIRED", "Student authentication required");
  }
  if (!String(request.headers.get("Content-Type") || "").toLowerCase().startsWith("application/json")) {
    return jsonError(origin, 415, "UNSUPPORTED_MEDIA_TYPE", "Content-Type must be application/json");
  }

  const declaredLength = Number(request.headers.get("Content-Length") || 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return jsonError(origin, 413, "PAYLOAD_TOO_LARGE", "Request body is too large");
  }
  const body = await request.arrayBuffer();
  if (body.byteLength > MAX_BODY_BYTES) {
    return jsonError(origin, 413, "PAYLOAD_TOO_LARGE", "Request body is too large");
  }

  try {
    const response = await fetch(`${UPSTREAM_ORIGIN}/v1/submissions/${submissionId}`, {
      method: "PUT",
      headers: {
        "Authorization": authorization,
        "Content-Type": "application/json",
        "Origin": origin
      },
      body,
      redirect: "manual"
    });
    return new Response(response.body, {
      status: response.status,
      headers: response.headers
    });
  } catch (error) {
    console.error("Writing Submission upstream request failed", {
      submissionId,
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
