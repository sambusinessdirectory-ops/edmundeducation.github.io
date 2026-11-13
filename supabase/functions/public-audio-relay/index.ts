const NEURAL_AUDIO_ORIGIN = "https://edmund-neural-audio.edmundeducation.workers.dev";
const PUBLIC_MEDIA_ORIGIN = "https://edmund-public-media.edmundeducation.workers.dev";
const FUNCTION_PATH = "/public-audio-relay/";
const PUBLIC_FUNCTION_PATH = "/functions/v1/public-audio-relay";
const LISTENING_CATALOG_PATH = "v1/listening/catalog";
const AUDIO_EXTENSION = /\.(?:mp3|wav|m4a|ogg)$/i;
const NEURAL_AUDIO_PATH_PREFIXES = [
  "assets/",
  "IELTS Listening - Recordings/",
  "DSE Listening - Recordings/",
] as const;
const RESPONSE_HEADERS = [
  "accept-ranges",
  "cache-control",
  "content-length",
  "content-range",
  "content-type",
  "etag",
  "last-modified",
] as const;

function publicHeaders(): Headers {
  return new Headers({
    "Access-Control-Allow-Headers": "Range, If-None-Match, If-Modified-Since",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Expose-Headers":
      "Accept-Ranges, Content-Length, Content-Range, Content-Type, ETag, Last-Modified",
    "Cross-Origin-Resource-Policy": "cross-origin",
    "X-Content-Type-Options": "nosniff",
  });
}

function errorResponse(message: string, status: number): Response {
  const headers = publicHeaders();
  headers.set("Content-Type", "text/plain; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  return new Response(message, { status, headers });
}

function decodedFunctionPath(requestUrl: string): string | null {
  const pathname = new URL(requestUrl).pathname;
  const marker = pathname.indexOf(FUNCTION_PATH);
  if (marker < 0) return null;
  const encodedPath = pathname.slice(marker + FUNCTION_PATH.length);
  try {
    return decodeURIComponent(encodedPath);
  } catch {
    return null;
  }
}

function relayBaseUrl(requestUrl: string): string {
  const url = new URL(requestUrl);
  return `https://${url.host}${PUBLIC_FUNCTION_PATH}`;
}

function safeAudioRequest(decodedPath: string): { origin: string; path: string } | null {
  const isPublicMedia = decodedPath.startsWith("public/");
  const upstreamPath = isPublicMedia ? decodedPath.slice("public/".length) : decodedPath;
  const isAllowedNeuralAudio = NEURAL_AUDIO_PATH_PREFIXES.some((prefix) =>
    upstreamPath.startsWith(prefix)
  );
  if (
    (!isPublicMedia && !isAllowedNeuralAudio) ||
    !AUDIO_EXTENSION.test(upstreamPath) ||
    upstreamPath.includes("\\") ||
    upstreamPath.includes("\0") ||
    upstreamPath.split("/").some((segment) => segment === ".." || segment === ".")
  ) {
    return null;
  }
  return {
    origin: isPublicMedia ? PUBLIC_MEDIA_ORIGIN : NEURAL_AUDIO_ORIGIN,
    path: upstreamPath.split("/").map(encodeURIComponent).join("/"),
  };
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: publicHeaders() });
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    return errorResponse("Method not allowed", 405);
  }

  const decodedPath = decodedFunctionPath(request.url);
  const isListeningCatalog = decodedPath === LISTENING_CATALOG_PATH;
  const upstreamRequest = isListeningCatalog
    ? { origin: NEURAL_AUDIO_ORIGIN, path: LISTENING_CATALOG_PATH }
    : decodedPath
      ? safeAudioRequest(decodedPath)
      : null;
  if (!upstreamRequest) return errorResponse("Invalid audio path", 400);

  const requestHeaders = new Headers();
  for (const name of ["range", "if-none-match", "if-modified-since"]) {
    const value = request.headers.get(name);
    if (value) requestHeaders.set(name, value);
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${upstreamRequest.origin}/${upstreamRequest.path}`, {
      method: request.method,
      headers: requestHeaders,
      redirect: "manual",
    });
  } catch {
    return errorResponse("Audio origin unavailable", 502);
  }
  if (upstream.status >= 300 && upstream.status < 400) {
    return errorResponse("Unexpected audio redirect", 502);
  }

  const headers = publicHeaders();
  for (const name of RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  if (!isListeningCatalog && (upstream.ok || upstream.status === 206)) {
    headers.set("Accept-Ranges", "bytes");
  }
  if (!headers.has("Cache-Control") && upstream.ok) {
    headers.set(
      "Cache-Control",
      isListeningCatalog
        ? "public, max-age=300, stale-while-revalidate=3600"
        : "public, max-age=86400, stale-while-revalidate=604800",
    );
  }
  let body: BodyInit | null = request.method === "HEAD" ? null : upstream.body;
  if (isListeningCatalog && request.method === "GET" && upstream.ok) {
    body = (await upstream.text()).replaceAll(NEURAL_AUDIO_ORIGIN, relayBaseUrl(request.url));
    headers.delete("Content-Length");
    headers.delete("ETag");
    headers.set("Content-Type", "application/json; charset=utf-8");
  }
  return new Response(body, {
    status: upstream.status,
    headers,
  });
});
