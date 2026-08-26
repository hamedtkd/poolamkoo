import type { Metadata } from "next";
import { OfflineScreen } from "@/components/system/offline-screen";

export const metadata: Metadata = { title: "آفلاین", robots: { index: false, follow: false } };

export default function OfflinePage() {
  return <OfflineScreen />;
}
