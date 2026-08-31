"use client";

import { useRef, type PointerEvent } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
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

export function CinematicLandingHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 88, damping: 24, mass: 0.65 });
  const smoothY = useSpring(pointerY, { stiffness: 88, damping: 24, mass: 0.65 });
  const rotateY = useTransform(smoothX, [-1, 1], [-3.2, 3.2]);
  const rotateX = useTransform(smoothY, [-1, 1], [2.4, -2.4]);

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (reduced || event.pointerType === "touch") return;
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    pointerX.set((x - 0.5) * 2);
    pointerY.set((y - 0.5) * 2);
    sectionRef.current?.style.setProperty("--hero-x", `${Math.round(x * 100)}%`);
    sectionRef.current?.style.setProperty("--hero-y", `${Math.round(y * 100)}%`);
  }

  function resetPointer() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <section
      ref={sectionRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      className="relative isolate overflow-hidden rounded-[30px] border bg-card/55 px-4 py-7 shadow-[0_28px_90px_rgba(0,0,0,.08)] sm:px-7 sm:py-10 lg:min-h-[640px] lg:px-10 lg:py-12"
      style={{ perspective: "1400px" }}
    >
      <div className="cinematic-grid pointer-events-none absolute inset-0 -z-20 opacity-65" aria-hidden="true" />
      <div className="cinematic-grain pointer-events-none absolute inset-0 -z-10 opacity-[.035]" aria-hidden="true" />
      <div className="cinematic-sheen pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
      <div className="landing-orb landing-orb-one" aria-hidden="true" />
      <div className="landing-orb landing-orb-two" aria-hidden="true" />

      <div className="relative grid min-h-[inherit] items-center gap-8 lg:grid-cols-[.94fr_1.06fr] lg:gap-10 xl:gap-12">
        <div className="min-w-0 max-w-[600px]">
          <div className="landing-copy-step landing-copy-step-1 inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur-xl">
            <RiSparkling2Line className="size-4 text-primary" /> برنامه‌ریزی قبل از خرج
          </div>
          <h1 className="landing-copy-step landing-copy-step-2 mt-5 max-w-[18ch] text-[clamp(1.95rem,1.55rem+1.2vw,3.05rem)] font-[780] leading-[1.18] tracking-[-.03em] text-balance">
            پول می‌رسد؛ <span className="text-primary block py-2">قبل از خرج شدن</span> برایش تصمیم بگیر.
          </h1>
          <p className="landing-copy-step landing-copy-step-3 mt-5 max-w-xl text-sm leading-8 text-muted-foreground sm:text-base sm:leading-8">
            هر ورودی را بین زندگی، حاشیه امن و رشد تقسیم کن؛ بعد هم ببین برنامه‌ای که ساختی واقعاً چقدر اجرا شده.
          </p>
          <div className="landing-copy-step landing-copy-step-4 mt-7 flex flex-wrap items-center gap-3">
            <ButtonLink href={APP_ENTRY_PATH} size="lg">شروع رایگان <RiArrowLeftLine className="size-5" /></ButtonLink>
            <a href={COMMUNITY_LINKS.repository} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border bg-background/80 px-5 text-sm font-[590] transition hover:-translate-y-0.5 hover:bg-accent">
              <RiGithubFill className="size-5" /> مشاهده سورس
            </a>
          </div>
          <div className="landing-copy-step landing-copy-step-5 mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
            {trust.map(({ icon: Icon, label }) => <span key={label} className="inline-flex items-center gap-1.5"><Icon className="size-4 text-primary" />{label}</span>)}
          </div>
          <p className="landing-copy-step landing-copy-step-6 mt-5 max-w-xl text-xs leading-6 text-muted-foreground">
            حسابداری روزانه نیست؛ تمرکز پولم‌کو روی تصمیم‌گیری برای پول جدید و پیگیری اجرای همان تصمیم است.
          </p>
        </div>

        <motion.div
          initial={false}
          style={reduced ? undefined : { rotateX, rotateY, transformPerspective: 1100 }}
          className="landing-enter landing-enter-delay min-w-0 will-change-transform"
        >
          <LandingProductVisual />
        </motion.div>
      </div>
    </section>
  );
}
