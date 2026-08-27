import type { Metadata } from "next";
import { RiArchiveLine, RiExchangeLine, RiKey2Line, RiLock2Line, RiShieldCheckLine } from "react-icons/ri";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COMMUNITY_LINKS } from "@/lib/community";

export const metadata: Metadata = { title: "امنیت پولم‌کو", description: "مدل امنیت، نگهداری کلیدها و گزارش مسئولانه مشکل امنیتی در پولم‌کو" };

export default function SecurityPage() {
  return <div className="space-y-8">
    <header className="max-w-3xl"><div className="type-caption type-body-strong text-primary">امنیت</div><h1 className="mt-2 type-display">امنیت از کم‌کردن داده مرکزی شروع می‌شود</h1><p className="mt-4 text-sm leading-8 text-muted-foreground">پولم‌کو Local-first طراحی شده تا سوابق مالی روزمره برای کارکرد عادی به یک حساب یا دیتابیس مرکزی وابسته نباشند. با این حال امنیت دستگاه، مرورگر و بکاپ همچنان مهم است.</p></header>
    <div className="grid gap-4 md:grid-cols-2">
      <Point icon={<RiLock2Line />} title="داده مالی محلی">رکوردهای مالی اصلی در IndexedDB مرورگر می‌مانند. APIهای بازار برای Quote عمومی هستند و نباید مبلغ‌ها یا تاریخچه مالی شخصی را دریافت کنند.</Point>
      <Point icon={<RiKey2Line />} title="Secretهای سرور">کلید BrsApi و توکن اختیاری Tindex فقط Server-side هستند و نباید با نام NEXT_PUBLIC یا داخل مخزن Commit شوند. TSETMC برای مسیر مستقیم بورس API Key ندارد.</Point>
      <Point icon={<RiArchiveLine />} title="بکاپ رمزنگاری‌شده">بکاپ رمزدار از PBKDF2-SHA256 و AES-GCM استفاده می‌کند؛ فایل‌های جدید قبل از Restore از نظر SHA-256 و سازگاری Schema هم بررسی می‌شوند. رمز بکاپ ذخیره نمی‌شود.</Point>
      <Point icon={<RiExchangeLine />} title="انتقال مستقیم">Device Transfer از WebRTC DataChannel استفاده می‌کند و Payload پیش از ارسال با رمز یک‌بارمصرف AES-GCM رمز می‌شود. Pairing code و PIN را فقط بین دو دستگاه خودت جابه‌جا کن.</Point>
    </div>
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><RiShieldCheckLine className="text-primary" /> گزارش مسئولانه آسیب‌پذیری</CardTitle></CardHeader><CardContent className="space-y-3 text-sm leading-7 text-muted-foreground"><p>اگر مشکل امنیتی پیدا کردی، اطلاعات حساس واقعی، Backup، Token یا داده مالی را داخل Issue عمومی قرار نده. ابتدا راهنمای Security مخزن را بخوان و فقط اطلاعات لازم برای بازتولید امن مشکل را ارائه کن.</p><a href={COMMUNITY_LINKS.security} target="_blank" rel="noreferrer" className="inline-flex rounded-xl border px-3 py-2 type-strong text-foreground transition hover:bg-accent">مشاهده SECURITY.md در GitHub</a></CardContent></Card>
    <p className="text-xs leading-6 text-muted-foreground">Background Push آزمایشی در Build عادی غیرفعال است و Redis/VAPID/Cron برای استفاده معمول لازم نیست.</p>
  </div>;
}

function Point({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) { return <Card><CardHeader><div className="mb-2 grid size-10 place-items-center rounded-xl bg-primary/10 text-primary [&_svg]:size-5">{icon}</div><CardTitle>{title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-7 text-muted-foreground">{children}</p></CardContent></Card>; }
