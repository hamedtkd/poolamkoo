import { RiArrowUpLine, RiFundsLine, RiSafe2Line, RiWallet3Line } from "react-icons/ri";

const allocations = [
  { label: "زندگی", value: 45 },
  { label: "امنیت", value: 25 },
  { label: "رشد", value: 20 },
  { label: "لذت", value: 10 },
] as const;

export function LandingDashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[680px]" aria-label="نمای نمونه داشبورد پولم‌کو">
      <div className="absolute -inset-3 -z-10 rounded-[36px] bg-primary/8 blur-2xl" />
      <div className="overflow-hidden rounded-[28px] border bg-background/92 shadow-[0_30px_100px_rgba(0,0,0,.12)] backdrop-blur-xl">
        <div className="flex h-12 items-center justify-between border-b px-4 sm:px-5">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary" />
            <span className="text-xs font-[590]">نمای نمونه داشبورد</span>
          </div>
          <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] text-muted-foreground">Local-first</span>
        </div>
        <div className="grid gap-3 p-3 sm:p-4">
          <div className="grid gap-3 sm:grid-cols-[1.15fr_.85fr]">
            <div className="rounded-2xl border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] text-muted-foreground">پول جدید این ماه</div>
                  <div className="mt-2 text-2xl font-[700] tracking-tight">برنامه‌ریزی‌شده</div>
                </div>
                <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><RiWallet3Line className="size-5" /></div>
              </div>
              <div className="mt-5 grid grid-cols-4 gap-2">
                {allocations.map((item) => (
                  <div key={item.label} className="rounded-xl bg-muted/55 p-2 text-center">
                    <div className="text-sm font-[680] tabular-nums">{item.value}٪</div>
                    <div className="mt-0.5 text-[9px] text-muted-foreground">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border bg-card p-4">
              <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">آمادگی مالی</span><RiSafe2Line className="size-5 text-primary" /></div>
              <div className="mt-5 flex items-end gap-2"><span className="text-3xl font-[720] tabular-nums">۷۰٪</span><span className="mb-1 inline-flex items-center gap-0.5 text-[10px] text-primary"><RiArrowUpLine /> رو به جلو</span></div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full w-[70%] rounded-full bg-primary" /></div>
              <p className="mt-3 text-[10px] leading-5 text-muted-foreground">سهم امنیت + رشد از برنامه فعلی</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <PreviewRow icon={<RiSafe2Line />} title="صندوق‌های هدف" detail="اضطراری، خریدهای برنامه‌ریزی‌شده" progress={68} />
            <PreviewRow icon={<RiFundsLine />} title="سرمایه‌گذاری" detail="خرید واقعی، Cost Basis و بازار" progress={54} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewRow({ icon, title, detail, progress }: { icon: React.ReactNode; title: string; detail: string; progress: number }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border bg-card p-3.5">
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary [&_svg]:size-5">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-[620]">{title}</div>
        <div className="mt-0.5 truncate text-[10px] text-muted-foreground">{detail}</div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} /></div>
      </div>
    </div>
  );
}
