# معماری پولم‌کو

## Frontend

Next.js App Router، React، TypeScript و shadcn/ui New York.

## Storage

اطلاعات شخصی کاربر در IndexedDB با Dexie نگهداری می‌شود.

## Market

Market Store بین همه Routeها مشترک است. BrsApi منبع اصلی نرخ طلا/ارز/رمزارز است؛ اگر Quoteهای اصلی ناقص باشند Tindex با یک درخواست Boards به‌عنوان fallback نرخ دلار، طلای ۱۸ عیار و BTC را می‌دهد. Tindex همچنین نمادهای بورسی متصل به سبد را از داده TSETMC دریافت می‌کند. Snapshot واقعی روی دستگاه cache می‌شود و قیمت مصنوعی تولید نمی‌شود. Quoteهای Tindex در UI با لینک منبع داده مشخص می‌شوند.

## Background Push (Backlog)

کد آزمایشی Web Push از v0.13.0 در Repository نگه داشته شده، اما از v0.13.1 به‌صورت پیش‌فرض کاملاً غیرفعال است. Build عادی نه Cron دارد، نه به Redis وصل می‌شود و نه UI فعال‌سازی Push را نشان می‌دهد. هشدارهای محلی v0.12 همچنان هنگام اجرای اپ کار می‌کنند. فعال‌سازی آزمایشی آینده فقط با Feature Flag صریح انجام می‌شود؛ جزئیات در `docs/backlog/background-push.md` است.

## Flow

```text
Income
  ↓
Plan
  ↓
Execution
  ↓
Investment Portfolio
  ↓
Reports
```

## UI Rules

- هیچ select خام HTML
- فرم‌ها با React Hook Form + Zod
- Typography فقط از type tokens
- Table دسکتاپ / Card موبایل
- Skeleton باید هندسه واقعی UI را تقلید کند

## Usage analytics

از v0.18، Cloudflare Web Analytics فقط یک integration اختیاری در لایه Root Layout است. اگر `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` وجود نداشته باشد یا Build در Production نباشد، component مقدار `null` برمی‌گرداند و هیچ Script خارجی load نمی‌شود.

Analytics مستقیماً به Dexie، فرم‌ها، Search یا stateهای مالی وصل نیست و Custom Event ندارد. بنابراین telemetry محصول به داده‌های مالی اصلی دسترسی ندارد. جزئیات در `docs/analytics.md` است.

## Public website vs. local app

از v0.19 مسیر `/` برای Landing Page عمومی و route group `(public)` استفاده می‌شود. برنامه Local-first از `/dashboard` و route group `(workspace)` شروع می‌شود. این جداسازی فقط در سطح URL و layout است؛ IndexedDB همچنان بر اساس Origin مرورگر نگهداری می‌شود و تغییر Path داده موجود را منتقل یا reset نمی‌کند.

- routeهای عمومی می‌توانند index شوند و داخل `sitemap.xml` قرار می‌گیرند.
- routeهای مالی `(workspace)` `noindex` هستند و در `robots.txt` نیز disallow می‌شوند.
- `Providers` دیگر دیتابیس مالی را روی بازدید صفحات عمومی seed نمی‌کند.
- bootstrap دیتابیس داخل app انجام می‌شود و timeout/error صریح دارد تا خرابی یا Block شدن IndexedDB به Skeleton بی‌پایان تبدیل نشود.


## Safe application and database updates

از v0.20 چرخه Update عمداً دو مرحله‌ای است. Service Worker جدید در حالت `waiting` می‌ماند و UI فقط وقتی نسخه قبلی واقعاً کنترل صفحه را دارد، Banner به‌روزرسانی نشان می‌دهد. با تأیید کاربر پیام `SKIP_WAITING` ارسال می‌شود و پس از `controllerchange` صفحه یک‌بار Reload می‌شود. این الگو از فعال‌شدن ناگهانی Worker جدید وسط یک Session مالی جلوگیری می‌کند.

برای IndexedDB نیز اتصال Dexie به رویدادهای `blocked` و `versionchange` گوش می‌دهد. اگر تب قدیمی مانع Upgrade باشد، کاربر راهنمای بستن/تازه‌سازی تب‌های دیگر را می‌بیند. اگر تب دیگری Schema جدید را باز کند، تب قدیمی DB را می‌بندد و به‌جای ادامه نوشتن با کد قدیمی، Reload امن درخواست می‌کند. Live Queryهای مالی فقط بعد از Bootstrap موفق فعال می‌شوند.

هیچ‌کدام از این Flowها Site Data را پاک یا دیتابیس جدیدی با Origin متفاوت ایجاد نمی‌کنند.

## Verified data portability

از v0.21 نسخه برنامه و نسخه Schema دیتابیس در یک منبع مشترک (`lib/app-version.ts`) تعریف می‌شوند تا Backup، Recovery و Device Transfer درباره سازگاری داده تصمیم یکسان بگیرند.

فایل Backup جدید Envelope نسخه ۲ دارد: Payload می‌تواند AES-GCM باشد و SHA-256 digest خرابی فایل را قبل از Restore آشکار می‌کند. Restore ابتدا Envelope، Schema و جدول‌های ضروری را Validate می‌کند و Preview رکوردها را نشان می‌دهد؛ سپس و فقط پس از تأیید کاربر Recovery Snapshot ساخته و داده جایگزین می‌شود. Backupهای v1 همچنان خوانده می‌شوند.

Recovery Snapshotهای جدید Metadata نسخه دارند و انتقال مستقیم WebRTC نیز `schemaVersion` را داخل frame متادیتا می‌فرستد. داده‌ای که از Schema جدیدتر آمده باشد قبل از هر Import رد می‌شود. خود انتقال مستقیم برای سازگاری، Envelope رمزنگاری‌شده v1 را نگه می‌دارد و همان integrity بیرونی SHA-256 + AES-GCM را ادامه می‌دهد.


## Mobile navigation and accessibility

از v0.22 مسیرهای پرتکرار موبایل عمداً از مسیرهای کم‌تکرار جدا شده‌اند. Bottom Navigation چهار جریان روزانه `dashboard`، `income`، `investments` و `funds` را مستقیم نگه می‌دارد و Reports/Settings در Drawer «بیشتر» باقی می‌مانند. این تصمیم برای کاهش رفت‌وبرگشت در جریان «پول وارد شد → برنامه → اجرا/سرمایه/صندوق» است، نه برای افزودن سطح ناوبری جدید.

Shell موبایل و Bottom Navigation از `safe-area-inset-bottom` استفاده می‌کنند تا محتوای مالی زیر Home Indicator یا Gesture Area نرود. Desktop/Mobile nav با `aria-current` وضعیت Route فعال را اعلام می‌کنند و Drawer با `aria-expanded`/`aria-controls` به Trigger متصل است.

Global Search از v0.22 یک Combobox قابل کنترل با کیبورد است: Arrow Up/Down، Home/End و Enter نتیجه فعال را جابه‌جا/باز می‌کنند و تعداد نتایج در Live Region اعلام می‌شود. DataTable نیز Sort State و Pagination landmark را برای فناوری کمکی اعلام می‌کند. این لایه هیچ داده‌ای به Analytics یا Server جدید ارسال نمی‌کند.


## Performance boundaries (v0.23)

Chart libraries are intentionally kept out of high-frequency route entry code where a lighter representation is sufficient. Dashboard market sparklines use a small SVG renderer over real local snapshots; the portfolio area chart, Reports monthly bars, and investment market chart engine load through explicit dynamic boundaries. This is a bundle/hydration optimization only: it does not change IndexedDB, market-provider priority, Offline caching, or the rule that missing history must stay an honest empty state.

## Portfolio decision layer and PWA boundary (v0.24)

مرور ترکیب سبد یک لایه اطلاعاتی روی همان `portfolioPosition` موجود است و منطق بهای تمام‌شده را تغییر نمی‌دهد. `useInvestmentPortfolio` فقط منبع قیمت هر Position را به «market / manual / cost-basis fallback» برچسب می‌زند و `lib/portfolio-allocation.ts` سهم فعلی، سهم هدف، drift و gap ارزشی را به‌صورت Pure محاسبه می‌کند. اولویت پول جدید فقط از target gap خود کاربر می‌آید و وقتی جمع هدف‌ها ۱۰۰٪ نیست یا ارزش کل سبد صفر است، تولید نمی‌شود. هیچ مدل پیش‌بینی یا توصیه معامله‌ای در این لایه وجود ندارد.

از v0.24 Manifest نصب‌شونده دیگر Special Route سراسری Next نیست. فایل `public/app.webmanifest` فقط توسط `(workspace)` advertise می‌شود و `PwaUpdateNotice` نیز فقط همان‌جا Service Worker را رجیستر/بررسی می‌کند. بنابراین بازدید عادی `/` یک سایت عمومی است، در حالی که PWA با `id` و `start_url` روی `/dashboard` تعریف می‌شود. Scope عمداً `/` می‌ماند چون routeهای واقعی app مانند `/income`، `/funds` و `/investments` sibling هستند. برای نصب‌های قدیمی، فقط اجرای standalone روی ریشه با یک guard کوچک به Dashboard منتقل می‌شود؛ مرورگر عادی redirect نمی‌شود.


## Decision-focused reports and landing media (v0.25)

لایه `lib/report-insights.ts` فقط از داده‌های محلی موجود یک Snapshot تصمیمی Pure می‌سازد: پوشش تخصیص پول ورودی، فاصله زندگی/امنیت/رشد با قانون فعال، اجرای Plan Itemها و پوشش فعلی صندوق‌ها. اگر Allocationهای بازه مجموع پول ورودی را پوشش ندهند، Snapshot با `allocationReliable = false` علامت می‌خورد و UI اجازه نمی‌دهد یک فاصله ناقص مثل نتیجه قطعی نمایش داده شود. این لایه به Expense ledger، Forecast یا API جدید وابسته نیست.

Landing از v0.25 به‌جای preview کاملاً مصنوعی JSX، دو Asset تصویری تأییدشده Light/Dark را از `public/landing/` نمایش می‌دهد. عددهای این تصویر صریحاً Demo هستند و هیچ داده کاربر برای ساخت Landing خوانده نمی‌شود. Service Worker همچنان فقط در Workspace رجیستر می‌شود، بنابراین اضافه‌شدن این رسانه مرز Public/PWA نسخه v0.24 را تغییر نمی‌دهد.

Capture رسانه برای Windows نیز Production Server را با `process.execPath` و bin نصب‌شده Next.js اجرا می‌کند؛ این کار وابستگی به اجرای مستقیم `npm.cmd` در Child Process را حذف می‌کند و همان Browser Profile موقت/Fixture ساختگی را حفظ می‌کند.

## Production browser release gate (v0.26)

`check:release` یک لایه Browser QA کوچک روی Gateهای ساختاری موجود اضافه می‌کند و جای Unit Testها یا Manual PWA install QA را نمی‌گیرد. Runner با Chrome/Edge/Chromium و Chrome DevTools Protocol اجرا می‌شود تا وابستگی Playwright/Cypress یا Browser bundle جدید وارد پروژه نشود.

هر اجرا یک Browser Profile موقت می‌سازد، Origin تست را پاک می‌کند و Market/Push/Cloudflare requests را Block می‌کند. ابتدا `/` را به‌عنوان Landing عمومی بررسی می‌کند، سپس CTA واقعی را تا Fresh `/dashboard` دنبال می‌کند، ایجاد IndexedDB و Onboarding را تأیید می‌کند، Fixture ساختگی `scripts/media/demo-data.mjs` را داخل همان Profile Seed می‌کند و Dashboard/Reports را از Production Build واقعی می‌خواند. در همان Session، Manifest و Service Worker فقط از Workspace بررسی می‌شوند و بازگشت عادی به `/` نباید به Dashboard redirect شود.

این Gate عمداً محدود است: فقط قراردادهای Release-critical را پوشش می‌دهد و هر Flow جدید را به Browser suite اضافه نمی‌کند. اگر Regression جدیدی ثابت کند پوشش بیشتری لازم است، همان مورد به‌صورت هدفمند اضافه می‌شود.
