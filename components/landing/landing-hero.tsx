import Link from "next/link";
import { RiArrowLeftLine, RiGithubFill, RiLock2Line, RiShieldCheckLine, RiSparkling2Line } from "react-icons/ri";
import { LandingProductVisual } from "@/components/landing/landing-product-visual";
import { ButtonLink } from "@/components/landing/landing-link-button";
import { COMMUNITY_LINKS } from "@/lib/community";
import { APP_ENTRY_PATH } from "@/lib/site";

const trust = [
  { icon: RiShieldCheckLine, label: "بدون ثبت‌نام" },
  { icon: RiLock2Line, label: "داده مالی روی دستگاه شما" },
  { icon: RiGithubFill, label: "رایگان و متن‌باز" },
] as const;

export function LandingHero() {
  return (
    <section className="relative isolate overflow-hidden rounded-[34px] border bg-card/45 px-4 py-7 shadow-[0_28px_90px_rgba(0,0,0,.06)] sm:px-7 sm:py-10 lg:px-10 lg:py-12">
      <div className="landing-orb landing-orb-one" aria-hidden="true" />
      <div className="landing-orb landing-orb-two" aria-hidden="true" />
      <div className="relative grid items-center gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-10 xl:gap-14">
        <div className="landing-enter min-w-0 max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur">
            <RiSparkling2Line className="size-4 text-primary" />
            برنامه‌ریزی مالی Local-first
          </div>
          <h1 className="mt-5 text-[clamp(2.4rem,1.9rem+2.25vw,4.6rem)] font-[780] leading-[1.13] tracking-[-.045em] text-balance">
            پول جدید که می‌رسد، <span className="text-primary">قبل از خرج شدن</span> برایش تصمیم بگیر.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-8 text-muted-foreground sm:text-base sm:leading-9">
            پولم‌کو پول‌های ورودی را بین زندگی، امنیت، رشد، صندوق‌های هدف و سرمایه‌گذاری قابل‌پیگیری می‌کند؛ بدون حساب کاربری و بدون سپردن داده مالی اصلی به یک سرور مرکزی.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <ButtonLink href={APP_ENTRY_PATH} size="lg">شروع رایگان <RiArrowLeftLine className="size-5" /></ButtonLink>
            <a href={COMMUNITY_LINKS.repository} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border bg-background/80 px-5 text-sm font-[590] transition hover:-translate-y-0.5 hover:bg-accent">
              <RiGithubFill className="size-5" /> مشاهده سورس
            </a>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
            {trust.map(({ icon: Icon, label }) => <span key={label} className="inline-flex items-center gap-1.5"><Icon className="size-4 text-primary" />{label}</span>)}
          </div>
          <p className="mt-5 text-xs leading-6 text-muted-foreground">
            حسابداری روزانه نیست؛ برای تصمیم‌گیری روی پول جدید ساخته شده. <Link href="/guide" className="text-foreground underline decoration-border underline-offset-4 hover:text-primary">گردش کار را ببین</Link>
          </p>
        </div>
        <div className="landing-enter landing-enter-delay min-w-0">
          <LandingProductVisual />
        </div>
      </div>
    </section>
  );
}
