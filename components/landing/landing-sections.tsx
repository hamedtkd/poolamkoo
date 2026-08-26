import Link from "next/link";
import {
  RiArchiveLine,
  RiArrowLeftLine,
  RiBarChartBoxLine,
  RiDatabase2Line,
  RiExchangeLine,
  RiFundsLine,
  RiGithubFill,
  RiLineChartLine,
  RiLockPasswordLine,
  RiRefreshLine,
  RiShieldCheckLine,
  RiSmartphoneLine,
  RiWallet3Line,
} from "react-icons/ri";
import { ButtonLink } from "@/components/landing/landing-link-button";
import { MotionReveal } from "@/components/motion/reveal";
import { COMMUNITY_LINKS } from "@/lib/community";
import { APP_ENTRY_PATH } from "@/lib/site";

const workflow = [
  { icon: RiWallet3Line, title: "پول جدید را ثبت کن", text: "مبلغ و تاریخ را وارد کن و اگر بخشی مستقیم به یک صندوق می‌رود همان ابتدا مشخصش کن." },
  { icon: RiBarChartBoxLine, title: "برای هر بخش تصمیم بگیر", text: "نیازهای امروز، امنیت، رشد و لذت را با درصدها و هدف‌های قابل تغییر برنامه‌ریزی کن." },
  { icon: RiRefreshLine, title: "اجرای واقعی را ثبت کن", text: "برنامه فقط پیشنهاد نمی‌ماند؛ اجرای کامل یا جزئی را ثبت می‌کنی تا گزارش‌ها واقعیت را نشان دهند." },
  { icon: RiLineChartLine, title: "نتیجه را دنبال کن", text: "صندوق‌ها، خرید و فروش واقعی و وضعیت سبد سرمایه‌گذاری را کنار برنامه اولیه ببین." },
] as const;

const features = [
  { icon: RiDatabase2Line, title: "Local-first واقعی", text: "اطلاعات مالی اصلی در IndexedDB همان مرورگر می‌ماند و برای کار روزمره به حساب کاربری یا دیتابیس مرکزی نیاز نداری." },
  { icon: RiLockPasswordLine, title: "بکاپ رمزنگاری‌شده", text: "فایل بکاپ با AES-GCM رمز می‌شود. Recovery Snapshot هم قبل از تغییرات حساس یک راه برگشت محلی می‌دهد." },
  { icon: RiSmartphoneLine, title: "انتقال مستقیم دستگاه", text: "برای جابه‌جایی بین موبایل و دسکتاپ، انتقال WebRTC رمزنگاری‌شده داری و فایل بکاپ همیشه fallback باقی می‌ماند." },
  { icon: RiFundsLine, title: "سبد سرمایه‌گذاری واقعی", text: "خرید و فروش، Cost Basis، موجودی قدیمی، قیمت دستی و اتصال به داده بازار در یک مدل واحد قرار می‌گیرند." },
  { icon: RiExchangeLine, title: "داده بازار بدون جعل", text: "BrsApi و Tindex برای داده عمومی استفاده می‌شوند و وقتی داده واقعی در دسترس نیست، برنامه تاریخچه ساختگی تولید نمی‌کند." },
  { icon: RiArchiveLine, title: "واردکردن تاریخچه", text: "CSV فارسی یا انگلیسی، تاریخ شمسی یا میلادی و اعتبارسنجی فروش و رکورد تکراری برای انتقال داده‌های گذشته پشتیبانی می‌شود." },
] as const;

const faq = [
  { q: "آیا پولم‌کو حساب بانکی یا ثبت‌نام می‌خواهد؟", a: "نه. نسخه فعلی بدون حساب کاربری کار می‌کند و داده مالی اصلی روی همان دستگاه ذخیره می‌شود." },
  { q: "اگر مرورگر یا دستگاه را از دست بدهم چه می‌شود؟", a: "Local-first به معنی بکاپ خودکار ابری نیست. برای استفاده جدی باید فایل بکاپ رمزنگاری‌شده را در جای مستقلی نگه داری؛ خود برنامه هم این موضوع را دوره‌ای یادآوری می‌کند." },
  { q: "آیا پولم‌کو رایگان می‌ماند؟", a: "پروژه متن‌باز و با مجوز MIT منتشر شده است. حمایت مالی اختیاری است و هیچ قابلیت برنامه را قفل یا باز نمی‌کند." },
  { q: "این برنامه جای حسابداری یا مشاور سرمایه‌گذاری است؟", a: "نه. هدف پولم‌کو تصمیم‌گیری و پیگیری روی پول جدید و سرمایه‌گذاری شخصی است؛ نه حسابداری حرفه‌ای و نه توصیه خرید و فروش." },
] as const;

export function LandingSections() {
  return (
    <>
      <section id="workflow" className="scroll-mt-24">
        <SectionHeading eyebrow="گردش کار" title="از «پول وارد شد» تا «می‌دانم کجا رفت»" text="به‌جای اینکه فقط هزینه‌های گذشته را دسته‌بندی کنی، قبل از مصرف پول برایش مسیر تعریف می‌کنی و بعد اجرای واقعی را می‌سنجی." />
        <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {workflow.map(({ icon: Icon, title, text }, index) => (
            <MotionReveal key={title} delay={index * 0.035} className="h-full">
              <div className="h-full rounded-2xl border bg-card p-5 shadow-[0_8px_35px_rgba(0,0,0,.035)]">
                <div className="mb-5 flex items-center justify-between"><div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></div><span className="text-xs font-[650] tabular-nums text-muted-foreground">۰{index + 1}</span></div>
                <h3 className="type-card-title">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{text}</p>
              </div>
            </MotionReveal>
          ))}
        </div>
      </section>

      <section className="rounded-[30px] border bg-card/65 p-5 sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[.82fr_1.18fr] lg:items-center">
          <div>
            <div className="type-caption font-[650] text-primary">مالکیت داده</div>
            <h2 className="mt-2 type-page-title">داده مالی باید اول متعلق به خودت باشد.</h2>
            <p className="mt-4 text-sm leading-8 text-muted-foreground">پولم‌کو برای استفاده بدون Backend اجباری طراحی شده. داده اصلی روی دستگاه می‌ماند و ابزارهای بازیابی طوری ساخته شده‌اند که خودت درباره نگهداری و انتقالش تصمیم بگیری.</p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              <TrustChip icon={<RiShieldCheckLine />} text="بدون فروش داده" />
              <TrustChip icon={<RiDatabase2Line />} text="IndexedDB محلی" />
              <TrustChip icon={<RiLockPasswordLine />} text="Backup رمزنگاری‌شده" />
            </div>
            <Link href="/data-safety" className="mt-5 inline-flex items-center gap-1.5 text-sm font-[590] text-primary hover:underline">مدل ماندگاری داده را بخوان <RiArrowLeftLine /></Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {features.slice(0, 4).map(({ icon: Icon, title, text }) => <Feature key={title} icon={<Icon />} title={title} text={text} />)}
          </div>
        </div>
      </section>

      <section id="features" className="scroll-mt-24">
        <SectionHeading eyebrow="امکانات" title="برای تصمیم مالی واقعی، نه فقط یک داشبورد زیبا" text="از ورود داده قدیمی تا بازار و گزارش، هر بخش باید یک تصمیم یا بازیابی واقعی را ساده‌تر کند." />
        <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => <Feature key={title} icon={<Icon />} title={title} text={text} />)}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[28px] border bg-primary p-6 text-primary-foreground sm:p-8">
          <RiGithubFill className="size-8" />
          <h2 className="mt-5 type-page-title">رایگان، متن‌باز و قابل بررسی</h2>
          <p className="mt-3 max-w-xl text-sm leading-8 opacity-85">کد، مدل داده و تصمیم‌های امنیتی پروژه عمومی‌اند. می‌توانی سورس را ببینی، Issue باز کنی یا برای بهترشدن تجربه Pull Request بفرستی.</p>
          <a href={COMMUNITY_LINKS.repository} target="_blank" rel="noreferrer" className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-primary-foreground px-4 text-sm font-[620] text-primary transition hover:brightness-95">GitHub پروژه <RiArrowLeftLine /></a>
        </div>
        <div className="rounded-[28px] border bg-card p-6 sm:p-8">
          <div className="type-caption font-[650] text-primary">شفافیت</div>
          <h2 className="mt-2 type-page-title">Analytics بدون نگاه‌کردن به زندگی مالی تو</h2>
          <p className="mt-3 text-sm leading-8 text-muted-foreground">Cloudflare Web Analytics فقط در deploymentهایی که مالک پروژه فعالش کند برای بازدید و کارایی عمومی استفاده می‌شود. مبلغ، تراکنش، نام دارایی، جست‌وجو، فرم و Backup به Analytics وصل نیست.</p>
          <Link href="/analytics" className="mt-5 inline-flex items-center gap-1.5 text-sm font-[590] text-primary hover:underline">جزئیات Analytics <RiArrowLeftLine /></Link>
        </div>
      </section>

      <section id="faq" className="scroll-mt-24">
        <SectionHeading eyebrow="پرسش‌های رایج" title="قبل از واردکردن داده مالی، این‌ها را بدان" />
        <div className="mt-7 grid gap-3 md:grid-cols-2">
          {faq.map((item) => (
            <details key={item.q} className="group rounded-2xl border bg-card p-5 open:bg-accent/35">
              <summary className="cursor-pointer list-none type-card-title marker:hidden">{item.q}</summary>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-[30px] border bg-card p-6 text-center sm:p-10">
        <div className="mx-auto max-w-2xl">
          <div className="type-caption font-[650] text-primary">شروع بدون حساب کاربری</div>
          <h2 className="mt-2 type-page-title">برای پول بعدی، قبل از خرج شدن یک برنامه بساز.</h2>
          <p className="mt-3 text-sm leading-8 text-muted-foreground">همه چیز را لازم نیست روز اول کامل کنی. با یک ورودی شروع کن و مدل مالی خودت را قدم‌به‌قدم بساز.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <ButtonLink href={APP_ENTRY_PATH} size="lg">شروع رایگان <RiArrowLeftLine /></ButtonLink>
            <Link href="/guide" className="inline-flex h-12 items-center justify-center rounded-lg border px-5 text-sm font-[590] transition hover:bg-accent">راهنمای شروع</Link>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return <header className="max-w-3xl"><div className="type-caption font-[650] text-primary">{eyebrow}</div><h2 className="mt-2 type-page-title">{title}</h2>{text && <p className="mt-3 text-sm leading-8 text-muted-foreground">{text}</p>}</header>;
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="rounded-2xl border bg-background/65 p-5"><div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary [&_svg]:size-5">{icon}</div><h3 className="mt-4 type-card-title">{title}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{text}</p></div>;
}

function TrustChip({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/65 px-3 py-1.5 text-foreground [&_svg]:size-4 [&_svg]:text-primary">{icon}{text}</span>;
}
