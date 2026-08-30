import type { MarketSource } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MarketSourceLabel({
  source,
  className,
  compact = false,
  snapshot = false,
  snapshotAt,
}: {
  source: MarketSource;
  className?: string;
  compact?: boolean;
  snapshot?: boolean;
  snapshotAt?: string;
}) {
  const provider = sourceNode(source, compact);
  if (!snapshot) return <span className={className}>{provider}</span>;

  return <span className={cn("inline-flex flex-wrap items-center gap-1", className)} title={snapshotTitle(snapshotAt)}>
    {provider}
    <span aria-label="Snapshot محلی">· Snapshot محلی</span>
  </span>;
}

function sourceNode(source: MarketSource, compact: boolean) {
  if (source === "tsetmc") {
    return <a
      href="https://www.tsetmc.com"
      target="_blank"
      rel="noreferrer"
      className="underline decoration-dotted underline-offset-2 hover:text-foreground"
      title="داده بازار سرمایه از TSETMC"
    >{compact ? "TSETMC" : "منبع داده: TSETMC"}</a>;
  }
  if (source === "tindex") {
    return <a
      href="https://tindex.app"
      target="_blank"
      rel="noreferrer"
      className="underline decoration-dotted underline-offset-2 hover:text-foreground"
      title="داده بازار از Tindex"
    >{compact ? "Tindex" : "منبع داده: Tindex"}</a>;
  }
  if (source === "brsapi") return <>{compact ? "BrsApi" : "منبع داده: BrsApi"}</>;
  return <>{compact ? "Cache" : "آخرین داده ذخیره‌شده"}</>;
}

function snapshotTitle(value?: string) {
  if (!value) return "این Quote از آخرین Snapshot واقعی ذخیره‌شده روی دستگاه آمده است.";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "این Quote از آخرین Snapshot واقعی ذخیره‌شده روی دستگاه آمده است.";
  const formatted = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { dateStyle: "medium", timeStyle: "short" }).format(date);
  return `Snapshot واقعی ذخیره‌شده در ${formatted}`;
}
