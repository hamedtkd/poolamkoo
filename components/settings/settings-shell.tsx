"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RiSettings3Line } from "react-icons/ri";
import { SettingsSearch } from "@/components/settings/settings-search";
import { getSettingsCategoryForPath, settingsCategories } from "@/components/settings/settings-navigation-model";
import { cn } from "@/lib/utils";

export function SettingsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/settings";
  const current = getSettingsCategoryForPath(pathname);
  const heading = current?.label ?? "تنظیمات";
  const description = current?.description ?? "تنظیمات را بر اساس موضوع پیدا کن؛ لازم نیست بین یک صفحه بلند و شلوغ دنبال گزینه‌ها بگردی.";

  return <div className="space-y-5">
    <header className="space-y-4">
      <div>
        <div className="flex items-center gap-2 type-caption type-body-strong text-primary"><RiSettings3Line /> تنظیمات پولم‌کو</div>
        <h1 className="mt-1 type-page-title">{heading}</h1>
        <p className="mt-1 max-w-3xl type-body leading-7 text-muted-foreground">{description}</p>
      </div>
      <SettingsSearch />
    </header>

    <div className="grid gap-5 lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-start">
      <SettingsCategoryNav pathname={pathname} />
      <main className="min-w-0">{children}</main>
    </div>
  </div>;
}

function SettingsCategoryNav({ pathname }: { pathname: string }) {
  return <aside aria-label="دسته‌بندی تنظیمات" className="min-w-0 lg:sticky lg:top-24">
    <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:block lg:space-y-1 lg:overflow-visible lg:rounded-2xl lg:border lg:bg-card lg:p-2">
      <SettingsNavLink href="/settings" label="همه تنظیمات" active={pathname === "/settings"} icon={<RiSettings3Line className="size-4" />} />
      {settingsCategories.map((category) => {
        const Icon = category.icon;
        return <SettingsNavLink key={category.id} href={category.href} label={category.label} active={pathname === category.href} icon={<Icon className="size-4" />} />;
      })}
    </nav>
  </aside>;
}

function SettingsNavLink({ href, label, active, icon }: { href: string; label: string; active: boolean; icon: React.ReactNode }) {
  return <Link
    href={href}
    aria-current={active ? "page" : undefined}
    className={cn(
      "flex h-10 shrink-0 items-center gap-2 rounded-xl border bg-card px-3 type-label transition hover:bg-accent lg:w-full lg:border-0",
      active ? "border-primary/30 bg-primary/8 text-primary lg:bg-primary/8" : "text-muted-foreground",
    )}
  >
    {icon}<span className="whitespace-nowrap">{label}</span>
  </Link>;
}
