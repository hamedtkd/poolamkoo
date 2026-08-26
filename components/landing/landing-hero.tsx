import Link from "next/link";
import { RiArrowLeftLine, RiGithubFill, RiLock2Line, RiShieldCheckLine } from "react-icons/ri";
import { LandingDashboardPreview } from "@/components/landing/landing-dashboard-preview";
import { MotionReveal } from "@/components/motion/reveal";
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
    <section className="relative pt-3 sm:pt-8">
      <div className="pointer-events-none absolute inset-x-0 -top-10 -z-10 mx-auto h-[420px] max-w-4xl rounded-full bg-primary/7 blur-3xl" />
      <div className="grid items-center gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:gap-14">
        <MotionReveal className="max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/75 px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
            <span className="size-1.5 rounded-full bg-primary" />
            ابزار مالی شخصی Local-first
          </div>
          <h1 className="mt-5 text-[clamp(2.25rem,1.7rem+2.1vw,4.35rem)] font-[750] leading-[1.18] tracking-[-.04em] text-balance">
            برای پولی که وارد می‌شود، <span className="text-primary">قبل از خرج شدن</span> تصمیم بگیر.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-8 text-muted-foreground sm:text-base sm:leading-9">
            پولم‌کو کمک می‌کند درآمد و پول‌های ورودی را بین نیازهای امروز، صندوق‌های هدف و سرمایه‌گذاری برنامه‌ریزی کنی؛ بدون حساب کاربری و بدون سپردن داده مالی اصلی به یک سرور مرکزی.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <ButtonLink href={APP_ENTRY_PATH} size="lg">
              شروع رایگان
              <RiArrowLeftLine className="size-5" />
            </ButtonLink>
            <a
              href={COMMUNITY_LINKS.repository}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border bg-background/75 px-5 text-sm font-[590] transition hover:bg-accent"
            >
              <RiGithubFill className="size-5" />
              مشاهده سورس
            </a>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
            {trust.map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5">
                <Icon className="size-4 text-primary" />
                {label}
              </span>
            ))}
          </div>
          <p className="mt-5 text-xs leading-6 text-muted-foreground">
            حسابداری روزانه نیست؛ برای تصمیم‌گیری روی پول جدید ساخته شده. <Link href="/guide" className="text-foreground underline decoration-border underline-offset-4 hover:text-primary">گردش کار را ببین</Link>
          </p>
        </MotionReveal>
        <MotionReveal delay={0.06}>
          <LandingDashboardPreview />
        </MotionReveal>
      </div>
    </section>
  );
}
