import { NextResponse } from "next/server";
import { pushServerConfig } from "@/lib/push/config";
import { runMarketAlertCron } from "@/lib/push/cron";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const config = pushServerConfig();
  if (!config.featureEnabled) return NextResponse.json({ ok: false, error: "Background Push is paused in the public roadmap." }, { status: 404 });
  const secret = config.cronSecret;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ ok: false }, { status: 401 });
  if (!config.configured) return NextResponse.json({ ok: false, error: "Push backend is not configured." }, { status: 503 });
  try {
    const result = await runMarketAlertCron();
    return NextResponse.json({ ok: true, ...result, checkedAt: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Cron failed." }, { status: 502 });
  }
}
