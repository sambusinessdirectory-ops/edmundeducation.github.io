#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { validateReadingAudioTimings } from '../reading-comprehension-features.mjs';
import worker from '../workers/edmund-audio/src/index.js';

const root = new URL('../', import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, root), 'utf8');
const json = (path) => JSON.parse(read(path));
const context = { window: {} };
vm.runInNewContext(read('reading-comprehension-audio-manifest.js'), context);
const manifest = context.window.EDMUND_READING_AUDIO;
const meta = context.window.EDMUND_READING_AUDIO_META;
const catalogue = json('reading-comprehension-catalogue.json').articles;
const cloud = 'https://edmund-neural-audio.edmundeducation.workers.dev';
const prefix = 'assets/reading-comprehension/audio/edmund-neural/';
const policy = read('reading-comprehension.html').match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)[1];
const mediaSources = policy.split(';').find((directive) => directive.trim().startsWith('media-src ')).trim().split(/\s+/).slice(1);
assert.ok(mediaSources.includes(cloud), 'Browser policy must allow the reading audio server');
assert.ok(!mediaSources.includes('*'), 'Do not broadly relax media security');
let covered = 0;
for (const article of catalogue) {
  const entry = manifest[article.id];
  assert.equal(article.audio, Boolean(entry?.src), `${article.id}: catalogue audio flag`);
  if (!entry) continue;
  covered++;
  const data = json(`reading-comprehension-data/${article.id}.json`);
  const source = createHash('sha256').update(data.paragraphs.map((p) => p.text).join('\n\n')).digest('hex');
  assert.equal(entry.sourceSha256, source, `${article.id}: audio source drift`);
  const timing = entry.timingsSrc ? json(entry.timingsSrc.slice(1)) : { articleId: article.id, sourceSha256: source, words: entry.words };
  assert.ok(validateReadingAudioTimings(timing, entry, data), `${article.id}: invalid word timings`);
  assert.equal(entry.paragraphs.length, data.paragraphs.length, `${article.id}: paragraph count`);
  let previous = 0;
  for (const [index, range] of entry.paragraphs.entries()) {
    assert.equal(range.number, data.paragraphs[index].number);
    assert.ok(previous <= range.start && range.start < range.end && range.end <= entry.duration + 0.002);
    previous = range.end;
  }
  assert.ok(entry.path.startsWith(prefix) && !entry.path.includes('..'));
  if (entry.src.startsWith(cloud)) {
    assert.equal(entry.src, `${cloud}/${entry.path}`);
    assert.match(entry.audioSha256, /^[0-9a-f]{64}$/);
    assert.ok(entry.bytes > 1000);
    assert.match(entry.timingsSrc, /^\/reading-comprehension-audio-data\/[a-z0-9-]+\.json$/);
    assert.equal(entry.words, undefined, 'Bulk word timings must load per article');
  } else {
    assert.equal(entry.src, `/${entry.path}`);
    assert.ok(fs.statSync(new URL(entry.path, root)).size > 1000);
  }
}
assert.equal(meta.language, 'en-gb');
assert.equal(meta.speed, 1.05);
if (meta.complete || process.argv.includes('--require-complete')) {
  assert.equal(covered, catalogue.length, 'Every passage must have narration');
  assert.equal(meta.count, Object.keys(manifest).length);
  assert.equal(meta.catalogueCount, catalogue.length);
}

const article = { id: 'test', paragraphs: [{ number: 1, text: "We're learning." }] };
const item = { sourceSha256: 'abc', wordCount: 2, duration: 2 };
const timing = { articleId: 'test', sourceSha256: 'abc', words: [{ label: "We're", start: 0, end: 1 }, { label: 'learning', start: 1, end: 2 }] };
assert.ok(validateReadingAudioTimings(timing, item, article));
assert.equal(validateReadingAudioTimings({ ...timing, articleId: 'other' }, item, article), false);
assert.equal(validateReadingAudioTimings({ ...timing, sourceSha256: 'other' }, item, article), false);
assert.equal(validateReadingAudioTimings({ ...timing, words: timing.words.slice(1) }, item, article), false);
assert.equal(validateReadingAudioTimings({ ...timing, words: [{ ...timing.words[0], start: NaN }, timing.words[1]] }, item, article), false);
assert.equal(validateReadingAudioTimings(timing, item, { ...article, paragraphs: [{ text: 'Different words.' }] }), false);

// Exercise the actual asynchronous loader, including navigation while its fetch is pending.
const readingSource = read('reading-comprehension.js');
const loaderSource = readingSource.slice(readingSource.indexOf('async function loadAudioTimings('), readingSource.indexOf('function setupAudio()'));
let finishFetch;
const cache = new Map();
const pendingItem = { ...item, timingsSrc: '/reading-comprehension-audio-data/test.json' };
const loaderState = { audioItem: pendingItem, data: article };
const sync = { disabled: true };
const loader = vm.createContext({ state: loaderState, audioTimingCache: cache, el: { sync }, validateReadingAudioTimings,
  syncWord() {}, fetch: () => new Promise((resolve) => { finishFetch = resolve; }) });
vm.runInContext(loaderSource, loader);
const pendingLoad = loader.loadAudioTimings(pendingItem, article);
loaderState.audioItem = { ...item };
finishFetch({ ok: true, json: async () => timing });
await pendingLoad;
assert.equal(pendingItem.words, undefined, 'A late response must not update another article');
assert.equal(sync.disabled, true);
loaderState.audioItem = pendingItem;
await loader.loadAudioTimings(pendingItem, article);
assert.equal(pendingItem.words, timing.words);
assert.equal(sync.disabled, false);
cache.clear();
loader.fetch = async () => ({ ok: false, status: 503 });
await assert.rejects(loader.loadAudioTimings(pendingItem, article), /503/);
assert.equal(cache.size, 0, 'Failed downloads must be retryable');

const key = `${prefix}v1-catalogue-20260828-1/aa/p1-test-aaaaaaaaaaaaaaaaaaaaaaaa.mp3`;
const audio = Buffer.alloc(4096, 0x55);
const metadata = { size: audio.length, httpEtag: '"reading-test"', writeHttpMetadata(headers) { headers.set('Content-Type', 'audio/mpeg'); } };
const env = { EDMUND_ASSETS: {
  async head(requested) { return requested === key ? metadata : null; },
  async get(requested, options) {
    if (requested !== key) return null;
    if (options.onlyIf?.get('If-None-Match') === metadata.httpEtag) return metadata;
    if (options.range) return { ...metadata, body: audio.subarray(10, 100), range: { offset: 10, length: 90 } };
    return { ...metadata, body: audio };
  }
} };
const url = `${cloud}/${key}`;
const full = await worker.fetch(new Request(url), env);
assert.equal(full.status, 200);
assert.equal(full.headers.get('access-control-allow-origin'), '*');
assert.equal(full.headers.get('accept-ranges'), 'bytes');
assert.match(full.headers.get('cache-control'), /immutable/);
assert.ok(Buffer.from(await full.arrayBuffer()).equals(audio));
const head = await worker.fetch(new Request(url, { method: 'HEAD' }), env);
assert.equal(head.status, 200);
assert.equal(Number(head.headers.get('content-length')), audio.length);
const partial = await worker.fetch(new Request(url, { headers: { Range: 'bytes=10-99' } }), env);
assert.equal(partial.status, 206);
assert.equal(partial.headers.get('content-range'), `bytes 10-99/${audio.length}`);
assert.ok(Buffer.from(await partial.arrayBuffer()).equals(audio.subarray(10, 100)));
assert.equal((await worker.fetch(new Request(url, { headers: { 'If-None-Match': metadata.httpEtag } }), env)).status, 304);
assert.equal((await worker.fetch(new Request(url, { method: 'POST' }), env)).status, 405);
assert.equal((await worker.fetch(new Request(`${cloud}/private/reading.mp3`), env)).status, 404);
assert.equal((await worker.fetch(new Request(`${cloud}/${prefix}missing.mp3`), env)).status, 404);
console.log(`Reading audio: ${covered}/${catalogue.length} recorded; source matching, lazy timings, British voice, and R2 playback/ranges passed.`);
