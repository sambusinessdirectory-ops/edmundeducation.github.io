import flashcardIndex from "./flashcard-pack-index-v1.json" with { type: "json" };
import siteIndex from "./site-pack-index-v1.json" with { type: "json" };
import eddyIndex from "./eddy-pack-index-v1.json" with { type: "json" };

const PREFIX = "site-assets/v1/";
const FLASHCARD_PATH = "assets/flashcards/audio/edmund-neural/v1/";
const CACHE = "public, max-age=3600, stale-while-revalidate=86400";
const LISTENING_PRACTICE_OVERRIDES = new Set([3, 5, 6, 7, 8, 10, 11, 13, 16, 19, 20]);

function error(message, status, extra = {}) {
  return new Response(message, { status, headers: {
    "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store",
    "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff", ...extra
  } });
}

function requestedRange(value, length) {
  if (!value) return { start: 0, end: length - 1, partial: false };
  const match = /^bytes=(\d*)-(\d*)$/.exec(value.trim());
  if (!match || (!match[1] && !match[2])) return null;
  let start;
  let end;
  if (!match[1]) {
    const suffix = Number(match[2]);
    if (!Number.isSafeInteger(suffix) || suffix < 1) return null;
    start = Math.max(0, length - suffix);
    end = length - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Number(match[2]) : length - 1;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start >= length || end < start) return null;
    end = Math.min(end, length - 1);
  }
  return { start, end, partial: true };
}

function lookup(path) {
  if (path.startsWith(FLASHCARD_PATH) && flashcardIndex.meta.r2UploadComplete === true) {
    const match = /^([0-9a-f]{2})\/([0-9a-f]{24})\.mp3$/.exec(path.slice(FLASHCARD_PATH.length));
    if (!match || !match[2].startsWith(match[1])) return null;
    const row = flashcardIndex.entries[match[1]]?.[match[2].slice(2)];
    const pack = flashcardIndex.packs[match[1]];
    if (!row || !pack) return null;
    return { packKey: pack.key, offset: row[0], length: row[1], type: "audio/mpeg", etag: `"${match[2]}"` };
  }
  const index = path.startsWith("eddy-carrot-patch/assets/") ? eddyIndex : siteIndex;
  if (index.meta.r2UploadComplete !== true) return null;
  const row = index.entries[path];
  if (!row || !index.packs[row[0]]) return null;
  const pack = index.packs[row[0]];
  return { packKey: pack.key, offset: row[1], length: row[2], type: row[3], etag: `"${pack.sha256.slice(0, 24)}-${row[1]}-${row[2]}"` };
}

function decodedPath(url) {
  try {
    const key = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
    if (!(key.startsWith(PREFIX + "assets/") || key.startsWith(PREFIX + "eddy-carrot-patch/assets/")) || key.includes("..") || key.includes("\\") || key.includes("\0")) return "";
    return key.slice(PREFIX.length);
  } catch {
    return "";
  }
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: {
      "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Range, If-None-Match, If-Range",
      "Access-Control-Max-Age": "86400"
    } });
    if (request.method !== "GET" && request.method !== "HEAD") return error("Method Not Allowed", 405, { Allow: "GET, HEAD, OPTIONS" });
    const url = new URL(request.url);
    if (url.pathname === "/health") return new Response(JSON.stringify({ ok: true, service: "Edmund Site Assets", assets: siteIndex.meta.entryCount + flashcardIndex.meta.entryCount + eddyIndex.meta.entryCount }), { headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
    const path = decodedPath(url);
    let asset = path && lookup(path);
    const practice = /^assets\/listening\/practices\/practice-(\d+)\.json$/.exec(path);
    if (practice && LISTENING_PRACTICE_OVERRIDES.has(Number(practice[1]))) {
      const key = `site-assets/v1/overrides/listening-practices/practice-${practice[1]}.json`;
      const head = await env.EDMUND_ASSETS.head(key);
      if (!head) return error("Not Found", 404);
      asset = { packKey: key, offset: 0, length: head.size, type: "application/json", etag: head.httpEtag };
    }
    if (!asset) return error("Not Found", 404);
    const headers = new Headers({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Expose-Headers": "Accept-Ranges, Content-Length, Content-Range, ETag",
      "Cross-Origin-Resource-Policy": "cross-origin",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": CACHE,
      "Content-Type": asset.type,
      "Content-Length": String(asset.length),
      "Accept-Ranges": "bytes",
      "ETag": asset.etag
    });
    const ifNoneMatch = request.headers.get("If-None-Match");
    if (ifNoneMatch && (ifNoneMatch === "*" || ifNoneMatch.split(",").some(value => value.trim() === asset.etag))) {
      headers.delete("Content-Length");
      return new Response(null, { status: 304, headers });
    }
    let rangeHeader = request.headers.get("Range");
    if (rangeHeader && request.headers.get("If-Range") && request.headers.get("If-Range") !== asset.etag) rangeHeader = null;
    const range = requestedRange(rangeHeader, asset.length);
    if (!range) return error("Requested Range Not Satisfiable", 416, { "Content-Range": `bytes */${asset.length}`, "Accept-Ranges": "bytes" });
    const length = range.end - range.start + 1;
    headers.set("Content-Length", String(length));
    if (range.partial) headers.set("Content-Range", `bytes ${range.start}-${range.end}/${asset.length}`);
    if (request.method === "HEAD") {
      const pack = await env.EDMUND_ASSETS.head(asset.packKey);
      if (!pack) return error("Not Found", 404);
      return new Response(null, { status: range.partial ? 206 : 200, headers });
    }
    const object = await env.EDMUND_ASSETS.get(asset.packKey, { range: { offset: asset.offset + range.start, length } });
    if (!object || !("body" in object)) return error("Not Found", 404);
    return new Response(object.body, { status: range.partial ? 206 : 200, headers });
  }
};
