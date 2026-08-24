const CACHE = "poolamco-v21";
const PRECACHE = ["/offline", "/favicon.svg", "/icon-192.png", "/icon-512.png", "/maskable-512.png", "/logo-poolamco.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(Promise.all([
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))),
    self.clients.claim(),
  ]));
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Next's hashed RSC/JS/CSS assets should never be mixed across releases.
  if (url.origin === self.location.origin && url.pathname.startsWith("/_next/")) return;

  if (url.pathname.startsWith("/api/market")) {
    event.respondWith(fetch(request).then((response) => {
      if (response.ok) caches.open(CACHE).then((cache) => cache.put(request, response.clone()));
      return response;
    }).catch(async () => {
      const cached = await caches.match(request);
      return cached || new Response(JSON.stringify({ mode: "offline", quotes: [] }), {
        status: 503,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then((response) => {
      if (response.ok) caches.open(CACHE).then((cache) => cache.put(request, response.clone()));
      return response;
    }).catch(async () => (await caches.match(request)) || caches.match("/offline")));
    return;
  }

  event.respondWith(fetch(request).catch(async () => (await caches.match(request)) || new Response("Offline", { status: 503 })));
});
