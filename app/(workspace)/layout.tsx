import type { Metadata } from "next";
import { AppRouteLayout } from "@/components/app/app-route-layout";
import { PwaUpdateNotice } from "@/components/system/pwa-update-notice";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  manifest: "/app.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: SITE_NAME },
  robots: { index: false, follow: false },
};

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <><AppRouteLayout>{children}</AppRouteLayout><PwaUpdateNotice /></>;
}
