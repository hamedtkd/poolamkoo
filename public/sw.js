const CACHE = "poolyar-v8";
const APP_SHELL = ["/", "/income", "/investments", "/funds", "/reports", "/settings", "/offline", "/icon-192.png", "/icon-512.png", "/maskable-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))),
      self.clients.claim(),
    ]),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (url.pathname.startsWith("/api/market")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || new Response(JSON.stringify({ mode: "offline", quotes: [] }), {
            status: 503,
            headers: { "Content-Type": "application/json; charset=utf-8" },
          });
        }),
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (url.origin === self.location.origin && response.ok) {
          caches.open(CACHE).then((cache) => cache.put(request, response.clone()));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === "navigate") return caches.match("/offline");
        return new Response("Offline", { status: 503, statusText: "Offline" });
      }),
  );
});
