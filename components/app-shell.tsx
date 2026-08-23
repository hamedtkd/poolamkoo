"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  RiAddLine,
  RiArchiveStackLine,
  RiBarChartBoxLine,
  RiCloseLine,
  RiDashboardLine,
  RiFundsLine,
  RiHome5Line,
  RiLineChartLine,
  RiMenu3Line,
  RiPieChartLine,
  RiSafe2Line,
  RiSettings3Line,
  RiWallet3Line,
} from "react-icons/ri";
import { MarketRefreshButton } from "@/components/app/market-refresh-button";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { AppSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "خانه", icon: RiHome5Line },
  { href: "/income", label: "پول‌های ورودی", icon: RiWallet3Line },
  { href: "/investments", label: "سرمایه‌گذاری", icon: RiFundsLine },
  { href: "/funds", label: "صندوق‌ها", icon: RiSafe2Line },
  { href: "/reports", label: "گزارش‌ها", icon: RiBarChartBoxLine },
  { href: "/settings", label: "تنظیمات", icon: RiSettings3Line },
];

export function AppShell({ settings, onNewMoney, children }: { settings: AppSettings; onNewMoney: () => void; children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { resolvedTheme, toggleTheme } = useAppTheme(settings);
  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="min-h-svh pb-24 md:pb-0">
      <aside className="fixed inset-y-0 right-0 z-30 hidden w-64 border-l bg-background/82 backdrop-blur-xl md:flex md:flex-col">
        <div className="flex h-20 items-center gap-3 border-b px-5">
          <div className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/15"><RiPieChartLine className="size-6" /></div>
          <div className="min-w-0 flex-1"><div className="text-xl font-black">پولم‌کو</div><div className="text-[10px] text-muted-foreground">تصمیم‌یار مالی شخصی</div></div>
        </div>
        <div className="p-3"><Button className="w-full" onClick={onNewMoney}><RiAddLine className="size-5" /> پول جدید دارم</Button></div>
        <nav className="flex-1 space-y-1 px-3">{nav.map((item) => <NavLink key={item.href} {...item} active={isActive(item.href)} />)}</nav>
        <div className="space-y-2 border-t p-3">
          <div className="grid gap-2">
            <MarketRefreshButton showLabel className="w-full justify-start" />
            <ThemeToggle resolvedTheme={resolvedTheme} onToggle={toggleTheme} showLabel className="w-full justify-start border bg-background/70" />
          </div>
          <div className="rounded-2xl border bg-muted/45 p-3 text-xs text-muted-foreground"><div className="mb-2 flex items-center gap-2 font-semibold text-foreground"><RiArchiveStackLine /> Local-First</div>داده‌های مالی روی دستگاه شما ذخیره می‌شوند.</div>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/72 px-4 backdrop-blur-xl md:hidden">
        <div className="flex items-center gap-2"><div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground"><RiPieChartLine className="size-5" /></div><div className="font-black">پولم‌کو</div></div>
        <button onClick={() => setMenuOpen((value) => !value)} className="grid size-10 place-items-center rounded-xl border bg-background/80" aria-label="منوی بیشتر">{menuOpen ? <RiCloseLine className="size-5" /> : <RiMenu3Line className="size-5" />}</button>
      </header>

      <main className="md:mr-64"><div className="mx-auto w-full max-w-[1920px] p-3 sm:p-5 lg:p-7 2xl:p-8">{children}</div></main>

      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} onNewMoney={onNewMoney} resolvedTheme={resolvedTheme} toggleTheme={toggleTheme} />}

      <nav className="glass fixed inset-x-3 bottom-3 z-30 grid h-[70px] grid-cols-5 rounded-[24px] px-1 pb-[max(0px,env(safe-area-inset-bottom))] md:hidden">
        {[nav[0], nav[2], nav[3], nav[4]].map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} className={cn("grid place-items-center content-center gap-0.5 text-[10px] font-semibold", isActive(item.href) ? "text-primary" : "text-muted-foreground")}><Icon className="size-5" />{item.label.replace("سرمایه‌گذاری", "سرمایه").replace("گزارش‌ها", "گزارش")}</Link>; })}
        <button onClick={() => setMenuOpen((value) => !value)} className={cn("grid place-items-center content-center gap-0.5 text-[10px] font-semibold", menuOpen ? "text-primary" : "text-muted-foreground")}><RiDashboardLine className="size-5" />بیشتر</button>
      </nav>
    </div>
  );
}

function NavLink({ href, label, icon: Icon, active }: { href: string; label: string; icon: typeof RiHome5Line; active: boolean }) {
  return <Link href={href} className={cn("flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition", active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground")}><Icon className="size-5" />{label}</Link>;
}

function MobileMenu({ onClose, onNewMoney, resolvedTheme, toggleTheme }: { onClose: () => void; onNewMoney: () => void; resolvedTheme?: string; toggleTheme: ReturnType<typeof useAppTheme>["toggleTheme"] }) {
  return <><button aria-label="بستن منو" className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[3px] md:hidden" onClick={onClose} /><div className="mobile-glass-panel fixed inset-x-3 bottom-[88px] z-50 rounded-[30px] p-3 md:hidden"><div className="mb-2 flex items-center justify-between px-1"><div><div className="text-sm font-black">میانبرها</div><div className="text-[10px] text-muted-foreground">دسترسی سریع</div></div><button onClick={onClose} className="grid size-9 place-items-center rounded-xl bg-background/55 text-muted-foreground"><RiCloseLine className="size-5" /></button></div><div className="grid grid-cols-2 gap-2"><MenuTile icon={<RiAddLine />} label="پول جدید دارم" onClick={() => { onNewMoney(); onClose(); }} /><MenuLink href="/investments" icon={<RiLineChartLine />} label="سرمایه‌گذاری" onClick={onClose} /></div><div className="mt-2 grid grid-cols-3 gap-2"><MenuLink href="/income" small icon={<RiWallet3Line />} label="ورودی‌ها" onClick={onClose} /><MenuLink href="/funds" small icon={<RiSafe2Line />} label="صندوق‌ها" onClick={onClose} /><MenuLink href="/reports" small icon={<RiBarChartBoxLine />} label="گزارش‌ها" onClick={onClose} /></div><div className="mt-2 grid grid-cols-2 gap-2"><MarketRefreshButton showLabel className="soft-card h-12 w-full border-0 bg-transparent" /><ThemeToggle resolvedTheme={resolvedTheme} onToggle={toggleTheme} showLabel className="soft-card h-12 w-full justify-center border-0 bg-transparent" /></div><div className="mt-2"><MenuLink href="/settings" compact icon={<RiSettings3Line />} label="تنظیمات" onClick={onClose} /></div></div></>;
}

function MenuLink({ href, icon, label, onClick, small, compact }: { href: string; icon: React.ReactNode; label: string; onClick: () => void; small?: boolean; compact?: boolean }) { return <Link href={href} onClick={onClick} className={tileClass(small, compact)}>{icon}<span>{label}</span></Link>; }
function MenuTile({ icon, label, onClick, small, compact }: { icon: React.ReactNode; label: string; onClick: () => void; small?: boolean; compact?: boolean }) { return <button onClick={onClick} className={tileClass(small, compact)}>{icon}<span>{label}</span></button>; }
function tileClass(small?: boolean, compact?: boolean) { return cn("soft-card flex items-center justify-center gap-2 rounded-2xl font-semibold shadow-sm transition active:scale-[.98]", compact ? "min-h-12 px-3 text-xs [&_svg]:size-5" : small ? "min-h-20 flex-col p-3 text-xs [&_svg]:size-6" : "min-h-24 p-4 text-sm [&_svg]:size-7"); }
