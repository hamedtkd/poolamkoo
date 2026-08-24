"use client";

import { RiArrowLeftLine, RiArrowRightLine, RiCloseLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { useProductTour } from "@/hooks/use-product-tour";
import { cn } from "@/lib/utils";

export function ProductTour({ guideComplete }: { guideComplete: boolean }) {
  const tour = useProductTour(guideComplete);
  if (!tour.open || !tour.step) return null;

  const cardStyle = getCardStyle(tour.rect, tour.mobile);
  return (
    <div className="fixed inset-0 z-[170]" aria-live="polite">
      <button className="absolute inset-0 bg-black/20 backdrop-blur-[1px] dark:bg-black/30" aria-label="بستن راهنما" onClick={tour.finish} />
      {tour.rect && (
        <div
          className="pointer-events-none fixed z-[171] rounded-[16px] ring-2 ring-primary ring-offset-4 ring-offset-background/20 transition-all duration-200"
          style={{
            top: tour.rect.top - 5,
            left: tour.rect.left - 5,
            width: tour.rect.width + 10,
            height: tour.rect.height + 10,
            boxShadow: "0 0 0 9999px rgb(0 0 0 / .52)",
          }}
        />
      )}
      <section
        className={cn(
          "glass-strong fixed z-[172] w-[min(22rem,calc(100vw-24px))] rounded-[22px] p-4 text-foreground sm:p-5",
          tour.mobile && "bottom-[92px] left-3 right-3 w-auto",
        )}
        style={tour.mobile ? undefined : cardStyle}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="type-caption text-primary">راهنمای سریع · {new Intl.NumberFormat("fa-IR").format(tour.index + 1)} از {new Intl.NumberFormat("fa-IR").format(tour.steps.length)}</div>
            <h2 className="mt-1 type-section-title">{tour.step.title}</h2>
          </div>
          <button type="button" onClick={tour.finish} className="grid size-9 shrink-0 place-items-center rounded-xl text-muted-foreground transition hover:bg-accent" aria-label="بستن راهنما"><RiCloseLine className="size-5" /></button>
        </div>
        <p className="mt-3 type-body text-muted-foreground">{tour.step.description}</p>
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

function getCardStyle(rect: ReturnType<typeof useProductTour>["rect"], mobile: boolean): React.CSSProperties | undefined {
  if (mobile) return undefined;
  const width = 352;
  if (!rect) return { left: "50%", top: "50%", transform: "translate(-50%, -50%)" };
  const gap = 18;
  const top = Math.max(18, Math.min(rect.top, window.innerHeight - 270));
  const left = rect.left > window.innerWidth / 2
    ? Math.max(18, rect.left - width - gap)
    : Math.min(window.innerWidth - width - 18, rect.right + gap);
  return { left, top };
}
