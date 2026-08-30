# v1.0.0-rc.2 acceptance matrix

تاریخ Candidate: 2026-08-30.

RC2 فقط blocker راهنمای سریع را اصلاح می‌کند. **Feature freeze** و تمام مرزهای داده/بازار RC1 بدون تغییر باقی می‌مانند.

## Automated gate

| Gate | وضعیت Candidate | توضیح |
| --- | --- | --- |
| TypeScript / ESLint / unit tests | Required | از طریق `npm run check:release` |
| Architecture / regression / performance checks | Required | از طریق `npm run check:release` |
| Production Next.js build | Required | از طریق `npm run check:release` |
| Production browser smoke | Required | migration 6→8، Landing→Workspace، product-tour spotlight، dialogs، reports، mobile drawer و PWA boundary |
| RC metadata/schema guard | Required | `npm run check:rc` بعد از Gate کامل، Version و schema/docs را بررسی می‌کند |

## Manual acceptance

| سناریو | وضعیت اولیه | معیار قبولی |
| --- | --- | --- |
| راهنمای سریع Desktop/Mobile | Pending manual | Target کاملاً روشن و بیرون Shade، محل آموزش واضح، هیچ مرحله بدون Target قابل‌دیدن نباشد |
| Chromium desktop install/update | Pending manual | نصب واقعی، Update بدون reload ناگهانی، Later همان worker را دوباره prompt نکند |
| Mobile-class PWA | Pending manual | نصب/launch، Offline route و resume بدون از دست‌رفتن داده محلی |
| Backup → Restore | Pending manual | Preview معتبر، Restore موفق، Recovery Snapshot قبل از replacement و داده نهایی مطابق Backup |
| old-tab upgrade | Pending manual | blocked/versionchange پیام امن بدهد، تب قدیمی نوشتن را ادامه ندهد، Clear Site Data لازم نباشد |
| responsive/theme pass | Pending manual | 390px و desktop، Light/Dark، مسیرهای اصلی بدون overflow یا dialog خالی |

## Release decision

- **Pass:** همه Automated gateها و Manual acceptance بدون blocker → آماده `v1.0.0` stable.
- **Block:** فقط blocker واقعی با reproduction مشخص در RC بعدی اصلاح شود.
- **No feature expansion:** Provider جدید، Expense ledger، cloud sync، account system و Background Push اجباری وارد RC نمی‌شوند.

IndexedDB schema همچنان 8 است و Backup/Recovery/Device Transfer contract تغییر نمی‌کند.
