"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { BackupReminder } from "@/components/backup/backup-reminder";
import { AppRuntimeProvider } from "@/components/app/app-runtime";
import { NewMoneyDialog } from "@/components/new-money-dialog";
import { Onboarding } from "@/components/onboarding";
import { FullAppSkeleton } from "@/components/skeletons/page-skeleton";
import { useAppData } from "@/hooks/use-app-data";
import { useAppDateFilter } from "@/hooks/use-app-date-filter";
import { useBackgroundPush } from "@/hooks/use-background-push";
import { useBackupSafety } from "@/hooks/use-backup-safety";
import { useMarket } from "@/hooks/use-market";
import { useMarketAlerts } from "@/hooks/use-market-alerts";

export function AppRouteLayout({ children }: { children: React.ReactNode }) {
  const [newMoneyOpen, setNewMoneyOpen] = useState(false);
  const data = useAppData();
  const market = useMarket(data.assets, data.watchlist, data.marketAlerts);
  useMarketAlerts(data.marketAlerts, market.quotes, market.mode, data.settings.displayUnit);
  const backgroundPush = useBackgroundPush(data.marketAlerts);
  const dateFilter = useAppDateFilter(data);
  const backupSafety = useBackupSafety(data);

  useEffect(() => {
    const open = () => setNewMoneyOpen(true);
    window.addEventListener("poolyar:new-money", open);
    return () => window.removeEventListener("poolyar:new-money", open);
  }, []);

  if (!data.ready) return <FullAppSkeleton />;
  if (!data.settings.onboardingComplete) return <Onboarding onDone={() => undefined} />;

  return (
    <AppRuntimeProvider value={{ data, market, dateFilter, backgroundPush, backupSafety }}>
      <AppShell settings={data.settings} market={market} onNewMoney={() => setNewMoneyOpen(true)}>{children}</AppShell>
      <BackupReminder backup={backupSafety} />
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
