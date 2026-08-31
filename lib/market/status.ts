import { APP_VERSION } from "../app-version.ts";
import type {
  MarketHealthSummary,
  MarketProviderFailureKind,
  MarketProviderHealth,
  MarketProviderId,
  MarketProviderStatus,
} from "./reliability.ts";
import type { MarketCoverage } from "./runtime.ts";

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
    if (health.guarded) {
      const until = formatCooldownUntil(health.cooldownUntil);
      return until
        ? `محافظ سهمیه درخواست جدید را تا ${until} متوقف کرده است.`
        : "محافظ سهمیه موقتاً درخواست جدید به این Provider را متوقف کرده است.";
    }
    return health.configured
      ? "این refresh به این Provider نیاز نداشت."
      : "برای استفاده از این Provider تنظیمات لازم موجود نیست.";
  }

  const parts: string[] = [];
  if (health.requestedCount !== undefined) {
    parts.push(`${faNumber(health.itemCount ?? 0)} از ${faNumber(health.requestedCount)} مورد`);
  } else if (health.itemCount !== undefined) {
    parts.push(`${faNumber(health.itemCount)} مورد`);
  }
  if (health.latencyMs !== undefined) parts.push(`${faNumber(health.latencyMs)} ms`);
  const failure = marketProviderFailureLabel(health.failure);
  if (failure) parts.push(failure);
  if (health.guarded) {
    const until = formatCooldownUntil(health.cooldownUntil);
    parts.push(until ? `محافظ سهمیه تا ${until}` : "محافظ سهمیه فعال");
  }
  return parts.length ? parts.join(" · ") : "در این refresh پاسخ Provider دریافت شد.";
}

export function marketRuntimeStatus(mode?: string, health?: MarketHealthSummary, coverage?: MarketCoverage) {
  if (mode === "loading") return { label: "در حال بررسی بازار", detail: "آخرین Snapshot محلی نمایش داده می‌شود تا refresh کامل شود." };
  if (mode === "offline") return { label: "Snapshot محلی", detail: "قیمت تازه در دسترس نیست؛ فقط داده واقعی ذخیره‌شده یا قیمت دستی استفاده می‌شود." };
  if (mode === "live" && coverage?.snapshot) return { label: "زنده + Snapshot", detail: "بخش تازه بازار به‌روز شد و مسیرهای ناموفق با آخرین Snapshot واقعی همان نمادها پر شده‌اند." };
  if (mode === "live" && health?.degraded) return { label: "زنده، با محدودیت", detail: "بخشی از منابع تازه پاسخ داده‌اند؛ برای داده‌های بدون Snapshot قیمت دستی یا حالت ناموجود حفظ می‌شود." };
  if (mode === "live") return { label: "بازار زنده", detail: "داده تازه از Providerهای موردنیاز دریافت شده است." };
  if (mode === "unconfigured") return { label: "منبع اصلی تنظیم نشده", detail: "بورس مستقیم می‌تواند بدون کلید کار کند؛ نرخ‌های پایه به BrsApi یا fallback اختیاری نیاز دارند." };
  if (mode === "unavailable") return { label: "بازار تازه در دسترس نیست", detail: "پولم‌کو داده ساختگی نمی‌سازد و به Snapshot واقعی یا قیمت دستی برمی‌گردد." };
  return { label: "وضعیت بازار آماده نیست", detail: "پس از اولین refresh وضعیت Providerها اینجا نمایش داده می‌شود." };
}

export function marketCoverageLabel(coverage?: MarketCoverage) {
  if (!coverage?.total) return "هنوز Quote فعالی برای نمایش نداریم.";
  if (coverage.snapshot && coverage.live) return `${faNumber(coverage.live)} تازه · ${faNumber(coverage.snapshot)} Snapshot محلی`;
  if (coverage.snapshot) return `${faNumber(coverage.snapshot)} Snapshot محلی`;
  return `${faNumber(coverage.live)} Quote تازه`;
}

export function marketSnapshotCoverageDetail(coverage?: MarketCoverage) {
  if (!coverage?.snapshot || !coverage.oldestSnapshotAt) return undefined;
  const date = new Date(coverage.oldestSnapshotAt);
  if (!Number.isFinite(date.getTime())) return undefined;
  const formatted = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { dateStyle: "medium", timeStyle: "short" }).format(date);
  return `قدیمی‌ترین Snapshot فعال این refresh: ${formatted}`;
}

export function formatMarketDiagnostics({
  mode,
  health,
  coverage,
  lastUpdated,
}: {
  mode?: string;
  health?: MarketHealthSummary;
  coverage?: MarketCoverage;
  lastUpdated?: string | null;
}) {
  const lines = [
    `Poolamkoo ${APP_VERSION}`,
    `market_mode=${mode || "unknown"}`,
    `market_degraded=${health?.degraded ? "yes" : "no"}`,
    `last_updated=${lastUpdated || "none"}`,
    `coverage_live=${coverage?.live ?? 0}`,
    `coverage_snapshot=${coverage?.snapshot ?? 0}`,
    `coverage_total=${coverage?.total ?? 0}`,
    `oldest_snapshot_at=${coverage?.oldestSnapshotAt ?? "none"}`,
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
      `guarded:${item.guarded ? "yes" : "no"}`,
      `cooldown_until:${item.cooldownUntil ?? "-"}`,
    ].join(";"));
  }

  lines.push("privacy=financial-values-and-identifiers-excluded");
  return lines.join("\n");
}

function formatCooldownUntil(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return undefined;
  return new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit" }).format(date);
}

function faNumber(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value);
}
