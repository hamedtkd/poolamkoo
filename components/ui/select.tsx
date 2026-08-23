"use client";
import { Select as SelectPrimitive } from "radix-ui";
import { RiArrowDownSLine, RiCheckLine } from "react-icons/ri";
import { cn } from "@/lib/utils";

export function Select({ value, onValueChange, placeholder, options, className }: { value?: string; onValueChange?: (value: string) => void; placeholder?: string; options: Array<{ value: string; label: string }>; className?: string }) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} dir="rtl">
      <SelectPrimitive.Trigger className={cn("flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background/70 px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40", className)}>
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon><RiArrowDownSLine className="size-4 text-muted-foreground" /></SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content position="popper" sideOffset={6} className="z-[100] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border bg-popover p-1 text-popover-foreground shadow-xl">
          <SelectPrimitive.Viewport>
            {options.map((option) => (
              <SelectPrimitive.Item key={option.value} value={option.value} className="relative flex cursor-default select-none items-center rounded-lg py-2 pe-8 ps-3 text-sm outline-none data-[highlighted]:bg-accent">
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute end-2"><RiCheckLine className="size-4 text-primary" /></SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
