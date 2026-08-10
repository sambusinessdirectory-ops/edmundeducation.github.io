#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";


const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicHost = "https://edmund-neural-audio.edmundeducation.workers.dev";
const indexContracts = [
  {
    file: "flashcard-pack-index.json",
    prefix: "assets/flashcards/audio/edmund-neural/v1-passage1-20260722/",
    mustBeComplete: true,
  },
  {
    file: "flashcard-pack-index-passage2.json",
    prefix: "assets/flashcards/audio/edmund-neural/v1-passage2-20260730-1/",
    mustBeComplete: true,
  },
  {
    file: "flashcard-pack-index-reading-expansion.json",
    prefix: "assets/flashcards/audio/edmund-neural/v1-reading-expansion-20260731-1/",
    release: "v1-reading-expansion-20260731-1",
    mustBeComplete: true,
  },
  {
    file: "flashcard-pack-index-flashcard-expansion.json",
    prefix: "assets/flashcards/audio/edmund-neural/v1-flashcard-expansion-20260801-1/",
    release: "v1-flashcard-expansion-20260801-1",
    mustBeComplete: false,
  },
];
const indexes = indexContracts.map((contract) => ({
  ...contract,
  value: JSON.parse(
    fs.readFileSync(path.join(root, "workers/edmund-audio/src", contract.file), "utf8")
  ),
}));
const workerModule = await import(
  pathToFileURL(path.join(root, "workers/edmund-audio/src/index.js")).href
);
const worker = workerModule.default;


function assert(condition, message) {
  if (!condition) throw new Error(message);
}


for (const contract of indexes) {
  const index = contract.value;
  assert(index.schemaVersion === 1, `${contract.file} has an invalid schema`);
  assert(index.audioPathPrefix === contract.prefix, `${contract.file} changed public prefix`);
  assert(index.packKeyPrefix === contract.prefix, `${contract.file} changed pack-key prefix`);
  assert(index.cloudBaseUrl === publicHost, `${contract.file} changed public host`);
  if (contract.release) {
    assert(index.meta?.release === contract.release, `${contract.file} changed release name`);
  }
  if (contract.mustBeComplete) {
    assert(index.meta?.r2UploadComplete === true, `${contract.file} is not complete`);
  } else {
    assert(
      typeof index.meta?.r2UploadComplete === "boolean",
      `${contract.file} has an invalid completion marker`
    );
    if (!index.meta.r2UploadComplete) {
      assert(index.meta.entryCount === 0, "Pending fourth release must have zero entries");
      assert(Object.keys(index.entries).length === 0, "Pending fourth release exposes entries");
      assert(Object.keys(index.packs).length === 0, "Pending fourth release exposes packs");
    }
  }
}

const readingExpansion = indexes[2].value;
assert(readingExpansion.meta.baselineEntryCount === 91338, "Reading baseline count changed");
assert(
  readingExpansion.meta.baselineManifestSha256 ===
    "2d496c54e8d8104c89eff5ef28ec230c2a21e755af05b0d35fef19981b3bd950",
  "Reading baseline manifest hash changed"
);
assert(
  readingExpansion.meta.baselineMappingSha256 ===
    "4cf616f93a6b2ff5066fca610b8cae0ca8750c6429b62eac641a27974c0369c0",
  "Reading baseline mapping hash changed"
);
assert(
  readingExpansion.meta.baselineCorpusSha256 ===
    "94cc0319aba7d0d024c86a811cfb011dee35ebaf4dd641638a6ee603065298fc",
  "Reading baseline corpus hash changed"
);

const flashcardExpansion = indexes[3].value;
assert(flashcardExpansion.meta.baselineEntryCount === 118304, "Fourth baseline count changed");
assert(
  flashcardExpansion.meta.baselineManifestSha256 ===
    "9525ffdb8b600d50cc70ab26627fdc6959070df5dbc7bcfad852897bf3ffc1bb",
  "Fourth baseline manifest hash changed"
);
assert(
  flashcardExpansion.meta.baselineMappingSha256 ===
    "59751d5405a4117a32057740f6202671118426db6ba26ce8ba5f80a5e4235eb8",
  "Fourth baseline mapping hash changed"
);
assert(
  flashcardExpansion.meta.baselineCorpusSha256 ===
    "eb1376e535c27570be8fb3ed385646f2ac3d4d0cf1ffc52e2b4f1ce4ec50f73f",
  "Fourth baseline corpus hash changed"
);
assert(flashcardExpansion.meta.sourceDeckCount === 142, "Fourth release must cover 142 decks");
assert(
  flashcardExpansion.meta.sourceSections?.map((row) => [row.id, row.deckCount]).join("|") ===
    [
      ["ielts-listening-practices-2-20", 76],
      ["dse-reading-2012-2025", 42],
      ["dse-practical-writing", 12],
      ["dse-paper3-b2-data-files-2012-2023", 12],
    ].join("|"),
  "Fourth release section inventory changed"
);
if (flashcardExpansion.meta.r2UploadComplete) {
  assert(flashcardExpansion.meta.entryCount === 16083, "Fourth release entry count changed");
  assert(flashcardExpansion.meta.sourceEntryCount === 18943, "Fourth source count changed");
  assert(flashcardExpansion.meta.sourceCardCount === 20506, "Fourth source card count changed");
  assert(
    flashcardExpansion.meta.excludedExistingEntryCount === 2860,
    "Fourth baseline-overlap count changed"
  );
  assert(
    flashcardExpansion.meta.sourceCorpusSha256 ===
      "ace3c896b6bc4dfb6cc2e649b0da95432d10825527d66924a8184c22c7c53b2f",
    "Fourth source corpus changed"
  );
  assert(
    flashcardExpansion.meta.corpusSha256 ===
      "22913b458da32795beeccc8e420effd48d2afbc31dd4e5ee07748cf1598c7878",
    "Fourth new corpus changed"
  );
}

const prefixes = indexes.map(({ value }) => value.audioPathPrefix);
assert(
  prefixes.every((prefix, index) =>
    prefixes.every((otherPrefix, otherIndex) =>
      index === otherIndex || (!prefix.startsWith(otherPrefix) && !otherPrefix.startsWith(prefix))
    )
  ),
  "Worker pack-index precedence is ambiguous because URL prefixes overlap"
);

const completed = indexes.filter(({ value }) => value.meta.r2UploadComplete);
const fixtures = [];
for (const [fixtureIndex, contract] of completed.entries()) {
  const index = contract.value;
  const prefix = Object.keys(index.entries).sort()[0];
  const suffix = Object.keys(index.entries[prefix] || {}).sort()[0];
  assert(prefix && suffix, `${contract.file} has no indexed recording`);
  const digest = `${prefix}${suffix}`;
  const [offset, length] = index.entries[prefix][suffix];
  const pack = index.packs[prefix];
  assert(pack?.key && length > 1000, `${contract.file} has an invalid first recording`);
  fixtures.push({
    ...contract,
    index,
    prefix,
    digest,
    offset,
    length,
    pack,
    fill: 0x5a + fixtureIndex * 0x11,
  });
}

const packFixtures = new Map(
  fixtures.map((fixture) => [fixture.pack.key, { fill: fixture.fill, pack: fixture.pack }])
);
const getCalls = [];
const env = {
  EDMUND_ASSETS: {
    async list({ prefix }) {
      assert(prefix === "IELTS Listening - Recordings/", "Listening list used the wrong R2 prefix");
      return {
        truncated: false,
        objects: [
          { key: `${prefix}IELTS Practice 1 - Part 1.mp3`, size: 12345, uploaded: new Date("2026-08-10T01:00:00Z") },
          { key: `${prefix}Listening 01 Part 2.mp3`, size: 23456, uploaded: new Date("2026-08-10T01:01:00Z") },
          { key: `${prefix}README.mp3`, size: 99, uploaded: new Date("2026-08-10T01:02:00Z") }
        ]
      };
    },
    async head(key) {
      const fixture = packFixtures.get(key);
      return fixture ? { size: fixture.pack.size } : null;
    },
    async get(key, options = {}) {
      const fixture = packFixtures.get(key);
      if (!fixture) return null;
      const range = options.range || { offset: 0, length: fixture.pack.size };
      getCalls.push({ key, ...range });
      return { body: Buffer.alloc(range.length, fixture.fill) };
    },
  },
};

const results = [];
for (const fixture of fixtures) {
  const url =
    `${fixture.index.cloudBaseUrl}/${fixture.index.audioPathPrefix}` +
    `${fixture.prefix}/${fixture.digest}.mp3`;
  const expected = Buffer.alloc(fixture.length, fixture.fill);
  const beforeCalls = getCalls.length;

  const full = await worker.fetch(new Request(url), env);
  assert(full.status === 200, `${fixture.file}: full status was ${full.status}`);
  assert(full.headers.get("content-type") === "audio/mpeg", `${fixture.file}: wrong MIME`);
  assert(Number(full.headers.get("content-length")) === fixture.length, `${fixture.file}: wrong length`);
  assert(Buffer.from(await full.arrayBuffer()).equals(expected), `${fixture.file}: wrong full bytes`);
  assert(
    getCalls[beforeCalls]?.key === fixture.pack.key &&
      getCalls[beforeCalls]?.offset === fixture.offset &&
      getCalls[beforeCalls]?.length === fixture.length,
    `${fixture.file}: wrong R2 full range`
  );

  const head = await worker.fetch(new Request(url, { method: "HEAD" }), env);
  assert(head.status === 200, `${fixture.file}: HEAD status was ${head.status}`);
  assert(Number(head.headers.get("content-length")) === fixture.length, `${fixture.file}: HEAD length`);
  assert(head.headers.get("accept-ranges") === "bytes", `${fixture.file}: HEAD ranges missing`);

  const range = await worker.fetch(
    new Request(url, { headers: { Range: "bytes=10-99" } }),
    env
  );
  assert(range.status === 206, `${fixture.file}: Range status was ${range.status}`);
  assert(
    range.headers.get("content-range") === `bytes 10-99/${fixture.length}`,
    `${fixture.file}: wrong Content-Range`
  );
  assert(
    Buffer.from(await range.arrayBuffer()).equals(expected.subarray(10, 100)),
    `${fixture.file}: wrong Range bytes`
  );

  const unknown = await worker.fetch(
    new Request(
      `${fixture.index.cloudBaseUrl}/${fixture.index.audioPathPrefix}` +
        "00/000000000000000000000000.mp3"
    ),
    env
  );
  assert(unknown.status === 404, `${fixture.file}: unknown status was ${unknown.status}`);
  results.push({
    release: fixture.index.meta.release || fixture.index.audioPathPrefix,
    digest: fixture.digest,
    bytes: fixture.length,
    fullStatus: full.status,
    headStatus: head.status,
    rangeStatus: range.status,
    unknownStatus: unknown.status,
  });
}

const primary = fixtures[0];
const primaryUrl =
  `${primary.index.cloudBaseUrl}/${primary.index.audioPathPrefix}` +
  `${primary.prefix}/${primary.digest}.mp3`;
const ifRangeMismatch = await worker.fetch(
  new Request(primaryUrl, {
    headers: { Range: "bytes=10-99", "If-Range": '"stale-release"' },
  }),
  env
);
assert(ifRangeMismatch.status === 200, "If-Range mismatch did not return full audio");
assert(!ifRangeMismatch.headers.has("content-range"), "If-Range mismatch remained partial");

const suffixLength = Math.min(64, primary.length);
const suffix = await worker.fetch(
  new Request(primaryUrl, { headers: { Range: `bytes=-${suffixLength}` } }),
  env
);
assert(suffix.status === 206, `Suffix Range status was ${suffix.status}`);
assert(
  suffix.headers.get("content-range") ===
    `bytes ${primary.length - suffixLength}-${primary.length - 1}/${primary.length}`,
  "Suffix Range metadata is wrong"
);

const rangedHead = await worker.fetch(
  new Request(primaryUrl, { method: "HEAD", headers: { Range: "bytes=0-31" } }),
  env
);
assert(rangedHead.status === 206, `Ranged HEAD status was ${rangedHead.status}`);
assert(Number(rangedHead.headers.get("content-length")) === 32, "Ranged HEAD length is wrong");

const invalidRange = await worker.fetch(
  new Request(primaryUrl, { headers: { Range: `bytes=${primary.length}-` } }),
  env
);
assert(invalidRange.status === 416, `Invalid Range status was ${invalidRange.status}`);

const options = await worker.fetch(new Request(primaryUrl, { method: "OPTIONS" }), env);
assert(options.status === 204, `OPTIONS status was ${options.status}`);
assert(options.headers.get("access-control-allow-origin") === "*", "OPTIONS CORS missing");

const conditional = await worker.fetch(
  new Request(primaryUrl, { headers: { "If-None-Match": `"${primary.digest}"` } }),
  env
);
assert(conditional.status === 304, `Conditional status was ${conditional.status}`);

if (!flashcardExpansion.meta.r2UploadComplete) {
  const pendingUrl =
    `${flashcardExpansion.cloudBaseUrl}/${flashcardExpansion.audioPathPrefix}` +
    "00/000000000000000000000000.mp3";
  const pending = await worker.fetch(new Request(pendingUrl), env);
  assert(pending.status === 404, "Incomplete fourth release must not be routed");
}

const healthResponse = await worker.fetch(new Request(`${publicHost}/health`), env);
const health = await healthResponse.json();
assert(healthResponse.status === 200 && health.products.includes("flashcards"), "Health omits flashcards");
assert(health.products.includes("ielts-listening"), "Health omits IELTS listening");

const listeningResponse = await worker.fetch(new Request(`${publicHost}/v1/listening/catalog`), env);
assert(listeningResponse.status === 200, "IELTS listening catalogue did not respond");
const listeningCatalogue = await listeningResponse.json();
assert(listeningCatalogue.expectedTracks === 80, "Listening catalogue expected-track count changed");
assert(listeningCatalogue.complete === false, "Incomplete listening fixture was marked complete");
assert(
  JSON.stringify(listeningCatalogue.tracks.map(track => [track.practice, track.part])) === JSON.stringify([[1, 1], [1, 2]]),
  "Listening filenames were not mapped to the right practice and part"
);
assert(listeningCatalogue.missing.length === 78, "Listening missing-track count is wrong");
assert(listeningCatalogue.unmappedCount === 1, "Unmapped listening-object count is wrong");
assert(listeningCatalogue.duplicateCount === 0, "Listening duplicate count is wrong");
assert(!Object.hasOwn(listeningCatalogue, "prefix"), "Public catalogue exposed the storage prefix");
assert(!Object.hasOwn(listeningCatalogue, "unmapped"), "Public catalogue exposed unmapped storage keys");
assert(!Object.hasOwn(listeningCatalogue, "duplicates"), "Public catalogue exposed duplicate storage keys");
for (const track of listeningCatalogue.tracks) {
  assert(
    JSON.stringify(Object.keys(track).sort()) === JSON.stringify(["part", "practice", "url"]),
    "Public track leaked storage metadata"
  );
}
assert(
  /IELTS%20Listening%20-%20Recordings\/IELTS%20Practice%201%20-%20Part%201\.mp3$/.test(listeningCatalogue.tracks[0].url),
  "Listening URL was not safely encoded"
);

console.log(JSON.stringify({
  indexes: indexes.map(({ file, value }) => ({
    file,
    release: value.meta.release || value.audioPathPrefix,
    complete: value.meta.r2UploadComplete,
    indexedRecordings: value.meta.entryCount,
    packs: value.meta.packCount,
  })),
  results,
  ifRangeMismatchStatus: ifRangeMismatch.status,
  suffixRangeStatus: suffix.status,
  rangedHeadStatus: rangedHead.status,
  invalidRangeStatus: invalidRange.status,
  conditionalStatus: conditional.status,
  health,
  listeningCatalogue,
}, null, 2));
