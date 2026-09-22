import type { Asset, LoanRiskAlert } from "../types.ts";
import type { PushAlertState, RemoteLoanRiskAlert } from "./types.ts";

const MAX_REMOTE_LOAN_RISK_ALERTS = 30;

function validTime(value?: string) {
  const time = value ? Date.parse(value) : Number.NaN;
  return Number.isFinite(time) ? time : 0;
}

export function toRemoteLoanRiskAlerts(alerts: readonly LoanRiskAlert[], assets: readonly Asset[]): RemoteLoanRiskAlert[] {
  const assetById = new Map(assets.filter((asset) => asset.id).map((asset) => [asset.id!, asset]));
  return alerts
    .filter((alert): alert is LoanRiskAlert & { id: number; assetId: number } => Boolean(alert.id && alert.assetId && alert.kind === "quote_stale" && alert.notifyBrowser))
    .flatMap((alert) => {
      const asset = assetById.get(alert.assetId);
      if (!asset || asset.marketSource !== "tindex" || !asset.marketId) return [];
      return [{
        id: alert.id,
        loanId: alert.loanId,
        assetId: alert.assetId,
        marketId: asset.marketId.slice(0, 120),
        thresholdHours: Math.max(0.5, Number(alert.threshold) || 0.5),
        rearmHours: Math.max(0.25, Number(alert.rearmThreshold) || Math.max(0.5, alert.threshold * 0.5)),
        enabled: Boolean(alert.enabled),
        armed: Boolean(alert.armed),
        lastTriggeredAt: alert.lastTriggeredAt,
        updatedAt: alert.updatedAt,
      }];
    })
    .slice(0, MAX_REMOTE_LOAN_RISK_ALERTS);
}

export function mergeRemoteLoanRiskAlerts(incoming: RemoteLoanRiskAlert[], previous: RemoteLoanRiskAlert[] = []) {
  const prior = new Map(previous.map((alert) => [alert.id, alert]));
  return incoming.map((alert) => {
    const before = prior.get(alert.id);
    if (!before || validTime(before.updatedAt) <= validTime(alert.updatedAt)) return alert;
    return { ...alert, armed: before.armed, lastTriggeredAt: before.lastTriggeredAt, updatedAt: before.updatedAt };
  });
}

export function remoteLoanRiskStates(alerts: RemoteLoanRiskAlert[]): PushAlertState[] {
  return alerts.map(({ id, armed, lastTriggeredAt, updatedAt }) => ({ id, armed, lastTriggeredAt, updatedAt }));
}

export function remoteLoanRiskTransition(alert: RemoteLoanRiskAlert, quote: { asOf: string } | undefined, now = new Date()) {
  if (!alert.enabled || !quote) return "unavailable" as const;
  const asOf = Date.parse(quote.asOf);
  if (!Number.isFinite(asOf)) return "unavailable" as const;
  const ageHours = Math.max(0, now.getTime() - asOf) / 3_600_000;
  if (ageHours > alert.thresholdHours && alert.armed) return "trigger" as const;
  if (ageHours <= alert.rearmHours && !alert.armed) return "rearm" as const;
  return "none" as const;
}
