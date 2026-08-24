"use client";

import { Controller } from "react-hook-form";
import {
  RiArchiveLine, RiBrush2Line, RiDownloadCloud2Line, RiInstallLine, RiLockPasswordLine,
  RiRefreshLine, RiShieldKeyholeLine, RiUploadCloud2Line, RiWallet3Line,
} from "react-icons/ri";
import { useSettingsManager } from "@/hooks/use-settings-manager";
import type { AllocationRule, AppSettings, ThemePalette } from "@/lib/types";
import { formatMoney, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/ui/money-input";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

const palettes: Array<{ value: ThemePalette; label: string; className: string }> = [
  { value: "amber", label: "طلایی", className: "bg-[#9a6f0a] dark:bg-[#d4a72c]" },
  { value: "rose", label: "رز", className: "bg-rose-500" },
  { value: "violet", label: "بنفش", className: "bg-violet-500" },
  { value: "blue", label: "آبی", className: "bg-blue-500" },
];

export function SettingsSection({ settings, rule }: { settings: AppSettings; rule?: AllocationRule }) {
  const manager = useSettingsManager(settings, rule);
  const values = manager.allocation.watch();
  const total = values.life + values.safety + values.growth;
  const allocationError = manager.allocation.formState.errors.growth?.message;

  return (
    <div className="space-y-5">
      <header><div className="type-caption type-body-strong text-primary">تنظیمات</div><h1 className="mt-1 type-page-title">پولم‌کو را برای خودت تنظیم کن</h1><p className="mt-1 type-body text-muted-foreground">واحد پول، ظاهر، قانون تخصیص، ذخیره اضطراری و بکاپ همگی قابل تغییرند.</p></header>
      {manager.message && <div className="rounded-2xl border border-primary/20 bg-primary/7 px-4 py-3 type-label text-primary">{manager.message}</div>}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><RiBrush2Line className="text-primary" /> ظاهر و واحد پول</CardTitle></CardHeader><CardContent className="space-y-5">
          <SettingField label="واحد نمایشی"><Select value={settings.displayUnit} onValueChange={(value) => void manager.updateSettings({ displayUnit: value as AppSettings["displayUnit"] })} options={[{ value: "toman", label: "تومان" }, { value: "rial", label: "ریال" }]} /><p className="type-caption text-muted-foreground">داده‌ها canonical در تومان ذخیره می‌شوند؛ تغییر واحد فقط نمایش را عوض می‌کند.</p></SettingField>
          <SettingField label="حالت نمایش"><Select value={settings.darkMode} onValueChange={(value) => void manager.theme.setAppearance(value as AppSettings["darkMode"])} options={[{ value: "system", label: "مطابق سیستم" }, { value: "light", label: "روشن" }, { value: "dark", label: "تاریک" }]} /></SettingField>
          <div className="flex items-center justify-between rounded-2xl border p-3"><div><div className="type-strong">حریم نمایش</div><div className="type-caption text-muted-foreground">با آیکون چشم می‌توانی اعداد مالی را در کل برنامه محو کنی.</div></div><Switch checked={settings.hideFinancialData} onCheckedChange={(checked) => void manager.updateSettings({ hideFinancialData: checked })} /></div>
          <SettingField label="رنگ تم"><div className="grid grid-cols-4 gap-2">{palettes.map((item) => <button type="button" key={item.value} onClick={() => void manager.theme.setPalette(item.value)} className={cn("rounded-2xl border p-3 text-xs type-strong transition", settings.palette === item.value ? "border-primary ring-2 ring-primary/20" : "hover:bg-muted")}><span className={cn("mx-auto mb-2 block size-6 rounded-full", item.className)} />{item.label}</button>)}</div></SettingField>
        </CardContent></Card>

        <Card><CardHeader><CardTitle className="flex items-center gap-2"><RiWallet3Line className="text-primary" /> قانون پول من</CardTitle></CardHeader><CardContent>
          <form onSubmit={manager.saveRule} className="space-y-5">
            <Controller name="life" control={manager.allocation.control} render={({ field }) => <AllocationSlider label="زندگی" value={field.value} onChange={field.onChange} />} />
            <Controller name="safety" control={manager.allocation.control} render={({ field }) => <AllocationSlider label="امنیت" value={field.value} onChange={field.onChange} />} />
            <Controller name="growth" control={manager.allocation.control} render={({ field }) => <AllocationSlider label="رشد" value={field.value} onChange={field.onChange} />} />
            <div className={cn("flex items-center justify-between rounded-xl px-3 py-2 text-sm type-strong", Math.round(total) === 100 ? "bg-primary/8 text-primary" : "bg-destructive/10 text-destructive")}><span>مجموع</span><span>{formatPercent(total, 0)}</span></div>
            {allocationError && <p className="text-xs text-destructive">{allocationError}</p>}
            <Button type="submit" className="w-full">ذخیره قانون تخصیص</Button>
          </form>
        </CardContent></Card>

        <Card><CardHeader><CardTitle className="flex items-center gap-2"><RiShieldKeyholeLine className="text-primary" /> امنیت مالی و سبک درآمد</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2"><SettingField label="ثبات درآمد"><Select value={settings.incomeStability} onValueChange={(value) => void manager.updateSettings({ incomeStability: value as AppSettings["incomeStability"] })} options={[{ value: "stable", label: "ثابت" }, { value: "variable", label: "متغیر" }, { value: "irregular", label: "نامنظم" }]} /></SettingField><SettingField label="تحمل نوسان"><Select value={settings.riskTolerance} onValueChange={(value) => void manager.updateSettings({ riskTolerance: value as AppSettings["riskTolerance"] })} options={[{ value: "low", label: "کم" }, { value: "medium", label: "متوسط" }, { value: "high", label: "زیاد" }]} /></SettingField></div>
          <form onSubmit={manager.saveEmergencyPlan} className="space-y-4">
            <Controller name="monthlyEssentialToman" control={manager.emergency.control} render={({ field, fieldState }) => <SettingField label="هزینه ضروری ماهانه"><MoneyInput value={field.value ?? null} onValueChange={field.onChange} unit={settings.displayUnit} invalid={Boolean(fieldState.error)} />{fieldState.error && <p className="text-xs text-destructive">{fieldState.error.message}</p>}</SettingField>} />
            <Controller name="emergencyMonths" control={manager.emergency.control} render={({ field, fieldState }) => <SettingField label={`هدف ذخیره اضطراری: ${new Intl.NumberFormat("fa-IR").format(field.value)} ماه`}><Slider min={1} max={12} step={1} value={[field.value]} onValueChange={([value]) => field.onChange(value)} />{fieldState.error && <p className="text-xs text-destructive">{fieldState.error.message}</p>}</SettingField>} />
            <div className="rounded-2xl bg-muted/60 p-3 text-sm"><div className="type-caption text-muted-foreground">هدف تقریبی صندوق اضطراری</div><div className="mt-1 type-strong">{formatMoney(manager.emergency.watch("monthlyEssentialToman") * manager.emergency.watch("emergencyMonths"), settings.displayUnit)}</div></div>
            <Button type="submit" className="w-full">ذخیره برنامه امنیت مالی</Button>
          </form>
          <Button variant="outline" onClick={() => void manager.resetOnboarding()}><RiRefreshLine /> اجرای دوباره آنبوردینگ</Button>
        </CardContent></Card>

        <Card><CardHeader><CardTitle className="flex items-center gap-2"><RiArchiveLine className="text-primary" /> بکاپ و بازیابی</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border p-3"><div><div className="type-strong">رمزنگاری بکاپ</div><div className="type-caption text-muted-foreground">AES-GCM با کلید ساخته‌شده از رمز شما</div></div><Switch checked={manager.encryptBackup} onCheckedChange={manager.setEncryptBackup} /></div>
          <SettingField label="رمز بکاپ"><div className="relative"><RiLockPasswordLine className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input className="pe-9" type="password" autoComplete="new-password" value={manager.backupPassword} onChange={(event) => manager.setBackupPassword(event.target.value)} placeholder={manager.encryptBackup ? "حداقل ۶ کاراکتر" : "برای بازیابی بکاپ رمزدار"} /></div></SettingField>
          <div className="grid gap-2 sm:grid-cols-2"><Button onClick={() => void manager.downloadBackup()}><RiDownloadCloud2Line /> دریافت بکاپ</Button><Button variant="outline" onClick={() => manager.fileRef.current?.click()}><RiUploadCloud2Line /> بازیابی فایل</Button></div>
          <input ref={manager.fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(event) => void manager.restoreBackup(event.target.files?.[0])} />
          <p className="text-xs leading-6 text-muted-foreground">اطلاعات مالی در IndexedDB همین دستگاه است. پاک‌کردن داده مرورگر ممکن است اطلاعات محلی را حذف کند.</p>
        </CardContent></Card>
      </div>

      <Card><CardContent className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center"><div><div className="flex items-center gap-2 type-strong"><RiInstallLine className="text-primary" /> نصب PWA</div><p className="mt-1 type-body text-muted-foreground">پولم‌کو را روی Home Screen نصب کن تا مثل اپ مستقل اجرا شود.</p></div><Button variant="outline" onClick={() => void manager.installPwa()}>نصب روی دستگاه</Button></CardContent></Card>
    </div>
  );
}

function SettingField({ label, children }: { label: string; children: React.ReactNode }) { return <div className="grid gap-2"><Label>{label}</Label>{children}</div>; }
function AllocationSlider({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) { return <div className="space-y-2"><div className="flex items-center justify-between"><Label>{label}</Label><span className="text-sm type-strong text-primary">{formatPercent(value, 0)}</span></div><Slider min={0} max={100} step={5} value={[value]} onValueChange={([next]) => onChange(next)} /></div>; }
