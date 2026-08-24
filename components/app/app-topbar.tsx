"use client";

import { RiQuestionLine, RiSearch2Line } from "react-icons/ri";
import { MarketRefreshButton, type MarketRefreshControls } from "@/components/app/market-refresh-button";
import { TodayDate } from "@/components/app/today-date";
import { PrivacyToggle } from "@/components/app/privacy-toggle";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ThemeOrigin } from "@/hooks/use-app-theme";

export function AppTopbar({
  market,
  onOpenSearch,
  onStartTour,
  resolvedTheme,
  onToggleTheme,
  hideFinancialData,
}: {
  market?: MarketRefreshControls | null;
  onOpenSearch: () => void;
  onStartTour: () => void;
  resolvedTheme?: string;
  onToggleTheme: (origin?: ThemeOrigin) => void | Promise<void>;
  hideFinancialData: boolean;
}) {
  return (
    <div className="sticky top-0 z-20 -mx-3 mb-4 hidden min-h-16 items-center gap-3 border-b bg-background/88 px-4 py-2 backdrop-blur-xl sm:-mx-5 sm:px-5 md:flex lg:-mx-7 lg:px-7 2xl:-mx-8 2xl:px-8">
      <div className="flex min-w-0 items-center gap-2">
        <TodayDate className="rounded-xl bg-muted/35 px-2.5 py-1.5" />
      </div>

      <button type="button" onClick={onOpenSearch} className="mx-auto flex h-10 w-full max-w-md items-center gap-2 rounded-xl border bg-background/72 px-3 text-muted-foreground transition hover:bg-accent hover:text-foreground" aria-label="جست‌وجوی کلی">
        <RiSearch2Line className="size-4" />
        <span className="flex-1 text-start type-body">جست‌وجوی کلی</span>
        <kbd className="rounded-md bg-muted px-1.5 py-0.5 text-[10px]">⌘K</kbd>
      </button>

      <div className="flex items-center gap-1.5">
        <Tool label="به‌روزرسانی بازار"><MarketRefreshButton market={market} dataTour="market-refresh" className="size-10 border bg-background/72" /></Tool>
        <Tool label={hideFinancialData ? "نمایش اعداد" : "مخفی کردن اعداد"}><PrivacyToggle hidden={hideFinancialData} showLabel={false} className="size-10 px-0" /></Tool>
        <Tool label={resolvedTheme === "dark" ? "حالت روشن" : "حالت تاریک"}><ThemeToggle dataTour="theme-toggle" resolvedTheme={resolvedTheme} onToggle={onToggleTheme} className="size-10 border bg-background/72" /></Tool>
        <Tool label="راهنمای سریع">
          <button type="button" onClick={onStartTour} className="grid size-10 place-items-center rounded-xl border bg-background/72 text-muted-foreground transition hover:bg-accent hover:text-foreground" aria-label="راهنمای سریع"><RiQuestionLine className="size-4" /></button>
        </Tool>
      </div>
    </div>
  );
}

function Tool({ label, children }: { label: string; children: React.ReactElement }) {
  return <Tooltip><TooltipTrigger asChild>{children}</TooltipTrigger><TooltipContent side="bottom">{label}</TooltipContent></Tooltip>;
}
