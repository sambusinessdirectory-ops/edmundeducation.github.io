#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";


const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const passage1PackIndex = JSON.parse(
  fs.readFileSync(path.join(root, "workers/edmund-audio/src/flashcard-pack-index.json"), "utf8")
);
const passage2PackIndex = JSON.parse(
  fs.readFileSync(
    path.join(root, "workers/edmund-audio/src/flashcard-pack-index-passage2.json"),
    "utf8"
  )
);
const readingExpansionPackIndex = JSON.parse(
  fs.readFileSync(
    path.join(
      root,
      "workers/edmund-audio/src/flashcard-pack-index-reading-expansion.json"
    ),
    "utf8"
  )
);
const packIndexes = [
  passage1PackIndex,
  passage2PackIndex,
  readingExpansionPackIndex
];
const packIndex = passage1PackIndex;
const workerModule = await import(
  pathToFileURL(path.join(root, "workers/edmund-audio/src/index.js")).href
);
const worker = workerModule.default;


function assert(condition, message) {
  if (!condition) throw new Error(message);
}


assert(
  passage1PackIndex.audioPathPrefix ===
    "assets/flashcards/audio/edmund-neural/v1-passage1-20260722/",
  "The established Passage 1 public audio URL prefix changed"
);
assert(
  passage2PackIndex.audioPathPrefix ===
    "assets/flashcards/audio/edmund-neural/v1-passage2-20260730-1/",
  "The Passage 2 public audio URL prefix is wrong"
);
assert(
  readingExpansionPackIndex.audioPathPrefix ===
    "assets/flashcards/audio/edmund-neural/v1-reading-expansion-20260731-1/",
  "The Reading expansion public audio URL prefix is wrong"
);
assert(
  readingExpansionPackIndex.meta?.release === "v1-reading-expansion-20260731-1",
  "The Reading expansion release metadata is wrong"
);
assert(
  readingExpansionPackIndex.cloudBaseUrl === "https://edmund-neural-audio.edmundeducation.workers.dev",
  "The Reading expansion public host is wrong"
);
assert(readingExpansionPackIndex.meta?.baselineEntryCount === 91338, "The immutable baseline entry count changed");
assert(
  readingExpansionPackIndex.meta?.baselineManifestSha256 === "2d496c54e8d8104c89eff5ef28ec230c2a21e755af05b0d35fef19981b3bd950",
  "The immutable baseline manifest hash changed"
);
assert(
  readingExpansionPackIndex.meta?.baselineMappingSha256 === "4cf616f93a6b2ff5066fca610b8cae0ca8750c6429b62eac641a27974c0369c0",
  "The immutable baseline mapping hash changed"
);
assert(
  readingExpansionPackIndex.meta?.baselineCorpusSha256 === "94cc0319aba7d0d024c86a811cfb011dee35ebaf4dd641638a6ee603065298fc",
  "The immutable baseline corpus hash changed"
);
const packIndexPrefixes = packIndexes.map(index => index.audioPathPrefix);
assert(
  packIndexPrefixes.every((prefix, index) =>
    packIndexPrefixes.every((otherPrefix, otherIndex) =>
      index === otherIndex || (!prefix.startsWith(otherPrefix) && !otherPrefix.startsWith(prefix))
    )
  ),
  "Worker pack-index precedence is ambiguous because release URL prefixes overlap"
);
assert(
  packIndexes.every(index => index.meta?.r2UploadComplete === true),
  "Every Worker pack index must be marked as fully uploaded"
);


const prefix = Object.keys(packIndex.entries).sort()[0];
assert(prefix, "Flashcard pack index has no entries");
const suffix = Object.keys(packIndex.entries[prefix]).sort()[0];
const digest = `${prefix}${suffix}`;
const [offset, length] = packIndex.entries[prefix][suffix];
const pack = packIndex.packs[prefix];
const passage2Prefix = Object.keys(passage2PackIndex.entries).sort()[0];
assert(passage2Prefix, "Passage 2 flashcard pack index has no entries");
const passage2Suffix = Object.keys(passage2PackIndex.entries[passage2Prefix]).sort()[0];
const passage2Digest = `${passage2Prefix}${passage2Suffix}`;
const [passage2Offset, passage2Length] =
  passage2PackIndex.entries[passage2Prefix][passage2Suffix];
const passage2Pack = passage2PackIndex.packs[passage2Prefix];
const readingExpansionPrefix = Object.keys(readingExpansionPackIndex.entries).sort()[0];
assert(readingExpansionPrefix, "Reading expansion flashcard pack index has no entries");
const readingExpansionSuffix = Object.keys(
  readingExpansionPackIndex.entries[readingExpansionPrefix]
).sort()[0];
const readingExpansionDigest = `${readingExpansionPrefix}${readingExpansionSuffix}`;
const [readingExpansionOffset, readingExpansionLength] =
  readingExpansionPackIndex.entries[readingExpansionPrefix][readingExpansionSuffix];
const readingExpansionPack = readingExpansionPackIndex.packs[readingExpansionPrefix];
const packFixtures = new Map([
  [pack.key, { fill: 0x5a, pack }],
  [passage2Pack.key, { fill: 0x6b, pack: passage2Pack }],
  [readingExpansionPack.key, { fill: 0x7c, pack: readingExpansionPack }]
]);
const getCalls = [];


const env = {
  EDMUND_ASSETS: {
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
    }
  }
};
const audioUrl = `${packIndex.cloudBaseUrl}/${packIndex.audioPathPrefix}${prefix}/${digest}.mp3`;


const fullResponse = await worker.fetch(new Request(audioUrl), env);
assert(fullResponse.status === 200, `Full request status was ${fullResponse.status}`);
assert(fullResponse.headers.get("content-type") === "audio/mpeg", "Full request MIME type is wrong");
assert(Number(fullResponse.headers.get("content-length")) === length, "Full request length is wrong");
const expectedAudio = Buffer.alloc(length, 0x5a);
const actualAudio = Buffer.from(await fullResponse.arrayBuffer());
assert(actualAudio.equals(expectedAudio), "Packed response differs from the source MP3");
assert(getCalls[0]?.offset === offset && getCalls[0]?.length === length, "Full pack lookup range is wrong");


const headResponse = await worker.fetch(new Request(audioUrl, { method: "HEAD" }), env);
assert(headResponse.status === 200, `HEAD status was ${headResponse.status}`);
assert(Number(headResponse.headers.get("content-length")) === length, "HEAD length is wrong");


const rangeResponse = await worker.fetch(
  new Request(audioUrl, { headers: { Range: "bytes=10-99" } }),
  env
);
assert(rangeResponse.status === 206, `Range status was ${rangeResponse.status}`);
assert(rangeResponse.headers.get("content-range") === `bytes 10-99/${length}`, "Range header is wrong");
const rangeBytes = Buffer.from(await rangeResponse.arrayBuffer());
assert(rangeBytes.equals(expectedAudio.subarray(10, 100)), "Packed range differs from the source MP3");
assert(getCalls[1]?.offset === offset + 10 && getCalls[1]?.length === 90, "Partial pack lookup range is wrong");


const ifRangeMismatchResponse = await worker.fetch(
  new Request(audioUrl, { headers: { Range: "bytes=10-99", "If-Range": '"stale-release"' } }),
  env
);
assert(ifRangeMismatchResponse.status === 200, `If-Range mismatch status was ${ifRangeMismatchResponse.status}`);
assert(!ifRangeMismatchResponse.headers.has("content-range"), "If-Range mismatch incorrectly returned a partial response");
assert(Number(ifRangeMismatchResponse.headers.get("content-length")) === length, "If-Range mismatch length is wrong");
assert(
  getCalls[2]?.offset === offset && getCalls[2]?.length === length,
  "If-Range mismatch did not fetch the full recording"
);


const suffixLength = Math.min(64, length);
const suffixResponse = await worker.fetch(
  new Request(audioUrl, { headers: { Range: `bytes=-${suffixLength}` } }),
  env
);
assert(suffixResponse.status === 206, `Suffix range status was ${suffixResponse.status}`);
assert(
  suffixResponse.headers.get("content-range") === `bytes ${length - suffixLength}-${length - 1}/${length}`,
  "Suffix range header is wrong"
);
const suffixBytes = Buffer.from(await suffixResponse.arrayBuffer());
assert(suffixBytes.equals(expectedAudio.subarray(length - suffixLength)), "Packed suffix range is wrong");
assert(
  getCalls[3]?.offset === offset + length - suffixLength && getCalls[3]?.length === suffixLength,
  "Suffix pack lookup range is wrong"
);


const rangedHeadResponse = await worker.fetch(
  new Request(audioUrl, { method: "HEAD", headers: { Range: "bytes=0-31" } }),
  env
);
assert(rangedHeadResponse.status === 206, `Ranged HEAD status was ${rangedHeadResponse.status}`);
assert(rangedHeadResponse.headers.get("content-range") === `bytes 0-31/${length}`, "Ranged HEAD header is wrong");
assert(Number(rangedHeadResponse.headers.get("content-length")) === 32, "Ranged HEAD length is wrong");


const invalidRange = await worker.fetch(
  new Request(audioUrl, { headers: { Range: `bytes=${length}-` } }),
  env
);
assert(invalidRange.status === 416, `Invalid range status was ${invalidRange.status}`);


const unknownResponse = await worker.fetch(
  new Request(`${packIndex.cloudBaseUrl}/${packIndex.audioPathPrefix}00/not-a-digest.mp3`),
  env
);
assert(unknownResponse.status === 404, `Unknown flashcard status was ${unknownResponse.status}`);


const optionsResponse = await worker.fetch(new Request(audioUrl, { method: "OPTIONS" }), env);
assert(optionsResponse.status === 204, `OPTIONS status was ${optionsResponse.status}`);
assert(optionsResponse.headers.get("access-control-allow-origin") === "*", "OPTIONS CORS is missing");


const etag = `"${digest}"`;
const cachedResponse = await worker.fetch(
  new Request(audioUrl, { headers: { "If-None-Match": etag } }),
  env
);
assert(cachedResponse.status === 304, `Conditional status was ${cachedResponse.status}`);


const passage2AudioUrl =
  `${passage2PackIndex.cloudBaseUrl}/${passage2PackIndex.audioPathPrefix}` +
  `${passage2Prefix}/${passage2Digest}.mp3`;
const passage2Response = await worker.fetch(new Request(passage2AudioUrl), env);
assert(
  passage2Response.status === 200,
  `Passage 2 full request status was ${passage2Response.status}`
);
assert(
  Number(passage2Response.headers.get("content-length")) === passage2Length,
  "Passage 2 full request length is wrong"
);
const expectedPassage2Audio = Buffer.alloc(passage2Length, 0x6b);
const actualPassage2Audio = Buffer.from(await passage2Response.arrayBuffer());
assert(
  actualPassage2Audio.equals(expectedPassage2Audio),
  "Passage 2 packed response differs from the source MP3"
);
const passage2GetCall = getCalls.at(-1);
assert(
  passage2GetCall?.key === passage2Pack.key
    && passage2GetCall?.offset === passage2Offset
    && passage2GetCall?.length === passage2Length,
  "Passage 2 pack lookup range is wrong"
);

const passage2HeadResponse = await worker.fetch(
  new Request(passage2AudioUrl, { method: "HEAD" }),
  env
);
assert(
  passage2HeadResponse.status === 200,
  `Passage 2 HEAD status was ${passage2HeadResponse.status}`
);
assert(
  Number(passage2HeadResponse.headers.get("content-length")) === passage2Length,
  "Passage 2 HEAD length is wrong"
);

const passage2UnknownResponse = await worker.fetch(
  new Request(
    `${passage2PackIndex.cloudBaseUrl}/` +
      `${passage2PackIndex.audioPathPrefix}00/not-a-digest.mp3`
  ),
  env
);
assert(
  passage2UnknownResponse.status === 404,
  `Unknown Passage 2 flashcard status was ${passage2UnknownResponse.status}`
);


const readingExpansionAudioUrl =
  `${readingExpansionPackIndex.cloudBaseUrl}/${readingExpansionPackIndex.audioPathPrefix}` +
  `${readingExpansionPrefix}/${readingExpansionDigest}.mp3`;
const readingExpansionResponse = await worker.fetch(
  new Request(readingExpansionAudioUrl),
  env
);
assert(
  readingExpansionResponse.status === 200,
  `Reading expansion full request status was ${readingExpansionResponse.status}`
);
assert(
  Number(readingExpansionResponse.headers.get("content-length")) ===
    readingExpansionLength,
  "Reading expansion full request length is wrong"
);
const expectedReadingExpansionAudio = Buffer.alloc(readingExpansionLength, 0x7c);
const actualReadingExpansionAudio = Buffer.from(
  await readingExpansionResponse.arrayBuffer()
);
assert(
  actualReadingExpansionAudio.equals(expectedReadingExpansionAudio),
  "Reading expansion packed response differs from the source MP3"
);
const readingExpansionGetCall = getCalls.at(-1);
assert(
  readingExpansionGetCall?.key === readingExpansionPack.key
    && readingExpansionGetCall?.offset === readingExpansionOffset
    && readingExpansionGetCall?.length === readingExpansionLength,
  "Reading expansion pack lookup range is wrong"
);

const readingExpansionHeadResponse = await worker.fetch(
  new Request(readingExpansionAudioUrl, { method: "HEAD" }),
  env
);
assert(
  readingExpansionHeadResponse.status === 200,
  `Reading expansion HEAD status was ${readingExpansionHeadResponse.status}`
);
assert(
  Number(readingExpansionHeadResponse.headers.get("content-length")) ===
    readingExpansionLength,
  "Reading expansion HEAD length is wrong"
);

const readingExpansionUnknownResponse = await worker.fetch(
  new Request(
    `${readingExpansionPackIndex.cloudBaseUrl}/` +
      `${readingExpansionPackIndex.audioPathPrefix}00/not-a-digest.mp3`
  ),
  env
);
assert(
  readingExpansionUnknownResponse.status === 404,
  `Unknown Reading expansion flashcard status was ${readingExpansionUnknownResponse.status}`
);


const healthResponse = await worker.fetch(new Request(`${packIndex.cloudBaseUrl}/health`), env);
const health = await healthResponse.json();
assert(health.products.includes("flashcards"), "Worker health response omits flashcards");


console.log(JSON.stringify({
  indexes: packIndexes.map(index => ({
    audioPathPrefix: index.audioPathPrefix,
    indexedRecordings: index.meta.entryCount,
    packs: index.meta.packCount
  })),
  testedDigest: digest,
  testedPassage2Digest: passage2Digest,
  testedReadingExpansionDigest: readingExpansionDigest,
  testedBytes: length,
  testedPassage2Bytes: passage2Length,
  testedReadingExpansionBytes: readingExpansionLength,
  fullStatus: fullResponse.status,
  passage2FullStatus: passage2Response.status,
  readingExpansionFullStatus: readingExpansionResponse.status,
  rangeStatus: rangeResponse.status,
  ifRangeMismatchStatus: ifRangeMismatchResponse.status,
  suffixRangeStatus: suffixResponse.status,
  rangedHeadStatus: rangedHeadResponse.status,
  unknownStatus: unknownResponse.status,
  passage2UnknownStatus: passage2UnknownResponse.status,
  readingExpansionUnknownStatus: readingExpansionUnknownResponse.status,
  conditionalStatus: cachedResponse.status
}, null, 2));
