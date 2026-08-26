const CACHE = "poolamco-v37";
const PRECACHE = ["/", "/dashboard", "/offline", "/favicon.svg", "/icon-192.png", "/icon-512.png", "/maskable-512.png", "/logo-poolamco.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => Promise.allSettled(PRECACHE.map((path) => cache.add(path)))));
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") event.waitUntil(self.skipWaiting());
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
  if (url.origin === self.location.origin && url.pathname.startsWith("/_next/")) return;

  if (url.pathname.startsWith("/api/market")) {
    event.respondWith(fetch(request).then((response) => {
      if (response.ok) caches.open(CACHE).then((cache) => cache.put(request, response.clone()));
      return response;
    }).catch(async () => {
      const cached = await caches.match(request);
      return cached || new Response(JSON.stringify({ mode: "offline", quotes: [] }), { status: 503, headers: { "Content-Type": "application/json; charset=utf-8" } });
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

function markAlertTriggered(alertId, triggeredAt) {
  if (!Number.isInteger(alertId) || !triggeredAt) return Promise.resolve();
  return new Promise((resolve) => {
    const request = indexedDB.open("poolyar-local");
    request.onerror = () => resolve();
    request.onsuccess = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains("marketAlerts")) { database.close(); resolve(); return; }
      const tx = database.transaction("marketAlerts", "readwrite");
      const store = tx.objectStore("marketAlerts");
      const get = store.get(alertId);
      get.onsuccess = () => {
        const row = get.result;
        if (row) store.put({ ...row, armed: false, lastTriggeredAt: triggeredAt, updatedAt: triggeredAt });
      };
      tx.oncomplete = () => { database.close(); resolve(); };
      tx.onerror = () => { database.close(); resolve(); };
    };
  });
}

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = {}; }
  const title = typeof data.title === "string" ? data.title : "هشدار بازار پولم‌کو";
  const options = {
    body: typeof data.body === "string" ? data.body : "شرط یکی از هشدارهای بازار برقرار شده است.",
    icon: data.icon || "/icon-192.png",
    badge: data.badge || "/icon-192.png",
    tag: data.tag || "poolamco-market-alert",
    data: { url: data.url || "/investments", alertId: data.alertId, triggeredAt: data.triggeredAt },
  };
  event.waitUntil(Promise.all([
    markAlertTriggered(Number(data.alertId), data.triggeredAt),
    self.registration.showNotification(title, options),
  ]));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/investments";
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
    const target = new URL(targetUrl, self.location.origin);
    const existing = clients.find((client) => new URL(client.url).pathname === target.pathname);
    if (existing) {
      if ("navigate" in existing) existing.navigate(target.href).catch(() => undefined);
      return existing.focus();
    }
    return self.clients.openWindow(target.href);
  }));
});
