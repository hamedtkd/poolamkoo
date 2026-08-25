import Script from "next/script";
import { cloudflareAnalyticsEnabled, CLOUDFLARE_WEB_ANALYTICS_SRC, normalizeCloudflareAnalyticsToken } from "@/lib/analytics";

export function CloudflareWebAnalytics() {
  const rawToken = process.env.NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN;
  const token = normalizeCloudflareAnalyticsToken(rawToken);
  if (!token || !cloudflareAnalyticsEnabled(rawToken)) return null;

  return <Script
    id="cloudflare-web-analytics"
    src={CLOUDFLARE_WEB_ANALYTICS_SRC}
    type="module"
    strategy="afterInteractive"
    data-cf-beacon={JSON.stringify({ token })}
  />;
}
