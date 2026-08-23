import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function InputGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "group/input-group relative flex h-11 w-full min-w-0 items-center rounded-lg border border-input bg-background/70 outline-none transition",
        "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30",
        "has-[[data-slot=input-group-control][aria-invalid=true]]:border-destructive has-[[data-slot=input-group-control][aria-invalid=true]]:ring-destructive/20",
        className,
      )}
      {...props}
    />
  );
}

export function InputGroupAddon({ children, align = "inline-end", className }: {
  children: ReactNode;
  align?: "inline-start" | "inline-end";
  className?: string;
}) {
  return (
    <div
      data-slot="input-group-addon"
      data-align={align}
      className={cn(
        "flex h-full shrink-0 items-center justify-center px-3 text-xs font-semibold text-muted-foreground select-none",
        align === "inline-start" ? "order-first border-e border-input" : "order-last border-s border-input",
        className,
      )}
    >
      {children}
    </div>
  );
}
