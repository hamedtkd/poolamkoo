import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createPoolamkooMediaDemoData, POOLAMKOO_MEDIA_ANCHOR } from "./media/demo-data.mjs";
import {
  CURRENT_SCHEMA8_NATIVE_VERSION,
  LEGACY_SCHEMA6_NATIVE_VERSION,
  legacySchema6SeedExpression,
  migratedSchema8InspectionExpression,
  providerCollisionInsertExpression,
} from "./fixtures/schema6-idb.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function assert(condition, message) {
  if (!condition) throw new Error(`Release smoke assertion failed: ${message}`);
}

async function freePort() {
  const { createServer } = await import("node:net");
  return new Promise((resolvePort, reject) => {
    const server = createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close(() => resolvePort(port));
    });
  });
}

function findBrowserExecutable() {
  const explicit = process.env.POOLAMKOO_BROWSER_PATH;
  if (explicit && existsSync(explicit)) return explicit;
  const candidates = process.platform === "win32"
    ? [
        `${process.env.PROGRAMFILES ?? "C:\\Program Files"}\\Google\\Chrome\\Application\\chrome.exe`,
        `${process.env["PROGRAMFILES(X86)"] ?? "C:\\Program Files (x86)"}\\Microsoft\\Edge\\Application\\msedge.exe`,
      ]
    : ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "microsoft-edge"];
  for (const candidate of candidates) {
    if (process.platform === "win32" && existsSync(candidate)) return candidate;
    if (process.platform !== "win32") {
      const found = spawnSync("which", [candidate], { encoding: "utf8" });
      if (found.status === 0 && found.stdout.trim()) return found.stdout.trim();
    }
  }
  return null;
}

async function waitForHttp(url, timeout = 45_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { redirect: "manual" });
      if (response.status < 500) return;
    } catch {}
    await new Promise((resolveWait) => setTimeout(resolveWait, 150));
  }
  throw new Error(`Poolamkoo production server did not become ready: ${url}`);
}

async function waitForJson(url, options = {}, timeout = 30_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response.json();
    } catch {}
    await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  }
  throw new Error(`Browser debugging endpoint did not become ready: ${url}`);
}

class CdpClient {
  constructor(url) {
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
    this.socket = new WebSocket(url);
    this.ready = new Promise((resolveReady, reject) => {
      this.socket.onopen = resolveReady;
      this.socket.onerror = () => reject(new Error("Could not connect to Chromium debugging socket."));
    });
    this.socket.onmessage = (message) => {
      const payload = JSON.parse(String(message.data));
      if (payload.id) {
        const entry = this.pending.get(payload.id);
        if (!entry) return;
        this.pending.delete(payload.id);
        if (payload.error) entry.reject(new Error(payload.error.message));
        else entry.resolve(payload.result);
        return;
      }
      for (const listener of this.listeners.get(payload.method) ?? []) listener(payload.params);
    };
  }
  async call(method, params = {}) {
    await this.ready;
    const id = this.nextId++;
    const result = new Promise((resolveCall, reject) => this.pending.set(id, { resolve: resolveCall, reject }));
    this.socket.send(JSON.stringify({ id, method, params }));
    return result;
  }
  on(method, listener) {
    const listeners = this.listeners.get(method) ?? [];
    listeners.push(listener);
    this.listeners.set(method, listeners);
  }
  close() { this.socket.close(); }
}

async function evaluate(client, expression) {
  const response = await client.call("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text || "Browser evaluation failed.");
  return response.result?.value;
}

async function waitFor(client, expression, label, timeout = 30_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await evaluate(client, expression)) return;
    await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  }
  throw new Error(`Timed out while waiting for ${label}.`);
}

async function navigate(client, url, readyText) {
  await client.call("Page.navigate", { url });
  await waitFor(client, "document.readyState === 'complete'", "document load");
  if (readyText) await waitFor(client, `document.body?.innerText.includes(${JSON.stringify(readyText)})`, readyText);
}

async function clientNavigate(client, href, readyText) {
  const marker = `client-nav-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await evaluate(client, `window.__poolamkooClientNavMarker = ${JSON.stringify(marker)}; true`);
  const clicked = await evaluate(client, `(() => {
    const link = [...document.querySelectorAll('a[href=${JSON.stringify(href)}]')].find((node) => {
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    }) ?? document.querySelector('a[href=${JSON.stringify(href)}]');
    if (!(link instanceof HTMLAnchorElement)) return false;
    link.click();
    return true;
  })()`);
  assert(clicked, `workspace navigation link ${href} must exist`);
  await waitFor(client, `location.pathname === ${JSON.stringify(href)}`, `client navigation to ${href}`);
  await waitFor(client, `document.body?.innerText.includes(${JSON.stringify(readyText)})`, readyText);
  assert(await evaluate(client, `window.__poolamkooClientNavMarker === ${JSON.stringify(marker)}`), `navigation to ${href} must stay client-side without a document reload`);
  assert(await evaluate(client, `(() => {
    const content = document.querySelector('[data-route-content=${JSON.stringify(href)}]');
    if (!(content instanceof HTMLElement)) return false;
    const style = getComputedStyle(content);
    const rect = content.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0.01 && rect.width > 0 && rect.height > 0 && (content.innerText || '').trim().length > 0;
  })()`), `workspace content must remain visible after client navigation to ${href}`);
}

async function assertTourSpotlight(client, targetName, locationLabel) {
  let lastState = null;
  for (let attempt = 0; attempt < 36; attempt += 1) {
    lastState = await evaluate(client, `(() => {
      const selector = ${JSON.stringify('[data-tour="__TARGET__"]')}.replace('__TARGET__', ${JSON.stringify(targetName)});
      const target = [...document.querySelectorAll(selector)].find((node) => {
        if (!(node instanceof HTMLElement)) return false;
        const rect = node.getBoundingClientRect();
        const style = getComputedStyle(node);
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      });
      const spotlight = document.querySelector('[data-tour-spotlight=true][data-tour-target="' + ${JSON.stringify(targetName)} + '"]');
      const overlay = document.querySelector('[data-tour-overlay=masked][data-tour-target="' + ${JSON.stringify(targetName)} + '"]');
      const overlayIsSvg = overlay instanceof Element && overlay.namespaceURI === 'http://www.w3.org/2000/svg' && overlay.tagName.toLowerCase() === 'svg';
      if (!(target instanceof HTMLElement) || !(spotlight instanceof HTMLElement) || !overlayIsSvg) {
        return {
          ok: false,
          reason: 'missing exact target, spotlight, or masked overlay',
          targetFound: target instanceof HTMLElement,
          spotlightFound: spotlight instanceof HTMLElement,
          overlayFound: overlayIsSvg,
          viewport: { width: innerWidth, height: innerHeight },
          mobileQuery: matchMedia('(max-width: 767px)').matches,
          activeSpotlight: document.querySelector('[data-tour-spotlight=true]')?.getAttribute('data-tour-target') ?? null,
          activeOverlay: document.querySelector('[data-tour-overlay]')?.getAttribute('data-tour-target') ?? null,
        };
      }
      const targetRect = target.getBoundingClientRect();
      const spotRect = spotlight.getBoundingClientRect();
      const cutout = overlay.querySelector('[data-tour-cutout=true]');
      const dimmer = overlay.querySelector('[data-tour-dimmer=true]');
      const hole = {
        top: Number(overlay.getAttribute('data-tour-hole-top')),
        left: Number(overlay.getAttribute('data-tour-hole-left')),
        right: Number(overlay.getAttribute('data-tour-hole-right')),
        bottom: Number(overlay.getAttribute('data-tour-hole-bottom')),
      };
      const epsilon = 1;
      const targetInsideHole = hole.left <= targetRect.left + epsilon
        && hole.right >= targetRect.right - epsilon
        && hole.top <= targetRect.top + epsilon
        && hole.bottom >= targetRect.bottom - epsilon;
      const ringContainsTarget = spotRect.left <= targetRect.left + epsilon
        && spotRect.right >= targetRect.right - epsilon
        && spotRect.top <= targetRect.top + epsilon
        && spotRect.bottom >= targetRect.bottom - epsilon;
      const maskIsCutOut = cutout?.getAttribute('fill') === 'black'
        && dimmer?.getAttribute('mask') === 'url(#product-tour-spotlight-mask)';
      const card = document.querySelector('[role=dialog]')?.textContent ?? '';
      const ok = targetInsideHole && ringContainsTarget && maskIsCutOut && card.includes(${JSON.stringify(`در حال نمایش: ${locationLabel}`)});
      return {
        ok,
        reason: ok ? null : 'spotlight geometry did not settle inside the SVG cutout',
        target: { left: targetRect.left, right: targetRect.right, top: targetRect.top, bottom: targetRect.bottom },
        hole,
        spot: { left: spotRect.left, right: spotRect.right, top: spotRect.top, bottom: spotRect.bottom },
        maskIsCutOut,
        viewport: { width: innerWidth, height: innerHeight },
      };
    })()`);
    if (lastState?.ok) return true;
    await new Promise((resolveWait) => setTimeout(resolveWait, 60));
  }
  console.error(`Product tour spotlight failed for ${targetName}:`, lastState);
  return false;
}

async function dragElementDown(client, selector, distance = 180) {
  const point = await evaluate(client, `(() => {
    const node = document.querySelector(${JSON.stringify(selector)});
    if (!(node instanceof HTMLElement)) return null;
    const rect = node.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  })()`);
  assert(point, `drag handle ${selector} must exist`);
  await client.call("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", buttons: 1, clickCount: 1 });
  for (const offset of [45, 90, 135, distance]) {
    await client.call("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y + offset, button: "left", buttons: 1 });
    await new Promise((resolveWait) => setTimeout(resolveWait, 35));
  }
  await client.call("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y + distance, button: "left", buttons: 0, clickCount: 1 });
}

async function verifyLegacySchemaMigration(client, origin) {
  const seededVersion = await evaluate(client, legacySchema6SeedExpression(POOLAMKOO_MEDIA_ANCHOR));
  assert(seededVersion === LEGACY_SCHEMA6_NATIVE_VERSION, "legacy schema 6 fixture must use native IndexedDB version 60");

  await navigate(client, `${origin}/dashboard`, "قانون پول فعلی");
  const migrated = await evaluate(client, migratedSchema8InspectionExpression());
  assert(migrated?.nativeVersion === CURRENT_SCHEMA8_NATIVE_VERSION, "schema 6 profile must upgrade in place through schema 8");
  assert(migrated?.assets?.some((row) => row.marketId === "shared-market-id" && row.marketSource === "tindex"), "legacy linked assets must normalize to Tindex during schema 7 migration");
  assert(migrated?.watchlist?.some((row) => row.marketId === "shared-market-id" && row.source === "tindex"), "legacy watchlist rows must survive migration with Tindex identity");
  assert(migrated?.alerts?.some((row) => row.marketId === "legacy-alert-id" && row.source === "tindex"), "legacy market alerts must survive migration with Tindex identity");
  assert(migrated?.alerts?.some((row) => row.marketId === "explicit-tsetmc-id" && row.source === "tsetmc"), "explicit TSETMC identity must survive schema 7 migration");
  assert(migrated?.watchIndexes?.includes("[source+marketId]") && migrated?.alertIndexes?.includes("[source+marketId]"), "schema 7 must expose provider-scoped market indexes after migration");
  assert(migrated?.watchMarketIdUnique === false, "raw marketId must stop being globally unique after schema 7 migration");
  assert(migrated?.funds?.some((row) => row.id === 1 && row.currentToman === 2_500_000), "legacy fund balance must survive schema 8 migration");
  assert(migrated?.fundMovements?.some((row) => row.fundId === 1 && row.type === "opening" && row.source === "migration" && row.amountToman === 2_500_000), "schema 8 migration must create an opening fund-ledger row for legacy balances");

  const collisions = await evaluate(client, providerCollisionInsertExpression(POOLAMKOO_MEDIA_ANCHOR));
  assert(JSON.stringify(collisions) === JSON.stringify([
    { marketId: "shared-market-id", source: "tindex" },
    { marketId: "shared-market-id", source: "tsetmc" },
  ]), "Tindex and TSETMC rows with the same raw marketId must coexist after migration");

  await navigate(client, "about:blank");
  await client.call("Storage.clearDataForOrigin", { origin, storageTypes: "all" });
}

async function seedDemoData(client) {
  const data = createPoolamkooMediaDemoData();
  await evaluate(client, `(async () => {
    const data = ${JSON.stringify(data)};
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open("poolyar-local");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const stores = Object.keys(data).filter((name) => db.objectStoreNames.contains(name));
    const tx = db.transaction(stores, "readwrite");
    for (const name of stores) {
      const store = tx.objectStore(name);
      store.clear();
      for (const row of data[name]) store.put(row);
    }
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    db.close();
    sessionStorage.removeItem("poolamkoo:date-ranges");
    return true;
  })()`);
}

function waitForSpawn(child, label) {
  return new Promise((resolveSpawn, reject) => {
    child.once("error", (error) => reject(new Error(`${label} could not start: ${error.message}`)));
    if (child.pid) { queueMicrotask(resolveSpawn); return; }
    child.once("spawn", resolveSpawn);
  });
}

async function stopProcess(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
  else child.kill("SIGTERM");
  await Promise.race([
    new Promise((resolveExit) => child.once("exit", resolveExit)),
    new Promise((resolveWait) => setTimeout(resolveWait, 5_000)),
  ]);
}

async function main() {
  if (!existsSync(resolve(ROOT, ".next"))) throw new Error("Run npm run build before the release browser smoke, or use npm run test:browser:release.");
  const browserExecutable = findBrowserExecutable();
  if (!browserExecutable) throw new Error("Chrome, Edge or Chromium was not found. Set POOLAMKOO_BROWSER_PATH to the browser executable.");
  const nextBin = resolve(ROOT, "node_modules", "next", "dist", "bin", "next");
  if (!existsSync(nextBin)) throw new Error("Next.js runtime was not found. Run npm install first.");

  const appPort = await freePort();
  const debugPort = await freePort();
  const origin = `http://127.0.0.1:${appPort}`;
  const profileDir = await mkdtemp(join(tmpdir(), "poolamkoo-release-smoke-"));
  const server = spawn(process.execPath, [nextBin, "start", "-p", String(appPort), "-H", "127.0.0.1"], {
    cwd: ROOT,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  const browserArgs = [
    "--headless=new",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profileDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-dev-shm-usage",
    "about:blank",
  ];
  if (typeof process.getuid === "function" && process.getuid() === 0) browserArgs.push("--no-sandbox");
  const browser = spawn(browserExecutable, browserArgs, { stdio: ["ignore", "ignore", "pipe"], windowsHide: true });
  let serverOutput = "";
  let browserOutput = "";
  let client;
  server.stdout.on("data", (chunk) => { serverOutput += chunk; });
  server.stderr.on("data", (chunk) => { serverOutput += chunk; });
  browser.stderr.on("data", (chunk) => { browserOutput += chunk; });

  try {
    await Promise.all([waitForSpawn(server, "Poolamkoo production server"), waitForSpawn(browser, "Chromium")]);
    await waitForHttp(`${origin}/`);
    await waitForJson(`http://127.0.0.1:${debugPort}/json/version`);
    const target = await waitForJson(`http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent("about:blank")}`, { method: "PUT" });
    client = new CdpClient(target.webSocketDebuggerUrl);
    const runtimeErrors = [];
    client.on("Runtime.exceptionThrown", ({ exceptionDetails }) => {
      runtimeErrors.push(exceptionDetails?.exception?.description || exceptionDetails?.text || "Runtime exception");
    });
    await client.call("Page.enable");
    await client.call("Runtime.enable");
    await client.call("Network.enable");
    await client.call("Network.setBlockedURLs", { urls: ["*/api/market*", "*/api/push/*", "*static.cloudflareinsights.com*"] });
    await client.call("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
    await client.call("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    await client.call("Page.addScriptToEvaluateOnNewDocument", { source: `(() => { const RealDate=Date; const fixed=${JSON.stringify(POOLAMKOO_MEDIA_ANCHOR)}; class FixedDate extends RealDate { constructor(...args){ super(...(args.length?args:[fixed])); } static now(){ return new RealDate(fixed).getTime(); } } FixedDate.parse=RealDate.parse; FixedDate.UTC=RealDate.UTC; window.Date=FixedDate; })();` });
    await client.call("Storage.clearDataForOrigin", { origin, storageTypes: "all" });

    await navigate(client, `${origin}/`, "پول جدید که می‌رسد");
    assert(await evaluate(client, "location.pathname === '/'"), "normal web root must remain the public landing page");
    assert(await evaluate(client, "document.querySelector('link[rel=manifest]') === null"), "public landing must not advertise the installable manifest");
    assert(await evaluate(client, "navigator.serviceWorker.getRegistrations().then((rows) => rows.length === 0)"), "public landing must not initialize a service worker in a fresh profile");
    assert(await evaluate(client, "Boolean([...document.querySelectorAll('a')].find((node) => node.getAttribute('href') === '/dashboard' && node.textContent?.includes('شروع رایگان')))"), "landing must expose a dashboard CTA");
    await waitFor(client, "[...document.querySelectorAll('img[data-landing-visual]')].some((node) => node.complete && node.naturalWidth > 0)", "landing product visual");
    assert(await evaluate(client, "[...document.querySelectorAll('img[data-landing-visual]')].some((node) => getComputedStyle(node).display !== 'none')"), "one landing theme visual must be visible");
    await waitFor(client, "document.querySelector('[data-public-theme-toggle=\"true\"][data-hydrated=\"true\"]') !== null", "public theme toggle hydration");
    const beforeTheme = await evaluate(client, "document.documentElement.classList.contains('dark') ? 'dark' : 'light'");
    const clickedPublicTheme = await evaluate(client, `(() => {
      const button = document.querySelector('[data-public-theme-toggle="true"][data-hydrated="true"]');
      if (!(button instanceof HTMLButtonElement)) return false;
      button.click();
      return true;
    })()`);
    assert(clickedPublicTheme, "hydrated public theme toggle must be clickable");
    await waitFor(client, `document.documentElement.classList.contains(${JSON.stringify(beforeTheme === "dark" ? "light" : "dark")})`, "public theme switch");

    await verifyLegacySchemaMigration(client, origin);
    await navigate(client, `${origin}/`, "پول جدید که می‌رسد");
    assert(await evaluate(client, "navigator.serviceWorker.getRegistrations().then((rows) => rows.length === 0)"), "migration fixture cleanup must restore a fresh public origin");
    await evaluate(client, "[...document.querySelectorAll('a')].find((node) => node.getAttribute('href') === '/dashboard' && node.textContent?.includes('شروع رایگان'))?.click(); true");
    await waitFor(client, "location.pathname === '/dashboard'", "landing-to-workspace navigation");
    await waitFor(client, "document.body?.innerText.includes('پولت را از همان چیزی که واقعاً داری شروع کن')", "fresh onboarding");

    const manifestHref = await evaluate(client, "document.querySelector('link[rel=manifest]')?.getAttribute('href') ?? ''");
    assert(manifestHref === "/app.webmanifest", "workspace must advertise /app.webmanifest");
    const manifest = await evaluate(client, "fetch('/app.webmanifest', { cache: 'no-store' }).then((response) => response.json())");
    assert(manifest?.id === "/dashboard", "manifest id must be /dashboard");
    assert(manifest?.start_url === "/dashboard", "manifest start_url must be /dashboard");
    assert(manifest?.scope === "/", "manifest scope must cover sibling workspace routes");
    assert(manifest?.display === "standalone", "manifest display must stay standalone");
    await waitFor(client, "navigator.serviceWorker.getRegistrations().then((rows) => rows.length > 0)", "workspace service worker registration", 20_000);

    const freshSettings = await evaluate(client, `(async () => {
      const db = await new Promise((resolve, reject) => { const request=indexedDB.open('poolyar-local'); request.onsuccess=()=>resolve(request.result); request.onerror=()=>reject(request.error); });
      const value = await new Promise((resolve, reject) => { const tx=db.transaction('settings','readonly'); const request=tx.objectStore('settings').get('settings'); request.onsuccess=()=>resolve(request.result); request.onerror=()=>reject(request.error); });
      db.close(); return value;
    })()`);
    assert(freshSettings?.onboardingComplete === false, "fresh local data must start with onboarding incomplete");
    await evaluate(client, "[...document.querySelectorAll('button')].find((node) => node.textContent?.includes('فعلاً ردش کن'))?.click(); true");
    await waitFor(client, "document.body?.innerText.includes('قانون پول فعلی')", "dashboard after onboarding skip");
    await waitFor(client, `(async () => { const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('poolyar-local');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)}); const value=await new Promise((resolve,reject)=>{const tx=db.transaction('settings','readonly');const r=tx.objectStore('settings').get('settings');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)}); db.close(); return value?.onboardingComplete === true; })()`, "persisted onboarding completion");

    await seedDemoData(client);
    await navigate(client, `${origin}/dashboard`, "قانون پول فعلی");
    assert(await evaluate(client, "document.body?.innerText.includes('صندوق اضطراری')"), "seeded local data must render on the dashboard");
    assert(await evaluate(client, `(() => {
      const heading = [...document.querySelectorAll('h1')].find((node) => node.textContent?.includes('سلام، امروز پولت کجاست؟'));
      if (!(heading instanceof HTMLElement)) return false;
      const style = getComputedStyle(heading);
      const rect = heading.getBoundingClientRect();
      return style.visibility !== 'hidden' && Number(style.opacity) > 0.01 && rect.width > 0 && rect.height > 0;
    })()`), "dashboard critical content must be visible with normal motion preference");
    assert(await evaluate(client, `(() => {
      const nodes = [...document.querySelectorAll('[class*="animate-fade"]')].filter((node) => node instanceof HTMLElement);
      const running = nodes.filter((node) => getComputedStyle(node).animationName !== 'none');
      const delays = new Set(running.map((node) => getComputedStyle(node).animationDelay));
      return running.length >= 4 && delays.size >= 3;
    })()`), "workspace must compile tailwindcss-animated stagger utilities with distinct delays");

    await evaluate(client, "window.dispatchEvent(new Event('poolamkoo:start-tour')); true");
    await waitFor(client, "document.querySelector('[data-tour-spotlight=true][data-tour-target=\"new-money\"]') !== null && document.querySelector('[data-tour-overlay=masked][data-tour-target=\"new-money\"]') !== null", "desktop product tour new-money spotlight");
    assert(await assertTourSpotlight(client, "new-money", "سایدبار"), "product tour must leave the highlighted control visually outside the overlay");
    await evaluate(client, `[...document.querySelectorAll('[role=dialog] button')].find((node) => node.textContent?.includes('بعدی'))?.click(); true`);
    await waitFor(client, "document.querySelector('[role=dialog]')?.textContent?.includes('هر چیزی را سریع پیدا کن')", "product tour search step");
    assert(await assertTourSpotlight(client, "global-search", "نوار بالای صفحه"), "desktop global search must have a real visible tour target");
    await evaluate(client, `[...document.querySelectorAll('[role=dialog] button')].find((node) => node.textContent?.includes('رد کردن راهنما'))?.click(); true`);
    await waitFor(client, "document.querySelector('[data-tour-spotlight=true]') === null", "product tour close");

    const openedNewMoney = await evaluate(client, `(() => {
      const button = [...document.querySelectorAll('button')].find((node) => node.textContent?.includes('پول جدید دارم'));
      if (!(button instanceof HTMLButtonElement)) return false;
      button.click();
      return true;
    })()`);
    assert(openedNewMoney, "dashboard must expose the new-money dialog trigger");
    await waitFor(client, "document.querySelector('[role=dialog]')?.textContent?.includes('مبلغ')", "visible new-money dialog content");
    assert(await evaluate(client, `(() => {
      const dialog = document.querySelector('[role=dialog]');
      if (!(dialog instanceof HTMLElement)) return false;
      const content = dialog.matches('[data-dialog-content]') ? dialog : dialog.querySelector('[data-dialog-content]');
      if (!(content instanceof HTMLElement)) return false;
      const style = getComputedStyle(content);
      const rect = content.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0.01 && rect.width > 0 && rect.height > 0 && (content.innerText || '').includes('پول جدید دارم');
    })()`), "shared dialog content must never render blank under normal motion preference");
    await evaluate(client, "document.querySelector('[role=dialog] button[aria-label=\"بستن پنجره\"]')?.click(); true");
    await waitFor(client, "document.querySelector('[role=dialog]') === null", "new-money dialog close");

    await clientNavigate(client, "/reports", "گزارش‌ها و بینش‌ها");
    assert(await evaluate(client, "document.body?.innerText.includes('جمع‌بندی تصمیمی این بازه')"), "reports must render decision insights from local demo data");
    assert(await evaluate(client, "document.body?.innerText.includes('قانون پول در برابر تخصیص ثبت‌شده')"), "reports must render recorded allocation comparison");
    const exportOpened = await evaluate(client, `(() => {
      const button = [...document.querySelectorAll('button')].find((node) => node.textContent?.includes('خروجی و اشتراک'));
      if (!(button instanceof HTMLButtonElement)) return false;
      button.click();
      return true;
    })()`);
    assert(exportOpened, "reports must expose privacy-safe export controls");
    await waitFor(client, "document.querySelector('[data-report-export-dialog=true]')?.textContent?.includes('خلاصه مناسب اشتراک')", "report export dialog");
    assert(await evaluate(client, "document.querySelector('[data-report-export-dialog=true]')?.textContent?.includes('بدون مبلغ و بدون نام دارایی')"), "shared report summary must advertise its privacy-safe scope");
    assert(await evaluate(client, "document.querySelector('[data-report-export-dialog=true]')?.textContent?.includes('دانلود CSV')"), "reports must expose explicit local CSV export");
    await evaluate(client, "document.querySelector('[data-report-export-dialog=true]')?.closest('[data-dialog-content]')?.querySelector('button[aria-label=\"بستن پنجره\"]')?.click(); true");
    await waitFor(client, "document.querySelector('[data-report-export-dialog=true]') === null", "report export dialog close");

    await clientNavigate(client, "/settings", "پولم‌کو را برای خودت تنظیم کن");
    await clientNavigate(client, "/reports", "گزارش‌ها و بینش‌ها");
    assert(await evaluate(client, "document.body?.innerText.includes('جمع‌بندی تصمیمی این بازه')"), "reports must remain visible after returning through client-side workspace navigation");

    await client.call("Emulation.setDeviceMetricsOverride", { width: 425, height: 800, deviceScaleFactor: 1, mobile: true });
    await waitFor(client, "document.querySelector('[data-tour=mobile-more]') !== null", "mobile navigation");
    await evaluate(client, "document.querySelector('[data-tour=mobile-more]')?.click(); true");
    await waitFor(client, "document.querySelector('[data-drawer-content=true]')?.textContent?.includes('دسترسی سریع')", "mobile more drawer");
    assert(await evaluate(client, `(() => {
      const text = document.querySelector('[data-drawer-content=true]')?.textContent ?? '';
      return text.includes('گزارش‌ها') && text.includes('تنظیمات') && !text.includes('پول‌های ورودی') && !text.includes('سرمایه‌گذاری');
    })()`), "mobile more drawer must stay focused instead of duplicating the primary bottom navigation");
    await dragElementDown(client, "[data-drawer-drag-handle=true]", 190);
    await waitFor(client, "document.querySelector('[data-drawer-content=true]') === null", "drag-to-dismiss mobile drawer");

    await evaluate(client, "window.dispatchEvent(new Event('poolamkoo:start-tour')); true");
    const mobileTour = [
      ["میانبرهای اصلی اینجاست", "mobile-more", "نوار پایین"],
      ["سرمایه‌گذاری و خرید واقعی", "investments", "نوار پایین"],
      ["هزینه‌های آینده را جدا نگه دار", "funds", "نوار پایین"],
      ["جست‌وجو همیشه در دسترس است", "global-search", "نوار بالای صفحه"],
    ];
    for (let index = 0; index < mobileTour.length; index += 1) {
      const [title, targetName, locationLabel] = mobileTour[index];
      await waitFor(client, `document.querySelector('[role=dialog]')?.textContent?.includes(${JSON.stringify(title)})`, `mobile product tour step ${index + 1}`);
      assert(await assertTourSpotlight(client, targetName, locationLabel), `mobile product tour step ${index + 1} must keep a visible target outside the overlay`);
      const action = index === mobileTour.length - 1 ? "تمام" : "بعدی";
      await evaluate(client, `[...document.querySelectorAll('[role=dialog] button')].find((node) => node.textContent?.includes(${JSON.stringify(action)}))?.click(); true`);
    }
    await waitFor(client, "document.querySelector('[data-tour-spotlight=true]') === null", "mobile product tour close");
    await client.call("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });

    await navigate(client, `${origin}/`, "پول جدید که می‌رسد");
    assert(await evaluate(client, "location.pathname === '/'"), "normal browser root must remain landing even after workspace PWA registration");
    assert(await evaluate(client, "document.querySelector('link[rel=manifest]') === null"), "returning to the public landing must remove workspace manifest metadata");
    assert(await evaluate(client, "Boolean(navigator.serviceWorker.controller)"), "public landing should remain under the existing root-scope worker after workspace registration");
    assert(await evaluate(client, "caches.match('/').then((response) => response === undefined)"), "workspace service worker must not cache the public landing navigation");

    const actionableRuntimeErrors = runtimeErrors.filter((message) => !/ResizeObserver loop|net::ERR_BLOCKED_BY_CLIENT/i.test(message));
    if (actionableRuntimeErrors.length) throw new Error(`Browser runtime errors during release smoke:\n${actionableRuntimeErrors.join("\n")}`);
    console.log("Release browser smoke passed: schema 6→8 migration, landing media/theme → workspace, stagger motion, product-tour spotlight clarity, dashboard/dialog visibility, report export, mobile drag-to-dismiss, client-side route continuity, and network-only public PWA boundaries are healthy.");
  } catch (error) {
    if (serverOutput.trim()) console.error(`\nServer output:\n${serverOutput.trim()}`);
    if (browserOutput.trim()) console.error(`\nBrowser output:\n${browserOutput.trim()}`);
    throw error;
  } finally {
    client?.close();
    await stopProcess(browser);
    await stopProcess(server);
    await rm(profileDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
