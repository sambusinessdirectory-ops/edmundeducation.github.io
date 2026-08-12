import assert from "node:assert/strict";
import worker from "../workers/schedule-system/src/index.js";

const origin = "https://edmundeducation.com";
const baseEnv = {
  ALLOWED_ORIGIN: origin,
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_ANON_KEY: "publishable-test-key",
  SCHEDULE_SERVICE_SECRET: "a".repeat(64),
  ADMIN_LOGIN_RATE_LIMITER: { limit: async () => ({ success: true }) }
};

const health = await worker.fetch(new Request("https://worker.example/v1/health"), baseEnv);
assert.equal(health.status, 200);
assert.deepEqual(await health.json(), { ok: true, service: "edmund-schedule-system" });

const forbidden = await worker.fetch(new Request("https://worker.example/v1/admin/login", {
  method: "POST",
  headers: { "Content-Type": "application/json", "Origin": "https://attacker.example" },
  body: JSON.stringify({ name: "Admin", password: "guess" })
}), baseEnv);
assert.equal(forbidden.status, 403);

const throttledEnv = {
  ...baseEnv,
  ADMIN_LOGIN_RATE_LIMITER: { limit: async () => ({ success: false }) }
};
const throttled = await worker.fetch(new Request("https://worker.example/v1/admin/login", {
  method: "POST",
  headers: { "Content-Type": "application/json", "Origin": origin },
  body: JSON.stringify({ name: "Admin", password: "guess" })
}), throttledEnv);
assert.equal(throttled.status, 429);

const oversized = await worker.fetch(new Request("https://worker.example/v1/admin/login", {
  method: "POST",
  headers: { "Content-Type": "application/json", "Origin": origin },
  body: JSON.stringify({ name: "Admin", password: "x".repeat(5000) })
}), baseEnv);
assert.equal(oversized.status, 413);

const realFetch = globalThis.fetch;
let forwardedBody = null;
globalThis.fetch = async (url, options) => {
  assert.equal(url, "https://example.supabase.co/rest/v1/rpc/schedule_admin_login");
  assert.equal(options.method, "POST");
  assert.equal(options.headers.apikey, baseEnv.SUPABASE_ANON_KEY);
  forwardedBody = JSON.parse(options.body);
  return new Response(JSON.stringify([{
    admin_token: "11111111-1111-4111-8111-111111111111",
    name: "Schedule Admin",
    expires_at: "2026-07-14T20:00:00Z"
  }]), { status: 200, headers: { "Content-Type": "application/json" } });
};

try {
  const success = await worker.fetch(new Request("https://worker.example/v1/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": origin },
    body: JSON.stringify({ name: "Schedule Admin", password: "private-test-password" })
  }), baseEnv);
  assert.equal(success.status, 200);
  const successBody = await success.json();
  assert.equal(successBody.admin.name, "Schedule Admin");
  assert.equal(forwardedBody.p_service_secret, baseEnv.SCHEDULE_SERVICE_SECRET);
  assert.equal(forwardedBody.p_name, "Schedule Admin");
  assert.equal(forwardedBody.p_password, "private-test-password");
} finally {
  globalThis.fetch = realFetch;
}

let forwardedParentBody = null;
globalThis.fetch = async (url, options) => {
  assert.equal(url, "https://example.supabase.co/rest/v1/rpc/parent_communication_login");
  assert.equal(options.method, "POST");
  assert.equal(options.headers.apikey, baseEnv.SUPABASE_ANON_KEY);
  forwardedParentBody = JSON.parse(options.body);
  return new Response(JSON.stringify([{
    parent_id: "22222222-2222-4222-8222-222222222222",
    parent_token: "33333333-3333-4333-8333-333333333333",
    name: "Parent One",
    tag_colour: "#7c3aed",
    expires_at: "2026-08-14T20:00:00Z"
  }]), { status: 200, headers: { "Content-Type": "application/json" } });
};

try {
  const parentSuccess = await worker.fetch(new Request("https://worker.example/v1/parent/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": origin },
    body: JSON.stringify({ name: "Parent One", password: "private-parent-password" })
  }), baseEnv);
  assert.equal(parentSuccess.status, 200);
  const parentBody = await parentSuccess.json();
  assert.equal(parentBody.parent.name, "Parent One");
  assert.equal(parentBody.parent.parent_token, "33333333-3333-4333-8333-333333333333");
  assert.equal(forwardedParentBody.p_service_secret, baseEnv.SCHEDULE_SERVICE_SECRET);
  assert.equal(forwardedParentBody.p_name, "Parent One");
  assert.equal(forwardedParentBody.p_password, "private-parent-password");
} finally {
  globalThis.fetch = realFetch;
}

const preflight = await worker.fetch(new Request("https://worker.example/v1/admin/login", {
  method: "OPTIONS",
  headers: { "Origin": origin }
}), baseEnv);
assert.equal(preflight.status, 204);
assert.equal(preflight.headers.get("access-control-allow-origin"), origin);
assert.equal(preflight.headers.get("access-control-allow-methods"), "GET, POST, PATCH, DELETE, OPTIONS");

let announcementCreateCalled = false;
globalThis.fetch = async (url, options) => {
  const rpcName = decodeURIComponent(new URL(String(url)).pathname.split("/").at(-1));
  const body = JSON.parse(options.body);
  if (rpcName === "schedule_announcement_admin_auth") {
    assert.equal(body.p_admin_token, "11111111-1111-4111-8111-111111111111");
    return new Response(JSON.stringify([{ admin_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" }]), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (rpcName === "schedule_announcement_admin_create") announcementCreateCalled = true;
  throw new Error(`Unexpected RPC ${rpcName}`);
};
try {
  const form = new FormData();
  form.set("message", "Test announcement");
  form.set("isActive", "true");
  form.set("image", new File([new TextEncoder().encode("not a png")], "spoof.png", { type: "image/png" }));
  const spoofedImage = await worker.fetch(new Request("https://worker.example/v1/admin/announcements", {
    method: "POST",
    headers: { Origin: origin, Authorization: "Bearer 11111111-1111-4111-8111-111111111111" },
    body: form
  }), baseEnv);
  assert.equal(spoofedImage.status, 400);
  assert.equal((await spoofedImage.json()).error, "Announcement image is invalid");
  assert.equal(announcementCreateCalled, false, "spoofed image bytes must be rejected before storage");
} finally {
  globalThis.fetch = realFetch;
}

let createdAnnouncementBody = null;
globalThis.fetch = async (url, options) => {
  const rpcName = decodeURIComponent(new URL(String(url)).pathname.split("/").at(-1));
  const body = JSON.parse(options.body);
  if (rpcName === "schedule_announcement_admin_auth") {
    return new Response(JSON.stringify([{ admin_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" }]), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (rpcName === "schedule_announcement_admin_create") {
    createdAnnouncementBody = body;
    return new Response(JSON.stringify([{
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      message: body.p_message,
      has_image: true,
      is_active: true,
      updated_at: "2026-08-12T06:00:00.000Z",
      version: 1
    }]), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  throw new Error(`Unexpected RPC ${rpcName}`);
};
try {
  const pngBytes = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
  const form = new FormData();
  form.set("message", "Valid image announcement");
  form.set("isActive", "true");
  form.set("image", new File([pngBytes], "valid.png", { type: "image/png" }));
  const created = await worker.fetch(new Request("https://worker.example/v1/admin/announcements", {
    method: "POST",
    headers: { Origin: origin, Authorization: "Bearer 11111111-1111-4111-8111-111111111111" },
    body: form
  }), baseEnv);
  assert.equal(created.status, 201);
  assert.equal(createdAnnouncementBody.p_image_content_type, "image/png");
  assert.equal(createdAnnouncementBody.p_image_content, "iVBORw0KGgoA");
} finally {
  globalThis.fetch = realFetch;
}

const announcementUpdateBodies = [];
globalThis.fetch = async (url, options) => {
  const rpcName = decodeURIComponent(new URL(String(url)).pathname.split("/").at(-1));
  const body = JSON.parse(options.body);
  if (rpcName === "schedule_announcement_admin_auth") {
    return new Response(JSON.stringify([{ admin_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" }]), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (rpcName === "schedule_announcement_admin_update") {
    announcementUpdateBodies.push(body);
    return new Response(JSON.stringify([{
      id: body.p_id,
      message: body.p_message,
      has_image: body.p_image_action !== "remove",
      is_active: body.p_is_active,
      updated_at: "2026-08-12T06:30:00.000Z",
      version: body.p_expected_version + 1
    }]), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  throw new Error(`Unexpected RPC ${rpcName}`);
};
try {
  for (const imageAction of ["keep", "replace", "remove"]) {
    const form = new FormData();
    form.set("expectedVersion", "4");
    form.set("message", `Edited ${imageAction}`);
    form.set("isActive", "false");
    form.set("imageAction", imageAction);
    if (imageAction === "replace") {
      const pngBytes = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
      form.set("image", new File([pngBytes], "replacement.png", { type: "image/png" }));
    }
    const response = await worker.fetch(new Request(
      "https://worker.example/v1/admin/announcements/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      {
        method: "PATCH",
        headers: { Origin: origin, Authorization: "Bearer 11111111-1111-4111-8111-111111111111" },
        body: form
      }
    ), baseEnv);
    assert.equal(response.status, 200, `${imageAction} announcement edit should succeed`);
  }
  assert.deepEqual(announcementUpdateBodies.map((body) => body.p_image_action), ["keep", "replace", "remove"]);
  assert.equal(announcementUpdateBodies[0].p_image_content, null, "keep must not resend stored image bytes");
  assert.equal(announcementUpdateBodies[1].p_image_content_type, "image/png");
  assert.equal(announcementUpdateBodies[1].p_image_content, "iVBORw0KGgoA");
  assert.equal(announcementUpdateBodies[2].p_image_content, null, "remove must not send replacement bytes");
  assert.equal(announcementUpdateBodies[2].p_expected_version, 4, "edits must preserve optimistic version checks");
} finally {
  globalThis.fetch = realFetch;
}

globalThis.fetch = async (url, options) => {
  const rpcName = decodeURIComponent(new URL(String(url)).pathname.split("/").at(-1));
  if (rpcName === "schedule_announcement_admin_auth") {
    return new Response(JSON.stringify([{ admin_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" }]), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (rpcName === "schedule_announcement_admin_update") {
    return new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } });
  }
  throw new Error(`Unexpected RPC ${rpcName}`);
};
try {
  const form = new FormData();
  form.set("expectedVersion", "3");
  form.set("message", "Stale edit");
  form.set("isActive", "true");
  form.set("imageAction", "keep");
  const response = await worker.fetch(new Request(
    "https://worker.example/v1/admin/announcements/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    {
      method: "PATCH",
      headers: { Origin: origin, Authorization: "Bearer 11111111-1111-4111-8111-111111111111" },
      body: form
    }
  ), baseEnv);
  assert.equal(response.status, 409, "stale announcement edits must not overwrite a newer version");
} finally {
  globalThis.fetch = realFetch;
}

let missingReplacementUpdateCalled = false;
globalThis.fetch = async (url, options) => {
  const rpcName = decodeURIComponent(new URL(String(url)).pathname.split("/").at(-1));
  if (rpcName === "schedule_announcement_admin_auth") {
    return new Response(JSON.stringify([{ admin_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" }]), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (rpcName === "schedule_announcement_admin_update") missingReplacementUpdateCalled = true;
  throw new Error(`Unexpected RPC ${rpcName}`);
};
try {
  const form = new FormData();
  form.set("expectedVersion", "4");
  form.set("message", "Missing replacement image");
  form.set("isActive", "true");
  form.set("imageAction", "replace");
  const response = await worker.fetch(new Request(
    "https://worker.example/v1/admin/announcements/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    {
      method: "PATCH",
      headers: { Origin: origin, Authorization: "Bearer 11111111-1111-4111-8111-111111111111" },
      body: form
    }
  ), baseEnv);
  assert.equal(response.status, 400);
  assert.equal(missingReplacementUpdateCalled, false, "replace without a verified image must stop before storage");
} finally {
  globalThis.fetch = realFetch;
}

globalThis.fetch = async (url, options) => {
  const rpcName = decodeURIComponent(new URL(String(url)).pathname.split("/").at(-1));
  const body = JSON.parse(options.body);
  if (rpcName === "schedule_announcement_public_list") {
    assert.equal(body.p_service_secret, baseEnv.SCHEDULE_SERVICE_SECRET);
    return new Response(JSON.stringify([{
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      message: "Public announcement",
      has_image: true,
      updated_at: "2026-08-12T06:00:00.000Z",
      version: 1
    }]), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  if (rpcName === "schedule_announcement_public_image") {
    return new Response(JSON.stringify([{
      image_content: "iVBORw0K\nGgoA",
      image_content_type: "image/png"
    }]), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  throw new Error(`Unexpected RPC ${rpcName}`);
};
try {
  const list = await worker.fetch(new Request("https://worker.example/v1/announcements", {
    headers: { Origin: origin }
  }), baseEnv);
  assert.equal(list.status, 200);
  const listed = (await list.json()).announcements[0];
  assert.equal(listed.message, "Public announcement");
  assert.equal(Object.hasOwn(listed, "isActive"), false, "public rows must not expose admin state");

  const image = await worker.fetch(new Request(
    "https://worker.example/v1/announcements/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb/image",
    { headers: { Origin: origin } }
  ), baseEnv);
  assert.equal(image.status, 200);
  assert.equal(image.headers.get("content-length"), "9");
  assert.equal(image.headers.get("cache-control"), "no-store");
  assert.equal(image.headers.get("x-content-type-options"), "nosniff");
  assert.deepEqual(new Uint8Array(await image.arrayBuffer()), Uint8Array.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00
  ]));
} finally {
  globalThis.fetch = realFetch;
}

const unauthenticatedMutation = await worker.fetch(new Request(
  "https://worker.example/v1/admin/announcements/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  {
    method: "DELETE",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: JSON.stringify({ expectedVersion: 1 })
  }
), baseEnv);
assert.equal(unauthenticatedMutation.status, 401, "announcement mutations require an admin bearer token");

console.log("Schedule Worker checks passed: health, CORS, throttling, body cap, announcements, and secure admin/parent forwarding.");
