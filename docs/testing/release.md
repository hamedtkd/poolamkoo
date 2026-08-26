# Release Checklist

این چک‌لیست قبل از Tag و GitHub Release اجرا می‌شود.

## 1. Quality gate

```bash
npm install
npm run check
npm run build
```

موارد زیر باید بدون خطا تمام شوند:

- [ ] TypeScript
- [ ] ESLint
- [ ] unit tests
- [ ] file line limit
- [ ] UI architecture checks
- [ ] regression checks
- [ ] production Next.js build

## 2. Core flows

- [ ] ثبت پول جدید
- [ ] تغییر درصدهای همان پول
- [ ] ساخت / ویرایش / حذف Plan Item
- [ ] ثبت اجرای کامل و جزئی
- [ ] ثبت خرید پیشنهادی از Plan
- [ ] ثبت خرید و فروش مستقل
- [ ] ساخت و ویرایش صندوق
- [ ] گزارش پایبندی و Portfolio P/L
- [ ] Privacy eye اعداد مالی را در تمام بخش‌های حساس مخفی کند

## 3. Navigation

- [ ] Sidebar باز و بسته شود و در حالت Collapsed لوگو با دکمه Expand تداخل نداشته باشد
- [ ] Tooltip تمام آیکون‌های Sidebar در حالت Collapsed قابل خواندن باشد
- [ ] `Ctrl/Cmd + K` جست‌وجوی کلی را باز کند
- [ ] `/` خارج از input جست‌وجوی کلی را باز کند
- [ ] جست‌وجو routeها، پول‌های ورودی، صندوق‌ها و دارایی‌ها را پیدا کند
- [ ] ناوبری موبایل و Drawer میانبرها درست کار کنند

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
git tag -a vX.Y.Z -m "Poolamco vX.Y.Z"
git push origin main
git push origin vX.Y.Z
```

سپس GitHub Release را از همان Tag بساز و Release Notes را از `docs/releases/` تهیه کن. README نباید به changelog نسخه تبدیل شود.

## 8. Date filters and mobile sheet

- [ ] لوگوی Desktop و Mobile به صفحه خانه برگردد
- [ ] تاریخ امروز به‌صورت شمسی در Header نمایش داده شود
- [ ] بازه زمانی روی ورودی‌ها، Dashboard و Reports اعمال شود
- [ ] پاک کردن بازه، حالت «همه زمان» را برگرداند
- [ ] Drawer موبایل با کشیدن دستگیره به پایین بسته شود
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
