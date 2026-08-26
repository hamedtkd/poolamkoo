"use client";

import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { RiWifiOffLine } from "react-icons/ri";
import { useNetworkStatus } from "@/hooks/use-network-status";

export function NetworkStatusBanner() {
  const { online, hydrated } = useNetworkStatus();
  const reduced = useReducedMotion();

  return (
    <AnimatePresence initial={false}>
      {hydrated && !online && (
        <m.div
          initial={reduced ? false : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
          transition={{ duration: reduced ? 0 : 0.18 }}
          role="status"
          className="mb-4 flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/8 px-3 py-2.5 text-xs leading-6 text-foreground"
        >
          <RiWifiOffLine className="mt-0.5 size-4 shrink-0 text-primary" />
          <span><strong className="font-[650]">آفلاین هستی.</strong> داده محلی همچنان در دسترس است؛ نرخ بازار و سرویس‌های آنلاین تا برگشت اتصال به‌روز نمی‌شوند.</span>
        </m.div>
      )}
    </AnimatePresence>
  );
}
