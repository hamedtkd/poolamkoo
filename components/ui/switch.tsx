"use client";
import { Switch as SwitchPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
export function Switch({ checked, onCheckedChange, className }: { checked?: boolean; onCheckedChange?: (checked: boolean) => void; className?: string }) { return <SwitchPrimitive.Root checked={checked} onCheckedChange={onCheckedChange} className={cn("inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-input p-0.5 transition data-[state=checked]:bg-primary", className)}><SwitchPrimitive.Thumb className="block size-5 rounded-full bg-background shadow transition-transform data-[state=checked]:-translate-x-5" /></SwitchPrimitive.Root>; }
