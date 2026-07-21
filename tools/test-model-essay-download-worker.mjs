#!/usr/bin/env node

import fs from "node:fs/promises";
import { createWriteStream } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import worker from "../workers/model-essay-downloads/src/index.js";
import { CATALOG } from "../workers/model-essay-downloads/src/catalog.js";
import { READING_CATALOG } from "../workers/model-essay-downloads/src/reading-catalog.js";
import { SPEAKING_CATALOG } from "../workers/model-essay-downloads/src/speaking-catalog.js";

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
const speakingSourceFlag = process.argv.indexOf("--speaking-source");
const speakingOutputFlag = process.argv.indexOf("--speaking-output");
const speakingSource = speakingSourceFlag >= 0 ? process.argv[speakingSourceFlag + 1] : "";
const speakingOutput = speakingOutputFlag >= 0 ? process.argv[speakingOutputFlag + 1] : "";
const readingSourceFlag = process.argv.indexOf("--reading-source");
const readingOutputFlag = process.argv.indexOf("--reading-output");
const readingSource = readingSourceFlag >= 0 ? process.argv[readingSourceFlag + 1] : "";
const readingOutput = readingOutputFlag >= 0 ? process.argv[readingOutputFlag + 1] : "";
if (!source || !output) {
  throw new Error("Usage: test-model-essay-download-worker.mjs <Task 2 PDF folder> <Task 2 ZIP output> [--all] [--speaking-source <folder> --speaking-output <ZIP output>] [--reading-source <folder> --reading-output <ZIP base output>]");
}
if (Boolean(speakingSource) !== Boolean(speakingOutput)) {
  throw new Error("--speaking-source and --speaking-output must be supplied together");
}
if (Boolean(readingSource) !== Boolean(readingOutput)) {
  throw new Error("--reading-source and --reading-output must be supplied together");
}

const completionStatuses = [];
const recordedAuditTasks = [];
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
    recordedAuditTasks.push(body.p_task);
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

function localBucket(folder) {
  return {
    async head(key) {
      const bytes = await fs.readFile(path.join(folder, path.basename(key)));
      return { size: bytes.length, httpEtag: '"test-etag"' };
    },
    async get(key) {
      const bytes = await fs.readFile(path.join(folder, path.basename(key)));
      return {
        size: bytes.length,
        httpEtag: '"test-etag"',
        body: Readable.toWeb(Readable.from(bytes))
      };
    }
  };
}

function sharedAssetBucket() {
  return {
    async head(key) {
      const object = await this.get(key);
      return object ? { size: object.size, httpEtag: object.httpEtag } : null;
    },
    async get(key) {
      const value = String(key);
      const folder = value.startsWith("IELTS Speaking All Parts/")
        ? speakingSource
        : value.startsWith("IELTS Reading/")
          ? readingSource
          : "";
      if (!folder) return null;
      const bytes = await fs.readFile(path.join(folder, path.basename(value)));
      return {
        size: bytes.length,
        httpEtag: '"test-etag"',
        body: Readable.toWeb(Readable.from(bytes))
      };
    }
  };
}

const env = {
  ALLOWED_ORIGIN: "https://edmundeducation.com",
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_ANON_KEY: "test-publishable-key",
  SESSION_SIGNING_KEY: "test-only-signing-key-with-more-than-thirty-two-characters",
  MODEL_ESSAY_SERVICE_SECRET: "test-only-audit-key-with-more-than-thirty-two-characters",
  ADMIN_LOGIN_RATE_LIMITER: {
    async limit() { return { success: true }; }
  },
  ESSAYS: localBucket(source),
  SPEAKING_ASSETS: speakingSource || readingSource ? sharedAssetBucket() : null
};

const background = [];
const ctx = { waitUntil(promise) { background.push(promise); } };

const expectedReadingCounts = Object.fromEntries(
  [1, 2, 3].map(passage => [`reading-passage-${passage}`, READING_CATALOG[`passage-${passage}`].length])
);
const healthResponse = await worker.fetch(
  new Request("https://downloads.edmundeducation.com/v1/health"),
  env,
  ctx
);
const health = await healthResponse.json();
const expectedFileCount = CATALOG.length + SPEAKING_CATALOG.length
  + Object.values(expectedReadingCounts).reduce((sum, count) => sum + count, 0);
if (healthResponse.status !== 200
  || health.files !== expectedFileCount
  || Object.entries(expectedReadingCounts).some(([key, count]) => health.collections?.[key] !== count)) {
  throw new Error(`Health catalog counts are incorrect: ${JSON.stringify(health)}`);
}

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

let speakingResult = null;
if (speakingSource) {
  const unconfirmedSpeakingRequest = new Request("https://downloads.edmundeducation.com/v1/speaking/zip", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Origin": env.ALLOWED_ORIGIN
    },
    body: new URLSearchParams({
      ids: JSON.stringify(SPEAKING_CATALOG.map(item => item.id)),
      all: "0",
      confirmAll: "0",
      downloadToken
    })
  });
  const unconfirmedSpeakingResponse = await worker.fetch(unconfirmedSpeakingRequest, env, ctx);
  if (unconfirmedSpeakingResponse.status !== 400) {
    throw new Error(`Unconfirmed full Speaking catalog was not rejected: ${unconfirmedSpeakingResponse.status}`);
  }

  const speakingSelected = SPEAKING_CATALOG.slice(0, 11);
  const selectedSpeakingOutput = speakingOutput.replace(/\.zip$/i, "-selected.zip");
  const selectedSpeakingRequest = new Request("https://downloads.edmundeducation.com/v1/speaking/zip", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Origin": env.ALLOWED_ORIGIN
    },
    body: new URLSearchParams({
      ids: JSON.stringify(speakingSelected.map(item => item.id)),
      filename: "speaking-selected-test.zip",
      all: "0",
      confirmAll: "0",
      downloadToken
    })
  });
  const selectedSpeakingResponse = await worker.fetch(selectedSpeakingRequest, env, ctx);
  if (selectedSpeakingResponse.status !== 200) {
    throw new Error(`Selected Speaking ZIP failed: ${selectedSpeakingResponse.status}`);
  }
  await pipeline(Readable.fromWeb(selectedSpeakingResponse.body), createWriteStream(selectedSpeakingOutput));
  await Promise.all(background);

  const allSpeakingRequest = new Request("https://downloads.edmundeducation.com/v1/speaking/zip", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Origin": env.ALLOWED_ORIGIN
    },
    body: new URLSearchParams({
      ids: JSON.stringify(SPEAKING_CATALOG.map(item => item.id)),
      filename: "Edmund-IELTS-Speaking-All-Parts.zip",
      all: "1",
      confirmAll: "1",
      downloadToken
    })
  });
  const allSpeakingResponse = await worker.fetch(allSpeakingRequest, env, ctx);
  if (allSpeakingResponse.status !== 200) {
    throw new Error(`All Speaking ZIP failed: ${allSpeakingResponse.status}`);
  }
  await pipeline(Readable.fromWeb(allSpeakingResponse.body), createWriteStream(speakingOutput));
  await Promise.all(background);
  const allSpeakingStat = await fs.stat(speakingOutput);
  if (Number(allSpeakingResponse.headers.get("content-length")) !== allSpeakingStat.size) {
    throw new Error("Speaking ZIP Content-Length did not match streamed bytes");
  }

  const speakingFileRequest = new Request(`https://downloads.edmundeducation.com/v1/speaking/files/${SPEAKING_CATALOG[0].id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Origin": env.ALLOWED_ORIGIN
    },
    body: new URLSearchParams({ downloadToken })
  });
  const speakingFileResponse = await worker.fetch(speakingFileRequest, env, ctx);
  if (speakingFileResponse.status !== 200) {
    throw new Error(`Speaking single file failed: ${speakingFileResponse.status}`);
  }
  const speakingFileBytes = new Uint8Array(await speakingFileResponse.arrayBuffer());
  if (speakingFileBytes.length !== SPEAKING_CATALOG[0].bytes) {
    throw new Error("Speaking single-file byte count did not match catalog");
  }
  await Promise.all(background);

  if (!recordedAuditTasks.includes("speaking")) {
    throw new Error("Speaking downloads were not recorded with the speaking audit task");
  }
  speakingResult = {
    selectedZipStatus: selectedSpeakingResponse.status,
    selectedZipFiles: speakingSelected.length,
    selectedZipOutput: selectedSpeakingOutput,
    allZipStatus: allSpeakingResponse.status,
    allZipFiles: SPEAKING_CATALOG.length,
    allZipBytes: allSpeakingStat.size,
    allZipOutput: speakingOutput,
    fileStatus: speakingFileResponse.status,
    fileBytes: speakingFileBytes.length,
    unconfirmedAllStatus: unconfirmedSpeakingResponse.status
  };
}

let readingResult = null;
if (readingSource) {
  readingResult = {};
  for (const passage of [1, 2, 3]) {
    const key = `passage-${passage}`;
    const auditTask = `reading-${key}`;
    const catalog = READING_CATALOG[key];
    const endpoint = `/v1/reading/${key}`;
    if (!Array.isArray(catalog) || catalog.length <= 11) {
      throw new Error(`Reading ${key} catalog is too small for ZIP route testing`);
    }

    const unconfirmedRequest = new Request(`https://downloads.edmundeducation.com${endpoint}/zip`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Origin": env.ALLOWED_ORIGIN
      },
      body: new URLSearchParams({
        ids: JSON.stringify(catalog.map(item => item.id)),
        all: "0",
        confirmAll: "0",
        downloadToken
      })
    });
    const unconfirmedResponse = await worker.fetch(unconfirmedRequest, env, ctx);
    if (unconfirmedResponse.status !== 400) {
      throw new Error(`Unconfirmed full Reading ${key} catalog was not rejected: ${unconfirmedResponse.status}`);
    }

    const otherPassage = passage === 3 ? 1 : passage + 1;
    const crossPassageItem = READING_CATALOG[`passage-${otherPassage}`][0];
    const crossPassageResponse = await worker.fetch(new Request(
      `https://downloads.edmundeducation.com${endpoint}/files/${crossPassageItem.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Origin": env.ALLOWED_ORIGIN
        },
        body: new URLSearchParams({ downloadToken })
      }
    ), env, ctx);
    if (crossPassageResponse.status !== 404) {
      throw new Error(`Reading ${key} accepted an ID from passage ${otherPassage}: ${crossPassageResponse.status}`);
    }

    const selected = catalog.slice(0, 11);
    const selectedRequest = new Request(`https://downloads.edmundeducation.com${endpoint}/zip`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Origin": env.ALLOWED_ORIGIN
      },
      body: new URLSearchParams({
        ids: JSON.stringify(selected.map(item => item.id)),
        all: "0",
        confirmAll: "0",
        downloadToken
      })
    });
    const selectedResponse = await worker.fetch(selectedRequest, env, ctx);
    if (selectedResponse.status !== 200) {
      throw new Error(`Selected Reading ${key} ZIP failed: ${selectedResponse.status}`);
    }
    const expectedZipName = `Edmund-IELTS-Reading-Passage-${passage}.zip`;
    if (!String(selectedResponse.headers.get("content-disposition") || "").includes(expectedZipName)) {
      throw new Error(`Reading ${key} default ZIP name is incorrect`);
    }
    const selectedOutput = /\.zip$/i.test(readingOutput)
      ? readingOutput.replace(/\.zip$/i, `-${key}-selected.zip`)
      : `${readingOutput}-${key}-selected.zip`;
    await pipeline(Readable.fromWeb(selectedResponse.body), createWriteStream(selectedOutput));
    await Promise.all(background);
    const selectedStat = await fs.stat(selectedOutput);
    if (Number(selectedResponse.headers.get("content-length")) !== selectedStat.size) {
      throw new Error(`Reading ${key} ZIP Content-Length did not match streamed bytes`);
    }

    const fileRequest = new Request(`https://downloads.edmundeducation.com${endpoint}/files/${catalog[0].id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Origin": env.ALLOWED_ORIGIN
      },
      body: new URLSearchParams({ downloadToken })
    });
    const fileResponse = await worker.fetch(fileRequest, env, ctx);
    if (fileResponse.status !== 200) {
      throw new Error(`Reading ${key} single file failed: ${fileResponse.status}`);
    }
    const fileBytes = new Uint8Array(await fileResponse.arrayBuffer());
    if (fileBytes.length !== catalog[0].bytes) {
      throw new Error(`Reading ${key} single-file byte count did not match catalog`);
    }
    await Promise.all(background);

    if (!recordedAuditTasks.includes(auditTask)) {
      throw new Error(`Reading ${key} downloads were not recorded with the ${auditTask} audit task`);
    }
    readingResult[key] = {
      selectedZipStatus: selectedResponse.status,
      selectedZipFiles: selected.length,
      selectedZipBytes: selectedStat.size,
      selectedZipOutput: selectedOutput,
      fileStatus: fileResponse.status,
      fileBytes: fileBytes.length,
      unconfirmedAllStatus: unconfirmedResponse.status,
      crossPassageStatus: crossPassageResponse.status
    };
  }
}

if (!recordedAuditTasks.includes("task-2")) {
  throw new Error("Task 2 downloads were not recorded with the task-2 audit task");
}

console.log(JSON.stringify({
  healthStatus: healthResponse.status,
  healthFiles: health.files,
  healthCollections: health.collections,
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
  output,
  auditTasks: [...new Set(recordedAuditTasks)],
  speaking: speakingResult,
  reading: readingResult
}, null, 2));
