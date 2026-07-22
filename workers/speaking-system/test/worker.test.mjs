import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workerUrl = new URL("../src/index.js", import.meta.url);
const workerSource = await readFile(workerUrl, "utf8");
const testExports = `
export {
  crc32,
  inspectMp3,
  makeCentralHeader,
  makeEndOfCentralDirectory,
  makeLocalHeader,
  maxDurationMs,
  maxUploadBytes,
  normalizeBookmark,
  normalizeExamQuestionManifest,
  parseMultipartUpload,
  parseExportPage,
  publicExamAttempt,
  publicExamCooldownState,
  expectedExamExerciseIds,
  prepareZip
};
`;
const worker = await import(
  `data:text/javascript;base64,${Buffer.from(workerSource + testExports).toString("base64")}`
);

function mpeg1Layer3Frame({ bitrateIndex = 9, sampleRateIndex = 0, padding = 0 } = {}) {
  const bitrates = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
  const sampleRates = [44100, 48000, 32000];
  const length = Math.floor((144000 * bitrates[bitrateIndex]) / sampleRates[sampleRateIndex]) + padding;
  const frame = new Uint8Array(length);
  frame.set([
    0xFF,
    0xFB,
    (bitrateIndex << 4) | (sampleRateIndex << 2) | (padding << 1),
    0x00
  ]);
  return frame;
}

function repeatFrame(count, options = {}) {
  const frame = mpeg1Layer3Frame(options);
  const bytes = new Uint8Array(frame.length * count);
  for (let index = 0; index < count; index += 1) bytes.set(frame, index * frame.length);
  return bytes;
}

function synchsafe(value) {
  return [
    (value >>> 21) & 0x7F,
    (value >>> 14) & 0x7F,
    (value >>> 7) & 0x7F,
    value & 0x7F
  ];
}

function prependId3(audio, payloadLength, flags = 0) {
  const bytes = new Uint8Array(10 + payloadLength + audio.length);
  bytes.set([0x49, 0x44, 0x33, 0x04, 0x00, flags, ...synchsafe(payloadLength)]);
  bytes.set(audio, 10 + payloadLength);
  return bytes;
}

function configuredEnv(overrides = {}) {
  return {
    ALLOWED_ORIGINS: "https://edmundeducation.github.io",
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_SECRET_KEY: `sb_secret_${"x".repeat(40)}`,
    ADMIN_LOGIN_RATE_LIMITER: { limit: async () => ({ success: true }) },
    UPLOAD_RATE_LIMITER: { limit: async () => ({ success: true }) },
    ...overrides
  };
}

function jsonResponse(value, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify(value), { ...init, headers });
}

function authorizedRequest(path, token, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Origin", "https://edmundeducation.github.io");
  return new Request(`https://worker.example${path}`, { ...init, headers });
}

function slowCrc32(bytes) {
  let value = 0xFFFFFFFF;
  for (const byte of bytes) {
    value ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      value = (value & 1) ? (0xEDB88320 ^ (value >>> 1)) : (value >>> 1);
    }
  }
  return (value ^ 0xFFFFFFFF) >>> 0;
}

test("MP3 inspection accepts a plausible one-second MPEG Layer III stream", () => {
  const result = worker.inspectMp3(repeatFrame(40));
  assert.ok(result);
  assert.equal(result.frames, 40);
  assert.equal(result.durationMs, 1045);
  assert.equal(result.metadataBytes, 0);
  assert.equal(result.paddingBytes, 0);
});

test("upload accepts one MP3 frame of encoder padding beyond the 300-second content cap", async () => {
  const audio = repeatFrame(11485, { bitrateIndex: 5 });
  const inspected = worker.inspectMp3(audio);
  assert.ok(inspected);
  assert.equal(inspected.durationMs, 300016);
  const form = new FormData();
  form.append("file", new Blob([audio], { type: "audio/mpeg" }), "boundary.mp3");
  form.append("exerciseId", "ielts-part1-boundary");
  form.append("exerciseTitle", "Five-minute boundary");
  form.append("exam", "IELTS");
  form.append("part", "1");
  form.append("book", "1");
  form.append("durationMs", "300000");
  const request = new Request("https://worker.example/v1/recordings", { method: "POST", body: form });
  const parsed = await worker.parseMultipartUpload(request, {});
  assert.equal(parsed.clientDurationMs, 300000);
  assert.equal(parsed.durationMs, 300016);
});

test("MP3 inspection accepts a small valid ID3v2 tag and bounded zero padding", () => {
  const audio = repeatFrame(40);
  const tagged = prependId3(audio, 32);
  const bytes = new Uint8Array(tagged.length + 1024);
  bytes.set(tagged);
  const result = worker.inspectMp3(bytes);
  assert.ok(result);
  assert.equal(result.metadataBytes, 42);
  assert.equal(result.paddingBytes, 1024);
});

test("MP3 inspection rejects short streams and arbitrary trailing data", () => {
  assert.equal(worker.inspectMp3(repeatFrame(2)), null);

  const audio = repeatFrame(40);
  const padded = new Uint8Array(audio.length + 1025);
  padded.set(audio);
  assert.equal(worker.inspectMp3(padded), null);
});

test("MP3 inspection rejects oversized or malformed ID3v2 tags", () => {
  const audio = repeatFrame(200);
  assert.equal(worker.inspectMp3(prependId3(audio, 65537)), null);
  assert.equal(worker.inspectMp3(prependId3(audio, 32, 0x01)), null);
});

test("CRC-32 matches the standard check vector", () => {
  assert.equal(worker.crc32(new TextEncoder().encode("123456789")), 0xCBF43926);
  for (const length of [0, 1, 7, 8, 9, 15, 16, 31, 256, 1025]) {
    const bytes = Uint8Array.from({ length }, (_, index) => (index * 73 + 19) & 0xFF);
    assert.equal(worker.crc32(bytes), slowCrc32(bytes), `length ${length}`);
  }
});

test("missing or invalid upload settings fail safely to Free-plan defaults", () => {
  assert.equal(worker.maxUploadBytes({}), 3 * 1024 * 1024);
  assert.equal(worker.maxDurationMs({}), 300000);
  assert.equal(worker.maxUploadBytes({ MAX_UPLOAD_BYTES: "not-a-number" }), 3 * 1024 * 1024);
  assert.equal(worker.maxDurationMs({ MAX_DURATION_MS: "999999999" }), 300000);
  assert.equal(worker.maxDurationMs({ MAX_DURATION_MS: "1799000" }), 1799000);
  assert.equal(worker.maxDurationMs({ MAX_DURATION_MS: "1800000" }), 300000);
});

test("health reports limiter readiness and the effective safety caps", async () => {
  const missingLimiterResponse = await worker.default.fetch(
    new Request("https://worker.example/v1/health"),
    configuredEnv({ UPLOAD_RATE_LIMITER: undefined }),
    {}
  );
  assert.equal(missingLimiterResponse.status, 503);
  assert.equal((await missingLimiterResponse.json()).rateLimiters.upload, false);

  const readyResponse = await worker.default.fetch(
    new Request("https://worker.example/v1/health"),
    configuredEnv(),
    {}
  );
  assert.equal(readyResponse.status, 200);
  const health = await readyResponse.json();
  assert.equal(health.ok, true);
  assert.equal(health.maxUploadBytes, 3 * 1024 * 1024);
  assert.equal(health.maxDurationMs, 300000);
  assert.deepEqual(health.rateLimiters, { adminLogin: true, upload: true });
});

test("CORS preflight allows the exam self-evaluation PATCH request", async () => {
  const response = await worker.default.fetch(
    new Request("https://worker.example/v1/exam-attempts/d34db33f-3f4a-4a0e-8df2-5748f5b5bf3a", {
      method: "OPTIONS",
      headers: {
        Origin: "https://edmundeducation.github.io",
        "Access-Control-Request-Method": "PATCH",
        "Access-Control-Request-Headers": "authorization,content-type"
      }
    }),
    configuredEnv(),
    {}
  );
  assert.equal(response.status, 204);
  assert.match(response.headers.get("Access-Control-Allow-Methods") || "", /(?:^|,\s*)PATCH(?:,|$)/);
});

test("student profile requires a token and returns only whitelisted speaking access", async () => {
  const studentId = "9b2ec442-eded-4aef-9bc9-223ddb6890ba";
  const studentToken = "cf384b3c-fdaf-45c2-a266-cfb29e201a48";
  const unauthenticated = await worker.default.fetch(
    new Request("https://worker.example/v1/student/me", {
      headers: { Origin: "https://edmundeducation.github.io" }
    }),
    configuredEnv(),
    {}
  );
  assert.equal(unauthenticated.status, 401);

  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    assert.equal(options.redirect, "manual");
    const parsed = new URL(String(url));
    if (parsed.pathname.endsWith("/rpc/speaking_student_profile")) {
      calls.push("profile");
      return jsonResponse([{ id: studentId, name: "Alice", session_expires_at: "2026-08-20T00:00:00Z" }]);
    }
    if (parsed.pathname.endsWith("/rest/v1/flashcard_student_state")) {
      calls.push("access");
      assert.equal(parsed.searchParams.get("student_id"), `eq.${studentId}`);
      assert.equal(parsed.searchParams.get("key"), "eq.speaking-access-v1");
      return jsonResponse([{
        value: {
          "exam.ielts": false,
          "ielts.part.2.book.1": true,
          unknown: false,
          "ielts.part.2": "not-boolean"
        },
        updated_at: "2026-07-20T00:00:00Z"
      }]);
    }
    assert.fail(`Unexpected upstream request: ${options.method || "GET"} ${parsed.pathname}`);
  };

  try {
    const response = await worker.default.fetch(
      authorizedRequest("/v1/student/me", studentToken),
      configuredEnv(),
      {}
    );
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.student.id, studentId);
    assert.equal(body.student.name, "Alice");
    assert.deepEqual(body.access, {
      "exam.ielts": false,
      "ielts.part.2.book.1": true
    });
    assert.deepEqual(calls, ["profile", "access"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("bookmark writes are scoped to the authenticated student and validated routes", async () => {
  const studentId = "9b2ec442-eded-4aef-9bc9-223ddb6890ba";
  const otherStudentId = "75212ac4-6c53-48f9-b293-4c462e01741e";
  const studentToken = "cf384b3c-fdaf-45c2-a266-cfb29e201a48";
  const originalFetch = globalThis.fetch;
  let writes = 0;
  globalThis.fetch = async (url, options = {}) => {
    const parsed = new URL(String(url));
    if (parsed.pathname.endsWith("/rpc/speaking_student_profile")) {
      return jsonResponse([{ id: studentId, name: "Alice", session_expires_at: "2026-08-20T00:00:00Z" }]);
    }
    if (parsed.pathname.endsWith("/rest/v1/flashcard_student_state") && (options.method || "GET") === "GET") {
      assert.equal(parsed.searchParams.get("student_id"), `eq.${studentId}`);
      assert.equal(parsed.searchParams.get("key"), "eq.speaking-access-v1");
      return jsonResponse([]);
    }
    if (parsed.pathname.endsWith("/rest/v1/flashcard_student_state") && options.method === "POST") {
      writes += 1;
      assert.equal(parsed.searchParams.get("on_conflict"), "student_id,key");
      assert.match(options.headers.get("Prefer"), /resolution=merge-duplicates/);
      const payload = JSON.parse(String(options.body));
      assert.equal(payload.student_id, studentId);
      assert.notEqual(payload.student_id, otherStudentId);
      assert.equal(payload.key, "speaking-bookmarks-v1");
      assert.deepEqual(payload.value, [
        { kind: "exam", exam: "ielts" },
        { kind: "book", exam: "ielts", part: 2, book: 1 },
        { kind: "exercise", exam: "ielts", part: 2, book: 1, exerciseId: "ielts-part2-book1-question1" }
      ]);
      return jsonResponse([{ ...payload, updated_at: "2026-07-20T00:00:00Z" }], { status: 201 });
    }
    assert.fail(`Unexpected upstream request: ${options.method || "GET"} ${parsed.pathname}`);
  };

  try {
    const bookmarks = [
      { kind: "exam", exam: "ielts" },
      { kind: "book", exam: "ielts", part: 2, book: 1 },
      { kind: "book", exam: "ielts", part: 2, book: 1 },
      { kind: "exercise", exam: "ielts", part: 2, book: 1, exerciseId: "ielts-part2-book1-question1" }
    ];
    const response = await worker.default.fetch(
      authorizedRequest("/v1/bookmarks", studentToken, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookmarks })
      }),
      configuredEnv(),
      {}
    );
    assert.equal(response.status, 200);
    assert.equal((await response.json()).bookmarks.length, 3);
    assert.equal(writes, 1);

    const injected = await worker.default.fetch(
      authorizedRequest("/v1/bookmarks", studentToken, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: otherStudentId, bookmarks: [] })
      }),
      configuredEnv(),
      {}
    );
    assert.equal(injected.status, 400);
    assert.equal((await injected.json()).code, "INVALID_BOOKMARKS");
    assert.equal(writes, 1);

    const invalidRoute = await worker.default.fetch(
      authorizedRequest("/v1/bookmarks", studentToken, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookmarks: [{ kind: "book", exam: "ielts", part: 2, book: 17 }] })
      }),
      configuredEnv(),
      {}
    );
    assert.equal(invalidRoute.status, 400);
    assert.equal((await invalidRoute.json()).code, "INVALID_BOOKMARKS");
    assert.equal(writes, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("exam manifests derive stable exact-question keys and question bookmarks stay typed", () => {
  const questions = Array.from({ length: 12 }, (_, index) => ({
    order: index + 1,
    part: 1,
    sourceId: `ielts-p1-b1-theme-${index + 1}`,
    sourceBook: 1,
    sourceIndex: index + 1,
    questionNumber: index + 1,
    promptEn: `Question number ${index + 1}?`,
    promptZh: `第 ${index + 1} 題？`
  }));
  const manifest = worker.normalizeExamQuestionManifest("p1", questions);
  assert.equal(manifest.length, 12);
  assert.equal(manifest[0].sourceKey, "p1:ielts-p1-b1-theme-1:q1");
  assert.equal(manifest[0].contentKey, "question number 1");
  assert.throws(
    () => worker.normalizeExamQuestionManifest("p1", questions.map((item, index) => (
      index === 1 ? { ...item, promptEn: questions[0].promptEn } : item
    ))),
    /duplicate or empty question/
  );
  assert.throws(
    () => worker.normalizeExamQuestionManifest("p1", questions.map((item, index) => (
      index === 0 ? { ...item, order: "1" } : item
    ))),
    /invalid field types/
  );
  assert.throws(
    () => worker.normalizeExamQuestionManifest("p1", questions.map((item, index) => (
      index === 0 ? { ...item, promptZh: "" } : item
    ))),
    /invalid source or prompt data/
  );
  assert.throws(
    () => worker.normalizeExamQuestionManifest("p1", questions.map((item, index) => (
      index === 0 ? { ...item, sourceBook: 15 } : item
    ))),
    /invalid source or prompt data/
  );

  assert.deepEqual(worker.normalizeBookmark({
    kind: "question",
    exam: "ielts",
    part: 1,
    book: 1,
    exerciseId: "ielts-p1-b1-theme-1",
    questionNumber: 1
  }, true), {
    kind: "question",
    exam: "ielts",
    part: 1,
    book: 1,
    exerciseId: "ielts-p1-b1-theme-1",
    questionNumber: 1
  });
  assert.throws(() => worker.normalizeBookmark({
    kind: "question",
    exam: "ielts",
    part: 1,
    book: 1,
    exerciseId: "ielts-p1-b1-theme-1",
    questionNumber: 0
  }, true), /invalid route/);

  const attemptId = "d34db33f-3f4a-4a0e-8df2-5748f5b5bf3a";
  const expectedIds = worker.expectedExamExerciseIds({
    id: attemptId,
    mode_id: "p1-p3",
    natural_exchange: true
  });
  assert.equal(expectedIds.length, 19);
  assert.equal(expectedIds[0], `exam:p1-p3:${attemptId}:p1:intro`);
  assert.equal(expectedIds[1], `exam:p1-p3:${attemptId}:p1:q01`);
  assert.equal(expectedIds.at(-1), `exam:p1-p3:${attemptId}:p3:q18`);
});

test("latest exam state exposes only cooldown identities and the monotonic ordinal", async () => {
  const studentId = "9b2ec442-eded-4aef-9bc9-223ddb6890ba";
  const studentToken = "cf384b3c-fdaf-45c2-a266-cfb29e201a48";
  const attemptId = "d34db33f-3f4a-4a0e-8df2-5748f5b5bf3a";
  const stateRow = {
    attempt_id: attemptId,
    attempt_number: 5920,
    cooldown_manifest: [
      { sourceKey: "p1:source:q1", contentKey: "one" },
      { sourceKey: "p3:source:q2", contentKey: "two" }
    ]
  };
  assert.deepEqual(worker.publicExamCooldownState(stateRow), {
    id: attemptId,
    attemptNumber: 5920,
    questions: stateRow.cooldown_manifest
  });

  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    const parsed = new URL(String(url));
    if (parsed.pathname.endsWith("/rpc/speaking_student_profile")) {
      calls.push("student-profile");
      return jsonResponse([{ id: studentId, name: "Alice", session_expires_at: "2026-08-20T00:00:00Z" }]);
    }
    if (parsed.pathname.endsWith("/rest/v1/speaking_exam_student_state")) {
      calls.push("latest-state");
      assert.equal(options.method, "GET");
      assert.equal(parsed.searchParams.get("student_id"), `eq.${studentId}`);
      assert.equal(parsed.searchParams.get("order"), null);
      assert.match(parsed.searchParams.get("select") || "", /attempt_id/);
      assert.match(parsed.searchParams.get("select") || "", /cooldown_manifest/);
      assert.doesNotMatch(parsed.searchParams.get("select") || "", /question_manifest|mode_id|nervousness_rating|started_at/);
      return jsonResponse([stateRow]);
    }
    assert.fail(`Unexpected upstream request: ${options.method || "GET"} ${parsed.pathname}`);
  };
  try {
    const response = await worker.default.fetch(
      authorizedRequest("/v1/exam-attempts/latest", studentToken),
      configuredEnv(),
      {}
    );
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.deepEqual(body.attempt, {
      id: attemptId,
      attemptNumber: 5920,
      questions: stateRow.cooldown_manifest
    });
    assert.deepEqual(calls, ["student-profile", "latest-state"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("latest endpoint minimizes a legacy full-state row during rolling migration", async () => {
  const studentId = "9b2ec442-eded-4aef-9bc9-223ddb6890ba";
  const studentToken = "cf384b3c-fdaf-45c2-a266-cfb29e201a48";
  const attemptId = "d34db33f-3f4a-4a0e-8df2-5748f5b5bf3a";
  const originalFetch = globalThis.fetch;
  let stateQueries = 0;
  globalThis.fetch = async (url) => {
    const parsed = new URL(String(url));
    if (parsed.pathname.endsWith("/rpc/speaking_student_profile")) {
      return jsonResponse([{ id: studentId, name: "Alice", session_expires_at: "2026-08-20T00:00:00Z" }]);
    }
    if (parsed.pathname.endsWith("/rest/v1/speaking_exam_student_state")) {
      stateQueries += 1;
      if (stateQueries === 1) return jsonResponse({ message: "missing cooldown_manifest" }, { status: 400 });
      assert.match(parsed.searchParams.get("select") || "", /question_manifest/);
      return jsonResponse([{
        attempt_id: attemptId,
        attempt_number: 23,
        question_manifest: [{
          sourceKey: "p2:legacy-source",
          contentKey: "legacy wording",
          promptEn: "Sensitive full prompt",
          promptZh: "完整題目"
        }]
      }]);
    }
    assert.fail(`Unexpected rolling-migration request: ${parsed.pathname}`);
  };
  try {
    const response = await worker.default.fetch(
      authorizedRequest("/v1/exam-attempts/latest", studentToken),
      configuredEnv(),
      {}
    );
    assert.equal(response.status, 200);
    assert.deepEqual((await response.json()).attempt, {
      id: attemptId,
      attemptNumber: 23,
      questions: [{ sourceKey: "p2:legacy-source", contentKey: "legacy wording" }]
    });
    assert.equal(stateQueries, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("student can idempotently skip an unanswered exam question", async () => {
  const studentId = "9b2ec442-eded-4aef-9bc9-223ddb6890ba";
  const studentToken = "cf384b3c-fdaf-45c2-a266-cfb29e201a48";
  const attemptId = "d34db33f-3f4a-4a0e-8df2-5748f5b5bf3a";
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    const parsed = new URL(String(url));
    if (parsed.pathname.endsWith("/rpc/speaking_student_profile")) {
      calls.push("student-profile");
      return jsonResponse([{ id: studentId, name: "Alice", session_expires_at: "2026-08-20T00:00:00Z" }]);
    }
    if (parsed.pathname.endsWith("/rpc/speaking_skip_exam_question")) {
      calls.push("skip-rpc");
      const payload = JSON.parse(String(options.body));
      assert.equal(payload.p_id, attemptId);
      assert.equal(payload.p_student_id, studentId);
      if (payload.p_question_order === 4) {
        return jsonResponse({ ok: false, code: "EXAM_QUESTION_HAS_RECORDING" });
      }
      assert.equal(payload.p_question_order, 3);
      return jsonResponse({
        ok: true,
        idempotent: true,
        attempt: {
          id: attemptId,
          attempt_number: 23,
          mode_id: "p1",
          natural_exchange: false,
          manifest_version: 1,
          question_manifest: [],
          skipped_question_orders: [3],
          nervousness_rating: null,
          rated_at: null,
          started_at: "2026-07-22T00:00:00Z",
          completed_at: null,
          updated_at: "2026-07-22T00:01:00Z"
        }
      });
    }
    assert.fail(`Unexpected upstream request: ${options.method || "GET"} ${parsed.pathname}`);
  };
  try {
    const skipped = await worker.default.fetch(
      authorizedRequest(`/v1/exam-attempts/${attemptId}/questions/3/skip`, studentToken, { method: "PUT" }),
      configuredEnv(),
      {}
    );
    assert.equal(skipped.status, 200);
    const skippedBody = await skipped.json();
    assert.equal(skippedBody.idempotent, true);
    assert.deepEqual(skippedBody.attempt.skippedOrders, [3]);

    const hasRecording = await worker.default.fetch(
      authorizedRequest(`/v1/exam-attempts/${attemptId}/questions/4/skip`, studentToken, { method: "PUT" }),
      configuredEnv(),
      {}
    );
    assert.equal(hasRecording.status, 409);
    assert.equal((await hasRecording.json()).code, "EXAM_QUESTION_HAS_RECORDING");

    const invalid = await worker.default.fetch(
      authorizedRequest(`/v1/exam-attempts/${attemptId}/questions/20/skip`, studentToken, { method: "PUT" }),
      configuredEnv(),
      {}
    );
    assert.equal(invalid.status, 400);
    assert.equal((await invalid.json()).code, "INVALID_EXAM_QUESTION_ORDER");
    assert.deepEqual(calls, ["student-profile", "skip-rpc", "student-profile", "skip-rpc"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("whole exam history deletion delegates ownership and recording checks to one RPC", async () => {
  const studentId = "9b2ec442-eded-4aef-9bc9-223ddb6890ba";
  const studentToken = "cf384b3c-fdaf-45c2-a266-cfb29e201a48";
  const attemptId = "d34db33f-3f4a-4a0e-8df2-5748f5b5bf3a";
  const originalFetch = globalThis.fetch;
  let deleteCalls = 0;
  globalThis.fetch = async (url, options = {}) => {
    const parsed = new URL(String(url));
    if (parsed.pathname.endsWith("/rpc/speaking_student_profile")) {
      return jsonResponse([{ id: studentId, name: "Alice", session_expires_at: "2026-08-20T00:00:00Z" }]);
    }
    if (parsed.pathname.endsWith("/rpc/speaking_delete_exam_attempt")) {
      deleteCalls += 1;
      const payload = JSON.parse(String(options.body));
      assert.deepEqual(payload, { p_id: attemptId, p_student_id: studentId });
      return deleteCalls === 1
        ? jsonResponse({ ok: true, id: attemptId })
        : jsonResponse({ ok: false, code: "EXAM_RECORDINGS_REMAIN", recordingCount: 2 });
    }
    assert.fail(`Whole deletion must not call Storage directly: ${options.method || "GET"} ${parsed.pathname}`);
  };
  try {
    const deleted = await worker.default.fetch(
      authorizedRequest(`/v1/exam-attempts/${attemptId}`, studentToken, { method: "DELETE" }),
      configuredEnv(),
      {}
    );
    assert.equal(deleted.status, 204);
    assert.equal(await deleted.text(), "");

    const blocked = await worker.default.fetch(
      authorizedRequest(`/v1/exam-attempts/${attemptId}`, studentToken, { method: "DELETE" }),
      configuredEnv(),
      {}
    );
    assert.equal(blocked.status, 409);
    assert.equal((await blocked.json()).code, "EXAM_RECORDINGS_REMAIN");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("whole exam deletion reconciles owned deleting tombstones and retries once", async () => {
  const studentId = "9b2ec442-eded-4aef-9bc9-223ddb6890ba";
  const studentToken = "cf384b3c-fdaf-45c2-a266-cfb29e201a48";
  const attemptId = "d34db33f-3f4a-4a0e-8df2-5748f5b5bf3a";
  const recordingIds = [
    "75f32715-93c1-4a21-b35f-65bd72c7d26d",
    "ee1d24c7-1dce-42bb-96ff-df7f7550cc35"
  ];
  const objectPaths = recordingIds.map(id => `students/${studentId}/${id}.mp3`);
  const originalFetch = globalThis.fetch;
  const calls = [];
  let parentDeleteCalls = 0;
  globalThis.fetch = async (url, options = {}) => {
    const parsed = new URL(String(url));
    if (parsed.pathname.endsWith("/rpc/speaking_student_profile")) {
      calls.push("student-profile");
      return jsonResponse([{ id: studentId, name: "Alice", session_expires_at: "2026-08-20T00:00:00Z" }]);
    }
    if (parsed.pathname.endsWith("/rpc/speaking_delete_exam_attempt")) {
      parentDeleteCalls += 1;
      calls.push(`parent-delete-${parentDeleteCalls}`);
      assert.deepEqual(JSON.parse(String(options.body)), { p_id: attemptId, p_student_id: studentId });
      if (parentDeleteCalls === 1) {
        return jsonResponse({
          ok: false,
          code: "EXAM_RECORDINGS_REMAIN",
          attemptNumber: 23,
          recordingCount: 2,
          deletingCount: 2,
          deletingRecordings: recordingIds.map((id, index) => ({ id, objectPath: objectPaths[index] }))
        });
      }
      assert.fail("Initial parent deletion RPC must run only once before reconciliation");
    }
    if (parsed.pathname.endsWith("/storage/v1/object/speaking-recordings")) {
      calls.push("storage-delete-batch");
      assert.equal(options.method, "DELETE");
      assert.deepEqual(JSON.parse(String(options.body)), { prefixes: objectPaths });
      return jsonResponse([]);
    }
    if (parsed.pathname.endsWith("/rpc/speaking_finalize_exam_recording_deletes")) {
      calls.push("finalize-batch");
      assert.deepEqual(JSON.parse(String(options.body)), {
        p_attempt_id: attemptId,
        p_student_id: studentId,
        p_attempt_number: 23,
        p_recording_ids: recordingIds
      });
      return jsonResponse({ ok: true, deletedCount: 2 });
    }
    if (parsed.pathname.endsWith("/rpc/speaking_delete_exam_attempt_if_number")) {
      calls.push("parent-delete-versioned");
      assert.deepEqual(JSON.parse(String(options.body)), {
        p_id: attemptId,
        p_student_id: studentId,
        p_attempt_number: 23
      });
      return jsonResponse({ ok: true, id: attemptId });
    }
    assert.fail(`Unexpected reconciliation request: ${options.method || "GET"} ${parsed.pathname}`);
  };
  try {
    const response = await worker.default.fetch(
      authorizedRequest(`/v1/exam-attempts/${attemptId}`, studentToken, { method: "DELETE" }),
      configuredEnv(),
      {}
    );
    assert.equal(response.status, 204);
    assert.deepEqual(calls, [
      "student-profile",
      "parent-delete-1",
      "storage-delete-batch",
      "finalize-batch",
      "parent-delete-versioned"
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("whole exam deletion leaves tombstone metadata intact when Storage deletion fails", async () => {
  const studentId = "9b2ec442-eded-4aef-9bc9-223ddb6890ba";
  const studentToken = "cf384b3c-fdaf-45c2-a266-cfb29e201a48";
  const attemptId = "d34db33f-3f4a-4a0e-8df2-5748f5b5bf3a";
  const recordingId = "75f32715-93c1-4a21-b35f-65bd72c7d26d";
  const objectPath = `students/${studentId}/${recordingId}.mp3`;
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    const parsed = new URL(String(url));
    if (parsed.pathname.endsWith("/rpc/speaking_student_profile")) {
      calls.push("student-profile");
      return jsonResponse([{ id: studentId, name: "Alice", session_expires_at: "2026-08-20T00:00:00Z" }]);
    }
    if (parsed.pathname.endsWith("/rpc/speaking_delete_exam_attempt")) {
      calls.push("parent-delete");
      return jsonResponse({
        ok: false,
        code: "EXAM_RECORDINGS_REMAIN",
        attemptNumber: 23,
        recordingCount: 1,
        deletingCount: 1,
        deletingRecordings: [{ id: recordingId, objectPath }]
      });
    }
    if (parsed.pathname.endsWith("/storage/v1/object/speaking-recordings")) {
      calls.push("storage-delete-failed");
      return new Response("storage unavailable", { status: 500 });
    }
    assert.fail(`Metadata must not finalize after Storage failure: ${options.method || "GET"} ${parsed.pathname}`);
  };
  try {
    const response = await worker.default.fetch(
      authorizedRequest(`/v1/exam-attempts/${attemptId}`, studentToken, { method: "DELETE" }),
      configuredEnv(),
      {}
    );
    assert.equal(response.status, 502);
    assert.equal((await response.json()).code, "STORAGE_DELETE_FAILED");
    assert.deepEqual(calls, ["student-profile", "parent-delete", "storage-delete-failed"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("whole exam deletion does not reconcile a ready recording", async () => {
  const studentId = "9b2ec442-eded-4aef-9bc9-223ddb6890ba";
  const studentToken = "cf384b3c-fdaf-45c2-a266-cfb29e201a48";
  const attemptId = "d34db33f-3f4a-4a0e-8df2-5748f5b5bf3a";
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    const parsed = new URL(String(url));
    if (parsed.pathname.endsWith("/rpc/speaking_student_profile")) {
      calls.push("student-profile");
      return jsonResponse([{ id: studentId, name: "Alice", session_expires_at: "2026-08-20T00:00:00Z" }]);
    }
    if (parsed.pathname.endsWith("/rpc/speaking_delete_exam_attempt")) {
      calls.push("parent-delete-ready");
      return jsonResponse({
        ok: false,
        code: "EXAM_RECORDINGS_REMAIN",
        recordingCount: 1,
        deletingCount: 0,
        deletingRecordings: []
      });
    }
    assert.fail(`Ready rows must never be removed by parent deletion: ${options.method || "GET"} ${parsed.pathname}`);
  };
  try {
    const response = await worker.default.fetch(
      authorizedRequest(`/v1/exam-attempts/${attemptId}`, studentToken, { method: "DELETE" }),
      configuredEnv(),
      {}
    );
    assert.equal(response.status, 409);
    assert.equal((await response.json()).code, "EXAM_RECORDINGS_REMAIN");
    assert.deepEqual(calls, ["student-profile", "parent-delete-ready"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("student creates an authenticated exam parent row before questions are shown", async () => {
  const studentId = "9b2ec442-eded-4aef-9bc9-223ddb6890ba";
  const studentToken = "cf384b3c-fdaf-45c2-a266-cfb29e201a48";
  const attemptId = "d34db33f-3f4a-4a0e-8df2-5748f5b5bf3a";
  const originalFetch = globalThis.fetch;
  const calls = [];
  let limiterKey = "";
  globalThis.fetch = async (url, options = {}) => {
    const parsed = new URL(String(url));
    if (parsed.pathname.endsWith("/rpc/speaking_student_profile")) {
      calls.push("student-profile");
      return jsonResponse([{ id: studentId, name: "Alice", session_expires_at: "2026-08-20T00:00:00Z" }]);
    }
    if (parsed.pathname.endsWith("/rest/v1/flashcard_student_state")) {
      calls.push("access-get");
      assert.equal(parsed.searchParams.get("student_id"), `eq.${studentId}`);
      assert.equal(parsed.searchParams.get("key"), "eq.speaking-access-v1");
      return jsonResponse([]);
    }
    if (parsed.pathname.endsWith("/rpc/speaking_create_exam_attempt")) {
      calls.push("create-attempt");
      const body = JSON.parse(options.body);
      assert.equal(body.p_id, attemptId);
      assert.equal(body.p_student_id, studentId);
      assert.equal(body.p_mode_id, "p2");
      assert.equal(body.p_natural_exchange, true);
      assert.equal(body.p_question_manifest[0].sourceKey, "p2:ielts-p2-b1-e1");
      return jsonResponse({
        ok: true,
        attempt: {
          id: attemptId,
          mode_id: "p2",
          natural_exchange: true,
          manifest_version: 1,
          question_manifest: body.p_question_manifest,
          nervousness_rating: null,
          rated_at: null,
          started_at: "2026-07-22T00:00:00Z",
          completed_at: null,
          updated_at: "2026-07-22T00:00:00Z"
        }
      });
    }
    assert.fail(`Unexpected upstream request: ${options.method || "GET"} ${parsed.pathname}`);
  };
  try {
    const response = await worker.default.fetch(
      authorizedRequest(`/v1/exam-attempts/${attemptId}`, studentToken, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modeId: "p2",
          naturalExchange: true,
          questions: [{
            order: 1,
            part: 2,
            sourceId: "ielts-p2-b1-e1",
            sourceBook: 1,
            sourceIndex: 1,
            questionNumber: null,
            promptEn: "Describe a useful advertisement.",
            promptZh: "描述一個有用的廣告。"
          }]
        })
      }),
      configuredEnv({
        UPLOAD_RATE_LIMITER: {
          limit: async ({ key }) => {
            limiterKey = key;
            return { success: true };
          }
        }
      }),
      {}
    );
    assert.equal(response.status, 201);
    const body = await response.json();
    assert.equal(body.attempt.id, attemptId);
    assert.equal(body.attempt.questions[0].contentKey, "describe a useful advertisement");
    assert.equal(limiterKey, `speaking-exam-start:${studentId}`);
    assert.deepEqual(calls, ["student-profile", "access-get", "create-attempt"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("exam self-evaluation delegates atomic recording checks to the locked completion RPC", async () => {
  const studentId = "9b2ec442-eded-4aef-9bc9-223ddb6890ba";
  const studentToken = "cf384b3c-fdaf-45c2-a266-cfb29e201a48";
  const attemptId = "d34db33f-3f4a-4a0e-8df2-5748f5b5bf3a";
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    const parsed = new URL(String(url));
    if (parsed.pathname.endsWith("/rpc/speaking_student_profile")) {
      calls.push("student-profile");
      return jsonResponse([{ id: studentId, name: "Alice", session_expires_at: "2026-08-20T00:00:00Z" }]);
    }
    if (parsed.pathname.endsWith("/rpc/speaking_complete_exam_attempt")) {
      calls.push("complete-rpc");
      const body = JSON.parse(String(options.body));
      assert.equal(body.p_id, attemptId);
      assert.equal(body.p_student_id, studentId);
      if (body.p_nervousness_rating === 5) {
        return jsonResponse({ ok: false, code: "EXAM_RECORDINGS_INCOMPLETE" });
      }
      assert.equal(body.p_nervousness_rating, 4);
      return jsonResponse({
        ok: true,
        idempotent: true,
        attempt: {
          id: attemptId,
          attempt_number: 23,
          mode_id: "p2",
          natural_exchange: false,
          manifest_version: 1,
          question_manifest: [],
          nervousness_rating: 4,
          rated_at: "2026-07-22T01:00:00Z",
          started_at: "2026-07-22T00:00:00Z",
          completed_at: "2026-07-22T01:00:00Z",
          updated_at: "2026-07-22T01:00:00Z"
        }
      });
    }
    assert.fail(`Completion must not perform a separate recording query: ${options.method || "GET"} ${parsed.pathname}`);
  };
  try {
    const completed = await worker.default.fetch(
      authorizedRequest(`/v1/exam-attempts/${attemptId}`, studentToken, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nervousness: 4 })
      }),
      configuredEnv(),
      {}
    );
    assert.equal(completed.status, 200);
    const completedBody = await completed.json();
    assert.equal(completedBody.idempotent, true);
    assert.equal(completedBody.attempt.attemptNumber, 23);
    assert.equal(completedBody.attempt.nervousness, 4);

    const incomplete = await worker.default.fetch(
      authorizedRequest(`/v1/exam-attempts/${attemptId}`, studentToken, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nervousness: 5 })
      }),
      configuredEnv(),
      {}
    );
    assert.equal(incomplete.status, 409);
    assert.equal((await incomplete.json()).code, "EXAM_RECORDINGS_INCOMPLETE");
    assert.deepEqual(calls, ["student-profile", "complete-rpc", "student-profile", "complete-rpc"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("admin can list active shared students and replace only valid speaking access", async () => {
  const adminToken = "efc88f7c-e74d-4e82-896e-08f365072180";
  const adminId = "e5e5099e-8c98-4f90-a8ae-0e39b10fdc98";
  const studentId = "9b2ec442-eded-4aef-9bc9-223ddb6890ba";
  const originalFetch = globalThis.fetch;
  let savedAccess = null;
  globalThis.fetch = async (url, options = {}) => {
    const parsed = new URL(String(url));
    if (parsed.pathname.endsWith("/rpc/speaking_admin_me")) {
      return jsonResponse([{ id: adminId, name: "Sam Admin Speaking", expires_at: "2026-07-21T00:00:00Z" }]);
    }
    if (parsed.pathname.endsWith("/rest/v1/flashcard_students")) {
      assert.equal(parsed.searchParams.get("deleted_at"), "is.null");
      if (parsed.searchParams.has("id")) assert.equal(parsed.searchParams.get("id"), `eq.${studentId}`);
      return jsonResponse([{
        id: studentId,
        name: "Alice",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-07-01T00:00:00Z"
      }]);
    }
    if (parsed.pathname.endsWith("/rest/v1/flashcard_student_state") && (options.method || "GET") === "GET") {
      assert.equal(parsed.searchParams.get("key"), "eq.speaking-access-v1");
      return jsonResponse([{
        student_id: studentId,
        value: { "exam.ielts": false },
        updated_at: "2026-07-19T00:00:00Z"
      }]);
    }
    if (parsed.pathname.endsWith("/rest/v1/flashcard_student_state") && options.method === "POST") {
      savedAccess = JSON.parse(String(options.body));
      assert.equal(savedAccess.student_id, studentId);
      assert.equal(savedAccess.key, "speaking-access-v1");
      return jsonResponse([{ ...savedAccess, updated_at: "2026-07-20T00:00:00Z" }], { status: 201 });
    }
    assert.fail(`Unexpected upstream request: ${options.method || "GET"} ${parsed.pathname}`);
  };

  try {
    const listResponse = await worker.default.fetch(
      authorizedRequest("/v1/admin/students", adminToken),
      configuredEnv(),
      {}
    );
    assert.equal(listResponse.status, 200);
    const listed = await listResponse.json();
    assert.equal(listed.students.length, 1);
    assert.equal(listed.students[0].id, studentId);
    assert.deepEqual(listed.students[0].access, { "exam.ielts": false });

    const access = {
      "exam.ielts": true,
      "ielts.part.2": true,
      "ielts.part.2.book.1": false,
      bookmarks: true
    };
    const saveResponse = await worker.default.fetch(
      authorizedRequest(`/v1/admin/students/${studentId}/access`, adminToken, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access })
      }),
      configuredEnv(),
      {}
    );
    assert.equal(saveResponse.status, 200);
    assert.deepEqual((await saveResponse.json()).access, access);
    assert.deepEqual(savedAccess.value, access);

    savedAccess = null;
    const invalidResponse = await worker.default.fetch(
      authorizedRequest(`/v1/admin/students/${studentId}/access`, adminToken, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access: { "exam.ielts": false, superuser: true } })
      }),
      configuredEnv(),
      {}
    );
    assert.equal(invalidResponse.status, 400);
    assert.equal((await invalidResponse.json()).code, "INVALID_ACCESS");
    assert.equal(savedAccess, null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("recording upload is forbidden before reservation when its speaking section is blocked", async () => {
  const studentId = "9b2ec442-eded-4aef-9bc9-223ddb6890ba";
  const studentToken = "cf384b3c-fdaf-45c2-a266-cfb29e201a48";
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    const parsed = new URL(String(url));
    if (parsed.pathname.endsWith("/rpc/speaking_student_profile")) {
      calls.push("student-profile");
      return jsonResponse([{ id: studentId, name: "Student", session_expires_at: "2026-08-20T00:00:00Z" }]);
    }
    if (parsed.pathname.endsWith("/rest/v1/flashcard_student_state")) {
      calls.push("access-get");
      return jsonResponse([{
        value: {
          "exam.ielts": true,
          "ielts.part.2": true,
          "ielts.part.2.book.1": false
        },
        updated_at: "2026-07-20T00:00:00Z"
      }]);
    }
    assert.fail(`Upload must not reach reservation or storage: ${options.method || "GET"} ${parsed.pathname}`);
  };

  try {
    const form = new FormData();
    form.append("file", new Blob([repeatFrame(40)], { type: "audio/mpeg" }), "attempt.mp3");
    form.append("exerciseId", "ielts-part2-book1-question1");
    form.append("exerciseTitle", "A useful advertisement");
    form.append("exam", "IELTS");
    form.append("part", "2");
    form.append("book", "1");
    form.append("durationMs", "1045");
    const response = await worker.default.fetch(
      authorizedRequest("/v1/recordings", studentToken, { method: "POST", body: form }),
      configuredEnv(),
      {}
    );
    assert.equal(response.status, 403);
    assert.equal((await response.json()).code, "SECTION_ACCESS_DENIED");
    assert.deepEqual(calls, ["student-profile", "access-get"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("upload reserves quota, writes the private object, then marks metadata ready", async () => {
  const studentId = "9b2ec442-eded-4aef-9bc9-223ddb6890ba";
  const studentToken = "cf384b3c-fdaf-45c2-a266-cfb29e201a48";
  const calls = [];
  let reservationPayload;
  let limiterCalls = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options = {}) => {
    assert.equal(options.redirect, "manual");
    const parsed = new URL(String(url));
    const path = parsed.pathname;
    if (path.endsWith("/rpc/speaking_student_profile")) {
      calls.push("student-profile");
      return jsonResponse([{ id: studentId, name: "Student", session_expires_at: "2026-07-20T00:00:00Z" }]);
    }
    if (path.endsWith("/rest/v1/flashcard_student_state")) {
      calls.push("access-get");
      assert.equal(parsed.searchParams.get("student_id"), `eq.${studentId}`);
      assert.equal(parsed.searchParams.get("key"), "eq.speaking-access-v1");
      return jsonResponse([]);
    }
    if (path.endsWith("/rpc/speaking_reserve_recording_attempt")) {
      calls.push("reserve");
      reservationPayload = JSON.parse(String(options.body));
      return jsonResponse({
        ok: true,
        quota: { maxFiles: 500, maxBytes: 1073741824 },
        usage: { fileCount: 1, storageBytes: reservationPayload.p_size_bytes }
      });
    }
    if (path.includes("/storage/v1/object/speaking-recordings/students/") && options.method === "POST") {
      calls.push("storage-put");
      assert.equal(options.headers.get("Content-Type"), "audio/mpeg");
      assert.equal(options.body.byteLength, reservationPayload.p_size_bytes);
      return new Response(null, { status: 200 });
    }
    if (path.endsWith("/rpc/speaking_mark_recording_ready")) {
      calls.push("mark-ready");
      const payload = JSON.parse(String(options.body));
      assert.equal(payload.p_id, reservationPayload.p_id);
      return jsonResponse({
        ok: true,
        recording: {
          id: reservationPayload.p_id,
          student_id: studentId,
          exercise_id: reservationPayload.p_exercise_id,
          exercise_title: reservationPayload.p_exercise_title,
          exam: reservationPayload.p_exam,
          part_number: reservationPayload.p_part_number,
          book_number: reservationPayload.p_book_number,
          original_filename: reservationPayload.p_original_filename,
          size_bytes: reservationPayload.p_size_bytes,
          duration_ms: reservationPayload.p_duration_ms,
          client_duration_ms: reservationPayload.p_client_duration_ms,
          created_at: "2026-07-19T12:34:56Z"
        }
      });
    }
    assert.fail(`Unexpected upstream request: ${options.method || "GET"} ${path}`);
  };

  try {
    const form = new FormData();
    const audio = repeatFrame(40);
    form.append("file", new Blob([audio], { type: "audio/mpeg" }), "attempt.mp3");
    form.append("exerciseId", "ielts-part2-book1-question1");
    form.append("exerciseTitle", "A useful advertisement");
    form.append("exam", "IELTS");
    form.append("part", "2");
    form.append("book", "1");
    form.append("durationMs", "1045");

    const response = await worker.default.fetch(
      new Request("https://worker.example/v1/recordings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${studentToken}`,
          Origin: "https://edmundeducation.github.io"
        },
        body: form
      }),
      configuredEnv({
        UPLOAD_RATE_LIMITER: {
          limit: async ({ key }) => {
            limiterCalls += 1;
            assert.equal(key, `speaking-upload:${studentId}`);
            return { success: true };
          }
        }
      }),
      {}
    );

    assert.equal(response.status, 201);
    assert.deepEqual(calls, ["student-profile", "access-get", "reserve", "storage-put", "mark-ready"]);
    assert.equal(limiterCalls, 1);
    assert.equal(reservationPayload.p_object_path, `students/${studentId}/${reservationPayload.p_id}.mp3`);
    assert.match(reservationPayload.p_sha256_hex, /^[0-9a-f]{64}$/);
    assert.equal(reservationPayload.p_crc32_value, worker.crc32(audio));
    assert.equal((await response.json()).recording.durationMs, 1045);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("an exam-slot retry returns its ready recording without a duplicate Storage write", async () => {
  const studentId = "9b2ec442-eded-4aef-9bc9-223ddb6890ba";
  const studentToken = "cf384b3c-fdaf-45c2-a266-cfb29e201a48";
  const existingId = "75f32715-93c1-4a21-b35f-65bd72c7d26d";
  const exerciseId = "exam:p2:d34db33f-3f4a-4a0e-8df2-5748f5b5bf3a:p2:q01";
  const calls = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options = {}) => {
    const path = new URL(String(url)).pathname;
    if (path.endsWith("/rpc/speaking_student_profile")) {
      calls.push("student-profile");
      return jsonResponse([{ id: studentId, name: "Student", session_expires_at: "2026-07-20T00:00:00Z" }]);
    }
    if (path.endsWith("/rest/v1/flashcard_student_state")) {
      calls.push("access-get");
      return jsonResponse([]);
    }
    if (path.endsWith("/rpc/speaking_reserve_recording_attempt")) {
      calls.push("reserve-idempotent");
      return jsonResponse({
        ok: true,
        idempotent: true,
        quota: { maxFiles: 500, maxBytes: 1073741824 },
        usage: { fileCount: 1, storageBytes: 16680 },
        recording: {
          id: existingId,
          student_id: studentId,
          exercise_id: exerciseId,
          exercise_title: "A useful advertisement",
          exam: "ielts",
          part_number: 2,
          book_number: 1,
          original_filename: "attempt.mp3",
          size_bytes: 16680,
          duration_ms: 1045,
          client_duration_ms: 1045,
          storage_state: "ready",
          created_at: "2026-07-19T12:34:56Z"
        }
      });
    }
    assert.fail(`Unexpected upstream request: ${options.method || "GET"} ${path}`);
  };
  try {
    const form = new FormData();
    form.append("file", new Blob([repeatFrame(40)], { type: "audio/mpeg" }), "attempt.mp3");
    form.append("exerciseId", exerciseId);
    form.append("exerciseTitle", "A useful advertisement");
    form.append("exam", "IELTS");
    form.append("part", "2");
    form.append("book", "1");
    form.append("durationMs", "1045");
    const response = await worker.default.fetch(
      authorizedRequest("/v1/recordings", studentToken, { method: "POST", body: form }),
      configuredEnv(),
      {}
    );
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("Location"), `https://worker.example/v1/recordings/${existingId}`);
    const body = await response.json();
    assert.equal(body.idempotent, true);
    assert.equal(body.recording.id, existingId);
    assert.deepEqual(calls, ["student-profile", "access-get", "reserve-idempotent"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("recording deletion removes the exact private object before finalizing metadata", async () => {
  const studentId = "9b2ec442-eded-4aef-9bc9-223ddb6890ba";
  const studentToken = "cf384b3c-fdaf-45c2-a266-cfb29e201a48";
  const recordingId = "75f32715-93c1-4a21-b35f-65bd72c7d26d";
  const objectPath = `students/${studentId}/${recordingId}.mp3`;
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    const parsed = new URL(String(url));
    if (parsed.pathname.endsWith("/rpc/speaking_student_profile")) {
      calls.push("student-profile");
      return jsonResponse([{ id: studentId, name: "Student", session_expires_at: "2026-08-20T00:00:00Z" }]);
    }
    if (parsed.pathname.endsWith("/rpc/speaking_begin_recording_delete")) {
      calls.push("begin-delete");
      assert.deepEqual(JSON.parse(String(options.body)), {
        p_id: recordingId,
        p_student_id: studentId
      });
      return jsonResponse({
        ok: true,
        recording: { id: recordingId, object_path: objectPath, storage_state: "deleting" }
      });
    }
    if (parsed.pathname.endsWith("/storage/v1/object/speaking-recordings")) {
      calls.push("storage-delete");
      assert.equal(options.method, "DELETE");
      assert.deepEqual(JSON.parse(String(options.body)), { prefixes: [objectPath] });
      return jsonResponse([]);
    }
    if (parsed.pathname.endsWith("/rpc/speaking_finalize_recording_delete")) {
      calls.push("finalize-delete");
      assert.deepEqual(JSON.parse(String(options.body)), { p_id: recordingId });
      return jsonResponse(true);
    }
    assert.fail(`Unexpected upstream request: ${options.method || "GET"} ${parsed.pathname}`);
  };
  try {
    const response = await worker.default.fetch(
      authorizedRequest(`/v1/recordings/${recordingId}`, studentToken, { method: "DELETE" }),
      configuredEnv(),
      {}
    );
    assert.equal(response.status, 204);
    assert.deepEqual(calls, ["student-profile", "begin-delete", "storage-delete", "finalize-delete"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("export pagination is bounded for the Cloudflare Free subrequest budget", () => {
  const env = {
    DEFAULT_EXPORT_PAGE_SIZE: "10",
    MAX_EXPORT_FILES_PER_BATCH: "40"
  };
  assert.deepEqual(worker.parseExportPage(new URL("https://example.test/v1/recordings/export"), env), {
    page: 1,
    pageSize: 10
  });
  assert.deepEqual(worker.parseExportPage(new URL("https://example.test/v1/recordings/export?page=7&pageSize=40"), env), {
    page: 7,
    pageSize: 40
  });
  assert.throws(
    () => worker.parseExportPage(new URL("https://example.test/v1/recordings/export?pageSize=41"), env),
    error => error?.code === "INVALID_EXPORT_PAGE"
  );
});

test("ZIP32 metadata has exact lengths and signatures", () => {
  const row = {
    id: "ee1d24c7-1dce-42bb-96ff-df7f7550cc35",
    object_path: "students/9b2ec442-eded-4aef-9bc9-223ddb6890ba/ee1d24c7-1dce-42bb-96ff-df7f7550cc35.mp3",
    size_bytes: 16680,
    crc32_value: 0x12345678,
    exam: "ielts",
    part_number: 2,
    book_number: 1,
    exercise_title: "A useful advertisement",
    created_at: "2026-07-19T12:34:56.000Z"
  };
  const zip = worker.prepareZip([row]);
  const entry = zip.entries[0];
  const local = worker.makeLocalHeader(entry);
  const central = worker.makeCentralHeader(entry);
  const end = worker.makeEndOfCentralDirectory(1, zip.centralSize, zip.centralOffset);

  assert.equal(new DataView(local.buffer).getUint32(0, true), 0x04034B50);
  assert.equal(new DataView(central.buffer).getUint32(0, true), 0x02014B50);
  assert.equal(new DataView(end.buffer).getUint32(0, true), 0x06054B50);
  assert.equal(zip.totalLength, local.length + row.size_bytes + central.length + end.length);
  assert.match(entry.archiveName, /^IELTS\/Part-2\/Book-01\//);
});

test("database migration keeps quota and lifecycle mutations behind locked RPCs", async () => {
  const sql = await readFile(new URL("../../../supabase-speaking-system.sql", import.meta.url), "utf8");
  assert.match(sql, /create table if not exists public\.speaking_system_settings/i);
  assert.match(sql, /pg_advisory_xact_lock\s*\(/i);
  assert.match(sql, /storage_state in \('uploading', 'ready', 'deleting'\)/i);
  assert.match(sql, /create or replace function public\.speaking_reserve_recording_attempt/i);
  assert.match(sql, /p_exercise_id like 'exam:%'[\s\S]+?RECORDING_UPLOAD_IN_PROGRESS/i);
  assert.match(sql, /create or replace function public\.speaking_finalize_recording_delete/i);
  assert.match(sql, /revoke insert, update, delete on table public\.speaking_recording_attempts\s+from service_role/i);
  assert.match(sql, /grant execute on function public\.speaking_reserve_recording_attempt[\s\S]+?to service_role/i);
  assert.match(sql, /create table if not exists public\.speaking_exam_attempts/i);
  assert.match(sql, /attempt_number bigint not null/i);
  assert.match(sql, /skipped_question_orders smallint\[\] not null default '\{\}'::smallint\[\]/i);
  assert.match(sql, /speaking_exam_attempts_student_number_uidx/i);
  assert.match(sql, /create table if not exists public\.speaking_exam_student_state/i);
  const stateDefinition = sql.match(/create table if not exists public\.speaking_exam_student_state \([\s\S]+?\n\);/i)?.[0] || "";
  assert.match(stateDefinition, /student_id uuid primary key[\s\S]+?attempt_id uuid not null[\s\S]+?attempt_number bigint not null[\s\S]+?cooldown_manifest jsonb not null/i);
  assert.doesNotMatch(stateDefinition, /mode_id|question_manifest|prompt|nervousness|rated_at|started_at|completed_at|updated_at/i);
  assert.match(sql, /attempt_id uuid not null[\s\S]+?on conflict \(student_id\) do nothing/i);
  assert.match(sql, /set cooldown_manifest = \([\s\S]+?'sourceKey'[\s\S]+?'contentKey'[\s\S]+?drop column if exists question_manifest/i);
  assert.match(sql, /revoke insert, update, delete on table public\.speaking_exam_student_state\s+from service_role/i);
  assert.match(sql, /nervousness_rating smallint[\s\S]+?between 1 and 7/i);
  assert.match(sql, /create or replace function public\.speaking_create_exam_attempt/i);
  assert.match(sql, /from public\.speaking_exam_student_state state_row[\s\S]+?jsonb_array_elements\(v_state\.cooldown_manifest\)[\s\S]+?v_attempt_number := coalesce\(v_state\.attempt_number, 0\) \+ 1/i);
  assert.match(sql, /previous_item ->> 'sourceKey'[\s\S]+?previous_item ->> 'contentKey'/i);
  assert.match(sql, /EXAM_COOLDOWN_CONFLICT/i);
  assert.match(sql, /create or replace function public\.speaking_skip_exam_question/i);
  assert.match(sql, /recording\.storage_state in \('uploading', 'ready'\)[\s\S]+?EXAM_QUESTION_HAS_RECORDING/i);
  assert.match(sql, /create or replace function public\.speaking_complete_exam_attempt/i);
  assert.match(sql, /EXAM_ATTEMPT_ALREADY_COMPLETED/i);
  assert.match(sql, /EXAM_RECORDINGS_INCOMPLETE/i);
  assert.match(sql, /question ->> 'order'\)::smallint = any\(v_attempt\.skipped_question_orders\)/i);
  assert.match(sql, /from public\.speaking_recording_attempts recording[\s\S]+?recording\.storage_state = 'ready'/i);
  assert.match(sql, /create or replace function public\.speaking_delete_exam_attempt/i);
  assert.match(sql, /left\(recording\.exercise_id, char_length\(v_recording_prefix\)\) = v_recording_prefix/i);
  assert.match(sql, /EXAM_RECORDINGS_REMAIN/i);
  assert.match(sql, /recording\.storage_state = 'deleting'[\s\S]+?limit 20[\s\S]+?'deletingRecordings'/i);
  assert.match(sql, /create or replace function public\.speaking_finalize_exam_recording_deletes/i);
  assert.match(sql, /cardinality\(p_recording_ids\) > 20[\s\S]+?recording\.storage_state <> 'deleting'/i);
  assert.match(sql, /create or replace function public\.speaking_delete_exam_attempt_if_number/i);
  assert.match(sql, /v_attempt\.attempt_number <> p_attempt_number[\s\S]+?EXAM_ATTEMPT_CHANGED/i);
  assert.match(sql, /create or replace function public\.speaking_begin_recording_delete[\s\S]+?874312[\s\S]+?RECORDING_UPLOAD_IN_PROGRESS/i);
  assert.match(sql, /revoke insert, update, delete on table public\.speaking_exam_attempts\s+from service_role/i);
  assert.match(sql, /grant execute on function public\.speaking_skip_exam_question\(uuid, uuid, integer\)\s+to service_role/i);
  assert.match(sql, /grant execute on function public\.speaking_delete_exam_attempt\(uuid, uuid\)\s+to service_role/i);
  assert.match(sql, /grant execute on function public\.speaking_finalize_exam_recording_deletes\(uuid, uuid, bigint, uuid\[\]\)\s+to service_role/i);
  assert.match(sql, /grant execute on function public\.speaking_delete_exam_attempt_if_number\(uuid, uuid, bigint\)\s+to service_role/i);
});
