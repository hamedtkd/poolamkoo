# گزارش پذیرش Phase 2: Loan Core

> وضعیت: Complete
>
> این فاز هسته داده و محاسبات وام را اضافه می‌کند. UI اصلی وام در Phase 3 ساخته می‌شود.

## هدف

هسته وام باید بدون تبدیل وام به Income و بدون ساخت سیستم موازی برای صندوق و سرمایه‌گذاری، قرارداد وام، پرداخت واقعی، منبع پرداخت و ارتباط با دارایی‌های موجود را قابل حسابرسی کند.

## چیزهایی که پیاده‌سازی شد

- Schema محلی از 8 به 9 ارتقا یافت.
- جدول‌های `loans`, `loanPayments`, `loanRiskAlerts` اضافه شدند.
- `InvestmentTransaction` فیلد اختیاری `loanId` گرفت.
- `FundMovement` فیلدهای اختیاری `loanId` و `loanPaymentId` گرفت.
- منبع سیستمی `loan_payment` برای برداشت ذخیره قسط اضافه شد و قابل ویرایش Manual نیست.
- Loan CRUD و Ledger پرداخت واقعی اضافه شد.
- موتور محاسبات Pure برای PMT، EAR، مانده اصل، جدول استهلاک، ذخیره قسط، Runway، بودجه زیان، سناریو و نرخ سربه‌سر ساخته شد.
- Backup, Restore و Device Transfer سه جدول Loan را حمل و Preview می‌کنند.
- Backup قدیمی بدون Loan table با آرایه خالی Normalize می‌شود.
- Restore ارجاع‌های یتیم، شماره قسط تکراری، لینک ناسازگار ذخیره و استفاده دوباره از یک Sale برای دو قسط را رد می‌کند.
- Migration browser fixture مسیر واقعی schema 6 به 8 و سپس 9 را بررسی می‌کند.
- Version Runtime با `package.json` روی 1.3.0 همگام و Schema روی 9 قرار گرفت.

## قرارداد اقتصادی V1

- نرخ ورودی وام Nominal Annual Rate است.
- قسط محاسباتی از فرمول اقساط مساوی استفاده می‌کند.
- اگر قرارداد بانک عدد دیگری داشته باشد `actualInstallmentToman` بر فرمول اولویت دارد.
- Break-even بر جریان نقدی واقعی وام محاسبه می‌شود و هزینه اولیه را نیز می‌تواند لحاظ کند.
- بازده سرمایه‌گذاری برای Scenario به‌صورت Effective Annual Return دریافت و به نرخ ماهانه تبدیل می‌شود.
- Stop-loss ثابت محصولی تولید نمی‌شود. Loss Budget بر حسب تعداد قسط تعریف می‌شود و فقط برای نمایش می‌تواند به درصد موقعیت تبدیل شود.

## Fixture مرجع

برای 280,000,000 تومان، نرخ اسمی 23 درصد و 60 ماه:

- قسط استاندارد تقریبا 7,893,331.905 تومان
- نرخ موثر سالانه هزینه وام تقریبا 25.586377 درصد
- ذخیره 6 قسط تقریبا 47,359,991.431 تومان
- مانده سناریوی 20 درصد بازده موثر، با برداشت ماهانه یک قسط، تقریبا منفی 70,625,726.973 تومان
- مانده سناریوی 35 درصد بازده موثر، با برداشت ماهانه یک قسط، تقریبا مثبت 169,580,455.455 تومان

این اعداد Fixture تست هستند و پیش‌بینی بازده بازار نیستند.

## تست‌های اجراشده در محیط ساخت

- `npm test`: 290 تست Pass، صفر Fail.
- `node scripts/check-file-lines.mjs`: Pass، همه فایل‌های TypeScript حداکثر 250 خط.
- `node scripts/check-regressions.mjs`: Pass.
- تست‌های جدید Loan محاسبات، Validation، Portability و ارجاع‌های مالی را پوشش می‌دهند.

## محدودیت محیط ساخت

اجرای `npm ci` در محیط ساخت به دلیل عدم دسترسی DNS به `registry.npmjs.org` کامل نشد. در نتیجه `npm run typecheck`, `npm run lint` و `npm run build` که به dependencyهای نصب‌شده نیاز دارند باید در محیط توسعه دارای اینترنت اجرا شوند. خود تست‌های Node که dependency نصب‌شده نمی‌خواهند کامل Pass شده‌اند.

## دستور Gate روی ماشین توسعه

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run check:lines
npm run check:regressions
npm run build
```

اگر این Gateها Pass شدند، Phase 3 می‌تواند UI و اتصال واقعی Reserve/Investment/Payment را روی همین قراردادهای داده شروع کند.

## خارج از Scope این فاز

- صفحه `/loans` و Wizard
- داشبورد وام
- ساخت خودکار Reserve withdrawal هنگام ثبت قسط
- Reminder و Notification زمان‌دار
- Loss Budget alert و Market quote guard
- Data Health repair برای Loan

این موارد به‌ترتیب در Phase 3 تا 5 انجام می‌شوند.
