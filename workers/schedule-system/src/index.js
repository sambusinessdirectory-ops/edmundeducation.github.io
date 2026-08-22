const GMAIL_SEND_SCOPE = "https://www.googleapis.com/auth/gmail.send";

export default {
  async fetch(request, env) {
    try {
      return await route(request, env);
    } catch (error) {
      console.error("Schedule Worker error", error);
      return json({ error: "Schedule service error" }, 500, request, env);
    }
  },
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(runEmailScheduler(env));
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

  if (url.pathname === "/v1/admin/email/sender" && request.method === "PATCH") {
    return saveEmailSender(request, env);
  }
  if (url.pathname === "/v1/admin/email/sender" && request.method === "DELETE") {
    return disconnectEmailSender(request, env);
  }
  if (url.pathname === "/v1/admin/gmail/oauth/start" && request.method === "POST") {
    return startGmailOAuth(request, env);
  }
  if (url.pathname === "/v1/admin/gmail/oauth/callback" && request.method === "GET") {
    return finishGmailOAuth(request, env);
  }
  if (url.pathname === "/v1/admin/email/templates" && request.method === "POST") {
    return addEmailTemplate(request, env);
  }

  const emailTemplateMatch = url.pathname.match(/^\/v1\/admin\/email\/templates\/([1-9]\d{0,2})$/);
  if (emailTemplateMatch && request.method === "PATCH") {
    return saveEmailTemplate(request, env, Number(emailTemplateMatch[1]));
  }
  if (emailTemplateMatch && request.method === "DELETE") {
    return deleteEmailTemplate(request, env, Number(emailTemplateMatch[1]));
  }

  const emailSendMatch = url.pathname.match(/^\/v1\/admin\/email\/templates\/([1-9]\d{0,2})\/send-once$/);
  if (emailSendMatch && request.method === "POST") {
    return queueOneTimeEmail(request, env, Number(emailSendMatch[1]));
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

function base64Url(bytes) {
  return bytesToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sha256Hex(value) {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
  return [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function validPersonalGmail(value) {
  return /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@(gmail|googlemail)\.com$/i.test(String(value || ""));
}

function siteUrl(env, params = {}) {
  const url = new URL("/schedule-email-content-admin.html", String(env.SITE_BASE_URL || env.ALLOWED_ORIGIN || "https://edmundeducation.com"));
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return url.toString();
}

async function saveEmailSender(request, env) {
  const admin = await authenticateAdmin(request, env);
  if (!admin) return json({ error: "Administrator authentication required" }, 401, request, env);
  let payload;
  try { payload = await readLimitedJson(request, 2048); } catch { return json({ error: "Invalid sender request" }, 400, request, env); }
  const senderEmail = String(payload?.senderEmail || "").trim().toLowerCase();
  if (!validPersonalGmail(senderEmail) || senderEmail.length > 254) return json({ error: "Please enter a valid personal Gmail address" }, 400, request, env);
  const result = await rpc(env, "schedule_email_service_save_sender", { p_admin_token: admin.token, p_sender_email: senderEmail });
  return result ? json({ sender: result }, 200, request, env) : json({ error: "Sender could not be saved" }, 401, request, env);
}

async function disconnectEmailSender(request, env) {
  const admin = await authenticateAdmin(request, env);
  if (!admin) return json({ error: "Administrator authentication required" }, 401, request, env);
  const disconnected = await rpc(env, "schedule_email_service_disconnect", { p_admin_token: admin.token });
  return disconnected ? empty(204, request, env) : json({ error: "Gmail was not connected" }, 409, request, env);
}

async function startGmailOAuth(request, env) {
  const admin = await authenticateAdmin(request, env);
  if (!admin) return json({ error: "Administrator authentication required" }, 401, request, env);
  if (!env.GOOGLE_OAUTH_CLIENT_ID || !env.GOOGLE_OAUTH_CLIENT_SECRET || !env.GOOGLE_OAUTH_REDIRECT_URI || !env.GMAIL_TOKEN_ENCRYPTION_KEY) {
    return json({ error: "Gmail OAuth is not configured on the server" }, 503, request, env);
  }
  let payload;
  try { payload = await readLimitedJson(request, 2048); } catch { return json({ error: "Invalid OAuth request" }, 400, request, env); }
  const senderEmail = String(payload?.senderEmail || "").trim().toLowerCase();
  if (!validPersonalGmail(senderEmail)) return json({ error: "Save a valid Gmail sender first" }, 400, request, env);
  const state = base64Url(crypto.getRandomValues(new Uint8Array(32)));
  const created = await rpc(env, "schedule_email_service_oauth_begin", {
    p_admin_token: admin.token,
    p_sender_email: senderEmail,
    p_state_hash: await sha256Hex(state)
  });
  if (!created) return json({ error: "Save the sender address before connecting Gmail" }, 409, request, env);
  const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorizationUrl.search = new URLSearchParams({
    client_id: env.GOOGLE_OAUTH_CLIENT_ID,
    redirect_uri: env.GOOGLE_OAUTH_REDIRECT_URI,
    response_type: "code",
    scope: `openid email ${GMAIL_SEND_SCOPE}`,
    access_type: "offline",
    prompt: "consent select_account",
    include_granted_scopes: "true",
    state
  }).toString();
  return json({ authorizationUrl: authorizationUrl.toString() }, 200, request, env);
}

async function importEncryptionKey(env) {
  let keyBytes;
  try { keyBytes = base64ToBytes(env.GMAIL_TOKEN_ENCRYPTION_KEY); } catch { throw new Error("INVALID_ENCRYPTION_KEY"); }
  if (keyBytes.byteLength !== 32) throw new Error("INVALID_ENCRYPTION_KEY");
  return crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

async function encryptRefreshToken(env, token) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await importEncryptionKey(env), new TextEncoder().encode(token)));
  return { ciphertext: bytesToBase64(ciphertext), iv: bytesToBase64(iv) };
}

async function decryptRefreshToken(env, ciphertext, iv) {
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv: base64ToBytes(iv) }, await importEncryptionKey(env), base64ToBytes(ciphertext));
  return new TextDecoder().decode(plaintext);
}

async function finishGmailOAuth(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code") || "";
  const state = url.searchParams.get("state") || "";
  if (url.searchParams.get("error") || !code || !state || state.length > 200) {
    return Response.redirect(siteUrl(env, { gmail: "error", reason: "authorization_cancelled" }), 302);
  }
  try {
    const rows = await rpc(env, "schedule_email_service_oauth_consume", { p_state_hash: await sha256Hex(state) });
    const pending = Array.isArray(rows) ? rows[0] : null;
    if (!pending) return Response.redirect(siteUrl(env, { gmail: "error", reason: "expired_state" }), 302);
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ code, client_id: env.GOOGLE_OAUTH_CLIENT_ID, client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET, redirect_uri: env.GOOGLE_OAUTH_REDIRECT_URI, grant_type: "authorization_code" })
    });
    const tokens = await tokenResponse.json();
    if (!tokenResponse.ok || !tokens.access_token || !tokens.refresh_token) throw new Error("TOKEN_EXCHANGE_FAILED");
    const grantedScopes = new Set(String(tokens.scope || "").split(/\s+/).filter(Boolean));
    if (tokens.scope && !grantedScopes.has(GMAIL_SEND_SCOPE)) {
      return Response.redirect(siteUrl(env, { gmail: "error", reason: "missing_gmail_send" }), 302);
    }
    const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${tokens.access_token}` } });
    const profile = await profileResponse.json();
    const connectedEmail = String(profile?.email || "").toLowerCase();
    if (!profileResponse.ok || profile.email_verified !== true || connectedEmail !== String(pending.sender_email || "").toLowerCase()) {
      return Response.redirect(siteUrl(env, { gmail: "error", reason: "account_mismatch" }), 302);
    }
    const encrypted = await encryptRefreshToken(env, tokens.refresh_token);
    const completed = await rpc(env, "schedule_email_service_oauth_complete", {
      p_admin_id: pending.admin_id,
      p_expected_email: pending.sender_email,
      p_connected_email: connectedEmail,
      p_ciphertext: encrypted.ciphertext,
      p_iv: encrypted.iv
    });
    return Response.redirect(siteUrl(env, { gmail: completed ? "connected" : "error", reason: completed ? "ok" : "save_failed" }), 302);
  } catch (error) {
    console.error("Gmail OAuth callback failed", error);
    return Response.redirect(siteUrl(env, { gmail: "error", reason: "oauth_failed" }), 302);
  }
}

async function addEmailTemplate(request, env) {
  const admin = await authenticateAdmin(request, env);
  if (!admin) return json({ error: "Administrator authentication required" }, 401, request, env);
  const slot = Number(await rpc(env, "schedule_email_service_add_template", { p_admin_token: admin.token }));
  return slot ? json({ slot }, 201, request, env) : json({ error: "Message could not be added" }, 409, request, env);
}

async function deleteEmailTemplate(request, env, slot) {
  const admin = await authenticateAdmin(request, env);
  if (!admin) return json({ error: "Administrator authentication required" }, 401, request, env);
  let payload;
  try { payload = await readLimitedJson(request, 1024); } catch { return json({ error: "Invalid deletion request" }, 400, request, env); }
  if (payload?.confirmation !== "DELETE") return json({ error: "Explicit deletion confirmation is required" }, 400, request, env);
  const deleted = await rpc(env, "schedule_email_service_delete_template", { p_admin_token: admin.token, p_slot: slot });
  return deleted ? empty(204, request, env) : json({ error: "Message was not found" }, 404, request, env);
}

function safeFilename(value, fallback) {
  const cleaned = String(value || "").normalize("NFKC").replace(/[\x00-\x1f\x7f/\\]/g, "_").trim();
  return (cleaned || fallback).slice(0, 180);
}

function pdfContentFromBytes(bytes) {
  return bytes.length >= 5 && String.fromCharCode(...bytes.subarray(0, 5)) === "%PDF-";
}

async function saveEmailTemplate(request, env, slot) {
  const admin = await authenticateAdmin(request, env);
  if (!admin) return json({ error: "Administrator authentication required" }, 401, request, env);
  let form;
  try {
    const bytes = await readLimitedBytes(request, 13_000_000);
    form = await new Request("https://worker.invalid/form", { method: "POST", headers: { "Content-Type": request.headers.get("Content-Type") || "" }, body: bytes }).formData();
  } catch (error) {
    return json({ error: error?.message === "BODY_TOO_LARGE" ? "Message files are too large" : "Invalid message request" }, error?.message === "BODY_TOO_LARGE" ? 413 : 400, request, env);
  }
  const content = String(form.get("content") || "").replace(/\r\n?/g, "\n");
  const enabled = String(form.get("enabled")) === "true";
  const cadence = String(form.get("cadence") || "");
  const dailyTime = cadence === "daily" ? String(form.get("dailyTime") || "") : null;
  const signatureLink = String(form.get("signatureLink") || "").trim() || null;
  const signatureAction = String(form.get("signatureAction") || "keep");
  let recipientIds;
  let removeAttachmentIds;
  try {
    recipientIds = JSON.parse(String(form.get("recipientIds") || "[]"));
    removeAttachmentIds = JSON.parse(String(form.get("removeAttachmentIds") || "[]"));
  } catch { return json({ error: "Invalid recipient or attachment selection" }, 400, request, env); }
  if (!Array.isArray(recipientIds) || recipientIds.length > 1000 || !recipientIds.every((id) => /^[0-9a-f-]{36}$/i.test(id))
    || !Array.isArray(removeAttachmentIds) || removeAttachmentIds.length > 3 || !removeAttachmentIds.every((id) => /^[0-9a-f-]{36}$/i.test(id))
    || !["once", "15m", "30m", "45m", "1h", "24h", "daily"].includes(cadence)
    || (cadence === "daily" && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(dailyTime))
    || (signatureLink && (!signatureLink.startsWith("https://") || signatureLink.length > 2048))) {
    return json({ error: "Invalid message settings" }, 400, request, env);
  }
  const signature = form.get("signature");
  const hasSignature = signature instanceof File && signature.size > 0;
  if ((signatureAction === "replace") !== hasSignature || !["keep", "replace", "remove"].includes(signatureAction)) return json({ error: "Invalid signature action" }, 400, request, env);
  let signatureBytes = null;
  let signatureType = null;
  if (hasSignature) {
    signatureBytes = new Uint8Array(await signature.arrayBuffer());
    signatureType = imageContentTypeFromBytes(signatureBytes);
    if (signature.size > 2 * 1024 * 1024 || !signatureType || signatureType !== String(signature.type).toLowerCase()) return json({ error: "Signature must be a valid image up to 2 MB" }, 400, request, env);
  }
  const pdfFiles = form.getAll("attachments").filter((file) => file instanceof File && file.size > 0);
  if (pdfFiles.length > 3) return json({ error: "A message can contain at most three PDFs" }, 400, request, env);
  const attachments = [];
  let totalPdfBytes = 0;
  for (const file of pdfFiles) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    totalPdfBytes += bytes.byteLength;
    if (bytes.byteLength > 5 * 1024 * 1024 || totalPdfBytes > 10 * 1024 * 1024 || !pdfContentFromBytes(bytes)) return json({ error: "PDF attachments must be valid, at most 5 MB each and 10 MB total" }, 400, request, env);
    attachments.push({ filename: safeFilename(file.name, "attachment.pdf"), contentType: "application/pdf", sizeBytes: bytes.byteLength, content: bytesToBase64(bytes) });
  }
  const result = await rpc(env, "schedule_email_service_save_template", {
    p_admin_token: admin.token, p_slot: slot, p_content: content, p_enabled: enabled, p_cadence: cadence, p_daily_time: dailyTime,
    p_recipient_ids: recipientIds, p_signature_link: signatureLink, p_signature_action: signatureAction,
    p_signature_content: signatureBytes ? bytesToBase64(signatureBytes) : null, p_signature_content_type: signatureType,
    p_signature_filename: hasSignature ? safeFilename(signature.name, "signature") : null,
    p_remove_attachment_ids: removeAttachmentIds, p_attachments: attachments
  });
  return result ? json({ template: result }, 200, request, env) : json({ error: "Message could not be saved" }, 409, request, env);
}

async function queueOneTimeEmail(request, env, slot) {
  const admin = await authenticateAdmin(request, env);
  if (!admin) return json({ error: "Administrator authentication required" }, 401, request, env);
  let payload;
  try { payload = await readLimitedJson(request, 1024); } catch { return json({ error: "Invalid send request" }, 400, request, env); }
  const requestId = String(payload?.requestId || "");
  if (!/^[0-9a-f-]{36}$/i.test(requestId)) return json({ error: "Invalid send request" }, 400, request, env);
  const queued = Number(await rpc(env, "schedule_email_service_queue_once", { p_admin_token: admin.token, p_slot: slot, p_request_id: requestId }));
  const processed = await processEmailJobs(env, 2);
  return json({ queued, processed, dailyLimit: 400 }, 202, request, env);
}

function escapeHtml(value) {
  return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function wrapBase64(value) {
  return String(value || "").replace(/\s+/g, "").match(/.{1,76}/g)?.join("\r\n") || "";
}

function utf8Base64(value) {
  return bytesToBase64(new TextEncoder().encode(String(value || "")));
}

function mimeHeader(value) {
  return `=?UTF-8?B?${utf8Base64(String(value || "").replace(/[\r\n]/g, " "))}?=`;
}

function buildMime(job) {
  const mixed = `mixed_${crypto.randomUUID().replace(/-/g, "")}`;
  const related = `related_${crypto.randomUUID().replace(/-/g, "")}`;
  const signatureCid = `signature-${job.jobId}@edmundeducation.com`;
  const contentHtml = escapeHtml(job.content).replace(/\n/g, "<br>");
  const signatureHtml = job.signatureContent
    ? `${job.signatureLink ? `<a href="${escapeHtml(job.signatureLink)}">` : ""}<img src="cid:${signatureCid}" alt="" style="max-width:100%;height:auto">${job.signatureLink ? "</a>" : ""}`
    : "";
  const html = `<p>Hi ${escapeHtml(job.recipientName)}</p><div>${contentHtml}</div>${signatureHtml ? `<p>${signatureHtml}</p>` : ""}`;
  const lines = [
    `From: ${mimeHeader(job.senderEmail)} <${job.senderEmail}>`,
    `To: <${String(job.recipientEmail).replace(/[\r\n]/g, "")}>`,
    `Subject: ${mimeHeader(job.subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${mixed}"`, "",
    `--${mixed}`,
    `Content-Type: multipart/related; boundary="${related}"`, "",
    `--${related}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64", "",
    wrapBase64(utf8Base64(html)), ""
  ];
  if (job.signatureContent) {
    lines.push(`--${related}`, `Content-Type: ${job.signatureContentType}; name="signature"`, "Content-Transfer-Encoding: base64", `Content-ID: <${signatureCid}>`, 'Content-Disposition: inline; filename="signature"', "", wrapBase64(job.signatureContent), "");
  }
  lines.push(`--${related}--`, "");
  (job.attachments || []).forEach((attachment, index) => {
    const asciiName = `attachment-${index + 1}.pdf`;
    lines.push(`--${mixed}`, "Content-Type: application/pdf", "Content-Transfer-Encoding: base64", `Content-Disposition: attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(attachment.filename)}`, "", wrapBase64(attachment.content), "");
  });
  lines.push(`--${mixed}--`, "");
  return lines.join("\r\n");
}

async function gmailAccessToken(env, job) {
  const refreshToken = await decryptRefreshToken(env, job.refreshTokenCiphertext, job.refreshTokenIv);
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: env.GOOGLE_OAUTH_CLIENT_ID, client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET, refresh_token: refreshToken, grant_type: "refresh_token" })
  });
  const payload = await response.json();
  if (!response.ok || !payload.access_token) {
    const error = new Error("GMAIL_TOKEN_REFRESH_FAILED");
    error.retry = response.status >= 500 || response.status === 429;
    throw error;
  }
  return payload.access_token;
}

async function sendGmailJob(env, job) {
  const accessToken = await gmailAccessToken(env, job);
  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ raw: base64Url(new TextEncoder().encode(buildMime(job))) })
  });
  const payload = await response.json();
  if (!response.ok || !payload.id) {
    const providerStatus = String(payload?.error?.status || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 80);
    const providerReason = String(payload?.error?.errors?.[0]?.reason || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 80);
    const providerMessage = String(payload?.error?.message || "")
      .replace(/[\r\n\t]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 400);
    const diagnostic = [
      `GMAIL_SEND_FAILED_${response.status}`,
      providerStatus,
      providerReason
    ].filter(Boolean).join("_");
    const error = new Error(providerMessage ? `${diagnostic}: ${providerMessage}` : diagnostic);
    error.retry = response.status === 429 || response.status >= 500;
    throw error;
  }
  return payload.id;
}

async function processEmailJobs(env, maxJobs = 2) {
  let processed = 0;
  for (let index = 0; index < maxJobs; index += 1) {
    const job = await rpc(env, "schedule_email_service_claim_job", {});
    if (!job?.jobId) break;
    try {
      const providerMessageId = await sendGmailJob(env, job);
      await rpc(env, "schedule_email_service_finish_job", { p_job_id: job.jobId, p_success: true, p_provider_message_id: providerMessageId, p_error: null, p_retry: false });
      processed += 1;
    } catch (error) {
      console.error("Gmail delivery failed", { jobId: job.jobId, error: error?.message });
      await rpc(env, "schedule_email_service_finish_job", { p_job_id: job.jobId, p_success: false, p_provider_message_id: null, p_error: error?.message || "GMAIL_SEND_FAILED", p_retry: error?.retry === true });
    }
  }
  return processed;
}

async function runEmailScheduler(env) {
  try {
    await rpc(env, "schedule_email_service_enqueue_due", {});
    await processEmailJobs(env, 2);
  } catch (error) {
    console.error("Email scheduler failed", error);
  }
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
