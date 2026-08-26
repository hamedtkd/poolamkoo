import Image from "next/image";
import { RiCheckLine, RiShieldCheckLine } from "react-icons/ri";

export function LandingProductVisual() {
  return (
    <figure className="relative mx-auto w-full max-w-[760px]" aria-label="نمای تصویری امکانات پولم‌کو در تم روشن و تاریک">
      <div className="pointer-events-none absolute -inset-5 -z-10 rounded-[42px] bg-primary/12 blur-3xl" />
      <div className="landing-visual-float relative overflow-hidden rounded-[28px] border bg-card shadow-[0_32px_110px_rgba(0,0,0,.18)] sm:rounded-[34px]">
        <Image
          data-landing-visual="light"
          src="/landing/poolamkoo-finance-light.webp"
          alt="نمای روشن پولم‌کو با پول ورودی، تقسیم پول، صندوق اضطراری، ترکیب سبد و هدف مالی"
          width={1448}
          height={1086}
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="h-auto w-full dark:hidden"
        />
        <Image
          data-landing-visual="dark"
          src="/landing/poolamkoo-finance-dark.webp"
          alt="نمای تاریک پولم‌کو با پول ورودی، تقسیم پول، صندوق اضطراری، ترکیب سبد و هدف مالی"
          width={1448}
          height={1086}
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="hidden h-auto w-full dark:block"
        />
        <div className="pointer-events-none absolute inset-x-4 bottom-4 hidden items-center justify-between gap-3 rounded-2xl border bg-background/78 px-3 py-2 text-[10px] shadow-lg backdrop-blur-md sm:flex">
          <span className="inline-flex items-center gap-1.5"><RiShieldCheckLine className="size-4 text-primary" /> داده مالی واقعی از دستگاه خوانده نمی‌شود</span>
          <span className="inline-flex items-center gap-1.5 text-muted-foreground"><RiCheckLine className="size-4 text-primary" /> داده‌های نمایش‌داده‌شده نمونه‌اند</span>
        </div>
      </div>
      <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-[10px] leading-5 text-muted-foreground sm:hidden">
        <span>تصویر مفهومی محصول؛ اعداد نمونه‌اند.</span>
        <span className="rounded-full border bg-background/80 px-2.5 py-1">هماهنگ با تم</span>
      </figcaption>
    </figure>
  );
}
