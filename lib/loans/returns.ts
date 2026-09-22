import { transactionBuyCost, transactionSellProceeds } from "../investment-lots.ts";
import type { InvestmentTransaction } from "../types.ts";

export type AnnualizedReturnResult = {
  annualizedReturnPct: number;
  observationDays: number;
};

type CashFlow = { at: number; amount: number };

function timestamp(value: string) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function yearsBetween(start: number, end: number) {
  return Math.max(0, end - start) / (365.2425 * 86_400_000);
}

export function annualizedMoneyWeightedReturn(
  transactions: readonly InvestmentTransaction[],
  terminalValueToman: number,
  terminalAt: string | Date,
): AnnualizedReturnResult | null {
  const terminalTime = terminalAt instanceof Date ? terminalAt.getTime() : timestamp(terminalAt);
  if (terminalTime === null || !Number.isFinite(terminalValueToman) || terminalValueToman < 0) return null;

  const flows: CashFlow[] = [];
  for (const row of transactions) {
    const at = timestamp(row.happenedAt);
    if (at === null || at > terminalTime) continue;
    const amount = row.type === "buy" ? -transactionBuyCost(row) : transactionSellProceeds(row);
    if (Number.isFinite(amount) && Math.abs(amount) > 1e-9) flows.push({ at, amount });
  }
  if (terminalValueToman > 0) flows.push({ at: terminalTime, amount: terminalValueToman });
  if (!flows.some((row) => row.amount < 0) || !flows.some((row) => row.amount > 0)) return null;

  const first = Math.min(...flows.map((row) => row.at));
  const observationDays = Math.max(0, Math.round((terminalTime - first) / 86_400_000));
  const npv = (rate: number) => flows.reduce((sum, flow) => {
    const years = yearsBetween(first, flow.at);
    return sum + flow.amount / Math.pow(1 + rate, years);
  }, 0);

  let low = -0.9999;
  let high = 1;
  let lowValue = npv(low);
  let highValue = npv(high);
  for (let step = 0; step < 30 && Math.sign(lowValue) === Math.sign(highValue); step += 1) {
    high *= 2;
    highValue = npv(high);
  }
  if (!Number.isFinite(lowValue) || !Number.isFinite(highValue) || Math.sign(lowValue) === Math.sign(highValue)) return null;

  for (let step = 0; step < 180; step += 1) {
    const mid = (low + high) / 2;
    const value = npv(mid);
    if (!Number.isFinite(value)) return null;
    if (Math.abs(value) < 1e-7) { low = mid; high = mid; break; }
    if (Math.sign(value) === Math.sign(lowValue)) {
      low = mid;
      lowValue = value;
    } else {
      high = mid;
      highValue = value;
    }
  }
  const rate = (low + high) / 2;
  if (!Number.isFinite(rate) || rate <= -1) return null;
  return { annualizedReturnPct: rate * 100, observationDays };
}
