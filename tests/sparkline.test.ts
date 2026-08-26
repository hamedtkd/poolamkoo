import assert from "node:assert/strict";
import test from "node:test";
import { sparklinePoints } from "../lib/sparkline.ts";

test("sparkline geometry stays bounded and deterministic", () => {
  const points = sparklinePoints([10, 20, 15], 120, 48, 3).split(" ");
  assert.equal(points.length, 3);
  assert.equal(points[0], "3.00,45.00");
  assert.equal(points[1], "60.00,3.00");
  assert.equal(points[2], "117.00,24.00");
});

test("flat and invalid sparkline input remains safe", () => {
  assert.equal(sparklinePoints([]), "");
  const flat = sparklinePoints([5, 5]);
  assert.match(flat, /24\.00/);
});
