#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";


const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicHost = "https://edmund-neural-audio.edmundeducation.workers.dev";
const fourthRelease = "v1-flashcard-expansion-20260801-1";
const indexFiles = [
  "flashcard-pack-index.json",
  "flashcard-pack-index-passage2.json",
  "flashcard-pack-index-reading-expansion.json",
  "flashcard-pack-index-flashcard-expansion.json",
];
const indexes = indexFiles.map((file) => ({
  file,
  value: JSON.parse(
    fs.readFileSync(path.join(root, "workers/edmund-audio/src", file), "utf8")
  ),
}));


function assert(condition, message) {
  if (!condition) throw new Error(message);
}


const healthResponse = await fetch(`${publicHost}/health`, { cache: "no-store" });
assert(healthResponse.status === 200, `Health status was ${healthResponse.status}`);
const health = await healthResponse.json();
assert(
  health?.ok === true && health?.products?.includes("flashcards"),
  "Health response omits flashcards"
);

const prefixes = indexes.map(({ value }) => value.audioPathPrefix);
assert(
  prefixes.every((prefix, index) =>
    prefixes.every((other, otherIndex) =>
      index === otherIndex || (!prefix.startsWith(other) && !other.startsWith(prefix))
    )
  ),
  "Audio release URL prefixes overlap"
);

const results = [];
for (const { file, value: index } of indexes) {
  assert(index.cloudBaseUrl === publicHost, `${file} has an unexpected public host`);
  if (!index.meta?.r2UploadComplete) {
    assert(
      index.meta?.release === fourthRelease &&
        index.meta.entryCount === 0 &&
        Object.keys(index.entries).length === 0,
      `${file} is unexpectedly incomplete`
    );
    results.push({ release: index.meta.release, status: "pending", testedPacks: 0 });
    continue;
  }

  const allPrefixes = Object.keys(index.entries).sort();
  assert(allPrefixes.length === index.meta.packCount, `${file} pack count is inconsistent`);
  const prefixesToTest = index.meta.release === fourthRelease
    ? allPrefixes
    : allPrefixes.slice(0, 1);
  let testedPacks = 0;
  for (const prefix of prefixesToTest) {
    const suffix = Object.keys(index.entries[prefix] || {}).sort()[0];
    assert(suffix, `${file}/${prefix} has no indexed recording`);
    const digest = `${prefix}${suffix}`;
    const [offset, length] = index.entries[prefix][suffix];
    const url = `${index.cloudBaseUrl}/${index.audioPathPrefix}${prefix}/${digest}.mp3`;

    const head = await fetch(url, { method: "HEAD", cache: "no-store" });
    assert(head.status === 200, `${file}/${prefix}: HEAD status was ${head.status}`);
    assert(
      Number(head.headers.get("content-length")) === length,
      `${file}/${prefix}: HEAD length mismatch`
    );
    assert(
      head.headers.get("accept-ranges") === "bytes",
      `${file}/${prefix}: HEAD omits byte ranges`
    );
    assert(
      head.headers.get("etag") === `"${digest}"`,
      `${file}/${prefix}: ETag mismatch`
    );

    const range = await fetch(url, {
      cache: "no-store",
      headers: { Range: "bytes=10-99" },
    });
    const rangeBytes = Buffer.from(await range.arrayBuffer());
    assert(range.status === 206, `${file}/${prefix}: Range status was ${range.status}`);
    assert(
      range.headers.get("content-range") === `bytes 10-99/${length}`,
      `${file}/${prefix}: Range metadata mismatch`
    );
    assert(rangeBytes.length === 90, `${file}/${prefix}: Range returned wrong byte count`);

    if (index.meta.release === fourthRelease) {
      const packPath = path.join(
        root,
        `.flashcards-audio-build/r2-packs-${fourthRelease}/${prefix}.bin`
      );
      assert(fs.existsSync(packPath), `Local verification pack is missing: ${packPath}`);
      const packBytes = fs.readFileSync(packPath);
      const expected = packBytes.subarray(offset, offset + length);
      assert(expected.length === length, `${file}/${prefix}: local pack range is invalid`);
      const full = await fetch(url, { cache: "no-store" });
      const fullBytes = Buffer.from(await full.arrayBuffer());
      assert(full.status === 200, `${file}/${prefix}: full status was ${full.status}`);
      assert(fullBytes.equals(expected), `${file}/${prefix}: live bytes differ from local pack`);
      assert(
        rangeBytes.equals(expected.subarray(10, 100)),
        `${file}/${prefix}: live Range differs from local pack`
      );
    } else if (index.meta.release === "v1-reading-expansion-20260731-1") {
      const local = path.join(
        root,
        `assets/flashcards/audio/edmund-neural/v1/${prefix}/${digest}.mp3`
      );
      if (fs.existsSync(local)) {
        const expected = fs.readFileSync(local);
        const full = await fetch(url, { cache: "no-store" });
        const fullBytes = Buffer.from(await full.arrayBuffer());
        assert(full.status === 200, `Reading expansion full status was ${full.status}`);
        assert(fullBytes.equals(expected), "Reading expansion live bytes differ from source MP3");
        assert(rangeBytes.equals(expected.subarray(10, 100)), "Reading expansion Range mismatch");
      }
    }
    testedPacks += 1;
  }
  results.push({
    release: index.meta.release || index.audioPathPrefix,
    status: "complete",
    indexedRecordings: index.meta.entryCount,
    packs: index.meta.packCount,
    testedPacks,
  });
}

const newestComplete = [...indexes].reverse().find(({ value }) => value.meta?.r2UploadComplete)?.value;
const unknown = await fetch(
  `${publicHost}/${newestComplete.audioPathPrefix}00/000000000000000000000000.mp3`,
  { cache: "no-store" }
);
assert(unknown.status === 404, `Unknown recording status was ${unknown.status}`);

console.log(JSON.stringify({ health, releases: results, unknownStatus: unknown.status }, null, 2));
