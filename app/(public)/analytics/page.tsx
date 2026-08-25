import type { Metadata } from "next";
import { RiDatabase2Line, RiLineChartLine, RiLock2Line, RiShieldCheckLine } from "react-icons/ri";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cloudflareAnalyticsStatus } from "@/lib/analytics";

export const metadata: Metadata = { title: "Analytics و حریم خصوصی", description: "Cloudflare Web Analytics در پولم‌کو چه چیزی را اندازه می‌گیرد و چه چیزی را نمی‌فرستد" };

export default function AnalyticsPage() {
  const status = cloudflareAnalyticsStatus(process.env.NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN);
  return <article className="space-y-8">
    <header className="max-w-3xl">
      <div className="type-caption type-body-strong text-primary">Analytics بدون داده مالی</div>
      <h1 className="mt-2 type-display">فقط بفهمیم اپ استفاده می‌شود و تجربه‌اش چقدر خوب است</h1>
      <p className="mt-4 text-sm leading-8 text-muted-foreground">در استقرارهایی که مالک پروژه توکن Cloudflare Web Analytics را تنظیم کرده باشد، پولم‌کو Beacon رسمی Cloudflare را فقط در Production بار می‌کند. وضعیت این استقرار: <strong className="text-foreground">{status === "enabled" ? "فعال" : status === "development" ? "توکن تنظیم شده؛ محیط توسعه اندازه‌گیری نمی‌شود" : "غیرفعال"}</strong>.</p>
    </header>
    <div className="grid gap-4 md:grid-cols-2">
      <Fact icon={<RiLineChartLine />} title="چه چیزی اندازه‌گیری می‌شود؟">بازدید، Page View، مسیر صفحه، نوع دستگاه/مرورگر و معیارهای عملکردی مثل Core Web Vitals. برای SPA نیز خود Beacon تغییر مسیر را تشخیص می‌دهد.</Fact>
      <Fact icon={<RiShieldCheckLine />} title="چه چیزی ارسال نمی‌شود؟">مبلغ‌ها، موجودی صندوق‌ها، نام دارایی‌های شخصی، تراکنش‌ها، عبارت جست‌وجو، متن فرم‌ها و فایل Backup از طرف پولم‌کو به Analytics فرستاده نمی‌شوند.</Fact>
      <Fact icon={<RiLock2Line />} title="بدون Cookie تحلیلی">Cloudflare Web Analytics برای جمع‌آوری Usage Metric به Cookie یا localStorage تحلیلی متکی نیست و پولم‌کو نیز برای Analytics شناسه کاربری یا Custom Event نمی‌سازد.</Fact>
      <Fact icon={<RiDatabase2Line />} title="Self-host اختیاری">اگر `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` وجود نداشته باشد، Script خارجی اصلاً Render نمی‌شود. پس Self-hosting بدون Analytics هیچ تنظیم اضافه‌ای لازم ندارد.</Fact>
    </div>
    <section className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
      <h2 className="type-section-title">چرا Cookie Banner اضافه نشده؟</h2>
      <p className="mt-2 text-sm leading-8 text-muted-foreground">خود Cloudflare Web Analytics به‌عنوان ابزار privacy-first و cookie-free طراحی شده است. با این حال قوانین هر کشور یا سازمان می‌تواند متفاوت باشد؛ مالک هر استقرار عمومی باید الزامات قانونی حوزه خودش را بررسی کند.</p>
    </section>
    <section className="space-y-3">
      <h2 className="type-section-title">منابع رسمی</h2>
      <div className="flex flex-wrap gap-2 text-sm type-strong">
        <a className="rounded-xl border px-3 py-2 transition hover:bg-accent" href="https://developers.cloudflare.com/web-analytics/" target="_blank" rel="noreferrer">Cloudflare Web Analytics</a>
        <a className="rounded-xl border px-3 py-2 transition hover:bg-accent" href="https://developers.cloudflare.com/web-analytics/data-metrics/data-origin-and-collection/" target="_blank" rel="noreferrer">Data collection</a>
        <a className="rounded-xl border px-3 py-2 transition hover:bg-accent" href="https://developers.cloudflare.com/web-analytics/get-started/web-analytics-spa/" target="_blank" rel="noreferrer">SPA measurement</a>
      </div>
    </section>
  </article>;
}

function Fact({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return <Card><CardHeader><div className="mb-2 grid size-10 place-items-center rounded-xl bg-primary/10 text-primary [&_svg]:size-5">{icon}</div><CardTitle>{title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-7 text-muted-foreground">{children}</p></CardContent></Card>;
}
