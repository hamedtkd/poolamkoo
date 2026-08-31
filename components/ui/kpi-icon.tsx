import { cn } from "@/lib/utils";

export function KpiIcon({ children, tone = "primary", className }: {
  children: React.ReactNode;
  tone?: "primary" | "profit" | "danger" | "neutral";
  className?: string;
}) {
  return (
    <div className={cn(
      "grid size-10 shrink-0 place-items-center rounded-[14px] border [&_svg]:size-5",
      tone === "danger"
        ? "border-loss/20 bg-loss/10 text-loss"
        : tone === "profit"
          ? "border-profit/20 bg-profit/10 text-profit"
          : tone === "neutral"
          ? "border-border/80 bg-muted/55 text-foreground"
          : "border-primary/15 bg-primary/10 text-primary",
      className,
    )}>
      {children}
    </div>
  );
}
