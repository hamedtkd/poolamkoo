"use client";

import { RiArrowLeftLine, RiArrowRightLine, RiCloseLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { useProductTour, type TourRect } from "@/hooks/use-product-tour";
import { cn } from "@/lib/utils";

const SPOTLIGHT_PAD = 7;

export function ProductTour({ guideComplete }: { guideComplete: boolean }) {
  const tour = useProductTour(guideComplete);
  if (!tour.open || !tour.step) return null;

  const cardStyle = getCardStyle(tour.rect, tour.mobile);
  const focusLabelStyle = getFocusLabelStyle(tour.rect);
  return (
    <div className="fixed inset-0 z-[170]" aria-live="polite">
      <button type="button" className="fixed inset-0 z-[169] cursor-default bg-transparent" aria-label="بستن راهنما" onClick={tour.finish} />
      <TourShade rect={tour.rect} />
      {tour.rect && (
        <>
          <div
            data-tour-spotlight="true"
            className="pointer-events-none fixed z-[171] rounded-[16px] ring-2 ring-primary ring-offset-2 ring-offset-background/70 transition-all duration-200"
            style={spotlightStyle(tour.rect)}
          />
          <div
            data-tour-focus-label="true"
            className="pointer-events-none fixed z-[172] rounded-full border border-primary/30 bg-primary px-2.5 py-1 type-caption text-primary-foreground shadow-lg"
            style={focusLabelStyle}
          >
            این بخش · {tour.step.location}
          </div>
        </>
      )}
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-tour-title"
        className={cn(
          "glass-strong fixed z-[173] w-[min(22rem,calc(100vw-24px))] rounded-[22px] p-4 text-foreground shadow-2xl sm:p-5",
          tour.mobile && "bottom-[92px] left-3 right-3 w-auto",
        )}
        style={tour.mobile ? undefined : cardStyle}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="type-caption text-primary">راهنمای سریع · {formatFa(tour.index + 1)} از {formatFa(tour.steps.length)}</div>
            <div className="mt-1 type-caption text-muted-foreground">در حال نمایش: {tour.step.location}</div>
            <h2 id="product-tour-title" className="mt-1 type-section-title">{tour.step.title}</h2>
          </div>
          <button type="button" onClick={tour.finish} className="grid size-9 shrink-0 place-items-center rounded-xl text-muted-foreground transition hover:bg-accent" aria-label="بستن راهنما"><RiCloseLine className="size-5" /></button>
        </div>
        <p className="mt-3 type-body text-muted-foreground">{tour.step.description}</p>
        {!tour.rect && <p className="mt-3 rounded-xl bg-muted/70 px-3 py-2 type-caption text-muted-foreground">این بخش در اندازه فعلی صفحه دیده نمی‌شود؛ اندازه پنجره را تغییر بده و دوباره راهنما را اجرا کن.</p>}
        <div className="mt-5 flex items-center justify-between gap-3">
          <button type="button" onClick={tour.finish} className="type-caption text-muted-foreground hover:text-foreground">رد کردن راهنما</button>
          <div className="flex gap-2">
            {tour.index > 0 && <Button type="button" variant="outline" size="sm" onClick={tour.previous}><RiArrowRightLine /> قبلی</Button>}
            <Button type="button" size="sm" onClick={tour.next}>{tour.index === tour.steps.length - 1 ? "تمام" : "بعدی"}<RiArrowLeftLine /></Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function TourShade({ rect }: { rect: TourRect | null }) {
  if (!rect) return <div data-tour-shade="fallback" className="pointer-events-none fixed inset-0 z-[170] bg-black/50" />;
  const hole = spotlightBounds(rect);
  const shade = "pointer-events-none fixed z-[170] bg-black/50 dark:bg-black/60";
  return (
    <>
      <div data-tour-shade="top" className={shade} style={{ inset: `0 0 auto 0`, height: hole.top }} />
      <div data-tour-shade="bottom" className={shade} style={{ inset: `${hole.bottom}px 0 0 0` }} />
      <div data-tour-shade="left" className={shade} style={{ top: hole.top, left: 0, width: hole.left, height: hole.height }} />
      <div data-tour-shade="right" className={shade} style={{ top: hole.top, left: hole.right, right: 0, height: hole.height }} />
    </>
  );
}

function spotlightBounds(rect: TourRect) {
  const top = Math.max(0, rect.top - SPOTLIGHT_PAD);
  const left = Math.max(0, rect.left - SPOTLIGHT_PAD);
  const right = Math.min(window.innerWidth, rect.right + SPOTLIGHT_PAD);
  const bottom = Math.min(window.innerHeight, rect.bottom + SPOTLIGHT_PAD);
  return { top, left, right, bottom, width: right - left, height: bottom - top };
}

function spotlightStyle(rect: TourRect): React.CSSProperties {
  const bounds = spotlightBounds(rect);
  return { top: bounds.top, left: bounds.left, width: bounds.width, height: bounds.height };
}

function getFocusLabelStyle(rect: TourRect | null): React.CSSProperties | undefined {
  if (!rect) return undefined;
  const bounds = spotlightBounds(rect);
  const top = bounds.top >= 40 ? bounds.top - 34 : Math.min(window.innerHeight - 32, bounds.bottom + 8);
  const left = Math.max(12, Math.min(bounds.left, window.innerWidth - 170));
  return { top, left };
}

function getCardStyle(rect: TourRect | null, mobile: boolean): React.CSSProperties | undefined {
  if (mobile) return undefined;
  const width = 352;
  if (!rect) return { left: "50%", top: "50%", transform: "translate(-50%, -50%)" };
  const gap = 20;
  const top = Math.max(18, Math.min(rect.top, window.innerHeight - 300));
  const left = rect.left > window.innerWidth / 2
    ? Math.max(18, rect.left - width - gap)
    : Math.min(window.innerWidth - width - 18, rect.right + gap);
  return { left, top };
}

function formatFa(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value);
}
