"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { AppShell, type AppSection } from "@/components/app-shell";
import { DashboardSection } from "@/components/sections/dashboard";
import { IncomeSection } from "@/components/sections/income";
import { InvestmentsSection } from "@/components/sections/investments";
import { FundsSection } from "@/components/sections/funds";
import { ReportsSection } from "@/components/sections/reports";
import { SettingsSection } from "@/components/sections/settings";
import { NewMoneyDialog } from "@/components/new-money-dialog";
import { Onboarding } from "@/components/onboarding";
import { useAppData } from "@/hooks/use-app-data";
import { useMarket } from "@/hooks/use-market";

export default function HomePage() {
  const [section, setSection] = useState<AppSection>("dashboard");
  const [newMoneyOpen, setNewMoneyOpen] = useState(false);
  const { setTheme } = useTheme();
  const { ready, settings, rule, incomes, allocations, funds, assets, transactions, snapshots } = useAppData();
  const market = useMarket();

  useEffect(() => {
    document.documentElement.dataset.palette = settings.palette;
    setTheme(settings.darkMode);
  }, [settings.palette, settings.darkMode, setTheme]);

  if (!ready) {
    return <div className="grid min-h-svh place-items-center p-6"><div className="glass flex items-center gap-3 rounded-2xl px-5 py-4"><div className="size-3 animate-pulse rounded-full bg-primary"/><div><div className="font-black">پول‌یار</div><div className="text-xs text-muted-foreground">در حال آماده‌سازی داده‌های محلی…</div></div></div></div>;
  }

  if (!settings.onboardingComplete) {
    return <Onboarding onDone={() => setSection("dashboard")} />;
  }

  const content = (() => {
    switch (section) {
      case "income":
        return <IncomeSection incomes={incomes} allocations={allocations} settings={settings} onNewMoney={() => setNewMoneyOpen(true)} />;
      case "investments":
        return <InvestmentsSection settings={settings} assets={assets} transactions={transactions} quotes={market.quotes} snapshots={snapshots} />;
      case "funds":
        return <FundsSection funds={funds} settings={settings} />;
      case "reports":
        return <ReportsSection settings={settings} rule={rule} incomes={incomes} allocations={allocations} funds={funds} assets={assets} transactions={transactions} quotes={market.quotes} />;
      case "settings":
        return <SettingsSection settings={settings} rule={rule} />;
      default:
        return <DashboardSection settings={settings} rule={rule} incomes={incomes} funds={funds} assets={assets} transactions={transactions} quotes={market.quotes} snapshots={snapshots} marketMode={market.mode} marketLoading={market.loading} onRefreshMarket={() => void market.refresh()} onNewMoney={() => setNewMoneyOpen(true)} onOpenInvestments={() => setSection("investments")} onOpenFunds={() => setSection("funds")} />;
    }
  })();

  return (
    <>
      <AppShell section={section} onSection={setSection} settings={settings} onNewMoney={() => setNewMoneyOpen(true)}>{content}</AppShell>
      <NewMoneyDialog open={newMoneyOpen} onOpenChange={setNewMoneyOpen} settings={settings} rule={rule} funds={funds} assets={assets} transactions={transactions} quotes={market.quotes} />
    </>
  );
}
