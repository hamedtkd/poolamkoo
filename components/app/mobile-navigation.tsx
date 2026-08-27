"use client";

import Link from "next/link";
import {
  RiAddLine,
  RiBarChartBoxLine,
  RiBookOpenLine,
  RiDashboardLine,
  RiInformationLine,
  RiMenu3Line,
  RiQuestionLine,
  RiSearch2Line,
  RiSettings3Line,
  RiShieldCheckLine,
} from "react-icons/ri";
import { isAppNavActive, mobilePrimaryNav } from "@/components/app/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { GithubLink } from "@/components/community/github-link";
import { TodayDate } from "@/components/app/today-date";
import { MarketRefreshButton, type MarketRefreshControls } from "@/components/app/market-refresh-button";
import { PrivacyToggle } from "@/components/app/privacy-toggle";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { ThemeOrigin } from "@/hooks/use-app-theme";
import { cn } from "@/lib/utils";

export function MobileNavigation({ pathname, market, menuOpen, setMenuOpen, onOpenSearch, onNewMoney, onStartTour, resolvedTheme, onToggleTheme, hideFinancialData }: {
  pathname: string;
  market?: MarketRefreshControls | null;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  onOpenSearch: () => void;
  onNewMoney: () => void;
  onStartTour: () => void;
  resolvedTheme?: string;
  onToggleTheme: (origin?: ThemeOrigin) => void | Promise<void>;
  hideFinancialData: boolean;
}) {
  const active = (href: string) => isAppNavActive(pathname, href);

  return (
    <>
      <header className="sticky top-0 z-20 border-b bg-background/92 px-3 py-2 backdrop-blur-xl md:hidden">
        <div className="flex h-11 items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Link href="/dashboard" aria-label="خانه" className="grid size-11 shrink-0 place-items-center rounded-xl border bg-background/72 px-1.5 transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <BrandLogo className="size-8" />
            </Link>
            <TodayDate compact className="rounded-xl bg-muted/35 px-2.5 py-1.5" />
          </div>
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={onOpenSearch} data-tour="global-search" className="grid size-11 place-items-center rounded-xl border bg-background/85 text-muted-foreground shadow-sm transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="جست‌وجوی کلی"><RiSearch2Line className="size-5" /></button>
            <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="grid size-11 place-items-center rounded-xl border bg-background/85 text-foreground shadow-sm transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={menuOpen ? "بستن منوی بیشتر" : "باز کردن منوی بیشتر"} aria-expanded={menuOpen} aria-controls="mobile-navigation-sheet" aria-haspopup="dialog"><RiMenu3Line className="size-5" /></button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} market={market} onNewMoney={onNewMoney} onStartTour={onStartTour} resolvedTheme={resolvedTheme} onToggleTheme={onToggleTheme} hideFinancialData={hideFinancialData} />

      <nav aria-label="ناوبری اصلی موبایل" className="mobile-bottom-nav fixed inset-x-3 z-30 grid min-h-[72px] grid-cols-5 rounded-[24px] p-1 md:hidden">
        {mobilePrimaryNav.map((item) => {
          const Icon = item.icon;
          return <Link key={item.href} href={item.href} data-tour={item.tour} aria-current={active(item.href) ? "page" : undefined} className={cn("relative grid min-h-14 place-items-center content-center gap-0.5 overflow-hidden rounded-[18px] px-1 type-caption text-[10px] transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", active(item.href) ? "text-primary" : "text-muted-foreground")}>{active(item.href) && <span className="absolute inset-0 animate-fade animate-once animate-duration-200 rounded-[18px] bg-primary/12 motion-reduce:animate-none" />}<Icon className="relative z-[1] size-5" /><span className="relative z-[1]">{item.shortLabel}</span></Link>;
        })}
        <button type="button" data-tour="mobile-more" onClick={() => setMenuOpen(true)} aria-expanded={menuOpen} aria-controls="mobile-navigation-sheet" aria-haspopup="dialog" className={cn("grid min-h-14 place-items-center content-center gap-0.5 rounded-[18px] type-caption text-[10px] transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", menuOpen ? "bg-primary/12 text-primary" : "text-muted-foreground")}><RiDashboardLine className="size-5" /><span>بیشتر</span></button>
      </nav>
    </>
  );
}

function MobileMenu({ open, onOpenChange, market, onNewMoney, onStartTour, resolvedTheme, onToggleTheme, hideFinancialData }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  market?: MarketRefreshControls | null;
  onNewMoney: () => void;
  onStartTour: () => void;
  resolvedTheme?: string;
  onToggleTheme: (origin?: ThemeOrigin) => void | Promise<void>;
  hideFinancialData: boolean;
}) {
  const close = () => onOpenChange(false);
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent id="mobile-navigation-sheet" className="px-4 pt-0 md:hidden">
        <div className="mb-4">
          <DrawerTitle className="mb-1 text-start type-card-title">دسترسی سریع</DrawerTitle>
          <DrawerDescription>بخش‌های اصلی پایین صفحه هستند؛ اینجا فقط کارهای تکمیلی را نگه داشته‌ایم. برای بستن، دستگیره را به پایین بکش.</DrawerDescription>
        </div>

        <button type="button" onClick={() => { onNewMoney(); close(); }} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 type-button text-primary-foreground shadow-lg shadow-primary/15 transition active:scale-[.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <RiAddLine className="size-5" />
          <span>پول جدید دارم</span>
        </button>

        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <SecondaryLink href="/reports" icon={<RiBarChartBoxLine />} label="گزارش‌ها" description="مرور تصمیم‌ها" onClick={close} />
          <SecondaryLink href="/settings" icon={<RiSettings3Line />} label="تنظیمات" description="ظاهر، قانون و داده" onClick={close} />
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border bg-muted/30">
          <div className="grid grid-cols-4 divide-x divide-x-reverse divide-border/80" dir="rtl">
            <Utility label="بازار"><MarketRefreshButton market={market} className="size-10 border-0 bg-transparent" /></Utility>
            <Utility label={hideFinancialData ? "نمایش" : "مخفی"}><PrivacyToggle hidden={hideFinancialData} showLabel={false} className="size-10 border-0 bg-transparent px-0" /></Utility>
            <Utility label="تم"><ThemeToggle resolvedTheme={resolvedTheme} onToggle={onToggleTheme} className="size-10 border-0 bg-transparent" /></Utility>
            <Utility label="راهنمای سریع"><button type="button" onClick={() => { close(); window.setTimeout(onStartTour, 120); }} className="grid size-10 place-items-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="راهنمای سریع"><RiQuestionLine className="size-5" /></button></Utility>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t pt-4 type-caption text-muted-foreground">
          <ResourceLink href="/guide" icon={<RiBookOpenLine />} label="راهنما" onClick={close} />
          <ResourceLink href="/privacy" icon={<RiShieldCheckLine />} label="داده‌ها و حریم خصوصی" onClick={close} />
          <ResourceLink href="/about" icon={<RiInformationLine />} label="درباره" onClick={close} />
        </div>
        <GithubLink className="mt-3 w-full" />
      </DrawerContent>
    </Drawer>
  );
}

function SecondaryLink({ href, icon, label, description, onClick }: { href: string; icon: React.ReactNode; label: string; description: string; onClick: () => void }) {
  return <Link href={href} onClick={onClick} className="flex min-h-20 items-center gap-3 rounded-2xl border bg-card/72 p-3 text-start shadow-sm transition active:scale-[.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary [&_svg]:size-5">{icon}</span><span className="min-w-0"><span className="block type-label text-foreground">{label}</span><span className="mt-0.5 block type-caption text-muted-foreground">{description}</span></span></Link>;
}

function Utility({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid min-h-16 place-items-center content-center py-1"><div>{children}</div><span className="type-caption text-[10px] text-muted-foreground">{label}</span></div>;
}

function ResourceLink({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
  return <Link href={href} onClick={onClick} className="inline-flex items-center gap-1.5 transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4">{icon}<span>{label}</span></Link>;
}
