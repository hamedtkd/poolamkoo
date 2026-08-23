"use client";

import { PriceInput } from "@/components/ui/price-input";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import type { MoneyUnit } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MoneyInput({ value, onValueChange, unit = "toman", placeholder, className, min = 0, invalid = false }: {
  value: number | null;
  onValueChange: (value: number | null) => void;
  unit?: MoneyUnit;
  placeholder?: string;
  className?: string;
  min?: number;
  invalid?: boolean;
}) {
  const multiplier = unit === "rial" ? 10 : 1;
  const displayValue = value == null ? null : value * multiplier;
  const handleChange = (next: number | null) => onValueChange(next == null ? null : next / multiplier);

  return (
    <InputGroup className={cn("h-12", invalid && "border-destructive ring-2 ring-destructive/15", className)}>
      <PriceInput
        value={displayValue}
        onValueChange={handleChange}
        min={min * multiplier}
        locale="fa-IR"
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        className="h-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-3 text-left text-base shadow-none focus:ring-0"
      />
      <InputGroupAddon align="inline-end" className="font-sans">{unit === "rial" ? "ریال" : "تومان"}</InputGroupAddon>
    </InputGroup>
  );
}
