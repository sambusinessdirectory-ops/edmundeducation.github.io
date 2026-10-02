#!/usr/bin/env node
// Exercise both immutable Polysemy pack routes with byte-range R2 fixtures.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const worker = (await import(pathToFileURL(path.join(root, 'workers/edmund-audio/src/index.js')))).default;
const files = ['polysemy-pack-index.json', 'polysemy-pack-index-2.json'];
const host = 'https://edmund-neural-audio.edmundeducation.workers.dev/';
const assert = (condition, message) => {if (!condition) throw Error(message);};

for (const file of files) {
  const index = JSON.parse(fs.readFileSync(path.join(root, 'workers/edmund-audio/src', file)));
  if (!index.meta?.r2UploadComplete) {
    assert(file.endsWith('-2.json'), `${file} unexpectedly incomplete`);
    continue;
  }
  const shard = Object.keys(index.entries).find(key => Object.keys(index.entries[key]).length);
  const suffix = Object.keys(index.entries[shard])[0];
  const digest = shard + suffix;
  const [offset, length] = index.entries[shard][suffix];
  const pack = index.packs[shard];
  assert(pack.key.startsWith(index.audioPathPrefix), `${file}: wrong pack prefix`);
  assert(length > 1000 && pack.size >= offset + length, `${file}: invalid entry bounds`);
  const full = Buffer.alloc(length, 0x5a);
  const env = {EDMUND_ASSETS: {
    head: async key => key === pack.key ? {size: pack.size} : null,
    get: async (key, options = {}) => {
      assert(key === pack.key, `${file}: wrong pack requested`);
      const range = options.range || {offset: 0, length: pack.size};
      assert(range.offset >= offset && range.offset + range.length <= offset + length,
        `${file}: wrong R2 byte range`);
      return {body: full.subarray(range.offset - offset, range.offset - offset + range.length)};
    },
  }};
  const url = `${host}${index.audioPathPrefix}${shard}/${digest}.mp3`;
  const response = await worker.fetch(new Request(url), env);
  assert(response.status === 200, `${file}: full fetch returned ${response.status}`);
  assert(response.headers.get('content-type') === 'audio/mpeg', `${file}: wrong MIME`);
  assert((await response.arrayBuffer()).byteLength === length, `${file}: wrong full length`);
  const partial = await worker.fetch(new Request(url, {headers: {Range: 'bytes=10-29'}}), env);
  assert(partial.status === 206, `${file}: range fetch returned ${partial.status}`);
  assert((await partial.arrayBuffer()).byteLength === 20, `${file}: wrong range length`);
  const head = await worker.fetch(new Request(url, {method: 'HEAD'}), env);
  assert(head.status === 200 && Number(head.headers.get('content-length')) === length,
    `${file}: HEAD failed`);
  console.log(`${file}: full, range, and HEAD passed`);
}
