#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const indexFiles = [
  "flashcard-pack-index.json",
  "flashcard-pack-index-passage2.json",
  "flashcard-pack-index-reading-expansion.json",
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

const publicHost = "https://edmund-neural-audio.edmundeducation.workers.dev";
const healthResponse = await fetch(`${publicHost}/health`, { cache: "no-store" });
assert(healthResponse.status === 200, `Health status was ${healthResponse.status}`);
const health = await healthResponse.json();
assert(health?.ok === true && health?.products?.includes("flashcards"), "Health response omits flashcards");

const results = [];
for (const { file, value: index } of indexes) {
  assert(index.meta?.r2UploadComplete === true, `${file} is not marked uploaded`);
  assert(index.cloudBaseUrl === publicHost, `${file} has an unexpected public host`);
  const prefix = Object.keys(index.entries).sort()[0];
  const suffix = Object.keys(index.entries[prefix] || {}).sort()[0];
  assert(prefix && suffix, `${file} has no indexed recording`);
  const digest = `${prefix}${suffix}`;
  const [, length] = index.entries[prefix][suffix];
  const url = `${index.cloudBaseUrl}/${index.audioPathPrefix}${prefix}/${digest}.mp3`;

  const head = await fetch(url, { method: "HEAD", cache: "no-store" });
  assert(head.status === 200, `${file}: HEAD status was ${head.status}`);
  assert(Number(head.headers.get("content-length")) === length, `${file}: HEAD length mismatch`);
  assert(head.headers.get("accept-ranges") === "bytes", `${file}: HEAD omits byte ranges`);

  const range = await fetch(url, {
    cache: "no-store",
    headers: { Range: "bytes=10-99" },
  });
  const rangeBytes = Buffer.from(await range.arrayBuffer());
  assert(range.status === 206, `${file}: Range status was ${range.status}`);
  assert(
    range.headers.get("content-range") === `bytes 10-99/${length}`,
    `${file}: Range metadata mismatch`
  );
  assert(rangeBytes.length === 90, `${file}: Range returned ${rangeBytes.length} bytes`);

  if (index.meta.release === "v1-reading-expansion-20260731-1") {
    const local = fs.readFileSync(
      path.join(root, `assets/flashcards/audio/edmund-neural/v1/${prefix}/${digest}.mp3`)
    );
    assert(local.length === length, "Expansion local/index length mismatch");
    const full = await fetch(url, { cache: "no-store" });
    const fullBytes = Buffer.from(await full.arrayBuffer());
    assert(full.status === 200, `Expansion full status was ${full.status}`);
    assert(Number(full.headers.get("content-length")) === length, "Expansion full length mismatch");
    assert(fullBytes.equals(local), "Expansion live bytes differ from the source MP3");
    assert(rangeBytes.equals(local.subarray(10, 100)), "Expansion live Range differs from the source MP3");
  }

  results.push({
    release: index.meta.release,
    digest,
    bytes: length,
    headStatus: head.status,
    rangeStatus: range.status,
  });
}

const expansion = indexes.find(({ value }) => value.meta?.release === "v1-reading-expansion-20260731-1")?.value;
const unknown = await fetch(
  `${publicHost}/${expansion.audioPathPrefix}00/000000000000000000000000.mp3`,
  { cache: "no-store" }
);
assert(unknown.status === 404, `Unknown expansion recording status was ${unknown.status}`);

console.log(JSON.stringify({ health, releases: results, unknownStatus: unknown.status }, null, 2));
