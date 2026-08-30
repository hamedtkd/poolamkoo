# معماری پولم‌کو

## Frontend

Next.js App Router، React، TypeScript و shadcn/ui New York.

## Storage

اطلاعات شخصی کاربر در IndexedDB با Dexie نگهداری می‌شود.

## Market

Market Store بین همه Routeها مشترک است. از v0.28 Providerها بر اساس بازار جدا شده‌اند:

- **BrsApi** منبع اصلی دلار، طلای ۱۸ عیار، BTC و USDT است و پاسخ upstream آن ۶۰ ثانیه در Next Data Cache مشترک می‌شود.
- **TSETMC direct (`cdn.tsetmc.com`)** منبع پیش‌فرض جست‌وجو، Quote روز و تاریخچه سهام/ETFهای جدید است. درخواست فقط از Routeهای Server-side انجام می‌شود، قیمت ریالی قبل از ورود به مدل داخلی به تومان تبدیل می‌شود و API Key لازم ندارد.
- **Tindex** دیگر Provider پیش‌فرض بورس نیست؛ فقط برای رکوردهای Legacy، fallback آهسته نرخ‌های پایه و تاریخچه اختیاری دلار/طلا نگه داشته شده و با cache طولانی از سهمیه محدود آن محافظت می‌شود.

Endpointهای CDNِ TSETMC عمومی اما غیررسمی و بدون SLA هستند، بنابراین failure یک حالت عادی طراحی است: آخرین Snapshot واقعی IndexedDB و سپس قیمت دستی دارایی fallback می‌شوند و هیچ Quote/History مصنوعی ساخته نمی‌شود. `webgw.tse.ir` به‌دلیل محدودیت دسترسی از IPهای خارج ایران جزو مسیر الزامی Deployment نیست.

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

## Public landing rendering boundary (v0.27)

The public Hero must remain useful before client hydration. Critical copy and approved Light/Dark product media therefore render as normal server-visible markup; decorative entrance/float motion is CSS-only and disabled by `prefers-reduced-motion`. The public theme toggle uses `next-themes` directly and does not read or write the financial IndexedDB settings record. Workspace appearance persistence remains owned by the application theme layer after entering `/dashboard`.

از v0.27.4 خود Route در Workspace کاملاً پایدار و بدون entrance/exit animation است. حرکت فقط در سطح آیتم‌های صفحه و با utilityهای CSS پکیج `tailwindcss-animated` انجام می‌شود: Header و کارت‌ها با `animate-fade-*` و delayهای کوتاه تقریباً 55ms به‌ترتیب وارد می‌شوند. از v0.28.2 واردکردن این پکیج در Tailwind v4 از مسیر صریح `tailwindcss-animated/src/index.css` انجام می‌شود تا Turbopack روی Windows به package `style` field وابسته نباشد. Dialog/AlertDialog/Drawer برای جلوگیری از فریم کاملاً شفاف از transform-only keyframeهای محلی استفاده می‌کنند؛ Overlay/Toast و آیتم‌های غیرحیاتی همچنان از utilityهای `tailwindcss-animated` استفاده می‌کنند. کتابخانه `motion` فقط برای revealهای viewport/scroll در Landing نگه داشته شده و در Providers/Workspace runtime سراسری وارد نمی‌شود. `prefers-reduced-motion` هر دو مسیر CSS و Motion را خاموش می‌کند.

## Report export and mobile interaction boundary (v0.29)

Reports can now create two deliberately different client-side outputs. `lib/report-export.ts` builds a share-safe Persian text summary from the already-derived decision snapshot; this text contains percentages/status only and intentionally excludes financial amounts and asset names. The detailed CSV path is explicit user action and may contain report amounts plus asset names/current values, but it does not serialize raw transactions, IndexedDB tables, backup envelopes, or recovery metadata. CSV string cells neutralize spreadsheet formula prefixes before quoting.

No report is uploaded or hosted by Poolamkoo. `navigator.share` is called only after the user presses Share; otherwise the text stays local. CSV is created with `Blob`/object URL in the browser and downloaded locally.

Mobile navigation keeps the four daily destinations in the bottom bar. The More drawer no longer repeats those destinations; it exposes only New Money, Reports, Settings, compact utilities and public help links. The same shared Drawer now implements real drag-to-dismiss: opening/closing animation uses `transform`, while the user's drag is applied through the independent CSS `translate` property, preventing the animation from overriding finger/pointer movement.

Workspace entrance motion is intentionally directional but not alternating: page headings use `fade-down`, while KPI/card/table content uses `fade-up` with short stagger. Horizontal left/right entrances remain available as utilities for isolated future use but are not mixed through the financial workspace. On compact desktop widths the sidebar becomes a locked icon rail so tables and report grids retain usable width.

## Market provider reliability boundary (v0.30)

Provider availability is now treated as structured runtime state rather than free-form exception text. `lib/market/reliability.ts` defines stable provider IDs, health states and failure categories; server routes expose only those safe categories plus human-readable Poolamkoo messages. Raw BrsApi/TSETMC/Tindex response bodies are never sent to the browser as error text.

The quote route starts independent BrsApi, direct-TSETMC and legacy-Tindex work together. Tindex's core boards fallback remains dependent on the BrsApi result and is called only when USD/18K gold/BTC are actually missing. This preserves the v0.28 provider priority and protects the optional free-tier quota instead of eagerly querying every source on every refresh.

A `TsetmcProvider` instance owns one deadline for the whole operation as well as a shorter timeout for each HTTP request. Batched quote requests therefore share a bounded time budget; partial successes return as `degraded`, while complete failure returns a classified `unavailable` state. Client code still persists only real quotes to IndexedDB and falls back to existing real snapshots/manual prices when fresh data is absent. IndexedDB schema 6 and all backup/transfer formats remain unchanged.

## Market transparency and diagnostics boundary (v0.31)

The v0.30 health model is now surfaced in Settings through `components/settings/market-status-card.tsx`. The card reads the existing `useMarket` runtime only; it does not create a second polling loop or another provider request path. A manual retry calls the same coalesced market refresh already used by the shell.

`lib/market/status.ts` owns user-facing provider labels and the copyable diagnostic formatter. The diagnostic contract intentionally accepts only market mode, health metadata, aggregate live/Snapshot coverage and timestamps. It has no quote/asset/watchlist inputs, so prices, symbols, asset names, market IDs and financial amounts cannot enter the generated text by accident. Provider configuration is reduced to a boolean and failures remain the stable v0.30 categories. Clipboard export happens only after explicit user action and is never uploaded by Poolamkoo.

## Partial market fallback continuity (v0.32)

`lib/market/runtime.ts` owns client-side continuity after a provider refresh. Fresh rows are keyed first; only missing core symbols and exchange targets that are actually present in the current runtime request may be filled from the newest matching IndexedDB snapshot. Exchange keys include both provider and market id, so a TSETMC instrument cannot silently inherit a legacy Tindex snapshot just because the numeric id matches. Unrelated historical snapshots are excluded.

Snapshot provenance exists only as runtime metadata (`runtimeSource` / `snapshotCapturedAt`). Before a fresh quote is persisted, that metadata is stripped, so IndexedDB snapshots remain provider data plus their existing `capturedAt` field and backup/schema formats do not change. Settings may expose aggregate live/Snapshot counts and timestamps, but the privacy-safe diagnostic still has no quote, asset, symbol or market-id input.

Local alerts deliberately filter out `runtimeSource: "snapshot"`. A partial refresh can therefore keep portfolio/watchlist valuation continuous without turning an old observed price into a new notification or re-arm event. UI source labels mark Snapshot fallback anywhere the mixed runtime quote is surfaced.


## Provider-scoped valuation and decision freshness (v0.33)

`lib/market/valuation.ts` is the downstream quote-selection boundary. A linked exchange asset/watch item/alert must match both provider and market id; symbol-only fallback is reserved for unlinked/core symbols. This prevents a legacy Tindex row and a direct TSETMC row with the same display symbol or numeric id from silently substituting for one another after the API/runtime merge.

Valuation now distinguishes continuity from decision freshness. Fresh provider quotes and explicit manual prices are suitable inputs for automatic portfolio planning. Runtime Snapshot quotes and cost-basis fallback can keep current value visible, but they are marked incomplete for decision surfaces. Portfolio target gaps may still be inspected, while automatic new-money priorities, smart growth distribution and Reports best/worst ranking pause until held positions have decision-ready pricing. Transaction price suggestions and newly linked manual fallback values likewise never come from a Snapshot.

Detailed local CSV export includes the valuation-source label so a user can audit which rows used fresh market, Snapshot, manual or cost-basis pricing. The privacy-minimized share text is unchanged. Local market alerts use the same provider-scoped lookup and filter Snapshot rows before evaluation. IndexedDB schema 6 and persisted MarketSnapshot shape remain unchanged.

The release lint command also uses `--max-warnings=0`; warning-free source is part of the release contract instead of an advisory console state.


## Persisted provider-scoped identity (v0.34)

Runtime quote selection became provider-scoped in v0.33, but the older IndexedDB Watchlist schema still treated raw `marketId` as globally unique. v0.34 closes that persistence gap. Schema 7 uses a unique compound `[source+marketId]` index for `marketWatchlist` and a non-unique compound index for `marketAlerts`, while keeping the numeric primary keys and old `marketId` index available for compatibility. UI lookups, duplicate checks and notification identity use the same provider-scoped key. Server quote merge, client target dedupe/Snapshot lookup and market-chart selection use that same helper as well, closing the remaining raw-id/symbol collision paths.

The Dexie chain keeps schema 6 explicitly and upgrades to 7 in place. During migration, an exchange-linked asset with `marketId` but no valid `marketSource`, or a Watchlist/Alert row without a valid `source`, is treated as legacy Tindex. That default is historically safe because those rows predate direct TSETMC linking. Explicit `tsetmc` rows are preserved. Backup/Recovery/Device Transfer payloads are normalized with the same rule before writing into schema 7; Watchlist duplicates within one provider are rejected during preview validation, while the same raw market id from different providers is valid.

No backup envelope format, database name, table primary key, market-provider priority or financial-data boundary changes in this release. The schema bump exists only because persisted market identity now requires a real compound index.


## Verified schema migration release boundary (v0.35)

The schema-7 model introduced in v0.34 is unchanged. v0.35 instead verifies the upgrade path in the same production-browser gate used for routing, dialogs, Reports and PWA boundaries. `scripts/fixtures/schema6-idb.mjs` mirrors the exact `storesV6` contract and builds a raw IndexedDB database at native version 60; Dexie maps declared version 6 to that native version. The current application must then open the same `poolyar-local` database and reach native version 70/schema 7 before the smoke proceeds.

The browser assertion reads the migrated stores directly: legacy exchange rows must gain `tindex`, explicit `tsetmc` rows must remain unchanged, the provider-scoped compound indexes must exist, and raw `marketId` may no longer be globally unique in Watchlist. A second TSETMC row with the same raw market id as a migrated Tindex row is inserted as a collision proof. The temporary fixture is then cleared before the existing fresh-profile smoke continues, so migration verification cannot contaminate onboarding, product-media data or the user's real browser storage.


## Investment ledger correction boundary (v0.36)

`lib/investment-ledger.ts` owns the chronological quantity invariant for manually entered investment transactions. A candidate add/edit is evaluated against the full recorded history for the asset, not only today's portfolio balance. A change is rejected when any sell would make the quantity negative at that historical date. Because transaction persistence stores a calendar date and no intraday timestamp, same-day buys are ordered before same-day sells for validation.

The same invariant also protects destructive deletion: removing an earlier buy is blocked if a later sell depends on those units. In-place edits keep the asset, income and plan linkage stable, create a Recovery Snapshot before mutation, and resynchronize linked investment plan execution. Editing an old transaction deliberately does not rewrite `manualPriceToman`; that value remains an explicit current fallback, not a side effect of historical correction. IndexedDB remains schema 7.

### Safe asset archive lifecycle (v0.37)

Archive is a reversible presentation state, not deletion. A new lifecycle guard refuses to archive an asset while its chronological ledger still leaves open quantity or while an unfinished plan item still targets that asset. Restore creates a local Recovery Snapshot before clearing the archived flag. For compatibility with older releases, an already-archived asset that still has open quantity remains valuation-relevant (including market quote requests) until the user restores it, preventing silent portfolio under-reporting. Archived zero-holding assets stay outside active target allocation and new-money decisions, while `allAssets` remains available to historical/reporting surfaces so transaction identity is not lost. IndexedDB remains schema 7.

## Fund movement ledger and schema 8 (v0.38)

`funds.currentToman` remains the fast denormalized balance used by existing UI and planning code, but it is no longer an independently editable value. `fundMovements` is the auditable source history for balance changes. Each row records a fund, `deposit` / `withdraw` / `opening` type, source (`manual`, `opening`, `plan`, `direct`, `income_reversal`, or `migration`), amount, calendar date and optional note. Manual rows may be corrected; system/opening rows are deliberately read-only.

`lib/fund-ledger.ts` owns chronological replay. Because Fund Movement persistence stores a calendar date rather than intraday time, deposits/opening rows on the same date are ordered before withdrawals. Any add/edit/delete that would make the balance negative at a historical point is rejected. `lib/fund-ledger-store.ts` is the mutation boundary: after a valid movement change it updates both the ledger row(s) and the denormalized `fund.currentToman` in the same Dexie transaction. Direct new-money funding, fund-target plan execution and income-deletion reversal use this same path rather than mutating the balance directly.

Schema 8 adds the `fundMovements` store while preserving the explicit schema 6 and 7 upgrade chain. During the 7→8 upgrade, each existing positive fund balance becomes one `opening` movement with source `migration`; zero-balance funds need no synthetic row. Older Backup/Recovery/Device Transfer payloads remain accepted when the new table is absent and are normalized the same way before persistence. Payloads that already contain movement rows are validated for fund identity, allowed source/type, non-negative chronological replay and final-balance agreement before replacement.

The production browser release fixture starts from raw schema 6/native version 60 and now requires the same profile to reach schema 8/native version 80. It still proves the schema 7 provider-scoped market migration and additionally verifies that the legacy fund balance survives as exactly one migration opening movement.


## Income correction boundary (v0.39)

`lib/income-correction.ts` owns the rule that an incoming-money edit may change planning intent but may not rewrite money that has already been executed. The correction review combines recorded `PlanItem.executedToman` with linked investment buys, rejects any new income amount below that execution floor, and locks the income date after execution starts. This keeps the source date from moving behind already-recorded downstream activity.

For a valid amount correction, only each plan item's still-unexecuted remainder participates in proportional rescaling. Executed amounts remain fixed floors. If every plan card is already complete and the income amount increases, the difference stays unplanned instead of silently extending completed cards. Allocation rows are then synchronized to the corrected plan totals using exact integer-Toman distribution.

The editor creates a Recovery Snapshot before mutation, then re-reads and revalidates live income/plan/allocation/transaction state inside one Dexie transaction before writing. New and edited income dates also reject future dates. This release does not change IndexedDB schema 8 or any backup/transfer format.


## Local data health boundary (v0.40)

`lib/data-health.ts` is a pure cross-ledger audit layer. It does not mutate IndexedDB and does not depend on network state. The audit checks referential integrity between Income/Allocation/Plan/Transaction rows, chronological Fund and Investment ledger invariants, archived open holdings, plan execution bounds, provider-scoped Watchlist identity, and exact duplicate alert conditions. Ambiguous historical problems are reported rather than guessed.

`lib/data-health-store.ts` is the narrow mutation boundary for deterministic repair. It may resynchronize only denormalized values that have a single authoritative source: `fund.currentToman` from a valid Fund Movement replay and asset-plan `executedToman` from linked buy transactions. A Recovery Snapshot is created before repair, and the authoritative tables are re-read inside one Dexie transaction before writes. No schema bump, server persistence, telemetry, or automatic record deletion is introduced.


## Unified financial activity boundary (v0.41)

`lib/activity.ts` is a read-only projection over existing local source records. It merges `IncomeEvent`, `FundMovement` and `InvestmentTransaction` rows into one display timeline; it does not create a fourth financial ledger and does not write back into Dexie. Amount summaries are explicitly recorded-volume summaries, not an inferred bank/cash balance.

The projection keeps each record's calendar `happenedAt` date authoritative. When several records share a day, `createdAt` is used only for deterministic display ordering because Poolamkoo does not persist a reliable intraday execution timestamp for all ledgers. Fund source (`manual`, plan, direct allocation, income reversal, opening/migration), investment plan linkage and notes remain visible. Historical activity resolves assets through `allAssets`, so an archived asset does not lose its name; missing references remain explicit as unknown entities instead of disappearing.

The `/activity` workspace route has its own session-scoped date range plus category/search filters, remains covered by workspace `noindex` and `robots.txt` disallow rules, and uses `SensitiveValue` for financial amounts. No IndexedDB schema, backup/transfer format, market-provider priority, analytics boundary or Background Push behavior changes in this release.


## Reports reconciliation boundary (v0.42)

Reports now distinguishes **period flow** from **current state**. `lib/report-reconciliation.ts` reconciles selected Income rows against their Allocation and Plan totals and labels a still-unexecuted plan as progress rather than corruption. Fund Movement and Investment Transaction summaries are built only from real rows inside the selected report range; opening fund balances are reported separately and excluded from net period flow, and investment buy-minus-sell flow is never described as profit.

Current portfolio valuation uses the full investment ledger even when a report date range is active. This prevents an older buy from disappearing from today's holding merely because the user selected a shorter reporting window. Current fund coverage follows the same current-state boundary. The detailed local CSV may include these aggregate reconciliation/flow facts, while the share-safe text continues to omit amounts and asset names. No schema, provider, telemetry or hosted-financial-data boundary changes in v0.42.


## v1.0 readiness hardening boundary (v0.43)

The installable app still needs a root Service Worker scope because `/dashboard`, `/income`, `/funds`, `/investments`, `/reports`, `/settings` and `/activity` are sibling routes. Registration and manifest advertisement remain Workspace-only, but root scope means an already-registered worker may control a later visit to a public route. `public/sw.js` therefore treats only known Workspace routes plus `/offline` as cacheable navigations; every other same-origin navigation is network-only and is never written to the Poolamkoo runtime cache. The production browser gate verifies this by returning to `/` after Workspace registration and checking Cache Storage.

PWA update dismissal is also worker-specific for the active Workspace session. `usePwaUpdate` keeps the exact waiting `ServiceWorker` object that the user dismissed; focus/visibility update checks do not re-open the notice while that same worker is waiting, while a replacement worker becomes eligible again. `SKIP_WAITING` remains explicit user action and reload still waits for `controllerchange`.

Generic Workspace render/runtime failures no longer call `repairLocalData`. A generic exception is not sufficient evidence of IndexedDB corruption. The error boundary offers retry and links to `Settings → Local Data Health` plus the public Data Safety guide. Deterministic repair remains isolated in `lib/data-health-store.ts`, where Recovery Snapshot and live transactional revalidation are mandatory. IndexedDB remains schema 8.

## v1.0 release-candidate boundary (v1.0.0-rc.1)

RC1 introduces no new financial model or persistence contract. It freezes the v0.43 product boundary and promotes the existing production release gate to the candidate acceptance path through `npm run check:rc`. The RC metadata guard keeps package/runtime version alignment explicit and refuses an accidental IndexedDB schema bump beyond 8.

Real PWA install/update, mobile-class offline/resume, Backup → Restore and old-tab upgrade remain manual acceptance because the isolated Chromium smoke cannot prove platform install UX or a user's real multi-tab/device behavior. A failing manual scenario is a release blocker; a new feature request is not RC scope.


## RC2 product-tour spotlight boundary (v1.0.0-rc.2)

RC1 manual acceptance exposed a UX blocker in the quick guide: one full-screen dim layer remained visually above the element being explained, while hidden responsive targets could leave a step without a meaningful highlight. RC2 keeps the target in its normal DOM stacking context and instead draws four independent shade regions around a padded hole. The target therefore stays visually untouched while the surrounding UI is de-emphasized.

Each step now carries an explicit page-area label, Desktop global search exposes a real tour target, and the Mobile sequence uses only controls present in the closed-navigation state. The production browser gate starts the tour and verifies that shade rectangles do not intersect the highlighted control and that the next Desktop search step resolves to a visible target. No persistence, market, backup or PWA contract changes; IndexedDB remains schema 8.
