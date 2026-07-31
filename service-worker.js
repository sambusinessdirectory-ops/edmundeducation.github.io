const CACHE_PREFIX = "edmund-pwa-";
const RELEASE_ID = "__EDMUND_RELEASE__";
const CACHE_NAME = `${CACHE_PREFIX}${RELEASE_ID}`;
const HARPER_CACHE_PREFIX = "edmund-vendor-harper-";
const HARPER_CACHE_NAME = "edmund-vendor-harper-2.7.0";
const HARPER_PATH_PREFIX = "/assets/vendor/harper/2.7.0/";
const OFFLINE_URL = "/offline.html";
const SHELL_URLS = [
  "/offline.html",
  "/manifest.webmanifest",
  "/pwa-ui.css",
  "/pwa-register.js",
  "/favicon.ico",
  "/apple-touch-icon.png",
  "/assets/icons/favicon-48x48.png",
  "/assets/icons/icon-192x192.png",
  "/assets/icons/icon-512x512.png",
  "/assets/icons/icon-maskable-192x192.png",
  "/assets/icons/icon-maskable-512x512.png"
];
const SHELL_PATHS = new Set(SHELL_URLS);

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS)));
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
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  if (request.headers.has("Authorization") || request.headers.has("Range")) return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request, { cache: "no-store" }).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  if (url.pathname === "/pwa-register.js") {
    event.respondWith(
      fetch(request, { cache: "no-store" }).catch(() => caches.match("/pwa-register.js"))
    );
    return;
  }

  // Harper is committed to this site rather than loaded from a third-party
  // service. Keep its immutable, versioned runtime in a separate cache so a
  // normal site release does not force students to download the engine again.
  if (url.pathname.startsWith(HARPER_PATH_PREFIX)) {
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

  if (SHELL_PATHS.has(url.pathname)) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
  }
});
