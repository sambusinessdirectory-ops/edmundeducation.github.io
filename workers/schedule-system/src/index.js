export default {
  async fetch(request, env) {
    try {
      return await route(request, env);
    } catch (error) {
      console.error("Schedule Worker error", error);
      return json({ error: "Schedule service error" }, 500, request, env);
    }
  }
};

async function route(request, env) {
  const url = new URL(request.url);
  const origin = request.headers.get("Origin") || "";

  if (request.method === "OPTIONS") {
    if (!isAllowedOrigin(origin, env)) {
      return json({ error: "Origin not allowed" }, 403, request, env);
    }
    return new Response(null, { status: 204, headers: corsHeaders(origin, env) });
  }

  if (url.pathname === "/v1/health" && request.method === "GET") {
    return json({ ok: true, service: "edmund-schedule-system" }, 200, request, env);
  }

  if (url.pathname === "/v1/admin/login" && request.method === "POST") {
    return adminLogin(request, env);
  }

  return json({ error: "Not found" }, 404, request, env);
}

function isAllowedOrigin(origin, env) {
  return Boolean(origin) && origin === String(env.ALLOWED_ORIGIN || "https://edmundeducation.com");
}

function corsHeaders(origin, env) {
  const headers = new Headers({
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Referrer-Policy": "no-referrer",
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

async function adminLogin(request, env) {
  const origin = request.headers.get("Origin") || "";
  if (!isAllowedOrigin(origin, env)) {
    return json({ error: "Origin not allowed" }, 403, request, env);
  }
  if (!env.ADMIN_LOGIN_RATE_LIMITER || !env.SCHEDULE_SERVICE_SECRET) {
    return json({ error: "Admin login is not configured" }, 503, request, env);
  }

  const actor = request.headers.get("CF-Connecting-IP") || "missing-client-ip";
  const limit = await env.ADMIN_LOGIN_RATE_LIMITER.limit({ key: `schedule-admin:${actor}` });
  if (!limit.success) {
    return json({ error: "Too many login attempts" }, 429, request, env);
  }

  let payload;
  try {
    payload = JSON.parse(await readLimitedText(request, 4096));
  } catch (error) {
    if (error?.message === "BODY_TOO_LARGE") {
      return json({ error: "Login request is too large" }, 413, request, env);
    }
    return json({ error: "Invalid login request" }, 400, request, env);
  }

  const name = String(payload?.name || "").trim();
  const password = String(payload?.password || "");
  if (!name || name.length > 100 || !password || password.length > 200) {
    return json({ error: "Invalid login request" }, 400, request, env);
  }

  const endpoint = `${String(env.SUPABASE_URL || "").replace(/\/+$/, "")}/rest/v1/rpc/schedule_admin_login`;
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
        p_service_secret: env.SCHEDULE_SERVICE_SECRET,
        p_name: name,
        p_password: password
      })
    });
    if (!response.ok) {
      return json({ error: "Admin login is temporarily unavailable" }, 502, request, env);
    }
    const rows = await response.json();
    const admin = Array.isArray(rows) && rows.length ? rows[0] : null;
    return json({ admin }, 200, request, env);
  } catch (error) {
    return json({ error: "Admin login is temporarily unavailable" }, 502, request, env);
  }
}
