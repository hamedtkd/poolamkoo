import assert from "node:assert/strict";
import test from "node:test";
import { moveSearchSelection } from "../lib/search.ts";

test("search keyboard selection wraps in both directions", () => {
  assert.equal(moveSearchSelection(0, 4, -1), 3);
  assert.equal(moveSearchSelection(3, 4, 1), 0);
  assert.equal(moveSearchSelection(1, 4, 1), 2);
});

test("search keyboard selection handles empty and initial states", () => {
  assert.equal(moveSearchSelection(-1, 0, 1), -1);
  assert.equal(moveSearchSelection(-1, 3, 1), 0);
  assert.equal(moveSearchSelection(-1, 3, -1), 2);
});
