"use client";

import Link from "next/link";
import { RiArrowLeftLine, RiBookOpenLine, RiHeart3Line, RiInformationLine, RiLineChartLine, RiShieldCheckLine } from "react-icons/ri";
import { BrandLogo } from "@/components/brand-logo";
import { GithubLink } from "@/components/community/github-link";
import { COMMUNITY_LINKS } from "@/lib/community";
import { APP_ENTRY_PATH } from "@/lib/site";

const publicNav = [
  { href: "/#features", label: "امکانات", icon: RiLineChartLine },
  { href: "/guide", label: "راهنما", icon: RiBookOpenLine },
  { href: "/privacy", label: "سیاست داده", icon: RiShieldCheckLine },
  { href: "/about", label: "درباره", icon: RiInformationLine },
] as const;

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-background">
      <a href="#public-main" className="skip-link">رفتن به محتوای اصلی</a>
      <header className="sticky top-0 z-30 border-b bg-background/88 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 rounded-xl px-1.5 py-1 transition hover:bg-accent" aria-label="صفحه اصلی پولم‌کو">
            <BrandLogo className="size-9" />
            <span className="type-label">پولم‌کو</span>
          </Link>
          <nav className="mx-auto hidden items-center gap-1 md:flex" aria-label="ناوبری عمومی">
            {publicNav.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="flex h-10 items-center gap-2 rounded-xl px-3 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground">
                <Icon />{label}
              </Link>
            ))}
          </nav>
          <div className="ms-auto flex items-center gap-2">
            <GithubLink />
            <Link href={APP_ENTRY_PATH} className="inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-[590] transition hover:bg-accent">
              <span className="hidden sm:inline">باز کردن برنامه</span>
              <span className="sm:hidden">برنامه</span>
              <RiArrowLeftLine />
            </Link>
          </div>
        </div>
      </header>
      <main id="public-main" className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">{children}</main>
      <footer className="border-t">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:grid-cols-[1fr_auto] md:items-center">
          <div><div className="type-strong text-foreground">پولم‌کو رایگان و متن‌باز است.</div><p className="mt-1 leading-6">داده مالی اصلی در مرورگر خودت می‌ماند. برای استفاده جدی، بکاپ منظم را فراموش نکن.</p></div>
          <div className="flex flex-wrap gap-2"><Link href="/privacy" className="rounded-lg px-2 py-1 hover:text-foreground">حریم خصوصی</Link><Link href="/analytics" className="rounded-lg px-2 py-1 hover:text-foreground">Analytics</Link><Link href="/security" className="rounded-lg px-2 py-1 hover:text-foreground">امنیت</Link><Link href="/license" className="rounded-lg px-2 py-1 hover:text-foreground">مجوز</Link><a href={COMMUNITY_LINKS.issues} target="_blank" rel="noreferrer" className="rounded-lg px-2 py-1 hover:text-foreground">گزارش مشکل</a><a href={COMMUNITY_LINKS.support} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg px-2 py-1 hover:text-foreground"><RiHeart3Line /> حمایت اختیاری</a></div>
        </div>
      </footer>
    </div>
  );
}
