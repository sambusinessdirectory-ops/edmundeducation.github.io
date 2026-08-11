#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath, pathToFileURL } from "node:url";


const toolPath = fileURLToPath(import.meta.url);
const siteRoot = path.resolve(path.dirname(toolPath), "..");
const manifestPath = path.join(siteRoot, "ielts-listening-downloads.js");
const workerCatalogPath = path.join(siteRoot, "workers", "model-essay-downloads", "src", "listening-catalog.js");
const htmlPath = path.join(siteRoot, "model-essay-downloads.html");
const clientPath = path.join(siteRoot, "model-essay-downloads.js");
const workerPath = path.join(siteRoot, "workers", "model-essay-downloads", "src", "index.js");
const existingManifestPaths = [
  "dse-writing-part-a-downloads.js",
  "ielts-task1-downloads.js",
  "ielts-task2-model-essays.js",
  "ielts-speaking-downloads.js",
  "ielts-reading-downloads.js"
].map(filename => path.join(siteRoot, filename));

const EXPECTED_TOTAL = 20;
const EXPECTED_BYTES = 55_184_699;
const EXPECTED_PAGES = 1_401;
const R2_PREFIX = "IELTS Listening - Practice Papers";

function fail(message) {
  throw new Error(message);
}

function expectedFilename(number) {
  return number === 1
    ? "IELTS Listening - Practice 1.pdf"
    : `IELTS Listening - Practice - ${number}.pdf`;
}

const context = { window: {} };
for (const filename of [...existingManifestPaths, manifestPath]) {
  vm.runInNewContext(await fs.readFile(filename, "utf8"), context, { filename });
}

const files = Array.from(context.window.EDMUND_IELTS_LISTENING_DOWNLOADS || []);
const meta = context.window.EDMUND_IELTS_LISTENING_META || {};
const { LISTENING_CATALOG: workerFiles } = await import(`${pathToFileURL(workerCatalogPath).href}?test=${Date.now()}`);

if (files.length !== EXPECTED_TOTAL || workerFiles.length !== EXPECTED_TOTAL || meta.total !== EXPECTED_TOTAL) {
  fail(`Expected ${EXPECTED_TOTAL} Listening records; got client=${files.length}, worker=${workerFiles.length}, meta=${meta.total}`);
}

const expectedNumbers = Array.from({ length: EXPECTED_TOTAL }, (_, index) => index + 1);
const actualNumbers = files.map(item => item.number).sort((left, right) => left - right);
if (JSON.stringify(actualNumbers) !== JSON.stringify(expectedNumbers)) {
  fail(`Listening practice-number inventory is incorrect: ${actualNumbers.join(", ")}`);
}

const existingIds = [
  ...(context.window.EDMUND_DSE_WRITING_PART_A_DOWNLOADS || []),
  ...(context.window.EDMUND_IELTS_TASK1_DOWNLOADS || []),
  ...(context.window.EDMUND_MODEL_ESSAYS || []),
  ...(context.window.EDMUND_IELTS_SPEAKING_DOWNLOADS || []),
  ...(context.window.EDMUND_IELTS_READING_DOWNLOADS || [])
].map(item => item.id);
const listeningIds = files.map(item => item.id);
if (new Set([...existingIds, ...listeningIds]).size !== existingIds.length + listeningIds.length) {
  fail("Listening IDs collide with an existing download catalog or another Listening record");
}

const clientById = new Map();
const thumbnailHashes = new Set();
let totalBytes = 0;
let totalPages = 0;
for (const item of files) {
  const expectedName = expectedFilename(item.number);
  if (item.filename !== expectedName) fail(`Unexpected filename for Practice ${item.number}: ${item.filename}`);
  if (item.title !== `IELTS Listening Practice ${item.number}`) fail(`Unexpected title for ${item.filename}`);
  if (item.category !== "listening"
    || item.categoryLabel !== "IELTS Listening"
    || item.categoryOrder !== 1
    || item.problem !== false) {
    fail(`Incorrect category metadata for ${item.filename}`);
  }
  if (!Number.isInteger(item.pages) || item.pages < 1) fail(`Invalid page count for ${item.filename}`);
  if (!Number.isInteger(item.bytes) || item.bytes < 1) fail(`Invalid byte count for ${item.filename}`);

  const expectedId = crypto.createHash("sha256").update(item.filename, "utf8").digest("hex").slice(0, 16);
  if (item.id !== expectedId || !/^[0-9a-f]{16}$/.test(String(item.id))) {
    fail(`Invalid SHA-derived ID for ${item.filename}`);
  }
  clientById.set(item.id, item);
  totalBytes += item.bytes;
  totalPages += item.pages;

  const expectedThumbnail = `assets/ielts-listening/thumbnails/${item.id}.webp`;
  if (item.thumbnail !== expectedThumbnail) fail(`Unexpected thumbnail path for ${item.filename}`);
  const thumbnailBytes = await fs.readFile(path.join(siteRoot, item.thumbnail));
  if (thumbnailBytes.length < 1_000
    || thumbnailBytes.subarray(0, 4).toString("ascii") !== "RIFF"
    || thumbnailBytes.subarray(8, 12).toString("ascii") !== "WEBP") {
    fail(`Missing, empty, or invalid WebP thumbnail: ${item.thumbnail}`);
  }
  thumbnailHashes.add(crypto.createHash("sha256").update(thumbnailBytes).digest("hex"));
}

if (thumbnailHashes.size !== EXPECTED_TOTAL) {
  fail("Listening thumbnails must have distinct Practice-number badges");
}
if (totalBytes !== EXPECTED_BYTES
  || totalPages !== EXPECTED_PAGES
  || meta.totalBytes !== EXPECTED_BYTES
  || meta.totalPages !== EXPECTED_PAGES
  || meta.categoryCounts?.listening !== EXPECTED_TOTAL
  || meta.generatedFrom !== R2_PREFIX) {
  fail("Listening aggregate metadata is incorrect");
}

for (const workerItem of workerFiles) {
  const clientItem = clientById.get(workerItem.id);
  if (!clientItem) fail(`Worker-only Listening ID: ${workerItem.id}`);
  if (workerItem.filename !== clientItem.filename || workerItem.bytes !== clientItem.bytes) {
    fail(`Client/Worker mismatch for ${workerItem.id}`);
  }
  if (workerItem.key !== `${R2_PREFIX}/${workerItem.filename}`) {
    fail(`Incorrect R2 key for ${workerItem.filename}`);
  }
  if (!Number.isInteger(workerItem.crc32) || workerItem.crc32 < 0 || workerItem.crc32 > 0xFFFFFFFF) {
    fail(`Invalid CRC-32 for ${workerItem.filename}`);
  }
}

const html = await fs.readFile(htmlPath, "utf8");
const client = await fs.readFile(clientPath, "utf8");
const worker = await fs.readFile(workerPath, "utf8");
if (!html.includes('data-open-catalog="listening"')
  || !html.includes('<strong class="task-number">07</strong>')
  || !html.includes("IELTS 聆聽 Practice")
  || !html.includes("20 份 PDF 練習")) {
  fail("IELTS Listening chooser card is incomplete");
}
if (!html.includes('ielts-listening-downloads.js?v=20260811-1')
  || html.indexOf("ielts-listening-downloads.js") > html.indexOf("model-essay-downloads.js")) {
  fail("Listening manifest is missing or loads after the portal client");
}
if (!client.includes("EDMUND_IELTS_LISTENING_DOWNLOADS")
  || !client.includes('endpointPrefix: "/listening"')
  || !client.includes('allZipName: "Edmund-IELTS-Listening-Practice-1-20.zip"')) {
  fail("Listening client catalog configuration is incomplete");
}
if (!worker.includes("LISTENING_CATALOG")
  || !worker.includes('/v1/listening/files/')
  || !worker.includes('/v1/listening/zip')) {
  fail("Listening Worker catalog or routes are missing");
}

console.log(JSON.stringify({
  files: files.length,
  totalBytes,
  totalPages,
  thumbnails: thumbnailHashes.size,
  workerRecords: workerFiles.length,
  portalCard: true,
  portalRoutes: ["/v1/listening/files/:id", "/v1/listening/zip"]
}, null, 2));
