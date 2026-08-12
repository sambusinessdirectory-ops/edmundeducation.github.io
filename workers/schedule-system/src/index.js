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
    return credentialLogin(request, env, {
      actorPrefix: "schedule-admin",
      rpcName: "schedule_admin_login",
      responseKey: "admin"
    });
  }

  if (url.pathname === "/v1/parent/login" && request.method === "POST") {
    return credentialLogin(request, env, {
      actorPrefix: "schedule-parent",
      rpcName: "parent_communication_login",
      responseKey: "parent"
    });
  }

  if (url.pathname === "/v1/announcements" && request.method === "GET") {
    return listPublicAnnouncements(request, env);
  }

  if (url.pathname === "/v1/admin/announcements" && request.method === "GET") {
    return listAdminAnnouncements(request, env);
  }

  if (url.pathname === "/v1/admin/announcements" && request.method === "POST") {
    return createAdminAnnouncement(request, env);
  }

  const announcementMatch = url.pathname.match(/^\/v1\/admin\/announcements\/([0-9a-f-]{36})$/i);
  if (announcementMatch && request.method === "PATCH") {
    return updateAdminAnnouncement(request, env, announcementMatch[1]);
  }
  if (announcementMatch && request.method === "DELETE") {
    return deleteAdminAnnouncement(request, env, announcementMatch[1]);
  }

  const announcementImageMatch = url.pathname.match(/^\/v1\/announcements\/([0-9a-f-]{36})\/image$/i);
  if (announcementImageMatch && request.method === "GET") {
    return getAnnouncementImage(request, env, announcementImageMatch[1]);
  }

  return json({ error: "Not found" }, 404, request, env);
}

function isAllowedOrigin(origin, env) {
  return Boolean(origin) && origin === String(env.ALLOWED_ORIGIN || "https://edmundeducation.com");
}

function corsHeaders(origin, env) {
  const headers = new Headers({
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Referrer-Policy": "no-referrer",
    "Vary": "Origin"
  });
  if (isAllowedOrigin(origin, env)) headers.set("Access-Control-Allow-Origin", origin);
  return headers;
}

function empty(status, request, env) {
  const headers = corsHeaders(request.headers.get("Origin") || "", env);
  headers.set("Cache-Control", "no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(null, { status, headers });
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

async function readLimitedBytes(request, maxBytes) {
  const declaredLength = Number(request.headers.get("Content-Length") || 0);
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) throw new Error("BODY_TOO_LARGE");
  if (!request.body) return new Uint8Array();
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
  return bytes;
}

async function readLimitedJson(request, maxBytes) {
  try {
    return JSON.parse(await readLimitedText(request, maxBytes));
  } catch (error) {
    if (error?.message === "BODY_TOO_LARGE") throw error;
    throw new Error("INVALID_JSON");
  }
}

function bearerToken(request) {
  const match = /^Bearer\s+([0-9a-f-]{36})$/i.exec(request.headers.get("Authorization") || "");
  return match ? match[1].toLowerCase() : "";
}

function announcementResponse(row, { admin = false } = {}) {
  const response = {
    id: String(row.id || ""),
    message: String(row.message || ""),
    hasImage: Boolean(row.has_image),
    imageUrl: row.has_image ? `/v1/announcements/${String(row.id || "")}/image?v=${Number(row.version || 1)}` : "",
    updatedAt: String(row.updated_at || ""),
    version: Number(row.version || 1)
  };
  if (admin) response.isActive = row.is_active === true;
  return response;
}

function imageContentTypeFromBytes(bytes) {
  if (!(bytes instanceof Uint8Array)) return "";
  if (
    bytes.length >= 3
    && bytes[0] === 0xff
    && bytes[1] === 0xd8
    && bytes[2] === 0xff
  ) return "image/jpeg";
  if (
    bytes.length >= 8
    && bytes[0] === 0x89
    && bytes[1] === 0x50
    && bytes[2] === 0x4e
    && bytes[3] === 0x47
    && bytes[4] === 0x0d
    && bytes[5] === 0x0a
    && bytes[6] === 0x1a
    && bytes[7] === 0x0a
  ) return "image/png";
  if (
    bytes.length >= 12
    && String.fromCharCode(...bytes.subarray(0, 4)) === "RIFF"
    && String.fromCharCode(...bytes.subarray(8, 12)) === "WEBP"
  ) return "image/webp";
  if (bytes.length >= 6) {
    const signature = String.fromCharCode(...bytes.subarray(0, 6));
    if (signature === "GIF87a" || signature === "GIF89a") return "image/gif";
  }
  return "";
}

async function rpc(env, name, body) {
  const endpoint = `${String(env.SUPABASE_URL || "").replace(/\/+$/, "")}/rest/v1/rpc/${name}`;
  if (!endpoint.startsWith("https://") || !env.SUPABASE_ANON_KEY || !env.SCHEDULE_SERVICE_SECRET) {
    throw new Error("SERVICE_NOT_CONFIGURED");
  }
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { apikey: env.SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ p_service_secret: env.SCHEDULE_SERVICE_SECRET, ...body })
  });
  if (!response.ok) throw new Error("UPSTREAM_ERROR");
  return response.json();
}

async function authenticateAdmin(request, env) {
  const token = bearerToken(request);
  if (!token) return null;
  const rows = await rpc(env, "schedule_announcement_admin_auth", { p_admin_token: token });
  return Array.isArray(rows) && rows.length ? { ...rows[0], token } : null;
}

async function listPublicAnnouncements(request, env) {
  const rows = await rpc(env, "schedule_announcement_public_list", {});
  return json({ announcements: (Array.isArray(rows) ? rows : []).map(announcementResponse) }, 200, request, env);
}

async function listAdminAnnouncements(request, env) {
  const admin = await authenticateAdmin(request, env);
  if (!admin) return json({ error: "Administrator authentication required" }, 401, request, env);
  const rows = await rpc(env, "schedule_announcement_admin_list", { p_admin_token: admin.token });
  return json({ announcements: (Array.isArray(rows) ? rows : []).map((row) => announcementResponse(row, { admin: true })) }, 200, request, env);
}

async function createAdminAnnouncement(request, env) {
  const admin = await authenticateAdmin(request, env);
  if (!admin) return json({ error: "Administrator authentication required" }, 401, request, env);
  let form;
  try {
    const bytes = await readLimitedBytes(request, 5_300_000);
    form = await new Request("https://worker.invalid/form", {
      method: "POST",
      headers: { "Content-Type": request.headers.get("Content-Type") || "" },
      body: bytes
    }).formData();
  } catch (error) {
    return json({ error: error?.message === "BODY_TOO_LARGE" ? "Announcement request is too large" : "Announcement request is invalid" }, error?.message === "BODY_TOO_LARGE" ? 413 : 400, request, env);
  }
  const message = String(form.get("message") || "").replace(/\r\n?/g, "\n");
  const isActive = String(form.get("isActive") || "") === "true";
  const image = form.get("image");
  const hasImage = image instanceof File && image.size > 0;
  if (!message.trim() || message.length > 4000 || /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(message)) {
    return json({ error: "Announcement content is invalid" }, 400, request, env);
  }
  let imageBytes = null;
  let verifiedImageType = null;
  if (hasImage) {
    imageBytes = new Uint8Array(await image.arrayBuffer());
    verifiedImageType = imageContentTypeFromBytes(imageBytes);
    if (
      image.size > 5 * 1024 * 1024
      || !verifiedImageType
      || verifiedImageType !== image.type.toLowerCase()
    ) return json({ error: "Announcement image is invalid" }, 400, request, env);
  }
  const rows = await rpc(env, "schedule_announcement_admin_create", {
    p_admin_token: admin.token,
    p_message: message,
    p_image_content: hasImage ? bytesToBase64(imageBytes) : null,
    p_image_content_type: verifiedImageType,
    p_is_active: isActive
  });
  const row = Array.isArray(rows) ? rows[0] : null;
  return row
    ? json({ announcement: announcementResponse(row, { admin: true }) }, 201, request, env)
    : json({ error: "Announcement could not be created" }, 409, request, env);
}

async function updateAdminAnnouncement(request, env, id) {
  const admin = await authenticateAdmin(request, env);
  if (!admin) return json({ error: "Administrator authentication required" }, 401, request, env);
  const contentType = String(request.headers.get("Content-Type") || "").toLowerCase();
  if (contentType.startsWith("multipart/form-data")) {
    let form;
    try {
      const bytes = await readLimitedBytes(request, 5_300_000);
      form = await new Request("https://worker.invalid/form", {
        method: "POST",
        headers: { "Content-Type": request.headers.get("Content-Type") || "" },
        body: bytes
      }).formData();
    } catch (error) {
      return json({
        error: error?.message === "BODY_TOO_LARGE"
          ? "Announcement request is too large"
          : "Invalid announcement update"
      }, error?.message === "BODY_TOO_LARGE" ? 413 : 400, request, env);
    }

    const message = String(form.get("message") || "").replace(/\r\n?/g, "\n");
    const isActiveValue = String(form.get("isActive") || "");
    const imageAction = String(form.get("imageAction") || "");
    const expectedVersionValue = String(form.get("expectedVersion") || "");
    const expectedVersion = /^[1-9]\d{0,9}$/.test(expectedVersionValue)
      ? Number(expectedVersionValue)
      : 0;
    const image = form.get("image");
    const hasImage = image instanceof File && image.size > 0;
    if (
      !message.trim()
      || message.length > 4000
      || /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(message)
      || !["true", "false"].includes(isActiveValue)
      || !["keep", "replace", "remove"].includes(imageAction)
      || expectedVersion < 1
      || expectedVersion >= 2147483647
      || (imageAction === "replace") !== hasImage
    ) return json({ error: "Invalid announcement update" }, 400, request, env);

    let imageBytes = null;
    let verifiedImageType = null;
    if (hasImage) {
      imageBytes = new Uint8Array(await image.arrayBuffer());
      verifiedImageType = imageContentTypeFromBytes(imageBytes);
      if (
        image.size > 5 * 1024 * 1024
        || !verifiedImageType
        || verifiedImageType !== image.type.toLowerCase()
      ) return json({ error: "Announcement image is invalid" }, 400, request, env);
    }

    const rows = await rpc(env, "schedule_announcement_admin_update", {
      p_admin_token: admin.token,
      p_id: id.toLowerCase(),
      p_expected_version: expectedVersion,
      p_message: message,
      p_image_action: imageAction,
      p_image_content: imageAction === "replace" ? bytesToBase64(imageBytes) : null,
      p_image_content_type: verifiedImageType,
      p_is_active: isActiveValue === "true"
    });
    const row = Array.isArray(rows) ? rows[0] : null;
    if (row) return json({ announcement: announcementResponse(row, { admin: true }) }, 200, request, env);
    const stillAuthenticated = await authenticateAdmin(request, env);
    return stillAuthenticated
      ? json({ error: "Announcement changed elsewhere; reload and try again" }, 409, request, env)
      : json({ error: "Administrator session expired" }, 401, request, env);
  }

  let payload;
  try { payload = await readLimitedJson(request, 2048); } catch { return json({ error: "Invalid announcement update" }, 400, request, env); }
  if (!Number.isInteger(payload?.expectedVersion) || typeof payload?.isActive !== "boolean") {
    return json({ error: "Invalid announcement update" }, 400, request, env);
  }
  const rows = await rpc(env, "schedule_announcement_admin_set_active", {
    p_admin_token: admin.token,
    p_id: id.toLowerCase(),
    p_expected_version: payload.expectedVersion,
    p_is_active: payload.isActive
  });
  const row = Array.isArray(rows) ? rows[0] : null;
  return row
    ? json({ announcement: announcementResponse(row, { admin: true }) }, 200, request, env)
    : json({ error: "Announcement changed elsewhere; reload and try again" }, 409, request, env);
}

async function deleteAdminAnnouncement(request, env, id) {
  const admin = await authenticateAdmin(request, env);
  if (!admin) return json({ error: "Administrator authentication required" }, 401, request, env);
  let payload;
  try { payload = await readLimitedJson(request, 2048); } catch { return json({ error: "Invalid announcement deletion" }, 400, request, env); }
  if (!Number.isInteger(payload?.expectedVersion) || payload?.confirmation !== "DELETE") {
    return json({ error: "Explicit deletion confirmation is required" }, 400, request, env);
  }
  const deleted = Number(await rpc(env, "schedule_announcement_admin_delete", {
    p_admin_token: admin.token,
    p_id: id.toLowerCase(),
    p_expected_version: payload.expectedVersion
  }));
  return deleted === 1 ? empty(204, request, env) : json({ error: "Announcement changed elsewhere; reload and try again" }, 409, request, env);
}

async function getAnnouncementImage(request, env, id) {
  const rows = await rpc(env, "schedule_announcement_public_image", { p_id: id.toLowerCase() });
  const row = Array.isArray(rows) ? rows[0] : null;
  if (!row?.image_content || !/^image\/(?:jpeg|png|webp|gif)$/i.test(String(row.image_content_type || ""))) {
    return json({ error: "Image not found" }, 404, request, env);
  }
  const imageBytes = base64ToBytes(row.image_content);
  const headers = corsHeaders(request.headers.get("Origin") || "", env);
  headers.set("Content-Type", row.image_content_type);
  headers.set("Content-Length", String(imageBytes.byteLength));
  headers.set("Cache-Control", "no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(imageBytes, { status: 200, headers });
}

function bytesToBase64(bytes) {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(String(value || ""));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function credentialLogin(request, env, { actorPrefix, rpcName, responseKey }) {
  const origin = request.headers.get("Origin") || "";
  if (!isAllowedOrigin(origin, env)) {
    return json({ error: "Origin not allowed" }, 403, request, env);
  }
  if (!env.ADMIN_LOGIN_RATE_LIMITER || !env.SCHEDULE_SERVICE_SECRET) {
    return json({ error: "Admin login is not configured" }, 503, request, env);
  }

  const actor = request.headers.get("CF-Connecting-IP") || "missing-client-ip";
  const limit = await env.ADMIN_LOGIN_RATE_LIMITER.limit({ key: `${actorPrefix}:${actor}` });
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

  const name = String(payload?.name || payload?.username || "").trim();
  const password = String(payload?.password || "");
  if (!name || name.length > 100 || !password || password.length > 200) {
    return json({ error: "Invalid login request" }, 400, request, env);
  }

  const endpoint = `${String(env.SUPABASE_URL || "").replace(/\/+$/, "")}/rest/v1/rpc/${rpcName}`;
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
    const account = Array.isArray(rows) && rows.length ? rows[0] : null;
    return json({ [responseKey]: account }, 200, request, env);
  } catch (error) {
    return json({ error: "Admin login is temporarily unavailable" }, 502, request, env);
  }
}
