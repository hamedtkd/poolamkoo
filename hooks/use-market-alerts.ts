"use client";

import { useEffect } from "react";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { marketAlertKindLabel, marketAlertTransition } from "@/lib/market/alerts";
import { freshMarketQuotes } from "@/lib/market/runtime";
import type { MarketAlert, MarketQuote, MoneyUnit } from "@/lib/types";

function notificationBody(alert: MarketAlert, quote: MarketQuote, unit: MoneyUnit) {
  return `${marketAlertKindLabel(alert.kind)} · قیمت فعلی ${formatMoney(quote.priceToman, unit, true)}`;
}

async function showNotification(alert: MarketAlert, quote: MarketQuote, unit: MoneyUnit) {
  if (!alert.notifyBrowser || typeof Notification === "undefined" || Notification.permission !== "granted") return;
  const options: NotificationOptions = {
    body: notificationBody(alert, quote, unit),
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: `poolamkoo-market-alert-${alert.id ?? alert.marketId}-${alert.kind}`,
  };
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.showNotification(`هشدار ${alert.symbol}`, options);
        return;
      }
    } catch {
      // Fall back to a page notification below.
    }
  }
  try { new Notification(`هشدار ${alert.symbol}`, options); } catch { /* In-app state remains the source of truth. */ }
}

export function useMarketAlerts(alerts: MarketAlert[], quotes: MarketQuote[], mode: string, unit: MoneyUnit) {
  useEffect(() => {
    if (mode !== "live" || !alerts.length || !quotes.length) return;
    const quoteMap = new Map(freshMarketQuotes(quotes).map((quote) => [quote.symbol, quote]));
    let cancelled = false;

    async function evaluate() {
      for (const alert of alerts) {
        if (cancelled || !alert.id || !alert.enabled) continue;
        const quote = quoteMap.get(alert.symbol);
        const transition = marketAlertTransition(alert, quote);
        if (transition === "trigger" && quote) {
          const now = new Date().toISOString();
          await db.marketAlerts.update(alert.id, { armed: false, lastTriggeredAt: now, updatedAt: now });
          if (!cancelled) await showNotification(alert, quote, unit);
        } else if (transition === "rearm") {
          await db.marketAlerts.update(alert.id, { armed: true, updatedAt: new Date().toISOString() });
        }
      }
    }

    void evaluate();
    return () => { cancelled = true; };
  }, [alerts, mode, quotes, unit]);
}
