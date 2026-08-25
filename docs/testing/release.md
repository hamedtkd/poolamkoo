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
