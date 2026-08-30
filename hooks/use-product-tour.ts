"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { db } from "@/lib/db";

export interface TourStep {
  target: string;
  title: string;
  description: string;
  location: string;
}

export interface TourRect {
  top: number;
  left: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
}

const desktopSteps: TourStep[] = [
  { target: '[data-tour="new-money"]', title: "پول جدید از اینجا شروع می‌شود", description: "هر مبلغ تازه را ثبت کن تا پولم‌کو همان لحظه برای زندگی، امنیت و رشد برنامه پیشنهاد بدهد.", location: "سایدبار" },
  { target: '[data-tour="global-search"]', title: "هر چیزی را سریع پیدا کن", description: "با جست‌وجوی کلی یا میانبر Ctrl/⌘ + K بین صفحه‌ها، پول‌های ورودی، صندوق‌ها و دارایی‌ها بگرد.", location: "نوار بالای صفحه" },
  { target: '[data-tour="income"]', title: "برنامه و اجرای هر پول", description: "در پول‌های ورودی می‌بینی برای هر مبلغ چه برنامه‌ای داشتی، چقدرش اجرا شده و کجا از برنامه عقب مانده‌ای.", location: "منوی اصلی" },
  { target: '[data-tour="investments"]', title: "خرید واقعی را اینجا ثبت کن", description: "پیشنهاد سرمایه‌گذاری با خرید واقعی فرق دارد. خرید طلا، دلار یا هر دارایی را اینجا ثبت کن تا سود و زیان واقعی حساب شود.", location: "منوی اصلی" },
  { target: '[data-tour="market-refresh"]', title: "قیمت بازار مشترک است", description: "قیمت‌ها یک‌بار دریافت می‌شوند و همه صفحه‌ها از همان داده استفاده می‌کنند. فقط وقتی لازم بود این دکمه را بزن.", location: "کنترل‌های بالای صفحه" },
  { target: '[data-tour="theme-toggle"]', title: "ظاهر را سریع عوض کن", description: "تم روشن و تاریک از همین کنترل تغییر می‌کند و انتخابت روی همین دستگاه ذخیره می‌شود.", location: "کنترل‌های بالای صفحه" },
];

const mobileSteps: TourStep[] = [
  { target: '[data-tour="mobile-more"]', title: "میانبرهای اصلی اینجاست", description: "از منوی بیشتر می‌توانی پول جدید ثبت کنی، بازار را تازه کنی، تم را عوض کنی و به تنظیمات بروی.", location: "نوار پایین" },
  { target: '[data-tour="investments"]', title: "سرمایه‌گذاری و خرید واقعی", description: "خریدهای واقعی و پیشنهادهای انجام‌نشده را از بخش سرمایه دنبال کن.", location: "نوار پایین" },
  { target: '[data-tour="funds"]', title: "هزینه‌های آینده را جدا نگه دار", description: "برای درمان، هدیه، سفر یا صندوق اضطراری هدف بساز تا هزینه‌های ناگهانی برنامه‌ات را خراب نکنند.", location: "نوار پایین" },
  { target: '[data-tour="global-search"]', title: "جست‌وجو همیشه در دسترس است", description: "از بالای صفحه جست‌وجوی کلی را باز کن و بدون گشتن بین منوها به بخش یا داده موردنظرت برس.", location: "نوار بالای صفحه" },
];

export function useProductTour(guideComplete: boolean) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<TourRect | null>(null);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const mobile = useMediaQuery("(max-width: 767px)");
  const steps = useMemo(() => mobile ? mobileSteps : desktopSteps, [mobile]);
  const step = steps[Math.min(index, steps.length - 1)];

  const measure = useCallback(() => {
    if (!open || !step) return false;
    const target = findRenderableTarget(step.target);
    if (!target) return false;
    const next = target.getBoundingClientRect();
    setTargetElement((current) => current === target ? current : target);
    setRect({ top: next.top, left: next.left, width: next.width, height: next.height, right: next.right, bottom: next.bottom });
    return true;
  }, [open, step]);

  const start = useCallback(() => {
    setIndex(0);
    setRect(null);
    setTargetElement(null);
    setOpen(true);
  }, []);

  const finish = useCallback(() => {
    setOpen(false);
    setRect(null);
    setTargetElement(null);
    void db.settings.update("settings", { guideComplete: true, updatedAt: new Date().toISOString() });
  }, []);

  useEffect(() => {
    const manual = () => start();
    window.addEventListener("poolamkoo:start-tour", manual);
    return () => window.removeEventListener("poolamkoo:start-tour", manual);
  }, [start]);

  useEffect(() => {
    if (guideComplete) return;
    const timer = window.setTimeout(start, 850);
    return () => window.clearTimeout(timer);
  }, [guideComplete, start]);

  useEffect(() => {
    if (!open || !step) return;
    let frame = 0;
    let attempts = 0;
    const resolveTarget = () => {
      if (attempts === 0) {
        setRect(null);
        setTargetElement(null);
      }
      const target = findRenderableTarget(step.target);
      if (!target) {
        attempts += 1;
        if (attempts < 18) frame = window.requestAnimationFrame(resolveTarget);
        return;
      }
      target.scrollIntoView({ block: "nearest", inline: "nearest" });
      frame = window.requestAnimationFrame(() => { measure(); });
    };
    frame = window.requestAnimationFrame(resolveTarget);
    return () => window.cancelAnimationFrame(frame);
  }, [index, measure, open, step]);

  useEffect(() => {
    if (!open || !targetElement || typeof ResizeObserver === "undefined") return;
    let frame = 0;
    const observer = new ResizeObserver(() => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => { measure(); });
    });
    observer.observe(targetElement);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [measure, open, targetElement]);

  useEffect(() => {
    if (!open) return;
    let frame = 0;
    const update = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => { measure(); });
    };
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [measure, open]);

  const next = () => index >= steps.length - 1 ? finish() : setIndex((value) => value + 1);
  const previous = () => setIndex((value) => Math.max(0, value - 1));

  return { open, index, rect, mobile, steps, step, start, finish, next, previous };
}

function findRenderableTarget(selector: string) {
  return [...document.querySelectorAll<HTMLElement>(selector)].find((node) => {
    const bounds = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    return style.display !== "none" && style.visibility !== "hidden" && bounds.width > 0 && bounds.height > 0;
  }) ?? null;
}
