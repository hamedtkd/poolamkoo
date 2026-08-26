"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PWA_UPDATE_MESSAGE, pwaUpdateReady } from "@/lib/pwa-update";

export type PwaUpdateStatus = "idle" | "ready" | "applying";

export function usePwaUpdate() {
  const [status, setStatus] = useState<PwaUpdateStatus>("idle");
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const applyRequestedRef = useRef(false);
  const reloadingRef = useRef(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") return;

    let disposed = false;
    let registration: ServiceWorkerRegistration | null = null;
    let installing: ServiceWorker | null = null;

    const inspectUpdate = () => {
      if (disposed || !registration) return;
      if (pwaUpdateReady({
        hasController: Boolean(navigator.serviceWorker.controller),
        hasWaitingWorker: Boolean(registration.waiting),
      })) setStatus("ready");
    };
    const onInstallingStateChange = () => {
      if (installing?.state === "installed") window.setTimeout(inspectUpdate, 0);
    };
    const watchInstalling = (worker: ServiceWorker | null) => {
      installing?.removeEventListener("statechange", onInstallingStateChange);
      installing = worker;
      installing?.addEventListener("statechange", onInstallingStateChange);
      inspectUpdate();
    };
    const onUpdateFound = () => watchInstalling(registration?.installing ?? null);
    const onControllerChange = () => {
      if (!applyRequestedRef.current || reloadingRef.current) return;
      reloadingRef.current = true;
      window.location.reload();
    };
    const requestUpdateCheck = () => {
      if (document.visibilityState === "visible") void registration?.update().catch(() => undefined);
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    window.addEventListener("focus", requestUpdateCheck);
    document.addEventListener("visibilitychange", requestUpdateCheck);

    void navigator.serviceWorker.register("/sw.js").then((next) => {
      if (disposed) return;
      registration = next;
      registrationRef.current = next;
      next.addEventListener("updatefound", onUpdateFound);
      watchInstalling(next.installing);
      inspectUpdate();
      void next.update().catch(() => undefined);
    }).catch(() => undefined);

    return () => {
      disposed = true;
      installing?.removeEventListener("statechange", onInstallingStateChange);
      registration?.removeEventListener("updatefound", onUpdateFound);
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      window.removeEventListener("focus", requestUpdateCheck);
      document.removeEventListener("visibilitychange", requestUpdateCheck);
      if (registrationRef.current === registration) registrationRef.current = null;
    };
  }, []);

  const applyUpdate = useCallback(() => {
    const registration = registrationRef.current;
    const waiting = registration?.waiting;
    if (!registration || !waiting) return;
    applyRequestedRef.current = true;
    setStatus("applying");
    waiting.postMessage({ type: PWA_UPDATE_MESSAGE });
  }, []);

  const dismissUpdate = useCallback(() => {
    applyRequestedRef.current = false;
    setStatus("idle");
  }, []);

  return { status, applyUpdate, dismissUpdate };
}
