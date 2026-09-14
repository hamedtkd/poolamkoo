## خلاصه / Summary

<!-- مسئله، راه‌حل و نتیجه قابل مشاهده را کوتاه توضیح دهید. -->

## محدوده / Scope

- چه چیزی تغییر کرد؟
- چه چیزی عمداً تغییر نکرد؟
- ریسک اصلی تغییر چیست؟
- روش Rollback چیست؟

## شواهد و کنترل کیفیت / Validation

- [ ] `npm run check`
- [ ] `npm run check:release`
- [ ] در صورت تغییر مرتبط با Stable Release، `npm run check:stable`
- [ ] تست Regression مرتبط اضافه یا به‌روزرسانی شده است.
- [ ] خروجی دستورهای اجراشده و هر محدودیت محیطی در توضیحات ثبت شده است.

<!-- اگر دستوری اجرا نشده، دلیل دقیق و دستورهای جایگزین را بنویسید. -->

## ایمنی داده / Data Safety

- [ ] این تغییر روی IndexedDB schema، Backup، Restore، Recovery Snapshot یا Device Transfer اثر ندارد.
- [ ] یا در صورت اثرگذاری، Migration و سازگاری با داده قدیمی بررسی و تست شده است.
- [ ] هیچ داده موجود کاربر بدون تصمیم صریح حذف، بازتفسیر یا نادیده گرفته نمی‌شود.
- [ ] تست با داده ساختگی انجام شده و هیچ Backup یا اطلاعات مالی واقعی در Repository قرار نگرفته است.

جزئیات اثر روی داده:

<!-- «ندارد» کافی است، در غیر این صورت Migration و مسیر تست را توضیح دهید. -->

## صحت مالی / Financial Correctness

- [ ] این تغییر روی محاسبات مالی اثر ندارد.
- [ ] یا محاسبات مرتبط مانند Allocation، Cost Basis، Profit/Loss، Fund Balance یا Plan Execution با تست پوشش داده شده‌اند.
- [ ] UI مقدار یا تاریخچه مالی ساختگی تولید نمی‌کند وقتی داده واقعی وجود ندارد.

جزئیات:

## بازار و Providerها / Market Data

- [ ] این تغییر روی Market Data یا Providerها اثر ندارد.
- [ ] یا رفتار Provider، fallback، snapshot provenance و عدم ساخت داده جعلی بررسی شده است.
- [ ] Secretهای Provider در Client Bundle یا متغیرهای `NEXT_PUBLIC_*` قرار نگرفته‌اند.

## حریم خصوصی و امنیت / Privacy & Security

- [ ] هیچ Secret، API Key، Token، Backup یا داده مالی و شخصی واقعی Commit نشده است.
- [ ] Analytics یا Logging جدید شامل مقدارهای مالی، نام دارایی شخصی، Search text یا محتوای تراکنش نیست.
- [ ] تغییرات امنیتی با `SECURITY.md` سازگار هستند.

## رابط و دسترسی‌پذیری / UI & Accessibility

- [ ] تغییر رابط ندارد.
- [ ] یا Desktop و Mobile بررسی شده‌اند.
- [ ] RTL فارسی بررسی شده است.
- [ ] Light و Dark theme بررسی شده‌اند.
- [ ] Keyboard navigation و Focus بررسی شده‌اند.
- [ ] Reduced Motion در صورت وجود Animation بررسی شده است.
- [ ] Privacy Mode برای مقدارهای حساس بررسی شده است.
- [ ] برای تغییر بصری Screenshot یا ویدیو پیوست شده است.

## PWA و Offline

- [ ] این تغییر روی PWA، Service Worker یا Offline behavior اثر ندارد.
- [ ] یا Update flow، Offline fallback و رفتار نصب/اجرا بررسی شده‌اند.

## مستندات / Documentation

- [ ] مستندات مرتبط به‌روزرسانی شده‌اند یا این تغییر نیاز به تغییر مستندات ندارد.
- [ ] Release notes یا backlog فقط برای موارد واقعاً تکمیل‌شده تغییر کرده‌اند.

## توضیح تکمیلی برای Reviewer

<!-- تصمیم‌های مهم، Trade-off، بدهی فنی باقی‌مانده یا بررسی دستی موردنیاز را بنویسید. -->
