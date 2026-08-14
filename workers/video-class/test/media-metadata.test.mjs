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

function joinBytes(...parts) {
  const length = parts.reduce((total, part) => total + part.byteLength, 0);
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const part of parts) {
    bytes.set(part, offset);
    offset += part.byteLength;
  }
  return bytes;
}

function isoBox(type, ...payloadParts) {
  const payload = joinBytes(...payloadParts);
  const bytes = new Uint8Array(8 + payload.byteLength);
  new DataView(bytes.buffer).setUint32(0, bytes.byteLength);
  bytes.set(new TextEncoder().encode(type), 4);
  bytes.set(payload, 8);
  return bytes;
}

function isoMovie(codec, extraMovieBox = null) {
  const handlerPayload = new Uint8Array(12);
  handlerPayload.set(new TextEncoder().encode("vide"), 8);
  const sampleDescriptionHeader = new Uint8Array(8);
  new DataView(sampleDescriptionHeader.buffer).setUint32(4, 1);
  const sampleEntry = isoBox(codec, new Uint8Array(78));
  const sampleDescription = isoBox("stsd", sampleDescriptionHeader, sampleEntry);
  const sampleTable = isoBox("stbl", sampleDescription);
  const mediaInfo = isoBox("minf", sampleTable);
  const media = isoBox("mdia", isoBox("hdlr", handlerPayload), mediaInfo);
  const track = isoBox("trak", media);
  return isoBox("moov", movieHeaderV0(1000, 335_250), track, ...(extraMovieBox ? [extraMovieBox] : []));
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

test("reads the video sample-entry codec from a valid ISO movie hierarchy", () => {
  assert.deepEqual(__test.inspectIsoMovieMetadata(isoMovie("avc1")), {
    durationSeconds: 336,
    videoCodecs: ["avc1"]
  });
  assert.deepEqual(__test.inspectIsoMovieMetadata(isoMovie("hvc1"))?.videoCodecs, ["hvc1"]);
  assert.deepEqual(__test.inspectIsoMovieMetadata(isoMovie("hev1"))?.videoCodecs, ["hev1"]);
});

test("does not mistake an unrelated HEVC-looking metadata string for the video codec", () => {
  const metadataText = isoBox("udta", new TextEncoder().encode("hvc1"));
  assert.deepEqual(__test.inspectIsoMovieMetadata(isoMovie("avc1", metadataText))?.videoCodecs, ["avc1"]);
});

test("rejects malformed ISO sample descriptions instead of guessing a codec", () => {
  const malformed = isoMovie("avc1").slice();
  const stsdOffset = new TextDecoder().decode(malformed).indexOf("stsd");
  new DataView(malformed.buffer).setUint32(stsdOffset + 8, 2);
  assert.equal(__test.inspectIsoMovieMetadata(malformed), null);
});
