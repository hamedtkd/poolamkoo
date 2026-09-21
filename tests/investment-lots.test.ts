import assert from "node:assert/strict";
import test from "node:test";
import { buildInvestmentLots, transactionBuyCost, transactionSellProceeds } from "../lib/investment-lots.ts";
import type { InvestmentTransaction } from "../lib/types.ts";

function tx(partial: Partial<InvestmentTransaction> & Pick<InvestmentTransaction, "id" | "type" | "amountToman" | "quantity" | "unitPriceToman" | "happenedAt">): InvestmentTransaction {
  return { assetId: 1, createdAt: partial.happenedAt, ...partial };
}

test("investment lots keep every purchase separate and calculate open P/L", () => {
  const rows = [
    tx({ id: 1, type: "buy", amountToman: 3_000_000, quantity: 1, unitPriceToman: 3_000_000, happenedAt: "2026-01-01T00:00:00.000Z" }),
    tx({ id: 2, type: "buy", amountToman: 25_000_000, quantity: 1, unitPriceToman: 25_000_000, happenedAt: "2026-02-01T00:00:00.000Z" }),
  ];
  const summary = buildInvestmentLots(rows, 1, 15_000_000);
  assert.equal(summary.lots.length, 2);
  assert.equal(summary.lots[0]?.unrealizedPnlToman, 12_000_000);
  assert.equal(summary.lots[1]?.unrealizedPnlToman, -10_000_000);
  assert.equal(summary.unrealizedPnlToman, 2_000_000);
});

test("FIFO sell consumes the oldest lot first and splits realized P/L by purchase", () => {
  const rows = [
    tx({ id: 1, type: "buy", amountToman: 10_000_000, quantity: 10, unitPriceToman: 1_000_000, happenedAt: "2026-01-01T00:00:00.000Z" }),
    tx({ id: 2, type: "buy", amountToman: 24_000_000, quantity: 20, unitPriceToman: 1_200_000, happenedAt: "2026-02-01T00:00:00.000Z" }),
    tx({ id: 3, type: "sell", amountToman: 19_500_000, quantity: 15, unitPriceToman: 1_300_000, happenedAt: "2026-03-01T00:00:00.000Z" }),
  ];
  const summary = buildInvestmentLots(rows, 1, 1_400_000);
  assert.equal(summary.lots[0]?.remainingQuantity, 0);
  assert.equal(summary.lots[0]?.realizedPnlToman, 3_000_000);
  assert.equal(summary.lots[1]?.remainingQuantity, 15);
  assert.equal(summary.lots[1]?.realizedPnlToman, 500_000);
  assert.equal(summary.unrealizedPnlToman, 3_000_000);
  assert.equal(summary.totalPnlToman, 6_500_000);
});

test("fees become part of buy cost and reduce sell proceeds", () => {
  const buy = tx({ id: 1, type: "buy", amountToman: 1_000_000, quantity: 1, unitPriceToman: 1_000_000, feeToman: 10_000, otherCostToman: 5_000, happenedAt: "2026-01-01T00:00:00.000Z" });
  const sell = tx({ id: 2, type: "sell", amountToman: 1_200_000, quantity: 1, unitPriceToman: 1_200_000, feeToman: 12_000, happenedAt: "2026-02-01T00:00:00.000Z" });
  assert.equal(transactionBuyCost(buy), 1_015_000);
  assert.equal(transactionSellProceeds(sell), 1_188_000);
  assert.equal(buildInvestmentLots([buy, sell], 1, 1_300_000).realizedPnlToman, 173_000);
});

test("lot analysis stays available without a market price", () => {
  const rows = [tx({ id: 1, type: "buy", amountToman: 2_000_000, quantity: 20, unitPriceToman: 100_000, happenedAt: "2026-01-01T00:00:00.000Z" })];
  const summary = buildInvestmentLots(rows, 1);
  assert.equal(summary.openQuantity, 20);
  assert.equal(summary.openCostToman, 2_000_000);
  assert.equal(summary.currentValueToman, undefined);
  assert.equal(summary.unrealizedPnlToman, undefined);
});
