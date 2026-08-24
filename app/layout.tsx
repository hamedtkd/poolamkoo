import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "پولم‌کو",
  description: "مدیریت پول‌های ورودی، صندوق‌های هدف و سرمایه‌گذاری به‌صورت Local-First",
  applicationName: "پولم‌کو",
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }], apple: "/icon-192.png" },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "پولم‌کو" },
};

export const viewport: Viewport = { themeColor: "#9a6f0a", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className="mesh-bg">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
