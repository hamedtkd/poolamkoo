"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { db } from "@/lib/db";

export interface TourStep {
  target: string;
  title: string;
  description: string;
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
  { target: '[data-tour="new-money"]', title: "پول جدید از اینجا شروع می‌شود", description: "هر مبلغ تازه را ثبت کن تا پولم‌کو همان لحظه برای زندگی، امنیت و رشد برنامه پیشنهاد بدهد." },
  { target: '[data-tour="global-search"]', title: "هر چیزی را سریع پیدا کن", description: "با جست‌وجوی کلی یا میانبر Ctrl/⌘ + K بین صفحه‌ها، پول‌های ورودی، صندوق‌ها و دارایی‌ها بگرد." },
  { target: '[data-tour="income"]', title: "برنامه و اجرای هر پول", description: "در پول‌های ورودی می‌بینی برای هر مبلغ چه برنامه‌ای داشتی، چقدرش اجرا شده و کجا از برنامه عقب مانده‌ای." },
  { target: '[data-tour="investments"]', title: "خرید واقعی را اینجا ثبت کن", description: "پیشنهاد سرمایه‌گذاری با خرید واقعی فرق دارد. خرید طلا، دلار یا هر دارایی را اینجا ثبت کن تا سود و زیان واقعی حساب شود." },
  { target: '[data-tour="market-refresh"]', title: "قیمت بازار مشترک است", description: "قیمت‌ها یک‌بار دریافت می‌شوند و همه صفحه‌ها از همان داده استفاده می‌کنند. فقط وقتی لازم بود این دکمه را بزن." },
  { target: '[data-tour="theme-toggle"]', title: "ظاهر را سریع عوض کن", description: "تم روشن و تاریک از همین کنترل تغییر می‌کند و انتخابت روی همین دستگاه ذخیره می‌شود." },
];

const mobileSteps: TourStep[] = [
  { target: '[data-tour="mobile-more"]', title: "میانبرهای اصلی اینجاست", description: "از منوی بیشتر می‌توانی پول جدید ثبت کنی، بازار را تازه کنی، تم را عوض کنی و به تنظیمات بروی." },
  { target: '[data-tour="investments"]', title: "سرمایه‌گذاری و خرید واقعی", description: "خریدهای واقعی و پیشنهادهای انجام‌نشده را از بخش سرمایه دنبال کن." },
  { target: '[data-tour="funds"]', title: "هزینه‌های آینده را جدا نگه دار", description: "برای درمان، هدیه، سفر یا صندوق اضطراری هدف بساز تا هزینه‌های ناگهانی برنامه‌ات را خراب نکنند." },
  { target: '[data-tour="reports"]', title: "آخر ماه نتیجه را ببین", description: "گزارش‌ها نشان می‌دهند چقدر طبق برنامه پیش رفته‌ای و تصمیم‌هایت چه نتیجه‌ای داشته‌اند." },
];

export function useProductTour(guideComplete: boolean) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<TourRect | null>(null);
  const [mobile, setMobile] = useState(false);
  const steps = useMemo(() => mobile ? mobileSteps : desktopSteps, [mobile]);
  const step = steps[Math.min(index, steps.length - 1)];

  const measure = useCallback(() => {
    if (!open || !step) return setRect(null);
    const nodes = [...document.querySelectorAll<HTMLElement>(step.target)];
    const measured = nodes.map((node) => ({ node, rect: node.getBoundingClientRect() }));
    const visible = measured.find(({ rect }) => rect.width > 0 && rect.height > 0);
    if (!visible) return setRect(null);
    const next = visible.rect;
    setRect({ top: next.top, left: next.left, width: next.width, height: next.height, right: next.right, bottom: next.bottom });
  }, [open, step]);

  const start = useCallback(() => {
    setIndex(0);
    setOpen(true);
  }, []);

  const finish = useCallback(() => {
    setOpen(false);
    setRect(null);
    void db.settings.update("settings", { guideComplete: true, updatedAt: new Date().toISOString() });
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const sync = () => setMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const manual = () => start();
    window.addEventListener("poolamco:start-tour", manual);
    return () => window.removeEventListener("poolamco:start-tour", manual);
  }, [start]);

  useEffect(() => {
    if (guideComplete) return;
    const timer = window.setTimeout(start, 850);
    return () => window.clearTimeout(timer);
  }, [guideComplete, start]);

  useEffect(() => {
    if (!open) return;
    measure();
    const update = () => requestAnimationFrame(measure);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [measure, open]);

  useEffect(() => { measure(); }, [index, measure]);

  const next = () => index >= steps.length - 1 ? finish() : setIndex((value) => value + 1);
  const previous = () => setIndex((value) => Math.max(0, value - 1));

  return { open, index, rect, mobile, steps, step, start, finish, next, previous };
}
