"use client";

import { Popover as PopoverPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;

export function PopoverContent({ className, align = "center", sideOffset = 6, children }: {
  className?: string;
  align?: "start" | "center" | "end";
  sideOffset?: number;
  children: React.ReactNode;
}) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        dir="rtl"
        align={align}
        sideOffset={sideOffset}
        className={cn("z-[110] rounded-2xl border bg-popover p-3 text-popover-foreground shadow-2xl outline-none", className)}
      >
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
}
