"use client";

import { AllocationRuleCard } from "@/components/settings/allocation-rule-card";
import { AppearanceSettingsCard } from "@/components/settings/appearance-settings-card";
import { BackupSettingsCard } from "@/components/settings/backup-settings-card";
import { FinancialSafetyCard } from "@/components/settings/financial-safety-card";
import { DeviceTransferCard } from "@/components/settings/device-transfer-card";
import { OpenSourceCard } from "@/components/community/open-source-card";
import { InstallPwaCard } from "@/components/settings/install-pwa-card";
import type { AllocationRule, AppSettings } from "@/lib/types";

export function SettingsSection({ settings, rule }: { settings: AppSettings; rule?: AllocationRule }) {
  return (
    <div className="space-y-5">
      <header>
        <div className="type-caption type-body-strong text-primary">تنظیمات</div>
        <h1 className="mt-1 type-page-title">پولم‌کو را برای خودت تنظیم کن</h1>
        <p className="mt-1 type-body text-muted-foreground">واحد پول، ظاهر، قانون تخصیص، ذخیره اضطراری و بکاپ همگی قابل تغییرند.</p>
      </header>
      <div className="grid gap-4 xl:grid-cols-2">
        <AppearanceSettingsCard settings={settings} />
        <AllocationRuleCard rule={rule} />
        <FinancialSafetyCard settings={settings} />
        <BackupSettingsCard />
        <DeviceTransferCard />
        <OpenSourceCard />
      </div>
      <InstallPwaCard />
    </div>
  );
}
