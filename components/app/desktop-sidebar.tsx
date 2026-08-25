"use client";

import Link from "next/link";
import { m } from "motion/react";
import { RiAddLine, RiArrowLeftLine, RiArrowRightLine } from "react-icons/ri";
import { appNav } from "@/components/app/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { SidebarCommunity } from "@/components/community/sidebar-community";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function DesktopSidebar({ pathname, collapsed, onToggleCollapsed, onNewMoney }: {
  pathname: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onNewMoney: () => void;
}) {
  const active = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside className={cn(
      "fixed inset-y-0 right-0 z-30 hidden border-l bg-background/92 backdrop-blur-xl transition-[width] duration-300 ease-out md:flex md:flex-col",
      collapsed ? "w-[64px]" : "w-64",
    )}>
      <SidebarHeader collapsed={collapsed} onToggle={onToggleCollapsed} />

      <div className={cn("grid gap-2 border-b p-3", collapsed && "px-2")}>
        <SidebarTip label="پول جدید دارم" enabled={collapsed}>
          <Button data-tour="new-money" className={cn("w-full", collapsed ? "size-11 px-0" : "justify-center")} onClick={onNewMoney} aria-label="پول جدید دارم">
            <RiAddLine className="size-5" /> {!collapsed && <span>پول جدید دارم</span>}
          </Button>
        </SidebarTip>
      </div>

      <nav className={cn("flex-1 space-y-1 overflow-y-auto py-3", collapsed ? "px-2" : "px-3")}>
        {appNav.map((item) => {
          const Icon = item.icon;
          const link = (
            <Link href={item.href} data-tour={item.tour} aria-label={item.label} className={cn("relative flex h-11 items-center overflow-hidden rounded-xl type-label transition-colors", collapsed ? "justify-center px-0" : "gap-3 px-3", active(item.href) ? "text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground")}>
              {active(item.href) && <m.span layoutId="desktop-nav-active" className="absolute inset-0 rounded-xl bg-primary/10" transition={{ type: "spring", stiffness: 440, damping: 36 }} />}
              <Icon className="relative z-[1] size-5 shrink-0" />
              {!collapsed && <span className="relative z-[1] truncate">{item.label}</span>}
            </Link>
          );
          return <SidebarTip key={item.href} label={item.label} enabled={collapsed}>{link}</SidebarTip>;
        })}
      </nav>
      <SidebarCommunity collapsed={collapsed} />
    </aside>
  );
}

function SidebarHeader({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  if (collapsed) {
    return (
      <div className="flex h-16 shrink-0 items-center justify-center border-b px-2">
        <SidebarTip label="باز کردن سایدبار">
          <button
            type="button"
            onClick={onToggle}
            aria-label="باز کردن سایدبار"
            className="group relative grid size-11 place-items-center rounded-2xl border bg-background/72 text-foreground transition hover:bg-accent"
          >
            <BrandLogo className="size-8 transition-all duration-200 group-hover:scale-0 group-hover:opacity-0 group-focus-visible:scale-0 group-focus-visible:opacity-0" />
            <RiArrowLeftLine className="absolute size-5 scale-75 opacity-0 text-muted-foreground transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100" />
          </button>
        </SidebarTip>
      </div>
    );
  }

  return (
    <div className="flex h-16 shrink-0 items-center justify-between border-b px-3">
      <Link href="/" aria-label="رفتن به خانه" className="flex items-center gap-3 rounded-xl px-1.5 py-1 transition hover:bg-accent">
        <BrandLogo className="h-9 w-[38px]" />
        <div className="min-w-0 type-label">پولم‌کو</div>
      </Link>
      <SidebarTip label="بستن سایدبار">
        <button type="button" onClick={onToggle} aria-label="بستن سایدبار" className="grid size-10 place-items-center rounded-xl border bg-background/72 text-muted-foreground transition hover:bg-accent hover:text-foreground">
          <RiArrowRightLine className="size-4" />
        </button>
      </SidebarTip>
    </div>
  );
}

function SidebarTip({ label, enabled = true, children }: { label: string; enabled?: boolean; children: React.ReactElement }) {
  if (!enabled) return children;
  return <Tooltip><TooltipTrigger asChild>{children}</TooltipTrigger><TooltipContent side="left">{label}</TooltipContent></Tooltip>;
}
