"use client";

import { useMemo, useRef, useState } from "react";
import { RiAddLine, RiCheckLine, RiPaletteLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { useAppTheme } from "@/hooks/use-app-theme";
import {
  DEFAULT_CUSTOM_THEME_COLOR,
  hexToHsv,
  hsvToHex,
  normalizeHexColor,
  normalizeSavedThemeColors,
  type HsvColor,
} from "@/lib/theme-color";
import type { AppSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

type ThemeController = ReturnType<typeof useAppTheme>;

export function CustomThemeColorDialog({
  open,
  onOpenChange,
  settings,
  theme,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: AppSettings;
  theme: ThemeController;
}) {
  const initial = settings.customThemeColor || DEFAULT_CUSTOM_THEME_COLOR;
  const [hsv, setHsv] = useState<HsvColor>(() => hexToHsv(initial));
  const [hexDraft, setHexDraft] = useState(initial);
  const [saved, setSaved] = useState<string[]>(() => normalizeSavedThemeColors(settings.savedThemeColors));
  const committed = useRef(false);
  const hex = useMemo(() => hsvToHex(hsv), [hsv]);

  function preview(next: HsvColor) {
    setHsv(next);
    const nextHex = hsvToHex(next);
    setHexDraft(nextHex);
    theme.previewCustomColor(nextHex);
  }

  function setHex(value: string) {
    setHexDraft(value);
    const normalized = normalizeHexColor(value);
    if (normalized) preview(hexToHsv(normalized));
  }

  function chooseColor(color: string) {
    const normalized = normalizeHexColor(color);
    if (normalized) preview(hexToHsv(normalized));
  }

  function close(nextOpen: boolean) {
    if (!nextOpen && !committed.current) theme.restorePalette();
    onOpenChange(nextOpen);
  }

  async function apply() {
    committed.current = true;
    await theme.setCustomPalette(hex, saved);
    onOpenChange(false);
  }

  function addSavedColor() {
    setSaved((current) => normalizeSavedThemeColors([hex, ...current]));
  }

  return <Dialog open={open} onOpenChange={close}>
    <DialogContent className="sm:w-[min(100%,31rem)] sm:p-5">
      <DialogHeader className="mb-4">
        <DialogTitle className="flex items-center gap-2"><RiPaletteLine className="text-primary" /> رنگ سفارشی</DialogTitle>
        <DialogDescription>رنگ اصلی رابط را بساز. پیش‌نمایش زنده است و تا «اعمال رنگ» نزنی ذخیره نمی‌شود.</DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <SaturationValueField value={hsv} onChange={preview} />

        <label className="block space-y-2">
          <span className="type-caption type-body-strong">Hue</span>
          <input
            aria-label="Hue رنگ تم"
            type="range"
            min={0}
            max={359}
            value={Math.round(hsv.h)}
            onChange={(event) => preview({ ...hsv, h: Number(event.target.value) })}
            className="theme-hue-range block h-4 w-full cursor-pointer appearance-none rounded-full"
            style={{ background: "linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)" }}
          />
        </label>

        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_7.5rem]">
          <label className="space-y-1.5">
            <span className="type-caption type-body-strong">Hex</span>
            <Input dir="ltr" value={hexDraft} onChange={(event) => setHex(event.target.value)} onBlur={() => setHexDraft(hex)} className="font-mono uppercase" aria-invalid={!normalizeHexColor(hexDraft)} />
          </label>
          <label className="space-y-1.5">
            <span className="type-caption type-body-strong">انتخاب سیستم</span>
            <span className="flex h-10 items-center gap-2 rounded-lg border bg-background px-2">
              <input aria-label="انتخاب رنگ از سیستم" type="color" value={hex} onChange={(event) => chooseColor(event.target.value)} className="size-7 cursor-pointer rounded-md border-0 bg-transparent p-0" />
              <span dir="ltr" className="type-caption font-mono">{hex.toUpperCase()}</span>
            </span>
          </label>
        </div>

        <div className="rounded-2xl border bg-muted/35 p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div><div className="type-label">رنگ‌های من</div><div className="type-caption text-muted-foreground">حداکثر ۸ رنگ روی همین دستگاه نگه داشته می‌شود.</div></div>
            <Button type="button" size="sm" variant="outline" onClick={addSavedColor} disabled={saved.includes(hex)}><RiAddLine /> افزودن</Button>
          </div>
          <div className="flex min-h-9 flex-wrap gap-2">
            {saved.length ? saved.map((color) => <button key={color} type="button" onClick={() => chooseColor(color)} aria-label={`انتخاب ${color}`} className={cn("relative size-8 rounded-full border-2 border-background shadow-sm ring-1 ring-border transition hover:scale-105", color === hex && "ring-2 ring-primary ring-offset-2 ring-offset-background")} style={{ backgroundColor: color }}>
              {color === hex ? <RiCheckLine className="absolute inset-0 m-auto size-4 text-white mix-blend-difference" /> : null}
            </button>) : <span className="type-caption text-muted-foreground">هنوز رنگی ذخیره نکردی.</span>}
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border p-3">
          <span className="size-11 shrink-0 rounded-2xl border border-white/15 shadow-sm" style={{ backgroundColor: hex }} />
          <div className="min-w-0"><div className="type-label">پیش‌نمایش تم</div><div className="type-caption text-muted-foreground">دکمه‌ها، لوگو، Ring و نمودارها از همین رنگ مشتق می‌شوند.</div></div>
          <Button type="button" size="sm" className="ms-auto">نمونه</Button>
        </div>

        <div className="flex gap-2 border-t pt-4">
          <Button type="button" className="flex-1" onClick={() => void apply()}>اعمال رنگ</Button>
          <Button type="button" variant="outline" className="flex-1" onClick={() => close(false)}>انصراف</Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>;
}

function SaturationValueField({ value, onChange }: { value: HsvColor; onChange: (value: HsvColor) => void }) {
  const fieldRef = useRef<HTMLDivElement>(null);

  function update(clientX: number, clientY: number) {
    const rect = fieldRef.current?.getBoundingClientRect();
    if (!rect) return;
    const s = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const v = 1 - Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    onChange({ ...value, s, v });
  }

  return <div
    ref={fieldRef}
    role="slider"
    tabIndex={0}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={Math.round(value.s * 100)}
    aria-label="اشباع و روشنایی رنگ"
    aria-valuetext={`${Math.round(value.s * 100)} درصد اشباع، ${Math.round(value.v * 100)} درصد روشنایی`}
    onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); update(event.clientX, event.clientY); }}
    onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) update(event.clientX, event.clientY); }}
    onKeyDown={(event) => {
      const step = event.shiftKey ? 0.1 : 0.02;
      if (event.key === "ArrowRight") { event.preventDefault(); onChange({ ...value, s: Math.min(1, value.s + step) }); }
      if (event.key === "ArrowLeft") { event.preventDefault(); onChange({ ...value, s: Math.max(0, value.s - step) }); }
      if (event.key === "ArrowUp") { event.preventDefault(); onChange({ ...value, v: Math.min(1, value.v + step) }); }
      if (event.key === "ArrowDown") { event.preventDefault(); onChange({ ...value, v: Math.max(0, value.v - step) }); }
    }}
    className="relative h-56 cursor-crosshair touch-none overflow-hidden rounded-2xl border outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:h-64"
    style={{ backgroundColor: `hsl(${value.h} 100% 50%)`, backgroundImage: "linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,transparent)" }}
  >
    <span className="pointer-events-none absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_1px_5px_rgb(0_0_0/.6)]" style={{ left: `${value.s * 100}%`, top: `${(1 - value.v) * 100}%` }} />
  </div>;
}
