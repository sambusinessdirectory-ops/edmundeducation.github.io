import index from "./media.json" with {type: "json"};
import {error, servePackedAsset} from "../../edmund-site-assets/src/serve-packed-asset.js";

let digest;
function indexDigest() {
  return digest ??= crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(index)))
  .then(bytes => Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, "0")).join(""));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const onSchoolDomain = url.hostname === "edmundeducation.com";
    if (url.pathname === "/.well-known/edmund-public-media.json") {
      return Response.json({sha256:await indexDigest(), count:Object.keys(index.entries).length}, {headers:{"Cache-Control":"no-store"}});
    }
    let path;
    try {
      path = decodeURIComponent(url.pathname.slice(1));
    } catch {
      return error("Malformed path", 400);
    }
    if (!Object.hasOwn(index.entries, path)) {
      // On a Cloudflare route, a same-origin subrequest passes other paths back to Pages.
      return onSchoolDomain ? fetch(request) : error("Not Found", 404);
    }
    if (request.method === "OPTIONS") return new Response(null, {status: 204, headers: {
      "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Range, If-None-Match, If-Range"
    }});
    if (!["GET", "HEAD"].includes(request.method)) return error("Method Not Allowed", 405);
    const [pack, offset, length, type, blob] = index.entries[path];
    const packKey = index.packs[pack];
    const etag = `"${packKey.split('/').pop()}-${offset}-${length}"`;
    const response = await servePackedAsset(request, env.EDMUND_ASSETS, {packKey, offset, length, type, etag}, "public, max-age=3600");
    response.headers.set("X-Edmund-Media-Blob", blob);
    return response;
  }
};
