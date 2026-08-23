import { AppRouteLayout } from "@/components/app/app-route-layout";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <AppRouteLayout>{children}</AppRouteLayout>;
}
