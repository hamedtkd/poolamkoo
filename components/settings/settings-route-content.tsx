"use client";

import { useEffect } from "react";
import { useAppRuntime } from "@/components/app/app-runtime";
import { OpenSourceCard } from "@/components/community/open-source-card";
import { AllocationRuleCard } from "@/components/settings/allocation-rule-card";
import { AnalyticsSettingsCard } from "@/components/settings/analytics-settings-card";
import { AppearanceSettingsCard } from "@/components/settings/appearance-settings-card";
import { BackupSettingsCard } from "@/components/settings/backup-settings-card";
import { DataHealthCard } from "@/components/settings/data-health-card";
import { DeviceTransferCard } from "@/components/settings/device-transfer-card";
import { FinancialSafetyCard } from "@/components/settings/financial-safety-card";
import { InstallPwaCard } from "@/components/settings/install-pwa-card";
import { MarketStatusCard } from "@/components/settings/market-status-card";
import type { SettingsCategoryId } from "@/components/settings/settings-navigation-model";

export function SettingsRouteContent({ category }: { category: SettingsCategoryId }) {
  const { data } = useAppRuntime();

  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const frame = requestAnimationFrame(() => {
      const target = document.getElementById(id);
      if (target instanceof HTMLDetailsElement) target.open = true;
      target?.scrollIntoView({ block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [category]);

  return <div className="mx-auto max-w-4xl space-y-4">
    {category === "general" ? <SettingsAnchor id="appearance"><AppearanceSettingsCard settings={data.settings} /></SettingsAnchor> : null}
    {category === "money" ? <><SettingsAnchor id="allocation-rule"><AllocationRuleCard rule={data.rule} /></SettingsAnchor><SettingsAnchor id="financial-safety"><FinancialSafetyCard settings={data.settings} /></SettingsAnchor></> : null}
    {category === "market" ? <SettingsAnchor id="market-status"><MarketStatusCard /></SettingsAnchor> : null}
    {category === "data" ? <><SettingsAnchor id="data-health"><DataHealthCard /></SettingsAnchor><SettingsAnchor id="backup-restore"><BackupSettingsCard /></SettingsAnchor></> : null}
    {category === "transfer" ? <SettingsAnchor id="device-transfer"><DeviceTransferCard /></SettingsAnchor> : null}
    {category === "privacy" ? <><SettingsAnchor id="analytics-privacy"><AnalyticsSettingsCard /></SettingsAnchor><SettingsAnchor id="pwa-install"><InstallPwaCard /></SettingsAnchor></> : null}
    {category === "about" ? <SettingsAnchor id="open-source"><OpenSourceCard /></SettingsAnchor> : null}
  </div>;
}

function SettingsAnchor({ id, children }: { id: string; children: React.ReactNode }) {
  return <section id={id} className="scroll-mt-28 rounded-2xl transition target:ring-2 target:ring-primary/30 target:ring-offset-4 target:ring-offset-background">{children}</section>;
}
