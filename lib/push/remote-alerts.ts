import type { MarketAlert } from "@/lib/types";
import type { PushAlertState, RemoteMarketAlert } from "@/lib/push/types";

const MAX_REMOTE_ALERTS = 40;

function validTime(value?: string) {
  const time = value ? Date.parse(value) : Number.NaN;
  return Number.isFinite(time) ? time : 0;
}

export function toRemoteAlerts(alerts: MarketAlert[]): RemoteMarketAlert[] {
  return alerts
    .filter((alert): alert is MarketAlert & { id: number } => Boolean(alert.id && alert.notifyBrowser && alert.source === "tindex"))
    .slice(0, MAX_REMOTE_ALERTS)
    .map((alert) => ({
      id: alert.id,
      marketId: alert.marketId.slice(0, 120),
      symbol: alert.symbol.slice(0, 40),
      kind: alert.kind,
      threshold: Math.abs(Number(alert.threshold) || 0),
      enabled: Boolean(alert.enabled),
      armed: Boolean(alert.armed),
      lastTriggeredAt: alert.lastTriggeredAt,
      updatedAt: alert.updatedAt,
    }))
    .filter((alert) => alert.marketId && alert.symbol && alert.threshold > 0);
}

export function mergeRemoteAlerts(incoming: RemoteMarketAlert[], previous: RemoteMarketAlert[] = []) {
  const prior = new Map(previous.map((alert) => [alert.id, alert]));
  return incoming.map((alert) => {
    const before = prior.get(alert.id);
    if (!before) return alert;
    if (validTime(before.updatedAt) <= validTime(alert.updatedAt)) return alert;
    return {
      ...alert,
      armed: before.armed,
      lastTriggeredAt: before.lastTriggeredAt,
      updatedAt: before.updatedAt,
    };
  });
}

export function remoteAlertStates(alerts: RemoteMarketAlert[]): PushAlertState[] {
  return alerts.map(({ id, armed, lastTriggeredAt, updatedAt }) => ({ id, armed, lastTriggeredAt, updatedAt }));
}
