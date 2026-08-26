import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(path, "utf8");

test("workspace manifest launches the installed app at dashboard", () => {
  const manifest = JSON.parse(read("public/app.webmanifest")) as Record<string, unknown>;
  assert.equal(manifest.id, "/dashboard");
  assert.equal(manifest.start_url, "/dashboard");
  assert.equal(manifest.scope, "/");
  assert.equal(manifest.display, "standalone");
});

test("only the workspace advertises and initializes the installable app", () => {
  const root = read("app/layout.tsx");
  const workspace = read("app/(workspace)/layout.tsx");
  const providers = read("components/providers.tsx");
  assert.equal(root.includes("app.webmanifest"), false);
  assert.equal(root.includes("appleWebApp"), false);
  assert.equal(workspace.includes('manifest: "/app.webmanifest"'), true);
  assert.equal(workspace.includes("appleWebApp"), true);
  assert.equal(providers.includes("PwaUpdateNotice"), false);
  assert.equal(workspace.includes("PwaUpdateNotice"), true);
});

test("standalone landing root falls through to dashboard without changing normal web routing", () => {
  const redirect = read("components/landing/standalone-landing-redirect.tsx");
  const landing = read("app/(public)/page.tsx");
  assert.equal(landing.includes("StandaloneLandingRedirect"), true);
  assert.equal(redirect.includes('window.location.pathname !== "/"'), true);
  assert.equal(redirect.includes('(display-mode: standalone)'), true);
  assert.equal(redirect.includes('window.location.replace("/dashboard")'), true);
  assert.equal(landing.includes('redirect("/dashboard")'), false);
});

test("service worker does not explicitly precache the landing root", () => {
  const serviceWorker = read("public/sw.js");
  const precacheLine = serviceWorker.split("\n").find((line) => line.startsWith("const PRECACHE")) ?? "";
  assert.equal(precacheLine.includes('["/",'), false);
  assert.equal(precacheLine.includes('"/dashboard"'), true);
  assert.equal(precacheLine.includes('"/offline"'), true);
});

test("obsolete cleanup removes the legacy root manifest special route", () => {
  const cleanup = read("scripts/remove-obsolete-routes.mjs");
  assert.equal(cleanup.includes('"app/manifest.ts"'), true);
  assert.equal(cleanup.includes('"app/manifest.webmanifest"'), true);
});
