import assert from "node:assert/strict";
import test from "node:test";
import { assetKindLabel, assetUsesManualPrice } from "../lib/assets.ts";

test("stock, fund and custom assets use manual current prices", () => {
  assert.equal(assetUsesManualPrice("stock"), true);
  assert.equal(assetUsesManualPrice("fund"), true);
  assert.equal(assetUsesManualPrice("custom"), true);
  assert.equal(assetUsesManualPrice("currency"), false);
});

test("stock has a dedicated Persian asset-kind label", () => {
  assert.equal(assetKindLabel("stock"), "سهام / بورس");
});
