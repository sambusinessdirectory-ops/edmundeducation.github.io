import index from "./media.json" with {type: "json"};
import {error, servePackedAsset} from "../../edmund-site-assets/src/serve-packed-asset.js";

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, {status: 204, headers: {
      "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Range, If-None-Match, If-Range"
    }});
    if (!["GET", "HEAD"].includes(request.method)) return error("Method Not Allowed", 405);
    let path;
    try {
      path = decodeURIComponent(new URL(request.url).pathname.slice(1));
    } catch {
      return error("Malformed path", 400);
    }
    if (!Object.hasOwn(index.entries, path)) return error("Not Found", 404);
    const [pack, offset, length, type] = index.entries[path];
    const packKey = index.packs[pack];
    const etag = `"${packKey.split('/').pop()}-${offset}-${length}"`;
    return servePackedAsset(request, env.EDMUND_ASSETS, {packKey, offset, length, type, etag}, "public, max-age=3600");
  }
};
