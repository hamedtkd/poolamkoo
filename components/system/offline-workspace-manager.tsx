"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const WORKSPACE_ROUTES = [
  "/dashboard",
  "/activity",
  "/income",
  "/funds",
  "/investments",
  "/reports",
  "/settings",
  "/settings/general",
  "/settings/money",
  "/settings/market",
  "/settings/data",
  "/settings/privacy",
  "/settings/transfer",
  "/settings/about",
] as const;

type OfflineStatus = { release?: string; ready?: boolean };

function isWorkspacePath(pathname: string) {
  return WORKSPACE_ROUTES.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function readOfflineStatus() {
  const controller = navigator.serviceWorker.controller;
  if (!controller) return Promise.resolve<OfflineStatus | null>(null);

  return new Promise<OfflineStatus | null>((resolve) => {
    const channel = new MessageChannel();
    const timer = window.setTimeout(() => resolve(null), 350);
    channel.port1.onmessage = (event: MessageEvent<OfflineStatus>) => {
      window.clearTimeout(timer);
      resolve(event.data ?? null);
    };
    controller.postMessage({ type: "GET_OFFLINE_STATUS" }, [channel.port2]);
  });
}

export function OfflineWorkspaceManager() {
  const router = useRouter();

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    let cancelled = false;

    async function warmOfflineWorkspace() {
      await navigator.serviceWorker.ready;
      if (cancelled || !navigator.onLine) return;

      for (const path of WORKSPACE_ROUTES) router.prefetch(path);
      const status = await readOfflineStatus();
      if (cancelled || status?.ready) return;

      await Promise.allSettled(WORKSPACE_ROUTES.map(async (path) => {
        const response = await fetch(path, {
          credentials: "same-origin",
          headers: { "x-poolamkoo-warm": "1", accept: "text/html" },
        });
        if (!response.ok) throw new Error(`warm ${path} failed`);
        await response.text();
      }));
    }

    const onOnline = () => void warmOfflineWorkspace();
    const onControllerChange = () => void warmOfflineWorkspace();
    void warmOfflineWorkspace();
    window.addEventListener("online", onOnline);
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    return () => {
      cancelled = true;
      window.removeEventListener("online", onOnline);
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, [router]);

  useEffect(() => {
    let offline = !navigator.onLine;
    const markOffline = () => { offline = true; document.documentElement.dataset.poolamkooNetwork = "offline"; };
    const markOnline = () => { offline = false; document.documentElement.dataset.poolamkooNetwork = "online"; };
    if (offline) markOffline(); else markOnline();

    function onClick(event: MouseEvent) {
      if (!offline || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const rawTarget = event.target;
      const target = rawTarget instanceof Element ? rawTarget : rawTarget instanceof Node ? rawTarget.parentElement : null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || !isWorkspacePath(url.pathname)) return;
      event.preventDefault();
      window.location.href = url.href;
    }

    window.addEventListener("offline", markOffline);
    window.addEventListener("online", markOnline);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("offline", markOffline);
      window.removeEventListener("online", markOnline);
      document.removeEventListener("click", onClick, true);
      delete document.documentElement.dataset.poolamkooNetwork;
    };
  }, []);

  return null;
}
