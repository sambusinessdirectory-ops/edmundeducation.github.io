#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath, pathToFileURL } from "node:url";


const toolPath = fileURLToPath(import.meta.url);
const siteRoot = path.resolve(path.dirname(toolPath), "..");
const manifestPath = path.join(siteRoot, "ielts-task1-downloads.js");
const task2ManifestPath = path.join(siteRoot, "ielts-task2-model-essays.js");
const htmlPath = path.join(siteRoot, "model-essay-downloads.html");
const clientPath = path.join(siteRoot, "model-essay-downloads.js");
const workerCatalogPath = path.join(
  siteRoot,
  "workers",
  "model-essay-downloads",
  "src",
  "task1-catalog.js"
);

const context = { window: {} };
vm.runInNewContext(await fs.readFile(task2ManifestPath, "utf8"), context, {
  filename: task2ManifestPath
});
vm.runInNewContext(await fs.readFile(manifestPath, "utf8"), context, {
  filename: manifestPath
});

const files = Array.from(context.window.EDMUND_IELTS_TASK1_DOWNLOADS || []);
const task2Files = Array.from(context.window.EDMUND_MODEL_ESSAYS || []);
const meta = context.window.EDMUND_IELTS_TASK1_META || {};
const { TASK1_CATALOG: workerFiles } = await import(
  `${pathToFileURL(workerCatalogPath).href}?test=${Date.now()}`
);

function fail(message) {
  throw new Error(message);
}

if (files.length !== 62 || workerFiles.length !== 62 || meta.total !== 62) {
  fail(
    `Expected 62 records in both catalogs and meta; ` +
    `got client=${files.length}, worker=${workerFiles.length}, meta=${meta.total}`
  );
}

if (new Set([...task2Files, ...files].map(item => item.id)).size !== task2Files.length + files.length) {
  fail("Task 1 IDs collide with existing Task 2 IDs");
}

const expectedCategories = {
  "bar-charts": 8,
  "line-graph": 9,
  "pie-charts": 7,
  "process-diagram": 10,
  maps: 10,
  tables: 11,
  "mixed-charts": 7
};

const clientById = new Map();
let totalBytes = 0;
let totalPages = 0;

for (const item of files) {
  const expectedId = crypto
    .createHash("sha256")
    .update(item.filename, "utf8")
    .digest("hex")
    .slice(0, 16);

  if (item.id !== expectedId || !/^[0-9a-f]{16}$/.test(item.id)) {
    fail(`Invalid ID for ${item.filename}`);
  }
  if (clientById.has(item.id)) fail(`Duplicate ID ${item.id}`);
  if (!Object.hasOwn(expectedCategories, item.category)) {
    fail(`Unexpected category ${item.category}`);
  }
  if (!Number.isInteger(item.number) || item.number < 1) {
    fail(`Invalid model essay number for ${item.filename}`);
  }
  if (![1, 2, 3].includes(item.batch)) fail(`Invalid batch for ${item.filename}`);
  if (item.batch === 1 && item.analysisIncluded !== true) {
    fail(`First-batch analysis flag is incorrect for ${item.filename}`);
  }
  if (item.batch === 2 && item.analysisIncluded !== false) {
    fail(`Second-batch analysis flag is incorrect for ${item.filename}`);
  }
  if (item.batch === 3 && item.analysisIncluded !== true) {
    fail(`Table-batch analysis flag is incorrect for ${item.filename}`);
  }

  clientById.set(item.id, item);
  totalBytes += Number(item.bytes);
  totalPages += Number(item.pages);

  const thumbnail = path.join(siteRoot, item.thumbnail);
  const thumbnailStat = await fs.stat(thumbnail);
  if (!thumbnailStat.isFile() || thumbnailStat.size < 1000) {
    fail(`Missing or empty thumbnail: ${item.thumbnail}`);
  }
}

for (const [category, expected] of Object.entries(expectedCategories)) {
  const actual = files.filter(item => item.category === category).length;
  if (actual !== expected) fail(`Count mismatch for ${category}: ${actual}`);
  if (meta.categoryCounts?.[category] !== expected) {
    fail(`Meta count mismatch for ${category}`);
  }
}

const tableEntries = files
  .filter(item => item.category === "tables")
  .sort((left, right) => left.number - right.number);
if (tableEntries.map(item => item.number).join(",") !== "1,2,3,4,5,6,7,8,9,10,11") {
  fail(`Table ordinals are incomplete or duplicated: ${tableEntries.map(item => item.number).join(",")}`);
}
if (tableEntries[0].batch !== 1 || tableEntries.slice(1).some(item => item.batch !== 3)) {
  fail("Table 1 must remain in the first source batch and Tables 2–11 must use the audited Table batch");
}

if (Number(meta.totalBytes) !== totalBytes || Number(meta.totalPages) !== totalPages) {
  fail("Manifest totals do not match the Task 1 catalog records");
}

for (const workerItem of workerFiles) {
  const clientItem = clientById.get(workerItem.id);
  if (!clientItem) fail(`Worker-only ID ${workerItem.id}`);
  if (workerItem.filename !== clientItem.filename || workerItem.bytes !== clientItem.bytes) {
    fail(`Client/Worker mismatch for ${workerItem.id}`);
  }
  const expectedPrefix = clientItem.batch === 2
    ? "IELTS Writing Task 1/IELTS Writing Task 2 - Second Batch"
    : clientItem.batch === 3
      ? "IELTS Writing Task 1/IELTS Writing Task 1 - Tables Batch 3"
      : "IELTS Writing Task 1";
  if (workerItem.key !== `${expectedPrefix}/${workerItem.filename}`) {
    fail(`Incorrect R2 key for ${workerItem.filename}`);
  }
  if (!Number.isInteger(workerItem.crc32) || workerItem.crc32 < 0 || workerItem.crc32 > 0xFFFFFFFF) {
    fail(`Invalid CRC-32 for ${workerItem.filename}`);
  }
}

const html = await fs.readFile(htmlPath, "utf8");
const client = await fs.readFile(clientPath, "utf8");

if (!html.includes('data-open-catalog="task1"')) fail("Task 1 chooser card is missing");
if (!html.includes('<script src="ielts-task1-downloads.js?v=20260730-1"></script>')) {
  fail("Task 1 manifest script is missing");
}
if (!html.includes('<span class="card-tag">62 份 Band 9 範文</span>')) {
  fail("Task 1 chooser card count is incorrect");
}
if (html.indexOf("ielts-task1-downloads.js") > html.indexOf("model-essay-downloads.js")) {
  fail("Task 1 manifest must load before the portal client");
}
if (!client.includes('endpointPrefix: "/task1"')) {
  fail("Task 1 endpoint configuration is missing from the portal client");
}
if (!client.includes('["task1", "task2"].includes(activeCatalog.key)')) {
  fail("Task 1 reciprocal portal links are not enabled");
}
for (const label of ["Bar Charts", "Line Graph", "Pie Charts", "Process Diagram", "Maps", "Tables", "Mixed Charts"]) {
  if (!client.includes(`label: "${label}"`)) fail(`Task 1 filter is missing: ${label}`);
}

console.log(JSON.stringify({
  files: files.length,
  categories: meta.categoryCounts,
  totalBytes,
  totalPages,
  thumbnails: files.length,
  workerRecords: workerFiles.length,
  portalCard: true,
  portalRoutes: ["/v1/task1/files/:id", "/v1/task1/zip"]
}, null, 2));
