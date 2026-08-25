import { marketAlertTransition } from "@/lib/market/alerts";
import { TindexProvider } from "@/lib/market/tindex";
import { sendMarketAlertPush } from "@/lib/push/sender";
import { listPushDevices, removePushDeviceById, savePushDeviceById } from "@/lib/push/store";
import type { PushDeviceRecord, RemoteMarketAlert } from "@/lib/push/types";
import type { MarketQuote } from "@/lib/types";

function errorStatus(error: unknown) {
  if (!error || typeof error !== "object") return 0;
  const status = (error as { statusCode?: unknown }).statusCode;
  return typeof status === "number" ? status : 0;
}

async function loadQuotes(devices: Array<{ record: PushDeviceRecord }>) {
  const token = process.env.TINDEX_API_TOKEN?.trim();
  if (!token) throw new Error("TINDEX_API_TOKEN is not configured.");
  const ids = [...new Set(devices.flatMap(({ record }) => record.alerts.filter((alert) => alert.enabled).map((alert) => alert.marketId)))];
  const provider = new TindexProvider(token);
  const quotes: MarketQuote[] = [];
  for (let start = 0; start < ids.length; start += 20) quotes.push(...await provider.getQuotes(ids.slice(start, start + 20)));
  return new Map(quotes.map((quote) => [quote.symbol, quote]));
}

function updateAlert(alert: RemoteMarketAlert, quote: MarketQuote | undefined, now: string) {
  const transition = marketAlertTransition(alert, quote);
  if (transition === "rearm") return { ...alert, armed: true, updatedAt: now };
  return alert;
}

export async function runMarketAlertCron() {
  const devices = await listPushDevices(200);
  if (!devices.length) return { devices: 0, triggered: 0, rearmed: 0, removed: 0, quotes: 0 };
  const quoteMap = await loadQuotes(devices);
  let triggered = 0;
  let rearmed = 0;
  let removed = 0;

  for (const device of devices) {
    let dead = false;
    let changed = false;
    const nextAlerts: RemoteMarketAlert[] = [];
    for (const alert of device.record.alerts) {
      if (!alert.enabled) { nextAlerts.push(alert); continue; }
      const quote = quoteMap.get(alert.symbol);
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
    } else if (changed) {
      await savePushDeviceById(device.id, { ...device.record, alerts: nextAlerts, syncedAt: new Date().toISOString() });
    }
  }
  return { devices: devices.length, triggered, rearmed, removed, quotes: quoteMap.size };
}
