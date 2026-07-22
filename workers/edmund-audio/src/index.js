import flashcardPackIndex from "./flashcard-pack-index.json" with { type: "json" };

const AUDIO_PREFIXES = [
  "assets/speaking-system/audio/edmund-neural/part1/",
  "assets/speaking-system/audio/edmund-neural/part3/",
  "assets/speaking-system/audio/edmund-neural/exam/"
];
const IMMUTABLE_CACHE = "public, max-age=31536000, immutable";
const FLASHCARD_AUDIO_PREFIX = flashcardPackIndex.audioPathPrefix;

function responseHeaders() {
  return new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Expose-Headers": "Accept-Ranges, Content-Length, Content-Range, ETag",
    "Cache-Control": IMMUTABLE_CACHE,
    "Content-Type": "audio/mpeg",
    "Cross-Origin-Resource-Policy": "cross-origin",
    "X-Content-Type-Options": "nosniff"
  });
}

function plainResponse(message, status, extraHeaders = {}) {
  return new Response(message, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      ...extraHeaders
    }
  });
}

function decodedObjectKey(url) {
  try {
    const key = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
    if (key.includes("..") || key.includes("\\")) return "";
    return key;
  } catch {
    return "";
  }
}

function objectKey(url) {
  const key = decodedObjectKey(url);
  if (
    !AUDIO_PREFIXES.some(prefix => key.startsWith(prefix))
    || !key.endsWith(".mp3")
  ) {
    return "";
  }
  return key;
}

function flashcardPackEntry(url) {
  if (flashcardPackIndex.meta?.r2UploadComplete !== true) return null;
  const key = decodedObjectKey(url);
  if (!key.startsWith(FLASHCARD_AUDIO_PREFIX) || !key.endsWith(".mp3")) return null;
  const match = /^([0-9a-f]{2})\/([0-9a-f]{24})\.mp3$/.exec(key.slice(FLASHCARD_AUDIO_PREFIX.length));
  if (!match || !match[2].startsWith(match[1])) return null;
  const prefix = match[1];
  const digest = match[2];
  const entry = flashcardPackIndex.entries[prefix]?.[digest.slice(2)];
  const pack = flashcardPackIndex.packs[prefix];
  if (
    !Array.isArray(entry)
    || entry.length !== 2
    || !Number.isInteger(entry[0])
    || !Number.isInteger(entry[1])
    || entry[0] < 0
    || entry[1] <= 1000
    || !pack?.key
  ) return null;
  return {
    digest,
    key,
    length: entry[1],
    offset: entry[0],
    packKey: pack.key
  };
}

function requestedByteRange(header, totalLength) {
  if (!header) return { start: 0, end: totalLength - 1, partial: false };
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match || (!match[1] && !match[2])) return null;
  let start;
  let end;
  if (!match[1]) {
    const suffixLength = Number(match[2]);
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) return null;
    start = Math.max(0, totalLength - suffixLength);
    end = totalLength - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Number(match[2]) : totalLength - 1;
    if (
      !Number.isSafeInteger(start)
      || !Number.isSafeInteger(end)
      || start < 0
      || start >= totalLength
      || end < start
    ) return null;
    end = Math.min(end, totalLength - 1);
  }
  return { start, end, partial: true };
}

async function serveFlashcardPack(request, env, entry) {
  const etag = `"${entry.digest}"`;
  const headers = responseHeaders();
  headers.set("Accept-Ranges", "bytes");
  headers.set("ETag", etag);
  const ifNoneMatch = request.headers.get("If-None-Match");
  if (ifNoneMatch && (ifNoneMatch === "*" || ifNoneMatch.split(",").map(value => value.trim()).includes(etag))) {
    return new Response(null, { status: 304, headers });
  }

  let rangeHeader = request.headers.get("Range");
  const ifRange = request.headers.get("If-Range");
  if (rangeHeader && ifRange && ifRange.trim() !== etag) rangeHeader = null;
  const range = requestedByteRange(rangeHeader, entry.length);
  if (!range) {
    return plainResponse("Requested Range Not Satisfiable", 416, {
      "Accept-Ranges": "bytes",
      "Content-Range": `bytes */${entry.length}`
    });
  }
  const responseLength = range.end - range.start + 1;
  headers.set("Content-Length", String(responseLength));
  if (range.partial) {
    headers.set("Content-Range", `bytes ${range.start}-${range.end}/${entry.length}`);
  }
  if (request.method === "HEAD") {
    const pack = await env.EDMUND_ASSETS.head(entry.packKey);
    if (!pack) return plainResponse("Not Found", 404);
    return new Response(null, { status: range.partial ? 206 : 200, headers });
  }

  const object = await env.EDMUND_ASSETS.get(entry.packKey, {
    range: {
      offset: entry.offset + range.start,
      length: responseLength
    }
  });
  if (!object || !("body" in object)) return plainResponse("Not Found", 404);
  return new Response(object.body, { status: range.partial ? 206 : 200, headers });
}

function preconditionStatus(request, object) {
  const ifNoneMatch = request.headers.get("If-None-Match");
  if (ifNoneMatch && (ifNoneMatch === "*" || ifNoneMatch.split(",").map(value => value.trim()).includes(object.httpEtag))) {
    return 304;
  }
  return 412;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Headers": "Range",
          "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Max-Age": "86400"
        }
      });
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return plainResponse("Method Not Allowed", 405, { Allow: "GET, HEAD, OPTIONS" });
    }

    const url = new URL(request.url);
    if (url.pathname === "/" || url.pathname === "/health") {
      return new Response(JSON.stringify({ ok: true, service: "Edmund Neural Audio", products: ["part1", "part3", "exam", "flashcards"] }), {
        headers: {
          "Cache-Control": "no-store",
          "Content-Type": "application/json; charset=utf-8",
          "X-Content-Type-Options": "nosniff"
        }
      });
    }

    const flashcardEntry = flashcardPackEntry(url);
    if (flashcardEntry) return serveFlashcardPack(request, env, flashcardEntry);

    const key = objectKey(url);
    if (!key) return plainResponse("Not Found", 404);

    if (request.method === "HEAD") {
      const object = await env.EDMUND_ASSETS.head(key);
      if (!object) return plainResponse("Not Found", 404);
      const headers = responseHeaders();
      object.writeHttpMetadata(headers);
      headers.set("Accept-Ranges", "bytes");
      headers.set("Cache-Control", IMMUTABLE_CACHE);
      headers.set("Content-Length", String(object.size));
      headers.set("Content-Type", "audio/mpeg");
      headers.set("ETag", object.httpEtag);
      return new Response(null, { status: 200, headers });
    }

    let object;
    try {
      const options = { onlyIf: request.headers };
      if (request.headers.has("Range")) options.range = request.headers;
      object = await env.EDMUND_ASSETS.get(key, options);
    } catch {
      return plainResponse("Requested Range Not Satisfiable", 416, {
        "Accept-Ranges": "bytes"
      });
    }
    if (!object) return plainResponse("Not Found", 404);

    const headers = responseHeaders();
    object.writeHttpMetadata(headers);
    headers.set("Accept-Ranges", "bytes");
    headers.set("Cache-Control", IMMUTABLE_CACHE);
    headers.set("Content-Type", "audio/mpeg");
    headers.set("ETag", object.httpEtag);

    if (!("body" in object)) {
      return new Response(null, {
        status: preconditionStatus(request, object),
        headers
      });
    }

    if (request.headers.has("Range") && object.range) {
      const start = Number(object.range.offset);
      const length = Number(object.range.length);
      headers.set("Content-Length", String(length));
      headers.set("Content-Range", `bytes ${start}-${start + length - 1}/${object.size}`);
      return new Response(object.body, { status: 206, headers });
    }

    headers.set("Content-Length", String(object.size));
    return new Response(object.body, { status: 200, headers });
  }
};
