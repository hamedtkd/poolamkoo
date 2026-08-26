"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { BackupReminder } from "@/components/backup/backup-reminder";
import { SupportPrompt } from "@/components/community/support-prompt";
import { AppRuntimeProvider } from "@/components/app/app-runtime";
import { NewMoneyDialog } from "@/components/new-money-dialog";
import { Onboarding } from "@/components/onboarding";
import { FullAppSkeleton } from "@/components/skeletons/page-skeleton";
import { LocalDataUnavailable } from "@/components/system/local-data-unavailable";
import { useAppData } from "@/hooks/use-app-data";
import { useAppDateFilter } from "@/hooks/use-app-date-filter";
import { useBackgroundPush } from "@/hooks/use-background-push";
import { useBackupSafety } from "@/hooks/use-backup-safety";
import { useCommunitySupport } from "@/hooks/use-community-support";
import { useMarket } from "@/hooks/use-market";
import { useMarketAlerts } from "@/hooks/use-market-alerts";

export function AppRouteLayout({ children }: { children: React.ReactNode }) {
  const [newMoneyOpen, setNewMoneyOpen] = useState(false);
  const data = useAppData();
  const market = useMarket(data.assets, data.watchlist, data.marketAlerts, data.ready);
  useMarketAlerts(data.marketAlerts, market.quotes, market.mode, data.settings.displayUnit);
  const backgroundPush = useBackgroundPush(data.marketAlerts, data.ready);
  const dateFilter = useAppDateFilter(data);
  const backupSafety = useBackupSafety(data, data.ready);
  const communitySupport = useCommunitySupport(data.ready && data.settings.onboardingComplete);

  useEffect(() => {
    const open = () => setNewMoneyOpen(true);
    window.addEventListener("poolyar:new-money", open);
    return () => window.removeEventListener("poolyar:new-money", open);
  }, []);

  useEffect(() => {
    if (data.ready && navigator.storage?.persist) navigator.storage.persist().catch(() => undefined);
  }, [data.ready]);

  if (data.bootstrapError) return <LocalDataUnavailable error={data.bootstrapError} onRetry={data.retryBootstrap} />;
  if (!data.ready) return <FullAppSkeleton />;
  if (!data.settings.onboardingComplete) return <Onboarding onDone={() => undefined} />;

  return (
    <AppRuntimeProvider value={{ data, market, dateFilter, backgroundPush, backupSafety }}>
      <AppShell settings={data.settings} market={market} onNewMoney={() => setNewMoneyOpen(true)}>{children}</AppShell>
      <BackupReminder backup={backupSafety} />
      <SupportPrompt support={communitySupport} />
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
