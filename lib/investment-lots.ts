import type { InvestmentTransaction } from "./types.ts";

const EPSILON = 1e-10;

export interface InvestmentLot {
  transactionId?: number;
  assetId: number;
  happenedAt: string;
  createdAt: string;
  originalQuantity: number;
  remainingQuantity: number;
  soldQuantity: number;
  originalCostToman: number;
  remainingCostToman: number;
  unitCostToman: number;
  realizedProceedsToman: number;
  realizedCostToman: number;
  realizedPnlToman: number;
  currentValueToman?: number;
  unrealizedPnlToman?: number;
  unrealizedReturnPct?: number;
  totalPnlToman?: number;
}

export interface InvestmentLotSummary {
  lots: InvestmentLot[];
  openQuantity: number;
  openCostToman: number;
  realizedPnlToman: number;
  unrealizedPnlToman?: number;
  currentValueToman?: number;
  totalPnlToman?: number;
}

export function transactionExtraCosts(transaction: InvestmentTransaction) {
  return safeMoney(transaction.feeToman) + safeMoney(transaction.otherCostToman);
}

export function transactionBuyCost(transaction: InvestmentTransaction) {
  return safeMoney(transaction.amountToman) + transactionExtraCosts(transaction);
}

export function transactionSellProceeds(transaction: InvestmentTransaction) {
  return Math.max(0, safeMoney(transaction.amountToman) - transactionExtraCosts(transaction));
}

export function buildInvestmentLots(
  rows: readonly InvestmentTransaction[],
  assetId: number,
  currentPriceToman?: number,
): InvestmentLotSummary {
  const price = positiveNumber(currentPriceToman);
  const mutableLots: Array<InvestmentLot & { remainingQuantity: number }> = [];

  for (const transaction of rows.filter((row) => row.assetId === assetId).sort(compareTransactions)) {
    const quantity = safeQuantity(transaction.quantity);
    if (quantity <= 0) continue;

    if (transaction.type === "buy") {
      const cost = transactionBuyCost(transaction);
      const unitCost = quantity > 0 ? cost / quantity : 0;
      mutableLots.push({
        transactionId: transaction.id,
        assetId,
        happenedAt: transaction.happenedAt,
        createdAt: transaction.createdAt,
        originalQuantity: quantity,
        remainingQuantity: quantity,
        soldQuantity: 0,
        originalCostToman: cost,
        remainingCostToman: cost,
        unitCostToman: unitCost,
        realizedProceedsToman: 0,
        realizedCostToman: 0,
        realizedPnlToman: 0,
      });
      continue;
    }

    let remainingSell = quantity;
    const proceedsPerUnit = transactionSellProceeds(transaction) / quantity;
    for (const lot of mutableLots) {
      if (remainingSell <= EPSILON) break;
      if (lot.remainingQuantity <= EPSILON) continue;
      const consumed = Math.min(lot.remainingQuantity, remainingSell);
      const realizedCost = consumed * lot.unitCostToman;
      const realizedProceeds = consumed * proceedsPerUnit;
      lot.remainingQuantity = Math.max(0, lot.remainingQuantity - consumed);
      lot.soldQuantity += consumed;
      lot.realizedCostToman += realizedCost;
      lot.realizedProceedsToman += realizedProceeds;
      lot.realizedPnlToman = lot.realizedProceedsToman - lot.realizedCostToman;
      lot.remainingCostToman = lot.remainingQuantity * lot.unitCostToman;
      remainingSell -= consumed;
    }
  }

  const lots = mutableLots.map((lot) => {
    const currentValue = price === undefined ? undefined : lot.remainingQuantity * price;
    const unrealized = currentValue === undefined ? undefined : currentValue - lot.remainingCostToman;
    const returnPct = unrealized === undefined || lot.remainingCostToman <= 0 ? undefined : unrealized / lot.remainingCostToman * 100;
    return {
      ...lot,
      currentValueToman: currentValue,
      unrealizedPnlToman: unrealized,
      unrealizedReturnPct: returnPct,
      totalPnlToman: unrealized === undefined ? undefined : lot.realizedPnlToman + unrealized,
    };
  });

  const openQuantity = lots.reduce((sum, lot) => sum + lot.remainingQuantity, 0);
  const openCostToman = lots.reduce((sum, lot) => sum + lot.remainingCostToman, 0);
  const realizedPnlToman = lots.reduce((sum, lot) => sum + lot.realizedPnlToman, 0);
  const currentValueToman = price === undefined ? undefined : openQuantity * price;
  const unrealizedPnlToman = currentValueToman === undefined ? undefined : currentValueToman - openCostToman;
  return {
    lots,
    openQuantity,
    openCostToman,
    realizedPnlToman,
    currentValueToman,
    unrealizedPnlToman,
    totalPnlToman: unrealizedPnlToman === undefined ? undefined : realizedPnlToman + unrealizedPnlToman,
  };
}

function compareTransactions(a: InvestmentTransaction, b: InvestmentTransaction) {
  const date = a.happenedAt.slice(0, 10).localeCompare(b.happenedAt.slice(0, 10));
  if (date) return date;
  if (a.type !== b.type) return a.type === "buy" ? -1 : 1;
  const created = a.createdAt.localeCompare(b.createdAt);
  if (created) return created;
  return (a.id ?? Number.MAX_SAFE_INTEGER) - (b.id ?? Number.MAX_SAFE_INTEGER);
}

function safeMoney(value: unknown) {
  const number = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function safeQuantity(value: unknown) {
  const number = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function positiveNumber(value: unknown) {
  const number = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(number) && number > 0 ? number : undefined;
}
