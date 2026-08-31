import { sendNotification, setVapidDetails } from "web-push";
import { formatMoney, formatSignedPercent } from "@/lib/format";
import { marketAlertKindLabel, marketAlertObservedValue } from "@/lib/market/alerts";
import { pushServerConfig } from "@/lib/push/config";
import type { RemoteMarketAlert, WebPushSubscriptionData } from "@/lib/push/types";
import type { MarketQuote } from "@/lib/types";

let vapidReady = false;

function configureVapid() {
  if (vapidReady) return;
  const config = pushServerConfig();
  if (!config.publicKey || !config.privateKey) throw new Error("Web Push VAPID keys are not configured.");
  setVapidDetails(config.subject, config.publicKey, config.privateKey);
  vapidReady = true;
}

function percent(value: number) {
  return formatSignedPercent(value, 2);
}

function thresholdText(alert: RemoteMarketAlert) {
  if (alert.kind.startsWith("price_")) return formatMoney(alert.threshold, "toman", true);
  return percent(alert.threshold);
}

function observedText(alert: RemoteMarketAlert, quote: MarketQuote) {
  const observed = marketAlertObservedValue(alert, quote);
  if (alert.kind.startsWith("price_")) return `قیمت فعلی ${formatMoney(quote.priceToman, "toman", true)}`;
  if (alert.kind.startsWith("change_")) return `تغییر امروز ${percent(observed ?? quote.changePercent)}`;
  return observed === null ? `قیمت فعلی ${formatMoney(quote.priceToman, "toman", true)}` : `فاصله فعلی از NAV ${percent(observed)}`;
}

export async function sendMarketAlertPush(subscription: WebPushSubscriptionData, alert: RemoteMarketAlert, quote: MarketQuote, triggeredAt: string) {
  configureVapid();
  const payload = JSON.stringify({
    title: `هشدار ${alert.symbol}`,
    body: `${marketAlertKindLabel(alert.kind)} ${thresholdText(alert)} · ${observedText(alert, quote)}`,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: `poolamkoo-market-alert-${alert.id}`,
    url: `/investments?alert=${alert.id}`,
    alertId: alert.id,
    triggeredAt,
  });
  await sendNotification(subscription, payload, { TTL: 60 * 60 * 6, urgency: "high" });
}
