// Same strict MPEG Layer III validation as the Speaking recorder (2026-08-27).
const DEFAULT_MAX_ID3_BYTES = 65536;
const ABSOLUTE_MAX_ID3_BYTES = 262144;
const MAX_ID3_FILE_RATIO = 0.25;
const MIN_MP3_FRAMES = 24;
const MIN_MP3_DURATION_MS = 1000;
const MAX_TRAILING_PADDING_BYTES = 1024;

export function inspectMp3(bytes, options = {}) {
  if (!(bytes instanceof Uint8Array) || bytes.byteLength < 512) return null;
  let offset = 0;
  const end = bytes.byteLength;
  const allowedId3Bytes = Number.isSafeInteger(options.maxId3Bytes)
    ? Math.max(0, Math.min(options.maxId3Bytes, ABSOLUTE_MAX_ID3_BYTES))
    : DEFAULT_MAX_ID3_BYTES;
  let metadataBytes = 0;
  let audioBytes = 0;
  let paddingBytes = 0;

  if (end >= 10 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
    const version = bytes[3];
    const flags = bytes[5];
    if (version < 2 || version > 4 || bytes[4] === 0xFF || !validId3Flags(version, flags)) return null;
    if ((bytes[6] | bytes[7] | bytes[8] | bytes[9]) & 0x80) return null;
    const tagSize = (bytes[6] << 21) | (bytes[7] << 14) | (bytes[8] << 7) | bytes[9];
    if (tagSize > allowedId3Bytes) return null;
    const footerBytes = version === 4 && (flags & 0x10) ? 10 : 0;
    offset = 10 + tagSize + footerBytes;
    if (offset >= end) return null;
    metadataBytes = offset;
    if (metadataBytes > Math.floor(end * MAX_ID3_FILE_RATIO)) return null;
  }

  let frames = 0;
  let durationSeconds = 0;
  let streamVersion = null;
  let streamSampleRate = null;

  while (offset < end) {
    if (end - offset === 128 && bytes[offset] === 0x54 && bytes[offset + 1] === 0x41 && bytes[offset + 2] === 0x47) {
      metadataBytes += 128;
      offset = end;
      break;
    }
    if (frames > 0 && end - offset <= MAX_TRAILING_PADDING_BYTES && allZero(bytes, offset, end)) {
      paddingBytes = end - offset;
      offset = end;
      break;
    }
    const frame = parseMp3Frame(bytes, offset);
    if (!frame || offset + frame.length > end) return null;
    if (streamVersion === null) {
      streamVersion = frame.version;
      streamSampleRate = frame.sampleRate;
    } else if (frame.version !== streamVersion || frame.sampleRate !== streamSampleRate) {
      return null;
    }
    frames += 1;
    audioBytes += frame.length;
    durationSeconds += frame.samplesPerFrame / frame.sampleRate;
    offset += frame.length;
  }

  if (offset !== end || frames < MIN_MP3_FRAMES) return null;
  const durationMs = Math.round(durationSeconds * 1000);
  if (!Number.isSafeInteger(durationMs) || durationMs < MIN_MP3_DURATION_MS) return null;
  if (metadataBytes + paddingBytes > Math.floor(end * MAX_ID3_FILE_RATIO)) return null;
  return {
    durationMs,
    frames,
    sampleRate: streamSampleRate,
    audioBytes,
    metadataBytes,
    paddingBytes
  };
}

function validId3Flags(version, flags) {
  if (version === 2) return (flags & 0x3F) === 0;
  if (version === 3) return (flags & 0x1F) === 0;
  return (flags & 0x0F) === 0;
}

function parseMp3Frame(bytes, offset) {
  if (offset + 4 > bytes.byteLength) return null;
  const first = bytes[offset];
  const second = bytes[offset + 1];
  const third = bytes[offset + 2];
  const fourth = bytes[offset + 3];
  if (first !== 0xFF || (second & 0xE0) !== 0xE0) return null;

  const versionBits = (second >> 3) & 0x03;
  const layerBits = (second >> 1) & 0x03;
  if (versionBits === 0x01 || layerBits !== 0x01) return null;
  const bitrateIndex = (third >> 4) & 0x0F;
  const sampleRateIndex = (third >> 2) & 0x03;
  if (bitrateIndex === 0 || bitrateIndex === 15 || sampleRateIndex === 3) return null;
  if ((fourth & 0x03) === 0x02) return null;

  const version = versionBits === 3 ? 1 : (versionBits === 2 ? 2 : 2.5);
  const mpeg1Rates = [44100, 48000, 32000];
  const divisor = version === 1 ? 1 : (version === 2 ? 2 : 4);
  const sampleRate = mpeg1Rates[sampleRateIndex] / divisor;
  const mpeg1Bitrates = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
  const mpeg2Bitrates = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0];
  const bitrateKbps = (version === 1 ? mpeg1Bitrates : mpeg2Bitrates)[bitrateIndex];
  const padding = (third >> 1) & 0x01;
  const coefficient = version === 1 ? 144000 : 72000;
  const length = Math.floor((coefficient * bitrateKbps) / sampleRate) + padding;
  if (!Number.isInteger(length) || length < 24) return null;
  return {
    version,
    sampleRate,
    samplesPerFrame: version === 1 ? 1152 : 576,
    length
  };
}

function allZero(bytes, start, end) {
  for (let index = start; index < end; index += 1) {
    if (bytes[index] !== 0) return false;
  }
  return true;
}
