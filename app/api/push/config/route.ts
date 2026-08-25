import { NextResponse } from "next/server";
import { pushServerConfig } from "@/lib/push/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = pushServerConfig();
  return NextResponse.json({
    featureEnabled: config.featureEnabled,
    configured: config.configured,
    publicKey: config.configured ? config.publicKey : undefined,
  }, { headers: { "Cache-Control": "no-store" } });
}
