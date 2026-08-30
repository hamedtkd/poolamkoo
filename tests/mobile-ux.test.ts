import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const drawer = readFileSync("components/ui/drawer.tsx", "utf8");
const globals = readFileSync("app/globals.css", "utf8");
const mobileNavigation = readFileSync("components/app/mobile-navigation.tsx", "utf8");
const globalSearch = readFileSync("components/app/global-search.tsx", "utf8");
const funds = readFileSync("components/sections/funds.tsx", "utf8");
const investments = readFileSync("components/sections/investments.tsx", "utf8");
const reports = readFileSync("components/sections/reports.tsx", "utf8");
const dashboard = readFileSync("components/sections/dashboard.tsx", "utf8");

test("mobile drawer drag uses an independent translate channel and live drag ref", () => {
  assert.match(drawer, /data-drawer-drag-handle="true"/);
  assert.match(drawer, /dragYRef\.current/);
  assert.match(drawer, /DRAG_CLOSE_RATIO/);
  assert.match(drawer, /--drawer-drag-y/);
  assert.match(globals, /\.drawer-drag-surface\s*\{[^}]*translate:\s*0 var\(--drawer-drag-y/);
});

test("more sheet avoids repeating primary bottom-navigation destinations", () => {
  assert.match(mobileNavigation, /دسترسی سریع/);
  assert.match(mobileNavigation, /بخش‌های اصلی پایین صفحه هستند/);
  assert.doesNotMatch(mobileNavigation, /<MenuLink href="\/(income|funds|investments)"/);
  assert.match(mobileNavigation, /href="\/activity"/);
  assert.match(mobileNavigation, /href="\/reports"/);
  assert.match(mobileNavigation, /href="\/settings"/);
});

test("global search starts compact instead of listing every route before typing", () => {
  assert.match(globalSearch, /new Set\(\["action:new-money", "nav:\/activity", "nav:\/reports", "nav:\/settings"\]\)/);
  assert.match(globalSearch, /برای نتیجه دقیق‌تر شروع به تایپ کن/);
  assert.doesNotMatch(globalSearch, /items\.slice\(0, 9\)/);
});

test("workspace content motion follows one top-to-bottom direction", () => {
  for (const source of [funds, investments, reports, dashboard]) {
    assert.doesNotMatch(source, /direction="(?:left|right)"|flow="sides"/);
  }
});
