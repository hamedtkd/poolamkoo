"use client";

import { ThemeProvider } from "next-themes";
import { MotionConfig } from "motion/react";
import { PwaUpdateNotice } from "@/components/system/pwa-update-notice";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <TooltipProvider delayDuration={260}>
          {children}
          <PwaUpdateNotice />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </MotionConfig>
  );
}
