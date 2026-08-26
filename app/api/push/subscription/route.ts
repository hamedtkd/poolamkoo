import { NextResponse } from "next/server";
import { pushServerConfig } from "@/lib/push/config";
import { mergeRemoteAlerts, remoteAlertStates } from "@/lib/push/remote-alerts";
import { getPushDevice, removePushDevice, savePushDevice } from "@/lib/push/store";
import { parseRemoteAlerts, parseSubscription, sameOrigin, validDeviceToken } from "@/lib/push/server-validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function token(request: Request) { return request.headers.get("x-poolamkoo-push-token"); }
function json(body: Record<string, unknown>, status = 200) { return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } }); }

export async function POST(request: Request) {
  const config = pushServerConfig();
  if (!config.featureEnabled) return json({ ok: false, error: "Background Push is paused in the public roadmap." }, 404);
  if (!config.configured) return json({ ok: false, error: "Push backend is not configured." }, 503);
  if (!sameOrigin(request) || !validDeviceToken(token(request))) return json({ ok: false, error: "Invalid push request." }, 403);
  const body = await request.json().catch(() => null) as { subscription?: unknown; alerts?: unknown } | null;
  const subscription = parseSubscription(body?.subscription);
  const alerts = parseRemoteAlerts(body?.alerts);
  if (!subscription || !alerts) return json({ ok: false, error: "Invalid push payload." }, 400);

  const deviceToken = token(request) as string;
  const previous = await getPushDevice(deviceToken);
  const merged = mergeRemoteAlerts(alerts, previous?.alerts);
  const now = new Date().toISOString();
  await savePushDevice(deviceToken, { version: 1, subscription, alerts: merged, syncedAt: now });
  return json({ ok: true, syncedAt: now, states: remoteAlertStates(merged) });
}

export async function DELETE(request: Request) {
  const config = pushServerConfig();
  if (!config.featureEnabled) return json({ ok: false, error: "Background Push is paused in the public roadmap." }, 404);
  if (!validDeviceToken(token(request))) return json({ ok: false }, 403);
  await removePushDevice(token(request) as string);
  return json({ ok: true });
}
