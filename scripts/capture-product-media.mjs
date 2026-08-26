import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createPoolamkooMediaDemoData, POOLAMKOO_MEDIA_ANCHOR } from "./media/demo-data.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SCREENSHOT_DIR = resolve(ROOT, "docs/assets/screenshots");

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
  await evaluate(client, "window.scrollTo(0, 0); true");
  await new Promise((resolveWait) => setTimeout(resolveWait, 450));
}

async function viewport(client, width, height, mobile = false) {
  await client.call("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile, screenWidth: width, screenHeight: height });
}

async function screenshot(client, filename) {
  const response = await client.call("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false });
  await writeFile(resolve(SCREENSHOT_DIR, filename), Buffer.from(response.data, "base64"));
  console.log(`✓ ${filename}`);
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
    await new Promise((resolve, reject) => { tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error); });
    db.close();
    localStorage.removeItem("poolamkoo:date-ranges");
    return true;
  })()`);
}

async function setPublicTheme(client, mode) {
  await evaluate(client, `localStorage.setItem("theme", ${JSON.stringify(mode)}); true`);
}

async function setTheme(client, mode) {
  await evaluate(client, `(async () => {
    const db = await new Promise((resolve, reject) => { const r=indexedDB.open("poolyar-local"); r.onsuccess=()=>resolve(r.result); r.onerror=()=>reject(r.error); });
    const tx=db.transaction("settings","readwrite"); const store=tx.objectStore("settings");
    const row=await new Promise((resolve,reject)=>{ const r=store.get("settings"); r.onsuccess=()=>resolve(r.result); r.onerror=()=>reject(r.error); });
    store.put({ ...row, darkMode: ${JSON.stringify(mode)}, updatedAt: new Date().toISOString() });
    await new Promise((resolve,reject)=>{ tx.oncomplete=resolve; tx.onerror=()=>reject(tx.error); }); db.close(); return true;
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
  await Promise.race([new Promise((resolveExit) => child.once("exit", resolveExit)), new Promise((resolveWait) => setTimeout(resolveWait, 5_000))]);
}

async function main() {
  if (!existsSync(resolve(ROOT, ".next"))) throw new Error("Run npm run build before media capture, or use npm run media:capture.");
  const browserExecutable = findBrowserExecutable();
  if (!browserExecutable) throw new Error("Chrome, Edge or Chromium was not found. Set POOLAMKOO_BROWSER_PATH to the browser executable.");
  await mkdir(SCREENSHOT_DIR, { recursive: true });
  const appPort = await freePort();
  const debugPort = await freePort();
  const origin = `http://127.0.0.1:${appPort}`;
  const nextBin = resolve(ROOT, "node_modules", "next", "dist", "bin", "next");
  if (!existsSync(nextBin)) throw new Error("Next.js runtime was not found. Run npm install first.");
  const server = spawn(process.execPath, [nextBin, "start", "-p", String(appPort), "-H", "127.0.0.1"], { cwd: ROOT, env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" }, stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
  const profileDir = await mkdtemp(join(tmpdir(), "poolamkoo-media-profile-"));
  const browserArgs = ["--headless=new", `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profileDir}`, "--no-first-run", "--no-default-browser-check", "--disable-dev-shm-usage", "about:blank"];
  if (typeof process.getuid === "function" && process.getuid() === 0) browserArgs.push("--no-sandbox");
  const browser = spawn(browserExecutable, browserArgs, { stdio: ["ignore", "ignore", "pipe"], windowsHide: true });
  let serverOutput = ""; let browserOutput = ""; let client;
  server.stdout.on("data", (chunk) => { serverOutput += chunk; }); server.stderr.on("data", (chunk) => { serverOutput += chunk; });
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
    await client.call("Page.enable"); await client.call("Runtime.enable"); await client.call("Network.enable");
    await client.call("Network.setBlockedURLs", { urls: ["*/api/market*", "*/api/push/*", "*static.cloudflareinsights.com*"] });
    await client.call("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
    await client.call("Page.addScriptToEvaluateOnNewDocument", { source: `(() => { const RealDate=Date; const fixed=${JSON.stringify(POOLAMKOO_MEDIA_ANCHOR)}; class FixedDate extends RealDate { constructor(...args){ super(...(args.length?args:[fixed])); } static now(){ return new RealDate(fixed).getTime(); } } FixedDate.parse=RealDate.parse; FixedDate.UTC=RealDate.UTC; window.Date=FixedDate; })();` });
    await client.call("Storage.clearDataForOrigin", { origin, storageTypes: "all" });

    await viewport(client, 1440, 960);
    await navigate(client, `${origin}/`, "پولم‌کو");
    await setPublicTheme(client, "light");
    await navigate(client, `${origin}/`, "پولم‌کو");
    await screenshot(client, "landing-light-desktop.png");
    await setPublicTheme(client, "dark");
    await navigate(client, `${origin}/`, "پولم‌کو");
    await screenshot(client, "landing-dark-desktop.png");
    await setPublicTheme(client, "light");

    await navigate(client, `${origin}/dashboard`, null);
    await waitFor(client, `indexedDB.databases().then((dbs) => dbs.some((db) => db.name === "poolyar-local" && (db.version ?? 0) >= 6))`, "local database bootstrap");
    await seedDemoData(client);
    await navigate(client, `${origin}/dashboard`, "قانون پول فعلی");
    await screenshot(client, "dashboard-light-desktop.png");

    await setTheme(client, "dark");
    await navigate(client, `${origin}/dashboard`, "قانون پول فعلی");
    await screenshot(client, "dashboard-dark-desktop.png");

    await setTheme(client, "light");
    await navigate(client, `${origin}/investments`, "مرور ترکیب سبد");
    await screenshot(client, "investments-light-desktop.png");

    await viewport(client, 390, 844, true);
    await navigate(client, `${origin}/investments`, "مرور ترکیب سبد");
    await screenshot(client, "investments-mobile.png");

    await viewport(client, 1440, 960);
    await navigate(client, `${origin}/reports`, "گزارش");
    await screenshot(client, "reports-light-desktop.png");

    const actionableRuntimeErrors = runtimeErrors.filter((message) => !/AbortError|ResizeObserver loop/i.test(message));
    if (actionableRuntimeErrors.length) throw new Error(`Browser runtime errors during product capture:\n${actionableRuntimeErrors.join("\n")}`);
    console.log(`Product screenshots written to ${SCREENSHOT_DIR}`);
  } catch (error) {
    if (serverOutput.trim()) console.error(`\nServer output:\n${serverOutput.trim()}`);
    if (browserOutput.trim()) console.error(`\nBrowser output:\n${browserOutput.trim()}`);
    throw error;
  } finally {
    client?.close();
    await stopProcess(browser); await stopProcess(server);
    await rm(profileDir, { recursive: true, force: true });
  }
}

main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
