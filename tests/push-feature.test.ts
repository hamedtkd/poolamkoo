import assert from "node:assert/strict";
import test from "node:test";
import { backgroundPushFeatureEnabled } from "../lib/push/feature.ts";

test("background push stays disabled unless explicitly opted into the experiment", () => {
  assert.equal(backgroundPushFeatureEnabled(undefined), false);
  assert.equal(backgroundPushFeatureEnabled(""), false);
  assert.equal(backgroundPushFeatureEnabled("0"), false);
  assert.equal(backgroundPushFeatureEnabled("false"), false);
  assert.equal(backgroundPushFeatureEnabled("1"), true);
  assert.equal(backgroundPushFeatureEnabled("true"), true);
});
