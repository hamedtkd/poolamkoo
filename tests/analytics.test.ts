import assert from "node:assert/strict";
import test from "node:test";
import { cloudflareAnalyticsEnabled, cloudflareAnalyticsStatus, normalizeCloudflareAnalyticsToken } from "../lib/analytics.ts";

test("Cloudflare analytics stays off when the public token is absent or malformed", () => {
  assert.equal(normalizeCloudflareAnalyticsToken(undefined), null);
  assert.equal(normalizeCloudflareAnalyticsToken("short"), null);
  assert.equal(normalizeCloudflareAnalyticsToken("valid-but-contains-<script>"), null);
  assert.equal(cloudflareAnalyticsEnabled(undefined, "production"), false);
});

test("Cloudflare analytics runs only in production", () => {
  const token = "0123456789abcdef0123456789abcdef";
  assert.equal(cloudflareAnalyticsStatus(token, "development"), "development");
  assert.equal(cloudflareAnalyticsEnabled(token, "development"), false);
  assert.equal(cloudflareAnalyticsStatus(token, "production"), "enabled");
  assert.equal(cloudflareAnalyticsEnabled(token, "production"), true);
});

test("Cloudflare site token is normalized without accepting executable characters", () => {
  const token = "  0123456789abcdef0123456789abcdef  ";
  assert.equal(normalizeCloudflareAnalyticsToken(token), "0123456789abcdef0123456789abcdef");
  assert.equal(normalizeCloudflareAnalyticsToken("0123456789abcdef\"onload=alert(1)"), null);
});
