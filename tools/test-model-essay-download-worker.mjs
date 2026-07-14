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

const originalFetch = globalThis.fetch;
globalThis.fetch = async url => {
  if (String(url).includes("flashcard_session_student_id")) {
    return Response.json("11111111-1111-4111-8111-111111111111");
  }
  return originalFetch(url);
};

const env = {
  ALLOWED_ORIGIN: "https://edmundeducation.com",
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_ANON_KEY: "test-publishable-key",
  SESSION_SIGNING_KEY: "test-only-signing-key-with-more-than-thirty-two-characters",
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

console.log(JSON.stringify({
  sessionStatus: sessionResponse.status,
  zipStatus: zipResponse.status,
  zipFiles: selected.length,
  zipBytes: zipStat.size,
  fileStatus: fileResponse.status,
  fileBytes: fileBytes.length,
  output
}, null, 2));
