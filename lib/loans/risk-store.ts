"use client";

import { db } from "@/lib/db";
import { defaultLoanRiskPolicy, loanRiskPolicyKey } from "@/lib/loans/risk-policy";
import type { Asset, InvestmentTransaction, Loan, LoanRiskAlert } from "@/lib/types";

const MANAGED_KINDS = new Set<LoanRiskAlert["kind"]>(["reserve_runway_below", "loss_budget_exceeded", "spread_below", "quote_stale"]);

export async function syncLoanRiskPolicies(loans: readonly Loan[], transactions: readonly InvestmentTransaction[], assets: readonly Asset[] = []) {
  const desired = defaultLoanRiskPolicy(loans, transactions, assets);
  const existing = await db.loanRiskAlerts.toArray();
  const existingByKey = new Map(existing.map((row) => [loanRiskPolicyKey(row), row]));
  const desiredKeys = new Set(desired.map(loanRiskPolicyKey));
  const now = new Date().toISOString();

  await db.transaction("rw", db.loanRiskAlerts, async () => {
    for (const draft of desired) {
      const current = existingByKey.get(loanRiskPolicyKey(draft));
      if (!current) {
        await db.loanRiskAlerts.add({ ...draft, armed: true, createdAt: now, updatedAt: now });
        continue;
      }
      const policyChanged = current.threshold !== draft.threshold || current.rearmThreshold !== draft.rearmThreshold;
      const patch: Partial<LoanRiskAlert> = {};
      if (current.threshold !== draft.threshold) patch.threshold = draft.threshold;
      if (current.rearmThreshold !== draft.rearmThreshold) patch.rearmThreshold = draft.rearmThreshold;
      if (policyChanged) patch.armed = true;
      if (Object.keys(patch).length) {
        patch.updatedAt = now;
        await db.loanRiskAlerts.update(current.id!, patch);
      }
    }
    for (const row of existing) {
      if (!row.id || !MANAGED_KINDS.has(row.kind)) continue;
      if (!desiredKeys.has(loanRiskPolicyKey(row))) await db.loanRiskAlerts.delete(row.id);
    }
  });
}

export async function setLoanRiskAlertEnabled(id: number, enabled: boolean) {
  await db.loanRiskAlerts.update(id, { enabled, armed: true, updatedAt: new Date().toISOString() });
}

export async function setLoanRiskAlertNotification(id: number, notifyBrowser: boolean) {
  await db.loanRiskAlerts.update(id, { notifyBrowser, updatedAt: new Date().toISOString() });
}

export async function rearmLoanRiskAlert(id: number) {
  await db.loanRiskAlerts.update(id, { armed: true, updatedAt: new Date().toISOString() });
}
