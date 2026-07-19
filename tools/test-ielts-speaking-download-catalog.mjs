#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath, pathToFileURL } from "node:url";


const toolPath = fileURLToPath(import.meta.url);
const siteRoot = path.resolve(path.dirname(toolPath), "..");
const manifestPath = path.join(siteRoot, "ielts-speaking-downloads.js");
const task2ManifestPath = path.join(siteRoot, "ielts-task2-model-essays.js");
const htmlPath = path.join(siteRoot, "model-essay-downloads.html");
const clientPath = path.join(siteRoot, "model-essay-downloads.js");
const workerCatalogPath = path.join(
  siteRoot,
  "workers",
  "model-essay-downloads",
  "src",
  "speaking-catalog.js"
);

const context = { window: {} };
vm.runInNewContext(await fs.readFile(task2ManifestPath, "utf8"), context, { filename: task2ManifestPath });
vm.runInNewContext(await fs.readFile(manifestPath, "utf8"), context, { filename: manifestPath });
const files = Array.from(context.window.EDMUND_IELTS_SPEAKING_DOWNLOADS || []);
const task2Files = Array.from(context.window.EDMUND_MODEL_ESSAYS || []);
const meta = context.window.EDMUND_IELTS_SPEAKING_META || {};
const { SPEAKING_CATALOG: workerFiles } = await import(`${pathToFileURL(workerCatalogPath).href}?test=${Date.now()}`);

function fail(message) {
  throw new Error(message);
}

if (files.length !== 46 || workerFiles.length !== 46 || meta.total !== 46) {
  fail(`Expected 46 records in both catalogs and meta; got client=${files.length}, worker=${workerFiles.length}, meta=${meta.total}`);
}
if (new Set([...task2Files, ...files].map(item => item.id)).size !== task2Files.length + files.length) {
  fail("Speaking IDs collide with existing Task 2 IDs");
}

const expectedBooks = {
  1: Array.from({ length: 14 }, (_, index) => index + 1),
  2: Array.from({ length: 16 }, (_, index) => index + 1),
  3: Array.from({ length: 16 }, (_, index) => index + 1)
};
const clientById = new Map();
let totalBytes = 0;
let totalPages = 0;

for (const item of files) {
  const expectedId = crypto.createHash("sha256").update(item.filename, "utf8").digest("hex").slice(0, 16);
  if (item.id !== expectedId || !/^[0-9a-f]{16}$/.test(item.id)) fail(`Invalid ID for ${item.filename}`);
  if (clientById.has(item.id)) fail(`Duplicate ID ${item.id}`);
  clientById.set(item.id, item);
  totalBytes += Number(item.bytes);
  totalPages += Number(item.pages);

  const thumbnail = path.join(siteRoot, item.thumbnail);
  const thumbnailStat = await fs.stat(thumbnail);
  if (!thumbnailStat.isFile() || thumbnailStat.size < 1000) fail(`Missing or empty thumbnail: ${item.thumbnail}`);
}

for (const [partText, expected] of Object.entries(expectedBooks)) {
  const part = Number(partText);
  const actual = files.filter(item => item.part === part).map(item => item.book).sort((a, b) => a - b);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) fail(`Book range mismatch for Part ${part}`);
  if (meta.categoryCounts?.[`part-${part}`] !== expected.length) fail(`Meta count mismatch for Part ${part}`);
}

if (Number(meta.totalBytes) !== totalBytes || Number(meta.totalPages) !== totalPages) {
  fail("Manifest totals do not match the catalog records");
}

for (const workerItem of workerFiles) {
  const clientItem = clientById.get(workerItem.id);
  if (!clientItem) fail(`Worker-only ID ${workerItem.id}`);
  if (workerItem.filename !== clientItem.filename || workerItem.bytes !== clientItem.bytes) {
    fail(`Client/Worker mismatch for ${workerItem.id}`);
  }
  if (workerItem.key !== `IELTS Speaking All Parts/${workerItem.filename}`) {
    fail(`Incorrect R2 key for ${workerItem.filename}`);
  }
  if (!Number.isInteger(workerItem.crc32) || workerItem.crc32 < 0 || workerItem.crc32 > 0xFFFFFFFF) {
    fail(`Invalid CRC-32 for ${workerItem.filename}`);
  }
}

const html = await fs.readFile(htmlPath, "utf8");
const client = await fs.readFile(clientPath, "utf8");
if (!html.includes('data-open-catalog="speaking"')) fail("Speaking chooser card is missing");
if (!html.includes('<script src="ielts-speaking-downloads.js"></script>')) fail("Speaking manifest script is missing");
if (html.indexOf('ielts-speaking-downloads.js') > html.indexOf('model-essay-downloads.js')) {
  fail("Speaking manifest must load before the portal client");
}
if (!client.includes('endpointPrefix: "/speaking"') || !client.includes('Speaking Part 1')) {
  fail("Speaking catalog configuration is missing from the portal client");
}

console.log(JSON.stringify({
  files: files.length,
  parts: meta.categoryCounts,
  totalBytes,
  totalPages,
  thumbnails: files.length,
  workerRecords: workerFiles.length,
  portalCard: true,
  portalRoutes: ["/v1/speaking/files/:id", "/v1/speaking/zip"]
}, null, 2));
