import test from "node:test";
import assert from "node:assert/strict";
import { isSupportPromptDue, withSupportAction, withUsageDay, type CommunityUsageState } from "../lib/community.ts";

function day(year: number, month: number, date: number) { return new Date(year, month - 1, date, 12, 0, 0); }

test("support prompt waits for seven distinct active days", () => {
  let state: CommunityUsageState | null = null;
  for (let index = 1; index <= 6; index += 1) state = withUsageDay(state, day(2026, 8, index));
  assert.equal(isSupportPromptDue(state, day(2026, 8, 6)), false);
  state = withUsageDay(state, day(2026, 8, 7));
  assert.equal(state.activeDays.length, 7);
  assert.equal(isSupportPromptDue(state, day(2026, 8, 7)), true);
});

test("repeated use on the same day counts once", () => {
  let state = withUsageDay(null, day(2026, 8, 1));
  state = withUsageDay(state, day(2026, 8, 1));
  assert.deepEqual(state.activeDays, ["2026-08-01"]);
});

test("dismiss and support actions create long cooldowns", () => {
  let state: CommunityUsageState | null = null;
  for (let index = 1; index <= 7; index += 1) state = withUsageDay(state, day(2026, 8, index));
  assert.ok(state);
  const later = withSupportAction(state, "later", day(2026, 8, 7));
  assert.equal(isSupportPromptDue(later, day(2026, 9, 1)), false);
  assert.equal(isSupportPromptDue(later, day(2026, 10, 7)), true);
  const supported = withSupportAction(state, "github", day(2026, 8, 7));
  assert.equal(isSupportPromptDue(supported, day(2026, 12, 1)), false);
});
