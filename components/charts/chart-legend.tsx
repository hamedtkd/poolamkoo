import { cn } from "@/lib/utils";

export function ChartLegend({ items, className }: {
  items: Array<{ label: string; color: string; value?: string }>;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground", className)}>
      {items.map((item) => (
        <div key={item.label} className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
          <span>{item.label}</span>
          {item.value && <strong className="text-foreground">{item.value}</strong>}
        </div>
      ))}
    </div>
  );
}
