"use client";

import { RiArrowLeftLine, RiArrowRightLine, RiCheckLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function LoanField({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><div className="flex items-baseline justify-between gap-2"><label className="type-label">{label}</label>{hint && <span className="type-caption text-muted-foreground">{hint}</span>}</div>{children}{error && <p className="type-caption text-destructive">{error}</p>}</div>;
}

export function WizardProgress({ step, labels }: { step: number; labels: string[] }) {
  return <ol aria-label="مراحل ثبت وام" className="grid grid-cols-4 gap-1.5">{labels.map((label, index) => {
    const current = index === step;
    const done = index < step;
    return <li key={label} className={cn("rounded-xl border px-2 py-2 text-center type-caption", current && "border-primary bg-primary/8 text-primary", done && "border-primary/20 bg-primary/5 text-foreground")} aria-current={current ? "step" : undefined}><span className="mx-auto mb-1 grid size-6 place-items-center rounded-full bg-muted type-strong">{done ? <RiCheckLine /> : index + 1}</span><span className="hidden sm:block">{label}</span></li>;
  })}</ol>;
}

export function WizardFooter({ step, last, busy, onBack, onNext, onSubmit }: { step: number; last: number; busy: boolean; onBack: () => void; onNext: () => void; onSubmit: () => void }) {
  return <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-between"><Button type="button" variant="outline" onClick={onBack} disabled={step === 0 || busy}><RiArrowRightLine /> مرحله قبل</Button>{step < last ? <Button type="button" onClick={onNext}>مرحله بعد <RiArrowLeftLine /></Button> : <Button type="button" onClick={onSubmit} disabled={busy}>{busy ? "در حال ساخت..." : "ساخت برنامه وام"}</Button>}</div>;
}

export function MiniStat({ label, value, note }: { label: string; value: React.ReactNode; note?: string }) {
  return <Card className="shadow-none"><CardContent className="p-3.5"><div className="type-caption text-muted-foreground">{label}</div><div className="mt-1 type-card-title tabular-nums">{value}</div>{note && <div className="mt-1 type-caption text-muted-foreground">{note}</div>}</CardContent></Card>;
}
