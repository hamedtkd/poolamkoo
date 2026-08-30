import assert from "node:assert/strict";
import test from "node:test";
import { assetArchiveBlockers, assetOpenQuantity, portfolioRelevantAssets } from "../lib/asset-lifecycle.ts";
import type { Asset, InvestmentTransaction, PlanItem } from "../lib/types.ts";

const now = "2026-08-30T00:00:00.000Z";
const asset = (id: number, archived = false): Asset => ({ id, name: `asset-${id}`, kind: "custom", targetPct: 0, icon: "pie", archived, createdAt: now, updatedAt: now });
const tx = (id: number, assetId: number, type: "buy" | "sell", quantity: number): InvestmentTransaction => ({ id, assetId, type, quantity, amountToman: quantity * 100, unitPriceToman: 100, happenedAt: now, createdAt: now });
const plan = (id: number, targetId: number, plannedToman: number, executedToman: number): PlanItem => ({ id, incomeId: 1, bucket: "growth", targetType: "asset", targetId, label: "plan", plannedToman, executedToman, createdAt: now, updatedAt: now });

test("asset archive is blocked while a real holding remains", () => {
  const rows = [tx(1, 1, "buy", 3), tx(2, 1, "sell", 1)];
  assert.equal(assetOpenQuantity(rows, 1), 2);
  const blockers = assetArchiveBlockers(1, rows, []);
  assert.equal(blockers.blocked, true);
  assert.equal(blockers.openQuantity, 2);
});

test("asset archive is blocked while a linked plan still has money remaining", () => {
  const blockers = assetArchiveBlockers(1, [], [plan(1, 1, 1_000, 400), plan(2, 1, 500, 500)]);
  assert.equal(blockers.blocked, true);
  assert.equal(blockers.pendingPlanCount, 1);
});

test("closed assets can be archived and archived holdings stay valuation-relevant", () => {
  const rows = [tx(1, 1, "buy", 2), tx(2, 1, "sell", 2), tx(3, 2, "buy", 1)];
  assert.equal(assetArchiveBlockers(1, rows, []).blocked, false);
  assert.deepEqual(portfolioRelevantAssets([asset(1, true), asset(2, true), asset(3, false)], rows).map((row) => row.id), [2, 3]);
});
