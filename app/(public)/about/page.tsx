import type { Metadata } from "next";
import Link from "next/link";
import { RiDatabase2Line, RiGithubFill, RiHeart3Line, RiLineChartLine, RiShieldCheckLine } from "react-icons/ri";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COMMUNITY_LINKS } from "@/lib/community";

export const metadata: Metadata = { title: "درباره پولم‌کو", description: "درباره پروژه متن‌باز و Local-first پولم‌کو" };

export default function AboutPage() {
  return <div className="space-y-8">
    <section className="max-w-3xl"><div className="type-caption type-body-strong text-primary">درباره پروژه</div><h1 className="mt-2 type-display">پولم‌کو برای تصمیم‌گیری روی پول جدید ساخته شده، نه حسابداری ریز روزانه</h1><p className="mt-4 text-sm leading-8 text-muted-foreground">وقتی پولی وارد می‌شود، پولم‌کو کمک می‌کند آن را بین زندگی، امنیت و رشد برنامه‌ریزی کنی، اجرای واقعی را ثبت کنی و بعد نتیجه را در صندوق‌ها و سبد سرمایه‌گذاری ببینی.</p></section>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Feature icon={<RiDatabase2Line />} title="Local-first">داده‌های مالی اصلی در IndexedDB همان مرورگر ذخیره می‌شوند و برای استفاده روزمره حساب کاربری لازم نیست.</Feature>
      <Feature icon={<RiGithubFill />} title="متن‌باز">کد پروژه روی GitHub عمومی است و با مجوز MIT منتشر می‌شود.</Feature>
      <Feature icon={<RiShieldCheckLine />} title="مالکیت داده">بکاپ رمزنگاری‌شده، Recovery Snapshot و انتقال مستقیم بین دستگاه‌ها برای کنترل بهتر داده وجود دارد.</Feature>
      <Feature icon={<RiLineChartLine />} title="داده بازار">قیمت‌های عمومی از BrsApi و در بخش‌های بورسی از Tindex/TSETMC دریافت می‌شوند؛ داده ساختگی تاریخی تولید نمی‌شود.</Feature>
      <Feature icon={<RiGithubFill />} title="مشارکت">گزارش باگ، پیشنهاد UX و Pull Request در GitHub خوش‌آمد است.</Feature>
      <Feature icon={<RiHeart3Line />} title="حمایت اختیاری">حمایت مالی هیچ قابلیت اضافه‌ای باز نمی‌کند و برای استفاده از برنامه لازم نیست.</Feature>
    </div>
    <Card><CardHeader><CardTitle>منابع و شفافیت</CardTitle></CardHeader><CardContent className="grid gap-3 text-sm sm:grid-cols-2"><External href={COMMUNITY_LINKS.repository}>سورس پروژه در GitHub</External><External href={COMMUNITY_LINKS.issues}>گزارش مشکل یا پیشنهاد</External><Internal href="/security">امنیت و گزارش مسئولانه</Internal><Internal href="/license">مجوز MIT</Internal><External href={COMMUNITY_LINKS.tindex}>منبع داده Tindex</External><External href={COMMUNITY_LINKS.support}>حمایت اختیاری از توسعه</External></CardContent></Card>
    <p className="text-xs leading-6 text-muted-foreground">پولم‌کو ابزار برنامه‌ریزی مالی شخصی است و توصیه سرمایه‌گذاری، حسابداری حرفه‌ای یا مشاوره مالی محسوب نمی‌شود. <Link href="/privacy" className="text-primary underline-offset-4 hover:underline">سیاست داده و حریم خصوصی</Link></p>
  </div>;
}

function Feature({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) { return <Card><CardHeader><div className="mb-2 grid size-10 place-items-center rounded-xl bg-primary/10 text-primary [&_svg]:size-5">{icon}</div><CardTitle>{title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-7 text-muted-foreground">{children}</p></CardContent></Card>; }
function Internal({ href, children }: { href: string; children: React.ReactNode }) { return <Link href={href} className="rounded-xl border bg-background/60 px-4 py-3 transition hover:bg-accent">{children}</Link>; }
function External({ href, children }: { href: string; children: React.ReactNode }) { return <a href={href} target="_blank" rel="noreferrer" className="rounded-xl border bg-background/60 px-4 py-3 transition hover:bg-accent">{children}</a>; }
