import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CloudflareWebAnalytics } from "@/components/analytics/cloudflare-web-analytics";
import { Providers } from "@/components/providers";
import { SITE_DESCRIPTION, SITE_NAME, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }], apple: "/icon-192.png" },
  category: "finance",
  creator: "Poolamkoo open-source contributors",
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = { themeColor: "#9a6f0a", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className="mesh-bg">
        <Providers>{children}</Providers>
        <CloudflareWebAnalytics />
      </body>
    </html>
  );
}
