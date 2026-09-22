import { buildInvestmentLots } from "../investment-lots.ts";
import { assetSupportsAutomaticMarketQuote, marketFreshnessLimitHours } from "../market/freshness.ts";
import type { Asset, InvestmentTransaction, Loan, LoanRiskAlert } from "../types.ts";

export type LoanRiskAlertDraft = Omit<LoanRiskAlert, "id" | "createdAt" | "updatedAt" | "armed" | "lastTriggeredAt">;

export function defaultLoanRiskPolicy(loans: readonly Loan[], transactions: readonly InvestmentTransaction[], assets: readonly Asset[] = []): LoanRiskAlertDraft[] {
  const rows: LoanRiskAlertDraft[] = [];
  const assetById = new Map(assets.filter((asset) => asset.id).map((asset) => [asset.id!, asset]));
  for (const loan of loans) {
    if (!loan.id || loan.status !== "active") continue;
    if (loan.reserveTargetMonths > 0) {
      const threshold = Math.min(3, Math.max(1, loan.reserveTargetMonths));
      const rearmThreshold = loan.reserveTargetMonths <= threshold ? threshold : threshold + 1;
      rows.push({ loanId: loan.id, kind: "reserve_runway_below", threshold, rearmThreshold, enabled: true, notifyBrowser: loan.notifyBrowser });
    }
    const linked = transactions.filter((row) => row.loanId === loan.id);
    const assetIds = [...new Set(linked.map((row) => row.assetId))]
      .filter((assetId) => buildInvestmentLots(linked, assetId).openQuantity > 1e-10);
    for (const assetId of assetIds) {
      const asset = assetById.get(assetId);
      if (loan.riskBudgetInstallments && loan.riskBudgetInstallments > 0) {
        rows.push({
          loanId: loan.id,
          assetId,
          kind: "loss_budget_exceeded",
          threshold: loan.riskBudgetInstallments,
          rearmThreshold: Math.max(0, loan.riskBudgetInstallments * 0.8),
          enabled: true,
          notifyBrowser: loan.notifyBrowser,
        });
      }
      if (asset && assetSupportsAutomaticMarketQuote(asset)) {
        const threshold = marketFreshnessLimitHours(asset);
        rows.push({
          loanId: loan.id,
          assetId,
          kind: "quote_stale",
          threshold,
          rearmThreshold: Math.max(0.5, threshold * 0.5),
          enabled: true,
          notifyBrowser: loan.notifyBrowser,
        });
      }
      if (asset?.kind === "fund") {
        rows.push({
          loanId: loan.id,
          assetId,
          kind: "spread_below",
          threshold: 0,
          rearmThreshold: 2,
          enabled: true,
          notifyBrowser: loan.notifyBrowser,
        });
      }
    }
  }
  return rows;
}

export function loanRiskPolicyKey(row: Pick<LoanRiskAlert, "loanId" | "assetId" | "kind">) {
  return `${row.loanId}:${row.assetId ?? "loan"}:${row.kind}`;
}
