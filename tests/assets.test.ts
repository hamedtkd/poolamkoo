import assert from "node:assert/strict";
import test from "node:test";
import { assetKindLabel, assetRequiresManualPrice, assetSupportsExchangeLink, assetUsesManualPrice } from "../lib/assets.ts";

test("stock and fund accept live exchange links while keeping a manual fallback", () => {
  assert.equal(assetSupportsExchangeLink("stock"), true);
  assert.equal(assetSupportsExchangeLink("fund"), true);
  assert.equal(assetUsesManualPrice("stock"), true);
  assert.equal(assetRequiresManualPrice("stock"), true);
  assert.equal(assetRequiresManualPrice("stock", "stock-34144395039913458"), false);
  assert.equal(assetRequiresManualPrice("custom"), true);
  assert.equal(assetRequiresManualPrice("currency"), false);
});

test("stock has a dedicated Persian asset-kind label", () => {
  assert.equal(assetKindLabel("stock"), "سهام / بورس");
});
