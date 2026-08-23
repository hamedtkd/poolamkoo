"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { AppRuntimeProvider } from "@/components/app/app-runtime";
import { NewMoneyDialog } from "@/components/new-money-dialog";
import { Onboarding } from "@/components/onboarding";
import { FullAppSkeleton } from "@/components/skeletons/page-skeleton";
import { useAppData } from "@/hooks/use-app-data";
import { useMarket } from "@/hooks/use-market";

export function AppRouteLayout({ children }: { children: React.ReactNode }) {
  const [newMoneyOpen, setNewMoneyOpen] = useState(false);
  const data = useAppData();
  const market = useMarket();

  useEffect(() => {
    const open = () => setNewMoneyOpen(true);
    window.addEventListener("poolyar:new-money", open);
    return () => window.removeEventListener("poolyar:new-money", open);
  }, []);

  if (!data.ready) return <FullAppSkeleton />;
  if (!data.settings.onboardingComplete) return <Onboarding onDone={() => undefined} />;

  return (
    <AppRuntimeProvider value={{ data, market }}>
      <AppShell settings={data.settings} onNewMoney={() => setNewMoneyOpen(true)}>{children}</AppShell>
      <NewMoneyDialog
        open={newMoneyOpen}
        onOpenChange={setNewMoneyOpen}
        settings={data.settings}
        rule={data.rule}
        funds={data.funds}
        assets={data.assets}
        transactions={data.transactions}
        quotes={market.quotes}
      />
    </AppRuntimeProvider>
  );
}
