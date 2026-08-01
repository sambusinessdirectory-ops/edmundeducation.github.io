#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const baselineArgument = process.argv.indexOf("--baseline");
const baselinePath = baselineArgument >= 0 && process.argv[baselineArgument + 1]
  ? path.resolve(process.cwd(), process.argv[baselineArgument + 1])
  : path.join(root, ".flashcards-audio-build/baseline-manifest-20260730.js");
const currentPath = path.join(root, "flashcards-audio-manifest.js");
const fourthIndexPath = "workers/edmund-audio/src/flashcard-pack-index-flashcard-expansion.json";
const fourthIndex = JSON.parse(fs.readFileSync(path.join(root, fourthIndexPath), "utf8"));
const fourthComplete = fourthIndex.meta?.r2UploadComplete === true;
const indexPaths = [
  "workers/edmund-audio/src/flashcard-pack-index.json",
  "workers/edmund-audio/src/flashcard-pack-index-passage2.json",
  "workers/edmund-audio/src/flashcard-pack-index-reading-expansion.json",
  ...(fourthComplete ? [fourthIndexPath] : []),
];
const mappingMarker = "window.EDMUND_FLASHCARD_AUDIO = Object.freeze(";
const metaMarker = "window.EDMUND_FLASHCARD_AUDIO_META = Object.freeze(";
const expectedCloudBaseUrl = "https://edmund-neural-audio.edmundeducation.workers.dev";
const expectedExpandedCount = 118304 + (fourthComplete ? 16083 : 0);
const expectedExpandedCorpusSha256 = fourthComplete
  ? "a4471778eff2c23891bce762b0faaf8cc6387596fe0909043b9a1beb67ecc849"
  : "eb1376e535c27570be8fb3ed385646f2ac3d4d0cf1ffc52e2b4f1ce4ec50f73f";

function decodeAssignment(source, marker) {
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Missing assignment ${marker}`);
  const text = source.slice(start + marker.length);
  const opener = text[0];
  const closer = opener === "{" ? "}" : opener === "[" ? "]" : "";
  if (!closer) throw new Error(`Unsupported assignment value after ${marker}`);
  let depth = 0;
  let quoted = false;
  let escaped = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') quoted = false;
      continue;
    }
    if (character === '"') quoted = true;
    else if (character === opener) depth += 1;
    else if (character === closer && --depth === 0) return JSON.parse(text.slice(0, index + 1));
  }
  throw new Error(`Unterminated assignment ${marker}`);
}

function loadManifest(filename) {
  const source = fs.readFileSync(filename, "utf8");
  return {
    source,
    entries: decodeAssignment(source, mappingMarker),
    meta: decodeAssignment(source, metaMarker),
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function digestForUrl(value) {
  return path.basename(new URL(value, "https://local.invalid/").pathname, ".mp3");
}

const baseline = loadManifest(baselinePath);
const current = loadManifest(currentPath);
assert(baseline.meta.complete === true, "Baseline manifest is incomplete");
assert(current.meta.complete === true, "Expanded manifest is incomplete");
assert(baseline.meta.count === Object.keys(baseline.entries).length, "Baseline count is inconsistent");
assert(current.meta.count === Object.keys(current.entries).length, "Expanded count is inconsistent");
assert(current.meta.count > baseline.meta.count, "Expanded manifest did not add recordings");
assert(current.meta.count === expectedExpandedCount, `Expanded manifest count is ${current.meta.count}`);
assert(
  current.meta.corpusSha256 === expectedExpandedCorpusSha256,
  `Expanded corpus hash is ${current.meta.corpusSha256}`
);

const changed = [];
for (const [text, url] of Object.entries(baseline.entries)) {
  if (current.entries[text] !== url) changed.push({ text, before: url, after: current.entries[text] });
  if (changed.length >= 20) break;
}
assert(!changed.length, `Immutable baseline mappings changed:\n${JSON.stringify(changed, null, 2)}`);

const indexes = indexPaths.map((relativePath) => {
  const value = JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
  assert(value.meta?.r2UploadComplete === true, `${relativePath} is not marked uploaded`);
  assert(value.cloudBaseUrl === expectedCloudBaseUrl, `${relativePath} has an unexpected public host`);
  return { relativePath, value };
});
const expansionIndex = indexes.find(({ value }) => value.meta?.release === "v1-reading-expansion-20260731-1")?.value;
assert(expansionIndex, "Reading expansion index is missing");
assert(expansionIndex.meta.entryCount === 26966, `Expansion index has ${expansionIndex.meta.entryCount} recordings`);
assert(expansionIndex.meta.sourceEntryCount === 55515, "Expansion source-union count is incorrect");
assert(expansionIndex.meta.excludedExistingEntryCount === 28549, "Expansion reused-audio count is incorrect");
assert(expansionIndex.meta.sourceDeckCount === 315, "Expansion source deck count is incorrect");
assert(expansionIndex.meta.sourceCardCount === 63396, "Expansion source card count is incorrect");

let local = 0;
let cloud = 0;
let expansion = 0;
const missing = [];
for (const [text, url] of Object.entries(current.entries)) {
  const expectedDigest = crypto.createHash("sha256").update(text).digest("hex").slice(0, 24);
  if (!url.startsWith("https://")) {
    const file = path.join(root, url);
    const expectedLocalUrl = `assets/flashcards/audio/edmund-neural/v1/${expectedDigest.slice(0, 2)}/${expectedDigest}.mp3`;
    if (url !== expectedLocalUrl || !fs.existsSync(file) || fs.statSync(file).size <= 1000) {
      missing.push(`${text} -> ${url}`);
    }
    local += 1;
    continue;
  }
  const indexRecord = indexes.find(({ value }) =>
    url === `${value.cloudBaseUrl}/${value.audioPathPrefix}${expectedDigest.slice(0, 2)}/${expectedDigest}.mp3`
  );
  const index = indexRecord?.value;
  const digest = digestForUrl(url);
  const range = index?.entries?.[digest.slice(0, 2)]?.[digest.slice(2)];
  if (digest !== expectedDigest || !index || !Array.isArray(range) || range.length !== 2 || range[1] <= 1000) {
    missing.push(`${text} -> ${url}`);
  }
  if (index?.meta?.release === "v1-reading-expansion-20260731-1") expansion += 1;
  cloud += 1;
  if (missing.length >= 20) break;
}
assert(!missing.length, `Unresolvable expanded audio mappings:\n${missing.join("\n")}`);
assert(expansion > 0, "No manifest entry resolves through the Reading expansion release");

const baselineMappingSha256 = crypto
  .createHash("sha256")
  .update(JSON.stringify(Object.fromEntries(Object.entries(baseline.entries).sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0))))
  .digest("hex");
const baselineManifestSha256 = crypto.createHash("sha256").update(baseline.source).digest("hex");
assert(expansionIndex.meta.baselineEntryCount === baseline.meta.count, "Expansion baseline entry count is incorrect");
assert(expansionIndex.meta.baselineManifestSha256 === baselineManifestSha256, "Expansion baseline file hash is incorrect");
assert(expansionIndex.meta.baselineMappingSha256 === baselineMappingSha256, "Expansion baseline mapping hash is incorrect");
assert(expansionIndex.meta.baselineCorpusSha256 === baseline.meta.corpusSha256, "Expansion baseline corpus hash is incorrect");
const earlierIndexes = indexes.filter(({ value }) => value !== expansionIndex);
assert(expansionIndex.meta.existingIndexes?.length === earlierIndexes.length, "Expansion earlier-index inventory is incomplete");
for (const { value } of earlierIndexes) {
  const recorded = expansionIndex.meta.existingIndexes.find((row) => row.audioPathPrefix === value.audioPathPrefix);
  assert(recorded, `Expansion metadata omits earlier release ${value.audioPathPrefix}`);
  assert(recorded.corpusSha256 === value.meta.corpusSha256, `Earlier release corpus hash changed: ${value.audioPathPrefix}`);
  assert(recorded.entryCount === value.meta.entryCount, `Earlier release entry count changed: ${value.audioPathPrefix}`);
}
const newEntries = Object.keys(current.entries).filter((text) => !(text in baseline.entries)).length;

console.log(JSON.stringify({
  baselineEntries: baseline.meta.count,
  currentEntries: current.meta.count,
  newEntries,
  unchangedBaselineEntries: baseline.meta.count,
  local,
  cloud,
  expansion,
  baselineMappingSha256,
}, null, 2));
