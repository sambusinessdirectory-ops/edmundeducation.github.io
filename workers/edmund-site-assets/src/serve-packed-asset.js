export function error(message, status, extra = {}) {
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

export async function servePackedAsset(request, bucket, asset, cacheControl) {
  if (!asset) return error("Not Found", 404);
  const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Expose-Headers": "Accept-Ranges, Content-Length, Content-Range, ETag",
    "Cross-Origin-Resource-Policy": "cross-origin",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": cacheControl,
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
    const pack = await bucket.head(asset.packKey);
    if (!pack) return error("Not Found", 404);
    return new Response(null, { status: range.partial ? 206 : 200, headers });
  }
  const object = await bucket.get(asset.packKey, { range: { offset: asset.offset + range.start, length } });
  if (!object || !("body" in object)) return error("Not Found", 404);
  return new Response(object.body, { status: range.partial ? 206 : 200, headers });
}
