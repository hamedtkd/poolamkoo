const CACHE = "poolamkoo-v72";
const OFFLINE_RELEASE = "v86";
const RUNTIME_CACHE = `poolamkoo-offline-${OFFLINE_RELEASE}`;
const WORKSPACE_CACHE = `${RUNTIME_CACHE}-workspace`;
const STATIC_SHELL_ASSETS = [
  "/app.webmanifest",
  "/favicon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/maskable-512.png",
  "/logo-poolamkoo.svg",
  "/brand/poolamkoo-mark.svg",
];
const WORKSPACE_ROUTES = [
  "/dashboard",
  "/activity",
  "/income",
  "/funds",
  "/investments",
  "/loans",
  "/loans/new",
  "/reports",
  "/settings",
  "/settings/general",
  "/settings/money",
  "/settings/market",
  "/settings/data",
  "/settings/privacy",
  "/settings/transfer",
  "/settings/about",
  "/offline",
];
const WORKSPACE_NAVIGATION_PREFIXES = ["/dashboard", "/activity", "/income", "/funds", "/investments", "/loans", "/reports", "/settings"];
const STATIC_FILE_RE = /\.(?:js|css|woff2?|ttf|otf|svg|png|jpe?g|webp|avif|ico)$/i;

function isWorkspaceNavigation(pathname) {
  return pathname === "/offline" || WORKSPACE_NAVIGATION_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isAppStaticAsset(pathname) {
  return pathname.startsWith("/_next/static/")
    || pathname.startsWith("/_next/image")
    || pathname === "/app.webmanifest"
    || STATIC_FILE_RE.test(pathname);
}

function isCriticalBuildAsset(pathname) {
  return pathname.startsWith("/_next/static/");
}

function requestForPath(path) {
  return new Request(new URL(path, self.location.origin).href, {
    method: "GET",
    headers: { accept: "text/html" },
    credentials: "same-origin",
  });
}

function cleanNavigationRequest(request) {
  const url = new URL(request.url);
  return requestForPath(url.pathname);
}

function extractStaticAssetUrls(text, baseUrl, css = false) {
  const urls = new Set();
  const pattern = css ? /url\((?:["']?)([^"')]+)(?:["']?)\)/g : /(?:src|href)=["']([^"'#]+)["']/g;
  for (const match of text.matchAll(pattern)) {
    const value = match[1]?.trim();
    if (!value || value.startsWith("data:")) continue;
    let decoded = value;
    try { decoded = decodeURIComponent(value); } catch { /* Keep the original value. */ }
    if (decoded.startsWith("#") || decoded.startsWith("\\#")) continue;
    try {
      const url = new URL(value, baseUrl);
      if (url.origin === self.location.origin && isAppStaticAsset(url.pathname)) urls.add(url.href);
    } catch {
      // Ignore malformed references in HTML/CSS we do not control.
    }
  }
  return [...urls];
}

async function cacheStaticAsset(url, runtimeCache, required = false) {
  const request = new Request(url, { credentials: "same-origin" });
  const cached = await runtimeCache.match(request) || await caches.match(request);
  if (cached) {
    if (!await runtimeCache.match(request)) await runtimeCache.put(request, cached.clone());
    return;
  }

  let response;
  try {
    response = await fetch(request);
  } catch (error) {
    if (required) throw error;
    return;
  }
  if (!response.ok) {
    if (required) throw new Error(`offline asset ${request.url} returned ${response.status}`);
    return;
  }
  await runtimeCache.put(request, response.clone());

  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/css")) return;
  const css = await response.clone().text();
  const nested = extractStaticAssetUrls(css, response.url || url, true);
  const critical = nested.filter((assetUrl) => isCriticalBuildAsset(new URL(assetUrl).pathname));
  const optional = nested.filter((assetUrl) => !isCriticalBuildAsset(new URL(assetUrl).pathname));
  await Promise.all(critical.map((assetUrl) => cacheStaticAsset(assetUrl, runtimeCache, required)));
  await Promise.allSettled(optional.map((assetUrl) => cacheStaticAsset(assetUrl, runtimeCache, false)));
}

async function cacheDocumentAssets(response, baseUrl, required = false) {
  const type = response.headers.get("content-type") || "";
  if (!response.ok || !type.includes("text/html")) {
    if (required) throw new Error(`offline document ${baseUrl} is not cacheable HTML`);
    return;
  }
  const html = await response.clone().text();
  const runtimeCache = await caches.open(RUNTIME_CACHE);
  const urls = extractStaticAssetUrls(html, response.url || baseUrl);
  const critical = urls.filter((url) => isCriticalBuildAsset(new URL(url).pathname));
  const optional = urls.filter((url) => !isCriticalBuildAsset(new URL(url).pathname));
  await Promise.all(critical.map((url) => cacheStaticAsset(url, runtimeCache, required)));
  await Promise.allSettled(optional.map((url) => cacheStaticAsset(url, runtimeCache, false)));
}

async function precacheWorkspacePath(path) {
  const cache = await caches.open(WORKSPACE_CACHE);
  const request = requestForPath(path);
  const response = await fetch(request);
  if (!response.ok) throw new Error(`offline route ${path} returned ${response.status}`);
  await cache.put(cleanNavigationRequest(request), response.clone());
  await cacheDocumentAssets(response, request.url, true);
}

async function prepareOfflineRelease() {
  await Promise.all([caches.delete(RUNTIME_CACHE), caches.delete(WORKSPACE_CACHE)]);
  try {
    await Promise.all(WORKSPACE_ROUTES.map((path) => precacheWorkspacePath(path)));
    const runtimeCache = await caches.open(RUNTIME_CACHE);
    await Promise.all(STATIC_SHELL_ASSETS.map((path) => cacheStaticAsset(new URL(path, self.location.origin).href, runtimeCache, true)));
  } catch (error) {
    await Promise.all([caches.delete(RUNTIME_CACHE), caches.delete(WORKSPACE_CACHE)]);
    throw error;
  }
}

async function offlineWorkspaceReady() {
  const cache = await caches.open(WORKSPACE_CACHE);
  const rows = await Promise.all(WORKSPACE_ROUTES.map((path) => cache.match(requestForPath(path))));
  return rows.every(Boolean);
}

function legacyIncomeRedirect(request) {
  const url = new URL(request.url);
  const match = /^\/income\/(\d+)$/.exec(url.pathname);
  if (!match) return null;
  return Response.redirect(`${url.origin}/income?plan=${match[1]}`, 302);
}

async function workspaceFallback(request) {
  const cache = await caches.open(WORKSPACE_CACHE);
  const cached = await cache.match(cleanNavigationRequest(request));
  if (cached) return cached;
  return (await cache.match(requestForPath("/offline"))) || new Response("Offline", { status: 503 });
}

async function networkFirstWorkspace(request) {
  const cache = await caches.open(WORKSPACE_CACHE);
  const key = cleanNavigationRequest(request);
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(key, response.clone());
      await cacheDocumentAssets(response, request.url);
      return response;
    }
    if (response.status < 500) return response;
    return await workspaceFallback(request);
  } catch {
    const redirect = legacyIncomeRedirect(request);
    if (redirect) return redirect;
    return await workspaceFallback(request);
  }
}

async function runtimeWorkspaceRequest(request) {
  const cache = await caches.open(WORKSPACE_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
      if (request.headers.get("x-poolamkoo-warm") === "1") {
        await cache.put(cleanNavigationRequest(request), response.clone());
        await cacheDocumentAssets(response, request.url);
      }
    }
    return response;
  } catch {
    const exact = await cache.match(request);
    if (exact) return exact;
    if ((request.headers.get("accept") || "").includes("text/html")) return await workspaceFallback(request);
    return new Response("Offline", { status: 503 });
  }
}

async function cacheFirstStatic(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request) || await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(prepareOfflineRelease());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    event.waitUntil(self.skipWaiting());
    return;
  }
  if (event.data?.type === "GET_OFFLINE_STATUS") {
    event.waitUntil((async () => {
      const ready = await offlineWorkspaceReady();
      event.ports?.[0]?.postMessage({ release: OFFLINE_RELEASE, ready });
    })());
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(Promise.all([
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE && key !== RUNTIME_CACHE && key !== WORKSPACE_CACHE).map((key) => caches.delete(key)))),
    self.clients.claim(),
  ]));
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (url.origin === self.location.origin && isAppStaticAsset(url.pathname)) {
    event.respondWith(cacheFirstStatic(request));
    return;
  }

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
    if (url.origin === self.location.origin && !isWorkspaceNavigation(url.pathname)) {
      event.respondWith(fetch(request));
      return;
    }
    event.respondWith(networkFirstWorkspace(request));
    return;
  }

  if (url.origin === self.location.origin && isWorkspaceNavigation(url.pathname)) {
    event.respondWith(runtimeWorkspaceRequest(request));
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

function markLoanRiskTriggered(alertId, triggeredAt) {
  if (!Number.isInteger(alertId) || !triggeredAt) return Promise.resolve();
  return new Promise((resolve) => {
    const request = indexedDB.open("poolyar-local");
    request.onerror = () => resolve();
    request.onsuccess = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains("loanRiskAlerts")) { database.close(); resolve(); return; }
      const tx = database.transaction("loanRiskAlerts", "readwrite");
      const store = tx.objectStore("loanRiskAlerts");
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

function readLocalAsset(assetId) {
  if (!Number.isInteger(assetId)) return Promise.resolve(null);
  return new Promise((resolve) => {
    const request = indexedDB.open("poolyar-local");
    request.onerror = () => resolve(null);
    request.onsuccess = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains("assets")) { database.close(); resolve(null); return; }
      const tx = database.transaction("assets", "readonly");
      const get = tx.objectStore("assets").get(assetId);
      get.onsuccess = () => resolve(get.result || null);
      get.onerror = () => resolve(null);
      tx.oncomplete = () => database.close();
      tx.onerror = () => database.close();
    };
  });
}

function markLoanReminderNotified(reminderKey, triggeredAt) {
  if (typeof reminderKey !== "string" || !reminderKey || !triggeredAt) return Promise.resolve();
  return new Promise((resolve) => {
    const request = indexedDB.open("poolyar-local");
    request.onerror = () => resolve();
    request.onsuccess = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains("appMeta")) { database.close(); resolve(); return; }
      const tx = database.transaction("appMeta", "readwrite");
      tx.objectStore("appMeta").put({ key: `loan-reminder-notified:v1:${reminderKey}`, value: triggeredAt, updatedAt: triggeredAt });
      tx.oncomplete = () => { database.close(); resolve(); };
      tx.onerror = () => { database.close(); resolve(); };
    };
  });
}

function readLocalLoan(loanId) {
  if (!Number.isInteger(loanId)) return Promise.resolve(null);
  return new Promise((resolve) => {
    const request = indexedDB.open("poolyar-local");
    request.onerror = () => resolve(null);
    request.onsuccess = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains("loans")) { database.close(); resolve(null); return; }
      const tx = database.transaction("loans", "readonly");
      const get = tx.objectStore("loans").get(loanId);
      get.onsuccess = () => resolve(get.result || null);
      get.onerror = () => resolve(null);
      tx.oncomplete = () => database.close();
      tx.onerror = () => database.close();
    };
  });
}

function localLoanInstallment(loan) {
  if (!loan) return 0;
  if (Number(loan.actualInstallmentToman) > 0) return Number(loan.actualInstallmentToman);
  const principal = Number(loan.principalToman) || 0;
  const months = Number(loan.termMonths) || 0;
  const monthlyRate = (Number(loan.nominalAnnualRatePct) || 0) / 100 / 12;
  if (!(principal > 0) || !(months > 0)) return 0;
  if (!monthlyRate) return principal / months;
  return principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months));
}

function localLoanReminderBody(data, loan) {
  const days = Number(data.daysRemaining);
  const lead = days < 0 ? `سررسید ${Math.abs(days).toLocaleString("fa-IR")} روز گذشته است` : days === 0 ? "سررسید امروز است" : days === 1 ? "سررسید فرداست" : `${days.toLocaleString("fa-IR")} روز تا سررسید مانده است`;
  const installment = localLoanInstallment(loan);
  const amount = installment > 0 ? ` · ${Math.round(installment).toLocaleString("fa-IR")} تومان` : "";
  return `${lead}${amount}`;
}

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = {}; }
  if (data.kind === "loan-risk") {
    event.waitUntil((async () => {
      const alertId = Number(data.loanRiskAlertId);
      const triggeredAt = data.triggeredAt || new Date().toISOString();
      const [loan, asset] = await Promise.all([readLocalLoan(Number(data.loanId)), readLocalAsset(Number(data.assetId))]);
      await markLoanRiskTriggered(alertId, triggeredAt);
      const title = loan?.name ? `\u0647\u0634\u062f\u0627\u0631 \u0631\u06cc\u0633\u06a9 ${loan.name}` : "\u0647\u0634\u062f\u0627\u0631 \u0631\u06cc\u0633\u06a9 \u0648\u0627\u0645 \u067e\u0648\u0644\u0645\u200c\u06a9\u0648";
      const body = asset?.name ? `\u0642\u06cc\u0645\u062a \u0628\u0627\u0632\u0627\u0631 ${asset.name} \u0627\u0632 \u062d\u062f \u062a\u0627\u0632\u06af\u06cc \u062a\u0639\u06cc\u06cc\u0646\u200c\u0634\u062f\u0647 \u0639\u0628\u0648\u0631 \u06a9\u0631\u062f\u0647 \u0627\u0633\u062a.` : "\u0642\u06cc\u0645\u062a \u06cc\u06a9 \u062f\u0627\u0631\u0627\u06cc\u06cc \u0645\u062a\u0635\u0644 \u0628\u0647 \u0648\u0627\u0645 \u062a\u0627\u0632\u0647 \u0646\u06cc\u0633\u062a.";
      await self.registration.showNotification(title, {
        body, icon: data.icon || "/icon-192.png", badge: data.badge || "/icon-192.png",
        tag: data.tag || `poolamkoo-loan-risk-${alertId}`,
        data: { url: data.url || `/loans/${data.loanId}`, loanRiskAlertId: alertId, triggeredAt },
      });
    })());
    return;
  }
  if (data.kind === "loan-reminder") {
    event.waitUntil((async () => {
      const reminderKey = typeof data.reminderKey === "string" ? data.reminderKey : "";
      const loan = await readLocalLoan(Number(data.loanId));
      await markLoanReminderNotified(reminderKey, data.triggeredAt || new Date().toISOString());
      await self.registration.showNotification(loan?.name ? `یادآوری ${loan.name}` : "یادآوری قسط پولم‌کو", {
        body: localLoanReminderBody(data, loan),
        icon: data.icon || "/icon-192.png",
        badge: data.badge || "/icon-192.png",
        tag: data.tag || `poolamkoo-${reminderKey || "loan-reminder"}`,
        data: { url: data.url || "/loans", reminderKey },
      });
    })());
    return;
  }
  const title = typeof data.title === "string" ? data.title : "هشدار بازار پولم‌کو";
  const options = {
    body: typeof data.body === "string" ? data.body : "شرط یکی از هشدارهای بازار برقرار شده است.",
    icon: data.icon || "/icon-192.png",
    badge: data.badge || "/icon-192.png",
    tag: data.tag || "poolamkoo-market-alert",
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
