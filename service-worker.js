const CACHE_NAME = "linux-command-dictionary-v19-git-restore";
const APP_FILES = [
  "./",
  "./index.html",
  "./commands.html",
  "./hub.css",
  "./hub.js",
  "./python/",
  "./python/index.html",
  "./python/styles.css",
  "./python/app.js",
  "./python/module-catalog.js",
  "./python/legal.html",
  "./c/",
  "./c/index.html",
  "./c/app.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key.startsWith("linux-command-dictionary-") && key !== CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (!url.href.startsWith(self.registration.scope)) return;
  url.search = "";
  url.hash = "";
  const cacheKey = url.href;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request, { cache: "no-store" })
        .then(response => {
          if (response && response.status === 200) {
            const copy = response.clone();
            event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(cacheKey, copy)));
          }
          return response;
        })
        .catch(async () => (await caches.match(cacheKey)) || Response.error())
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(response => {
          if (!response || response.status !== 200 || response.type === "opaque") {
            return response;
          }

          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => Response.error());
    })
  );
});
