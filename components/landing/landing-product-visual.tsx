import Image from "next/image";
import { RiCheckLine, RiLock2Line, RiPieChart2Line } from "react-icons/ri";

const allocation = [
  { label: "زندگی", value: "۳۰٪" },
  { label: "امنیت", value: "۲۰٪" },
  { label: "رشد", value: "۵۰٪" },
] as const;

export function LandingProductVisual() {
  return (
    <figure data-demo="true" className="relative mx-auto w-full max-w-[640px]" aria-label="نمای پولم‌کو با داده نمایشی در صفحه برنامه‌ریزی پول‌های ورودی">
      <div className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-primary/15 blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto grid min-h-[440px] place-items-center sm:min-h-[520px]">
        <div className="absolute start-0 top-10 z-20 hidden w-44 rounded-2xl border bg-background/88 p-3 shadow-xl backdrop-blur-xl sm:block">
          <div className="flex items-center gap-2 type-caption text-muted-foreground"><RiPieChart2Line className="size-4 text-primary" /> قانون پول</div>
          <div className="mt-3 space-y-2">
            {allocation.map((item) => <div key={item.label} className="flex items-center justify-between text-xs"><span>{item.label}</span><strong className="type-data text-primary">{item.value}</strong></div>)}
          </div>
        </div>

        <div className="landing-visual-float relative z-10 w-[260px] rounded-[2.6rem] border border-white/12 bg-[#070708] p-2 shadow-[0_34px_90px_rgba(0,0,0,.42),inset_0_0_0_1px_rgba(255,255,255,.06)] sm:w-[310px]">
          <div className="absolute start-1/2 top-3 z-20 h-5 w-20 -translate-x-1/2 rounded-full bg-black shadow-inner" aria-hidden="true" />
          <div className="overflow-hidden rounded-[2.15rem] border border-white/6 bg-[#09090b]">
            <Image
              data-landing-visual="product"
              src="/landing/poolamkoo-income-mobile.webp"
              alt="اسکرین‌شات واقعی پولم‌کو از پول‌های ورودی و میزان اجرای برنامه هر ورودی"
              width={425}
              height={1120}
              priority
              sizes="(max-width: 640px) 260px, 310px"
              className="h-auto w-full"
            />
          </div>
        </div>

        <div className="absolute end-0 top-[22%] z-20 hidden w-48 rounded-2xl border bg-background/88 p-3 shadow-xl backdrop-blur-xl sm:block">
          <div className="flex items-center gap-2 text-xs font-[650]"><RiLock2Line className="size-4 text-primary" /> Local-first</div>
          <p className="mt-1.5 text-[10px] leading-5 text-muted-foreground">داده مالی اصلی روی دستگاه خودت می‌ماند.</p>
        </div>

        <div className="absolute bottom-10 end-3 z-20 hidden w-48 rounded-2xl border bg-background/88 p-3 shadow-xl backdrop-blur-xl sm:block">
          <div className="flex items-center gap-2 text-xs font-[650]"><RiCheckLine className="size-4 text-profit" /> برنامه در برابر اجرا</div>
          <p className="mt-1.5 text-[10px] leading-5 text-muted-foreground">فقط پیشنهاد نمی‌دهد؛ اجرای واقعی را هم نگه می‌دارد.</p>
        </div>
      </div>
    </figure>
  );
}
