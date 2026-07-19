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
  parseExportPage,
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

function repeatFrame(count) {
  const frame = mpeg1Layer3Frame();
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
  assert.equal(worker.maxDurationMs({}), 150000);
  assert.equal(worker.maxUploadBytes({ MAX_UPLOAD_BYTES: "not-a-number" }), 3 * 1024 * 1024);
  assert.equal(worker.maxDurationMs({ MAX_DURATION_MS: "999999999" }), 150000);
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
  assert.equal(health.maxDurationMs, 150000);
  assert.deepEqual(health.rateLimiters, { adminLogin: true, upload: true });
});

test("upload reserves quota, writes the private object, then marks metadata ready", async () => {
  const studentId = "9b2ec442-eded-4aef-9bc9-223ddb6890ba";
  const studentToken = "cf384b3c-fdaf-45c2-a266-cfb29e201a48";
  const calls = [];
  let reservationPayload;
  let limiterCalls = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options = {}) => {
    const parsed = new URL(String(url));
    const path = parsed.pathname;
    if (path.endsWith("/rpc/speaking_student_profile")) {
      calls.push("student-profile");
      return jsonResponse([{ id: studentId, name: "Student", session_expires_at: "2026-07-20T00:00:00Z" }]);
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
    assert.deepEqual(calls, ["student-profile", "reserve", "storage-put", "mark-ready"]);
    assert.equal(limiterCalls, 1);
    assert.equal(reservationPayload.p_object_path, `students/${studentId}/${reservationPayload.p_id}.mp3`);
    assert.match(reservationPayload.p_sha256_hex, /^[0-9a-f]{64}$/);
    assert.equal(reservationPayload.p_crc32_value, worker.crc32(audio));
    assert.equal((await response.json()).recording.durationMs, 1045);
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
  assert.match(sql, /create or replace function public\.speaking_finalize_recording_delete/i);
  assert.match(sql, /revoke insert, update, delete on table public\.speaking_recording_attempts\s+from service_role/i);
  assert.match(sql, /grant execute on function public\.speaking_reserve_recording_attempt[\s\S]+?to service_role/i);
});
