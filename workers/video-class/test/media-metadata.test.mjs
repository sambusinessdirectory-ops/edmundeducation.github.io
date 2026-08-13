import assert from "node:assert/strict";
import test from "node:test";

import { __test } from "../src/index.js";

function movieHeaderV0(timescale, duration) {
  const bytes = new Uint8Array(28);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, bytes.byteLength);
  bytes.set(new TextEncoder().encode("mvhd"), 4);
  view.setUint8(8, 0);
  view.setUint32(20, timescale);
  view.setUint32(24, duration);
  return bytes;
}

function movieHeaderV1(timescale, duration) {
  const bytes = new Uint8Array(40);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, bytes.byteLength);
  bytes.set(new TextEncoder().encode("mvhd"), 4);
  view.setUint8(8, 1);
  view.setUint32(28, timescale);
  view.setBigUint64(32, BigInt(duration));
  return bytes;
}

test("accepts animated GIF as a private thumbnail type", () => {
  assert.equal(__test.safeImageContentType("image/gif"), "image/gif");
  assert.equal(__test.safeImageContentType("text/html"), "");
});

test("byte ranges support bounded, open-ended, and suffix seeking", () => {
  assert.deepEqual(__test.parseByteRange("bytes=100-199", 1000), { offset: 100, end: 199, length: 100 });
  assert.deepEqual(__test.parseByteRange("bytes=900-", 1000), { offset: 900, end: 999, length: 100 });
  assert.deepEqual(__test.parseByteRange("bytes=-50", 1000), { offset: 950, end: 999, length: 50 });
  assert.equal(__test.parseByteRange("bytes=1000-", 1000), null);
  assert.equal(__test.parseByteRange("bytes=1-2,4-5", 1000), null);
});

test("reads integer lesson duration from version 0 MP4/MOV metadata", () => {
  assert.equal(__test.findIsoMediaDurationSeconds(movieHeaderV0(1000, 335_250)), 336);
});

test("reads integer lesson duration from version 1 MP4/MOV metadata", () => {
  assert.equal(__test.findIsoMediaDurationSeconds(movieHeaderV1(60_000, 20_160_000)), 336);
});

test("rejects missing, indefinite, and implausibly long movie durations", () => {
  assert.equal(__test.findIsoMediaDurationSeconds(new Uint8Array(64)), null);
  assert.equal(__test.findIsoMediaDurationSeconds(movieHeaderV0(1000, 0xffffffff)), null);
  assert.equal(__test.findIsoMediaDurationSeconds(movieHeaderV0(1, 86_401)), null);
});
