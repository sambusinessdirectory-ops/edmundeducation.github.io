import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import worker from '../workers/edmund-audio/src/index.js';

const text = 'A useful phrase';
const digest = createHash('sha256').update(`af_heart\0${text}`).digest('hex');
const prefix = digest.slice(0, 2);
const bytes = new Uint8Array(2000);
bytes.set(new TextEncoder().encode('ID3TEST_AUDIO'));
const pack = new Uint8Array(10 + bytes.length);
pack.set(bytes, 10);
const index = { [digest]: [10, bytes.length] };
const calls = [];
const env = { EDMUND_ASSETS: {
  async get(key, options) {
    calls.push(key);
    if (key.endsWith(`${prefix}.index.json`)) return { json: async () => index };
    if (key.endsWith(`${prefix}.bin`)) {
      const { offset, length } = options.range;
      return { body: new Blob([pack.subarray(offset, offset + length)]).stream() };
    }
    return null;
  }
} };
const url = `https://example.workers.dev/assets/dse-argument-bank/audio/v1/${prefix}/${digest}.mp3`;
const whole = await worker.fetch(new Request(url), env);
assert.equal(whole.status, 200);
assert.equal(whole.headers.get('Content-Type'), 'audio/mpeg');
assert.equal((await whole.arrayBuffer()).byteLength, bytes.length);
const partial = await worker.fetch(new Request(url, { headers: { Range: 'bytes=3-6' } }), env);
assert.equal(partial.status, 206);
assert.equal(partial.headers.get('Content-Range'), `bytes 3-6/${bytes.length}`);
assert.equal(await partial.text(), 'TEST');
const missing = await worker.fetch(new Request(url.replace(digest, 'a'.repeat(64))), env);
assert.equal(missing.status, 404);
assert.ok(calls.some(key => key.endsWith(`${prefix}.bin`)));
console.log('DSE argument packed-audio Worker route passed');
