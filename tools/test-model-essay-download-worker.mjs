#!/usr/bin/env node

import fs from "node:fs/promises";
import { createWriteStream } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import worker from "../workers/model-essay-downloads/src/index.js";
import { CATALOG } from "../workers/model-essay-downloads/src/catalog.js";

globalThis.FixedLengthStream ||= class FixedLengthStream {
  constructor() {
    const stream = new TransformStream();
    this.readable = stream.readable;
    this.writable = stream.writable;
  }
};

const source = process.argv[2];
const output = process.argv[3];
const testAll = process.argv.includes("--all");
if (!source || !output) {
  throw new Error("Usage: test-model-essay-download-worker.mjs <PDF folder> <ZIP output>");
}

const completionStatuses = [];
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url, options = {}) => {
  if (String(url).includes("model_essay_admin_login")) {
    const body = JSON.parse(String(options.body || "{}"));
    if (body.p_service_secret !== "test-only-audit-key-with-more-than-thirty-two-characters") {
      return Response.json([], { status: 403 });
    }
    return Response.json([{
      admin_token: "33333333-3333-4333-8333-333333333333",
      name: "Sam Admin",
      expires_at: "2026-07-14T12:00:00Z"
    }]);
  }
  if (String(url).includes("model_essay_student_profile")) {
    return Response.json([{
      id: "11111111-1111-4111-8111-111111111111",
      ielts: true
    }]);
  }
  if (String(url).includes("model_essay_record_download")) {
    const body = JSON.parse(String(options.body || "{}"));
    if (!body.p_request_id || !Array.isArray(body.p_essay_ids)) return Response.json(null);
    return Response.json(body.p_request_id);
  }
  if (String(url).includes("model_essay_finish_download")) {
    const body = JSON.parse(String(options.body || "{}"));
    if (!body.p_request_id || !["completed", "failed"].includes(body.p_status)) return Response.json(false);
    completionStatuses.push(body.p_status);
    return Response.json(true);
  }
  return originalFetch(url, options);
};

const env = {
  ALLOWED_ORIGIN: "https://edmundeducation.com",
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_ANON_KEY: "test-publishable-key",
  SESSION_SIGNING_KEY: "test-only-signing-key-with-more-than-thirty-two-characters",
  MODEL_ESSAY_SERVICE_SECRET: "test-only-audit-key-with-more-than-thirty-two-characters",
  ADMIN_LOGIN_RATE_LIMITER: {
    async limit() { return { success: true }; }
  },
  ESSAYS: {
    async head(key) {
      const bytes = await fs.readFile(path.join(source, path.basename(key)));
      return { size: bytes.length, httpEtag: '"test-etag"' };
    },
    async get(key) {
      const bytes = await fs.readFile(path.join(source, path.basename(key)));
      return {
        size: bytes.length,
        httpEtag: '"test-etag"',
        body: Readable.toWeb(Readable.from(bytes))
      };
    }
  }
};

const background = [];
const ctx = { waitUntil(promise) { background.push(promise); } };

const oversizedSessionResponse = await worker.fetch(new Request("https://downloads.edmundeducation.com/v1/session", {
  method: "POST",
  headers: { "Content-Type": "application/json", "Origin": env.ALLOWED_ORIGIN },
  body: JSON.stringify({ padding: "x".repeat(9000) })
}), env, ctx);
if (oversizedSessionResponse.status !== 413) {
  throw new Error(`Oversized session request was not rejected: ${oversizedSessionResponse.status}`);
}

const adminRequest = new Request("https://downloads.edmundeducation.com/v1/admin/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Origin": env.ALLOWED_ORIGIN,
    "CF-Connecting-IP": "203.0.113.10"
  },
  body: JSON.stringify({ name: "Sam Admin", password: "test-admin-password" })
});
const adminResponse = await worker.fetch(adminRequest, env, ctx);
if (adminResponse.status !== 200 || !(await adminResponse.json()).admin?.admin_token) {
  throw new Error(`Admin login proxy failed: ${adminResponse.status}`);
}

const sessionRequest = new Request("https://downloads.edmundeducation.com/v1/session", {
  method: "POST",
  headers: { "Content-Type": "application/json", "Origin": env.ALLOWED_ORIGIN },
  body: JSON.stringify({
    token: "22222222-2222-4222-8222-222222222222",
    accessToken: "test-anonymous-access-token"
  })
});
const sessionResponse = await worker.fetch(sessionRequest, env, ctx);
if (sessionResponse.status !== 200) throw new Error(`Session failed: ${sessionResponse.status}`);
const cookie = sessionResponse.headers.get("set-cookie")?.split(";", 1)[0];
if (!cookie) throw new Error("Session cookie was not returned");
const downloadToken = (await sessionResponse.json()).token;
if (!downloadToken) throw new Error("Session token was not returned");

const oversizedZipResponse = await worker.fetch(new Request("https://downloads.edmundeducation.com/v1/zip", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    "Origin": env.ALLOWED_ORIGIN
  },
  body: new URLSearchParams({ downloadToken, padding: "x".repeat(33 * 1024) })
}), env, ctx);
if (oversizedZipResponse.status !== 413) {
  throw new Error(`Oversized ZIP request was not rejected: ${oversizedZipResponse.status}`);
}

const unconfirmedAllRequest = new Request("https://downloads.edmundeducation.com/v1/zip", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    "Origin": env.ALLOWED_ORIGIN
  },
  body: new URLSearchParams({
    ids: JSON.stringify(CATALOG.map(item => item.id)),
    all: "0",
    confirmAll: "0",
    downloadToken
  })
});
const unconfirmedAllResponse = await worker.fetch(unconfirmedAllRequest, env, ctx);
if (unconfirmedAllResponse.status !== 400) {
  throw new Error(`Unconfirmed full catalog was not rejected: ${unconfirmedAllResponse.status}`);
}

const selected = testAll ? [...CATALOG] : CATALOG.slice(0, 11);
const form = new URLSearchParams({
  ids: JSON.stringify(selected.map(item => item.id)),
  filename: "worker-test.zip",
  all: testAll ? "1" : "0",
  confirmAll: testAll ? "1" : "0",
  downloadToken
});
const zipRequest = new Request("https://downloads.edmundeducation.com/v1/zip", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    "Origin": env.ALLOWED_ORIGIN
  },
  body: form
});
const zipResponse = await worker.fetch(zipRequest, env, ctx);
if (zipResponse.status !== 200) throw new Error(`ZIP failed: ${zipResponse.status}`);
await pipeline(Readable.fromWeb(zipResponse.body), createWriteStream(output));
await Promise.all(background);
const zipStat = await fs.stat(output);
if (Number(zipResponse.headers.get("content-length")) !== zipStat.size) {
  throw new Error("ZIP Content-Length did not match streamed bytes");
}

const fileRequest = new Request(`https://downloads.edmundeducation.com/v1/files/${selected[0].id}`, {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    "Origin": env.ALLOWED_ORIGIN
  },
  body: new URLSearchParams({ downloadToken })
});
const fileResponse = await worker.fetch(fileRequest, env, ctx);
if (fileResponse.status !== 200) throw new Error(`Single file failed: ${fileResponse.status}`);
const fileBytes = new Uint8Array(await fileResponse.arrayBuffer());
if (fileBytes.length !== selected[0].bytes) throw new Error("Single-file byte count did not match catalog");
await Promise.all(background);
if (completionStatuses.filter(status => status === "completed").length < 2) {
  throw new Error("ZIP and single-file completion events were not recorded");
}

console.log(JSON.stringify({
  adminStatus: adminResponse.status,
  oversizedSessionStatus: oversizedSessionResponse.status,
  sessionStatus: sessionResponse.status,
  oversizedZipStatus: oversizedZipResponse.status,
  unconfirmedAllStatus: unconfirmedAllResponse.status,
  zipStatus: zipResponse.status,
  zipFiles: selected.length,
  zipBytes: zipStat.size,
  fileStatus: fileResponse.status,
  fileBytes: fileBytes.length,
  completedAudits: completionStatuses.filter(status => status === "completed").length,
  output
}, null, 2));
