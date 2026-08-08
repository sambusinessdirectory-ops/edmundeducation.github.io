#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";


const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const baselineCount = 118304;
const baselineMappingSha256 =
  "59751d5405a4117a32057740f6202671118426db6ba26ce8ba5f80a5e4235eb8";
const baselineManifestSha256 =
  "9525ffdb8b600d50cc70ab26627fdc6959070df5dbc7bcfad852897bf3ffc1bb";
const baselineCorpusSha256 =
  "eb1376e535c27570be8fb3ed385646f2ac3d4d0cf1ffc52e2b4f1ce4ec50f73f";
const expectedSourceEntryCount = 18943;
const expectedNewEntryCount = 16083;
const expectedExcludedExistingEntryCount = 2860;
const expectedSourceCardCount = 20506;
const expectedSourceCorpusSha256 =
  "ace3c896b6bc4dfb6cc2e649b0da95432d10825527d66924a8184c22c7c53b2f";
const expectedNewCorpusSha256 =
  "22913b458da32795beeccc8e420effd48d2afbc31dd4e5ee07748cf1598c7878";
const expectedFinalCount = 134387;
const expectedFinalCorpusSha256 =
  "a4471778eff2c23891bce762b0faaf8cc6387596fe0909043b9a1beb67ecc849";
const release = "v1-flashcard-expansion-20260801-1";
const cloudBaseUrl = "https://edmund-neural-audio.edmundeducation.workers.dev";
const requireComplete = process.argv.includes("--require-complete");
const allowLocalStaging = process.argv.includes("--allow-local-staging");
const retainedLegacyLocalDigests = new Set([
  "f6973f0c2f1f8f9e536191a4", // closed on Mondays; tracked before this R2 release
]);
const indexPath = path.join(
  root,
  "workers/edmund-audio/src/flashcard-pack-index-flashcard-expansion.json"
);
const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
const source = fs.readFileSync(path.join(root, "flashcards-audio-manifest.js"), "utf8");
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox);
const entries = Object.fromEntries(Object.entries(sandbox.window.EDMUND_FLASHCARD_AUDIO));
const meta = { ...sandbox.window.EDMUND_FLASHCARD_AUDIO_META };


function assert(condition, message) {
  if (!condition) throw new Error(message);
}


function sortedMappingSha256(mapping) {
  const sorted = Object.fromEntries(
    Object.entries(mapping).sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
  );
  return crypto.createHash("sha256").update(JSON.stringify(sorted)).digest("hex");
}


function digest(text) {
  return crypto.createHash("sha256").update(text).digest("hex").slice(0, 24);
}


assert(meta.complete === true, "Flashcard audio manifest is incomplete");
assert(meta.count === Object.keys(entries).length, "Flashcard manifest count is inconsistent");
assert(
  meta.corpusSha256 ===
    crypto.createHash("sha256").update(Object.keys(entries).sort().join("\n")).digest("hex"),
  "Flashcard manifest corpus hash is inconsistent"
);
assert(index.schemaVersion === 1, "Fourth pack index schema is invalid");
assert(index.cloudBaseUrl === cloudBaseUrl, "Fourth pack index host changed");
assert(index.meta?.release === release, "Fourth pack release name changed");
assert(
  index.audioPathPrefix === `assets/flashcards/audio/edmund-neural/${release}/` &&
    index.packKeyPrefix === index.audioPathPrefix,
  "Fourth pack release prefix changed"
);
assert(index.meta.baselineEntryCount === baselineCount, "Fourth baseline count changed");
assert(
  index.meta.baselineManifestSha256 === baselineManifestSha256,
  "Fourth baseline manifest hash changed"
);
assert(
  index.meta.baselineMappingSha256 === baselineMappingSha256,
  "Fourth baseline mapping hash changed"
);
assert(
  index.meta.baselineCorpusSha256 === baselineCorpusSha256,
  "Fourth baseline corpus hash changed"
);
assert(index.meta.sourceDeckCount === 142, "Fourth release does not declare 142 decks");
assert(
  index.meta.sourceSections?.map((row) => row.deckCount).join(",") === "76,42,12,12",
  "Fourth release section deck counts changed"
);

const publicPrefix = `${cloudBaseUrl}/${index.audioPathPrefix}`;
const newEntries = Object.fromEntries(
  Object.entries(entries).filter(([, value]) => value.startsWith(publicPrefix))
);
const retainedEntries = Object.fromEntries(
  Object.entries(entries).filter(([, value]) => !value.startsWith(publicPrefix))
);

if (!index.meta.r2UploadComplete) {
  assert(
    !requireComplete,
    "Fourth flashcard audio release is still pending; refusing a production deployment"
  );
  assert(index.meta.entryCount === 0, "Pending release contains indexed recordings");
  assert(Object.keys(index.entries).length === 0, "Pending release contains entry ranges");
  assert(Object.keys(index.packs).length === 0, "Pending release contains pack metadata");
  assert(Object.keys(newEntries).length === 0, "Production manifest points to pending release");
  assert(meta.count === baselineCount, `Pending manifest count is ${meta.count}`);
  assert(meta.corpusSha256 === baselineCorpusSha256, "Pending manifest corpus changed");
  assert(sortedMappingSha256(entries) === baselineMappingSha256, "Pending baseline mapping changed");
  console.log(JSON.stringify({
    release,
    status: "waiting-for-audio-pack-upload",
    baselineEntries: baselineCount,
    preservedMappingSha256: baselineMappingSha256,
  }, null, 2));
  process.exit(0);
}

assert(index.meta.entryCount === expectedNewEntryCount, "Completed release entry count changed");
assert(index.meta.packCount > 0, "Completed release contains no packs");
assert(Object.keys(index.entries).length === index.meta.packCount, "Fourth pack count is inconsistent");
assert(Object.keys(index.packs).length === index.meta.packCount, "Fourth pack metadata is incomplete");
assert(
  index.meta.sourceEntryCount ===
    index.meta.entryCount + index.meta.excludedExistingEntryCount,
  "Fourth source/reuse counts are inconsistent"
);
assert(index.meta.sourceEntryCount === expectedSourceEntryCount, "Fourth source count changed");
assert(
  index.meta.excludedExistingEntryCount === expectedExcludedExistingEntryCount,
  "Fourth baseline-overlap count changed"
);
assert(index.meta.sourceCardCount === expectedSourceCardCount, "Fourth source card count changed");
assert(
  index.meta.sourceCorpusSha256 === expectedSourceCorpusSha256,
  "Fourth source corpus changed"
);
assert(index.meta.corpusSha256 === expectedNewCorpusSha256, "Fourth new corpus changed");
assert(
  Object.keys(retainedEntries).length >= baselineCount,
  "One or more pre-release audio mappings was removed"
);
// This verifier protects the immutable packed release, while later decks may
// legitimately add mappings outside that release. The original full-manifest
// hashes remain enforceable only while no post-release mappings exist.
if (Object.keys(retainedEntries).length === baselineCount) {
  assert(
    sortedMappingSha256(retainedEntries) === baselineMappingSha256,
    "One or more immutable baseline text-to-URL mappings changed"
  );
}
assert(
  Object.keys(newEntries).length === index.meta.entryCount,
  "Manifest/new-release entry count disagrees with pack index"
);
assert(
  meta.count >= baselineCount + index.meta.entryCount,
  "Expanded manifest is missing entries from the immutable release"
);
assert(meta.count >= expectedFinalCount, "Expanded manifest lost release entries");
if (meta.count === expectedFinalCount) {
  assert(meta.corpusSha256 === expectedFinalCorpusSha256, "Expanded manifest corpus changed");
}

const manifestDigests = new Set();
let localStagingRetained = 0;
let legacyLocalOverlap = 0;
for (const [text, url] of Object.entries(newEntries)) {
  const expectedDigest = digest(text);
  const expectedUrl = `${publicPrefix}${expectedDigest.slice(0, 2)}/${expectedDigest}.mp3`;
  assert(url === expectedUrl, `New recording URL/digest mismatch: ${text} -> ${url}`);
  const audioRange = index.entries[expectedDigest.slice(0, 2)]?.[expectedDigest.slice(2)];
  assert(
    Array.isArray(audioRange) && audioRange.length === 2 && audioRange[1] > 1000,
    `New recording is absent from the fourth pack index: ${text}`
  );
  const local = path.join(
    root,
    "assets/flashcards/audio/edmund-neural/v1",
    expectedDigest.slice(0, 2),
    `${expectedDigest}.mp3`
  );
  if (fs.existsSync(local)) {
    if (retainedLegacyLocalDigests.has(expectedDigest)) {
      legacyLocalOverlap += 1;
    } else {
      assert(
        allowLocalStaging,
        `Packed source MP3 was not pruned before publication: ${local}`
      );
      localStagingRetained += 1;
    }
  }
  manifestDigests.add(expectedDigest);
}

let indexedRecordings = 0;
let indexedBytes = 0;
for (const [prefix, prefixEntries] of Object.entries(index.entries)) {
  const pack = index.packs[prefix];
  assert(/^[0-9a-f]{2}$/.test(prefix), `Invalid fourth pack prefix: ${prefix}`);
  assert(pack?.key === `${index.packKeyPrefix}${prefix}.bin`, `Invalid fourth pack key: ${prefix}`);
  let expectedOffset = 0;
  for (const [suffix, audioRange] of Object.entries(prefixEntries).sort(
    ([, left], [, right]) => left[0] - right[0]
  )) {
    const fullDigest = `${prefix}${suffix}`;
    assert(/^[0-9a-f]{24}$/.test(fullDigest), `Invalid fourth recording digest: ${fullDigest}`);
    assert(audioRange[0] === expectedOffset && audioRange[1] > 1000, `Invalid range: ${fullDigest}`);
    assert(manifestDigests.has(fullDigest), `Indexed fourth recording is unused: ${fullDigest}`);
    expectedOffset += audioRange[1];
    indexedRecordings += 1;
  }
  assert(expectedOffset === pack.size, `Fourth pack ranges do not fill ${prefix}.bin`);
  indexedBytes += pack.size;
}
assert(indexedRecordings === index.meta.entryCount, "Fourth indexed recording total changed");
assert(indexedBytes === index.meta.totalBytes, "Fourth indexed byte total changed");

const earlierIndexPaths = [
  "flashcard-pack-index.json",
  "flashcard-pack-index-passage2.json",
  "flashcard-pack-index-reading-expansion.json",
];
const earlierIndexes = earlierIndexPaths.map((filename) =>
  JSON.parse(fs.readFileSync(path.join(root, "workers/edmund-audio/src", filename), "utf8"))
);
assert(index.meta.existingIndexes?.length === earlierIndexes.length, "Earlier release ledger is incomplete");
for (const earlier of earlierIndexes) {
  assert(earlier.meta.r2UploadComplete === true, "An earlier release is no longer complete");
  const recorded = index.meta.existingIndexes.find(
    (row) => row.audioPathPrefix === earlier.audioPathPrefix
  );
  assert(recorded, `Earlier release omitted from fourth ledger: ${earlier.audioPathPrefix}`);
  assert(recorded.entryCount === earlier.meta.entryCount, "Earlier release entry count changed");
  assert(recorded.corpusSha256 === earlier.meta.corpusSha256, "Earlier release corpus changed");
}

console.log(JSON.stringify({
  release,
  status: "complete",
  baselineEntries: baselineCount,
  newEntries: index.meta.entryCount,
  currentEntries: meta.count,
  sourceDecks: index.meta.sourceDeckCount,
  packs: index.meta.packCount,
  indexedBytes,
  localStagingRetained,
  legacyLocalOverlap,
  preservedMappingSha256: sortedMappingSha256(retainedEntries),
  currentCorpusSha256: meta.corpusSha256,
}, null, 2));
