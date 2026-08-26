import Image from "next/image";

export function LandingProductVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[720px]" aria-label="نمای تصویری امکانات پولم‌کو در تم روشن و تاریک">
      <div className="pointer-events-none absolute -inset-4 -z-10 rounded-[42px] bg-primary/10 blur-3xl" />
      <div className="overflow-hidden rounded-[30px] border bg-card shadow-[0_32px_110px_rgba(0,0,0,.16)]">
        <Image
          src="/landing/poolamkoo-finance-light.webp"
          alt="نمای روشن پولم‌کو با پول ورودی، تقسیم پول، صندوق اضطراری، ترکیب سبد و هدف مالی"
          width={1448}
          height={1086}
          priority
          sizes="(max-width: 1024px) 100vw, 58vw"
          className="h-auto w-full dark:hidden"
        />
        <Image
          src="/landing/poolamkoo-finance-dark.webp"
          alt="نمای تاریک پولم‌کو با پول ورودی، تقسیم پول، صندوق اضطراری، ترکیب سبد و هدف مالی"
          width={1448}
          height={1086}
          sizes="(max-width: 1024px) 100vw, 58vw"
          className="hidden h-auto w-full dark:block"
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-[10px] leading-5 text-muted-foreground">
        <span>تصویر مفهومی از جریان واقعی محصول؛ داده‌های نمایش‌داده‌شده نمونه‌اند.</span>
        <span className="rounded-full border bg-background/80 px-2.5 py-1">هماهنگ با تم سیستم</span>
      </div>
    </div>
  );
}
