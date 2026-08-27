import { APP_VERSION } from "../app-version.ts";
import type {
  MarketHealthSummary,
  MarketProviderFailureKind,
  MarketProviderHealth,
  MarketProviderId,
  MarketProviderStatus,
} from "./reliability.ts";

export const MARKET_PROVIDER_ORDER = ["brsapi", "tsetmc", "tindex"] as const satisfies readonly MarketProviderId[];

type ProviderMeta = {
  name: string;
  role: string;
  description: string;
};

const PROVIDER_META: Record<MarketProviderId, ProviderMeta> = {
  brsapi: {
    name: "BrsApi",
    role: "نرخ‌های پایه",
    description: "منبع اصلی دلار، طلای ۱۸ عیار و رمزارزهای پایه",
  },
  tsetmc: {
    name: "TSETMC",
    role: "بورس تهران",
    description: "منبع اصلی سهام و ETF؛ بدون API Key",
  },
  tindex: {
    name: "Tindex",
    role: "پشتیبان اختیاری",
    description: "فقط اتصال‌های قدیمی و fallback محدود نرخ‌های پایه",
  },
};

const STATUS_LABEL: Record<MarketProviderStatus, string> = {
  ok: "سالم",
  degraded: "ناقص",
  unavailable: "در دسترس نیست",
  unconfigured: "تنظیم نشده",
  idle: "در انتظار نیاز",
};

const FAILURE_LABEL: Record<MarketProviderFailureKind, string> = {
  timeout: "پاسخ دیر رسید",
  rate_limited: "محدودیت درخواست",
  unauthorized: "دسترسی نامعتبر",
  blocked: "دسترسی سرور رد شد",
  not_found: "داده پیدا نشد",
  invalid_response: "پاسخ نامعتبر",
  network: "اختلال شبکه",
  upstream: "اختلال Provider",
};

export function marketProviderMeta(provider: MarketProviderId) {
  return PROVIDER_META[provider];
}

export function marketProviderStatusLabel(health?: MarketProviderHealth) {
  return health ? STATUS_LABEL[health.status] : "هنوز بررسی نشده";
}

export function marketProviderFailureLabel(failure?: MarketProviderFailureKind) {
  return failure ? FAILURE_LABEL[failure] : undefined;
}

export function marketProviderActivityLabel(health?: MarketProviderHealth) {
  if (!health) return "پس از اولین refresh وضعیت این مسیر مشخص می‌شود.";
  if (!health.attempted) {
    return health.configured
      ? "این refresh به این Provider نیاز نداشت."
      : "برای استفاده از این Provider تنظیمات لازم موجود نیست.";
  }

  const parts: string[] = [];
  if (health.requestedCount !== undefined) {
    parts.push(`${new Intl.NumberFormat("fa-IR").format(health.itemCount ?? 0)} از ${new Intl.NumberFormat("fa-IR").format(health.requestedCount)} مورد`);
  } else if (health.itemCount !== undefined) {
    parts.push(`${new Intl.NumberFormat("fa-IR").format(health.itemCount)} مورد`);
  }
  if (health.latencyMs !== undefined) parts.push(`${new Intl.NumberFormat("fa-IR").format(health.latencyMs)} ms`);
  const failure = marketProviderFailureLabel(health.failure);
  if (failure) parts.push(failure);
  return parts.length ? parts.join(" · ") : "در این refresh پاسخ Provider دریافت شد.";
}

export function marketRuntimeStatus(mode?: string, health?: MarketHealthSummary) {
  if (mode === "loading") return { label: "در حال بررسی بازار", detail: "آخرین Snapshot محلی نمایش داده می‌شود تا refresh کامل شود." };
  if (mode === "offline") return { label: "Snapshot محلی", detail: "قیمت تازه در دسترس نیست؛ فقط داده واقعی ذخیره‌شده یا قیمت دستی استفاده می‌شود." };
  if (mode === "live" && health?.degraded) return { label: "زنده، با محدودیت", detail: "بخشی از منابع تازه پاسخ داده‌اند و fallback واقعی برای بخش‌های ناموفق حفظ شده است." };
  if (mode === "live") return { label: "بازار زنده", detail: "داده تازه از Providerهای موردنیاز دریافت شده است." };
  if (mode === "unconfigured") return { label: "منبع اصلی تنظیم نشده", detail: "بورس مستقیم می‌تواند بدون کلید کار کند؛ نرخ‌های پایه به BrsApi یا fallback اختیاری نیاز دارند." };
  if (mode === "unavailable") return { label: "بازار تازه در دسترس نیست", detail: "پولم‌کو داده ساختگی نمی‌سازد و به Snapshot واقعی یا قیمت دستی برمی‌گردد." };
  return { label: "وضعیت بازار آماده نیست", detail: "پس از اولین refresh وضعیت Providerها اینجا نمایش داده می‌شود." };
}

export function formatMarketDiagnostics({
  mode,
  health,
  lastUpdated,
}: {
  mode?: string;
  health?: MarketHealthSummary;
  lastUpdated?: string | null;
}) {
  const lines = [
    `Poolamkoo ${APP_VERSION}`,
    `market_mode=${mode || "unknown"}`,
    `market_degraded=${health?.degraded ? "yes" : "no"}`,
    `last_updated=${lastUpdated || "none"}`,
  ];

  for (const provider of MARKET_PROVIDER_ORDER) {
    const item = health?.providers[provider];
    if (!item) {
      lines.push(`${provider}=status:unknown`);
      continue;
    }
    lines.push([
      `${provider}=status:${item.status}`,
      `configured:${item.configured ? "yes" : "no"}`,
      `attempted:${item.attempted ? "yes" : "no"}`,
      `items:${item.itemCount ?? "-"}`,
      `requested:${item.requestedCount ?? "-"}`,
      `latency_ms:${item.latencyMs ?? "-"}`,
      `failure:${item.failure ?? "-"}`,
    ].join(";"));
  }

  lines.push("privacy=financial-values-and-identifiers-excluded");
  return lines.join("\n");
}
