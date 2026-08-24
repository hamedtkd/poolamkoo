import type { AssetKind } from "@/lib/types";

export function assetUsesManualPrice(kind: AssetKind) {
  return kind === "stock" || kind === "fund" || kind === "custom";
}

export function assetRequiresManualPrice(kind: AssetKind, marketId?: string) {
  if (kind === "custom") return true;
  if (kind === "stock" || kind === "fund") return !marketId;
  return false;
}

export function assetSupportsExchangeLink(kind: AssetKind) {
  return kind === "stock" || kind === "fund";
}

export function assetKindLabel(kind: AssetKind) {
  switch (kind) {
    case "gold": return "طلا";
    case "currency": return "ارز";
    case "crypto": return "رمزارز";
    case "stock": return "سهام / بورس";
    case "fund": return "صندوق سرمایه‌گذاری";
    default: return "سفارشی";
  }
}
