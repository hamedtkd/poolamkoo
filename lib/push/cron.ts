import { marketAlertTransition } from "@/lib/market/alerts";
import { TindexProvider } from "@/lib/market/tindex";
import { pushServerConfig } from "@/lib/push/config";
import { remoteLoanReminderEvent, withSentLoanReminder } from "@/lib/push/loan-reminders";
import { remoteLoanRiskTransition } from "@/lib/push/loan-risk";
import { sendLoanReminderPush, sendLoanRiskPush, sendMarketAlertPush } from "@/lib/push/sender";
import { listPushDevices, removePushDeviceById, savePushDeviceById } from "@/lib/push/store";
import type { PushDeviceRecord, RemoteLoanReminder, RemoteLoanRiskAlert, RemoteMarketAlert } from "@/lib/push/types";
import type { MarketQuote } from "@/lib/types";

function errorStatus(error: unknown) {
  if (!error || typeof error !== "object") return 0;
  const status = (error as { statusCode?: unknown }).statusCode;
  return typeof status === "number" ? status : 0;
}

async function loadQuotes(devices: Array<{ record: PushDeviceRecord }>) {
  const ids = [...new Set(devices.flatMap(({ record }) => [
    ...record.alerts.filter((alert) => alert.enabled).map((alert) => alert.marketId),
    ...(record.loanRiskAlerts ?? []).filter((alert) => alert.enabled).map((alert) => alert.marketId),
  ]))].slice(0, 20);
  const quotes = new Map<string, MarketQuote>();
  if (!ids.length) return quotes;
  const config = pushServerConfig();
  if (!config.marketToken) return quotes;
  const provider = new TindexProvider(config.marketToken);
  for (const marketId of ids) {
    try {
      const quote = await provider.getQuote(marketId);
      if (quote) quotes.set(marketId, quote);
    } catch {
      // One upstream symbol must not block other alerts or loan reminders.
    }
  }
  return quotes;
}

function updateAlert(alert: RemoteMarketAlert, quote: MarketQuote | undefined, now: string) {
  const transition = marketAlertTransition(alert, quote);
  if (transition === "rearm") return { ...alert, armed: true, updatedAt: now };
  return alert;
}

function updateLoanRisk(alert: RemoteLoanRiskAlert, quote: MarketQuote | undefined, now: string) {
  const transition = remoteLoanRiskTransition(alert, quote, new Date(now));
  if (transition === "rearm") return { ...alert, armed: true, updatedAt: now };
  return alert;
}

export async function runMarketAlertCron() {
  const devices = await listPushDevices(200);
  if (!devices.length) return { devices: 0, triggered: 0, rearmed: 0, loanTriggered: 0, loanRiskTriggered: 0, removed: 0, quotes: 0 };
  const quoteMap = await loadQuotes(devices);
  let triggered = 0;
  let rearmed = 0;
  let loanTriggered = 0;
  let loanRiskTriggered = 0;
  let removed = 0;

  for (const device of devices) {
    let dead = false;
    let changed = false;
    const nextAlerts: RemoteMarketAlert[] = [];
    for (const alert of device.record.alerts) {
      if (!alert.enabled) { nextAlerts.push(alert); continue; }
      const quote = quoteMap.get(alert.marketId);
      const transition = marketAlertTransition(alert, quote);
      const now = new Date().toISOString();
      if (transition === "trigger" && quote) {
        try {
          await sendMarketAlertPush(device.record.subscription, alert, quote, now);
          nextAlerts.push({ ...alert, armed: false, lastTriggeredAt: now, updatedAt: now });
          triggered += 1;
          changed = true;
        } catch (error) {
          const status = errorStatus(error);
          if (status === 404 || status === 410) { dead = true; break; }
          nextAlerts.push(alert);
        }
      } else {
        const next = updateAlert(alert, quote, now);
        if (next !== alert) { changed = true; rearmed += 1; }
        nextAlerts.push(next);
      }
    }
    if (dead) {
      await removePushDeviceById(device.id);
      removed += 1;
      continue;
    }

    const nextLoanRisk: RemoteLoanRiskAlert[] = [];
    for (const alert of device.record.loanRiskAlerts ?? []) {
      if (!alert.enabled) { nextLoanRisk.push(alert); continue; }
      const quote = quoteMap.get(alert.marketId);
      const now = new Date().toISOString();
      const transition = remoteLoanRiskTransition(alert, quote, new Date(now));
      if (transition === "trigger" && quote) {
        try {
          await sendLoanRiskPush(device.record.subscription, alert, now);
          nextLoanRisk.push({ ...alert, armed: false, lastTriggeredAt: now, updatedAt: now });
          loanRiskTriggered += 1;
          changed = true;
        } catch (error) {
          const status = errorStatus(error);
          if (status === 404 || status === 410) { dead = true; break; }
          nextLoanRisk.push(alert);
        }
      } else {
        const next = updateLoanRisk(alert, quote, now);
        if (next !== alert) { changed = true; rearmed += 1; }
        nextLoanRisk.push(next);
      }
    }
    if (dead) {
      await removePushDeviceById(device.id);
      removed += 1;
      continue;
    }

    const nextLoanReminders: RemoteLoanReminder[] = [];
    for (const reminder of device.record.loanReminders ?? []) {
      const event = remoteLoanReminderEvent(reminder);
      if (!event) { nextLoanReminders.push(reminder); continue; }
      const now = new Date().toISOString();
      try {
        await sendLoanReminderPush(device.record.subscription, reminder, event.key, event.daysRemaining, now);
        nextLoanReminders.push(withSentLoanReminder(reminder, event.key, now));
        loanTriggered += 1;
        changed = true;
      } catch (error) {
        const status = errorStatus(error);
        if (status === 404 || status === 410) { dead = true; break; }
        nextLoanReminders.push(reminder);
      }
    }
    if (dead) {
      await removePushDeviceById(device.id);
      removed += 1;
    } else if (changed) {
      await savePushDeviceById(device.id, { ...device.record, version: 3, alerts: nextAlerts, loanReminders: nextLoanReminders, loanRiskAlerts: nextLoanRisk, syncedAt: new Date().toISOString() });
    }
  }
  return { devices: devices.length, triggered, rearmed, loanTriggered, loanRiskTriggered, removed, quotes: quoteMap.size };
}
