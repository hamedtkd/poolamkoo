import test from "node:test";
import assert from "node:assert/strict";
import { APP_ENTRY_PATH, DEFAULT_SITE_URL, PUBLIC_INDEX_ROUTES, siteUrl } from "../lib/site.ts";

test("public website and local app have separate stable entry points", () => {
  assert.equal(APP_ENTRY_PATH, "/dashboard");
  assert.equal(PUBLIC_INDEX_ROUTES[0], "/");
  assert.equal(PUBLIC_INDEX_ROUTES.includes(APP_ENTRY_PATH as never), false);
});

test("siteUrl accepts normal origins and falls back for invalid configuration", () => {
  assert.equal(siteUrl("https://example.com/path"), "https://example.com");
  assert.equal(siteUrl("http://localhost:3000/foo"), "http://localhost:3000");
  assert.equal(siteUrl("javascript:alert(1)"), DEFAULT_SITE_URL);
  assert.equal(siteUrl("not a url"), DEFAULT_SITE_URL);
});

test("public sitemap contains only non-financial informational routes", () => {
  for (const privateRoute of ["/dashboard", "/income", "/funds", "/investments", "/activity", "/reports", "/settings"]) {
    assert.equal(PUBLIC_INDEX_ROUTES.includes(privateRoute as never), false);
  }
  assert.ok(PUBLIC_INDEX_ROUTES.includes("/privacy"));
  assert.ok(PUBLIC_INDEX_ROUTES.includes("/data-safety"));
});
