import type { MarketSource } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MarketSourceLabel({ source, className, compact = false }: {
  source: MarketSource;
  className?: string;
  compact?: boolean;
}) {
  if (source === "tindex") {
    return <a
      href="https://tindex.app"
      target="_blank"
      rel="noreferrer"
      className={cn("underline decoration-dotted underline-offset-2 hover:text-foreground", className)}
      title="داده بازار از Tindex"
    >{compact ? "Tindex" : "منبع داده: Tindex"}</a>;
  }
  if (source === "brsapi") return <span className={className}>{compact ? "BrsApi" : "منبع داده: BrsApi"}</span>;
  return <span className={className}>{compact ? "Cache" : "آخرین داده ذخیره‌شده"}</span>;
}
