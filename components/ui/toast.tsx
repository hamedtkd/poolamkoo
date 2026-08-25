"use client";

import { useEffect, useState } from "react";
import { RiCheckboxCircleLine, RiErrorWarningLine, RiInformationLine } from "react-icons/ri";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info";
type ToastDetail = { id?: string; title: string; description?: string; tone?: ToastTone; duration?: number };
type ToastItem = Required<Pick<ToastDetail, "id" | "title" | "tone">> & Pick<ToastDetail, "description">;
const EVENT = "poolamco:toast";

export function toast(detail: ToastDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ToastDetail>(EVENT, { detail }));
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    function onToast(event: Event) {
      const detail = (event as CustomEvent<ToastDetail>).detail;
      const id = detail.id ?? crypto.randomUUID();
      const item: ToastItem = { id, title: detail.title, description: detail.description, tone: detail.tone ?? "info" };
      setItems((current) => [...current.filter((row) => row.id !== id), item].slice(-3));
      window.setTimeout(() => setItems((current) => current.filter((row) => row.id !== id)), detail.duration ?? 4200);
    }
    window.addEventListener(EVENT, onToast);
    return () => window.removeEventListener(EVENT, onToast);
  }, []);

  return <div className="pointer-events-none fixed inset-x-3 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-[120] flex flex-col items-end gap-2 md:bottom-5 md:left-5 md:right-auto md:w-[380px]" aria-live="polite">
    {items.map((item) => <ToastView key={item.id} item={item} />)}
  </div>;
}

function ToastView({ item }: { item: ToastItem }) {
  const Icon = item.tone === "success" ? RiCheckboxCircleLine : item.tone === "error" ? RiErrorWarningLine : RiInformationLine;
  return <div className={cn("pointer-events-auto w-full rounded-2xl border bg-background/95 p-3 shadow-xl backdrop-blur", item.tone === "error" && "border-destructive/25")}>
    <div className="flex gap-3"><Icon className={cn("mt-0.5 size-5 shrink-0 text-primary", item.tone === "error" && "text-destructive")} /><div className="min-w-0"><div className="type-strong">{item.title}</div>{item.description && <div className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</div>}</div></div>
  </div>;
}
