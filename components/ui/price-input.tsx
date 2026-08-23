"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toLatinDigits } from "@/lib/persian-date";

export interface PriceInputProps extends Omit<React.ComponentProps<typeof Input>, "value" | "defaultValue" | "onChange" | "type"> {
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  locale?: Intl.LocalesArgument;
}

const ANY_DIGIT = /[0-9۰-۹٠-٩]/;
const ANY_DIGIT_GLOBAL = /[0-9۰-۹٠-٩]/g;

function clamp(value: number, min?: number, max?: number) {
  let next = value;
  if (min !== undefined) next = Math.max(next, min);
  if (max !== undefined) next = Math.min(next, max);
  return next;
}

function formatValue(value: number | null, locale: Intl.LocalesArgument) {
  if (value === null) return "";
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
}

function countDigits(text: string) {
  return (text.match(ANY_DIGIT_GLOBAL) ?? []).length;
}

function offsetAfterDigitCount(text: string, digitCount: number) {
  if (digitCount <= 0) return 0;
  let seen = 0;
  for (let index = 0; index < text.length; index += 1) {
    if (ANY_DIGIT.test(text.charAt(index))) {
      seen += 1;
      if (seen === digitCount) return index + 1;
    }
  }
  return text.length;
}

function extendDeletionToDigit(raw: string, cursor: number, direction: "forward" | "backward") {
  if (direction === "forward") {
    const relativeIndex = raw.slice(cursor).search(/\d/);
    if (relativeIndex === -1) return raw;
    const index = cursor + relativeIndex;
    return raw.slice(0, index) + raw.slice(index + 1);
  }

  const matches = [...raw.slice(0, cursor).matchAll(/\d/g)];
  const last = matches.at(-1);
  if (!last || last.index === undefined) return raw;
  return raw.slice(0, last.index) + raw.slice(last.index + 1);
}

export function PriceInput({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  min,
  max,
  locale = "fa-IR",
  placeholder = "۰",
  className,
  onBlur,
  ...props
}: PriceInputProps) {
  const controlled = valueProp !== undefined;
  const [internal, setInternal] = React.useState<number | null>(defaultValue);
  const numericValue = controlled ? (valueProp ?? null) : internal;

  function setNumericValue(next: number | null) {
    if (!controlled) setInternal(next);
    onValueChange?.(next);
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const cursor = input.selectionStart ?? input.value.length;
    let raw = toLatinDigits(input.value);
    const inputType = (event.nativeEvent as InputEvent).inputType;
    const previousDigitCount = numericValue === null ? 0 : String(Math.abs(numericValue)).length;
    let digits = raw.replace(/\D/g, "");

    if ((inputType === "deleteContentForward" || inputType === "deleteContentBackward") && digits.length === previousDigitCount) {
      raw = extendDeletionToDigit(raw, cursor, inputType === "deleteContentForward" ? "forward" : "backward");
      digits = raw.replace(/\D/g, "");
    }

    const digitsBeforeCursor = countDigits(raw.slice(0, cursor));
    const negative = min === undefined || min < 0 ? raw.trimStart().startsWith("-") : false;
    if (!digits) {
      setNumericValue(null);
      return;
    }

    const nextValue = (negative ? -1 : 1) * Number(digits);
    const formatted = formatValue(nextValue, locale);
    if (formatted !== input.value) {
      const nextPosition = offsetAfterDigitCount(formatted, digitsBeforeCursor);
      input.value = formatted;
      input.setSelectionRange(nextPosition, nextPosition);
    }
    setNumericValue(nextValue);
  }

  function handleBlur(event: React.FocusEvent<HTMLInputElement>) {
    if (numericValue !== null) {
      const clamped = clamp(numericValue, min, max);
      if (clamped !== numericValue) setNumericValue(clamped);
    }
    onBlur?.(event);
  }

  return (
    <Input
      {...props}
      data-slot="input-group-control"
      type="text"
      inputMode={min !== undefined && min >= 0 ? "numeric" : "text"}
      dir="ltr"
      lang="fa"
      value={formatValue(numericValue, locale)}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={cn("font-sans tabular-nums", className)}
    />
  );
}
