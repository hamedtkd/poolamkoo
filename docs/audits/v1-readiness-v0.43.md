# v1.0 readiness audit — v0.43

تاریخ این Audit: 2026-08-30. هدف آن پیدا کردن شکاف‌های Release-critical پیش از v1.0 است، نه بازکردن Feature Family جدید.

## نتیجه

وضعیت کلی: **Ready for a v1.0 release-candidate pass after normal release QA.** هیچ schema migration جدید، hosted financial backend یا تغییر در Backup format برای این فاز لازم نیست.

سه شکاف مشخص در v0.43 اصلاح شدند:

1. **Public/PWA cache boundary:** چون Manifest باید routeهای sibling فضای Workspace را پوشش دهد، Service Worker scope روی `/` باقی می‌ماند. Worker قدیمی بعد از ورود به Workspace می‌توانست navigation عمومی مثل `/` را هم runtime-cache کند. اکنون فقط navigationهای Workspace/Offline cache می‌شوند و Public navigation صریحاً network-only است.
2. **PWA update “Later”:** waiting worker dismiss‌شده در Session جاری track می‌شود تا update-check روی focus/visibility همان notice را دوباره نشان ندهد. Worker جدید دوباره eligible است.
3. **Generic error recovery:** Error Boundary عمومی دیگر repair دیتابیس را اجرا نمی‌کند. Retry، Settings → Local Data Health و Data Safety مسیرهای جدا و صریح هستند.

## حوزه‌های بررسی‌شده

| حوزه | وضعیت | دلیل/مرز فعلی |
| --- | --- | --- |
| IndexedDB migration | Pass | chain نسخه‌های 6→7→8 در Release Browser Smoke حفظ شده و schema فعلی 8 است. |
| Backup / Restore | Pass | payload validation، checksum/encryption boundaries و replacement safety موجودند؛ v0.43 format را عوض نمی‌کند. |
| Recovery Snapshot | Pass | اصلاحات destructive/deterministic قبل از write از Snapshot استفاده می‌کنند؛ Data Health repair هم همین invariant را دارد. |
| Device Transfer | Pass | انتقال مستقیم و validation مستقل از backend مالی باقی مانده است. |
| Multi-tab / VersionError | Pass | bootstrap مصرف‌کنندگان مالی را تا readiness متوقف می‌کند و blocked/versionchange مسیر خطای صریح دارد. |
| Offline / PWA | **Changed** | Public navigation از runtime cache Workspace خارج شد؛ cache version v67. |
| PWA update lifecycle | **Changed** | همان waiting worker بعد از «بعداً» در Session جاری suppress می‌شود. |
| Generic workspace errors | **Changed** | repair عمومی حذف شد؛ Data Health تنها مسیر repair deterministic است. |
| Onboarding | Pass | skip سریع و opening holdings موجود است و fresh bootstrap داده مالی ساختگی تولید نمی‌کند. |
| Market degradation | Pass | fake quote/history ممنوع است؛ local real snapshots/manual prices fallback می‌مانند. |
| Privacy | Pass | Local-first storage، privacy toggle، share-safe report summary و opt-in analytics boundaries حفظ شده‌اند. |
| Reports / Activity | Pass | هر دو projection/read-only روی داده ثبت‌شده‌اند و ledger یا cash account جدید اختراع نمی‌کنند. |
| Mobile/Desktop UX | Pass | bottom navigation، focused More drawer، collapsible desktop rail و release smoke موجودند. |
| Documentation / release gate | **Changed** | Release note، audit doc، v1-readiness tests و public-cache Browser assertion اضافه شد. |

## موارد عمداً خارج از Scope

- Background Push همچنان Backlog است و برای v1.0 dependency اجباری ایجاد نمی‌کند.
- Provider جدید بازار فقط بعد از راستی‌آزمایی auth/free-tier/deployment اضافه می‌شود.
- Expense accounting، inferred cash account، cloud sync و account system جزو محصول فعلی نیستند.
- این Audit جای QA واقعی نصب PWA روی Safari/iOS و Chrome/Android را نمی‌گیرد؛ Release Browser Smoke مرزهای قابل‌اتوماسیون را پوشش می‌دهد.

## Gate پیشنهادی برای v1.0 RC

قبل از tag v1.0: `npm run check:release`، نصب/Update دستی PWA روی حداقل یک Chromium desktop و یک mobile-class browser، یک Backup→Restore round-trip با داده غیرنمایشی، و بازکردن همان origin با یک tab قدیمی هنگام upgrade بررسی شود. اگر این Gateها بدون blocker عبور کنند، فاز بعدی بهتر است Release Candidate باشد نه Feature جدید.
