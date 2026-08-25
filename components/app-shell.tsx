"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AppTopbar } from "@/components/app/app-topbar";
import { DesktopSidebar } from "@/components/app/desktop-sidebar";
import { GlobalSearch } from "@/components/app/global-search";
import type { MarketRefreshControls } from "@/components/app/market-refresh-button";
import { MobileNavigation } from "@/components/app/mobile-navigation";
import { ProductTour } from "@/components/app/product-tour";
import { RouteTransition } from "@/components/motion/reveal";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useSidebarState } from "@/hooks/use-sidebar-state";
import type { AppSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AppShell({ settings, market, onNewMoney, children }: {
  settings: AppSettings;
  market?: MarketRefreshControls | null;
  onNewMoney: () => void;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { resolvedTheme, toggleTheme } = useAppTheme(settings);
  const sidebar = useSidebarState();
  const startTour = () => window.dispatchEvent(new Event("poolamco:start-tour"));

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      } else if (!typing && event.key === "/") {
        event.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className={cn("min-h-svh pb-24 md:pb-0", settings.hideFinancialData && "privacy-hidden")}>
      <DesktopSidebar pathname={pathname} collapsed={sidebar.collapsed} onToggleCollapsed={sidebar.toggle} onNewMoney={onNewMoney} />
      <MobileNavigation
        pathname={pathname}
        market={market}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onOpenSearch={() => setSearchOpen(true)}
        onNewMoney={onNewMoney}
        onStartTour={startTour}
        resolvedTheme={resolvedTheme}
        onToggleTheme={toggleTheme}
        hideFinancialData={settings.hideFinancialData}
      />

      <main className={cn("transition-[margin] duration-300 ease-out", sidebar.collapsed ? "md:mr-[64px]" : "md:mr-64")}>
        <div className="mx-auto w-full max-w-[1920px] p-3 sm:p-5 lg:p-7 2xl:p-8">
          <AppTopbar market={market} onOpenSearch={() => setSearchOpen(true)} onStartTour={startTour} resolvedTheme={resolvedTheme} onToggleTheme={toggleTheme} hideFinancialData={settings.hideFinancialData} />
          <RouteTransition routeKey={pathname}>{children}</RouteTransition>
        </div>
      </main>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} onNewMoney={onNewMoney} />
      <ProductTour guideComplete={settings.guideComplete} />
    </div>
  );
}
