#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath, pathToFileURL } from "node:url";


const toolPath = fileURLToPath(import.meta.url);
const siteRoot = path.resolve(path.dirname(toolPath), "..");
const manifestPath = path.join(siteRoot, "ielts-reading-downloads.js");
const task2ManifestPath = path.join(siteRoot, "ielts-task2-model-essays.js");
const speakingManifestPath = path.join(siteRoot, "ielts-speaking-downloads.js");
const htmlPath = path.join(siteRoot, "model-essay-downloads.html");
const clientPath = path.join(siteRoot, "model-essay-downloads.js");
const workerPath = path.join(siteRoot, "workers", "model-essay-downloads", "src", "index.js");
const workerCatalogPath = path.join(
  siteRoot,
  "workers",
  "model-essay-downloads",
  "src",
  "reading-catalog.js"
);

const expectedPassages = Object.freeze({
  1: Object.freeze({
    count: 163,
    max: 164,
    missing: Object.freeze([33]),
    bytes: 266068628,
    pages: 1281
  }),
  2: Object.freeze({
    count: 149,
    max: 174,
    missing: Object.freeze([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
      13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 49, 55
    ]),
    bytes: 253169207,
    pages: 856
  }),
  3: Object.freeze({
    count: 165,
    max: 175,
    missing: Object.freeze([1, 10, 11, 12, 13, 18, 21, 24, 25, 26]),
    bytes: 353009670,
    pages: 985
  })
});
const expectedTotal = Object.values(expectedPassages).reduce((sum, value) => sum + value.count, 0);
const expectedTotalBytes = Object.values(expectedPassages).reduce((sum, value) => sum + value.bytes, 0);
const expectedTotalPages = Object.values(expectedPassages).reduce((sum, value) => sum + value.pages, 0);

function fail(message) {
  throw new Error(message);
}

function sameValues(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

function expectedNumbers(spec) {
  const missing = new Set(spec.missing);
  return Array.from({ length: spec.max }, (_, index) => index + 1).filter(number => !missing.has(number));
}

async function loadBrowserManifests() {
  const context = { window: {} };
  for (const filename of [task2ManifestPath, speakingManifestPath, manifestPath]) {
    vm.runInNewContext(await fs.readFile(filename, "utf8"), context, { filename });
  }
  return context.window;
}

const browserData = await loadBrowserManifests();
const files = Array.from(browserData.EDMUND_IELTS_READING_DOWNLOADS || []);
const task2Files = Array.from(browserData.EDMUND_MODEL_ESSAYS || []);
const speakingFiles = Array.from(browserData.EDMUND_IELTS_SPEAKING_DOWNLOADS || []);
const meta = browserData.EDMUND_IELTS_READING_META || {};
const importedWorkerCatalog = await import(`${pathToFileURL(workerCatalogPath).href}?test=${Date.now()}`);
const workerCatalog = importedWorkerCatalog.READING_CATALOG;

if (!Array.isArray(browserData.EDMUND_IELTS_READING_DOWNLOADS)) {
  fail("ielts-reading-downloads.js must define window.EDMUND_IELTS_READING_DOWNLOADS");
}
if (!browserData.EDMUND_IELTS_READING_META || typeof browserData.EDMUND_IELTS_READING_META !== "object") {
  fail("ielts-reading-downloads.js must define window.EDMUND_IELTS_READING_META");
}
if (!workerCatalog || typeof workerCatalog !== "object" || Array.isArray(workerCatalog)) {
  fail("reading-catalog.js must export a READING_CATALOG object");
}

const expectedWorkerKeys = ["passage-1", "passage-2", "passage-3"];
if (!sameValues(Object.keys(workerCatalog).sort(), expectedWorkerKeys)) {
  fail(`Worker catalog keys are incorrect: ${Object.keys(workerCatalog).sort().join(", ")}`);
}
if (files.length !== expectedTotal || Number(meta.total) !== expectedTotal) {
  fail(`Expected ${expectedTotal} Reading records; got client=${files.length}, meta=${meta.total}`);
}

const clientById = new Map();
const totals = { bytes: 0, pages: 0 };
const passageTotals = Object.fromEntries(
  [1, 2, 3].map(passage => [passage, { bytes: 0, pages: 0 }])
);
const filenamePattern = /^Practice (\d+)(?: - |  |- | )IETLS 閱讀練習 - Passage ([123])\.pdf$/;

for (const item of files) {
  if (!item || typeof item !== "object") fail("Reading client catalog contains a non-object record");
  const filenameMatch = String(item.filename || "").match(filenamePattern);
  if (!filenameMatch) fail(`Unexpected IELTS Reading filename: ${item.filename}`);

  const filenameNumber = Number(filenameMatch[1]);
  const filenamePassage = Number(filenameMatch[2]);
  if (!Number.isInteger(item.number) || item.number !== filenameNumber) {
    fail(`Practice number does not match filename: ${item.filename}`);
  }
  if (item.passage !== filenamePassage) fail(`Passage does not match filename: ${item.filename}`);
  if (item.category !== `passage-${item.passage}`
    || item.categoryLabel !== `Passage ${item.passage}`
    || item.categoryOrder !== item.passage) {
    fail(`Category metadata is incorrect for ${item.filename}`);
  }
  if (item.problem !== false) fail(`Problem flag must be false for ${item.filename}`);
  if (typeof item.title !== "string" || !item.title.trim()) fail(`Passage title is blank for ${item.filename}`);
  if (!Number.isInteger(item.pages) || item.pages < 1) fail(`Invalid page count for ${item.filename}`);
  if (!Number.isInteger(item.bytes) || item.bytes < 1) fail(`Invalid byte count for ${item.filename}`);

  const expectedId = crypto.createHash("sha256").update(item.filename, "utf8").digest("hex").slice(0, 16);
  if (item.id !== expectedId || !/^[0-9a-f]{16}$/.test(String(item.id))) {
    fail(`Invalid SHA-derived ID for ${item.filename}`);
  }
  if (clientById.has(item.id)) fail(`Duplicate Reading catalog ID: ${item.id}`);
  clientById.set(item.id, item);

  const expectedThumbnail = `assets/ielts-reading/thumbnails/${item.id}.webp`;
  if (item.thumbnail !== expectedThumbnail) fail(`Unexpected thumbnail path for ${item.filename}`);
  const thumbnailBytes = await fs.readFile(path.join(siteRoot, item.thumbnail));
  if (thumbnailBytes.length < 1000
    || thumbnailBytes.subarray(0, 4).toString("ascii") !== "RIFF"
    || thumbnailBytes.subarray(8, 12).toString("ascii") !== "WEBP") {
    fail(`Missing, empty, or invalid WebP thumbnail: ${item.thumbnail}`);
  }

  totals.bytes += item.bytes;
  totals.pages += item.pages;
  passageTotals[item.passage].bytes += item.bytes;
  passageTotals[item.passage].pages += item.pages;
}

const everyId = [...task2Files, ...speakingFiles, ...files].map(item => item.id);
if (new Set(everyId).size !== everyId.length) {
  fail("Reading IDs collide with Task 2, Speaking, or another Reading record");
}

for (const passage of [1, 2, 3]) {
  const spec = expectedPassages[passage];
  const category = `passage-${passage}`;
  const passageFiles = files
    .filter(item => item.passage === passage)
    .sort((left, right) => left.number - right.number);
  const actualNumbers = passageFiles.map(item => item.number);
  const expected = expectedNumbers(spec);

  if (passageFiles.length !== spec.count || !sameValues(actualNumbers, expected)) {
    fail(`Passage ${passage} practice-number inventory is incorrect`);
  }
  if (Number(meta.categoryCounts?.[category]) !== spec.count) {
    fail(`Meta count is incorrect for ${category}`);
  }
  if (passageTotals[passage].bytes !== spec.bytes
    || passageTotals[passage].pages !== spec.pages
    || Number(meta.passageBytes?.[category]) !== spec.bytes
    || Number(meta.passagePages?.[category]) !== spec.pages) {
    fail(`Byte or page totals are incorrect for ${category}`);
  }

  const workerFiles = workerCatalog[category];
  if (!Array.isArray(workerFiles) || workerFiles.length !== spec.count) {
    fail(`Worker catalog count is incorrect for ${category}`);
  }
  const workerIds = new Set();
  for (const workerItem of workerFiles) {
    const clientItem = clientById.get(workerItem.id);
    if (!clientItem || clientItem.passage !== passage) {
      fail(`Worker-only or cross-passage ID in ${category}: ${workerItem.id}`);
    }
    if (workerIds.has(workerItem.id)) fail(`Duplicate Worker ID in ${category}: ${workerItem.id}`);
    workerIds.add(workerItem.id);
    if (workerItem.filename !== clientItem.filename || workerItem.bytes !== clientItem.bytes) {
      fail(`Client/Worker mismatch for ${workerItem.id}`);
    }
    if (workerItem.key !== `IELTS Reading/${workerItem.filename}`) {
      fail(`Incorrect R2 key for ${workerItem.filename}`);
    }
    if (!Number.isInteger(workerItem.crc32)
      || workerItem.crc32 < 0
      || workerItem.crc32 > 0xFFFFFFFF) {
      fail(`Invalid CRC-32 for ${workerItem.filename}`);
    }
  }
  if (workerIds.size !== passageFiles.length
    || passageFiles.some(item => !workerIds.has(item.id))) {
    fail(`Client and Worker IDs differ for ${category}`);
  }
}

if (totals.bytes !== expectedTotalBytes
  || totals.pages !== expectedTotalPages
  || Number(meta.totalBytes) !== expectedTotalBytes
  || Number(meta.totalPages) !== expectedTotalPages) {
  fail("Reading manifest aggregate byte or page totals are incorrect");
}

const html = await fs.readFile(htmlPath, "utf8");
const client = await fs.readFile(clientPath, "utf8");
const worker = await fs.readFile(workerPath, "utf8");
for (const passage of [1, 2, 3]) {
  const catalogKey = `reading-passage-${passage}`;
  if (!html.includes(`data-open-catalog="${catalogKey}"`)) {
    fail(`IELTS Reading Passage ${passage} chooser card is missing`);
  }
  const endpointPattern = new RegExp(`endpointPrefix\\s*:\\s*["']\\/reading\\/passage-${passage}["']`);
  if (!endpointPattern.test(client)) fail(`Client endpoint prefix is missing for Passage ${passage}`);
}
if (!html.includes('<script src="ielts-reading-downloads.js"></script>')) {
  fail("IELTS Reading manifest script is missing from the portal");
}
if (html.indexOf("ielts-reading-downloads.js") > html.indexOf("model-essay-downloads.js")) {
  fail("IELTS Reading manifest must load before the portal client");
}
if (!client.includes("EDMUND_IELTS_READING_DOWNLOADS")
  || !client.includes("EDMUND_IELTS_READING_META")) {
  fail("Portal client does not load the IELTS Reading manifest globals");
}
if (!worker.includes("READING_CATALOG")
  || !worker.includes("/v1\\/reading\\/(passage-[123])\\/files\\/")
  || !worker.includes("/v1\\/reading\\/(passage-[123])\\/zip")) {
  fail("Worker Reading file or ZIP routes are missing");
}

console.log(JSON.stringify({
  files: files.length,
  passages: meta.categoryCounts,
  totalBytes: totals.bytes,
  totalPages: totals.pages,
  titles: files.filter(item => item.title.trim()).length,
  thumbnails: files.length,
  workerRecords: Object.values(workerCatalog).reduce((sum, items) => sum + items.length, 0),
  portalCards: 3,
  portalRoutes: [1, 2, 3].flatMap(passage => [
    `/v1/reading/passage-${passage}/files/:id`,
    `/v1/reading/passage-${passage}/zip`
  ])
}, null, 2));
