"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { db } from "@/lib/db";
import { BACKGROUND_PUSH_EXPERIMENT_ENABLED } from "@/lib/push/feature";
import { toRemoteAlerts } from "@/lib/push/remote-alerts";
import type { PushAlertState } from "@/lib/push/types";
import type { MarketAlert } from "@/lib/types";

const TOKEN_KEY = "poolamco:push-device-token:v1";

export type BackgroundPushStatus = "checking" | "unsupported" | "unconfigured" | "disabled" | "enabled" | "denied" | "error";
type Inspection = { status: BackgroundPushStatus; message?: string };

function supportsPush() {
  return typeof window !== "undefined" && window.isSecureContext && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

function publicKeyBytes(value: string): ArrayBuffer {
  const padding = "=".repeat((4 - value.length % 4) % 4);
  const raw = atob((value + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(raw.length);
  for (let index = 0; index < raw.length; index += 1) bytes[index] = raw.charCodeAt(index);
  return bytes.buffer;
}

function deviceToken(create = false) {
  let token = localStorage.getItem(TOKEN_KEY) ?? "";
  if (!token && create) {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    token = btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
    localStorage.setItem(TOKEN_KEY, token);
  }
  return token;
}

async function pushConfig() {
  const response = await fetch("/api/push/config", { cache: "no-store" });
  const data = await response.json() as { configured?: boolean; publicKey?: string };
  return { configured: Boolean(response.ok && data.configured && data.publicKey), publicKey: data.publicKey ?? "" };
}

async function reconcileStates(states: PushAlertState[]) {
  for (const state of states) {
    const local = await db.marketAlerts.get(state.id);
    if (!local) continue;
    const remoteTime = Date.parse(state.updatedAt) || 0;
    const localTime = Date.parse(local.updatedAt) || 0;
    if (remoteTime <= localTime) continue;
    await db.marketAlerts.update(state.id, { armed: state.armed, lastTriggeredAt: state.lastTriggeredAt, updatedAt: state.updatedAt });
  }
}

async function syncSubscription(subscription: PushSubscription, alerts: MarketAlert[]) {
  const token = deviceToken(true);
  const response = await fetch("/api/push/subscription", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Poolamco-Push-Token": token },
    body: JSON.stringify({ subscription: subscription.toJSON(), alerts: toRemoteAlerts(alerts) }),
    cache: "no-store",
  });
  const data = await response.json().catch(() => null) as { ok?: boolean; states?: PushAlertState[]; error?: string } | null;
  if (!response.ok || !data?.ok) throw new Error(data?.error || "همگام‌سازی Push ناموفق بود.");
  if (Array.isArray(data.states)) await reconcileStates(data.states);
}

async function inspectPush(alerts: MarketAlert[]): Promise<Inspection> {
  if (!supportsPush()) return { status: "unsupported" };
  const config = await pushConfig();
  if (!config.configured) return { status: "unconfigured" };
  if (Notification.permission === "denied") return { status: "denied" };
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return { status: "disabled" };
  await syncSubscription(subscription, alerts);
  return { status: "enabled" };
}

export function useBackgroundPush(alerts: MarketAlert[], runtimeReady = true) {
  const featureEnabled = BACKGROUND_PUSH_EXPERIMENT_ENABLED;
  const [status, setStatus] = useState<BackgroundPushStatus>(featureEnabled ? "checking" : "disabled");
  const [message, setMessage] = useState("");
  const alertsKey = useMemo(() => JSON.stringify(toRemoteAlerts(alerts)), [alerts]);

  const applyInspection = useCallback((result: Inspection) => {
    setStatus(result.status);
    setMessage(result.message ?? "");
  }, []);

  const refresh = useCallback(async () => {
    if (!featureEnabled || !runtimeReady) return;
    try { applyInspection(await inspectPush(alerts)); }
    catch (error) { applyInspection({ status: "error", message: error instanceof Error ? error.message : "اتصال Push برقرار نشد." }); }
  }, [alerts, applyInspection, featureEnabled, runtimeReady]);

  useEffect(() => {
    if (!featureEnabled || !runtimeReady) return;
    let active = true;
    void inspectPush(alerts).then((result) => { if (active) applyInspection(result); }).catch((error) => {
      if (active) applyInspection({ status: "error", message: error instanceof Error ? error.message : "اتصال Push برقرار نشد." });
    });
    return () => { active = false; };
  }, [alerts, alertsKey, applyInspection, featureEnabled, runtimeReady]);

  const enable = useCallback(async () => {
    if (!featureEnabled || !runtimeReady) return;
    setMessage("");
    if (!supportsPush()) { setStatus("unsupported"); return; }
    try {
      const config = await pushConfig();
      if (!config.configured) { setStatus("unconfigured"); return; }
      const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
      if (permission !== "granted") { setStatus("denied"); return; }
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      const subscription = existing ?? await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: publicKeyBytes(config.publicKey) });
      await syncSubscription(subscription, alerts);
      setStatus("enabled");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "فعال‌سازی هشدار پس‌زمینه ناموفق بود.");
    }
  }, [alerts, featureEnabled, runtimeReady]);

  const disable = useCallback(async () => {
    if (!featureEnabled || !runtimeReady) return;
    setMessage("");
    try {
      const token = typeof window !== "undefined" ? deviceToken(false) : "";
      const registration = supportsPush() ? await navigator.serviceWorker.ready : null;
      const subscription = registration ? await registration.pushManager.getSubscription() : null;
      if (token) await fetch("/api/push/subscription", { method: "DELETE", headers: { "X-Poolamco-Push-Token": token }, cache: "no-store" }).catch(() => undefined);
      if (subscription) await subscription.unsubscribe();
      localStorage.removeItem(TOKEN_KEY);
      setStatus("disabled");
    } catch {
      setStatus("error");
      setMessage("غیرفعال‌سازی کامل Push ممکن نشد؛ دوباره تلاش کن.");
    }
  }, [featureEnabled, runtimeReady]);

  return { featureEnabled, status, message, enable, disable, refresh, remoteAlertCount: toRemoteAlerts(alerts).filter((alert) => alert.enabled).length };
}

export type BackgroundPushControls = ReturnType<typeof useBackgroundPush>;
