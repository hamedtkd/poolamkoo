import type { Metadata } from "next";
import Link from "next/link";
import { RiArchiveLine, RiExchangeLine, RiFundsLine, RiLineChartLine, RiSafe2Line, RiWallet3Line } from "react-icons/ri";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "راهنمای پولم‌کو", description: "شروع سریع و گردش کار اصلی پولم‌کو" };

const steps = [
  { icon: RiWallet3Line, title: "۱. پول جدید را ثبت کن", text: "مبلغ و تاریخ را وارد کن. اگر بخشی از پول باید مستقیم به یک صندوق برود، همان ابتدا جداش کن." },
  { icon: RiSafe2Line, title: "۲. امنیت را اول ببین", text: "صندوق اضطراری و هزینه‌های برنامه‌ریزی‌شده کمک می‌کنند پول نزدیک را با سرمایه‌گذاری قاطی نکنی." },
  { icon: RiFundsLine, title: "۳. برنامه را اجرا کن", text: "کارت‌های برنامه فقط پیشنهاد نیستند؛ اجرای کامل یا جزئی را ثبت کن تا گزارش‌ها واقعیت را نشان دهند." },
  { icon: RiLineChartLine, title: "۴. سبد را با خرید واقعی بساز", text: "خرید و فروش، موجودی قبلی، Cost Basis و قیمت فعلی را ثبت یا از بازار متصل دریافت کن." },
  { icon: RiExchangeLine, title: "۵. برای دستگاه جدید انتقال بده", text: "از Settings انتقال مستقیم رمزنگاری‌شده را شروع کن؛ اگر WebRTC جواب نداد، فایل بکاپ رمزدار fallback مطمئن است." },
  { icon: RiArchiveLine, title: "۶. بکاپ را عادت کن", text: "Recovery Snapshot برای اشتباه‌های محلی خوب است، اما جای فایل بکاپ مستقل را نمی‌گیرد." },
] as const;

export default function GuidePage() {
  return <div className="space-y-8">
    <header className="max-w-3xl"><div className="type-caption type-body-strong text-primary">شروع سریع</div><h1 className="mt-2 type-display">پولم‌کو را با یک چرخه ساده استفاده کن</h1><p className="mt-4 text-sm leading-8 text-muted-foreground">تمرکز برنامه روی «پول وارد شد، تصمیم بگیر، اجرا کن، بعد نتیجه را ببین» است. لازم نیست همه بخش‌ها را از روز اول پر کنی.</p></header>
    <div className="grid gap-4 md:grid-cols-2">{steps.map(({ icon: Icon, title, text }) => <Card key={title}><CardHeader><div className="mb-2 grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></div><CardTitle>{title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-7 text-muted-foreground">{text}</p></CardContent></Card>)}</div>
    <section className="grid gap-4 lg:grid-cols-2">
      <Card><CardHeader><CardTitle>سه قانون مهم برای داده واقعی</CardTitle></CardHeader><CardContent><ul className="space-y-2 text-sm leading-7 text-muted-foreground"><li>• خریدهای قدیمی را با تاریخ و میانگین قیمت واقعی وارد کن.</li><li>• قیمت دستی را فقط وقتی Provider بازار مناسب نیست یا قطع شده استفاده کن.</li><li>• حداقل هفته‌ای یک بکاپ مستقل نگه دار، مخصوصاً بعد از تغییرات مهم.</li></ul></CardContent></Card>
      <Card><CardHeader><CardTitle>اگر چیزی گم شد یا اشتباه شد</CardTitle></CardHeader><CardContent><p className="text-sm leading-7 text-muted-foreground">اول Recovery Snapshotهای Settings را ببین. اگر دستگاه یا Browser Data از دست رفته، فایل بکاپ مستقل راه بازیابی است. مشکل برنامه را هم می‌توانی در GitHub گزارش کنی.</p><div className="mt-4 flex flex-wrap gap-2"><Link href="/data-safety" className="rounded-xl border px-3 py-2 text-xs type-strong hover:bg-accent">راهنمای ماندگاری داده</Link><Link href="/privacy" className="rounded-xl border px-3 py-2 text-xs type-strong hover:bg-accent">سیاست داده</Link></div></CardContent></Card>
    </section>
  </div>;
}
