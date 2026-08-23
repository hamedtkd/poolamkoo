"use client";

import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { ensureSeedData } from "@/lib/db";

function PwaBootstrap() {
  useEffect(() => {
    void ensureSeedData();
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    if (navigator.storage?.persist) navigator.storage.persist().catch(() => undefined);
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange><PwaBootstrap />{children}</ThemeProvider>;
}
