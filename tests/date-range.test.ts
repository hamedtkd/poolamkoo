import assert from "node:assert/strict";
import test from "node:test";
import { dateInRange, presetRange } from "../lib/date-range.ts";

test("date range includes both boundary days", () => {
  const range = { from: new Date(2026, 7, 1), to: new Date(2026, 7, 10) };
  assert.equal(dateInRange("2026-08-01", range), true);
  assert.equal(dateInRange("2026-08-10", range), true);
  assert.equal(dateInRange("2026-08-11", range), false);
});

test("all-time preset does not filter data", () => {
  const range = presetRange("all", new Date(2026, 7, 24));
  assert.equal(dateInRange("2021-01-01", range), true);
  assert.deepEqual(range, { from: null, to: null });
});
