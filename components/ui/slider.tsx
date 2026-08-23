"use client";
import { Slider as SliderPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
export function Slider({ value, onValueChange, min = 0, max = 100, step = 1, className }: { value: number[]; onValueChange: (value: number[]) => void; min?: number; max?: number; step?: number; className?: string }) {
  return <SliderPrimitive.Root dir="rtl" value={value} onValueChange={onValueChange} min={min} max={max} step={step} className={cn("relative flex h-5 w-full touch-none select-none items-center", className)}><SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary"><SliderPrimitive.Range className="absolute h-full bg-primary" /></SliderPrimitive.Track><SliderPrimitive.Thumb className="block size-5 rounded-full border-2 border-primary bg-background shadow outline-none ring-offset-background transition focus:ring-2 focus:ring-ring/50" /></SliderPrimitive.Root>;
}
