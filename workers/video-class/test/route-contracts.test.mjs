import assert from "node:assert/strict";
import test from "node:test";

import worker, { __test } from "../src/index.js";

const ORIGIN = "https://edmundeducation.com";
const ADMIN_TOKEN = "11111111-1111-4111-8111-111111111111";
const ADMIN_ID = "22222222-2222-4222-8222-222222222222";
const STUDENT_TOKEN = "33333333-3333-4333-8333-333333333333";
const STUDENT_ID = "44444444-4444-4444-8444-444444444444";
const LESSON_A = "55555555-5555-4555-8555-555555555555";
const LESSON_B = "66666666-6666-4666-8666-666666666666";
const PLAYBACK_ID = "77777777-7777-4777-8777-777777777777";
const DELETE_JOB_ID = "88888888-8888-4888-8888-888888888888";

function makeBucket(overrides = {}) {
  return {
    list: async () => ({ objects: [], truncated: false }),
    head: async () => null,
    get: async () => null,
    delete: async () => {},
    createMultipartUpload: async () => { throw new Error("not used"); },
    resumeMultipartUpload: () => { throw new Error("not used"); },
    ...overrides
  };
}

function makeEnv(bucket = makeBucket()) {
  return {
    ALLOWED_ORIGIN: ORIGIN,
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_ANON_KEY: "test-anon-key",
    VIDEO_CLASS_SERVICE_SECRET: "s".repeat(48),
    VIDEO_CLASS_SIGNING_KEY: "k".repeat(64),
    VIDEO_CLASSES: bucket
  };
}

function request(path, method, token, body) {
  return new Request(`${ORIGIN}${path}`, {
    method,
    headers: {
      Origin: ORIGIN,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "video-class-worker-test"
    },
    body: body == null ? undefined : JSON.stringify(body)
  });
}

function joinBytes(...parts) {
  const bytes = new Uint8Array(parts.reduce((total, part) => total + part.byteLength, 0));
  let offset = 0;
  for (const part of parts) {
    bytes.set(part, offset);
    offset += part.byteLength;
  }
  return bytes;
}

function isoBox(type, ...payloadParts) {
  const payload = joinBytes(...payloadParts);
  const bytes = new Uint8Array(8 + payload.byteLength);
  new DataView(bytes.buffer).setUint32(0, bytes.byteLength);
  bytes.set(new TextEncoder().encode(type), 4);
  bytes.set(payload, 8);
  return bytes;
}

function isoVideo(codec, fastStart = true) {
  const handlerPayload = new Uint8Array(12);
  handlerPayload.set(new TextEncoder().encode("vide"), 8);
  const sampleDescriptionHeader = new Uint8Array(8);
  new DataView(sampleDescriptionHeader.buffer).setUint32(4, 1);
  const sampleDescription = isoBox(
    "stsd",
    sampleDescriptionHeader,
    isoBox(codec, new Uint8Array(78))
  );
  const movie = isoBox(
    "moov",
    isoBox("trak", isoBox(
      "mdia",
      isoBox("hdlr", handlerPayload),
      isoBox("minf", isoBox("stbl", sampleDescription))
    ))
  );
  const fileType = isoBox("ftyp", new TextEncoder().encode("isom"));
  const mediaData = isoBox("mdat", new Uint8Array(32));
  return fastStart ? joinBytes(fileType, movie, mediaData) : joinBytes(fileType, mediaData, movie);
}

function videoBucketObject(key, bytes) {
  return makeBucket({
    head: async candidate => candidate === key ? {
      key,
      size: bytes.byteLength,
      httpMetadata: { contentType: "video/mp4" },
      customMetadata: {}
    } : null,
    get: async (candidate, options = {}) => {
      if (candidate !== key) return null;
      const offset = Number(options.range?.offset ?? 0);
      const length = Number(options.range?.length ?? bytes.byteLength - offset);
      return { body: bytes.slice(offset, offset + length) };
    }
  });
}

async function withRpcStub(resolver, callback) {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    const name = new URL(String(url)).pathname.split("/").pop();
    const body = options.body ? JSON.parse(String(options.body)) : null;
    calls.push({ name, body });
    const value = await resolver(name, body);
    return new Response(JSON.stringify(value), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  };
  try {
    await callback(calls);
  } finally {
    globalThis.fetch = originalFetch;
  }
}

test("multi-course private-video publish forwards the complete course selection", async () => {
  const sourceKey = "admin-uploads/videos/writing-class.mp4";
  const bucket = videoBucketObject(sourceKey, isoVideo("avc1"));

  await withRpcStub((name, body) => {
    if (name === "video_class_admin_me") return [{ admin_id: ADMIN_ID }];
    if (name === "video_class_admin_publish_r2_object") {
      return {
        lesson_id: LESSON_A,
        slug: "writing-class",
        title: "Writing class",
        description: "Shared lesson",
        course_code: "dse",
        course_codes: ["dse", "ielts"],
        course_label: "錄影班",
        duration_seconds: 90,
        sort_order: 0
      };
    }
    throw new Error(`Unexpected RPC ${name}`);
  }, async calls => {
    const response = await worker.fetch(request("/v1/admin/r2/publish", "POST", ADMIN_TOKEN, {
      objectKey: sourceKey,
      title: "Writing class",
      description: "Shared lesson",
      courseCodes: ["dse", "ielts"],
      durationSeconds: 90
    }), makeEnv(bucket), {});

    assert.equal(response.status, 201);
    const publish = calls.find(call => call.name === "video_class_admin_publish_r2_object");
    assert.ok(publish);
    assert.equal(publish.body.p_course_code, "dse");
    assert.deepEqual(publish.body.p_course_codes, ["dse", "ielts"]);
    assert.equal(publish.body.p_service_secret, "s".repeat(48));
  });
});

test("private-video publish rejects both HEVC sample-entry variants with a stable error code", async () => {
  const sourceKey = "admin-uploads/videos/hevc-class.mp4";
  for (const codec of ["hvc1", "hev1"]) {
    await withRpcStub((name) => {
      if (name === "video_class_admin_me") return [{ admin_id: ADMIN_ID }];
      throw new Error(`Unexpected RPC ${name}`);
    }, async calls => {
      const response = await worker.fetch(request("/v1/admin/r2/publish", "POST", ADMIN_TOKEN, {
        objectKey: sourceKey,
        title: "HEVC class",
        description: "Must be converted",
        courseCodes: ["ielts"],
        durationSeconds: 90
      }), makeEnv(videoBucketObject(sourceKey, isoVideo(codec))), {});

      assert.equal(response.status, 415);
      const body = await response.json();
      assert.equal(body.error.code, "VIDEO_CODEC_HEVC_UNSUPPORTED");
      assert.match(body.error.message, /H\.264/);
      assert.equal(calls.some(call => call.name === "video_class_admin_publish_r2_object"), false);
    });
  }
});

test("private-video publish rejects MP4 metadata stored after media data", async () => {
  const sourceKey = "admin-uploads/videos/not-fast-start.mp4";
  await withRpcStub((name) => {
    if (name === "video_class_admin_me") return [{ admin_id: ADMIN_ID }];
    throw new Error(`Unexpected RPC ${name}`);
  }, async calls => {
    const response = await worker.fetch(request("/v1/admin/r2/publish", "POST", ADMIN_TOKEN, {
      objectKey: sourceKey,
      title: "Late metadata",
      description: "Must be optimized",
      courseCodes: ["ielts"],
      durationSeconds: 90
    }), makeEnv(videoBucketObject(sourceKey, isoVideo("avc1", false))), {});

    assert.equal(response.status, 415);
    const body = await response.json();
    assert.equal(body.error.code, "VIDEO_NOT_FAST_START");
    assert.match(body.error.message, /Fast Start/);
    assert.equal(calls.some(call => call.name === "video_class_admin_publish_r2_object"), false);
  });
});

test("lesson deletion removes every R2 object in batches before finalizing", async () => {
  const keys = Array.from({ length: 2_001 }, (_, index) => `lessons/${LESSON_A}/object-${index}.bin`);
  const deleteCalls = [];
  const events = [];
  const bucket = makeBucket({
    delete: async batch => {
      events.push(`delete-${batch.length}`);
      deleteCalls.push(batch);
    }
  });

  await withRpcStub((name) => {
    events.push(name);
    if (name === "video_class_admin_me") return [{ admin_id: ADMIN_ID }];
    if (name === "video_class_admin_prepare_delete_lesson") {
      return { lesson_id: LESSON_A, delete_job_id: DELETE_JOB_ID, object_keys: keys };
    }
    if (name === "video_class_admin_finish_delete_lesson") return true;
    throw new Error(`Unexpected RPC ${name}`);
  }, async () => {
    const response = await worker.fetch(request(
      `/v1/admin/lessons/${LESSON_A}?deleteObject=true`,
      "DELETE",
      ADMIN_TOKEN
    ), makeEnv(bucket), {});

    assert.equal(response.status, 204);
    assert.deepEqual(deleteCalls.map(batch => batch.length), [1000, 1000, 1]);
    assert.deepEqual(deleteCalls.flat(), keys);
    assert.ok(events.indexOf("video_class_admin_finish_delete_lesson") > events.lastIndexOf("delete-1"));
  });
});

test("slug-based playback does not scan the catalogue and rejects a mismatched lesson ID", async () => {
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  await withRpcStub((name) => {
    if (name === "video_class_student_me") return [{ student_id: STUDENT_ID }];
    if (name === "video_class_create_playback") {
      return [{
        playback_id: PLAYBACK_ID,
        student_id: STUDENT_ID,
        lesson_id: LESSON_B,
        slug: "requested-video",
        expires_at: expiresAt
      }];
    }
    throw new Error(`Unexpected RPC ${name}`);
  }, async calls => {
    const response = await worker.fetch(request("/v1/playback/refresh", "POST", STUDENT_TOKEN, {
      lessonSlug: "requested-video",
      lessonId: LESSON_A
    }), makeEnv(), {});

    assert.equal(response.status, 409);
    assert.deepEqual(calls.map(call => call.name), [
      "video_class_student_me",
      "video_class_create_playback"
    ]);
  });
});

test("official-series order mapper accepts camelCase output and preserves manual order", () => {
  const mapped = __test.mapOfficialPlaylistOrder({
    officialPlaylistOrderMode: "manual",
    officialPlaylistOrderIds: [LESSON_B, LESSON_A],
    orderUpdatedAt: "2026-08-13T12:00:00.000Z"
  });
  assert.deepEqual(mapped, {
    mode: "manual",
    playlistIds: [LESSON_B, LESSON_A],
    updatedAt: "2026-08-13T12:00:00.000Z"
  });
});

test("R2 batch deletion helper uses the service limit and is a no-op for an empty plan", async () => {
  const calls = [];
  const bucket = { delete: async keys => calls.push(keys) };
  const keys = Array.from({ length: 2_001 }, (_, index) => `key-${index}`);
  await __test.deleteR2ObjectsInBatches(bucket, keys);
  await __test.deleteR2ObjectsInBatches(bucket, []);
  assert.deepEqual(calls.map(batch => batch.length), [1000, 1000, 1]);
  assert.deepEqual(calls.flat(), keys);
});
