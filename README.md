# پولم‌کو — تصمیم‌یار مالی Local‑First

پولم‌کو یک PWA موبایل‌فرست برای این سؤال است: **«این پولی که الان به دستم رسیده را این ماه چطور تقسیم کنم؟»**

این پروژه نرم‌افزار حسابداری روزانه نیست. تمرکز آن روی تقسیم پول جدید، صندوق اضطراری و هزینه‌های پیش‌رو، سرمایه‌گذاری واقعی و تحلیل نتیجه تصمیم‌هاست.



## اصلاحات v0.2.5

- نام محصول در رابط به **پولم‌کو** تغییر کرد.
- صفحه برنامه هر پول برای مانیتورهای بزرگ بازطراحی شد؛ کارت پایبندی دیگر تا ارتفاع محتوا کش نمی‌آید و گروه‌های زندگی/امنیت/رشد Grid مستقل دارند.
- هر کارت برنامه دکمه حذف دارد و سهم حذف‌شده دوباره برای ساخت کارت سریع آزاد می‌شود.
- از همان صفحه می‌توان کارت سریع برای زندگی، صندوق امنیت یا دارایی رشد ساخت.
- کنترل به‌روزرسانی بازار و تغییر تم از کنار لوگو به بخش ابزارهای سایدبار/منوی موبایل منتقل شد.
- تغییر روشن/تاریک با View Transition دایره‌ای از محل دکمه شروع می‌شود و روی کل اپ گسترش پیدا می‌کند.

## اصلاحات v0.2.4

- هر «پول جدید» حالا یک برنامه اجرایی مستقل می‌سازد: زندگی، امنیت/صندوق‌ها و خریدهای پیشنهادی سبد رشد.
- مسیر `/income/[id]` اضافه شده و برای هر پول ورودی درصد اجرای برنامه، مبلغ اجراشده و باقی‌مانده را نشان می‌دهد.
- خریدهای پیشنهادی انجام‌نشده در ابتدای صفحه سرمایه‌گذاری دیده می‌شوند و «ثبت خرید» مبلغ پیشنهادی و آخرین قیمت واقعی بازار را از قبل پر می‌کند.
- بعد از ثبت «پول جدید»، کاربر مستقیم به صفحه برنامه همان Money Event هدایت می‌شود تا اجرای زندگی/امنیت/خریدهای رشد را ثبت کند.
- تراکنش خرید به همان Money Event و Plan Item لینک می‌شود؛ حذف تراکنش نیز وضعیت اجرای برنامه را دوباره محاسبه می‌کند.
- گزارش‌ها KPI و DataTable «پایبندی به برنامه» دارند تا پیشنهاد و اجرای واقعی قابل مقایسه باشد.
- BrsApi رایگان فقط یک‌بار از endpoint جامع Gold_Currency در هر بار بارگذاری کامل اپ فراخوانی می‌شود؛ جابه‌جایی بین Routeها API را دوباره صدا نمی‌زند.
- دکمه Refresh بازار در Shell و Dashboard وجود دارد و فقط با درخواست کاربر قیمت تازه می‌گیرد.
- پاسخ رایگان Gold_Currency شامل طلا، ارز و رمزارز است؛ بنابراین برای BTC/USDT درخواست دوم حذف شده است.
- تمام fallback/demoهای ساختگی بازار و Candlestick حذف شده‌اند. نمودار فقط از Snapshotهای واقعی محلی OHLC می‌سازد؛ تا قبل از کافی‌شدن داده، empty-state نمایش داده می‌شود.
- Snapshotهای قدیمی با `source=demo` در مهاجرت پاک می‌شوند و Service Worker cache برای حذف fallbackهای قدیمی bump شده است.

## اصلاحات v0.2.3

- فیلد مبلغ در «پول جدید دارم» دوباره تمام عرض Dialog را می‌گیرد و در دسکتاپ نیمه‌کاره نمایش داده نمی‌شود.
- مرحله پیشنهاد حالا ویرایش‌پذیر است: سهم زندگی، امنیت و رشد را همان‌جا با Slider تغییر می‌دهی و مبلغ هر بخش لحظه‌ای دوباره محاسبه می‌شود.
- تغییر درصدهای یک پول فقط روی همان ورودی اعمال می‌شود و قانون اصلی کاربر در تنظیمات را تغییر نمی‌دهد.
- هنگام افزایش سهم زندگی یا امنیت، اختلاف ابتدا از «رشد» جبران می‌شود؛ هنگام تغییر رشد نیز مجموع تخصیص همیشه روی ۱۰۰٪ نگه داشته می‌شود.
- دکمه «بازگشت به پیشنهاد» پیشنهاد اولیه/هوشمند همان پول را برمی‌گرداند.
- برنامه صندوق‌ها و سرمایه‌گذاری بعد از هر تغییر درصد، بر اساس مبالغ جدید دوباره ساخته می‌شود.
- Service Worker cache برای انتشار جدید bump شده است.

## اصلاحات v0.2.2

- خطای خالی‌بودن مبلغ دیگر پیام انگلیسی Zod نمایش نمی‌دهد؛ تمام Schemaهای فرم پیام‌های خطای فارسی و مشخص دارند.
- فیلد مبلغ «پول جدید» از حالت بیش‌ازحد بزرگ خارج شد و فیلدهای عنوان و تاریخ ارتفاع و خوانایی بیشتری گرفتند.
- دکمه بستن Dialog در رابط RTL به سمت چپ منتقل شد و فضای Header با آن هماهنگ است.
- Skeleton جدول‌ها responsive شد: زیر ۷۶۸ پیکسل Card و از اندازه لپ‌تاپ به بالا دقیقاً اسکلت Table با header/row/pagination نمایش داده می‌شود.
- Skeleton صفحه سرمایه‌گذاری نیز دو DataTable واقعی دسکتاپ و Card موبایل را تقلید می‌کند.
- خطاهای Web Crypto/Backup قبل از نمایش به کاربر فارسی‌سازی می‌شوند و خطای خام مرورگر نمایش داده نمی‌شود.
- Service Worker cache به نسل جدید ارتقا یافته است.


## اصلاحات v0.2.1

- تمام MoneyInputها خروجی دیداری فارسی دارند: `۱۲۳٬۴۵۶` به‌جای `123,456`. ورودی فارسی، عربی و لاتین همچنان پذیرفته و به مقدار عددی استاندارد تبدیل می‌شود.
- PriceInput در سطح اپ با `fa-IR` اجرا می‌شود و از فونت Mikhak استفاده می‌کند؛ خود مقدار عددی در state همچنان `number` باقی می‌ماند.
- پالت‌های Rose / Violet / Amber / Blue در Dark Mode توکن مستقل دارند؛ انتخاب رنگ دیگر توسط `.dark` به Rose برنمی‌گردد.
- Dialog و AlertDialog روی دسکتاپ با viewport گریدی RTL-safe دقیقاً در مرکز قرار می‌گیرند و در موبایل Bottom Sheet باقی می‌مانند.
- Service Worker cache به نسل جدید ارتقا یافته تا استایل قدیمی PWA پس از آپدیت باقی نماند.
- `npm run check:regressions` برای جلوگیری از برگشت همین سه باگ اضافه شده است.

## قابلیت‌های اصلی

- Next.js 16 App Router + React 19 + TypeScript
- PWA موبایل‌فرست با Offline shell و Service Worker
- Local‑First: داده شخصی فقط در IndexedDB / Dexie
- shadcn/ui New York + الگوهای RTL و responsive از PersianLabs/ui
- فونت Mikhak Variable از CDN؛ هیچ فایل فونتی داخل مخزن توزیع نمی‌شود
- Remix Icons از `react-icons/ri`
- تم روشن / تاریک / سیستم با دکمه تغییر سریع و پالت‌های Rose، Violet، Amber و Blue
- Onboarding چهارسبکی + قانون کاملاً سفارشی
- قانون سه‌بخشی زندگی / امنیت / رشد
- صندوق اضطراری و Sinking Fund برای درمان، مراسم، سفر، بیمه و موارد سفارشی
- ثبت Buy/Sell دارایی، Average Cost، Unrealized / Realized P&L
- DataTable واقعی در دسکتاپ و Card List در موبایل
- نمودارهای Gauge، Donut، Area، Bar، Sparkline و Candlestick
- Backup/Restore JSON با گزینه رمزنگاری AES‑GCM
- قیمت بازار از BrsApi و ذخیره Snapshot محلی برای ساخت تاریخچه آینده

## مسیرها

هر بخش Route مستقل دارد و دیگر همه UI در یک صفحه رندر نمی‌شود:

```text
/              Dashboard
/income        پول‌های ورودی
/income/[id]   برنامه و اجرای همان پول ورودی
/investments   سرمایه‌گذاری و Candlestick
/funds         صندوق‌ها
/reports       گزارش و تحلیل
/settings      تنظیمات، تم، واحد، امنیت مالی و بکاپ
```

Shared shell و داده Local‑First در Route Group زیر نگهداری می‌شوند:

```text
app/(app)/layout.tsx
components/app/app-route-layout.tsx
components/app/app-runtime.tsx
```

## PersianLabs UI policy

قانون UI پروژه این است:

1. ابتدا PersianLabs/ui
2. سپس shadcn/ui New York
3. فقط در نبود کامپوننت مناسب، کامپوننت سفارشی با API و رفتار هم‌راستا با shadcn

در نسخه فعلی این موارد به‌طور مشخص اصلاح شده‌اند:

- `DatePicker`: تقویم پیش‌فرض شمسی، RTL، اعداد فارسی، Popover در دسکتاپ و Drawer در موبایل.
- `PriceInput`: پذیرش اعداد فارسی/عربی/لاتین، group کردن مبلغ هنگام تایپ و مقدار عددی استاندارد.
- `MoneyInput`: ترکیب `PriceInput + InputGroupAddon`؛ متن «تومان/ریال» دیگر روی عدد overlap نمی‌کند.
- Dialogها: در موبایل bottom drawer/glass و در دسکتاپ dialog مرکزی.
- Alert Dialogها نیز در موبایل به action-sheet پایین صفحه تبدیل می‌شوند.
- هیچ `<select>` خام یا `<input type="date">` در کد business وجود ندارد.

فایل‌های کلیدی:

```text
components/ui/date-picker.tsx
components/ui/persian-calendar.tsx
components/ui/price-input.tsx
components/ui/input-group.tsx
components/ui/money-input.tsx
components/ui/dialog.tsx
components/ui/alert-dialog.tsx
```

## فرم و Validation

فرم‌های اصلی با `react-hook-form` و `zod` پیاده‌سازی شده‌اند:

- پول جدید
- ساخت/ویرایش صندوق
- واریز/برداشت صندوق
- ساخت/ویرایش دارایی
- خرید/فروش سرمایه‌گذاری
- ویرایش پول ورودی
- Onboarding
- قانون تخصیص
- برنامه صندوق اضطراری

Schemaها در `lib/validation.ts` قرار دارند و business logic فرم‌ها داخل custom hookها نگهداری می‌شود.

## قانون معماری فایل‌ها

فایل TypeScript/TSX بالاتر از ۲۵۰ خط مجاز نیست. این قانون در CI/local قابل بررسی است:

```bash
npm run check:lines
```

همچنین:

```bash
npm run check:ui
```

بررسی می‌کند که:

- raw `<select>` وجود نداشته باشد.
- native date input استفاده نشده باشد.
- PriceInput فقط از لایه MoneyInput/InputGroup مصرف شود.
- جدول business خارج از DataTable ساخته نشده باشد.

منطق محاسبات و stateهای پیچیده از Sectionها جدا شده و در custom hookهاست، از جمله:

```text
hooks/use-dashboard-metrics.ts
hooks/use-reports-data.ts
hooks/use-investment-portfolio.ts
hooks/use-new-money.ts
hooks/use-income-editor.ts
hooks/use-settings-manager.ts
hooks/use-app-theme.ts
```

## Skeleton

برای هر Route اسکلتون متناسب با ساختار همان صفحه وجود دارد:

```text
components/skeletons/page-skeleton.tsx
app/(app)/loading.tsx
```

Dashboard، Investments، Reports، Settings و صفحات لیستی skeleton مجزا دارند تا layout shift حداقل باشد. مسیر جزئیات برنامه پول ورودی نیز Skeleton مخصوص خودش را دارد.

## رفع خطای رنگ Candlestick

`lightweight-charts` نمی‌تواند رنگ‌های `lab()/oklch()` را مستقیم parse کند. بنابراین تم اصلی همچنان با OKLCH شادکن کار می‌کند، ولی Canvas chart توکن‌های sRGB مستقل دارد:

```text
--chart-canvas-bg
--chart-canvas-text
--chart-canvas-grid
--chart-canvas-border
--chart-canvas-up
--chart-canvas-down
```

`FinancialChart` تغییر class تم و `data-palette` را مشاهده می‌کند و هنگام تغییر تم chart را با رنگ صحیح بازسازی می‌کند. این معماری خطای `Failed to parse color: lab(...)` را حذف می‌کند.

## داده‌های بازار

کلید BrsApi را در `.env.local` قرار بده:

```bash
cp .env.example .env.local
```

```env
BRS_API_KEY=YOUR_FREE_KEY
```

Snapshotهای واقعی بازار روی دستگاه ذخیره می‌شوند و در طول زمان به OHLC/Candlestick محلی تبدیل می‌شوند. اگر داده تاریخی واقعی کافی نباشد، نمودار نمایش داده نمی‌شود؛ پولم‌کو هیچ تاریخچه یا Candlestick مصنوعی تولید نمی‌کند و هیچ درخواست تاریخی جداگانه‌ای هم نمی‌فرستد.

API Key فقط در Route Handler سرور خوانده می‌شود و وارد bundle مرورگر نمی‌شود.

## واحد پول

مقادیر canonical در **تومان** ذخیره می‌شوند. انتخاب تومان/ریال فقط presentation را تغییر می‌دهد و تاریخچه را بازنویسی نمی‌کند.

## تم

- `next-themes` کلاس `dark` را روی `<html>` مدیریت می‌کند.
- انتخاب Light/Dark/System در IndexedDB ذخیره می‌شود.
- دکمه سریع Moon/Sun در Header و Sidebar وجود دارد.
- تغییر palette روی `data-palette` اعمال می‌شود.
- chartهای Canvas هنگام تغییر theme/palette refresh می‌شوند.

## اجرا

Node.js 20+ پیشنهاد می‌شود.

```bash
npm install
npm run dev
```

بررسی کامل:

```bash
npm run typecheck
npm run lint
npm run check:lines
npm run check:ui
npm run check:regressions
npm run build
```

## PWA

Service Worker فقط در Production ثبت می‌شود. برای تست Install/Offline:

```bash
npm run build
npm start
```

مسیرهای اصلی اپ در app shell cache قرار دارند. در مرورگرهای پشتیبانی‌شده می‌توان اپ را با `Install app` / `Add to Home Screen` نصب کرد.

## Backup

Backup می‌تواند plain JSON یا رمزنگاری‌شده باشد. حالت رمزدار از PBKDF2/SHA‑256 و AES‑GCM 256-bit استفاده می‌کند. رمز بکاپ در اپ ذخیره نمی‌شود.

## امنیت و محدودیت محصول

- `.env.local` را commit نکن.
- قبل از پاک‌کردن Site Data بکاپ بگیر.
- پولم‌کو سفارش بازار ارسال نمی‌کند.
- پیشنهادهای تخصیص، توصیه تضمینی سرمایه‌گذاری نیستند؛ خرید واقعی فقط با Transaction ثبت‌شده وارد محاسبات می‌شود.

## مجوز

کد پروژه MIT است. Mikhak و کتابخانه‌های ثالث مجوزهای خودشان را دارند.
