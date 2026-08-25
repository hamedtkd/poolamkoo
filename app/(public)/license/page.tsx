import type { Metadata } from "next";
import { RiGithubFill, RiInformationLine } from "react-icons/ri";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COMMUNITY_LINKS } from "@/lib/community";

export const metadata: Metadata = { title: "مجوز متن‌باز", description: "مجوز MIT پروژه متن‌باز پولم‌کو" };

export default function LicensePage() {
  return <div className="space-y-8">
    <header className="max-w-3xl"><div className="type-caption type-body-strong text-primary">Open Source</div><h1 className="mt-2 type-display">پولم‌کو با مجوز MIT منتشر می‌شود</h1><p className="mt-4 text-sm leading-8 text-muted-foreground">هدف این است که پروژه قابل مطالعه، Fork، تغییر و مشارکت باشد و استفاده از آن به پرداخت هزینه یا سرویس اختصاصی وابسته نشود.</p></header>
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><RiInformationLine className="text-primary" /> خلاصه کاربردی</CardTitle></CardHeader><CardContent className="space-y-3 text-sm leading-7 text-muted-foreground"><p>مجوز MIT اجازه استفاده، کپی، تغییر، ادغام، انتشار، توزیع، sublicense و فروش نسخه‌های نرم‌افزار را با حفظ متن Copyright و License می‌دهد.</p><p>نرم‌افزار «همان‌طور که هست» ارائه می‌شود و مجوز MIT ضمانت عملکرد یا تناسب برای هدف خاص ایجاد نمی‌کند. متن فایل LICENSE مرجع نهایی است.</p></CardContent></Card>
    <a href={COMMUNITY_LINKS.license} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-xl border bg-background/70 px-4 type-label transition hover:bg-accent"><RiGithubFill className="size-5" /> مشاهده متن کامل LICENSE در GitHub</a>
  </div>;
}
