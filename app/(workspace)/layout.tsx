import type { Metadata } from "next";
import { AppRouteLayout } from "@/components/app/app-route-layout";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <AppRouteLayout>{children}</AppRouteLayout>;
}
