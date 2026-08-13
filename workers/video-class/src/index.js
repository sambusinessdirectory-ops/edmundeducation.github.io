const encoder = new TextEncoder();
const decoder = new TextDecoder();

const SERVICE_NAME = "edmund-video-class";
const DEFAULT_ALLOWED_ORIGIN = "https://edmundeducation.com";
const PLAYBACK_TOKEN_TTL_SECONDS = 2 * 60 * 60;
const ADMIN_PREVIEW_TOKEN_TTL_SECONDS = 10 * 60;
const MAX_JSON_BYTES = 16 * 1024;
const ADMIN_UPLOAD_TOKEN_TTL_SECONDS = 6 * 24 * 60 * 60;
const ADMIN_UPLOAD_PREFIX = "admin-uploads/videos/";
const ADMIN_UPLOAD_PART_BYTES = 10 * 1024 * 1024;
const ADMIN_UPLOAD_MAX_BYTES = 50 * 1024 * 1024 * 1024;
const ADMIN_ATTACHMENT_MAX_BYTES = 1024 * 1024 * 1024;
const ADMIN_ATTACHMENT_PREFIX = "admin-uploads/lesson-files/";
const ADMIN_THUMBNAIL_MAX_BYTES = 10 * 1024 * 1024;
const ADMIN_THUMBNAIL_PREFIX = "admin-uploads/lesson-thumbnails/";
const ADMIN_UPLOAD_MAX_PARTS = 10000;
const ADMIN_UPLOAD_COMPLETE_MAX_JSON_BYTES = 2 * 1024 * 1024;
const ADMIN_R2_LIST_MAX_ITEMS = 100;
const VIDEO_DURATION_PROBE_BYTES = 8 * 1024 * 1024;
const TURNSTILE_SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TURNSTILE_TOKEN_MAX_LENGTH = 2048;
const TURNSTILE_TIMEOUT_MS = 8000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const LESSON_CURSOR_RE = /^-?[0-9]{1,10}\|[0-9]{1,11}(?:\.[0-9]{1,6})?\|([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i;
const FEEDBACK_CURSOR_RE = /^([0-9]{1,11}(?:\.[0-9]{1,6})?)\|([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})\|([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i;
const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;
const COURSE_CODE_RE = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;
const QUALITY_CODE_RE = /^(?:480p|720p|1080p|max)$/;
const HEARTBEAT_EVENTS = new Set(["play", "pause", "progress", "heartbeat", "seek", "ended", "close", "hidden", "pagehide"]);
const MAX_PLAYLIST_NAME_LENGTH = 80;
const MAX_CLIP_TITLE_LENGTH = 120;
const ADMIN_UPLOAD_ID_RE = /^[A-Za-z0-9._~-]{8,512}$/;
const ADMIN_UPLOAD_TOKEN_MAX_LENGTH = 4096;
const VIDEO_UPLOAD_TYPES = Object.freeze({
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".m4v": "video/x-m4v",
  ".webm": "video/webm"
});
const IMAGE_UPLOAD_TYPES = Object.freeze({
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif"
});

class HttpError extends Error {
  constructor(status, publicMessage, options = {}) {
    super(publicMessage);
    this.name = "HttpError";
    this.status = status;
    this.publicMessage = publicMessage;
    this.code = String(options.code || "");
    this.challengeRequired = options.challengeRequired === true;
    this.retryAfter = nullablePositiveInteger(options.retryAfter);
  }
}

export default {
  async fetch(request, env, ctx) {
    try {
      return await route(request, env, ctx);
    } catch (error) {
      if (error instanceof HttpError) {
        if (error.status >= 500) console.error(`${SERVICE_NAME}: ${error.publicMessage}`);
        const body = error.code
          ? {
              error: {
                code: error.code,
                message: error.publicMessage,
                challengeRequired: error.challengeRequired,
                retryAfterSeconds: error.retryAfter || 0
              }
            }
          : { error: error.publicMessage };
        const response = json(request, env, body, error.status);
        if (error.retryAfter) response.headers.set("Retry-After", String(error.retryAfter));
        return response;
      }
      console.error(`${SERVICE_NAME}: unhandled request failure`, error);
      return json(request, env, { error: "Video class service error" }, 500);
    }
  }
};

async function route(request, env, ctx) {
  const url = new URL(request.url);
  const origin = request.headers.get("Origin") || "";

  if (request.method === "OPTIONS") {
    if (!isAllowedOrigin(origin, env)) {
      return json(request, env, { error: "Origin not allowed" }, 403);
    }
    return new Response(null, { status: 204, headers: corsHeaders(origin, env) });
  }

  if (url.pathname === "/v1/health" && request.method === "GET") {
    return json(request, env, { ok: true, service: SERVICE_NAME }, 200);
  }

  // All credentials, account data, grants, and media are intentionally limited
  // to the one production site. A copied page cannot call this API from its own origin.
  if (!isAllowedOrigin(origin, env)) {
    return json(request, env, { error: "Origin not allowed" }, 403);
  }

  if (url.pathname === "/v1/student/login" && request.method === "POST") {
    return studentLogin(request, env);
  }
  if (url.pathname === "/v1/student/exchange" && request.method === "POST") {
    return exchangeFlashcardSession(request, env);
  }
  if (url.pathname === "/v1/student/session" && request.method === "GET") {
    return studentSession(request, env);
  }
  if (url.pathname === "/v1/student/session" && (request.method === "DELETE" || request.method === "POST")) {
    return studentLogout(request, env);
  }

  if (url.pathname === "/v1/admin/login" && request.method === "POST") {
    return adminLogin(request, env);
  }
  if (url.pathname === "/v1/admin/session" && request.method === "GET") {
    return adminSession(request, env);
  }
  if (url.pathname === "/v1/admin/session" && (request.method === "DELETE" || request.method === "POST")) {
    return adminLogout(request, env);
  }
  if (url.pathname === "/v1/admin/students" && request.method === "GET") {
    return adminListStudents(request, env, url);
  }
  if (url.pathname === "/v1/admin/courses" && request.method === "GET") {
    return adminListCourses(request, env);
  }
  if (url.pathname === "/v1/admin/lessons" && request.method === "GET") {
    return adminListLessons(request, env, url);
  }
  if (url.pathname === "/v1/admin/r2/objects" && request.method === "GET") {
    return adminListR2Objects(request, env, url);
  }
  if (url.pathname === "/v1/admin/r2/uploads" && request.method === "POST") {
    return adminCreateR2Upload(request, env);
  }
  if (url.pathname === "/v1/admin/r2/publish" && request.method === "POST") {
    return adminPublishR2Object(request, env);
  }
  if (url.pathname === "/v1/admin/r2/objects/download" && request.method === "POST") {
    return adminDownloadPrivateVideo(request, env);
  }
  if (url.pathname === "/v1/admin/feedback" && request.method === "GET") {
    return adminListFeedback(request, env, url);
  }
  if (url.pathname === "/v1/admin/official-playlists" && request.method === "GET") {
    return adminListOfficialPlaylists(request, env, url);
  }
  if (url.pathname === "/v1/admin/official-playlists" && request.method === "POST") {
    return adminSaveOfficialPlaylist(request, env);
  }
  if (url.pathname === "/v1/admin/official-playlists/order" && request.method === "PATCH") {
    return adminSetOfficialPlaylistOrder(request, env);
  }

  const adminLessonMatch = url.pathname.match(/^\/v1\/admin\/lessons\/([^/]+)$/);
  if (adminLessonMatch && ["PATCH", "DELETE"].includes(request.method)) {
    return request.method === "PATCH"
      ? adminUpdateLesson(request, env, decodePathSegment(adminLessonMatch[1]))
      : adminDeleteLesson(request, env, decodePathSegment(adminLessonMatch[1]), url);
  }

  const adminLessonThumbnailMatch = url.pathname.match(/^\/v1\/admin\/lessons\/([^/]+)\/thumbnail$/);
  if (adminLessonThumbnailMatch && ["GET", "PUT", "DELETE"].includes(request.method)) {
    const lessonId = decodePathSegment(adminLessonThumbnailMatch[1]);
    if (request.method === "GET") return serveAdminLessonThumbnail(request, env, lessonId);
    return adminSetLessonThumbnail(request, env, lessonId, request.method === "DELETE");
  }

  const adminLessonPreviewGrantMatch = url.pathname.match(/^\/v1\/admin\/lessons\/([^/]+)\/preview-grant$/);
  if (adminLessonPreviewGrantMatch && request.method === "POST") {
    return adminGrantLessonPreview(request, env, decodePathSegment(adminLessonPreviewGrantMatch[1]), url);
  }

  const adminLessonPreviewMatch = url.pathname.match(/^\/v1\/admin\/lessons\/([^/]+)\/preview$/);
  if (adminLessonPreviewMatch && ["GET", "HEAD"].includes(request.method)) {
    return streamAdminLessonPreview(
      request,
      env,
      decodePathSegment(adminLessonPreviewMatch[1]),
      url.searchParams.get("token") || "",
      ctx
    );
  }

  const adminLessonPrivacyMatch = url.pathname.match(/^\/v1\/admin\/lessons\/([^/]+)\/privacy$/);
  if (adminLessonPrivacyMatch && request.method === "PATCH") {
    return adminChangeLessonPrivacy(request, env, decodePathSegment(adminLessonPrivacyMatch[1]));
  }

  const adminLessonCoursesMatch = url.pathname.match(/^\/v1\/admin\/lessons\/([^/]+)\/courses$/);
  if (adminLessonCoursesMatch && request.method === "PUT") {
    return adminSetLessonCourses(request, env, decodePathSegment(adminLessonCoursesMatch[1]));
  }

  const adminLessonAttachmentsMatch = url.pathname.match(/^\/v1\/admin\/lessons\/([^/]+)\/attachments$/);
  if (adminLessonAttachmentsMatch && request.method === "POST") {
    return adminCreateAttachment(request, env, decodePathSegment(adminLessonAttachmentsMatch[1]));
  }

  const adminAttachmentPrivacyMatch = url.pathname.match(/^\/v1\/admin\/attachments\/([^/]+)\/privacy$/);
  if (adminAttachmentPrivacyMatch && request.method === "PATCH") {
    return adminSetAttachmentPrivacy(request, env, decodePathSegment(adminAttachmentPrivacyMatch[1]));
  }

  const adminAttachmentMatch = url.pathname.match(/^\/v1\/admin\/attachments\/([^/]+)$/);
  if (adminAttachmentMatch && request.method === "DELETE") {
    return adminDeleteAttachment(request, env, decodePathSegment(adminAttachmentMatch[1]));
  }

  const adminFeedbackMatch = url.pathname.match(/^\/v1\/admin\/feedback\/([^/]+)\/([^/]+)$/);
  if (adminFeedbackMatch && ["PATCH", "DELETE"].includes(request.method)) {
    return adminChangeFeedback(
      request,
      env,
      decodePathSegment(adminFeedbackMatch[1]),
      decodePathSegment(adminFeedbackMatch[2]),
      request.method === "DELETE"
    );
  }

  const adminUploadPartMatch = url.pathname.match(/^\/v1\/admin\/r2\/uploads\/([^/]+)\/parts\/([^/]+)$/);
  if (adminUploadPartMatch && request.method === "PUT") {
    return adminUploadR2Part(
      request,
      env,
      decodePathSegment(adminUploadPartMatch[1]),
      decodePathSegment(adminUploadPartMatch[2])
    );
  }

  const adminCompleteUploadMatch = url.pathname.match(/^\/v1\/admin\/r2\/uploads\/([^/]+)\/complete$/);
  if (adminCompleteUploadMatch && request.method === "POST") {
    return adminCompleteR2Upload(request, env, decodePathSegment(adminCompleteUploadMatch[1]));
  }

  const adminAbortUploadMatch = url.pathname.match(/^\/v1\/admin\/r2\/uploads\/([^/]+)$/);
  if (adminAbortUploadMatch && request.method === "DELETE") {
    return adminAbortR2Upload(request, env, decodePathSegment(adminAbortUploadMatch[1]));
  }

  const studentKeyMatch = url.pathname.match(/^\/v1\/admin\/students\/([^/]+)\/key$/);
  if (studentKeyMatch && (request.method === "POST" || request.method === "DELETE")) {
    return adminChangeStudentKey(request, env, decodePathSegment(studentKeyMatch[1]), request.method === "DELETE");
  }

  const studentAccessMatch = url.pathname.match(/^\/v1\/admin\/students\/([^/]+)\/access$/);
  if (studentAccessMatch && request.method === "PATCH") {
    return adminChangeStudentAccess(request, env, decodePathSegment(studentAccessMatch[1]));
  }

  const studentCourseMatch = url.pathname.match(/^\/v1\/admin\/students\/([^/]+)\/courses\/([^/]+)$/);
  if (studentCourseMatch && request.method === "PATCH") {
    return adminChangeStudentCourseAccess(
      request,
      env,
      decodePathSegment(studentCourseMatch[1]),
      decodePathSegment(studentCourseMatch[2])
    );
  }

  const studentOfficialPlaylistMatch = url.pathname.match(
    /^\/v1\/admin\/students\/([^/]+)\/official-playlists\/([^/]+)$/
  );
  if (studentOfficialPlaylistMatch && request.method === "PATCH") {
    return adminChangeStudentOfficialPlaylistAccess(
      request,
      env,
      decodePathSegment(studentOfficialPlaylistMatch[1]),
      decodePathSegment(studentOfficialPlaylistMatch[2])
    );
  }

  const studentOfficialPlaylistsMatch = url.pathname.match(/^\/v1\/admin\/students\/([^/]+)\/official-playlists$/);
  if (studentOfficialPlaylistsMatch && ["GET", "PUT"].includes(request.method)) {
    const studentId = decodePathSegment(studentOfficialPlaylistsMatch[1]);
    return request.method === "GET"
      ? adminListStudentOfficialPlaylistAccess(request, env, studentId)
      : adminSetStudentOfficialPlaylistAccessBulk(request, env, studentId);
  }

  const studentWatermarkMatch = url.pathname.match(/^\/v1\/admin\/students\/([^/]+)\/watermark$/);
  if (studentWatermarkMatch && request.method === "PATCH") {
    return adminChangeStudentWatermark(request, env, decodePathSegment(studentWatermarkMatch[1]));
  }

  if (url.pathname === "/v1/courses" && request.method === "GET") {
    return listCourses(request, env);
  }
  if (url.pathname === "/v1/lessons" && request.method === "GET") {
    return listLessons(request, env, url);
  }
  if (url.pathname === "/v1/analytics" && request.method === "GET") {
    return studentAnalytics(request, env);
  }

  if (url.pathname === "/v1/playlists" && request.method === "POST") {
    return createPlaylist(request, env);
  }

  const playlistLessonMatch = url.pathname.match(/^\/v1\/playlists\/([^/]+)\/lessons\/([^/]+)$/);
  if (playlistLessonMatch && ["PUT", "DELETE"].includes(request.method)) {
    return changePlaylistLesson(
      request,
      env,
      decodePathSegment(playlistLessonMatch[1]),
      decodePathSegment(playlistLessonMatch[2]),
      request.method === "PUT"
    );
  }

  const playlistMatch = url.pathname.match(/^\/v1\/playlists\/([^/]+)$/);
  if (playlistMatch && ["PATCH", "DELETE"].includes(request.method)) {
    return changePlaylist(request, env, decodePathSegment(playlistMatch[1]), request.method === "DELETE");
  }

  const lessonThumbnailMatch = url.pathname.match(/^\/v1\/lessons\/([^/]+)\/thumbnail$/);
  if (lessonThumbnailMatch && request.method === "GET") {
    return serveLessonThumbnail(request, env, decodePathSegment(lessonThumbnailMatch[1]));
  }

  const lessonAttachmentMatch = url.pathname.match(/^\/v1\/lessons\/([^/]+)\/attachments\/([^/]+)$/);
  if (lessonAttachmentMatch && request.method === "GET") {
    return serveLessonAttachment(
      request,
      env,
      decodePathSegment(lessonAttachmentMatch[1]),
      decodePathSegment(lessonAttachmentMatch[2])
    );
  }

  const lessonClipMatch = url.pathname.match(/^\/v1\/lessons\/([^/]+)\/clips$/);
  if (lessonClipMatch && request.method === "POST") {
    return createLessonClip(request, env, decodePathSegment(lessonClipMatch[1]));
  }

  const clipMatch = url.pathname.match(/^\/v1\/clips\/([^/]+)$/);
  if (clipMatch && request.method === "DELETE") {
    return deleteLessonClip(request, env, decodePathSegment(clipMatch[1]));
  }

  const lessonFeedbackMatch = url.pathname.match(/^\/v1\/lessons\/([^/]+)\/feedback$/);
  if (lessonFeedbackMatch && request.method === "PUT") {
    return saveLessonFeedback(request, env, decodePathSegment(lessonFeedbackMatch[1]));
  }

  const lessonBookmarkMatch = url.pathname.match(/^\/v1\/lessons\/([^/]+)\/bookmark$/);
  if (lessonBookmarkMatch && request.method === "PATCH") {
    return changeLessonBookmark(request, env, decodePathSegment(lessonBookmarkMatch[1]));
  }

  const lessonNoteMatch = url.pathname.match(/^\/v1\/lessons\/([^/]+)\/note$/);
  if (lessonNoteMatch && ["PUT", "PATCH", "DELETE"].includes(request.method)) {
    return saveLessonNote(request, env, decodePathSegment(lessonNoteMatch[1]), request.method === "DELETE");
  }
  if (url.pathname === "/v1/playback/grant" && request.method === "POST") {
    return grantPlayback(request, env, url);
  }
  if (url.pathname === "/v1/playback/refresh" && request.method === "POST") {
    return grantPlayback(request, env, url, { refreshed: true });
  }
  if (url.pathname === "/v1/playback/heartbeat" && request.method === "POST") {
    return recordHeartbeat(request, env);
  }

  const videoMatch = url.pathname.match(/^\/v1\/video\/([^/]+)$/);
  if (videoMatch && (request.method === "GET" || request.method === "HEAD")) {
    return streamVideo(
      request,
      env,
      decodePathSegment(videoMatch[1]),
      url.searchParams.get("token") || "",
      url.searchParams.get("quality") || "max",
      ctx
    );
  }

  return json(request, env, { error: "Not found" }, 404);
}

async function studentLogin(request, env) {
  await enforceRateLimit(request, env, "STUDENT_LOGIN_RATE_LIMITER", "student-login", 60);
  const body = await readJson(request, 4096);
  const name = String(body.name || body.username || "").trim();
  const password = String(body.password || "");
  const turnstileToken = String(body.turnstileToken || body.turnstile_token || "").trim();
  if (!name || name.length > 100 || !password || password.length > 200) {
    throw new HttpError(400, "Invalid login request");
  }
  if (turnstileToken.length > TURNSTILE_TOKEN_MAX_LENGTH) {
    throw new HttpError(400, "Invalid login request");
  }

  const turnstileVerified = turnstileToken
    ? await validateTurnstile(request, env, turnstileToken, "student_login")
    : false;
  if (turnstileToken && !turnstileVerified) {
    throw new HttpError(403, "Security verification is invalid or expired", {
      code: "TURNSTILE_INVALID",
      challengeRequired: true
    });
  }

  const rows = await serviceRpc(env, "video_class_student_login", {
    p_name: name,
    p_password: password,
    p_turnstile_verified: turnstileVerified
  });
  const row = firstRow(rows);
  assertLoginOutcome(row, { role: "student", turnstileToken, turnstileVerified });
  const token = String(row.video_token || "");
  if (!UUID_RE.test(token)) throw new HttpError(502, "Student session could not be created");

  return json(request, env, {
    token,
    flashcardToken: UUID_RE.test(String(row.flashcard_token || "")) ? row.flashcard_token : null,
    expiresAt: row.expires_at || null,
    student: mapStudent(row)
  }, 200);
}

async function exchangeFlashcardSession(request, env) {
  await enforceRateLimit(request, env, "STUDENT_LOGIN_RATE_LIMITER", "student-exchange", 60);
  const body = await readJson(request, 4096);
  const flashcardToken = String(body.token || "").trim();
  if (!UUID_RE.test(flashcardToken)) {
    throw new HttpError(400, "Invalid Flashcard session");
  }

  const rows = await serviceRpc(env, "video_class_student_exchange", {
    p_flashcard_token: flashcardToken
  });
  const row = firstRow(rows);
  if (!row) throw new HttpError(401, "Flashcard session is invalid or video class access is not enabled");
  const token = String(row.video_token || "");
  if (!UUID_RE.test(token)) throw new HttpError(502, "Student session could not be created");

  return json(request, env, {
    token,
    flashcardToken,
    expiresAt: row.expires_at || null,
    student: mapStudent(row)
  }, 200);
}

async function studentSession(request, env) {
  const token = requireBearerToken(request);
  const rows = await serviceRpc(env, "video_class_student_me", {
    p_student_token: token
  });
  const row = firstRow(rows);
  if (!row) throw new HttpError(401, "Student session is invalid or expired");
  return json(request, env, { student: mapStudent(row), expiresAt: row.expires_at || null }, 200);
}

async function studentLogout(request, env) {
  const token = requireBearerToken(request);
  await serviceRpc(env, "video_class_student_logout", {
    p_student_token: token
  });
  return new Response(null, { status: 204, headers: responseHeaders(request, env) });
}

async function adminLogin(request, env) {
  await enforceRateLimit(request, env, "ADMIN_LOGIN_RATE_LIMITER", "admin-login", 60);
  const body = await readJson(request, 4096);
  const name = String(body.name || body.username || "").trim();
  const password = String(body.password || "");
  const turnstileToken = String(body.turnstileToken || body.turnstile_token || "").trim();
  if (!name || name.length > 100 || !password || password.length > 200) {
    throw new HttpError(400, "Invalid login request");
  }
  if (turnstileToken.length > TURNSTILE_TOKEN_MAX_LENGTH) {
    throw new HttpError(400, "Invalid login request");
  }

  const turnstileVerified = turnstileToken
    ? await validateTurnstile(request, env, turnstileToken, "admin_login")
    : false;
  if (turnstileToken && !turnstileVerified) {
    throw new HttpError(403, "Security verification is invalid or expired", {
      code: "TURNSTILE_INVALID",
      challengeRequired: true
    });
  }

  const rows = await serviceRpc(env, "video_class_admin_login", {
    p_name: name,
    p_password: password,
    p_turnstile_verified: turnstileVerified
  });
  const row = firstRow(rows);
  assertLoginOutcome(row, { role: "admin", turnstileToken, turnstileVerified });
  const token = String(row.admin_token || "");
  if (!UUID_RE.test(token)) throw new HttpError(502, "Administrator session could not be created");

  return json(request, env, {
    token,
    expiresAt: row.expires_at || null,
    admin: mapAdmin(row)
  }, 200);
}

function assertLoginOutcome(row, options) {
  if (!row || typeof row !== "object") {
    throw new HttpError(502, "Login protection returned an invalid response");
  }

  const outcome = String(row.outcome || "");
  if (outcome === "success") return;

  const challengeRequired = row.challenge_required === true;
  if (outcome === "blocked") {
    const retryAfter = Math.min(900, nullablePositiveInteger(row.retry_after_seconds) || 1);
    throw new HttpError(429, "Login temporarily delayed; please try again shortly", {
      code: "LOGIN_DELAYED",
      challengeRequired: true,
      retryAfter
    });
  }

  if (outcome === "challenge_required") {
    throw new HttpError(403, "Security verification is required", {
      code: options.turnstileToken && !options.turnstileVerified ? "TURNSTILE_INVALID" : "TURNSTILE_REQUIRED",
      challengeRequired: true
    });
  }

  if (outcome === "invalid") {
    throw new HttpError(401, options.role === "admin" ? "Incorrect administrator login" : "Incorrect login or video class access is not enabled", {
      code: "INVALID_CREDENTIALS",
      challengeRequired
    });
  }

  throw new HttpError(502, "Login protection returned an invalid response");
}

async function adminSession(request, env) {
  const token = requireBearerToken(request);
  const rows = await serviceRpc(env, "video_class_admin_me", {
    p_admin_token: token
  });
  const row = firstRow(rows);
  if (!row) throw new HttpError(401, "Administrator session is invalid or expired");
  return json(request, env, { admin: mapAdmin(row), expiresAt: row.expires_at || null }, 200);
}

async function adminLogout(request, env) {
  const token = requireBearerToken(request);
  await serviceRpc(env, "video_class_admin_logout", {
    p_admin_token: token
  });
  return new Response(null, { status: 204, headers: responseHeaders(request, env) });
}

async function adminListStudents(request, env, url) {
  const token = requireBearerToken(request);
  await assertAdminSession(env, token);
  const query = String(url.searchParams.get("q") || "").trim();
  if (query.length > 100) throw new HttpError(400, "Search is too long");
  const rows = await serviceRpc(env, "video_class_admin_list_students", {
    p_admin_token: token
  });
  if (!Array.isArray(rows)) throw new HttpError(401, "Administrator session is invalid or expired");
  const normalizedQuery = query.toLocaleLowerCase();
  const filtered = normalizedQuery
    ? rows.filter(row => String(row.name || "").toLocaleLowerCase().includes(normalizedQuery)
      || String(row.student_id || "").toLowerCase().includes(normalizedQuery)
      || String(row.video_key || "").toLowerCase().includes(normalizedQuery))
    : rows;
  return json(request, env, {
    students: filtered.map(mapRosterStudent),
    pagination: { returned: filtered.length, total: filtered.length }
  }, 200);
}

async function adminListCourses(request, env) {
  const token = requireBearerToken(request);
  await assertAdminSession(env, token);
  const rows = await serviceRpc(env, "video_class_admin_list_courses", {
    p_admin_token: token
  });
  if (!Array.isArray(rows)) throw new HttpError(502, "Course catalogue could not be loaded");
  return json(request, env, { courses: rows.map(mapCourse) }, 200);
}

async function adminListLessons(request, env, url) {
  const token = requireBearerToken(request);
  await assertAdminSession(env, token);
  const limit = normalizeR2ListLimit(url.searchParams.get("limit"));
  const cursorValue = String(url.searchParams.get("cursor") || "");
  const cursor = cursorValue ? (UUID_RE.test(cursorValue) ? cursorValue : null) : null;
  if (cursorValue && !cursor) throw new HttpError(400, "Invalid lesson cursor");
  const query = String(url.searchParams.get("q") || "").normalize("NFKC").trim();
  if (query.length > 100) throw new HttpError(400, "Lesson search is too long");
  const result = await serviceRpc(env, "video_class_admin_list_lessons_page", {
    p_admin_token: token,
    p_limit: limit,
    p_after_id: cursor,
    p_query: query
  });
  const value = Array.isArray(result) ? (firstRow(result) || {}) : (result || {});
  if (!value || typeof value !== "object" || !Array.isArray(value.lessons)) {
    throw new HttpError(502, "Lesson inventory could not be loaded");
  }
  const nextCursor = String(value.next_cursor || value.nextCursor || "");
  return json(request, env, {
    lessons: value.lessons.map(mapAdminLesson),
    cursor: UUID_RE.test(nextCursor) ? nextCursor : null,
    truncated: value.truncated === true && UUID_RE.test(nextCursor)
  }, 200);
}

async function adminChangeLessonPrivacy(request, env, lessonId) {
  if (!UUID_RE.test(lessonId)) throw new HttpError(400, "Invalid lesson ID");
  const body = await readJson(request, 4096);
  if (typeof body.private !== "boolean") throw new HttpError(400, "Private must be true or false");
  const token = requireBearerToken(request);
  await assertAdminSession(env, token);
  const result = await serviceRpc(env, "video_class_admin_set_lesson_private", {
    p_admin_token: token,
    p_lesson_id: lessonId,
    p_is_private: body.private
  });
  const row = firstRow(result);
  if (!row || !UUID_RE.test(String(row.lesson_id || ""))) {
    throw new HttpError(404, "Lesson was not found");
  }
  const isPrivate = isPrivateLesson(row);
  return json(request, env, {
    lesson: {
      id: String(row.lesson_id),
      private: isPrivate,
      isPrivate,
      updatedAt: row.updated_at || null
    }
  }, 200);
}

async function adminUpdateLesson(request, env, lessonId) {
  if (!UUID_RE.test(lessonId)) throw new HttpError(400, "Invalid lesson ID");
  const body = await readJson(request, 64 * 1024);
  const title = normalizeBoundedText(body.title, "Lesson title", 1, 160, true);
  const description = normalizeBoundedText(body.description ?? "", "Lesson description", 0, 2000, false);
  const courseCodes = normalizeCourseCodes(body.courseCodes ?? body.course_codes);
  const tags = normalizePublishTags(body.tags);
  const durationSeconds = requiredLessonDuration(body.durationSeconds ?? body.duration_seconds);
  const token = requireBearerToken(request);
  await assertAdminSession(env, token);
  const result = await serviceRpc(env, "video_class_admin_update_lesson", {
    p_admin_token: token,
    p_lesson_id: lessonId,
    p_title: title,
    p_description: description,
    p_course_codes: courseCodes,
    p_duration_seconds: durationSeconds,
    p_tags: tags
  });
  const lesson = mapEditedAdminLesson(firstRow(result));
  if (!lesson.id) throw new HttpError(404, "Lesson was not found");
  return json(request, env, { lesson }, 200);
}

async function serveAdminLessonThumbnail(request, env, lessonId) {
  if (!UUID_RE.test(lessonId)) throw new HttpError(404, "Thumbnail not found");
  const token = requireBearerToken(request);
  await assertAdminSession(env, token);
  const result = await serviceRpc(env, "video_class_admin_authorize_thumbnail", {
    p_admin_token: token,
    p_lesson_id: lessonId
  });
  const thumbnail = firstRow(result);
  const objectKey = safeObjectKey(thumbnail?.object_key);
  const contentType = safeImageContentType(thumbnail?.content_type);
  if (!objectKey || !contentType) throw new HttpError(404, "Thumbnail not found");
  let object;
  try { object = await requireVideoBucket(env).get(objectKey); }
  catch { throw new HttpError(503, "Thumbnail is temporarily unavailable"); }
  if (!object?.body || !Number.isSafeInteger(object.size) || object.size <= 0 || object.size > ADMIN_THUMBNAIL_MAX_BYTES) {
    throw new HttpError(404, "Thumbnail not found");
  }
  const expectedBytes = nullablePositiveInteger(thumbnail.byte_length);
  if (expectedBytes != null && expectedBytes !== object.size) {
    throw new HttpError(503, "Thumbnail is temporarily unavailable");
  }
  const headers = responseHeaders(request, env);
  headers.set("Content-Type", contentType);
  headers.set("Content-Length", String(object.size));
  headers.set("Content-Disposition", "inline");
  headers.set("Cross-Origin-Resource-Policy", "cross-origin");
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  if (object.httpEtag) headers.set("ETag", object.httpEtag);
  return new Response(object.body, { status: 200, headers });
}

async function adminSetLessonThumbnail(request, env, lessonId, remove) {
  if (!UUID_RE.test(lessonId)) throw new HttpError(400, "Invalid lesson ID");
  const token = requireBearerToken(request);
  await assertAdminSession(env, token);
  let objectKey = null;
  let metadata = null;
  if (!remove) {
    const body = await readJson(request, 8192);
    objectKey = normalizePrivateObjectKey(body.objectKey ?? body.object_key);
    if (!objectKey.startsWith(`${ADMIN_THUMBNAIL_PREFIX}${lessonId}/`) || !isImageObjectKey(objectKey)) {
      throw new HttpError(400, "Invalid lesson thumbnail object");
    }
    metadata = await headImageObject(requireVideoBucket(env), objectKey);
    if (metadata.size > ADMIN_THUMBNAIL_MAX_BYTES) throw new HttpError(413, "Thumbnail exceeds 10 MiB");
  }
  const result = await serviceRpc(env, "video_class_admin_set_thumbnail", {
    p_admin_token: token,
    p_lesson_id: lessonId,
    p_object_key: objectKey,
    p_content_type: metadata?.contentType || null,
    p_byte_length: metadata?.size || null
  });
  const value = firstRow(result);
  if (!value || !UUID_RE.test(String(value.lesson_id || ""))) throw new HttpError(404, "Lesson was not found");
  const previousObjectKey = safeObjectKey(value.previous_object_key);
  if (previousObjectKey && previousObjectKey !== objectKey) {
    try { await requireVideoBucket(env).delete(previousObjectKey); }
    catch { console.error(`${SERVICE_NAME}: replaced thumbnail cleanup failed`); }
  }
  return json(request, env, {
    lesson: {
      id: String(value.lesson_id),
      hasThumbnail: !remove && Boolean(objectKey),
      thumbnail: !remove && value.thumbnail && typeof value.thumbnail === "object" ? {
        contentType: safeImageContentType(value.thumbnail.content_type) || metadata?.contentType || null,
        byteLength: nullablePositiveInteger(value.thumbnail.byte_length) || metadata?.size || null,
        enabled: value.thumbnail.enabled !== false,
        updatedAt: value.thumbnail.updated_at || null
      } : null,
      thumbnailUpdatedAt: value.thumbnail?.updated_at || null
    }
  }, 200);
}

async function adminGrantLessonPreview(request, env, lessonId, requestUrl) {
  if (!UUID_RE.test(lessonId)) throw new HttpError(400, "Invalid lesson ID");
  requireSigningKey(env);
  const adminToken = requireBearerToken(request);
  const admin = await assertAdminSession(env, adminToken);
  const fingerprint = await requestFingerprint(request, env);
  const result = await serviceRpc(env, "video_class_admin_create_preview", {
    p_admin_token: adminToken,
    p_lesson_id: lessonId,
    p_user_agent_hash: fingerprint.userAgentHash
  });
  const preview = firstRow(result);
  if (!preview || String(preview.lesson_id || "") !== lessonId) throw new HttpError(404, "Lesson preview not found");
  const previewId = String(preview.preview_id || "");
  if (!UUID_RE.test(previewId)) throw new HttpError(502, "Lesson preview state is invalid");
  const now = Math.floor(Date.now() / 1000);
  const databaseExpiry = Math.floor(Date.parse(String(preview.expires_at || "")) / 1000);
  if (!Number.isFinite(databaseExpiry)) throw new HttpError(502, "Lesson preview expiry is invalid");
  const expires = Math.min(now + ADMIN_PREVIEW_TOKEN_TTL_SECONDS, databaseExpiry);
  const token = await signAdminPreviewToken({
    v: 1,
    aud: "admin-video-preview",
    sub: requireAdminId(admin),
    pid: previewId,
    lid: lessonId,
    uah: fingerprint.userAgentHash,
    iat: now,
    exp: expires
  }, env.VIDEO_CLASS_SIGNING_KEY);
  return json(request, env, {
    lessonId,
    previewUrl: `${requestUrl.origin}/v1/admin/lessons/${encodeURIComponent(lessonId)}/preview?token=${encodeURIComponent(token)}`,
    expiresAt: new Date(expires * 1000).toISOString()
  }, 201);
}

async function streamAdminLessonPreview(request, env, lessonId, token, ctx) {
  if (!UUID_RE.test(lessonId) || !token || token.length > 4096) throw new HttpError(404, "Lesson preview not found");
  requireSigningKey(env);
  const claims = await verifyAdminPreviewToken(token, env.VIDEO_CLASS_SIGNING_KEY);
  if (!claims || claims.lid !== lessonId) {
    throw new HttpError(401, "Lesson preview link is invalid or expired", { code: "ADMIN_PREVIEW_TOKEN_INVALID" });
  }
  const fingerprint = await requestFingerprint(request, env);
  if (claims.uah !== fingerprint.userAgentHash) {
    throw new HttpError(401, "Lesson preview link does not match this browser", { code: "ADMIN_PREVIEW_FINGERPRINT_CHANGED" });
  }
  const result = await serviceRpc(env, "video_class_admin_authorize_preview", {
    p_preview_id: claims.pid,
    p_admin_id: claims.sub,
    p_lesson_id: lessonId,
    p_user_agent_hash: fingerprint.userAgentHash
  });
  const preview = firstRow(result);
  if (!preview || String(preview.lesson_id || "") !== lessonId) {
    throw new HttpError(403, "Lesson preview access has expired", { code: "ADMIN_PREVIEW_ACCESS_REVOKED" });
  }
  const objectKey = safeObjectKey(preview.object_key);
  if (!objectKey) throw new HttpError(502, "Lesson preview metadata is invalid");
  const bucket = requireVideoBucket(env);
  let head;
  try { head = await bucket.head(objectKey); }
  catch { throw new HttpError(503, "Lesson preview is temporarily unavailable"); }
  if (!head) throw new HttpError(404, "Lesson preview not found");
  const expectedBytes = nullablePositiveInteger(preview.byte_length);
  if (expectedBytes != null && expectedBytes !== head.size) throw new HttpError(503, "Lesson preview is temporarily unavailable");
  const rangeHeader = request.headers.get("Range");
  const range = rangeHeader ? parseByteRange(rangeHeader, head.size) : null;
  if (rangeHeader && !range) return rangeNotSatisfiable(request, env, head.size);
  const headers = videoHeaders(request, env, head, preview, range);
  if (request.method === "HEAD") return new Response(null, { status: range ? 206 : 200, headers });
  let object;
  try {
    object = await bucket.get(objectKey, range ? { range: { offset: range.offset, length: range.length } } : undefined);
  } catch {
    throw new HttpError(503, "Lesson preview is temporarily unavailable");
  }
  if (!object?.body) throw new HttpError(503, "Lesson preview is temporarily unavailable");
  if (ctx?.waitUntil) ctx.waitUntil(Promise.resolve());
  return new Response(object.body, { status: range ? 206 : 200, headers });
}

async function adminDeleteLesson(request, env, lessonId, url) {
  if (!UUID_RE.test(lessonId)) throw new HttpError(400, "Invalid lesson ID");
  if (String(url.searchParams.get("deleteObject") || "").toLowerCase() !== "true") {
    throw new HttpError(400, "Permanent storage deletion must be explicitly confirmed");
  }
  const token = requireBearerToken(request);
  await assertAdminSession(env, token);
  const preparedResult = await serviceRpc(env, "video_class_admin_prepare_delete_lesson", {
    p_admin_token: token,
    p_lesson_id: lessonId
  });
  const prepared = firstRow(preparedResult);
  if (!prepared || !UUID_RE.test(String(prepared.lesson_id || ""))) throw new HttpError(404, "Lesson was not found");
  const deletionJobId = String(prepared.delete_job_id || "");
  if (!UUID_RE.test(deletionJobId)) throw new HttpError(502, "Lesson deletion state is invalid");
  const rawKeys = Array.isArray(prepared.object_keys) ? prepared.object_keys : [];
  const normalizedKeys = rawKeys.map(safeObjectKey);
  const objectKeys = [...new Set(normalizedKeys.filter(Boolean))];
  if (normalizedKeys.some(key => !key)) {
    throw new HttpError(502, "Lesson storage deletion plan is invalid");
  }
  try {
    const bucket = requireVideoBucket(env);
    await deleteR2ObjectsInBatches(bucket, objectKeys);
  } catch {
    throw new HttpError(503, "Lesson files could not be permanently removed from private storage");
  }
  const deleted = await serviceRpc(env, "video_class_admin_finish_delete_lesson", {
    p_admin_token: token,
    p_delete_job_id: deletionJobId
  });
  if (deleted !== true) throw new HttpError(409, "Lesson changed while it was being removed; retry deletion");
  return new Response(null, { status: 204, headers: responseHeaders(request, env) });
}

async function adminSetLessonCourses(request, env, lessonId) {
  if (!UUID_RE.test(lessonId)) throw new HttpError(400, "Invalid lesson ID");
  const body = await readJson(request, 8192);
  const courseCodes = normalizeCourseCodes(body.courseCodes ?? body.course_codes);
  const token = requireBearerToken(request);
  await assertAdminSession(env, token);
  const result = await serviceRpc(env, "video_class_admin_set_lesson_courses", {
    p_admin_token: token,
    p_lesson_id: lessonId,
    p_course_codes: courseCodes
  });
  const lesson = firstRow(result);
  if (!lesson || !UUID_RE.test(String(lesson.lesson_id || ""))) throw new HttpError(404, "Lesson was not found");
  return json(request, env, {
    lesson: {
      id: String(lesson.lesson_id),
      courseCode: String(lesson.course_code || ""),
      courseCodes: Array.isArray(lesson.course_codes) ? lesson.course_codes.map(String) : courseCodes
    }
  }, 200);
}

async function adminListOfficialPlaylists(request, env, url) {
  const token = requireBearerToken(request);
  await assertAdminSession(env, token);
  const limit = normalizeR2ListLimit(url.searchParams.get("limit"));
  const cursorValue = String(url.searchParams.get("cursor") || "");
  const cursor = cursorValue ? (UUID_RE.test(cursorValue) ? cursorValue : null) : null;
  if (cursorValue && !cursor) throw new HttpError(400, "Invalid series cursor");
  const query = String(url.searchParams.get("q") || "").normalize("NFKC").trim();
  if (query.length > 100) throw new HttpError(400, "Series search is too long");
  const result = await serviceRpc(env, "video_class_admin_list_official_playlists_page", {
    p_admin_token: token,
    p_limit: limit,
    p_after_id: cursor,
    p_query: query
  });
  const value = Array.isArray(result) ? (firstRow(result) || {}) : (result || {});
  if (!Array.isArray(value.playlists)) throw new HttpError(502, "Series catalogue could not be loaded");
  const nextCursor = String(value.next_cursor || value.nextCursor || "");
  const rawOrder = value.order && typeof value.order === "object" ? value.order : value;
  return json(request, env, {
    playlists: value.playlists.map(mapOfficialPlaylist),
    order: mapOfficialPlaylistOrder(rawOrder),
    cursor: UUID_RE.test(nextCursor) ? nextCursor : null,
    truncated: value.truncated === true && UUID_RE.test(nextCursor)
  }, 200);
}

async function adminSaveOfficialPlaylist(request, env) {
  const token = requireBearerToken(request);
  await assertAdminSession(env, token);
  const body = await readJson(request, 512 * 1024);
  const playlistId = body.id == null || body.id === "" ? null : String(body.id);
  if (playlistId && !UUID_RE.test(playlistId)) throw new HttpError(400, "Invalid series ID");
  const name = normalizeBoundedText(body.name ?? body.title, "Series name", 1, 160, true);
  const description = normalizeBoundedText(body.description ?? "", "Series description", 0, 1000, false);
  const courseCodes = normalizeCourseCodes(body.courseCodes ?? body.course_codes);
  const lessonIds = normalizeUuidList(body.lessonIds ?? body.lesson_ids, 500, "lesson");
  if (!lessonIds.length) throw new HttpError(400, "Choose at least one lesson");
  const result = await serviceRpc(env, "video_class_admin_save_official_playlist", {
    p_admin_token: token,
    p_playlist_id: playlistId,
    p_name: name,
    p_description: description,
    p_course_codes: courseCodes,
    p_lesson_ids: lessonIds,
    p_published: body.published !== false
  });
  const playlist = mapOfficialPlaylist(firstRow(result));
  if (!playlist.id) throw new HttpError(409, "Official series could not be saved");
  return json(request, env, { playlist }, playlistId ? 200 : 201);
}

async function adminSetOfficialPlaylistOrder(request, env) {
  const token = requireBearerToken(request);
  await assertAdminSession(env, token);
  const body = await readJson(request, 512 * 1024);
  const mode = String(body.mode || "").trim().toLowerCase();
  if (!["manual", "random"].includes(mode)) throw new HttpError(400, "Series order mode must be manual or random");
  const playlistIds = normalizeUuidList(body.playlistIds ?? body.playlist_ids ?? [], 5000, "series");
  const result = await serviceRpc(env, "video_class_admin_set_official_playlist_order", {
    p_admin_token: token,
    p_order_mode: mode,
    p_ordered_playlist_ids: playlistIds
  });
  const value = firstRow(result);
  if (!value) throw new HttpError(409, "Official series order could not be saved");
  return json(request, env, {
    order: {
      mode: String(value.mode || value.order_mode || mode),
      playlistIds: Array.isArray(value.playlist_ids || value.ordered_ids || value.ordered_playlist_ids)
        ? (value.playlist_ids || value.ordered_ids || value.ordered_playlist_ids).map(String).filter(id => UUID_RE.test(id))
        : playlistIds,
      updatedAt: value.updated_at || null
    }
  }, 200);
}

async function adminCreateAttachment(request, env, lessonId) {
  if (!UUID_RE.test(lessonId)) throw new HttpError(400, "Invalid lesson ID");
  const token = requireBearerToken(request);
  await assertAdminSession(env, token);
  const body = await readJson(request, 8192);
  const objectKey = normalizePrivateObjectKey(body.objectKey ?? body.object_key);
  if (!objectKey.startsWith(`${ADMIN_ATTACHMENT_PREFIX}${lessonId}/`) || objectKeyExtension(objectKey) !== ".pdf") {
    throw new HttpError(400, "Invalid lesson attachment object");
  }
  const displayName = normalizeBoundedText(body.displayName ?? body.display_name, "Attachment name", 1, 180, true);
  const metadata = await headPdfObject(requireVideoBucket(env), objectKey);
  let result;
  try {
    result = await serviceRpc(env, "video_class_admin_add_attachment", {
      p_admin_token: token,
      p_lesson_id: lessonId,
      p_display_name: displayName,
      p_object_key: objectKey,
      p_content_type: metadata.contentType,
      p_byte_length: metadata.size
    });
  } catch (error) {
    try { await requireVideoBucket(env).delete(objectKey); } catch { /* Orphan cleanup can be retried from private inventory. */ }
    throw error;
  }
  const attachment = mapAttachment(firstRow(result));
  if (!attachment.id) throw new HttpError(502, "Attachment response is invalid");
  return json(request, env, { attachment }, 201);
}

async function adminSetAttachmentPrivacy(request, env, attachmentId) {
  if (!UUID_RE.test(attachmentId)) throw new HttpError(400, "Invalid attachment ID");
  const body = await readJson(request, 4096);
  if (typeof body.private !== "boolean") throw new HttpError(400, "Private must be true or false");
  const token = requireBearerToken(request);
  await assertAdminSession(env, token);
  const result = await serviceRpc(env, "video_class_admin_set_attachment_private", {
    p_admin_token: token,
    p_attachment_id: attachmentId,
    p_is_private: body.private
  });
  const attachment = firstRow(result);
  if (!attachment) throw new HttpError(404, "Attachment was not found");
  return json(request, env, { attachment: mapAttachment(attachment) }, 200);
}

async function adminDeleteAttachment(request, env, attachmentId) {
  if (!UUID_RE.test(attachmentId)) throw new HttpError(400, "Invalid attachment ID");
  const token = requireBearerToken(request);
  await assertAdminSession(env, token);
  const rows = await serviceRpc(env, "video_class_admin_prepare_delete_attachment", {
    p_admin_token: token,
    p_attachment_id: attachmentId
  });
  const attachment = firstRow(rows);
  const objectKey = safeObjectKey(attachment?.object_key);
  if (!objectKey) throw new HttpError(404, "Attachment was not found");
  try {
    await requireVideoBucket(env).delete(objectKey);
  } catch {
    throw new HttpError(503, "Attachment could not be permanently removed from private storage");
  }
  const deleted = await serviceRpc(env, "video_class_admin_finish_delete_attachment", {
    p_admin_token: token,
    p_attachment_id: attachmentId,
    p_object_key: objectKey
  });
  if (deleted !== true) throw new HttpError(409, "Attachment record changed while it was being removed");
  return new Response(null, { status: 204, headers: responseHeaders(request, env) });
}

async function adminListR2Objects(request, env, url) {
  const token = requireBearerToken(request);
  await assertAdminSession(env, token);
  const bucket = requireVideoBucket(env);
  const prefix = normalizeR2ListPrefix(url.searchParams.get("prefix") || "");
  const query = String(url.searchParams.get("q") || "").normalize("NFKC").trim().toLocaleLowerCase();
  if (query.length > 100) throw new HttpError(400, "Private library search is too long");
  const cursor = normalizeR2Cursor(url.searchParams.get("cursor") || "");
  const limit = normalizeR2ListLimit(url.searchParams.get("limit"));

  let page;
  try {
    page = await bucket.list({
      prefix,
      cursor: cursor || undefined,
      limit,
      include: ["httpMetadata", "customMetadata"]
    });
  } catch {
    throw new HttpError(503, "Private video inventory is temporarily unavailable");
  }

  const listedObjects = Array.isArray(page?.objects) ? page.objects : [];
  const objects = listedObjects.filter(object => {
    if (!isVideoObjectKey(object?.key)) return false;
    if (!query) return true;
    const originalName = String(object?.customMetadata?.originalFilename || "");
    return `${object.key}\n${originalName}`.normalize("NFKC").toLocaleLowerCase().includes(query);
  });
  const objectKeys = objects.map(object => String(object.key));
  let matches = [];
  if (objectKeys.length) {
    const result = await serviceRpc(env, "video_class_admin_match_r2_objects", {
      p_admin_token: token,
      p_object_keys: objectKeys
    });
    const value = Array.isArray(result) ? (firstRow(result) || {}) : (result || {});
    if (!value || typeof value !== "object" || !Array.isArray(value.matches)) {
      throw new HttpError(502, "Private library publication status could not be loaded");
    }
    matches = value.matches;
  }
  const matchByKey = new Map();
  for (const match of matches) {
    const key = String(match?.object_key || "");
    if (key && objectKeys.includes(key) && !matchByKey.has(key)) matchByKey.set(key, match);
  }

  const truncated = page?.truncated === true;
  const nextCursor = truncated && typeof page.cursor === "string" && page.cursor ? page.cursor : null;
  if (truncated && !nextCursor) throw new HttpError(502, "Private library pagination cursor is missing");
  return json(request, env, {
    items: objects.map(object => mapAdminR2Object(object, matchByKey.get(String(object.key)))),
    cursor: nextCursor,
    truncated
  }, 200);
}

async function adminDownloadPrivateVideo(request, env) {
  const token = requireBearerToken(request);
  await assertAdminSession(env, token);
  const body = await readJson(request, 8192);
  const objectKey = normalizePrivateObjectKey(body.key ?? body.objectKey ?? body.object_key);
  if (!isVideoObjectKey(objectKey)) throw new HttpError(400, "Only private video files can be downloaded here");
  const bucket = requireVideoBucket(env);
  let object;
  try { object = await bucket.get(objectKey); }
  catch { throw new HttpError(503, "Private video is temporarily unavailable"); }
  if (!object?.body || String(object.key || "") !== objectKey) throw new HttpError(404, "Private video was not found");
  const size = Number(object.size);
  if (!Number.isSafeInteger(size) || size <= 0) throw new HttpError(503, "Private video metadata is invalid");
  const headers = responseHeaders(request, env);
  headers.set("Content-Type", safeVideoContentType(object.httpMetadata?.contentType));
  headers.set("Content-Length", String(size));
  headers.set("Content-Disposition", contentDispositionAttachment(objectKey.split("/").pop() || "video.mp4"));
  headers.set("Cache-Control", "private, no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(object.body, { status: 200, headers });
}

async function adminCreateR2Upload(request, env) {
  requireSigningKey(env);
  const token = requireBearerToken(request);
  const admin = await assertAdminSession(env, token);
  const adminId = requireAdminId(admin);
  const body = await readJson(request, 8192);
  const uploadKind = String(body.kind || "video").trim().toLowerCase();
  if (!["video", "attachment", "thumbnail"].includes(uploadKind)) throw new HttpError(400, "Invalid upload kind");
  const lessonId = uploadKind === "video" ? "" : String(body.lessonId ?? body.lesson_id ?? "");
  if (uploadKind !== "video" && !UUID_RE.test(lessonId)) throw new HttpError(400, "Invalid lesson ID");
  const fileName = uploadKind === "attachment"
    ? normalizeAttachmentFileName(body.fileName ?? body.filename ?? body.name)
    : (uploadKind === "thumbnail"
      ? normalizeThumbnailFileName(body.fileName ?? body.filename ?? body.name)
      : normalizeUploadFileName(body.fileName ?? body.filename ?? body.name));
  const sizeBytes = uploadKind === "attachment"
    ? normalizeAttachmentUploadSize(body.sizeBytes ?? body.size)
    : (uploadKind === "thumbnail"
      ? normalizeThumbnailUploadSize(body.sizeBytes ?? body.size)
      : normalizeUploadSize(body.sizeBytes ?? body.size));
  const durationSeconds = uploadKind === "video"
    ? optionalLessonDuration(body.durationSeconds ?? body.duration_seconds)
    : null;
  const contentType = uploadKind === "attachment"
    ? "application/pdf"
    : (uploadKind === "thumbnail"
      ? imageContentTypeForKey(fileName, body.contentType ?? body.content_type, true)
      : videoContentTypeForKey(fileName, body.contentType ?? body.content_type, true));
  const partSize = ADMIN_UPLOAD_PART_BYTES;
  const partCount = Math.ceil(sizeBytes / partSize);
  if (partCount < 1 || partCount > ADMIN_UPLOAD_MAX_PARTS) {
    throw new HttpError(400, "Video requires too many upload parts");
  }
  const key = uploadKind === "attachment"
    ? createAdminAttachmentUploadKey(lessonId, fileName)
    : (uploadKind === "thumbnail"
      ? createAdminThumbnailUploadKey(lessonId, fileName)
      : createAdminUploadKey(fileName));
  const bucket = requireVideoBucket(env);
  let multipartUpload;
  try {
    multipartUpload = await bucket.createMultipartUpload(key, {
      httpMetadata: { contentType, contentDisposition: "inline" },
      customMetadata: {
        uploadSource: "admin-browser",
        uploadKind,
        ...(lessonId ? { lessonId } : {}),
        originalFilename: fileName,
        ...(durationSeconds == null ? {} : { durationSeconds: String(durationSeconds) })
      }
    });
  } catch {
    throw new HttpError(503, "Private video upload could not be started");
  }
  const uploadId = String(multipartUpload?.uploadId || "");
  if (!ADMIN_UPLOAD_ID_RE.test(uploadId) || String(multipartUpload?.key || "") !== key) {
    try { await multipartUpload?.abort?.(); } catch { /* R2 expires incomplete uploads automatically. */ }
    throw new HttpError(502, "Private video upload returned invalid state");
  }
  const now = Math.floor(Date.now() / 1000);
  const expiresAtSeconds = now + ADMIN_UPLOAD_TOKEN_TTL_SECONDS;
  const uploadToken = await signAdminUploadToken({
    v: 1,
    aud: "admin-r2-upload",
    sub: adminId,
    uid: uploadId,
    key,
    size: sizeBytes,
    partSize,
    partCount,
    contentType,
    kind: uploadKind,
    lessonId: lessonId || null,
    iat: now,
    exp: expiresAtSeconds
  }, env.VIDEO_CLASS_SIGNING_KEY);
  return json(request, env, {
    upload: {
      uploadId,
      key,
      uploadToken,
      partSize,
      partCount,
      maxParts: ADMIN_UPLOAD_MAX_PARTS,
      durationSeconds,
      durationSource: durationSeconds == null && uploadKind === "video" ? "server-probe-at-publish" : "client-media-metadata",
      kind: uploadKind,
      lessonId: lessonId || null,
      expiresAt: new Date(expiresAtSeconds * 1000).toISOString()
    }
  }, 201);
}

async function adminUploadR2Part(request, env, uploadId, partNumberValue) {
  requireSigningKey(env);
  if (!ADMIN_UPLOAD_ID_RE.test(uploadId)) throw new HttpError(400, "Invalid upload ID");
  if (!/^\d{1,5}$/.test(partNumberValue)) throw new HttpError(400, "Invalid upload part number");
  const partNumber = Number(partNumberValue);
  const token = requireBearerToken(request);
  const admin = await assertAdminSession(env, token);
  const state = await requireAdminUploadState(request, env, requireAdminId(admin), uploadId);
  if (!Number.isInteger(partNumber) || partNumber < 1 || partNumber > state.partCount) {
    throw new HttpError(400, "Invalid upload part number");
  }
  if (!request.body) throw new HttpError(400, "Upload part is required");
  const declaredLength = String(request.headers.get("Content-Length") || "");
  if (!/^\d+$/.test(declaredLength)) throw new HttpError(411, "Upload part Content-Length is required");
  const contentLength = Number(declaredLength);
  const expectedLength = partNumber === state.partCount
    ? state.size - state.partSize * (state.partCount - 1)
    : state.partSize;
  if (!Number.isSafeInteger(contentLength) || contentLength !== expectedLength) {
    throw new HttpError(400, `Upload part must be exactly ${expectedLength} bytes`);
  }
  const contentEncoding = String(request.headers.get("Content-Encoding") || "identity").toLowerCase();
  if (contentEncoding !== "identity") throw new HttpError(415, "Upload parts must not be content-encoded");
  const contentType = String(request.headers.get("Content-Type") || "application/octet-stream")
    .split(";", 1)[0].trim().toLowerCase();
  if (!["application/octet-stream", state.contentType].includes(contentType)) {
    throw new HttpError(415, "Upload part content type is invalid");
  }

  let uploadedPart;
  try {
    uploadedPart = await requireVideoBucket(env)
      .resumeMultipartUpload(state.key, state.uid)
      .uploadPart(partNumber, request.body);
  } catch {
    throw new HttpError(409, "Multipart upload is no longer active");
  }
  const etag = String(uploadedPart?.etag || "");
  if (!isSafePartEtag(etag) || Number(uploadedPart?.partNumber) !== partNumber) {
    throw new HttpError(502, "Private library returned invalid upload-part metadata");
  }
  return json(request, env, { part: { partNumber, etag } }, 200);
}

async function adminCompleteR2Upload(request, env, uploadId) {
  requireSigningKey(env);
  if (!ADMIN_UPLOAD_ID_RE.test(uploadId)) throw new HttpError(400, "Invalid upload ID");
  const token = requireBearerToken(request);
  const admin = await assertAdminSession(env, token);
  const body = await readJson(request, ADMIN_UPLOAD_COMPLETE_MAX_JSON_BYTES);
  const state = await requireAdminUploadState(request, env, requireAdminId(admin), uploadId, body.uploadToken);
  const parts = normalizeCompletedUploadParts(body.parts, state.partCount);
  let object;
  try {
    object = await requireVideoBucket(env)
      .resumeMultipartUpload(state.key, state.uid)
      .complete(parts);
  } catch {
    throw new HttpError(409, "Multipart upload could not be completed");
  }
  if (!object || String(object.key || "") !== state.key || Number(object.size) !== state.size) {
    throw new HttpError(502, "Completed private video metadata is invalid");
  }
  return json(request, env, { object: mapAdminR2Object(object, null) }, 201);
}

async function adminAbortR2Upload(request, env, uploadId) {
  requireSigningKey(env);
  if (!ADMIN_UPLOAD_ID_RE.test(uploadId)) throw new HttpError(400, "Invalid upload ID");
  const token = requireBearerToken(request);
  const admin = await assertAdminSession(env, token);
  const state = await requireAdminUploadState(request, env, requireAdminId(admin), uploadId);
  try {
    await requireVideoBucket(env).resumeMultipartUpload(state.key, state.uid).abort();
  } catch {
    throw new HttpError(409, "Multipart upload is no longer active");
  }
  return new Response(null, { status: 204, headers: responseHeaders(request, env) });
}

async function adminPublishR2Object(request, env) {
  const token = requireBearerToken(request);
  await assertAdminSession(env, token);
  const body = await readJson(request, 64 * 1024);
  const objectKey = normalizePrivateObjectKey(body.objectKey ?? body.object_key);
  const title = normalizeBoundedText(body.title, "Lesson title", 1, 160, true);
  const description = normalizeBoundedText(body.description ?? "", "Lesson description", 0, 2000, false);
  const legacyCourseCode = String(body.courseCode ?? body.course_code ?? "").trim().toLowerCase();
  const courseCodes = Array.isArray(body.courseCodes ?? body.course_codes)
    ? normalizeCourseCodes(body.courseCodes ?? body.course_codes)
    : normalizeCourseCodes([legacyCourseCode]);
  const courseCode = legacyCourseCode && courseCodes.includes(legacyCourseCode)
    ? legacyCourseCode
    : courseCodes[0];
  const courseLabel = normalizeBoundedText(body.courseLabel ?? body.course_label ?? "錄影班", "Course label", 1, 120, true);
  const sortOrder = normalizeBoundedInteger(body.sortOrder ?? body.sort_order ?? 0, "Sort order", -1000000, 1000000);
  const tags = normalizePublishTags(body.tags);
  const renditionRequests = normalizePublishRenditionRequests(body.renditions);
  const thumbnailRequest = normalizePublishThumbnailRequest(body.thumbnail);
  const requestedKeys = [objectKey, ...renditionRequests.map(item => item.objectKey)];
  if (thumbnailRequest) requestedKeys.push(thumbnailRequest.objectKey);
  if (new Set(requestedKeys).size !== requestedKeys.length) {
    throw new HttpError(400, "Each private video can be assigned only once");
  }

  const bucket = requireVideoBucket(env);
  const [source, ...relatedObjects] = await Promise.all([
    headVideoObject(bucket, objectKey),
    ...renditionRequests.map(item => headVideoObject(bucket, item.objectKey)),
    ...(thumbnailRequest ? [headImageObject(bucket, thumbnailRequest.objectKey)] : [])
  ]);
  const suppliedDuration = body.durationSeconds ?? body.duration_seconds;
  let metadataDuration = suppliedDuration == null || suppliedDuration === ""
    ? optionalLessonDuration(source.customMetadata?.durationSeconds)
    : null;
  if (suppliedDuration == null || suppliedDuration === "") {
    metadataDuration ||= await detectPrivateVideoDurationSeconds(bucket, objectKey, source);
  }
  const durationSeconds = requiredLessonDuration(
    suppliedDuration == null || suppliedDuration === "" ? metadataDuration : suppliedDuration
  );
  const slug = body.slug == null || String(body.slug).trim() === ""
    ? await deriveLessonSlug(title, objectKey)
    : normalizeLessonSlug(body.slug);
  const renditionObjects = relatedObjects.slice(0, renditionRequests.length);
  const thumbnailObject = thumbnailRequest ? relatedObjects[relatedObjects.length - 1] : null;
  const renditions = renditionRequests.map((item, index) => ({
    quality_code: item.qualityCode,
    display_label: item.displayLabel,
    object_key: item.objectKey,
    content_type: renditionObjects[index].contentType,
    height_pixels: item.heightPixels,
    byte_length: renditionObjects[index].size,
    sort_order: item.sortOrder
  }));
  const thumbnail = thumbnailRequest ? {
    object_key: thumbnailRequest.objectKey,
    content_type: thumbnailObject.contentType,
    byte_length: thumbnailObject.size
  } : null;

  const result = await serviceRpc(env, "video_class_admin_publish_r2_object", {
    p_admin_token: token,
    p_object_key: objectKey,
    p_slug: slug,
    p_title: title,
    p_description: description,
    p_course_code: courseCode,
    p_course_codes: courseCodes,
    p_course_label: courseLabel,
    p_duration_seconds: durationSeconds,
    p_sort_order: sortOrder,
    p_content_type: source.contentType,
    p_byte_length: source.size,
    p_tags: tags,
    p_renditions: renditions,
    p_thumbnail: thumbnail
  });
  const lesson = firstRow(result);
  if (!lesson || !UUID_RE.test(String(lesson.lesson_id || ""))) {
    throw new HttpError(502, "Published lesson response is invalid");
  }
  return json(request, env, { lesson: mapAdminLesson(lesson) }, 201);
}

async function adminListFeedback(request, env, url) {
  const token = requireBearerToken(request);
  await assertAdminSession(env, token);
  const limit = normalizeR2ListLimit(url.searchParams.get("limit"));
  const cursorValue = String(url.searchParams.get("cursor") || "");
  const cursor = normalizeFeedbackCursor(cursorValue);
  if (cursorValue && !cursor) throw new HttpError(400, "Invalid feedback cursor");
  const result = await serviceRpc(env, "video_class_admin_list_feedback_page", {
    p_admin_token: token,
    p_limit: limit,
    p_after_cursor: cursor
  });
  const value = Array.isArray(result) ? (firstRow(result) || {}) : (result || {});
  const rows = Array.isArray(value.feedback) ? value.feedback : (Array.isArray(value.items) ? value.items : []);
  const nextCursorValue = String(value.next_cursor || value.nextCursor || "");
  const nextCursor = normalizeFeedbackCursor(nextCursorValue);
  if (nextCursorValue && !nextCursor) throw new HttpError(502, "Feedback cursor is invalid");
  return json(request, env, {
    feedback: rows.map(mapFeedbackRecord),
    summary: value.summary && typeof value.summary === "object" ? value.summary : {},
    cursor: nextCursor,
    truncated: value.truncated === true && Boolean(nextCursor)
  }, 200);
}

async function adminChangeFeedback(request, env, studentId, lessonId, remove) {
  if (!UUID_RE.test(studentId) || !UUID_RE.test(lessonId)) throw new HttpError(400, "Invalid feedback identity");
  const token = requireBearerToken(request);
  await assertAdminSession(env, token);
  let picture = null;
  let explanation = null;
  let audio = null;
  if (!remove) {
    const body = await readJson(request, 4096);
    picture = nullableAdminRating(body.pictureQuality ?? body.picture_quality);
    explanation = nullableAdminRating(body.explanationQuality ?? body.explanation_quality);
    audio = nullableAdminRating(body.audioQuality ?? body.audio_quality);
  }
  const result = await serviceRpc(env, "video_class_admin_change_feedback", {
    p_admin_token: token,
    p_student_id: studentId,
    p_lesson_id: lessonId,
    p_picture_quality: picture,
    p_explanation_quality: explanation,
    p_audio_quality: audio
  });
  const value = firstRow(result);
  if (!value) throw new HttpError(404, "Feedback was not found");
  if (value.deleted === true) return new Response(null, { status: 204, headers: responseHeaders(request, env) });
  return json(request, env, { feedback: mapFeedbackRecord(value) }, 200);
}

async function adminChangeStudentKey(request, env, studentId, clear) {
  if (!UUID_RE.test(studentId)) throw new HttpError(400, "Invalid student ID");
  const token = requireBearerToken(request);
  await assertAdminSession(env, token);
  let action = "clear";

  if (!clear) {
    const body = await readJson(request, 4096);
    action = String(body.action || (body.rotate === true ? "rotate" : "generate")).toLowerCase();
    if (!["generate", "rotate"].includes(action)) {
      throw new HttpError(400, "Invalid key action");
    }
  }

  if (clear) {
    const cleared = await serviceRpc(env, "video_class_admin_clear_key", {
      p_admin_token: token,
      p_student_id: studentId
    });
    if (cleared !== true) throw new HttpError(404, "Student does not have a video key");
    return json(request, env, { cleared: true, studentId }, 200);
  }

  const rows = await serviceRpc(env, "video_class_admin_issue_key", {
    p_admin_token: token,
    p_student_id: studentId,
    p_rotate: action === "rotate"
  });
  const row = firstRow(rows);
  if (!row) throw new HttpError(404, "Student was not found or administrator session expired");
  return json(request, env, { student: mapRosterStudent(row) }, 200);
}

async function adminChangeStudentAccess(request, env, studentId) {
  if (!UUID_RE.test(studentId)) throw new HttpError(400, "Invalid student ID");
  const body = await readJson(request, 4096);
  if (typeof body.enabled !== "boolean") throw new HttpError(400, "Enabled must be true or false");
  const token = requireBearerToken(request);
  await assertAdminSession(env, token);
  const rows = await serviceRpc(env, "video_class_admin_set_enabled", {
    p_admin_token: token,
    p_student_id: studentId,
    p_enabled: body.enabled
  });
  const row = firstRow(rows);
  if (!row) throw new HttpError(404, "Student was not found or administrator session expired");
  return json(request, env, { student: mapRosterStudent(row) }, 200);
}

async function adminChangeStudentCourseAccess(request, env, studentId, courseCode) {
  if (!UUID_RE.test(studentId)) throw new HttpError(400, "Invalid student ID");
  if (!COURSE_CODE_RE.test(courseCode)) throw new HttpError(400, "Invalid course code");
  const body = await readJson(request, 4096);
  if (typeof body.enabled !== "boolean") throw new HttpError(400, "Enabled must be true or false");
  const token = requireBearerToken(request);
  await assertAdminSession(env, token);
  const rows = await serviceRpc(env, "video_class_admin_set_course_access", {
    p_admin_token: token,
    p_student_id: studentId,
    p_course_code: courseCode,
    p_enabled: body.enabled
  });
  const row = firstRow(rows);
  if (!row) throw new HttpError(404, "Student or course was not found");
  return json(request, env, { courseAccess: mapCourseAccess(row) }, 200);
}

async function adminListStudentOfficialPlaylistAccess(request, env, studentId) {
  if (!UUID_RE.test(studentId)) throw new HttpError(400, "Invalid student ID");
  const token = requireBearerToken(request);
  await assertAdminSession(env, token);
  const result = await serviceRpc(env, "video_class_admin_list_student_series_access", {
    p_admin_token: token,
    p_student_id: studentId
  });
  const value = Array.isArray(result) ? (firstRow(result) || {}) : (result || {});
  if (!value || typeof value !== "object" || !Array.isArray(value.courses)) {
    throw new HttpError(404, "Student was not found");
  }
  return json(request, env, {
    studentId,
    courses: Array.isArray(value.courses) ? value.courses.map(mapStudentSeriesCourse).filter(course => course.courseCode) : [],
    playlists: flattenStudentSeriesPlaylists(value.courses),
    updatedAt: value.updated_at || null
  }, 200);
}

async function adminChangeStudentOfficialPlaylistAccess(request, env, studentId, playlistId) {
  if (!UUID_RE.test(studentId) || !UUID_RE.test(playlistId)) throw new HttpError(400, "Invalid student or series ID");
  const body = await readJson(request, 4096);
  const courseCode = String(body.courseCode ?? body.course_code ?? "").trim().toLowerCase();
  if (!COURSE_CODE_RE.test(courseCode)) throw new HttpError(400, "Invalid course code");
  if (typeof body.enabled !== "boolean") throw new HttpError(400, "Enabled must be true or false");
  const token = requireBearerToken(request);
  await assertAdminSession(env, token);
  const result = await serviceRpc(env, "video_class_admin_set_student_official_playlist_access", {
    p_admin_token: token,
    p_student_id: studentId,
    p_course_code: courseCode,
    p_playlist_id: playlistId,
    p_enabled: body.enabled
  });
  const value = firstRow(result);
  const selectedCourse = Array.isArray(value?.courses)
    ? value.courses.find(course => String(course?.course_code || course?.courseCode || "") === courseCode)
    : null;
  const access = (Array.isArray(selectedCourse?.playlists) ? selectedCourse.playlists : [])
    .map(mapOfficialPlaylistAccess)
    .find(playlist => playlist.id === playlistId);
  if (!access?.id) throw new HttpError(404, "Student or official series was not found");
  return json(request, env, { studentId, playlist: access }, 200);
}

async function adminSetStudentOfficialPlaylistAccessBulk(request, env, studentId) {
  if (!UUID_RE.test(studentId)) throw new HttpError(400, "Invalid student ID");
  const body = await readJson(request, 128 * 1024);
  const courseCode = String(body.courseCode ?? body.course_code ?? "").trim().toLowerCase();
  if (!COURSE_CODE_RE.test(courseCode)) throw new HttpError(400, "Invalid course code");
  const mode = String(body.mode || "").trim().toLowerCase();
  if (!["all", "none", "manual"].includes(mode)) throw new HttpError(400, "Series access mode must be all, none, or manual");
  const playlistIds = normalizeUuidList(body.playlistIds ?? body.playlist_ids ?? [], 500, "series");
  if (mode !== "manual" && playlistIds.length) throw new HttpError(400, "Only manual access accepts a series selection");
  const token = requireBearerToken(request);
  await assertAdminSession(env, token);
  const result = mode === "manual"
    ? await serviceRpc(env, "video_class_admin_replace_student_official_playlist_access", {
        p_admin_token: token,
        p_student_id: studentId,
        p_course_code: courseCode,
        p_enabled_playlist_ids: playlistIds
      })
    : await serviceRpc(env, "video_class_admin_set_student_series_mode", {
        p_admin_token: token,
        p_student_id: studentId,
        p_course_code: courseCode,
        p_mode: mode
      });
  const value = firstRow(result);
  if (!value) throw new HttpError(404, "Student or course was not found");
  const selectedCourse = Array.isArray(value.courses)
    ? value.courses.find(course => String(course?.course_code || course?.courseCode || "") === courseCode)
    : null;
  if (!selectedCourse) throw new HttpError(404, "Student or course was not found");
  return json(request, env, {
    studentId,
    course: mapStudentSeriesCourse(selectedCourse),
    playlists: Array.isArray(selectedCourse.playlists)
      ? selectedCourse.playlists.map(mapOfficialPlaylistAccess).filter(playlist => playlist.id)
      : []
  }, 200);
}

async function adminChangeStudentWatermark(request, env, studentId) {
  if (!UUID_RE.test(studentId)) throw new HttpError(400, "Invalid student ID");
  const body = await readJson(request, 4096);
  const enabled = typeof body.enabled === "boolean" ? body.enabled : body.watermarkEnabled;
  if (typeof enabled !== "boolean") throw new HttpError(400, "Enabled must be true or false");
  const token = requireBearerToken(request);
  await assertAdminSession(env, token);
  const rows = await serviceRpc(env, "video_class_admin_set_watermark", {
    p_admin_token: token,
    p_student_id: studentId,
    p_enabled: enabled
  });
  const row = firstRow(rows);
  if (!row) throw new HttpError(404, "Issue a video key before changing watermark settings");
  return json(request, env, {
    studentId: row.student_id || studentId,
    watermarkEnabled: row.watermark_enabled === true,
    updatedAt: row.updated_at || null
  }, 200);
}

async function assertAdminSession(env, token) {
  const rows = await serviceRpc(env, "video_class_admin_me", {
    p_admin_token: token
  });
  const row = firstRow(rows);
  if (!row) throw new HttpError(401, "Administrator session is invalid or expired");
  return row;
}

async function assertStudentSession(env, token) {
  const rows = await serviceRpc(env, "video_class_student_me", {
    p_student_token: token
  });
  if (!firstRow(rows)) throw new HttpError(401, "Student session is invalid or expired");
}

async function listCourses(request, env) {
  const token = requireBearerToken(request);
  await assertStudentSession(env, token);
  const rows = await serviceRpc(env, "video_class_student_list_courses", {
    p_student_token: token
  });
  if (!Array.isArray(rows)) throw new HttpError(502, "Course catalogue could not be loaded");
  return json(request, env, { courses: rows.map(mapCourse) }, 200);
}

async function listLessons(request, env, url) {
  const token = requireBearerToken(request);
  await assertStudentSession(env, token);
  const limit = normalizeBoundedInteger(url.searchParams.get("limit") || 60, "Lesson page size", 1, 100);
  const cursorValue = String(url.searchParams.get("cursor") || "");
  const cursor = normalizeLessonCursor(cursorValue);
  if (cursorValue && !cursor) throw new HttpError(400, "Invalid lesson cursor");
  const courseCodeValue = String(url.searchParams.get("course") || "").trim().toLowerCase();
  const courseCode = courseCodeValue || null;
  if (courseCode && !COURSE_CODE_RE.test(courseCode)) throw new HttpError(400, "Invalid course code");
  const query = String(url.searchParams.get("q") || "").normalize("NFKC").trim();
  if (query.length > 100) throw new HttpError(400, "Lesson search is too long");
  const view = String(url.searchParams.get("view") || "library").trim().toLowerCase();
  if (!["library", "bookmarks", "notes", "playlist", "official"].includes(view)) throw new HttpError(400, "Invalid lesson view");
  const playlistValue = String(url.searchParams.get("playlist") || "");
  const playlistId = playlistValue ? (UUID_RE.test(playlistValue) ? playlistValue : null) : null;
  if (playlistValue && !playlistId) throw new HttpError(400, "Invalid playlist ID");
  if (["playlist", "official"].includes(view) && !playlistId) throw new HttpError(400, "Playlist ID is required");
  const [courseRows, libraryResult] = await Promise.all([
    serviceRpc(env, "video_class_student_list_courses", { p_student_token: token }),
    serviceRpc(env, "video_class_student_library_page", {
      p_student_token: token,
      p_limit: limit,
      p_after_cursor: cursor,
      p_course_code: courseCode,
      p_query: query,
      p_view: view,
      p_playlist_id: playlistId
    })
  ]);
  const library = Array.isArray(libraryResult) ? (firstRow(libraryResult) || {}) : (libraryResult || {});
  const lessonRows = Array.isArray(library.lessons) ? library.lessons : [];
  if (!Array.isArray(courseRows) || !library || typeof library !== "object") {
    throw new HttpError(502, "Lesson library could not be loaded");
  }
  const nextCursorValue = String(library.next_cursor || library.nextCursor || "");
  const nextCursor = normalizeLessonCursor(nextCursorValue);
  if (nextCursorValue && !nextCursor) throw new HttpError(502, "Lesson library cursor is invalid");
  const rawOfficialOrder = library.official_playlist_order && typeof library.official_playlist_order === "object"
    ? library.official_playlist_order
    : (library.officialPlaylistOrder && typeof library.officialPlaylistOrder === "object"
      ? library.officialPlaylistOrder
      : library);
  return json(request, env, {
    courses: courseRows.map(mapCourse),
    lessons: lessonRows.map(mapLesson),
    playlists: (Array.isArray(library.playlists) ? library.playlists : []).map(mapStudentPlaylist),
    officialPlaylists: (Array.isArray(library.officialPlaylists || library.official_playlists)
      ? (library.officialPlaylists || library.official_playlists)
      : []).map(mapOfficialPlaylist),
    officialPlaylistOrder: mapOfficialPlaylistOrder(rawOfficialOrder),
    cursor: nextCursor,
    truncated: library.truncated === true && Boolean(nextCursor),
    totalCount: nullablePositiveInteger(library.total_count) || 0,
    totalDurationSeconds: finiteNonNegative(library.total_duration_seconds, 0)
  }, 200);
}

async function studentAnalytics(request, env) {
  const token = requireBearerToken(request);
  await assertStudentSession(env, token);
  const result = await serviceRpc(env, "video_class_student_analytics", {
    p_student_token: token
  });
  const value = Array.isArray(result) ? firstRow(result) : result;
  if (!value || typeof value !== "object") {
    throw new HttpError(502, "Learning analytics could not be loaded");
  }
  return json(request, env, mapStudentAnalytics(value), 200);
}

async function createPlaylist(request, env) {
  const body = await readJson(request, 4096);
  const name = normalizePlaylistName(body.name ?? body.title);
  const token = requireBearerToken(request);
  await assertStudentSession(env, token);
  const result = await serviceRpc(env, "video_class_student_create_playlist", {
    p_student_token: token,
    p_name: name
  });
  const playlist = mapStudentPlaylist(firstRow(result));
  if (!playlist.id) throw new HttpError(409, "A playlist with this name already exists");
  return json(request, env, { playlist }, 201);
}

async function changePlaylist(request, env, playlistId, remove) {
  if (!UUID_RE.test(playlistId)) throw new HttpError(400, "Invalid playlist ID");
  const token = requireBearerToken(request);
  await assertStudentSession(env, token);
  if (remove) {
    const deleted = await serviceRpc(env, "video_class_student_delete_playlist", {
      p_student_token: token,
      p_playlist_id: playlistId
    });
    if (deleted !== true) throw new HttpError(404, "Playlist was not found");
    return new Response(null, { status: 204, headers: responseHeaders(request, env) });
  }
  const body = await readJson(request, 4096);
  const name = normalizePlaylistName(body.name ?? body.title);
  const result = await serviceRpc(env, "video_class_student_rename_playlist", {
    p_student_token: token,
    p_playlist_id: playlistId,
    p_name: name
  });
  const playlist = mapStudentPlaylist(firstRow(result));
  if (!playlist.id) throw new HttpError(404, "Playlist was not found");
  return json(request, env, { playlist }, 200);
}

async function changePlaylistLesson(request, env, playlistId, lessonId, included) {
  if (!UUID_RE.test(playlistId) || !UUID_RE.test(lessonId)) throw new HttpError(400, "Invalid playlist or lesson ID");
  const token = requireBearerToken(request);
  await assertStudentSession(env, token);
  const result = await serviceRpc(env, "video_class_student_set_playlist_lesson", {
    p_student_token: token,
    p_playlist_id: playlistId,
    p_lesson_id: lessonId,
    p_included: included
  });
  const playlist = mapStudentPlaylist(firstRow(result));
  if (!playlist.id) throw new HttpError(404, "Playlist or lesson was not found");
  return json(request, env, { playlist }, 200);
}

async function createLessonClip(request, env, lessonId) {
  if (!UUID_RE.test(lessonId)) throw new HttpError(400, "Invalid lesson ID");
  const body = await readJson(request, 4096);
  const positionSeconds = Number(body.positionSeconds ?? body.position_seconds);
  if (!Number.isFinite(positionSeconds) || positionSeconds < 0 || positionSeconds > 86400) {
    throw new HttpError(400, "Invalid clip position");
  }
  const title = body.title == null ? "" : String(body.title).normalize("NFKC").trim();
  if (title.length > MAX_CLIP_TITLE_LENGTH) throw new HttpError(400, "Clip title is too long");
  const token = requireBearerToken(request);
  await assertStudentSession(env, token);
  const result = await serviceRpc(env, "video_class_student_create_clip", {
    p_student_token: token,
    p_lesson_id: lessonId,
    p_position_seconds: Math.round(positionSeconds * 10) / 10,
    p_title: title
  });
  const clip = mapClip(firstRow(result));
  if (!clip.id) throw new HttpError(403, "This lesson is not available for this account");
  return json(request, env, { clip }, 201);
}

async function deleteLessonClip(request, env, clipId) {
  if (!UUID_RE.test(clipId)) throw new HttpError(400, "Invalid clip ID");
  const token = requireBearerToken(request);
  await assertStudentSession(env, token);
  const deleted = await serviceRpc(env, "video_class_student_delete_clip", {
    p_student_token: token,
    p_clip_id: clipId
  });
  if (deleted !== true) throw new HttpError(404, "Clip was not found");
  return new Response(null, { status: 204, headers: responseHeaders(request, env) });
}

async function saveLessonFeedback(request, env, lessonId) {
  if (!UUID_RE.test(lessonId)) throw new HttpError(400, "Invalid lesson ID");
  const body = await readJson(request, 4096);
  const picture = optionalRating(body.pictureQuality ?? body.picture_quality ?? body.videoQuality ?? body.video_quality);
  const explanation = optionalRating(body.explanationQuality ?? body.explanation_quality ?? body.explanation);
  const audio = optionalRating(body.audioQuality ?? body.audio_quality ?? body.soundQuality ?? body.sound_quality);
  if ([picture, explanation, audio].every(value => value == null)) {
    throw new HttpError(400, "Choose at least one rating");
  }
  const token = requireBearerToken(request);
  await assertStudentSession(env, token);
  const result = await serviceRpc(env, "video_class_student_save_feedback", {
    p_student_token: token,
    p_lesson_id: lessonId,
    p_picture_quality: picture,
    p_explanation_quality: explanation,
    p_audio_quality: audio
  });
  const feedback = mapLessonFeedback(firstRow(result));
  if (!feedback.lessonId) throw new HttpError(403, "This lesson is not available for this account");
  return json(request, env, { feedback }, 200);
}

async function serveLessonThumbnail(request, env, lessonId) {
  if (!UUID_RE.test(lessonId)) throw new HttpError(404, "Thumbnail not found");
  const token = requireBearerToken(request);
  await assertStudentSession(env, token);
  const rows = await serviceRpc(env, "video_class_authorize_thumbnail", {
    p_student_token: token,
    p_lesson_id: lessonId
  });
  const authorization = firstRow(rows);
  if (!authorization || !env.VIDEO_CLASSES) throw new HttpError(404, "Thumbnail not found");
  const objectKey = safeObjectKey(authorization.object_key);
  const contentType = safeImageContentType(authorization.content_type);
  if (!objectKey || !contentType) throw new HttpError(502, "Thumbnail metadata is invalid");
  let object;
  try {
    object = await env.VIDEO_CLASSES.get(objectKey);
  } catch {
    throw new HttpError(503, "Thumbnail is temporarily unavailable");
  }
  if (!object?.body) throw new HttpError(404, "Thumbnail not found");
  if (!Number.isSafeInteger(object.size) || object.size <= 0 || object.size > 10 * 1024 * 1024) {
    throw new HttpError(503, "Thumbnail is temporarily unavailable");
  }
  const expectedBytes = nullablePositiveInteger(authorization.byte_length);
  if (expectedBytes != null && expectedBytes !== object.size) {
    throw new HttpError(503, "Thumbnail is temporarily unavailable");
  }
  const headers = responseHeaders(request, env);
  headers.set("Content-Type", contentType);
  headers.set("Content-Length", String(object.size));
  headers.set("Content-Disposition", "inline");
  headers.set("Cross-Origin-Resource-Policy", "cross-origin");
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  if (object.httpEtag) headers.set("ETag", object.httpEtag);
  return new Response(object.body, { status: 200, headers });
}

async function serveLessonAttachment(request, env, lessonId, attachmentId) {
  if (!UUID_RE.test(lessonId) || !UUID_RE.test(attachmentId)) throw new HttpError(404, "Attachment not found");
  const token = requireBearerToken(request);
  await assertStudentSession(env, token);
  const rows = await serviceRpc(env, "video_class_authorize_attachment", {
    p_student_token: token,
    p_lesson_id: lessonId,
    p_attachment_id: attachmentId
  });
  const authorization = firstRow(rows);
  if (!authorization) throw new HttpError(404, "Attachment not found");
  const objectKey = safeObjectKey(authorization.object_key);
  if (!objectKey || String(authorization.content_type || "").toLowerCase() !== "application/pdf") {
    throw new HttpError(502, "Attachment metadata is invalid");
  }
  let object;
  try {
    object = await requireVideoBucket(env).get(objectKey);
  } catch {
    throw new HttpError(503, "Attachment is temporarily unavailable");
  }
  if (!object?.body || !Number.isSafeInteger(object.size) || object.size <= 0 || object.size > ADMIN_ATTACHMENT_MAX_BYTES) {
    throw new HttpError(404, "Attachment not found");
  }
  const expectedBytes = nullablePositiveInteger(authorization.byte_length);
  if (expectedBytes != null && expectedBytes !== object.size) throw new HttpError(503, "Attachment is temporarily unavailable");
  const fileName = safeDownloadFileName(String(authorization.display_name || "lesson-notes.pdf"), ".pdf");
  const headers = responseHeaders(request, env);
  headers.set("Content-Type", "application/pdf");
  headers.set("Content-Length", String(object.size));
  headers.set("Content-Disposition", contentDispositionAttachment(fileName));
  headers.set("Cache-Control", "private, no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  if (object.httpEtag) headers.set("ETag", object.httpEtag);
  return new Response(object.body, { status: 200, headers });
}

async function changeLessonBookmark(request, env, lessonId) {
  if (!UUID_RE.test(lessonId)) throw new HttpError(400, "Invalid lesson ID");
  const body = await readJson(request, 4096);
  const bookmarked = typeof body.bookmarked === "boolean" ? body.bookmarked : body.enabled;
  if (typeof bookmarked !== "boolean") throw new HttpError(400, "Bookmarked must be true or false");
  const token = requireBearerToken(request);
  await assertStudentSession(env, token);
  const rows = await serviceRpc(env, "video_class_student_toggle_bookmark", {
    p_student_token: token,
    p_lesson_id: lessonId,
    p_bookmarked: bookmarked
  });
  const row = firstRow(rows);
  if (!row) throw new HttpError(403, "This lesson is not available for this account");
  return json(request, env, {
    bookmark: {
      lessonId: row.lesson_id || lessonId,
      bookmarked: row.bookmarked === true,
      updatedAt: row.updated_at || null
    }
  }, 200);
}

async function saveLessonNote(request, env, lessonId, remove) {
  if (!UUID_RE.test(lessonId)) throw new HttpError(400, "Invalid lesson ID");
  let note = "";
  if (!remove) {
    const body = await readJson(request, 8192);
    if (typeof body.note !== "string") throw new HttpError(400, "Note must be text");
    note = body.note;
    if (note.length > 5000) throw new HttpError(400, "Note is too long");
  }
  const token = requireBearerToken(request);
  await assertStudentSession(env, token);
  const rows = await serviceRpc(env, "video_class_student_save_note", {
    p_student_token: token,
    p_lesson_id: lessonId,
    p_note: note
  });
  const row = firstRow(rows);
  if (!row) throw new HttpError(403, "This lesson is not available for this account");
  return json(request, env, {
    note: {
      lessonId: row.lesson_id || lessonId,
      text: row.note == null ? "" : String(row.note),
      updatedAt: row.updated_at || null
    }
  }, 200);
}

async function grantPlayback(request, env, requestUrl, options = {}) {
  requireSigningKey(env);
  const body = await readJson(request, 4096);
  const studentToken = requireBearerToken(request);
  await assertStudentSession(env, studentToken);
  let lessonSlug = String(body.lessonSlug || body.slug || "").trim();
  const lessonId = String(body.lessonId || "").trim();
  if (lessonId && !UUID_RE.test(lessonId)) throw new HttpError(400, "Invalid lesson");
  if (!lessonSlug && UUID_RE.test(lessonId)) {
    const lessons = await serviceRpc(env, "video_class_student_list_lessons", {
      p_student_token: studentToken
    });
    const selected = Array.isArray(lessons)
      ? lessons.find(lesson => String(lesson.lesson_id || "") === lessonId)
      : null;
    if (selected && isPrivateLesson(selected)) {
      throw new HttpError(403, "This video is private and cannot be played");
    }
    lessonSlug = String(selected?.slug || "");
  }
  if (!SLUG_RE.test(lessonSlug)) throw new HttpError(400, "Invalid lesson");
  const fingerprint = await requestFingerprint(request, env);
  const nowSeconds = Math.floor(Date.now() / 1000);

  const rows = await serviceRpc(env, "video_class_create_playback", {
    p_student_token: studentToken,
    p_lesson_slug: lessonSlug,
    p_user_agent_hash: fingerprint.userAgentHash,
    p_network_hash: fingerprint.networkHash
  });
  const row = firstRow(rows);
  if (!row) throw new HttpError(403, "This lesson is not available for this account");

  const databaseExpiryMs = Date.parse(String(row.expires_at || ""));
  if (!Number.isFinite(databaseExpiryMs)) throw new HttpError(502, "Playback expiry is invalid");
  const databaseExpiresSeconds = Math.floor(databaseExpiryMs / 1000);
  const expiresSeconds = Math.min(nowSeconds + PLAYBACK_TOKEN_TTL_SECONDS, databaseExpiresSeconds);
  if (expiresSeconds <= nowSeconds + 15) throw new HttpError(401, "Student session is about to expire");
  const expiresAt = new Date(expiresSeconds * 1000).toISOString();

  const playbackId = String(row.playback_id || "");
  const studentId = String(row.student_id || "");
  const returnedLessonId = String(row.lesson_id || "");
  const slug = String(row.slug || "");
  if (!UUID_RE.test(playbackId) || !UUID_RE.test(studentId) || !UUID_RE.test(returnedLessonId) || !SLUG_RE.test(slug)) {
    throw new HttpError(502, "Playback could not be prepared");
  }
  if (lessonId && returnedLessonId !== lessonId) {
    throw new HttpError(409, "The selected lesson changed; reload the lesson library");
  }
  if (slug !== lessonSlug) throw new HttpError(502, "Playback lesson identity is invalid");

  const token = await signPlaybackToken({
    v: 1,
    aud: "video",
    sub: studentId,
    pid: playbackId,
    lid: returnedLessonId,
    slug,
    uah: fingerprint.userAgentHash,
    neth: fingerprint.networkHash,
    iat: nowSeconds,
    exp: expiresSeconds
  }, env.VIDEO_CLASS_SIGNING_KEY);
  const renditionRows = await serviceRpc(env, "video_class_playback_list_renditions", {
    p_playback_id: playbackId
  });
  const sources = (Array.isArray(renditionRows) ? renditionRows : [])
    .map(row => mapPlaybackSource(row, requestUrl.origin, slug, token))
    .filter(source => source.qualityCode);
  if (!sources.length) throw new HttpError(503, "Video renditions are not configured");
  const defaultSource = sources.find(source => source.isDefault)
    || sources.find(source => source.qualityCode === "max")
    || sources[sources.length - 1];
  const videoUrl = defaultSource.url;
  const sessionCode = playbackId.replaceAll("-", "").slice(0, 8).toUpperCase();
  const watermarkEnabled = row.watermark_enabled !== false;

  return json(request, env, {
    refreshed: options.refreshed === true,
    playbackId,
    playbackSessionId: playbackId,
    playbackToken: token,
    lessonId: returnedLessonId,
    lessonSlug: slug,
    lessonTitle: String(row.title || ""),
    videoUrl,
    sources,
    defaultQuality: defaultSource.qualityCode,
    tokenExpiresAt: expiresAt,
    expiresAt,
    resumeAt: finiteNonNegative(row.resume_seconds, 0),
    resumeAtSeconds: finiteNonNegative(row.resume_seconds, 0),
    watermark: {
      enabled: watermarkEnabled,
      videoKey: watermarkEnabled ? String(row.video_key || "") : "",
      sessionCode: watermarkEnabled ? sessionCode : ""
    }
  }, 200);
}

async function recordHeartbeat(request, env) {
  const body = await readJson(request, 8192);
  const playbackId = String(body.playbackId || body.playbackSessionId || "").trim();
  const event = String(body.event || "progress").toLowerCase();
  const positionSeconds = Number(body.positionSeconds);
  const durationSeconds = body.durationSeconds == null ? null : Number(body.durationSeconds);
  if (!UUID_RE.test(playbackId) || !HEARTBEAT_EVENTS.has(event)) {
    throw new HttpError(400, "Invalid playback update");
  }
  if (!Number.isFinite(positionSeconds) || positionSeconds < 0 || positionSeconds > 24 * 60 * 60) {
    throw new HttpError(400, "Invalid playback position");
  }
  if (!Number.isFinite(durationSeconds) || durationSeconds < 0 || durationSeconds > 24 * 60 * 60) {
    throw new HttpError(400, "Invalid video duration");
  }

  // The player can close before metadata arrives. There is no trustworthy
  // duration to persist in that case, so acknowledge without corrupting progress.
  if (durationSeconds === 0) {
    return json(request, env, { saved: false }, 200);
  }

  const studentToken = requireBearerToken(request);
  const recorded = await serviceRpc(env, "video_class_record_progress", {
    p_student_token: studentToken,
    p_playback_id: playbackId,
    p_position_seconds: Math.round(positionSeconds * 10) / 10,
    p_duration_seconds: Math.round(durationSeconds * 10) / 10
  });
  if (recorded !== true) throw new HttpError(403, "Playback session is no longer active");
  return json(request, env, {
    progress: {
      positionSeconds,
      completed: durationSeconds >= 10 && positionSeconds / durationSeconds >= 0.92,
      event,
      updatedAt: new Date().toISOString()
    }
  }, 200);
}

async function streamVideo(request, env, slug, token, qualityCode, ctx) {
  if (!SLUG_RE.test(slug) || !QUALITY_CODE_RE.test(qualityCode) || !token || token.length > 2048) {
    throw new HttpError(404, "Video not found");
  }
  requireSigningKey(env);
  const claims = await verifyPlaybackToken(token, env.VIDEO_CLASS_SIGNING_KEY);
  if (!claims || claims.slug !== slug) {
    throw new HttpError(401, "Playback link is invalid or expired", { code: "PLAYBACK_TOKEN_INVALID" });
  }

  const fingerprint = await requestFingerprint(request, env);
  if (claims.uah !== fingerprint.userAgentHash || claims.neth !== fingerprint.networkHash) {
    throw new HttpError(401, "Playback link does not match this device or network", { code: "PLAYBACK_FINGERPRINT_CHANGED" });
  }

  const rows = await serviceRpc(env, "video_class_authorize_rendition", {
    p_playback_id: claims.pid,
    p_student_id: claims.sub,
    p_lesson_slug: claims.slug,
    p_quality_code: qualityCode,
    p_user_agent_hash: fingerprint.userAgentHash,
    p_network_hash: fingerprint.networkHash
  });
  const authorization = firstRow(rows);
  if (!authorization) throw new HttpError(403, "Playback access has been revoked", { code: "PLAYBACK_ACCESS_REVOKED" });
  if (String(authorization.lesson_id || "") !== claims.lid) {
    throw new HttpError(403, "Playback access has been revoked", { code: "PLAYBACK_ACCESS_REVOKED" });
  }
  if (!env.VIDEO_CLASSES) throw new HttpError(503, "Video storage is not configured");

  const objectKey = safeObjectKey(authorization.object_key);
  if (!objectKey) {
    throw new HttpError(502, "Video metadata is invalid");
  }

  let head;
  try {
    head = await env.VIDEO_CLASSES.head(objectKey);
  } catch (error) {
    console.error(`${SERVICE_NAME}: R2 head failed`);
    throw new HttpError(503, "Video is temporarily unavailable");
  }
  if (!head) throw new HttpError(503, "Video is temporarily unavailable");

  const expectedBytes = nullablePositiveInteger(authorization.byte_length);
  if (expectedBytes != null && expectedBytes !== head.size) {
    console.error(`${SERVICE_NAME}: R2/database size mismatch for lesson ${claims.lid}`);
    throw new HttpError(503, "Video is temporarily unavailable");
  }

  const rangeHeader = request.headers.get("Range");
  const range = rangeHeader ? parseByteRange(rangeHeader, head.size) : null;
  if (rangeHeader && !range) return rangeNotSatisfiable(request, env, head.size);

  const headers = videoHeaders(request, env, head, authorization, range);
  if (request.method === "HEAD") {
    return new Response(null, { status: range ? 206 : 200, headers });
  }

  let object;
  try {
    object = await env.VIDEO_CLASSES.get(objectKey, range ? {
      range: { offset: range.offset, length: range.length }
    } : undefined);
  } catch (error) {
    console.error(`${SERVICE_NAME}: R2 read failed`);
    throw new HttpError(503, "Video is temporarily unavailable");
  }
  if (!object?.body) throw new HttpError(503, "Video is temporarily unavailable");

  // Keep the event loop available for future completion/audit work without
  // buffering the R2 body inside the Worker.
  if (ctx?.waitUntil) ctx.waitUntil(Promise.resolve());
  return new Response(object.body, { status: range ? 206 : 200, headers });
}

function videoHeaders(request, env, head, authorization, range) {
  const headers = responseHeaders(request, env);
  const contentType = safeVideoContentType(authorization.content_type || head.httpMetadata?.contentType);
  headers.set("Content-Type", contentType);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Disposition", "inline");
  headers.set("Cross-Origin-Resource-Policy", "cross-origin");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  headers.set("Vary", "Origin, Range");
  if (head.httpEtag) headers.set("ETag", head.httpEtag);
  if (head.uploaded instanceof Date) headers.set("Last-Modified", head.uploaded.toUTCString());
  if (range) {
    headers.set("Content-Range", `bytes ${range.offset}-${range.end}/${head.size}`);
    headers.set("Content-Length", String(range.length));
  } else {
    headers.set("Content-Length", String(head.size));
  }
  return headers;
}

function rangeNotSatisfiable(request, env, size) {
  const headers = responseHeaders(request, env);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Range", `bytes */${size}`);
  headers.set("Content-Length", "0");
  headers.set("Cross-Origin-Resource-Policy", "cross-origin");
  return new Response(null, { status: 416, headers });
}

function parseByteRange(value, size) {
  if (!Number.isSafeInteger(size) || size < 0) return null;
  const match = /^bytes=(\d*)-(\d*)$/i.exec(String(value).trim());
  if (!match || (!match[1] && !match[2]) || size === 0) return null;

  if (!match[1]) {
    const suffixLength = Number(match[2]);
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) return null;
    const length = Math.min(suffixLength, size);
    return { offset: size - length, end: size - 1, length };
  }

  const offset = Number(match[1]);
  if (!Number.isSafeInteger(offset) || offset < 0 || offset >= size) return null;
  let end = match[2] ? Number(match[2]) : size - 1;
  if (!Number.isSafeInteger(end) || end < offset) return null;
  end = Math.min(end, size - 1);
  return { offset, end, length: end - offset + 1 };
}

function requireBearerToken(request) {
  const authorization = request.headers.get("Authorization") || "";
  const match = /^Bearer ([0-9a-f-]+)$/i.exec(authorization);
  const token = match?.[1] || "";
  if (!UUID_RE.test(token)) throw new HttpError(401, "Authentication required");
  return token;
}

async function requestFingerprint(request, env) {
  requireSigningKey(env);
  // Use the stable User-Agent header only. Client-hint headers can legitimately
  // differ between fetch() and <video> requests, which would lock out the same browser.
  const userAgent = String(request.headers.get("User-Agent") || "missing-user-agent").slice(0, 1024);
  const network = coarseNetwork(request.headers.get("CF-Connecting-IP") || "missing-client-ip");
  return {
    userAgentHash: await keyedFingerprint("ua", userAgent, env.VIDEO_CLASS_SIGNING_KEY),
    networkHash: await keyedFingerprint("network", network, env.VIDEO_CLASS_SIGNING_KEY)
  };
}

function coarseNetwork(ipValue) {
  const ip = String(ipValue || "").trim().toLowerCase();
  const ipv4 = ip.split(".");
  if (ipv4.length === 4 && ipv4.every(part => /^\d{1,3}$/.test(part) && Number(part) <= 255)) {
    return `${ipv4[0]}.${ipv4[1]}.${ipv4[2]}.0/24`;
  }
  const ipv6 = expandIpv6(ip);
  if (ipv6) return `${ipv6.slice(0, 3).join(":")}::/48`;
  return ip.slice(0, 128) || "missing-client-ip";
}

function expandIpv6(value) {
  if (!value || !value.includes(":") || value.includes(".")) return null;
  const halves = value.split("::");
  if (halves.length > 2) return null;
  const left = halves[0] ? halves[0].split(":") : [];
  const right = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  if ([...left, ...right].some(part => !/^[0-9a-f]{1,4}$/.test(part))) return null;
  const missing = 8 - left.length - right.length;
  if ((halves.length === 1 && missing !== 0) || (halves.length === 2 && missing < 1)) return null;
  return [...left, ...Array(Math.max(0, missing)).fill("0"), ...right]
    .map(part => part.padStart(4, "0"));
}

async function keyedFingerprint(kind, value, secret) {
  const key = await hmacKey(secret, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(`${kind}\0${value}`));
  return [...new Uint8Array(signature)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

async function signPlaybackToken(payload, secret) {
  const encodedPayload = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const signingInput = `v1.${encodedPayload}`;
  const key = await hmacKey(secret, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(signingInput));
  return `${signingInput}.${base64UrlEncode(new Uint8Array(signature))}`;
}

async function verifyPlaybackToken(value, secret) {
  const parts = String(value).split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return null;
  try {
    const signingInput = `${parts[0]}.${parts[1]}`;
    const key = await hmacKey(secret, ["verify"]);
    const valid = await crypto.subtle.verify("HMAC", key, base64UrlDecode(parts[2]), encoder.encode(signingInput));
    if (!valid) return null;
    const payload = JSON.parse(decoder.decode(base64UrlDecode(parts[1])));
    const now = Math.floor(Date.now() / 1000);
    if (payload?.v !== 1 || payload?.aud !== "video") return null;
    if (!UUID_RE.test(String(payload.sub || "")) || !UUID_RE.test(String(payload.pid || "")) || !UUID_RE.test(String(payload.lid || ""))) return null;
    if (!SLUG_RE.test(String(payload.slug || ""))) return null;
    if (typeof payload.uah !== "string" || typeof payload.neth !== "string") return null;
    if (!Number.isInteger(payload.iat) || !Number.isInteger(payload.exp)) return null;
    if (payload.iat > now + 60 || payload.exp <= now || payload.exp - payload.iat > PLAYBACK_TOKEN_TTL_SECONDS + 60) return null;
    return payload;
  } catch (error) {
    return null;
  }
}

async function signAdminPreviewToken(payload, secret) {
  const encodedPayload = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const signingInput = `ap1.${encodedPayload}`;
  const key = await hmacKey(secret, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(signingInput));
  return `${signingInput}.${base64UrlEncode(new Uint8Array(signature))}`;
}

async function verifyAdminPreviewToken(value, secret) {
  const parts = String(value || "").split(".");
  if (parts.length !== 3 || parts[0] !== "ap1") return null;
  try {
    const signingInput = `${parts[0]}.${parts[1]}`;
    const key = await hmacKey(secret, ["verify"]);
    const valid = await crypto.subtle.verify("HMAC", key, base64UrlDecode(parts[2]), encoder.encode(signingInput));
    if (!valid) return null;
    const payload = JSON.parse(decoder.decode(base64UrlDecode(parts[1])));
    const now = Math.floor(Date.now() / 1000);
    if (payload?.v !== 1 || payload?.aud !== "admin-video-preview") return null;
    if (!UUID_RE.test(String(payload.sub || "")) || !UUID_RE.test(String(payload.pid || ""))
      || !UUID_RE.test(String(payload.lid || "")) || typeof payload.uah !== "string") return null;
    if (!Number.isInteger(payload.iat) || !Number.isInteger(payload.exp)
      || payload.iat > now + 60 || payload.exp <= now
      || payload.exp - payload.iat > ADMIN_PREVIEW_TOKEN_TTL_SECONDS + 60) return null;
    return payload;
  } catch {
    return null;
  }
}

function hmacKey(secret, usages) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(String(secret)),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usages
  );
}

function base64UrlEncode(bytes) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) binary += String.fromCharCode(bytes[index]);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function base64UrlDecode(value) {
  if (!/^[A-Za-z0-9_-]+$/.test(String(value))) throw new Error("Invalid base64url");
  const normalized = String(value).replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

async function serviceRpc(env, name, parameters, authorizationToken = "") {
  const baseUrl = String(env.SUPABASE_URL || "").replace(/\/+$/, "");
  if (!baseUrl.startsWith("https://") || !env.SUPABASE_ANON_KEY || String(env.VIDEO_CLASS_SERVICE_SECRET || "").length < 48) {
    throw new HttpError(503, "Video class database is not configured");
  }
  const headers = {
    "apikey": env.SUPABASE_ANON_KEY,
    "Content-Type": "application/json"
  };
  if (authorizationToken) headers.Authorization = `Bearer ${authorizationToken}`;

  let response;
  try {
    response = await fetch(`${baseUrl}/rest/v1/rpc/${encodeURIComponent(name)}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ p_service_secret: env.VIDEO_CLASS_SERVICE_SECRET, ...parameters })
    });
  } catch (error) {
    console.error(`${SERVICE_NAME}: ${name} request failed`);
    throw new HttpError(502, "Video class database is temporarily unavailable");
  }
  if (!response.ok) {
    console.error(`${SERVICE_NAME}: ${name} returned ${response.status}`);
    throw new HttpError(502, "Video class database is temporarily unavailable");
  }
  if (response.status === 204) return null;
  try {
    return await response.json();
  } catch (error) {
    throw new HttpError(502, "Video class database returned an invalid response");
  }
}

async function enforceRateLimit(request, env, bindingName, namespace, retrySeconds) {
  const limiter = env[bindingName];
  if (!limiter?.limit) throw new HttpError(503, "Login protection is not configured");
  const ip = request.headers.get("CF-Connecting-IP") || "missing-client-ip";
  let result;
  try {
    result = await limiter.limit({ key: `${namespace}:${ip}` });
  } catch (error) {
    throw new HttpError(503, "Login protection is temporarily unavailable");
  }
  if (!result.success) {
    throw new HttpError(429, "Too many login attempts; please try again shortly", {
      code: "IP_RATE_LIMITED",
      retryAfter: retrySeconds
    });
  }
}

async function validateTurnstile(request, env, token, expectedAction) {
  const secret = String(env.VIDEO_CLASS_TURNSTILE_SECRET || "");
  if (secret.length < 20) {
    throw new HttpError(503, "Security verification is not configured", {
      code: "TURNSTILE_UNAVAILABLE",
      challengeRequired: true
    });
  }

  let expectedHostname;
  try {
    expectedHostname = new URL(String(env.ALLOWED_ORIGIN || DEFAULT_ALLOWED_ORIGIN)).hostname.toLowerCase();
  } catch {
    throw new HttpError(503, "Security verification is not configured", {
      code: "TURNSTILE_UNAVAILABLE",
      challengeRequired: true
    });
  }

  const body = new URLSearchParams({ secret, response: token });
  const remoteIp = String(request.headers.get("CF-Connecting-IP") || "").trim();
  if (remoteIp) body.set("remoteip", remoteIp);

  let response;
  try {
    response = await fetch(TURNSTILE_SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(TURNSTILE_TIMEOUT_MS)
    });
  } catch {
    throw new HttpError(503, "Security verification is temporarily unavailable", {
      code: "TURNSTILE_UNAVAILABLE",
      challengeRequired: true
    });
  }

  if (!response.ok) {
    throw new HttpError(503, "Security verification is temporarily unavailable", {
      code: "TURNSTILE_UNAVAILABLE",
      challengeRequired: true
    });
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new HttpError(503, "Security verification returned an invalid response", {
      code: "TURNSTILE_UNAVAILABLE",
      challengeRequired: true
    });
  }

  return result?.success === true
    && String(result.hostname || "").toLowerCase() === expectedHostname
    && String(result.action || "") === expectedAction;
}

async function readJson(request, maxBytes = MAX_JSON_BYTES) {
  const contentType = String(request.headers.get("Content-Type") || "").toLowerCase();
  if (!contentType.startsWith("application/json")) throw new HttpError(415, "Content-Type must be application/json");
  const declared = Number(request.headers.get("Content-Length") || 0);
  if (Number.isFinite(declared) && declared > maxBytes) throw new HttpError(413, "Request body is too large");
  if (!request.body) throw new HttpError(400, "Request body is required");

  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel("Request body is too large");
      throw new HttpError(413, "Request body is too large");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    const value = JSON.parse(decoder.decode(bytes));
    if (!value || Array.isArray(value) || typeof value !== "object") throw new Error("not an object");
    return value;
  } catch (error) {
    throw new HttpError(400, "Invalid JSON request");
  }
}

function corsHeaders(origin, env) {
  const headers = new Headers({
    "Access-Control-Allow-Headers": "Authorization, Content-Type, Range, X-Video-Upload-Token",
    "Access-Control-Allow-Methods": "GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Expose-Headers": "Accept-Ranges, Content-Disposition, Content-Length, Content-Range, ETag, Last-Modified, Retry-After",
    "Access-Control-Max-Age": "600",
    "Vary": "Origin"
  });
  if (isAllowedOrigin(origin, env)) headers.set("Access-Control-Allow-Origin", origin);
  return headers;
}

function responseHeaders(request, env) {
  const headers = corsHeaders(request.headers.get("Origin") || "", env);
  headers.set("Cache-Control", "private, no-store, max-age=0");
  headers.set("Pragma", "no-cache");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  return headers;
}

function json(request, env, value, status) {
  const headers = responseHeaders(request, env);
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(value), { status, headers });
}

function isAllowedOrigin(origin, env) {
  return Boolean(origin) && origin === String(env.ALLOWED_ORIGIN || DEFAULT_ALLOWED_ORIGIN);
}

function requireSigningKey(env) {
  if (!env.VIDEO_CLASS_SIGNING_KEY || String(env.VIDEO_CLASS_SIGNING_KEY).length < 32) {
    throw new HttpError(503, "Playback signing is not configured");
  }
}

function decodePathSegment(value) {
  try {
    return decodeURIComponent(value);
  } catch (error) {
    throw new HttpError(400, "Invalid URL path");
  }
}

function firstRow(value) {
  if (Array.isArray(value)) return value.length ? value[0] : null;
  if (value && typeof value === "object") return value;
  return null;
}

function mapStudent(row) {
  return {
    id: row.student_id || row.id || null,
    name: row.student_name || row.name || "",
    videoKey: row.video_key || null,
    accessEnabled: true,
    sessionExpiresAt: row.expires_at || null
  };
}

function mapAdmin(row) {
  return {
    id: row.admin_id || row.id || null,
    name: row.admin_name || row.name || "",
    sessionExpiresAt: row.expires_at || null
  };
}

function mapRosterStudent(row) {
  const createdAt = row.account_created_at || row.student_created_at || row.created_at || null;
  const courseCodes = Array.isArray(row.course_codes)
    ? row.course_codes.filter(code => COURSE_CODE_RE.test(String(code))).map(String)
    : [];
  return {
    id: row.student_id || row.id || null,
    name: row.student_name || row.name || "",
    videoKey: row.video_key || null,
    enabled: row.access_enabled === true || row.enabled === true,
    watermarkEnabled: row.watermark_enabled !== false,
    courseCodes,
    seriesAccess: normalizeStudentSeriesAccess(row.series_access ?? row.seriesAccess),
    keyCreatedAt: row.key_created_at || null,
    keyUpdatedAt: row.key_updated_at || row.updated_at || null,
    lastVideoLoginAt: row.last_video_login_at || null,
    createdAt,
    studentCreatedAt: createdAt
  };
}

function mapCourse(row) {
  return {
    code: row.course_code || row.code || "",
    title: row.course_title || row.title || "",
    sortOrder: Number.isFinite(Number(row.sort_order)) ? Number(row.sort_order) : 0,
    published: row.published !== false,
    lessonCount: Number.isFinite(Number(row.lesson_count)) ? Number(row.lesson_count) : 0
  };
}

function mapCourseAccess(row) {
  return {
    studentId: row.student_id || null,
    courseCode: row.course_code || "",
    enabled: row.enabled === true,
    updatedAt: row.updated_at || null
  };
}

function requireVideoBucket(env) {
  const bucket = env.VIDEO_CLASSES || env.VIDEO_BUCKET;
  if (!bucket?.list || !bucket?.head || !bucket?.get || !bucket?.delete
    || !bucket?.createMultipartUpload || !bucket?.resumeMultipartUpload) {
    throw new HttpError(503, "Private video storage is not configured");
  }
  return bucket;
}

async function deleteR2ObjectsInBatches(bucket, objectKeys) {
  for (let offset = 0; offset < objectKeys.length; offset += 1000) {
    await bucket.delete(objectKeys.slice(offset, offset + 1000));
  }
}

function normalizeR2ListPrefix(value) {
  const prefix = String(value || "");
  if (prefix.length > 512 || prefix.startsWith("/") || /[\u0000-\u001f\u007f]/.test(prefix)) {
    throw new HttpError(400, "Invalid private library prefix");
  }
  if (prefix.split("/").some(segment => segment === "." || segment === "..")) {
    throw new HttpError(400, "Invalid private library prefix");
  }
  return prefix;
}

function normalizeR2Cursor(value) {
  const cursor = String(value || "");
  if (cursor.length > 4096 || /[\u0000-\u001f\u007f]/.test(cursor)) {
    throw new HttpError(400, "Invalid private library cursor");
  }
  return cursor;
}

function normalizeR2ListLimit(value) {
  if (value == null || value === "") return 50;
  if (!/^\d{1,3}$/.test(String(value))) throw new HttpError(400, "Invalid private library page size");
  const limit = Number(value);
  if (!Number.isInteger(limit) || limit < 1 || limit > ADMIN_R2_LIST_MAX_ITEMS) {
    throw new HttpError(400, `Private library page size must be 1 to ${ADMIN_R2_LIST_MAX_ITEMS}`);
  }
  return limit;
}

function objectKeyExtension(value) {
  const key = String(value || "");
  const match = /(?:^|\/)[^/]*(\.[A-Za-z0-9]+)$/.exec(key);
  return match ? match[1].toLowerCase() : "";
}

function isVideoObjectKey(value) {
  return Object.prototype.hasOwnProperty.call(VIDEO_UPLOAD_TYPES, objectKeyExtension(value));
}

function isImageObjectKey(value) {
  return Object.prototype.hasOwnProperty.call(IMAGE_UPLOAD_TYPES, objectKeyExtension(value));
}

function normalizeR2HttpMetadata(value) {
  const metadata = value && typeof value === "object" ? value : {};
  const cacheExpiry = metadata.cacheExpiry instanceof Date
    ? metadata.cacheExpiry.toISOString()
    : (metadata.cacheExpiry && Number.isFinite(Date.parse(String(metadata.cacheExpiry)))
      ? new Date(String(metadata.cacheExpiry)).toISOString()
      : null);
  return {
    contentType: String(metadata.contentType || "").slice(0, 160) || null,
    contentLanguage: String(metadata.contentLanguage || "").slice(0, 160) || null,
    contentDisposition: String(metadata.contentDisposition || "").slice(0, 500) || null,
    contentEncoding: String(metadata.contentEncoding || "").slice(0, 160) || null,
    cacheControl: String(metadata.cacheControl || "").slice(0, 500) || null,
    cacheExpiry
  };
}

function normalizeR2CustomMetadata(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result = {};
  for (const [rawKey, rawValue] of Object.entries(value).slice(0, 64)) {
    const key = String(rawKey).slice(0, 128);
    if (!key || /[\u0000-\u001f\u007f]/.test(key)) continue;
    result[key] = String(rawValue ?? "").slice(0, 2048);
  }
  return result;
}

function mapAdminR2Object(object, match) {
  const key = String(object?.key || "");
  const httpMetadata = normalizeR2HttpMetadata(object?.httpMetadata);
  const customMetadata = normalizeR2CustomMetadata(object?.customMetadata);
  const uploadedValue = object?.uploaded instanceof Date ? object.uploaded : new Date(String(object?.uploaded || ""));
  const uploaded = Number.isNaN(uploadedValue.getTime()) ? null : uploadedValue.toISOString();
  const assigned = Boolean(match && typeof match === "object");
  const published = assigned && match.published === true;
  const lessonId = assigned && UUID_RE.test(String(match.lesson_id || "")) ? String(match.lesson_id) : null;
  const qualityCodes = Array.isArray(match?.rendition_quality_codes)
    ? match.rendition_quality_codes.filter(code => QUALITY_CODE_RE.test(String(code))).map(String)
    : [];
  return {
    key,
    size: Number.isSafeInteger(Number(object?.size)) && Number(object.size) >= 0 ? Number(object.size) : null,
    uploaded,
    etag: String(object?.etag || "").slice(0, 256) || null,
    httpEtag: String(object?.httpEtag || "").slice(0, 260) || null,
    contentType: httpMetadata.contentType || VIDEO_UPLOAD_TYPES[objectKeyExtension(key)] || null,
    httpMetadata,
    customMetadata,
    assigned,
    published,
    lessonId,
    lessonSlug: assigned ? String(match.lesson_slug || "").slice(0, 160) : "",
    lessonTitle: assigned ? String(match.lesson_title || "").slice(0, 160) : "",
    isPrivate: assigned && match.is_private === true,
    isSource: assigned && match.is_source === true,
    renditionQualityCodes: qualityCodes,
    isThumbnail: assigned && match.is_thumbnail === true
  };
}

function requireAdminId(row) {
  const adminId = String(row?.admin_id || row?.id || "");
  if (!UUID_RE.test(adminId)) throw new HttpError(502, "Administrator identity is invalid");
  return adminId;
}

function normalizeUploadFileName(value) {
  if (typeof value !== "string") throw new HttpError(400, "Video file name is required");
  const fileName = value.normalize("NFKC").trim();
  if (!fileName || fileName.length > 180 || /[\\/\u0000-\u001f\u007f]/.test(fileName)) {
    throw new HttpError(400, "Invalid video file name");
  }
  if (!isVideoObjectKey(fileName)) throw new HttpError(415, "Video must be MP4, MOV, M4V, or WebM");
  return fileName;
}

function normalizeAttachmentFileName(value) {
  if (typeof value !== "string") throw new HttpError(400, "PDF file name is required");
  const fileName = value.normalize("NFKC").trim();
  if (!fileName || fileName.length > 180 || /[\\/\u0000-\u001f\u007f]/.test(fileName)
    || objectKeyExtension(fileName) !== ".pdf") {
    throw new HttpError(415, "Attachment must be a PDF file");
  }
  return fileName;
}

function normalizeThumbnailFileName(value) {
  if (typeof value !== "string") throw new HttpError(400, "Thumbnail file name is required");
  const fileName = value.normalize("NFKC").trim();
  if (!fileName || fileName.length > 180 || /[\\/\u0000-\u001f\u007f]/.test(fileName) || !isImageObjectKey(fileName)) {
    throw new HttpError(415, "Thumbnail must be JPEG, PNG, GIF, WebP, or AVIF");
  }
  return fileName;
}

function normalizeUploadSize(value) {
  const size = Number(value);
  if (!Number.isSafeInteger(size) || size < 1 || size > ADMIN_UPLOAD_MAX_BYTES) {
    throw new HttpError(400, "Video size is invalid or exceeds 50 GiB");
  }
  return size;
}

function normalizeAttachmentUploadSize(value) {
  const size = Number(value);
  if (!Number.isSafeInteger(size) || size < 1 || size > ADMIN_ATTACHMENT_MAX_BYTES) {
    throw new HttpError(400, "PDF size is invalid or exceeds 1 GiB");
  }
  return size;
}

function normalizeThumbnailUploadSize(value) {
  const size = Number(value);
  if (!Number.isSafeInteger(size) || size < 1 || size > ADMIN_THUMBNAIL_MAX_BYTES) {
    throw new HttpError(400, "Thumbnail size is invalid or exceeds 10 MiB");
  }
  return size;
}

function optionalLessonDuration(value) {
  if (value == null || value === "") return null;
  const duration = Number(value);
  if (!Number.isInteger(duration) || duration < 1 || duration > 86400) {
    throw new HttpError(400, "Duration must be 1 to 86,400 seconds");
  }
  return duration;
}

function requiredLessonDuration(value) {
  const duration = optionalLessonDuration(value);
  if (duration == null) throw new HttpError(400, "Lesson duration is required");
  return duration;
}

function videoContentTypeForKey(key, declaredValue, strict) {
  const extension = objectKeyExtension(key);
  const expected = VIDEO_UPLOAD_TYPES[extension];
  if (!expected) throw new HttpError(415, "Video must be MP4, MOV, M4V, or WebM");
  const declared = String(declaredValue || "").split(";", 1)[0].trim().toLowerCase();
  if (!declared || declared === "application/octet-stream") return expected;
  const allowed = extension === ".m4v"
    ? new Set(["video/x-m4v", "video/mp4"])
    : (extension === ".mov" ? new Set(["video/quicktime", "video/mov"]) : new Set([expected]));
  if (!allowed.has(declared)) {
    if (!strict && /^video\/[a-z0-9][a-z0-9.+-]*$/.test(declared)) return declared;
    throw new HttpError(415, "Video content type does not match its file extension");
  }
  return declared;
}

function imageContentTypeForKey(key, declaredValue, strict) {
  const extension = objectKeyExtension(key);
  const expected = IMAGE_UPLOAD_TYPES[extension];
  if (!expected) throw new HttpError(415, "Thumbnail must be JPEG, PNG, GIF, WebP, or AVIF");
  const declared = String(declaredValue || "").split(";", 1)[0].trim().toLowerCase();
  if (!declared || declared === "application/octet-stream") return expected;
  if (declared !== expected) {
    if (!strict && /^image\/[a-z0-9][a-z0-9.+-]*$/.test(declared)) return declared;
    throw new HttpError(415, "Thumbnail content type does not match its file extension");
  }
  return declared;
}

function createAdminUploadKey(fileName) {
  const extension = objectKeyExtension(fileName);
  const stem = fileName.slice(0, -extension.length).normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 80) || "video";
  const randomBytes = crypto.getRandomValues(new Uint8Array(12));
  const random = [...randomBytes].map(byte => byte.toString(16).padStart(2, "0")).join("");
  return `${ADMIN_UPLOAD_PREFIX}${Date.now().toString(36)}-${random}-${stem}${extension}`;
}

function createAdminAttachmentUploadKey(lessonId, fileName) {
  const stem = fileName.slice(0, -4).normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 80) || "notes";
  const randomBytes = crypto.getRandomValues(new Uint8Array(12));
  const random = [...randomBytes].map(byte => byte.toString(16).padStart(2, "0")).join("");
  return `${ADMIN_ATTACHMENT_PREFIX}${lessonId}/${Date.now().toString(36)}-${random}-${stem}.pdf`;
}

function createAdminThumbnailUploadKey(lessonId, fileName) {
  const extension = objectKeyExtension(fileName);
  const stem = fileName.slice(0, -extension.length).normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 80) || "thumbnail";
  const randomBytes = crypto.getRandomValues(new Uint8Array(12));
  const random = [...randomBytes].map(byte => byte.toString(16).padStart(2, "0")).join("");
  return `${ADMIN_THUMBNAIL_PREFIX}${lessonId}/${Date.now().toString(36)}-${random}-${stem}${extension}`;
}

async function signAdminUploadToken(payload, secret) {
  const encodedPayload = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const signingInput = `u1.${encodedPayload}`;
  const key = await hmacKey(secret, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(signingInput));
  return `${signingInput}.${base64UrlEncode(new Uint8Array(signature))}`;
}

async function verifyAdminUploadToken(value, secret) {
  const parts = String(value || "").split(".");
  if (parts.length !== 3 || parts[0] !== "u1") return null;
  try {
    const signingInput = `${parts[0]}.${parts[1]}`;
    const key = await hmacKey(secret, ["verify"]);
    const valid = await crypto.subtle.verify("HMAC", key, base64UrlDecode(parts[2]), encoder.encode(signingInput));
    if (!valid) return null;
    const payload = JSON.parse(decoder.decode(base64UrlDecode(parts[1])));
    const now = Math.floor(Date.now() / 1000);
    if (payload?.v !== 1 || payload?.aud !== "admin-r2-upload" || !UUID_RE.test(String(payload.sub || ""))) return null;
    if (!ADMIN_UPLOAD_ID_RE.test(String(payload.uid || ""))) return null;
    const objectKey = normalizePrivateObjectKey(payload.key);
    const kind = ["attachment", "thumbnail"].includes(payload.kind) ? payload.kind : "video";
    const lessonId = kind === "video" ? "" : String(payload.lessonId || "");
    if (kind === "attachment") {
      if (!UUID_RE.test(lessonId) || !objectKey.startsWith(`${ADMIN_ATTACHMENT_PREFIX}${lessonId}/`)
        || objectKeyExtension(objectKey) !== ".pdf") return null;
    } else if (kind === "thumbnail") {
      if (!UUID_RE.test(lessonId) || !objectKey.startsWith(`${ADMIN_THUMBNAIL_PREFIX}${lessonId}/`)
        || !isImageObjectKey(objectKey)) return null;
    } else if (!objectKey.startsWith(ADMIN_UPLOAD_PREFIX) || !isVideoObjectKey(objectKey)) return null;
    const maximumBytes = kind === "attachment"
      ? ADMIN_ATTACHMENT_MAX_BYTES
      : (kind === "thumbnail" ? ADMIN_THUMBNAIL_MAX_BYTES : ADMIN_UPLOAD_MAX_BYTES);
    if (!Number.isSafeInteger(payload.size) || payload.size < 1 || payload.size > maximumBytes) return null;
    if (payload.partSize !== ADMIN_UPLOAD_PART_BYTES) return null;
    if (!Number.isInteger(payload.partCount) || payload.partCount !== Math.ceil(payload.size / payload.partSize)
      || payload.partCount < 1 || payload.partCount > ADMIN_UPLOAD_MAX_PARTS) return null;
    const contentType = kind === "attachment"
      ? (String(payload.contentType || "").toLowerCase() === "application/pdf" ? "application/pdf" : "")
      : (kind === "thumbnail"
        ? imageContentTypeForKey(objectKey, payload.contentType, true)
        : videoContentTypeForKey(objectKey, payload.contentType, true));
    if (!contentType) return null;
    if (!Number.isInteger(payload.iat) || !Number.isInteger(payload.exp)
      || payload.iat > now + 60 || payload.exp <= now
      || payload.exp - payload.iat > ADMIN_UPLOAD_TOKEN_TTL_SECONDS + 60) return null;
    return { ...payload, key: objectKey, contentType, kind, lessonId };
  } catch {
    return null;
  }
}

async function requireAdminUploadState(request, env, adminId, uploadId, bodyToken = "") {
  const headerToken = String(request.headers.get("X-Video-Upload-Token") || "").trim();
  const fallbackToken = String(bodyToken || "").trim();
  if (headerToken && fallbackToken && headerToken !== fallbackToken) {
    throw new HttpError(400, "Conflicting upload authorization");
  }
  const uploadToken = headerToken || fallbackToken;
  if (!uploadToken || uploadToken.length > ADMIN_UPLOAD_TOKEN_MAX_LENGTH) {
    throw new HttpError(401, "Upload authorization is required");
  }
  const state = await verifyAdminUploadToken(uploadToken, env.VIDEO_CLASS_SIGNING_KEY);
  if (!state || state.sub !== adminId || state.uid !== uploadId) {
    throw new HttpError(401, "Upload authorization is invalid or expired");
  }
  return state;
}

function isSafePartEtag(value) {
  const etag = String(value || "");
  return etag.length >= 1 && etag.length <= 256 && /^[\x21-\x7e]+$/.test(etag);
}

function normalizeCompletedUploadParts(value, expectedCount) {
  if (!Array.isArray(value) || value.length !== expectedCount || expectedCount > ADMIN_UPLOAD_MAX_PARTS) {
    throw new HttpError(400, `Exactly ${expectedCount} uploaded parts are required`);
  }
  const parts = value.map(item => {
    const partNumber = Number(item?.partNumber ?? item?.part_number);
    const etag = String(item?.etag || "");
    if (!Number.isInteger(partNumber) || partNumber < 1 || partNumber > expectedCount || !isSafePartEtag(etag)) {
      throw new HttpError(400, "Uploaded part metadata is invalid");
    }
    return { partNumber, etag };
  }).sort((left, right) => left.partNumber - right.partNumber);
  if (parts.some((part, index) => part.partNumber !== index + 1)) {
    throw new HttpError(400, "Uploaded parts must be unique and complete");
  }
  return parts;
}

function normalizePrivateObjectKey(value) {
  if (typeof value !== "string") throw new HttpError(400, "Private object key is required");
  const key = value.normalize("NFC");
  if (!key || key.length > 900 || key !== key.trim() || key.startsWith("/") || key.endsWith("/")
    || /[\u0000-\u001f\u007f]/.test(key)
    || key.split("/").some(segment => segment === "." || segment === "..")) {
    throw new HttpError(400, "Invalid private object key");
  }
  return key;
}

function normalizeBoundedText(value, label, minimum, maximum, trim) {
  if (typeof value !== "string") throw new HttpError(400, `${label} must be text`);
  const text = value.normalize("NFKC");
  const normalized = trim ? text.trim() : text;
  if (normalized.length < minimum || normalized.length > maximum) {
    throw new HttpError(400, `${label} must be ${minimum} to ${maximum} characters`);
  }
  return normalized;
}

function normalizeBoundedInteger(value, label, minimum, maximum) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < minimum || number > maximum) {
    throw new HttpError(400, `${label} is invalid`);
  }
  return number;
}

function normalizePublishTags(value) {
  if (value == null) return [];
  if (!Array.isArray(value) || value.length > 30) throw new HttpError(400, "Tags must contain at most 30 entries");
  return value.map(item => {
    if (typeof item === "string") return normalizeBoundedText(item, "Tag label", 1, 80, true);
    if (!item || typeof item !== "object" || Array.isArray(item)) throw new HttpError(400, "Each tag must be text or an object");
    const label = normalizeBoundedText(item.label, "Tag label", 1, 80, true);
    const slug = item.slug == null || String(item.slug).trim() === "" ? "" : normalizeLessonSlug(item.slug);
    if (slug.length > 80) throw new HttpError(400, "Tag slug is too long");
    return slug ? { slug, label } : { label };
  });
}

function normalizePublishRenditionRequests(value) {
  if (value == null) return [];
  if (!Array.isArray(value) || value.length > 3) throw new HttpError(400, "Up to three alternate renditions are allowed");
  const seenQualities = new Set();
  return value.map(item => {
    if (!item || typeof item !== "object" || Array.isArray(item)) throw new HttpError(400, "Each rendition must be an object");
    const objectKey = normalizePrivateObjectKey(item.objectKey ?? item.object_key);
    const qualityCode = String(item.qualityCode ?? item.quality_code ?? "").trim().toLowerCase();
    if (!["480p", "720p", "1080p"].includes(qualityCode) || seenQualities.has(qualityCode)) {
      throw new HttpError(400, "Rendition qualities must be unique 480p, 720p, or 1080p values");
    }
    seenQualities.add(qualityCode);
    const defaultHeight = Number.parseInt(qualityCode, 10);
    const heightPixels = normalizeBoundedInteger(item.heightPixels ?? item.height_pixels ?? defaultHeight, "Rendition height", 1, 16384);
    const displayLabel = normalizeBoundedText(
      item.displayLabel ?? item.display_label ?? qualityCode,
      "Rendition label",
      1,
      40,
      true
    );
    const sortOrder = normalizeBoundedInteger(item.sortOrder ?? item.sort_order ?? defaultHeight, "Rendition sort order", -1000000, 1000000);
    return { objectKey, qualityCode, heightPixels, displayLabel, sortOrder };
  });
}

function normalizePublishThumbnailRequest(value) {
  if (value == null || value === "") return null;
  const objectKey = typeof value === "string"
    ? normalizePrivateObjectKey(value)
    : normalizePrivateObjectKey(value?.objectKey ?? value?.object_key);
  return { objectKey };
}

async function headPrivateR2Object(bucket, key) {
  let object;
  try {
    object = await bucket.head(key);
  } catch {
    throw new HttpError(503, "Private object metadata is temporarily unavailable");
  }
  if (!object) throw new HttpError(404, "Selected private object was not found");
  const size = Number(object.size);
  if (!Number.isSafeInteger(size) || size < 1 || size > 10 * 1024 * 1024 * 1024 * 1024) {
    throw new HttpError(400, "Selected private object size is invalid");
  }
  return { object, size, customMetadata: normalizeR2CustomMetadata(object.customMetadata) };
}

async function headVideoObject(bucket, key) {
  const metadata = await headPrivateR2Object(bucket, key);
  return {
    ...metadata,
    contentType: videoContentTypeForKey(key, metadata.object.httpMetadata?.contentType, true)
  };
}

async function headImageObject(bucket, key) {
  const metadata = await headPrivateR2Object(bucket, key);
  const extension = objectKeyExtension(key);
  const expected = IMAGE_UPLOAD_TYPES[extension];
  if (!expected) throw new HttpError(415, "Thumbnail must be JPEG, PNG, GIF, WebP, or AVIF");
  const declared = String(metadata.object.httpMetadata?.contentType || "").split(";", 1)[0].trim().toLowerCase();
  if (declared && declared !== "application/octet-stream" && declared !== expected) {
    throw new HttpError(415, "Thumbnail content type does not match its file extension");
  }
  return { ...metadata, contentType: declared && declared !== "application/octet-stream" ? declared : expected };
}

async function detectPrivateVideoDurationSeconds(bucket, key, metadata) {
  const extension = objectKeyExtension(key);
  if (![".mp4", ".mov", ".m4v"].includes(extension)) return null;
  const size = Number(metadata?.size);
  if (!Number.isSafeInteger(size) || size < 24) return null;
  const firstLength = Math.min(size, VIDEO_DURATION_PROBE_BYTES);
  let firstBytes;
  try {
    const object = await bucket.get(key, { range: { offset: 0, length: firstLength } });
    if (!object?.body) return null;
    firstBytes = new Uint8Array(await new Response(object.body).arrayBuffer());
  } catch {
    return null;
  }
  const firstDuration = findIsoMediaDurationSeconds(firstBytes);
  if (firstDuration != null || firstLength === size) return firstDuration;
  const tailLength = Math.min(size - firstLength, VIDEO_DURATION_PROBE_BYTES);
  if (tailLength <= 0) return null;
  try {
    const object = await bucket.get(key, { range: { offset: size - tailLength, length: tailLength } });
    if (!object?.body) return null;
    const tailBytes = new Uint8Array(await new Response(object.body).arrayBuffer());
    return findIsoMediaDurationSeconds(tailBytes);
  } catch {
    return null;
  }
}

function findIsoMediaDurationSeconds(bytes) {
  if (!(bytes instanceof Uint8Array) || bytes.byteLength < 28) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let typeOffset = 4; typeOffset + 24 <= bytes.byteLength; typeOffset += 1) {
    if (bytes[typeOffset] !== 0x6d || bytes[typeOffset + 1] !== 0x76
      || bytes[typeOffset + 2] !== 0x68 || bytes[typeOffset + 3] !== 0x64) continue;
    const boxOffset = typeOffset - 4;
    const boxSize32 = view.getUint32(boxOffset);
    let contentOffset = typeOffset + 4;
    let boxSize = boxSize32;
    if (boxSize32 === 1) {
      if (typeOffset + 12 > bytes.byteLength) continue;
      const extended = view.getBigUint64(typeOffset + 4);
      if (extended > BigInt(Number.MAX_SAFE_INTEGER)) continue;
      boxSize = Number(extended);
      contentOffset = typeOffset + 12;
    }
    if (boxSize < contentOffset - boxOffset + 20 || boxOffset + boxSize > bytes.byteLength) continue;
    const version = view.getUint8(contentOffset);
    let timescale;
    let duration;
    if (version === 0) {
      if (contentOffset + 20 > bytes.byteLength) continue;
      timescale = view.getUint32(contentOffset + 12);
      duration = view.getUint32(contentOffset + 16);
      if (duration === 0xffffffff) continue;
    } else if (version === 1) {
      if (contentOffset + 32 > bytes.byteLength) continue;
      timescale = view.getUint32(contentOffset + 20);
      const durationBig = view.getBigUint64(contentOffset + 24);
      if (durationBig === 0xffffffffffffffffn || durationBig > BigInt(Number.MAX_SAFE_INTEGER)) continue;
      duration = Number(durationBig);
    } else {
      continue;
    }
    if (!Number.isSafeInteger(timescale) || timescale <= 0 || !Number.isSafeInteger(duration) || duration <= 0) continue;
    const seconds = Math.ceil(duration / timescale);
    if (seconds >= 1 && seconds <= 86400) return seconds;
  }
  return null;
}

function normalizeLessonSlug(value) {
  const slug = String(value || "").normalize("NFKC").trim().toLowerCase();
  if (!SLUG_RE.test(slug)) throw new HttpError(400, "Lesson slug is invalid");
  return slug;
}

function normalizeLessonCursor(value) {
  const cursor = String(value || "");
  if (!cursor) return null;
  const match = cursor.match(LESSON_CURSOR_RE);
  if (!match || !UUID_RE.test(match[1])) return null;
  const [sortText, createdText] = cursor.split("|", 2);
  const sortOrder = Number(sortText);
  const createdEpoch = Number(createdText);
  if (!Number.isSafeInteger(sortOrder)
    || sortOrder < -2147483648
    || sortOrder > 2147483647
    || !Number.isFinite(createdEpoch)
    || createdEpoch < 0
    || createdEpoch > 32503680000) {
    return null;
  }
  return cursor;
}

function normalizeFeedbackCursor(value) {
  const cursor = String(value || "");
  if (!cursor) return null;
  const match = cursor.match(FEEDBACK_CURSOR_RE);
  if (!match || !UUID_RE.test(match[2]) || !UUID_RE.test(match[3])) return null;
  const updatedEpoch = Number(match[1]);
  return Number.isFinite(updatedEpoch) && updatedEpoch >= 0 && updatedEpoch <= 32503680000
    ? cursor
    : null;
}

async function deriveLessonSlug(title, objectKey) {
  const base = String(title).normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 58) || "lesson";
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(objectKey));
  const suffix = [...new Uint8Array(digest)].slice(0, 8)
    .map(byte => byte.toString(16).padStart(2, "0")).join("");
  return `${base}-${suffix}`;
}

function mapAdminLesson(row) {
  const value = row && typeof row === "object" ? row : {};
  const courseCode = String(value.course_code || value.courseCode || "");
  const courseTitle = String(value.course_title || value.courseTitle || "");
  const courseLabel = String(value.course_label || value.courseLabel || "");
  const durationSeconds = nullablePositiveNumber(value.duration_seconds ?? value.durationSeconds ?? value.duration);
  const tags = Array.isArray(value.tags) ? value.tags.map(mapTag).filter(tag => tag.label) : [];
  const renditionRows = Array.isArray(value.renditions)
    ? value.renditions
    : (Array.isArray(value.rendition_metadata || value.renditionMetadata)
      ? (value.rendition_metadata || value.renditionMetadata)
      : []);
  const renditions = renditionRows.map(mapRenditionMetadata).filter(rendition => rendition.qualityCode);
  const isPrivate = isPrivateLesson(value);
  const totalViewCount = finiteNonNegative(value.total_view_count ?? value.totalViewCount ?? value.view_count ?? value.viewCount, 0);
  const courseCodes = Array.isArray(value.course_codes || value.courseCodes)
    ? [...new Set((value.course_codes || value.courseCodes).map(item => String(item)).filter(code => COURSE_CODE_RE.test(code)))]
    : (courseCode ? [courseCode] : []);
  const attachments = Array.isArray(value.attachments)
    ? value.attachments.map(mapAttachment).filter(attachment => attachment.id)
    : [];
  const officialPlaylistIds = Array.isArray(value.official_playlist_ids || value.officialPlaylistIds)
    ? (value.official_playlist_ids || value.officialPlaylistIds).map(String).filter(id => UUID_RE.test(id))
    : [];
  const thumbnail = value.thumbnail && typeof value.thumbnail === "object" ? value.thumbnail : {};
  const thumbnailContentType = safeImageContentType(
    thumbnail.content_type ?? thumbnail.contentType ?? value.thumbnail_content_type ?? value.thumbnailContentType
  ) || null;
  const thumbnailByteLength = nullablePositiveInteger(
    thumbnail.byte_length ?? thumbnail.byteLength ?? value.thumbnail_byte_length ?? value.thumbnailByteLength
  );
  return {
    id: UUID_RE.test(String(value.lesson_id || value.id || "")) ? String(value.lesson_id || value.id) : null,
    slug: String(value.slug || ""),
    title: String(value.title || ""),
    description: String(value.description || ""),
    courseCode,
    courseCodes,
    courseTitle,
    courseLabel,
    course: { code: courseCode, title: courseTitle, label: courseLabel },
    durationSeconds,
    duration: durationSeconds,
    private: isPrivate,
    isPrivate,
    published: value.published === true,
    sortOrder: Number.isFinite(Number(value.sort_order ?? value.sortOrder))
      ? Number(value.sort_order ?? value.sortOrder)
      : 0,
    hasThumbnail: value.has_thumbnail === true || value.hasThumbnail === true,
    thumbnail: thumbnailContentType ? {
      contentType: thumbnailContentType,
      byteLength: thumbnailByteLength,
      enabled: thumbnail.enabled !== false,
      updatedAt: thumbnail.updated_at || thumbnail.updatedAt || null
    } : null,
    thumbnailContentType,
    thumbnailByteLength,
    deletionPending: value.deletion_pending === true || value.deletionPending === true,
    tags,
    tagLabels: tags.map(tag => tag.label),
    renditions,
    totalViewCount,
    viewCount: totalViewCount,
    attachments,
    officialPlaylistIds,
    createdAt: value.created_at || value.createdAt || null,
    updatedAt: value.updated_at || value.updatedAt || null
  };
}

function mapEditedAdminLesson(row) {
  const value = row && typeof row === "object" ? row : {};
  const id = String(value.lesson_id || value.id || "");
  const courseCodes = Array.isArray(value.course_codes || value.courseCodes)
    ? (value.course_codes || value.courseCodes).map(String).filter(code => COURSE_CODE_RE.test(code))
    : [];
  const tags = Array.isArray(value.tags) ? value.tags.map(mapTag).filter(tag => tag.label) : [];
  const durationSeconds = nullablePositiveNumber(value.duration_seconds ?? value.durationSeconds);
  return {
    id: UUID_RE.test(id) ? id : null,
    slug: String(value.slug || ""),
    title: String(value.title || ""),
    description: String(value.description || ""),
    courseCode: String(value.course_code || value.courseCode || courseCodes[0] || ""),
    courseCodes,
    durationSeconds,
    duration: durationSeconds,
    tags,
    tagLabels: tags.map(tag => tag.label),
    updatedAt: value.updated_at || value.updatedAt || null
  };
}

function isPrivateLesson(row) {
  const value = row && typeof row === "object" ? row : {};
  return value.is_private === true || value.isPrivate === true || value.private === true;
}

function mapStudentAnalytics(row) {
  const value = row && typeof row === "object" ? row : {};
  const rawSummary = value.summary && typeof value.summary === "object" ? value.summary : {};
  const totalWatchedSeconds = finiteNonNegative(
    rawSummary.total_watched_seconds ?? rawSummary.totalWatchedSeconds ?? value.total_watched_seconds,
    0
  );
  const watchedVideoCount = finiteNonNegative(
    rawSummary.watched_video_count ?? rawSummary.total_lessons_watched ?? rawSummary.totalLessonsWatched ?? value.watched_video_count,
    0
  );
  const dailyRows = Array.isArray(value.daily_counts || value.dailyCounts || value.daily)
    ? (value.daily_counts || value.dailyCounts || value.daily)
    : [];
  const unfinishedRows = Array.isArray(value.unfinished) ? value.unfinished : [];
  const historyRows = Array.isArray(value.history) ? value.history : [];
  return {
    generatedAt: safeAnalyticsTimestamp(value.generated_at || value.generatedAt),
    timezone: String(value.timezone || "Asia/Hong_Kong").slice(0, 80),
    summary: {
      totalWatchedSeconds,
      totalLessonsWatched: watchedVideoCount,
      watchedVideoCount,
      completedVideoCount: finiteNonNegative(rawSummary.completed_video_count ?? rawSummary.completedVideoCount, 0),
      unfinishedVideoCount: finiteNonNegative(rawSummary.unfinished_video_count ?? rawSummary.unfinishedVideoCount, 0),
      totalViewCount: finiteNonNegative(rawSummary.total_view_count ?? rawSummary.totalViewCount, 0),
      totalWatchedMinutes: finiteNonNegative(rawSummary.total_watched_minutes ?? rawSummary.totalWatchedMinutes, totalWatchedSeconds / 60),
      firstActivityAt: safeAnalyticsTimestamp(rawSummary.first_activity_at ?? rawSummary.firstActivityAt),
      lastActivityAt: safeAnalyticsTimestamp(rawSummary.last_activity_at ?? rawSummary.lastActivityAt)
    },
    daily: dailyRows.slice(0, 1000).map(mapAnalyticsDailyRow).filter(item => item.date),
    unfinished: unfinishedRows.slice(0, 2000).map(item => mapAnalyticsLesson(item, false)).filter(item => item.id),
    history: historyRows.slice(0, 5000).map(item => mapAnalyticsLesson(item, null)).filter(item => item.id)
  };
}

function mapAnalyticsDailyRow(row) {
  const value = row && typeof row === "object" ? row : {};
  const date = String(value.date || value.activity_date || value.watch_date || "");
  return {
    date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "",
    videosWatched: finiteNonNegative(value.videos_watched ?? value.videosWatched ?? value.lesson_count, 0),
    viewCount: finiteNonNegative(value.view_count ?? value.viewCount, 0),
    watchedSeconds: finiteNonNegative(value.watched_seconds ?? value.watchedSeconds, 0),
    watchedMinutes: finiteNonNegative(value.watched_minutes ?? value.watchedMinutes, 0)
  };
}

function mapAnalyticsLesson(row, completedDefault) {
  const value = row && typeof row === "object" ? row : {};
  const id = String(value.lesson_id || value.lessonId || value.id || "");
  const completed = completedDefault == null
    ? value.completed === true || Boolean(value.completed_at || value.completedAt)
    : completedDefault;
  const progressPercent = Math.min(100, finiteNonNegative(value.progress_percent ?? value.progressPercent, completed ? 100 : 0));
  const lastWatchedAt = safeAnalyticsTimestamp(
    value.last_viewed_at ?? value.lastViewedAt ?? value.last_watched_at ?? value.lastWatchedAt ?? value.updated_at
  );
  return {
    id: UUID_RE.test(id) ? id : "",
    lessonId: UUID_RE.test(id) ? id : "",
    slug: SLUG_RE.test(String(value.slug || "")) ? String(value.slug) : "",
    title: String(value.title || "").slice(0, 160),
    courseCode: String(value.course_code || value.courseCode || "").slice(0, 64),
    courseTitle: String(value.course_title || value.courseTitle || "").slice(0, 160),
    courseLabel: String(value.course_label || value.courseLabel || "").slice(0, 120),
    durationSeconds: finiteNonNegative(value.duration_seconds ?? value.durationSeconds, 0),
    positionSeconds: finiteNonNegative(value.position_seconds ?? value.positionSeconds, 0),
    watchedSeconds: finiteNonNegative(value.watched_seconds ?? value.watchedSeconds, 0),
    watchedMinutes: finiteNonNegative(value.watched_minutes ?? value.watchedMinutes, 0),
    progressPercent,
    completed,
    completedAt: safeAnalyticsTimestamp(value.completed_at ?? value.completedAt),
    viewCount: finiteNonNegative(value.view_count ?? value.viewCount, 0),
    isPrivate: isPrivateLesson(value),
    firstWatchedAt: safeAnalyticsTimestamp(value.first_viewed_at ?? value.firstViewedAt),
    lastWatchedAt,
    updatedAt: safeAnalyticsTimestamp(value.updated_at ?? value.updatedAt)
  };
}

function safeAnalyticsTimestamp(value) {
  if (value == null || value === "") return null;
  const timestamp = Date.parse(String(value));
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

function mapLesson(row) {
  const courseCode = row.course_code || "";
  const courseTitle = row.course_title || "";
  const tags = Array.isArray(row.tags) ? row.tags.map(mapTag).filter(tag => tag.label) : [];
  const clips = Array.isArray(row.clips) ? row.clips.map(mapClip).filter(clip => clip.id) : [];
  const renditions = Array.isArray(row.renditions)
    ? row.renditions.map(mapRenditionMetadata).filter(rendition => rendition.qualityCode)
    : [];
  const playlistIds = Array.isArray(row.playlist_ids || row.playlistIds)
    ? (row.playlist_ids || row.playlistIds).filter(value => UUID_RE.test(String(value))).map(String)
    : [];
  const officialPlaylistNames = Array.isArray(row.official_playlist_names || row.officialPlaylistNames)
    ? (row.official_playlist_names || row.officialPlaylistNames).map(value => String(value).slice(0, 160))
    : [];
  const isPrivate = isPrivateLesson(row);
  const courseCodes = Array.isArray(row.course_codes || row.courseCodes)
    ? [...new Set((row.course_codes || row.courseCodes).map(String).filter(code => COURSE_CODE_RE.test(code)))]
    : (courseCode ? [courseCode] : []);
  const attachments = Array.isArray(row.attachments)
    ? row.attachments.map(mapAttachment).filter(attachment => attachment.id)
    : [];
  return {
    id: row.lesson_id || row.id || null,
    slug: row.slug || "",
    title: row.title || "",
    description: row.description || "",
    courseCode,
    courseCodes,
    courseTitle,
    courseSortOrder: Number.isFinite(Number(row.course_sort_order)) ? Number(row.course_sort_order) : 0,
    course: { code: courseCode, title: courseTitle },
    moduleTitle: row.course_label || row.module_title || "",
    position: Number.isFinite(Number(row.sort_order ?? row.position)) ? Number(row.sort_order ?? row.position) : 0,
    createdAt: safeAnalyticsTimestamp(row.created_at ?? row.createdAt),
    durationSeconds: nullablePositiveNumber(row.duration_seconds),
    private: isPrivate,
    isPrivate,
    thumbnailUrl: row.thumbnail_url || null,
    hasThumbnail: row.has_thumbnail === true || row.hasThumbnail === true,
    attachments,
    tags,
    tagLabels: tags.map(tag => tag.label),
    officialPlaylistNames,
    playlistIds,
    clips,
    renditions,
    viewCount: finiteNonNegative(row.view_count ?? row.viewCount, 0),
    feedback: mapLessonFeedback(row.feedback && typeof row.feedback === "object" ? row.feedback : row),
    bookmarked: row.bookmarked === true,
    note: row.note == null ? "" : String(row.note),
    noteUpdatedAt: row.note_updated_at || null,
    progress: {
      positionSeconds: finiteNonNegative(row.resume_seconds ?? row.progress_seconds, 0),
      completed: Boolean(row.completed_at) || row.completed === true,
      updatedAt: row.progress_updated_at || row.completed_at || null
    }
  };
}

function mapStudentPlaylist(row) {
  const value = row && typeof row === "object" ? row : {};
  const lessonIds = Array.isArray(value.lesson_ids || value.lessonIds)
    ? (value.lesson_ids || value.lessonIds).filter(id => UUID_RE.test(String(id))).map(String)
    : [];
  return {
    id: UUID_RE.test(String(value.id || value.playlist_id || "")) ? String(value.id || value.playlist_id) : "",
    name: String(value.name || value.title || "").slice(0, MAX_PLAYLIST_NAME_LENGTH),
    lessonIds,
    lessonCount: Number.isSafeInteger(Number(value.lesson_count ?? value.lessonCount))
      ? Math.max(0, Number(value.lesson_count ?? value.lessonCount))
      : lessonIds.length,
    createdAt: value.created_at || value.createdAt || null,
    updatedAt: value.updated_at || value.updatedAt || null
  };
}

function mapOfficialPlaylist(row) {
  const value = row && typeof row === "object" ? row : {};
  const lessonIds = Array.isArray(value.lesson_ids || value.lessonIds)
    ? (value.lesson_ids || value.lessonIds).filter(id => UUID_RE.test(String(id))).map(String)
    : [];
  const courseCodes = Array.isArray(value.course_codes || value.courseCodes)
    ? [...new Set((value.course_codes || value.courseCodes).map(String).filter(code => COURSE_CODE_RE.test(code)))]
    : [];
  const primaryCourse = String(value.course_code || value.courseCode || "");
  return {
    id: UUID_RE.test(String(value.id || value.playlist_id || "")) ? String(value.id || value.playlist_id) : "",
    name: String(value.name || value.title || "").slice(0, 160),
    description: String(value.description || "").slice(0, 1000),
    courseCode: primaryCourse || courseCodes[0] || "",
    courseCodes: courseCodes.length ? courseCodes : (primaryCourse ? [primaryCourse] : []),
    lessonIds,
    lessonCount: Number.isSafeInteger(Number(value.lesson_count ?? value.lessonCount))
      ? Math.max(0, Number(value.lesson_count ?? value.lessonCount))
      : lessonIds.length,
    sortOrder: Number.isFinite(Number(value.sort_order ?? value.sortOrder))
      ? Number(value.sort_order ?? value.sortOrder)
      : 0,
    published: value.published !== false,
    updatedAt: value.updated_at || value.updatedAt || null
  };
}

function mapOfficialPlaylistOrder(row) {
  const value = row && typeof row === "object" ? row : {};
  const mode = String(value.mode || value.order_mode || value.official_playlist_order_mode || value.officialPlaylistOrderMode || "manual");
  const rawIds = value.playlist_ids || value.playlistIds
    || value.ordered_ids || value.orderedIds
    || value.ordered_playlist_ids || value.orderedPlaylistIds
    || value.official_playlist_order_ids || value.officialPlaylistOrderIds
    || [];
  return {
    mode: ["manual", "random"].includes(mode) ? mode : "manual",
    playlistIds: Array.isArray(rawIds) ? rawIds.map(String).filter(id => UUID_RE.test(id)) : [],
    updatedAt: value.updated_at || value.updatedAt || value.order_updated_at || value.orderUpdatedAt || null
  };
}

function mapOfficialPlaylistAccess(row) {
  const value = row && typeof row === "object" ? row : {};
  const playlist = mapOfficialPlaylist(value);
  return {
    ...playlist,
    enabled: value.enabled === true || value.has_access === true || value.hasAccess === true,
    available: value.available !== false,
    inherited: value.inherited === true,
    accessMode: ["all", "none", "manual"].includes(String(value.access_mode || value.accessMode || ""))
      ? String(value.access_mode || value.accessMode)
      : "manual"
  };
}

function mapStudentSeriesCourse(row) {
  const value = row && typeof row === "object" ? row : {};
  const courseCode = String(value.course_code || value.courseCode || "");
  const mode = String(value.mode || value.access_mode || value.accessMode || "manual");
  const playlistIds = Array.isArray(value.playlist_ids || value.playlistIds)
    ? (value.playlist_ids || value.playlistIds).map(String).filter(id => UUID_RE.test(id))
    : [];
  const playlists = Array.isArray(value.playlists)
    ? value.playlists.map(mapOfficialPlaylistAccess).filter(playlist => playlist.id)
    : [];
  return {
    courseCode: COURSE_CODE_RE.test(courseCode) ? courseCode : "",
    courseTitle: String(value.course_title || value.courseTitle || "").slice(0, 160),
    courseEnabled: value.course_enabled !== false && value.courseEnabled !== false,
    mode: ["all", "none", "manual"].includes(mode) ? mode : "manual",
    playlistIds: playlistIds.length ? playlistIds : playlists.filter(playlist => playlist.enabled).map(playlist => playlist.id),
    playlists,
    availableCount: finiteNonNegative(value.available_count ?? value.availableCount, playlists.length),
    enabledCount: finiteNonNegative(value.enabled_count ?? value.enabledCount, playlists.filter(playlist => playlist.enabled).length),
    updatedAt: value.updated_at || value.updatedAt || null
  };
}

function flattenStudentSeriesPlaylists(courses) {
  if (!Array.isArray(courses)) return [];
  const byId = new Map();
  for (const course of courses) {
    for (const playlist of Array.isArray(course?.playlists) ? course.playlists : []) {
      const mapped = mapOfficialPlaylistAccess(playlist);
      if (!mapped.id) continue;
      const existing = byId.get(mapped.id);
      byId.set(mapped.id, existing ? { ...existing, enabled: existing.enabled || mapped.enabled } : mapped);
    }
  }
  return [...byId.values()];
}

function normalizeStudentSeriesAccess(value) {
  if (!value || typeof value !== "object") return { courses: [], playlists: [] };
  const courses = Array.isArray(value.courses)
    ? value.courses.map(mapStudentSeriesCourse).filter(course => course.courseCode)
    : [];
  const playlists = Array.isArray(value.playlists)
    ? value.playlists.map(mapOfficialPlaylistAccess).filter(playlist => playlist.id)
    : flattenStudentSeriesPlaylists(value.courses);
  return { courses, playlists };
}

function mapTag(row) {
  if (typeof row === "string") return { slug: "", label: row.slice(0, 80) };
  const value = row && typeof row === "object" ? row : {};
  return {
    slug: SLUG_RE.test(String(value.slug || "")) ? String(value.slug) : "",
    label: String(value.label || value.name || "").slice(0, 80)
  };
}

function mapClip(row) {
  const value = row && typeof row === "object" ? row : {};
  const id = String(value.id || value.clip_id || "");
  return {
    id: UUID_RE.test(id) ? id : "",
    lessonId: String(value.lesson_id || value.lessonId || ""),
    title: String(value.display_title || value.displayTitle || value.title || "").slice(0, 180),
    positionSeconds: finiteNonNegative(value.position_seconds ?? value.positionSeconds, 0),
    clipNumber: finiteNonNegative(value.clip_number ?? value.clipNumber, 0),
    createdAt: value.created_at || value.createdAt || null
  };
}

function mapRenditionMetadata(row) {
  const value = row && typeof row === "object" ? row : {};
  const qualityCode = String(value.quality_code || value.qualityCode || "");
  return {
    qualityCode: QUALITY_CODE_RE.test(qualityCode) ? qualityCode : "",
    label: String(value.display_label || value.label || qualityCode).slice(0, 40),
    height: nullablePositiveInteger(value.height_pixels ?? value.height),
    byteLength: nullablePositiveInteger(value.byte_length ?? value.byteLength),
    isDefault: value.is_default === true || value.isDefault === true,
    enabled: value.enabled !== false
  };
}

function mapLessonFeedback(row) {
  const value = row && typeof row === "object" ? row : {};
  return {
    lessonId: String(value.lesson_id || value.lessonId || ""),
    pictureQuality: nullableRating(value.picture_quality ?? value.pictureQuality),
    explanationQuality: nullableRating(value.explanation_quality ?? value.explanationQuality),
    audioQuality: nullableRating(value.audio_quality ?? value.audioQuality),
    updatedAt: value.feedback_updated_at || value.updated_at || value.updatedAt || null
  };
}

function mapFeedbackRecord(row) {
  const value = row && typeof row === "object" ? row : {};
  const studentId = String(value.student_id || value.studentId || value.student_uuid || value.studentUuid || "");
  const studentUuid = String(value.student_uuid || value.studentUuid || value.student_id || value.studentId || "");
  return {
    studentId,
    studentUuid,
    videoKey: value.video_key || value.videoKey || null,
    studentName: String(value.student_name || value.studentName || ""),
    lessonId: String(value.lesson_id || value.lessonId || ""),
    lessonTitle: String(value.lesson_title || value.lessonTitle || ""),
    courseCode: String(value.course_code || value.courseCode || ""),
    ...mapLessonFeedback(value)
  };
}

function mapPlaybackSource(row, origin, slug, token) {
  const metadata = mapRenditionMetadata(row);
  if (!metadata.qualityCode) return { qualityCode: "" };
  return {
    ...metadata,
    url: `${origin}/v1/video/${encodeURIComponent(slug)}?token=${encodeURIComponent(token)}&quality=${encodeURIComponent(metadata.qualityCode)}`
  };
}

function finiteNonNegative(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function nullablePositiveNumber(value) {
  if (value == null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function nullablePositiveInteger(value) {
  if (value == null || value === "") return null;
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

function normalizePlaylistName(value) {
  const name = String(value || "").normalize("NFKC").trim().replace(/\s+/g, " ");
  if (!name || name.length > MAX_PLAYLIST_NAME_LENGTH) throw new HttpError(400, "Playlist name must be 1 to 80 characters");
  return name;
}

function optionalRating(value) {
  if (value == null || value === "") return null;
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1 || number > 5) throw new HttpError(400, "Ratings must be whole numbers from 1 to 5");
  return number;
}

function nullableRating(value) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 && number <= 5 ? number : null;
}

function safeObjectKey(value) {
  const key = String(value || "");
  return key && key.length <= 1024 && !key.includes("\0") ? key : "";
}

function safeImageContentType(value) {
  const contentType = String(value || "").toLowerCase();
  return ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"].includes(contentType) ? contentType : "";
}

function safeVideoContentType(value) {
  const contentType = String(value || "video/mp4").toLowerCase();
  return /^video\/[a-z0-9][a-z0-9.+-]*$/.test(contentType) ? contentType : "video/mp4";
}

function normalizeCourseCodes(value) {
  if (!Array.isArray(value)) throw new HttpError(400, "Course selection must be a list");
  const codes = [...new Set(value.map(item => String(item || "").trim().toLowerCase()))];
  if (!codes.length || codes.length > 20 || codes.some(code => !COURSE_CODE_RE.test(code))) {
    throw new HttpError(400, "Choose 1 to 20 valid courses");
  }
  return codes;
}

function normalizeUuidList(value, maximum, label) {
  if (!Array.isArray(value)) throw new HttpError(400, `${label} selection must be a list`);
  const ids = [...new Set(value.map(item => String(item || "")))];
  if (ids.length > maximum || ids.some(id => !UUID_RE.test(id))) {
    throw new HttpError(400, `Invalid ${label} selection`);
  }
  return ids;
}

function nullableAdminRating(value) {
  if (value == null || value === "") return null;
  const rating = Number(value);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new HttpError(400, "Ratings must be blank or 1 to 5");
  return rating;
}

async function headPdfObject(bucket, key) {
  const metadata = await headPrivateR2Object(bucket, key);
  const declaredType = String(metadata.object?.httpMetadata?.contentType || "").split(";", 1)[0].trim().toLowerCase();
  if (objectKeyExtension(key) !== ".pdf" || !["application/pdf", "application/octet-stream", ""].includes(declaredType)) {
    throw new HttpError(415, "Attachment must be a PDF file");
  }
  if (metadata.size > ADMIN_ATTACHMENT_MAX_BYTES) throw new HttpError(413, "PDF exceeds 1 GiB");
  let signatureObject;
  try { signatureObject = await bucket.get(key, { range: { offset: 0, length: 5 } }); }
  catch { throw new HttpError(503, "PDF validation is temporarily unavailable"); }
  if (!signatureObject?.body) throw new HttpError(404, "PDF was not found");
  let signature;
  try { signature = new Uint8Array(await new Response(signatureObject.body).arrayBuffer()); }
  catch { throw new HttpError(503, "PDF validation is temporarily unavailable"); }
  if (signature.length !== 5 || decoder.decode(signature) !== "%PDF-") {
    try { await bucket.delete(key); } catch { /* Invalid private upload can be cleaned up later. */ }
    throw new HttpError(415, "Selected file is not a valid PDF");
  }
  return { ...metadata, contentType: "application/pdf" };
}

function mapAttachment(row) {
  const value = row && typeof row === "object" ? row : {};
  const id = String(value.id || value.attachment_id || "");
  return {
    id: UUID_RE.test(id) ? id : "",
    lessonId: UUID_RE.test(String(value.lesson_id || value.lessonId || "")) ? String(value.lesson_id || value.lessonId) : "",
    displayName: String(value.display_name || value.displayName || "").slice(0, 180),
    contentType: "application/pdf",
    byteLength: finiteNonNegative(value.byte_length ?? value.byteLength, 0),
    isPrivate: value.is_private === true || value.isPrivate === true,
    sortOrder: Number(value.sort_order ?? value.sortOrder ?? 0) || 0,
    createdAt: value.created_at || value.createdAt || null,
    updatedAt: value.updated_at || value.updatedAt || null
  };
}

function safeDownloadFileName(value, requiredExtension = "") {
  let name = String(value || "download").normalize("NFKC")
    .replace(/[\\/\u0000-\u001f\u007f]/g, "-")
    .replace(/\s+/g, " ").trim().slice(0, 160) || "download";
  if (requiredExtension && !name.toLowerCase().endsWith(requiredExtension)) name += requiredExtension;
  return name;
}

function contentDispositionAttachment(fileName) {
  const safe = safeDownloadFileName(fileName).replace(/["\\]/g, "-");
  return `attachment; filename="${safe.replace(/[^\x20-\x7e]/g, "_")}"; filename*=UTF-8''${encodeURIComponent(safe)}`;
}

export const __test = Object.freeze({
  coarseNetwork,
  deleteR2ObjectsInBatches,
  expandIpv6,
  findIsoMediaDurationSeconds,
  mapOfficialPlaylistOrder,
  parseByteRange,
  safeVideoContentType,
  safeImageContentType
});
