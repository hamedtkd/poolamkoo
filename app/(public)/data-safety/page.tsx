import type { Metadata } from "next";
import { RiArchiveLine, RiDeleteBin6Line, RiExchangeLine, RiShieldCheckLine } from "react-icons/ri";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "ماندگاری و بازیابی داده", description: "بکاپ، Recovery Snapshot و انتقال داده در پولم‌کو" };

export default function DataSafetyPage() {
  return <div className="space-y-8">
    <header className="max-w-3xl"><div className="type-caption type-body-strong text-primary">Data Safety</div><h1 className="mt-2 type-display">سه لایه برای اینکه داده مالی فقط در Browser گیر نکند</h1><p className="mt-4 text-sm leading-8 text-muted-foreground">Local-first کنترل بیشتری می‌دهد، اما مسئولیت ماندگاری را هم جدی‌تر می‌کند. پولم‌کو سه ابزار مکمل دارد.</p></header>
    <div className="grid gap-4 md:grid-cols-3">
      <Layer icon={<RiArchiveLine />} title="بکاپ مستقل">فایل JSON با AES-GCM، بررسی صحت SHA-256 و Preview قبل از Restore. برای نگهداری بلندمدت، این مهم‌ترین لایه است.</Layer>
      <Layer icon={<RiDeleteBin6Line />} title="Recovery محلی">حداکثر پنج Snapshot اخیر برای برگشت از حذف/Restore اشتباه. روی همان Browser می‌ماند و بکاپ خارجی نیست.</Layer>
      <Layer icon={<RiExchangeLine />} title="انتقال مستقیم">WebRTC + AES-GCM برای انتقال بین دو Browser بدون حساب و فضای ابری پولم‌کو؛ فایل بکاپ fallback عمومی است.</Layer>
    </div>
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><RiShieldCheckLine className="text-primary" /> پیشنهاد عملی</CardTitle></CardHeader><CardContent><ol className="space-y-3 text-sm leading-7 text-muted-foreground"><li><strong className="text-foreground">۱.</strong> بعد از ورود اطلاعات اولیه یک بکاپ رمزدار بگیر و هنگام Restore پیش‌نمایش رکوردها و سازگاری نسخه را بررسی کن.</li><li><strong className="text-foreground">۲.</strong> یادآوری هفتگی بکاپ را نادیده نگیر؛ فایل را در جایی جدا از همان دستگاه نگه دار.</li><li><strong className="text-foreground">۳.</strong> قبل از تعویض دستگاه، انتقال مستقیم را تست کن و فایل بکاپ را هم نگه دار.</li><li><strong className="text-foreground">۴.</strong> رمز بکاپ جایی در پولم‌کو ذخیره نمی‌شود؛ اگر آن را فراموش کنی، فایل رمزدار قابل بازیابی نیست.</li></ol></CardContent></Card>
  </div>;
}

function Layer({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) { return <Card><CardHeader><div className="mb-2 grid size-10 place-items-center rounded-xl bg-primary/10 text-primary [&_svg]:size-5">{icon}</div><CardTitle>{title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-7 text-muted-foreground">{children}</p></CardContent></Card>; }
