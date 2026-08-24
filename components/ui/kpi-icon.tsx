import { cn } from "@/lib/utils";

export function KpiIcon({ children, tone = "primary", className }: {
  children: React.ReactNode;
  tone?: "primary" | "danger" | "neutral";
  className?: string;
}) {
  return (
    <div className={cn(
      "grid size-10 shrink-0 place-items-center rounded-[14px] border [&_svg]:size-5",
      tone === "danger"
        ? "border-destructive/15 bg-destructive/10 text-destructive"
        : tone === "neutral"
          ? "border-border/80 bg-muted/55 text-foreground"
          : "border-primary/15 bg-primary/10 text-primary",
      className,
    )}>
      {children}
    </div>
  );
}
