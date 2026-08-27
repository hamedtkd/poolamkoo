"use client";

import { RiWifiOffLine } from "react-icons/ri";
import { useNetworkStatus } from "@/hooks/use-network-status";

export function NetworkStatusBanner() {
  const { online, hydrated } = useNetworkStatus();
  if (!hydrated || online) return null;

  return (
    <div
      role="status"
      className="mb-4 flex animate-fade-down animate-once animate-duration-200 animate-ease-out animate-fill-both items-start gap-2 rounded-xl border border-primary/20 bg-primary/8 px-3 py-2.5 text-xs leading-6 text-foreground motion-reduce:animate-none"
    >
      <RiWifiOffLine className="mt-0.5 size-4 shrink-0 text-primary" />
      <span><strong className="font-[650]">آفلاین هستی.</strong> داده محلی همچنان در دسترس است؛ نرخ بازار و سرویس‌های آنلاین تا برگشت اتصال به‌روز نمی‌شوند.</span>
    </div>
  );
}
