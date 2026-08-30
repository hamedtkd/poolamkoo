# v1.0.0-rc.3 acceptance matrix

تاریخ Candidate: 2026-08-30.

RC3 فقط blocker اثبات‌شده راهنمای سریع و Browser Smoke را اصلاح کرد. **Feature freeze** و تمام مرزهای داده/بازار بدون تغییر باقی ماندند. Candidate نهایی پس از سبز شدن کامل `npm run check:rc` Tag/Pre-release شد و Manual Acceptance آن نیز بدون blocker تأیید شد.

## Automated gate

| Gate | وضعیت Candidate | توضیح |
| --- | --- | --- |
| TypeScript / ESLint / unit tests | Pass | از طریق `npm run check:release` |
| Architecture / regression / performance checks | Pass | از طریق `npm run check:release` |
| Production Next.js build | Pass | از طریق `npm run check:release` |
| Production browser smoke | Pass | migration 6→8، Landing→Workspace، exact-target SVG spotlight، dialogs، reports، mobile drawer و PWA boundary |
| RC metadata/schema guard | Pass | `npm run check:rc` بعد از Gate کامل، Version و schema/docs را بررسی می‌کند |

## Manual acceptance

| سناریو | وضعیت اولیه | معیار قبولی |
| --- | --- | --- |
| راهنمای سریع Desktop/Mobile | Pass | Target داخل Cutout کاملاً روشن، Ring هم‌تراز، محل آموزش واضح، هیچ مرحله بدون Target قابل‌دیدن نباشد |
| Chromium desktop install/update | Pass | نصب واقعی، Update بدون reload ناگهانی، Later همان worker را دوباره prompt نکند |
| Mobile-class PWA | Pass | نصب/launch، Offline route و resume بدون از دست‌رفتن داده محلی |
| Backup → Restore | Pass | Preview معتبر، Restore موفق، Recovery Snapshot قبل از replacement و داده نهایی مطابق Backup |
| old-tab upgrade | Pass | blocked/versionchange پیام امن بدهد، تب قدیمی نوشتن را ادامه ندهد، Clear Site Data لازم نباشد |
| responsive/theme pass | Pass | 390px و desktop، Light/Dark، مسیرهای اصلی بدون overflow یا dialog خالی |

## Release decision

- **Pass:** همه Automated gateها و Manual acceptance بدون blocker → آماده `v1.0.0` stable.
- **Block:** فقط blocker واقعی با reproduction مشخص در همین RC3 تا قبل از Release اصلاح شود؛ بعد از انتشار RC3، blocker جدید به RC بعدی می‌رود.
- **No feature expansion:** Provider جدید، Expense ledger، cloud sync، account system و Background Push اجباری وارد RC نمی‌شوند.

IndexedDB schema همچنان 8 است و Backup/Recovery/Device Transfer contract تغییر نمی‌کند.

## نتیجه نهایی Candidate

`npm run check:rc` روی Candidate نهایی کاملاً سبز شد؛ Production Browser Smoke شامل product-tour exact-target spotlight نیز Pass شد. سپس Manual Acceptance موردنیاز برای Desktop/Mobile guide، PWA install/update، Offline/Resume، Backup → Restore، old-tab upgrade و Responsive/Theme بدون blocker تأیید شد. RC3 در نتیجه Candidate پذیرفته‌شده برای promotion به `v1.0.0` stable است.
