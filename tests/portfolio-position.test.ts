import assert from "node:assert/strict";
import test from "node:test";
import { portfolioPosition } from "../lib/calculations.ts";
import type { Asset, InvestmentTransaction } from "../lib/types.ts";

const asset: Asset = {
  id: 1,
  name: "دلار",
  kind: "currency",
  symbol: "USD",
  targetPct: 30,
  icon: "dollar",
  archived: false,
  createdAt: "2026-08-01T00:00:00.000Z",
  updatedAt: "2026-08-01T00:00:00.000Z",
};

const buy: InvestmentTransaction = {
  id: 1,
  assetId: 1,
  type: "buy",
  amountToman: 3_000_000,
  quantity: 30,
  unitPriceToman: 100_000,
  happenedAt: "2026-08-01T00:00:00.000Z",
  createdAt: "2026-08-01T00:00:00.000Z",
};

test("portfolio return is the user's unrealized P/L, not the provider's daily market change", () => {
  const position = portfolioPosition(asset, [buy], 99_700);
  assert.equal(position.currentValue, 2_991_000);
  assert.equal(position.unrealized, -9_000);
  assert.equal(Number(position.returnPct.toFixed(1)), -0.3);
});

test("multiple historical holdings aggregate into one current position", () => {
  const older: InvestmentTransaction = {
    ...buy,
    id: 2,
    amountToman: 12_000_000,
    quantity: 120,
    unitPriceToman: 100_000,
    happenedAt: "2026-06-01T00:00:00.000Z",
  };
  const newer: InvestmentTransaction = {
    ...buy,
    id: 3,
    amountToman: 5_500_000,
    quantity: 50,
    unitPriceToman: 110_000,
    happenedAt: "2026-07-01T00:00:00.000Z",
  };
  const position = portfolioPosition(asset, [older, newer], 120_000);
  assert.equal(position.qty, 170);
  assert.equal(position.cost, 17_500_000);
  assert.equal(position.currentValue, 20_400_000);
  assert.equal(position.unrealized, 2_900_000);
});
