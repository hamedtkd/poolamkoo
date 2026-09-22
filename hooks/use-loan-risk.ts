"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { toast } from "@/components/ui/toast";
import { db } from "@/lib/db";
import { buildLoanViews, type LoanView } from "@/lib/loans/analytics";
import { buildLoanHealthSummary, loanRiskKindLabel, loanRiskTransition, observeLoanRisk } from "@/lib/loans/risk";
import { rearmLoanRiskAlert, setLoanRiskAlertEnabled, setLoanRiskAlertNotification, syncLoanRiskPolicies } from "@/lib/loans/risk-store";
import type { Asset, FundMovement, GoalFund, InvestmentTransaction, Loan, LoanPayment, LoanRiskAlert, MarketQuote } from "@/lib/types";

async function showRiskNotification(alert: LoanRiskAlert, view: LoanView) {
  if (!alert.notifyBrowser || typeof Notification === "undefined" || Notification.permission !== "granted") return;
  const observation = observeLoanRisk(alert, view);
  const options: NotificationOptions = {
    body: `${view.loan.name} · ${observation.detail}`,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: `poolamkoo-loan-risk-${alert.id ?? alert.loanId}-${alert.kind}-${alert.assetId ?? "loan"}`,
    data: { url: `/loans/${alert.loanId}` },
  };
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(`هشدار ${loanRiskKindLabel(alert.kind)}`, options);
      return;
    } catch {
      // A page notification is the fallback below.
    }
  }
  try { new Notification(`هشدار ${loanRiskKindLabel(alert.kind)}`, options); } catch { /* persisted alert state remains the source of truth */ }
}

export function useLoanRiskMonitoring(input: {
  loans: Loan[];
  alerts: LoanRiskAlert[];
  payments: LoanPayment[];
  funds: GoalFund[];
  assets: Asset[];
  transactions: InvestmentTransaction[];
  fundMovements: FundMovement[];
  quotes: MarketQuote[];
  runtimeReady?: boolean;
  marketReady?: boolean;
}) {
  const runtimeReady = input.runtimeReady ?? true;
  const marketReady = input.marketReady ?? true;
  const sessionTriggers = useRef(new Set<number>());
  const views = useMemo(() => buildLoanViews({
    loans: input.loans,
    payments: input.payments,
    funds: input.funds,
    assets: input.assets,
    transactions: input.transactions,
    fundMovements: input.fundMovements,
    quotes: input.quotes,
  }), [input.assets, input.fundMovements, input.funds, input.loans, input.payments, input.quotes, input.transactions]);
  const viewByLoan = useMemo(() => new Map(views.filter((row) => row.loan.id).map((row) => [row.loan.id!, row])), [views]);
  const summaries = useMemo(() => new Map(views.filter((row) => row.loan.id).map((view) => [view.loan.id!, buildLoanHealthSummary(view, input.alerts)])), [input.alerts, views]);

  useEffect(() => {
    if (!runtimeReady) return;
    void syncLoanRiskPolicies(input.loans, input.transactions, input.assets).catch(() => undefined);
  }, [input.assets, input.loans, input.transactions, runtimeReady]);

  useEffect(() => {
    if (!runtimeReady || !input.alerts.length) return;
    let cancelled = false;
    async function evaluate() {
      for (const alert of input.alerts) {
        if (cancelled || !alert.id || !alert.enabled) continue;
        const view = viewByLoan.get(alert.loanId);
        if (!view || view.loan.status !== "active") continue;
        if (!marketReady && alert.kind !== "reserve_runway_below") continue;
        const transition = loanRiskTransition(alert, view);
        if (transition === "trigger") {
          const now = new Date().toISOString();
          await db.loanRiskAlerts.update(alert.id, { armed: false, lastTriggeredAt: now, updatedAt: now });
          if (cancelled) continue;
          if (!sessionTriggers.current.has(alert.id)) {
            sessionTriggers.current.add(alert.id);
            const observation = observeLoanRisk(alert, view);
            toast({
              id: `loan-risk-${alert.id}`,
              tone: "error",
              title: `هشدار ${loanRiskKindLabel(alert.kind)}`,
              description: `${view.loan.name} · ${observation.detail}`,
              duration: 12_000,
            });
            await showRiskNotification(alert, view).catch(() => undefined);
          }
        } else if (transition === "rearm") {
          await db.loanRiskAlerts.update(alert.id, { armed: true, updatedAt: new Date().toISOString() });
          sessionTriggers.current.delete(alert.id);
        }
      }
    }
    void evaluate();
    return () => { cancelled = true; };
  }, [input.alerts, marketReady, runtimeReady, viewByLoan]);

  const forLoan = useCallback((loanId?: number) => loanId ? summaries.get(loanId) ?? null : null, [summaries]);
  const alertsForLoan = useCallback((loanId?: number) => loanId ? input.alerts.filter((row) => row.loanId === loanId) : [], [input.alerts]);
  const setEnabled = useCallback((id: number, enabled: boolean) => setLoanRiskAlertEnabled(id, enabled), []);
  const setNotify = useCallback((id: number, enabled: boolean) => setLoanRiskAlertNotification(id, enabled), []);
  const rearm = useCallback((id: number) => rearmLoanRiskAlert(id), []);
  return { views, summaries, forLoan, alertsForLoan, setEnabled, setNotify, rearm };
}

export type LoanRiskControls = ReturnType<typeof useLoanRiskMonitoring>;
