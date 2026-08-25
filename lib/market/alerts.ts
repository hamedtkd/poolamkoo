import { premiumToNavPercent } from "./nav.ts";
import type { MarketAlert, MarketAlertKind, MarketQuote } from "../types.ts";

export type MarketAlertTransition = "trigger" | "rearm" | "none" | "unavailable";

export interface MarketAlertTarget {
  marketId: string;
  symbol: string;
  name: string;
  source: "tindex";
  priceToman?: number;
  navToman?: number;
  changePercent?: number;
}

export const marketAlertKindOptions: Array<{ value: MarketAlertKind; label: string }> = [
  { value: "price_below", label: "قیمت کمتر از" },
  { value: "price_above", label: "قیمت بیشتر از" },
  { value: "change_below", label: "افت روزانه حداقل" },
  { value: "change_above", label: "رشد روزانه حداقل" },
  { value: "nav_discount", label: "تخفیف نسبت به NAV حداقل" },
  { value: "nav_premium", label: "حباب نسبت به NAV حداقل" },
];

export function marketAlertObservedValue(alert: Pick<MarketAlert, "kind">, quote?: MarketQuote) {
  if (!quote) return null;
  if (alert.kind === "price_above" || alert.kind === "price_below") return quote.priceToman;
  if (alert.kind === "change_above" || alert.kind === "change_below") return quote.changePercent;
  return premiumToNavPercent(quote.priceToman, quote.navToman);
}

export function marketAlertConditionMet(alert: Pick<MarketAlert, "kind" | "threshold">, quote?: MarketQuote) {
  const observed = marketAlertObservedValue(alert, quote);
  if (observed === null) return false;
  const threshold = Math.abs(alert.threshold);
  if (alert.kind === "price_above") return observed >= threshold;
  if (alert.kind === "price_below") return observed <= threshold;
  if (alert.kind === "change_above") return observed >= threshold;
  if (alert.kind === "change_below") return observed <= -threshold;
  if (alert.kind === "nav_discount") return observed <= -threshold;
  return observed >= threshold;
}

export function marketAlertTransition(alert: Pick<MarketAlert, "kind" | "threshold" | "enabled" | "armed">, quote?: MarketQuote): MarketAlertTransition {
  if (!alert.enabled) return "none";
  const observed = marketAlertObservedValue(alert, quote);
  if (observed === null) return "unavailable";
  const met = marketAlertConditionMet(alert, quote);
  if (met && alert.armed) return "trigger";
  if (!met && !alert.armed) return "rearm";
  return "none";
}

export function suggestedMarketAlertThreshold(kind: MarketAlertKind, target: MarketAlertTarget) {
  if (kind === "price_below") return target.priceToman ? Math.max(1, Math.round(target.priceToman * 0.98)) : 0;
  if (kind === "price_above") return target.priceToman ? Math.max(1, Math.round(target.priceToman * 1.02)) : 0;
  if (kind === "nav_discount" || kind === "nav_premium") return 2;
  return 3;
}

export function marketAlertKindLabel(kind: MarketAlertKind) {
  return marketAlertKindOptions.find((option) => option.value === kind)?.label ?? "هشدار بازار";
}
