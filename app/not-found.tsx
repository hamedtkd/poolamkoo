import Link from "next/link";
import { RiArrowRightLine, RiHome5Line, RiInformationLine } from "react-icons/ri";
import { BrandLogo } from "@/components/brand-logo";
import { APP_ENTRY_PATH } from "@/lib/site";

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center p-5">
      <div className="w-full max-w-lg text-center">
        <BrandLogo className="mx-auto size-14" />
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border bg-muted/45 px-3 py-1 text-xs text-muted-foreground"><RiInformationLine /> ۴۰۴</div>
        <h1 className="mt-4 type-page-title">این صفحه پیدا نشد</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">ممکن است آدرس تغییر کرده باشد یا لینک قدیمی باشد. داده محلی برنامه با بازکردن یک آدرس اشتباه تغییر نمی‌کند.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/" className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-[590] text-primary-foreground"><RiHome5Line /> صفحه معرفی</Link>
          <Link href={APP_ENTRY_PATH} className="inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-[590] hover:bg-accent">باز کردن برنامه <RiArrowRightLine /></Link>
        </div>
      </div>
    </main>
  );
}
