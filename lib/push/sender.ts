import { sendNotification, setVapidDetails } from "web-push";
import { formatMoney, formatSignedPercent } from "@/lib/format";
import { marketAlertKindLabel, marketAlertObservedValue } from "@/lib/market/alerts";
import { pushServerConfig } from "@/lib/push/config";
import type { RemoteLoanReminder, RemoteLoanRiskAlert, RemoteMarketAlert, WebPushSubscriptionData } from "@/lib/push/types";
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
    kind: "market-alert",
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

function loanReminderBody(daysRemaining: number) {
  if (daysRemaining < 0) return "سررسید یک قسط گذشته است. وضعیت پرداخت را در پولم‌کو بررسی کن.";
  if (daysRemaining === 0) return "امروز سررسید یک قسط است.";
  if (daysRemaining === 1) return "فردا سررسید یک قسط است.";
  return `${daysRemaining.toLocaleString("fa-IR")} روز تا سررسید یک قسط مانده است.`;
}

export async function sendLoanReminderPush(subscription: WebPushSubscriptionData, reminder: RemoteLoanReminder, reminderKey: string, daysRemaining: number, triggeredAt: string) {
  configureVapid();
  const payload = JSON.stringify({
    kind: "loan-reminder",
    title: "یادآوری قسط پولم‌کو",
    body: loanReminderBody(daysRemaining),
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: `poolamkoo-${reminderKey}`,
    url: `/loans/${reminder.loanId}`,
    loanId: reminder.loanId,
    installmentNo: reminder.installmentNo,
    dueAt: reminder.dueAt,
    daysRemaining,
    reminderKey,
    triggeredAt,
  });
  await sendNotification(subscription, payload, { TTL: 60 * 60 * 12, urgency: daysRemaining <= 0 ? "high" : "normal" });
}

export async function sendLoanRiskPush(subscription: WebPushSubscriptionData, alert: RemoteLoanRiskAlert, triggeredAt: string) {
  configureVapid();
  const payload = JSON.stringify({
    kind: "loan-risk",
    title: "Loan market data needs attention",
    body: "A market quote linked to a loan is older than its freshness limit.",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: `poolamkoo-loan-risk-${alert.id}`,
    url: `/loans/${alert.loanId}`,
    loanRiskAlertId: alert.id,
    loanId: alert.loanId,
    assetId: alert.assetId,
    triggeredAt,
  });
  await sendNotification(subscription, payload, { TTL: 60 * 60 * 6, urgency: "normal" });
}
