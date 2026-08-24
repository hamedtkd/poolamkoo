"use client";

import { RiBrush2Line } from "react-icons/ri";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SettingsField } from "@/components/settings/settings-field";
import { useAppTheme } from "@/hooks/use-app-theme";
import { db } from "@/lib/db";
import type { AppSettings, ThemePalette } from "@/lib/types";
import { cn } from "@/lib/utils";

const palettes: Array<{ value: ThemePalette; label: string; className: string }> = [
  { value: "amber", label: "طلایی", className: "bg-[#9a6f0a] dark:bg-[#d4a72c]" },
  { value: "rose", label: "رز", className: "bg-rose-500" },
  { value: "violet", label: "بنفش", className: "bg-violet-500" },
  { value: "blue", label: "آبی", className: "bg-blue-500" },
];

export function AppearanceSettingsCard({ settings }: { settings: AppSettings }) {
  const theme = useAppTheme(settings);

  async function updateSettings(patch: Partial<AppSettings>) {
    await db.settings.update("settings", { ...patch, updatedAt: new Date().toISOString() });
  }

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><RiBrush2Line className="text-primary" /> ظاهر و واحد پول</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        <SettingsField label="واحد نمایشی">
          <Select value={settings.displayUnit} onValueChange={(value) => void updateSettings({ displayUnit: value as AppSettings["displayUnit"] })} options={[{ value: "toman", label: "تومان" }, { value: "rial", label: "ریال" }]} />
          <p className="type-caption text-muted-foreground">داده‌ها canonical در تومان ذخیره می‌شوند؛ تغییر واحد فقط نمایش را عوض می‌کند.</p>
        </SettingsField>
        <SettingsField label="حالت نمایش">
          <Select value={settings.darkMode} onValueChange={(value) => void theme.setAppearance(value as AppSettings["darkMode"])} options={[{ value: "system", label: "مطابق سیستم" }, { value: "light", label: "روشن" }, { value: "dark", label: "تاریک" }]} />
        </SettingsField>
        <div className="flex items-center justify-between rounded-2xl border p-3">
          <div><div className="type-strong">حریم نمایش</div><div className="type-caption text-muted-foreground">با آیکون چشم می‌توانی اعداد مالی را در کل برنامه محو کنی.</div></div>
          <Switch checked={settings.hideFinancialData} onCheckedChange={(checked) => void updateSettings({ hideFinancialData: checked })} />
        </div>
        <SettingsField label="رنگ تم">
          <div className="grid grid-cols-4 gap-2">{palettes.map((item) => (
            <button type="button" key={item.value} onClick={() => void theme.setPalette(item.value)} className={cn("rounded-2xl border p-3 text-xs type-strong transition", settings.palette === item.value ? "border-primary ring-2 ring-primary/20" : "hover:bg-muted")}>
              <span className={cn("mx-auto mb-2 block size-6 rounded-full", item.className)} />{item.label}
            </button>
          ))}</div>
        </SettingsField>
      </CardContent>
    </Card>
  );
}
