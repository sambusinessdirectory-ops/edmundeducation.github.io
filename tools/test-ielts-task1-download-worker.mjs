#!/usr/bin/env node

import fs from "node:fs/promises";
import { createWriteStream } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import worker from "../workers/model-essay-downloads/src/index.js";
import { TASK1_CATALOG } from "../workers/model-essay-downloads/src/task1-catalog.js";


globalThis.FixedLengthStream ||= class FixedLengthStream {
  constructor() {
    const stream = new TransformStream();
    this.readable = stream.readable;
    this.writable = stream.writable;
  }
};

const source = process.argv[2];
const secondSource = process.argv[3];
const thirdSource = process.argv[4];
const legacyVariantSource = process.argv[5];
const selectedOutput = process.argv[6];
const allOutput = process.argv[7];
if (!source || !secondSource || !thirdSource || !legacyVariantSource || !selectedOutput || !allOutput) {
  throw new Error(
    "Usage: test-ielts-task1-download-worker.mjs <first Task 1 PDF folder> " +
    "<second Task 1 PDF folder> <Table batch folder> <legacy variants folder> " +
    "<selected ZIP output> <all ZIP output>"
  );
}

const completed = [];
const auditTasks = [];
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url, options = {}) => {
  if (String(url).includes("model_essay_student_profile")) {
    return Response.json([{
      id: "11111111-1111-4111-8111-111111111111",
      ielts: true
    }]);
  }
  if (String(url).includes("model_essay_record_download")) {
    const body = JSON.parse(String(options.body || "{}"));
    auditTasks.push(body.p_task);
    return Response.json(body.p_request_id);
  }
  if (String(url).includes("model_essay_finish_download")) {
    const body = JSON.parse(String(options.body || "{}"));
    completed.push(body.p_status);
    return Response.json(true);
  }
  return originalFetch(url, options);
};

function task1Bucket(firstFolder, secondFolder, thirdFolder, legacyFolder) {
  function localPath(key) {
    const value = String(key);
    const filename = path.basename(value);
    const legacyVariants = new Set([
      "Model Essay 5 - IELTS - Pie Charts - (Band 9 示範) - Task 1-1.pdf",
      "Model Essay 8 - IELTS - Process Diagram - (Band 9 示範) - Task 1.pdf"
    ]);
    const folder = value.startsWith(
      "IELTS Writing Task 1/IELTS Writing Task 2 - Second Batch/"
    )
      ? secondFolder
      : value.startsWith("IELTS Writing Task 1/IELTS Writing Task 1 - Tables Batch 3/")
        ? thirdFolder
        : legacyVariants.has(filename)
          ? legacyFolder
          : firstFolder;
    return path.join(folder, filename);
  }

  return {
    async head(key) {
      const bytes = await fs.readFile(localPath(key));
      return { size: bytes.length, httpEtag: '"task1-test"' };
    },
    async get(key) {
      if (!String(key).startsWith("IELTS Writing Task 1/")) return null;
      const bytes = await fs.readFile(localPath(key));
      return {
        size: bytes.length,
        httpEtag: '"task1-test"',
        body: Readable.toWeb(Readable.from(bytes))
      };
    }
  };
}

const assets = task1Bucket(source, secondSource, thirdSource, legacyVariantSource);
const env = {
  ALLOWED_ORIGIN: "https://edmundeducation.com",
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_ANON_KEY: "test-publishable-key",
  SESSION_SIGNING_KEY: "test-only-signing-key-with-more-than-thirty-two-characters",
  MODEL_ESSAY_SERVICE_SECRET: "test-only-audit-key-with-more-than-thirty-two-characters",
  ADMIN_LOGIN_RATE_LIMITER: { async limit() { return { success: true }; } },
  ESSAYS: assets,
  SPEAKING_ASSETS: assets
};

const background = [];
const ctx = { waitUntil(promise) { background.push(promise); } };
const origin = env.ALLOWED_ORIGIN;

const healthResponse = await worker.fetch(
  new Request("https://downloads.edmundeducation.com/v1/health"),
  env,
  ctx
);
const health = await healthResponse.json();
if (healthResponse.status !== 200 || health.collections?.task1 !== TASK1_CATALOG.length) {
  throw new Error(`Task 1 health count is incorrect: ${JSON.stringify(health)}`);
}

const sessionResponse = await worker.fetch(new Request(
  "https://downloads.edmundeducation.com/v1/session",
  {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify({
      token: "22222222-2222-4222-8222-222222222222",
      accessToken: "test-anonymous-access-token"
    })
  }
), env, ctx);
if (sessionResponse.status !== 200) throw new Error(`Session failed: ${sessionResponse.status}`);
const downloadToken = (await sessionResponse.json()).token;

const tableEntries = TASK1_CATALOG.filter(item => item.filename.includes(" - IELTS - Tables - "));
if (tableEntries.length !== 11) throw new Error(`Expected 11 Table records, found ${tableEntries.length}`);
const first = tableEntries.find(item => /^Model Essay 11\b/.test(item.filename));
if (!first) throw new Error("Table 11 worker sentinel is missing");
const fileResponse = await worker.fetch(new Request(
  `https://downloads.edmundeducation.com/v1/task1/files/${first.id}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Origin: origin },
    body: new URLSearchParams({ downloadToken })
  }
), env, ctx);
if (fileResponse.status !== 200) throw new Error(`Single Task 1 file failed: ${fileResponse.status}`);
const fileBytes = new Uint8Array(await fileResponse.arrayBuffer());
if (fileBytes.length !== first.bytes) throw new Error("Task 1 single-file byte count mismatch");

async function writeZip(items, output, all) {
  const response = await worker.fetch(new Request(
    "https://downloads.edmundeducation.com/v1/task1/zip",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Origin: origin },
      body: new URLSearchParams({
        ids: JSON.stringify(items.map(item => item.id)),
        filename: path.basename(output),
        all: all ? "1" : "0",
        confirmAll: all ? "1" : "0",
        downloadToken
      })
    }
  ), env, ctx);
  if (response.status !== 200) throw new Error(`Task 1 ZIP failed: ${response.status}`);
  await pipeline(Readable.fromWeb(response.body), createWriteStream(output));
  const stat = await fs.stat(output);
  if (Number(response.headers.get("content-length")) !== stat.size) {
    throw new Error("Task 1 ZIP Content-Length mismatch");
  }
  return stat.size;
}

const selectedSize = await writeZip(tableEntries, selectedOutput, false);
const allSize = await writeZip(TASK1_CATALOG, allOutput, true);
await Promise.all(background);

if (completed.filter(status => status === "completed").length < 3) {
  throw new Error("Task 1 single, selected ZIP and all ZIP audit completions were not recorded");
}
if (auditTasks.some(task => task !== "task-1")) {
  throw new Error(`Unexpected Task 1 audit task values: ${JSON.stringify(auditTasks)}`);
}

console.log(JSON.stringify({
  files: TASK1_CATALOG.length,
  singleBytes: fileBytes.length,
  selectedZipBytes: selectedSize,
  allZipBytes: allSize,
  routes: ["/v1/task1/files/:id", "/v1/task1/zip"],
  auditTask: "task-1"
}, null, 2));
