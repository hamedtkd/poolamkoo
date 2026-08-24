"use client";

import Link from "next/link";
import {
  RiAddLine,
  RiBarChartBoxLine,
  RiDashboardLine,
  RiLineChartLine,
  RiMenu3Line,
  RiQuestionLine,
  RiSafe2Line,
  RiSearch2Line,
  RiSettings3Line,
  RiWallet3Line,
} from "react-icons/ri";
import { appNav } from "@/components/app/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { TodayDate } from "@/components/app/today-date";
import { MarketRefreshButton, type MarketRefreshControls } from "@/components/app/market-refresh-button";
import { PrivacyToggle } from "@/components/app/privacy-toggle";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
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
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const visible = [appNav[0], appNav[2], appNav[3], appNav[4]];

  return (
    <>
      <header className="sticky top-0 z-20 border-b bg-background/92 px-3 py-2 backdrop-blur-xl md:hidden">
        <div className="flex h-11 items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Link href="/" aria-label="خانه" className="grid size-10 shrink-0 place-items-center rounded-xl border bg-background/72 px-1.5 transition active:scale-95">
              <BrandLogo className="size-8" />
            </Link>
            <TodayDate compact className="rounded-xl bg-muted/35 px-2.5 py-1.5" />
          </div>
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={onOpenSearch} data-tour="global-search" className="grid size-10 place-items-center rounded-xl border bg-background/85 text-muted-foreground shadow-sm transition active:scale-95" aria-label="جست‌وجوی کلی"><RiSearch2Line className="size-5" /></button>
            <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="grid size-10 place-items-center rounded-xl border bg-background/85 text-foreground shadow-sm transition active:scale-95" aria-label="باز کردن سایدبار"><RiMenu3Line className="size-5" /></button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} market={market} onNewMoney={onNewMoney} onStartTour={onStartTour} resolvedTheme={resolvedTheme} onToggleTheme={onToggleTheme} hideFinancialData={hideFinancialData} />

      <nav className="mobile-bottom-nav fixed inset-x-3 bottom-3 z-30 grid h-[72px] grid-cols-5 rounded-[24px] p-1 pb-[max(.25rem,env(safe-area-inset-bottom))] md:hidden">
        {visible.map((item) => {
          const Icon = item.icon;
          return <Link key={item.href} href={item.href} data-tour={item.tour} className={cn("grid place-items-center content-center gap-0.5 rounded-[18px] px-1 type-caption text-[10px] transition active:scale-95", active(item.href) ? "bg-primary/12 text-primary" : "text-muted-foreground")}><Icon className="size-5" />{item.shortLabel}</Link>;
        })}
        <button type="button" data-tour="mobile-more" onClick={() => setMenuOpen(true)} className={cn("grid place-items-center content-center gap-0.5 rounded-[18px] type-caption text-[10px] transition active:scale-95", menuOpen ? "bg-primary/12 text-primary" : "text-muted-foreground")}><RiDashboardLine className="size-5" />بیشتر</button>
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
      <DrawerContent className="px-4 pt-1 md:hidden">
        <DrawerTitle className="mb-0 text-start type-card-title">دسترسی سریع</DrawerTitle>
        <p className="mb-4 type-caption text-muted-foreground">برای بستن، دستگیره بالا را به پایین بکش.</p>
        <div className="grid grid-cols-2 gap-2.5">
          <MenuTile primary icon={<RiAddLine />} label="پول جدید دارم" onClick={() => { onNewMoney(); close(); }} />
          <MenuLink href="/investments" icon={<RiLineChartLine />} label="سرمایه‌گذاری" onClick={close} />
        </div>
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          <MenuLink href="/income" compact icon={<RiWallet3Line />} label="ورودی‌ها" onClick={close} />
          <MenuLink href="/funds" compact icon={<RiSafe2Line />} label="صندوق‌ها" onClick={close} />
          <MenuLink href="/reports" compact icon={<RiBarChartBoxLine />} label="گزارش‌ها" onClick={close} />
        </div>
        <div className="my-3 h-px bg-border/80" />
        <div className="grid grid-cols-4 gap-2">
          <CompactUtility label="بازار"><MarketRefreshButton market={market} className="size-11 border-0 bg-transparent" /></CompactUtility>
          <CompactUtility label={hideFinancialData ? "نمایش" : "مخفی"}><PrivacyToggle hidden={hideFinancialData} showLabel={false} className="size-11 border-0 bg-transparent px-0" /></CompactUtility>
          <CompactUtility label="تم"><ThemeToggle resolvedTheme={resolvedTheme} onToggle={onToggleTheme} className="size-11 border-0 bg-transparent" /></CompactUtility>
          <CompactUtility label="راهنما"><button type="button" onClick={() => { close(); window.setTimeout(onStartTour, 120); }} className="grid size-11 place-items-center rounded-xl" aria-label="راهنمای سریع"><RiQuestionLine className="size-5" /></button></CompactUtility>
        </div>
        <div className="mt-3"><MenuLink href="/settings" utility icon={<RiSettings3Line />} label="تنظیمات" onClick={close} /></div>
      </DrawerContent>
    </Drawer>
  );
}

function CompactUtility({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid min-h-16 place-items-center content-center rounded-2xl border bg-muted/48 text-foreground"><div>{children}</div><span className="type-caption text-[10px] text-muted-foreground">{label}</span></div>;
}
function MenuLink({ href, icon, label, onClick, compact, utility }: { href: string; icon: React.ReactNode; label: string; onClick: () => void; compact?: boolean; utility?: boolean }) {
  return <Link href={href} onClick={onClick} className={tileClass({ compact, utility })}>{icon}<span>{label}</span></Link>;
}
function MenuTile({ icon, label, onClick, primary }: { icon: React.ReactNode; label: string; onClick: () => void; primary?: boolean }) {
  return <button type="button" onClick={onClick} className={tileClass({ primary })}>{icon}<span>{label}</span></button>;
}
function tileClass({ primary, compact, utility }: { primary?: boolean; compact?: boolean; utility?: boolean }) {
  return cn("flex items-center justify-center rounded-2xl border type-label transition active:scale-[.985] [&_svg]:shrink-0", primary ? "min-h-20 gap-2 bg-primary px-4 text-primary-foreground shadow-lg shadow-primary/15 [&_svg]:size-6" : utility ? "min-h-12 gap-2 bg-background/70 px-3 text-foreground [&_svg]:size-5" : compact ? "min-h-16 flex-col gap-1.5 bg-muted/52 p-2 text-xs text-foreground [&_svg]:size-5" : "min-h-20 gap-2 bg-card/92 px-4 text-foreground shadow-sm [&_svg]:size-6");
}
