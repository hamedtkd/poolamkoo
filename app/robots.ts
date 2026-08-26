import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/guide", "/about", "/privacy", "/data-safety", "/security", "/license", "/analytics"],
        disallow: ["/dashboard", "/income", "/funds", "/investments", "/reports", "/settings", "/offline", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
