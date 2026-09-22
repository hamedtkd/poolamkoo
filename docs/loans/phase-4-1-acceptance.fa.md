# پذیرش Phase 4.1: یادآوری قسط و زیرساخت اعلان

## Scope بسته‌شده

این فاز فقط زیرساخت Reminder و Notification را فعال می‌کند. هشدار کاهش ذخیره، بودجه زیان و Fresh Quote Guard در Phase 4.2 و 4.3 باقی می‌مانند.

## رفتار Local-First

- در هر بار اجرای Workspace، قسط بعدی هر وام فعال از قرارداد و پرداخت‌های واقعی محاسبه می‌شود.
- Reminder فقط در Lead Dayهای انتخاب‌شده کاربر مثل ۷، ۳، ۱ و ۰ روز قبل ساخته می‌شود.
- قسط عقب‌افتاده حتی اگر Lead Day دیگری نداشته باشد به‌عنوان Reminder بحرانی نمایش داده می‌شود.
- ثبت پرداخت باعث می‌شود قسط پرداخت‌شده دیگر Reminder تولید نکند و موتور به قسط بعدی منتقل شود.
- Toast داخل اپ منبع اطلاع‌رسانی پایه است و به سرور نیاز ندارد.

## Browser Notification

- Permission هرگز خودکار درخواست نمی‌شود و فقط از اقدام صریح کاربر در صفحه وام درخواست می‌شود.
- اگر Permission قبلا داده شده باشد، Notification سیستم روی همان دستگاه نمایش داده می‌شود.
- کلید یکتا با ساختار `loan:<loanId>:installment:<n>:lead:<days>` از تکرار Notification جلوگیری می‌کند.
- برای Overdue یک کلید پایدار `...:overdue` استفاده می‌شود تا افتادن چندروزه یک قسط باعث Spam روزانه نشود.
- کلید Notification ارسال‌شده در `appMeta` محلی ثبت می‌شود و Schema جدیدی لازم نیست.

## Background Push اختیاری

Background Push همچنان پشت Feature Flag قبلی باقی مانده و نصب عادی پولم‌کو آن را فعال نمی‌کند.

اگر اپراتور آن را فعال کند، Reminder وام با حداقل Metadata همگام می‌شود:

- شناسه محلی وام
- شماره قسط
- تاریخ سررسید
- Lead Dayها
- منطقه زمانی

موارد زیر به سرور ارسال نمی‌شوند:

- نام وام یا بانک
- مبلغ قسط
- اصل وام
- موجودی ذخیره
- دارایی‌ها و تراکنش‌های کاربر

Service Worker بعد از دریافت Push، نام و مبلغ قسط را در صورت وجود فقط از IndexedDB همان دستگاه می‌خواند و Notification را محلی غنی می‌کند.

## Anti-spam

- Local Notification با `appMeta` Deduplicate می‌شود.
- Remote Push روی سرور `sentKeys` محدود نگه می‌دارد.
- Resync کاربر State ارسال‌شده همان قسط را پاک نمی‌کند.
- با رفتن به قسط بعدی، State ارسال برای Installment جدید از نو شروع می‌شود.

## تست‌های اضافه‌شده

- Lead Day دقیق
- Due و Overdue
- انتقال به قسط بعدی بعد از Payment
- عدم Reminder برای Loan بسته
- حذف اطلاعات حساس از Remote Payload
- Validation تاریخ و Time Zone
- Remote Deduplication
- حفظ `sentKeys` در Resync

## Gate اجراشده در محیط ساخت

- `npm test`: 307 تست Pass، صفر Fail
- `npm run check:lines`: Pass
- `npm run check:regressions`: Pass

`npm ci` در محیط ساخت به‌دلیل محدودیت شبکه کامل نشد، بنابراین Typecheck، Lint و Production Build باید روی محیط محلی دارای Dependency اجرا شوند.
