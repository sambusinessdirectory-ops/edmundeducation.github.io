const CACHE_PREFIX = "edmund-pwa-";
const RELEASE_ID = "524f307b8c90d6925ae9465aaa8f1d4e04269fd7";
const CACHE_NAME = `${CACHE_PREFIX}${RELEASE_ID}`;
const HARPER_CACHE_PREFIX = "edmund-vendor-harper-";
const HARPER_CACHE_NAME = "edmund-vendor-harper-2.7.0";
const HARPER_PATH_PREFIX = "https://edmund-site-assets.edmundeducation.workers.dev/site-assets/v1/assets/vendor/harper/2.7.0/";
const SPEECH_MODEL_PATH = "https://edmund-site-assets.edmundeducation.workers.dev/site-assets/v1/assets/speaking-system/models/english-us-0.15.tar.gz";
const SPEECH_MODEL_CACHE = "edmund-transcription-model-v1";
const SPEECH_MODEL_URL = new URL(SPEECH_MODEL_PATH, self.location.origin).href;
const HARPER_URL_PREFIX = new URL(HARPER_PATH_PREFIX, self.location.origin).href;
const ASSET_ORIGIN = new URL(SPEECH_MODEL_PATH, self.location.origin).origin;
const OFFLINE_URL = "/offline.html";
const SHELL_URLS = [
  "/offline.html",
  "/manifest.webmanifest",
  "/pwa-ui.css",
  "/pwa-register.js",
  "/homepage-loading.css",
  "/homepage-loading.js",
  "/apostrophe-normalizer.mjs",
  "/favicon.ico",
  "/apple-touch-icon.png",
  "https://edmund-site-assets.edmundeducation.workers.dev/site-assets/v1/assets/icons/favicon-48x48.png",
  "https://edmund-site-assets.edmundeducation.workers.dev/site-assets/v1/assets/icons/icon-192x192.png",
  "https://edmund-site-assets.edmundeducation.workers.dev/site-assets/v1/assets/icons/icon-512x512.png",
  "https://edmund-site-assets.edmundeducation.workers.dev/site-assets/v1/assets/icons/icon-maskable-192x192.png",
  "https://edmund-site-assets.edmundeducation.workers.dev/site-assets/v1/assets/icons/icon-maskable-512x512.png",
  "https://edmund-public-media.edmundeducation.workers.dev/eddy-offline-dialogue.png"
];
const SHELL_URL_SET = new Set(SHELL_URLS.map((path) => new URL(path, self.location.origin).href));

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => Promise.all(SHELL_URLS.map(async (path) => {
        // A controlling older worker may serve stale cached shell files. A
        // release-specific URL bypasses its exact-URL cache match.
        const releaseUrl = new URL(path, self.location.origin);
        releaseUrl.searchParams.set("__edmund_release", RELEASE_ID);
        const response = await fetch(releaseUrl, { cache: "reload" });
        if (!response.ok) throw new Error(`Unable to precache ${path}`);
        await cache.put(path, response);
      })))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names
          .filter((name) => (
            (name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
            || (name.startsWith(HARPER_CACHE_PREFIX) && name !== HARPER_CACHE_NAME)
          ))
          .map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
  if (event.data?.type === "GET_RELEASE_ID") {
    event.ports?.[0]?.postMessage({ release: RELEASE_ID });
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  if (request.headers.has("Authorization") || request.headers.has("Range")) return;

  const url = new URL(request.url);

  if (url.href === SPEECH_MODEL_URL) {
    event.respondWith(caches.open(SPEECH_MODEL_CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    }));
    return;
  }

  // The versioned Harper bundle may be delivered from the R2 asset origin.
  if (url.href.startsWith(HARPER_URL_PREFIX)) {
    event.respondWith(
      caches.open(HARPER_CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) await cache.put(request, response.clone());
        return response;
      })
    );
    return;
  }

  if (url.origin !== self.location.origin) {
    if (url.origin === ASSET_ORIGIN && SHELL_URL_SET.has(url.href)) {
      event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
    }
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request, { cache: "no-store" }).catch(() => caches.open(CACHE_NAME).then((cache) => cache.match(OFFLINE_URL)))
    );
    return;
  }

  if (url.pathname === "/pwa-register.js") {
    event.respondWith(
      fetch(request, { cache: "no-store" }).catch(() => caches.match("/pwa-register.js"))
    );
    return;
  }

  if (url.pathname === "/release.json") {
    event.respondWith(fetch(request, { cache: "no-store" }));
    return;
  }

  if (SHELL_URL_SET.has(url.href)) {
    event.respondWith(caches.open(CACHE_NAME).then((cache) => cache.match(request)).then((cached) => cached || fetch(request)));
  }
});
