"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "poolamco:sidebar-collapsed";

export function useSidebarState() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setCollapsed(false);
    }
  }, []);

  const setAndPersist = useCallback((next: boolean) => {
    setCollapsed(next);
    try { localStorage.setItem(STORAGE_KEY, next ? "1" : "0"); } catch { /* localStorage may be unavailable */ }
  }, []);

  const toggle = useCallback(() => setAndPersist(!collapsed), [collapsed, setAndPersist]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "b") return;
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      event.preventDefault();
      setCollapsed((current) => {
        const next = !current;
        try { localStorage.setItem(STORAGE_KEY, next ? "1" : "0"); } catch { /* noop */ }
        return next;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return { collapsed, toggle, setCollapsed: setAndPersist };
}
