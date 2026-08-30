# Release Checklist

این چک‌لیست قبل از Tag و GitHub Release اجرا می‌شود.

## 1. Quality gate

```bash
npm install
npm run check:release
```

برای عیب‌یابی می‌توان همان مسیر را جدا اجرا کرد: `npm run check`، سپس `npm run build` و در پایان `npm run test:browser:release:built`.

موارد زیر باید بدون خطا تمام شوند:

- [ ] `check:icons` — همه Named Importهای `react-icons/ri` در نسخه نصب‌شده معتبر باشند
- [ ] TypeScript
- [ ] ESLint
- [ ] unit tests
- [ ] file line limit
- [ ] UI architecture checks
- [ ] regression checks
- [ ] production Next.js build
- [ ] production browser release smoke

## 2. Core flows

- [ ] ثبت پول جدید
- [ ] تغییر درصدهای همان پول
- [ ] ساخت / ویرایش / حذف Plan Item
- [ ] ثبت اجرای کامل و جزئی
- [ ] ثبت خرید پیشنهادی از Plan
- [ ] ثبت خرید و فروش مستقل
- [ ] ساخت و ویرایش صندوق
- [ ] گزارش پایبندی و Portfolio P/L
- [ ] خلاصه Share گزارش بدون مبلغ/نام دارایی و CSV کامل فقط با اقدام صریح کاربر
- [ ] Privacy eye اعداد مالی را در تمام بخش‌های حساس مخفی کند

## 3. Navigation

- [ ] Sidebar باز و بسته شود و در حالت Collapsed لوگو با دکمه Expand تداخل نداشته باشد
- [ ] Tooltip تمام آیکون‌های Sidebar در حالت Collapsed قابل خواندن باشد
- [ ] `Ctrl/Cmd + K` جست‌وجوی کلی را باز کند
- [ ] `/` خارج از input جست‌وجوی کلی را باز کند
- [ ] جست‌وجو routeها، پول‌های ورودی، صندوق‌ها و دارایی‌ها را پیدا کند
- [ ] ناوبری موبایل و Drawer میانبرها درست کار کنند
- [ ] More sheet مقصدهای Bottom Navigation را تکرار نکند و Search قبل از تایپ فقط میانبرهای محدود نشان دهد

## 4. PWA

- [ ] Manifest بدون خطا load شود
- [ ] Favicon در مرورگر نمایش داده شود
- [ ] آیکون نصب از لوگوی رسمی پولم‌کو باشد
- [ ] نصب PWA روی Chrome/Edge desktop تست شود
- [ ] نصب روی Android تست شود
- [ ] Offline route بعد از قطع شبکه قابل دسترسی باشد
- [ ] Service Worker نسخه قبلی cache را نگه ندارد
- [ ] Refresh بعد از Deploy assetهای release قبلی را با release جدید مخلوط نکند

## 5. Theme and responsive QA

- [ ] Light / Dark / System
- [ ] پالت طلایی در Light و Dark خوانا باشد
- [ ] Theme transition روی موبایل بدون lag محسوس اجرا شود
- [ ] 360px / 390px / 430px
- [ ] tablet
- [ ] 1366px laptop
- [ ] 1440px desktop
- [ ] 1920px و نمایشگرهای عریض

## 6. Local-first data safety

- [ ] Backup export
- [ ] Restore روی دیتابیس خالی
- [ ] Restore داده نسخه قدیمی
- [ ] Reload بدون از دست رفتن داده
- [ ] Repair flow برای Plan Item ناقص
- [ ] API key و `TINDEX_API_TOKEN` داخل repository، backup عمومی یا `NEXT_PUBLIC_*` commit نشده باشند

## 7. Release

پس از پاس شدن QA:

```bash
git status
git tag -a vX.Y.Z -m "Poolamkoo vX.Y.Z"
git push origin main
git push origin vX.Y.Z
```

سپس GitHub Release را از همان Tag بساز و Release Notes را از `docs/releases/` تهیه کن. README نباید به changelog نسخه تبدیل شود.

## 8. Date filters and mobile sheet

- [ ] لوگوی Desktop و Mobile به صفحه خانه برگردد
- [ ] تاریخ امروز به‌صورت شمسی در Header نمایش داده شود
- [ ] بازه زمانی روی ورودی‌ها، Dashboard و Reports اعمال شود
- [ ] پاک کردن بازه، حالت «همه زمان» را برگرداند
- [ ] Drawer موبایل با کشیدن دستگیره به پایین بسته شود و حرکت دست با انیمیشن بازشدن تداخل نداشته باشد
- [ ] Bottom Navigation روی محتوای روشن و تاریک خوانا بماند

## 9. Market providers

- [ ] بدون `TINDEX_API_TOKEN` ساخت سهام/ETF با قیمت دستی همچنان کار کند
- [ ] با توکن معتبر، جست‌وجوی «عیار» و «سیمین» نتیجه واقعی برگرداند
- [ ] قیمت بورس از ریال به تومان تبدیل شود
- [ ] Refresh فقط نمادهای بورسی متصل به سبد را درخواست کند
- [ ] در قطع Provider، آخرین Snapshot واقعی یا fallback دستی نمایش داده شود
- [ ] هیچ توکن market-data داخل response یا client bundle دیده نشود

## 10. Background Push backlog

- [ ] Deploy عادی بدون VAPID، Redis و `CRON_SECRET` کامل کار کند
- [ ] `vercel.json` هیچ Cron مربوط به Market Alert نداشته باشد
- [ ] `NEXT_PUBLIC_EXPERIMENTAL_BACKGROUND_PUSH` در Production عادی فعال نباشد
- [ ] UI فعال‌سازی Background Push در حالت عادی نمایش داده نشود
- [ ] هشدارهای محلی بازار هنگام اجرای اپ همچنان کار کنند
- [ ] APIهای Push/Cron بدون Feature Flag آزمایشی عملیات Server-side انجام ندهند
- [ ] کد و تست‌های آزمایشی Push برای Backlog در Repository باقی بمانند

## 11. Privacy-first analytics

- [ ] بدون `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` هیچ request به `static.cloudflareinsights.com` دیده نشود
- [ ] در Development حتی با توکن تنظیم‌شده Beacon اجرا نشود
- [ ] در Production با توکن معتبر فقط یک Cloudflare Web Analytics script وجود داشته باشد
- [ ] Page Viewهای routeهای SPA در Cloudflare Web Analytics دیده شوند
- [ ] Query String در گزارش Analytics ظاهر نشود
- [ ] هیچ Custom Event یا payload حاوی مبلغ، نام دارایی، تراکنش، Search، فرم یا Backup وجود نداشته باشد
- [ ] صفحه `/analytics` و `/privacy` وضعیت و مرز داده را به‌درستی توضیح دهند
- [ ] اگر Cloudflare automatic injection روی دامنه فعال است، manual + automatic هم‌زمان استفاده نشوند

## 12. Landing page and production hardening

- [ ] `/` Landing Page عمومی را بدون ساخت/Seed کردن دیتابیس مالی نمایش دهد
- [ ] CTA اصلی Landing و لوگوی داخل اپ به `/dashboard` برسند
- [ ] PWA نصب‌شده با `/dashboard` شروع شود
- [ ] داده IndexedDB نسخه قبلی بعد از تغییر مسیر `/` → `/dashboard` همان‌جا در دسترس بماند
- [ ] `robots.txt` routeهای مالی و `/api/` را disallow کند
- [ ] `sitemap.xml` فقط routeهای عمومی را فهرست کند
- [ ] metadata routeهای داخل `(workspace)` دارای `noindex` باشد
- [ ] قطع شبکه Banner کوچک Offline را نشان دهد و داده محلی همچنان قابل استفاده باشد
- [ ] `/offline` بعد از برگشت اتصال امکان Retry واضح داشته باشد
- [ ] خطای بازشدن/مسدودشدن IndexedDB به‌جای Skeleton بی‌پایان پیام امن نشان دهد
- [ ] هیچ Error UI به‌عنوان اولین راه‌حل پیشنهاد پاک‌کردن Site Data ندهد
- [ ] 404 و Global Error روی موبایل و دسکتاپ قابل استفاده باشند
- [ ] Skip link با Tab روی Public Shell و App Shell ظاهر و قابل استفاده باشد


## 13. Safe updates and multi-tab local data

- [ ] Deploy نسخه جدید در حالی که نسخه قبلی باز است، Banner «نسخه جدید پولم‌کو آماده است» را بدون Reload ناگهانی نشان دهد
- [ ] انتخاب «بعداً» Session فعلی را قطع نکند
- [ ] انتخاب «به‌روزرسانی» Worker منتظر را فعال کند و فقط بعد از `controllerchange` یک Reload انجام شود
- [ ] اولین نصب Service Worker بدون نمایش Update کاذب انجام شود
- [ ] Cache نسخه قبلی فقط هنگام Activate شدن Worker جدید پاک شود
- [ ] اگر یک تب قدیمی Upgrade IndexedDB را Block کند، تب جدید پیام بستن/تازه‌سازی تب دیگر را نشان دهد
- [ ] اگر تب دیگری Schema جدید را باز کرد، تب قدیمی اتصال DB را ببندد و ادامه نوشتن ندهد
- [ ] Reload بعد از `versionchange` داده موجود را روی همان Origin/IndexedDB نگه دارد
- [ ] هیچ Flow به‌روزرسانی پیشنهاد Clear Site Data ندهد

## 14. Verified backups and data portability

- [ ] بکاپ رمزنگاری‌شده جدید ساخته شود و در Preview تاریخ، رمزنگاری و تعداد رکوردها درست دیده شود
- [ ] بکاپ بدون رمز جدید نیز digest معتبر داشته باشد و قبل از Restore قابل بررسی باشد
- [ ] یک کاراکتر از Payload بکاپ v2 تغییر داده شود و Restore قبل از تغییر IndexedDB با خطای صحت فایل متوقف شود
- [ ] یک بکاپ واقعی v1 از نسخه‌های قبلی همچنان Preview و Restore شود
- [ ] Backup با `schemaVersion` بالاتر از نسخه فعلی قبل از ساخت Recovery/Import رد شود
- [ ] Recovery Snapshot جدید `schemaVersion` داشته باشد و Snapshot قدیمی بدون Metadata همچنان به‌عنوان Legacy قابل Restore باشد
- [ ] Device Transfer از فرستنده جدید `schemaVersion` را اعلام کند و گیرنده داده Schema جدیدتر را قبل از Import رد کند
- [ ] Restore موفق همچنان قبل از جایگزینی یک Recovery Snapshot از وضعیت فعلی بسازد
- [ ] هیچ خطای Backup/Recovery پیشنهاد Clear Site Data ندهد

## 15. Mobile accessibility and navigation

- [ ] Bottom Navigation روی 360px / 390px / 430px «خانه، ورودی‌ها، سرمایه، صندوق‌ها، بیشتر» را بدون بریدگی نمایش دهد
- [ ] روی دستگاه/شبیه‌ساز دارای Home Indicator، Bottom Navigation و آخرین محتوای صفحه با Safe Area تداخل نداشته باشند
- [ ] Route فعال در Desktop و Mobile برای Screen Reader با `aria-current` مشخص باشد
- [ ] دکمه «بیشتر» وضعیت باز/بسته و ارتباطش با Drawer را اعلام کند
- [ ] Global Search با Arrow Up/Down، Home/End و Enter فقط نتیجه فعال را باز کند
- [ ] تغییر Query در Global Search انتخاب را به اولین نتیجه برگرداند و تعداد نتایج اعلام شود
- [ ] تمام Icon-only actionهای اصلی Income/Funds/Portfolio/Alerts نام قابل خواندن برای Screen Reader داشته باشند
- [ ] Sort جدول با Keyboard قابل اجرا باشد و `aria-sort` تغییر کند
- [ ] Dialog/Drawer با Escape بسته شوند و Close/Description نام و توضیح قابل دسترسی داشته باشند
- [ ] Focus ring روی Navigation، Search Result و actionهای سفارشی در Light/Dark قابل مشاهده باشد


### Performance regression gate

`npm run check:performance` verifies that Dashboard, Reports, and investment market chart engines remain behind the intended lightweight/lazy boundaries. It is a structural guard, not a substitute for checking real Core Web Vitals after deployment.

## 16. Portfolio decision UX and PWA install boundary

- [ ] `/` در مرورگر عادی Landing عمومی را بدون Redirect نمایش دهد
- [ ] HTML/metadata Landing لینک `app.webmanifest` یا `appleWebApp` capability نداشته باشد
- [ ] `/dashboard` Manifest `/app.webmanifest` را advertise کند
- [ ] Manifest دارای `id` و `start_url` برابر `/dashboard` و `display: standalone` باشد
- [ ] اجرای standalone روی `/` به `/dashboard` منتقل شود، اما public routeهای دیگر redirect نشوند
- [ ] Service Worker فقط بعد از ورود به Workspace رجیستر شود و Banner Update نسخه‌های قبل همان رفتار explicit acceptance را حفظ کند
- [ ] explicit precache شامل `/dashboard` و `/offline` باشد اما `/` را نداشته باشد
- [ ] سبد با target مجموع ۱۰۰٪ سهم فعلی، هدف و فاصله هر دارایی را درست نمایش دهد
- [ ] دارایی کمتر/بیشتر از هدف فقط به‌عنوان فاصله با هدف کاربر نمایش داده شود، نه توصیه خرید/فروش
- [ ] وقتی مجموع targetها ۱۰۰٪ نیست، اولویت پول جدید نمایش داده نشود
- [ ] دارایی موجود بدون Market/Manual price هشدار ناقص‌بودن مرور allocation را فعال کند
- [ ] Desktop table و Mobile cards سهم فعلی + هدف + status را قابل خواندن نمایش دهند
- [ ] SensitiveValue همچنان روی gapهای پولی و ارزش‌های مالی اعمال شود
- [ ] IndexedDB schema روی 6 باقی بماند و Backup/Restore format تغییر نکند


## 17. Product media capture

- [ ] `npm run media:capture` روی Production Build واقعی بدون خطای Runtime اجرا شود
- [ ] خروجی‌های Landing، Dashboard، Investments و Reports در `docs/assets/screenshots/` ساخته شوند
- [ ] Capture فقط از Browser Profile موقت و Fixture ساختگی استفاده کند و Profile واقعی کاربر را نخواند
- [ ] Market API، Push و Cloudflare Analytics هنگام Capture مسدود باشند تا Screenshot به Secret یا داده شبکه وابسته نباشد
- [ ] `npm run media:capture:built` روی Build آماده بدون Build دوباره همان مسیر را اجرا کند
- [ ] Workflow دستی GitHub Actions با نام `Product media` Artifact `poolamkoo-product-screenshots` را بسازد و Repository را خودکار Commit نکند


## 18. Reports decision insights and landing media

- [ ] Landing در Light تصویر `poolamkoo-finance-light.webp` و در Dark تصویر `poolamkoo-finance-dark.webp` را نشان دهد
- [ ] تصویر Hero روی 390px و 1440px بدون بریدگی یا Overflow افقی نمایش داده شود
- [ ] Landing همچنان بدون بازکردن/Seed کردن IndexedDB مالی قابل مشاهده باشد
- [ ] Reports در بازه بدون داده، Donut یا سهم ۱۰۰٪ ساختگی از قانون پول نشان ندهد
- [ ] Allocation ناقص با پیام صریح مشخص شود و «فاصله معتبر با قانون» از آن استنتاج نشود
- [ ] قانون معتبر و Allocation کامل، زندگی/امنیت/رشد را با سهم فعلی و هدف مقایسه کند
- [ ] «برای مرور بعدی» فقط از Plan/Allocation/Fund داده ثبت‌شده استفاده کند و توصیه معامله یا پیش‌بینی بازار ندهد
- [ ] `npm run media:capture:built` روی Windows بدون `spawn EINVAL` Production Server را بالا بیاورد
- [ ] Capture هر دو `landing-light-desktop.png` و `landing-dark-desktop.png` را بسازد
- [ ] IndexedDB schema روی 6 و Backup/Restore contract بدون تغییر باقی بماند


## 19. Production browser release smoke

- [ ] `clean:obsolete` روی checkout ارتقایافته `app/manifest.ts` قدیمی را حذف کند و `public/app.webmanifest` را نگه دارد

- [ ] `npm run check:release` یک Build می‌سازد و Browser Smoke را روی همان Build اجرا می‌کند
- [ ] تست با Profile موقت `poolamkoo-release-smoke-*` اجرا شود و در پایان Profile حذف شود
- [ ] Landing عادی `/` بدون Manifest نصب و بدون Service Worker registration اولیه باز شود
- [ ] CTA «شروع رایگان» واقعاً به `/dashboard` برسد و Fresh Onboarding دیده شود
- [ ] Fresh IndexedDB مقدار `onboardingComplete: false` داشته باشد و «فعلاً ردش کن» آن را Persist کند
- [ ] Fixture نمایشی محلی روی Dashboard رندر شود و به Profile واقعی مرورگر دسترسی نداشته باشد
- [ ] Browser Smoke با `prefers-reduced-motion: no-preference` اجرا شود و عنوان/کارت‌های Dashboard در حالت Motion عادی واقعاً visible بمانند
- [ ] Modal «پول جدید دارم» از Dashboard باز شود و عنوان، مبلغ و فرم داخل بدنه Dialog قابل مشاهده باشند؛ قاب خالی قابل قبول نیست
- [ ] Reports با Fixture نمایشی `جمع‌بندی تصمیمی این بازه` و مقایسه تخصیص ثبت‌شده را نمایش دهد
- [ ] Workspace Manifest `/app.webmanifest` را advertise کند و `id/start_url=/dashboard`, `scope=/`, `display=standalone` باشد
- [ ] Service Worker در Workspace ثبت شود اما بازگشت مرورگر عادی به `/` همچنان Landing را نشان دهد
- [ ] Market/Push/Cloudflare requests در Browser Smoke مسدود باشند تا سهمیه بیرونی مصرف نشود
- [ ] Workflow دستی GitHub Actions با نام `Release smoke` همان `npm run check:release` را اجرا کند
- [ ] نصب واقعی PWA روی Desktop/Android همچنان Manual QA باقی بماند؛ Browser Smoke جای تست نصب واقعی را نمی‌گیرد

## 20. Runtime fetch cleanup and CSS stagger motion

- [ ] باز/بسته‌شدن component آمار GitHub در Development هیچ `AbortError` در Runtime overlay یا `unhandledRejection` ایجاد نکند
- [ ] `useGithubStats` از `fetch`، `AbortController` و `AbortSignal` استفاده نکند؛ cleanup فقط `active` guard را خاموش کند
- [ ] جست‌وجوی نماد بازار برای جلوگیری از پاسخ stale از request id استفاده کند و به AbortController متکی نباشد
- [ ] `tailwindcss-animated` در `globals.css` از مسیر صریح `tailwindcss-animated/src/index.css` import شود و `npm run check:animations` هم CSS entry و `motion/react` را resolve کند
- [ ] Navigation داخلی Workspace بدون Full Reload انجام شود و container کل Route هیچ entrance/exit animation نداشته باشد
- [ ] Header و آیتم‌های اصلی صفحه جداگانه با `animate-fade-up/down/left/right` و delayهای صعودی کوتاه وارد شوند
- [ ] ترتیب stagger در Dashboard/Reports/Settings/Investments/Funds/Income محسوس باشد ولی interaction را معطل نکند
- [ ] Dialog/AlertDialog/Drawer با transform-only CSS motion باز شوند تا بدنه هیچ‌وقت از opacity صفر شروع نشود؛ Overlay/Toast می‌توانند از utilityهای `tailwindcss-animated` استفاده کنند
- [ ] Browser Release Smoke وجود animation واقعی کامپایل‌شده و حداقل سه delay متفاوت را از Computed Style تأیید کند
- [ ] Browser Release Smoke دیگر `AbortError` را ignore نکند
- [ ] `prefers-reduced-motion: reduce` تمام حرکت‌های ورود Workspace را غیرفعال کند


## v0.34–v0.38 verified database migration

The migration checks below are automated inside `npm run check:release` using a temporary raw schema-6 IndexedDB fixture. The same profile must pass the schema 7 market-identity upgrade and then the schema 8 fund-ledger upgrade before the normal product smoke starts. Backup compatibility remains covered by the unit/portability suite and can still be spot-checked manually before a high-risk release.

- [x] Upgrade an existing schema 6 profile through schema 7 and verify legacy `marketId` assets/watchlist/alerts remain available with provider-scoped identity.
- [x] Verify a TSETMC and a Tindex row with the same raw `marketId` can coexist after migration; provider-scoped runtime selection remains covered by market identity unit tests.
- [x] Verify the same legacy profile reaches schema 8 and each positive pre-ledger fund balance becomes one `opening` / `migration` Fund Movement with the same amount.
- [ ] Optional manual spot-check: restore a real schema 6/7 backup and verify missing legacy provider fields normalize to Tindex before persistence; duplicate Watchlist identity within one provider must be rejected before destructive replacement.


### v0.43 public/PWA boundary

After the Workspace Service Worker is registered, the production browser smoke returns to `/` and verifies that the public Landing navigation is network-only and absent from Cache Storage. This specifically guards the root-scope Service Worker from turning public pages into offline Workspace cache entries.

## 21. v1.0 release-candidate acceptance

برای Candidate فعال `v1.0.0-rc.3` ابتدا Gate خودکار Candidate را اجرا کن:

```bash
npm install
npm run check:rc
```

`check:rc` ابتدا کل `check:release` را اجرا می‌کند؛ بنابراین Build یا Browser Smoke جدا و ضعیف‌تری برای RC وجود ندارد. بعد از سبز شدن آن، موارد زیر هنوز Manual acceptance هستند و برای stable باید واقعی تست شوند:

- [ ] Chromium desktop: نصب واقعی PWA، Deploy/Update، انتخاب «بعداً»، سپس Update صریح بدون Reload ناگهانی
- [ ] mobile-class browser: نصب/launch، Offline route و Resume بدون از دست‌رفتن IndexedDB
- [ ] Backup → Restore با داده غیرنمایشی؛ Preview معتبر و Recovery Snapshot قبل از replacement
- [ ] old-tab upgrade روی همان Origin؛ blocked/versionchange امن و بدون نیاز به Clear Site Data
- [ ] راهنمای سریع روی Desktop و 390px: Target داخل SVG Cutout کاملاً روشن بماند، Ring هم‌تراز باشد و هیچ مرحله‌ای بدون Highlight واقعی نماند
- [ ] مرور 390px و desktop در Light/Dark برای Dashboard، Income، Funds، Investments، Reports و Settings

Browser Smoke RC3 علاوه بر Gateهای قبلی، viewport دسکتاپ را صریحاً روی `1280×900` و موبایل را روی `425×800` می‌گذارد، Tour را باز می‌کند، Spotlight/Overlay را به `data-tour-target` مرحله جاری تطبیق می‌دهد و Target را داخل SVG mask cutout و Ring را دور همان Target assert می‌کند. اگر resolve یا geometry پایدار نشود، وضعیت جداگانه Target/Spotlight/Overlay همراه viewport و media-query در خروجی چاپ می‌شود.

اگر این Manual gateها blocker نداشتند، Candidate می‌تواند به `v1.0.0` stable ارتقا پیدا کند. در RC Feature جدید اضافه نکن؛ فقط blocker با reproduction روشن مجاز است.
