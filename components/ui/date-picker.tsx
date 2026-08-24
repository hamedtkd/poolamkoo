"use client";

import * as React from "react";
import { RiCalendarLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { PersianCalendar } from "@/components/ui/persian-calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMediaQuery } from "@/hooks/use-media-query";
import { formatPersianDate } from "@/lib/persian-date";
import { cn } from "@/lib/utils";

export type DatePickerPresentation = "auto" | "popover" | "drawer";
export type DatePickerConfirmMode = "auto" | "immediate" | "explicit";
export type DatePickerDefaultValue = Date | "today" | null;

export interface DatePickerProps {
  value?: Date | null;
  defaultValue?: DatePickerDefaultValue;
  onValueChange?: (value: Date | null) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  presentation?: DatePickerPresentation;
  mobileBreakpoint?: number;
  confirmMode?: DatePickerConfirmMode;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  drawerTitle?: string;
  disabled?: boolean;
  className?: string;
  renderTrigger?: (state: { value: Date | null; formattedValue: string | null; open: boolean }) => React.ReactElement;
}

export function DatePicker({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  presentation = "auto",
  mobileBreakpoint = 800,
  confirmMode = "auto",
  placeholder = "انتخاب تاریخ",
  confirmLabel = "تأیید",
  cancelLabel = "انصراف",
  drawerTitle,
  disabled,
  className,
  renderTrigger,
}: DatePickerProps) {
  const mediaMobile = useMediaQuery(`(max-width: ${mobileBreakpoint - 1}px)`);
  const isDrawer = presentation === "drawer" || (presentation === "auto" && mediaMobile);
  const controlled = valueProp !== undefined;
  const [internalValue, setInternalValue] = React.useState<Date | null>(() => defaultValue instanceof Date ? defaultValue : null);
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const value = controlled ? (valueProp ?? null) : internalValue;
  const open = openProp ?? internalOpen;
  const [draft, setDraft] = React.useState<Date | null>(value);

  React.useEffect(() => {
    if (defaultValue !== "today" || controlled) return;
    setInternalValue((current) => current ?? new Date());
  }, [controlled, defaultValue]);

  React.useEffect(() => { if (!open) setDraft(value); }, [open, value]);

  function setOpen(next: boolean) {
    if (openProp === undefined) setInternalOpen(next);
    onOpenChange?.(next);
    if (next) setDraft(value);
  }

  function commit(next: Date | null) {
    if (!controlled) setInternalValue(next);
    onValueChange?.(next);
  }

  const resolvedConfirm = confirmMode === "auto" ? (isDrawer ? "explicit" : "immediate") : confirmMode;
  const formattedValue = value ? formatPersianDate(value) : null;
  const trigger = renderTrigger?.({ value, formattedValue, open }) ?? (
    <Button type="button" variant="outline" disabled={disabled} className={cn("w-full justify-start gap-2 type-body", !value && "text-muted-foreground", className)}>
      <RiCalendarLine className="size-4" />
      <span className="flex-1 text-start">{formattedValue ?? placeholder}</span>
    </Button>
  );

  function select(next: Date) {
    setDraft(next);
    if (resolvedConfirm === "immediate") { commit(next); setOpen(false); }
  }

  if (isDrawer) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>{drawerTitle ?? placeholder}</DrawerTitle>
          <div className="flex justify-center"><PersianCalendar value={draft} onValueChange={select} /></div>
          {resolvedConfirm === "explicit" && <div className="mt-4 grid grid-cols-2 gap-2"><Button type="button" variant="outline" onClick={() => { setDraft(value); setOpen(false); }}>{cancelLabel}</Button><Button type="button" disabled={!draft} onClick={() => { commit(draft); setOpen(false); }}>{confirmLabel}</Button></div>}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <PersianCalendar value={resolvedConfirm === "explicit" ? draft : value} onValueChange={select} />
        {resolvedConfirm === "explicit" && <div className="mt-2 grid grid-cols-2 gap-2"><Button type="button" variant="outline" onClick={() => { setDraft(value); setOpen(false); }}>{cancelLabel}</Button><Button type="button" disabled={!draft} onClick={() => { commit(draft); setOpen(false); }}>{confirmLabel}</Button></div>}
      </PopoverContent>
    </Popover>
  );
}
