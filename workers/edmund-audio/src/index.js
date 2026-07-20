const AUDIO_PREFIXES = [
  "assets/speaking-system/audio/edmund-neural/part1/",
  "assets/speaking-system/audio/edmund-neural/part3/"
];
const IMMUTABLE_CACHE = "public, max-age=31536000, immutable";

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

function objectKey(url) {
  let key;
  try {
    key = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
  } catch {
    return "";
  }
  if (
    !AUDIO_PREFIXES.some(prefix => key.startsWith(prefix))
    || !key.endsWith(".mp3")
    || key.includes("..")
    || key.includes("\\")
  ) {
    return "";
  }
  return key;
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
      return new Response(JSON.stringify({ ok: true, service: "Edmund Neural Audio", products: ["part1", "part3"] }), {
        headers: {
          "Cache-Control": "no-store",
          "Content-Type": "application/json; charset=utf-8",
          "X-Content-Type-Options": "nosniff"
        }
      });
    }

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
