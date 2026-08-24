"use client";

import { RiAddLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function RelatedEntitySelect({
  value,
  onValueChange,
  options,
  placeholder,
  createLabel,
  onCreate,
  disabled = false,
  className,
}: {
  value?: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  createLabel: string;
  onCreate: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]", className)}>
      <Select
        value={value}
        onValueChange={onValueChange}
        options={options}
        placeholder={placeholder}
        disabled={disabled}
      />
      <Button
        type="button"
        variant="outline"
        className="h-10 shrink-0 gap-1.5 px-3"
        onClick={onCreate}
        disabled={disabled}
      >
        <RiAddLine className="size-4" />
        {createLabel}
      </Button>
    </div>
  );
}
