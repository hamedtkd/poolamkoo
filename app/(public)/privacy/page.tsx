import type { Metadata } from "next";
import Link from "next/link";
import { RiDatabase2Line, RiExchangeLine, RiGithubFill, RiLineChartLine, RiLock2Line, RiNotification3Line } from "react-icons/ri";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "سیاست داده و حریم خصوصی", description: "پولم‌کو چه داده‌ای را کجا نگه می‌دارد و چه درخواست‌های شبکه‌ای دارد" };

export default function PrivacyPage() {
  return <article className="space-y-8">
    <header className="max-w-3xl"><div className="type-caption type-body-strong text-primary">سیاست داده</div><h1 className="mt-2 type-display">اطلاعات مالی تو، پیش‌فرض روی دستگاه خودت می‌ماند</h1><p className="mt-4 text-sm leading-8 text-muted-foreground">پولم‌کو Local-first است. این صفحه دقیقاً توضیح می‌دهد چه چیزی محلی است، چه زمانی شبکه استفاده می‌شود و مسئولیت بکاپ چه معنایی دارد.</p></header>
    <div className="grid gap-4 md:grid-cols-2">
      <Policy icon={<RiDatabase2Line />} title="داده‌های مالی اصلی — محلی">پول‌های ورودی، برنامه‌ها، صندوق‌ها، دارایی‌ها، تراکنش‌ها، Watchlist، هشدارها، تنظیمات و Recovery Snapshotها در IndexedDB مرورگر ذخیره می‌شوند.</Policy>
      <Policy icon={<RiLock2Line />} title="بدون دیتابیس مرکزی کاربر">در Build عادی حساب کاربری و دیتابیس مرکزی حاوی سوابق مالی کاربران وجود ندارد. Background Push آزمایشی نیز به‌صورت پیش‌فرض خاموش است.</Policy>
      <Policy icon={<RiLineChartLine />} title="درخواست‌های بازار">برای قیمت بازار، سرور اپ ممکن است به BrsApi یا Tindex درخواست بزند. این درخواست‌ها شناسه/نماد بازار را حمل می‌کنند، نه مبلغ درآمد، موجودی صندوق یا تاریخچه تراکنش شخصی.</Policy>
      <Policy icon={<RiGithubFill />} title="تعداد Star گیت‌هاب">برای نمایش تعداد Star فقط متادیتای عمومی مخزن GitHub با Cache چندساعته خوانده می‌شود. هیچ داده مالی به GitHub ارسال نمی‌شود.</Policy>
      <Policy icon={<RiExchangeLine />} title="انتقال دستگاه به دستگاه">انتقال مستقیم با WebRTC و Pairing دستی انجام می‌شود و Payload علاوه بر کانال WebRTC با AES-GCM رمز می‌شود. در این نسخه سرور Signaling یا فضای ابری پولم‌کو برای انتقال وجود ندارد.</Policy>
      <Policy icon={<RiNotification3Line />} title="Analytics اختیاری و بدون داده مالی">در استقرارهایی که توکن عمومی Cloudflare Web Analytics تنظیم شده باشد، فقط آمار کلی بازدید، مسیر صفحه و عملکرد مرورگر اندازه‌گیری می‌شود. بدون توکن، هیچ Beacon تحلیلی Render نمی‌شود.</Policy>
    </div>
    <section className="rounded-2xl border border-primary/20 bg-primary/5 p-5"><h2 className="type-section-title">Local-first به معنی «بکاپ لازم نیست» نیست</h2><p className="mt-2 text-sm leading-8 text-muted-foreground">پاک‌کردن Site Data، استفاده از Private Browsing، تعویض مرورگر یا دستگاه و بعضی سیاست‌های پاک‌سازی سیستم می‌توانند داده محلی را از دسترس خارج کنند. برای اطلاعات مالی واقعی، بکاپ رمزنگاری‌شده منظم را در یک محل مستقل نگه دار.</p></section>
    <section className="space-y-3"><h2 className="type-section-title">چه چیزی عمداً انجام نمی‌دهیم؟</h2><ul className="grid gap-2 text-sm leading-7 text-muted-foreground"><li>• فروش یا اشتراک‌گذاری داده مالی شخصی برای تبلیغات.</li><li>• ارسال مبلغ‌ها، نام دارایی‌های شخصی، تراکنش‌ها، عبارت جست‌وجو یا محتوای بکاپ به Analytics.</li><li>• تعریف Custom Event برای رفتار مالی یا محتوای فرم‌ها.</li><li>• ساخت داده تاریخی جعلی وقتی Provider بازار در دسترس نیست.</li><li>• قفل‌کردن قابلیت‌های برنامه پشت حمایت مالی.</li></ul></section>
    <p className="text-xs leading-6 text-muted-foreground">Cloudflare Web Analytics طبق مستندات رسمی Query String را لاگ نمی‌کند و برای Usage Metrics از Cookie یا localStorage تحلیلی استفاده نمی‌کند. جزئیات پیاده‌سازی در صفحه <Link href="/analytics" className="underline underline-offset-4">Analytics</Link> آمده است. سرویس‌های خارجی مثل Cloudflare، GitHub، BrsApi و Tindex سیاست حریم خصوصی مستقل خودشان را دارند.</p>
  </article>;
}

function Policy({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) { return <Card><CardHeader><div className="mb-2 grid size-10 place-items-center rounded-xl bg-primary/10 text-primary [&_svg]:size-5">{icon}</div><CardTitle>{title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-7 text-muted-foreground">{children}</p></CardContent></Card>; }
