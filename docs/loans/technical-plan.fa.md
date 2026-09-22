# برنامه فنی قابلیت وام‌ها در پولم‌کو

> وضعیت: Phase 4.3 پیاده‌سازی شده، Phase 5 آماده شروع است
>
> هدف این سند این است که پیاده‌سازی قابلیت وام بدون شکستن معماری Local-First، Backup، بازار و گزارش فعلی انجام شود.

## 1. وضعیت فعلی که باید حفظ شود

پروژه فعلی این پایه‌ها را دارد:

- Next.js App Router
- React و TypeScript
- Dexie و IndexedDB
- Local-First و بدون حساب اجباری
- Fund Ledger جدا از مقدار خلاصه صندوق
- Investment Transaction و Cost Basis
- Market Runtime با Quote تازه و Snapshot
- Market Alert با منطق Armed/Rearm
- PWA و Service Worker
- Browser Notification و Push آزمایشی
- Backup و Restore با Schema Version
- Mobile Bottom Navigation با چهار مقصد اصلی و منوی بیشتر

قابلیت وام باید روی همین زیرساخت ساخته شود و سیستم موازی جدید برای چیزهایی که از قبل داریم نسازد.

---

## 2. تصمیم معماری اصلی

### وام Income نیست

وام در `incomes` ذخیره نمی‌شود.

### سرمایه‌گذاری و صندوق دوباره ساخته نمی‌شوند

دارایی وام از همان `assets`, `transactions`, `funds` و `fundMovements` استفاده می‌کند.

### Loan فقط منبع و تعهد را اضافه می‌کند

دامنه جدید باید جواب دهد:

- این پول از کدام وام آمده؟
- این قسط از کدام منبع پرداخت شده؟
- این دارایی چه مقدار از عملکرد وام را تشکیل می‌دهد؟

---

## 3. Schema پیشنهادی V9

### جدول `loans`

```ts
export type LoanStatus = "active" | "closed";

export interface Loan {
  id?: number;
  name: string;
  lender?: string;
  principalToman: number;
  nominalAnnualRatePct: number;
  termMonths: number;
  disbursedAt: string;
  firstPaymentAt: string;
  actualInstallmentToman?: number;
  upfrontCostsToman?: number;
  reserveTargetMonths: number;
  reserveFundId?: number;
  riskBudgetInstallments?: number;
  reminderDays: number[];
  notifyBrowser: boolean;
  status: LoanStatus;
  createdAt: string;
  updatedAt: string;
}
```

Index پیشنهادی:

```text
++id, status, firstPaymentAt, updatedAt
```

### جدول `loanPayments`

فقط پرداخت واقعی ذخیره می‌شود. Schedule آینده از قرارداد Loan محاسبه می‌شود و 60 ردیف از پیش ساخته نمی‌شود.

```ts
export type LoanPaymentSource = "reserve" | "external" | "asset_sale" | "mixed";

export interface LoanPayment {
  id?: number;
  loanId: number;
  installmentNo: number;
  dueAt: string;
  amountToman: number;
  paidAt: string;
  source: LoanPaymentSource;
  reserveToman: number;
  externalToman: number;
  assetSaleToman: number;
  reserveFundMovementId?: number;
  saleTransactionIds?: number[];
  note?: string;
  createdAt: string;
  updatedAt: string;
}
```

Index:

```text
++id, loanId, [loanId+installmentNo], dueAt, paidAt
```

### جدول `loanRiskAlerts`

```ts
export type LoanRiskAlertKind =
  | "reserve_runway_below"
  | "loss_budget_exceeded"
  | "spread_below"
  | "quote_stale";

export interface LoanRiskAlert {
  id?: number;
  loanId: number;
  assetId?: number;
  kind: LoanRiskAlertKind;
  threshold: number;
  rearmThreshold?: number;
  enabled: boolean;
  armed: boolean;
  notifyBrowser: boolean;
  lastTriggeredAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

Index:

```text
++id, loanId, assetId, kind, enabled, updatedAt
```

---

## 4. تغییر مدل‌های موجود

### `InvestmentTransaction`

یک فیلد اختیاری:

```ts
loanId?: number;
```

قانون V1:

یک تراکنش یا کاملا از وام است یا نیست.

اگر خرید ترکیبی است، کاربر آن را به دو تراکنش ثبت می‌کند.

این محدودیت باعث می‌شود Cost Basis و گزارش قابل حسابرسی بماند.

### `FundMovement`

یک فیلد اختیاری:

```ts
loanId?: number;
loanPaymentId?: number;
```

این فیلدها اجازه می‌دهند واریز اولیه ذخیره و برداشت برای قسط به وام متصل شوند.

---

## 5. Migration

در `db-schema.ts`:

```ts
export const storesV9 = {
  ...storesV8,
  loans: "++id, status, firstPaymentAt, updatedAt",
  loanPayments: "++id, loanId, [loanId+installmentNo], dueAt, paidAt",
  loanRiskAlerts: "++id, loanId, assetId, kind, enabled, updatedAt",
};
```

در `app-version.ts`:

```ts
LOCAL_DATABASE_SCHEMA_VERSION = 9
```

Migration باید destructive نباشد.

جداول موجود فقط Indexهای فعلی را حفظ می‌کنند. فیلدهای اختیاری `loanId` نیاز به Backfill ندارند.

---

## 6. Backup و Restore

این بخش Release Blocker است.

باید موارد زیر به Portable Data اضافه شوند:

- loans
- loanPayments
- loanRiskAlerts

و Preview نیز تعداد آن‌ها را نشان دهد.

`InvestmentTransaction.loanId` و `FundMovement.loanId` خودبه‌خود همراه همان جدول صادر می‌شوند.

Validation باید:

- نبود جدول Loan در Backup قدیمی را قبول کند
- Backup جدیدتر از Schema فعلی را رد کند
- Loan Payment بدون Loan معتبر را Data Health Issue بداند

---

## 7. موتور محاسبات

فایل پیشنهادی:

```text
lib/loans/calculations.ts
```

توابع Pure:

```ts
monthlyLoanRate(nominalAnnualRatePct)
loanInstallment(principalToman, nominalAnnualRatePct, termMonths)
effectiveAnnualLoanRate(nominalAnnualRatePct)
loanTotalRepayment(...)
loanOutstandingPrincipal(...)
loanAmortizationSchedule(...)
loanReserveTarget(installmentToman, months)
loanReserveRunway(reserveValueToman, installmentToman)
equivalentLossBudget(installmentToman, installments)
loanScenarioEndingBalance(...)
loanBreakEvenAnnualRate(...)
```

هیچ تابع محاسباتی نباید مستقیم DB بخواند.

---

## 8. موتور تحلیل وضعیت

فایل پیشنهادی:

```text
lib/loans/analytics.ts
```

وظایف:

- محاسبه Schedule تا امروز
- تشخیص قسط بعدی
- جمع پرداخت‌های واقعی
- محاسبه External Contribution
- محاسبه ارزش Reserve
- محاسبه ارزش Assetهای linked
- محاسبه Gross Loan Equity
- محاسبه Net Strategy Effect
- محاسبه Runway
- محاسبه Risk Budget breach

خروجی باید یک View Model پایدار برای UI بدهد.

---

## 9. منبع قیمت بازار

برای USD و Gold از Market Runtime فعلی استفاده شود:

```text
USD
IR_GOLD_18K
```

برای سهام و ETF از هویت Provider فعلی استفاده شود.

قانون:

```text
runtimeSource === "snapshot"
```

یعنی ارزش برای نمایش می‌تواند حفظ شود، اما هشدار لحظه‌ای نباید Trigger شود.

این منطق نباید در Component دوباره نوشته شود. Helper مشترک ساخته شود.

---

## 10. یادآور قسط

### V1 Local Reminder

فایل پیشنهادی:

```text
lib/loans/reminders.ts
hooks/use-loan-reminders.ts
```

در هر بار باز شدن Workspace:

1. وام‌های فعال خوانده شوند.
2. قسط بعدی محاسبه شود.
3. اگر امروز در یکی از Lead Dayهاست، Reminder ساخته شود.
4. اگر Payment ثبت شده، Reminder همان Installment خاموش شود.
5. Duplicate Notification با کلید یکتا کنترل شود.

کلید نمونه:

```text
loan:<loanId>:installment:<n>:lead:<days>
```

State آخرین اعلان می‌تواند در `appMeta` نگهداری شود تا جدول اضافی لازم نباشد.

### Browser Notification

از الگوی فعلی `use-market-alerts` استفاده شود.

ابتدا In-App state منبع حقیقت است. Notification سیستم فقط Surface دوم است.

### Background Push

در V1 اجباری نیست چون Feature فعلی آزمایشی است.

بعد از پایدار شدن Background Push می‌توان Reminderهای سررسید را به Server Schedule متصل کرد.

---

## 11. Risk Alert Engine

فایل پیشنهادی:

```text
lib/loans/alerts.ts
hooks/use-loan-alerts.ts
```

از الگوی فعلی Market Alert استفاده شود:

```text
trigger
rearm
none
unavailable
```

برای جلوگیری از Spam:

### Reserve

Trigger:

```text
runway < threshold
```

Rearm:

```text
runway >= threshold + hysteresis
```

مثلا Threshold = 3 و Rearm = 3.5.

### Loss Budget

Trigger فقط با Quote تازه:

```text
lossToman >= lossBudgetToman
```

Rearm وقتی زیان به شکل معنی‌دار پایین‌تر از بودجه برگشته باشد.

---

## 12. UI Component Architecture

پوشه پیشنهادی:

```text
components/loans/
  loan-editor.tsx
  loan-wizard.tsx
  loan-summary-card.tsx
  loan-next-payment-card.tsx
  loan-reserve-card.tsx
  loan-debt-card.tsx
  loan-risk-banner.tsx
  loan-payment-dialog.tsx
  loan-payment-list.tsx
  loan-assets-card.tsx
  loan-scenario-card.tsx
  loan-alerts-card.tsx
  loan-empty-state.tsx
```

صفحه اصلی فقط Composition انجام دهد و منطق مالی داخل Component نماند.

---

## 13. Route Architecture

```text
app/(workspace)/loans/page.tsx
app/(workspace)/loans/new/page.tsx
app/(workspace)/loans/[id]/page.tsx
```

در صورت زیاد شدن فایل صفحه Detail، Section سطح بالاتر ساخته شود:

```text
components/sections/loans.tsx
components/loans/loan-detail.tsx
```

---

## 14. ناوبری

Desktop:

- Loan به `appNav` اضافه شود.

Mobile:

- `mobilePrimaryNav` فعلا تغییر نکند.
- Loans داخل `MobileMenu` اضافه شود.
- Dashboard Shortcut contextual اضافه شود.

این تصمیم از شلوغ شدن Bottom Nav جلوگیری می‌کند.

---

## 15. تغییر Dialog سرمایه‌گذاری

`transaction-dialog.tsx`:

بخش جدید اختیاری:

```text
منبع خرید
[پول شخصی] [وام فعال]
```

اگر وام فعال وجود ندارد، این بخش نمایش داده نشود.

در Edit تراکنش نیز باید Loan Link قابل تغییر باشد و Integrity بررسی شود.

فروش دارایی Linked می‌تواند `loanId` همان خرید را لزوما به ارث نبرد، چون Lot Matching ممکن است چند منبع داشته باشد.

برای V1 بهتر است فروش مرتبط با وام هنگام ثبت پرداخت یا در گزارش از Lotهای Loan-linked محاسبه شود. قبل از Implementation نهایی باید این Edge Case با تست Lots بسته شود.

---

## 16. تغییر Fund Movement

`fund-movement.tsx`:

اگر وام فعال وجود دارد:

- Source Loan اختیاری
- اگر Fund ذخیره رسمی Loan است، Default همان Loan

اگر برداشت باعث شود Runway زیر Threshold برود، قبل از تایید Warning نشان داده شود.

این Warning مانع اجباری نیست، مگر موجودی منفی شود.

---

## 17. Data Health

Ruleهای جدید:

- Loan Payment با `loanId` ناموجود
- `reserveFundId` ناموجود
- Fund Movement با Loan ناموجود
- Investment Transaction با Loan ناموجود
- Payment Sources که جمع آن‌ها با amount برابر نیست
- installmentNo خارج از term
- Loan closed ولی قسط باز در گذشته دارد

Repair خودکار فقط برای موارد قطعی مثل normalize عدد انجام شود.

Link خراب نباید به صورت حدسی به Loan دیگری متصل شود.

---

## 18. Activity

Activity Feed باید رویدادهای جدید را بفهمد:

- وام ثبت شد
- قسط پرداخت شد
- ذخیره وام تقویت شد
- سرمایه‌گذاری با پول وام ثبت شد

اما Alertها به عنوان تراکنش مالی وارد Activity نشوند. آن‌ها وضعیت هستند.

---

## 19. Search

Global Search باید Loan Name و Lender را پیدا کند و به `/loans/[id]` هدایت کند.

---

## 20. Reports

V1 Report جدید:

### Loan Strategy Summary

- اصل وام
- مانده بدهی
- پرداخت تا امروز
- External Contribution
- Reserve Value
- Loan-linked Asset Value
- Realized PnL
- Unrealized PnL
- Gross Loan Equity
- Net Strategy Effect

این Report نباید Loan را در Total Income فعلی جمع کند.

---

## 21. تست‌های ضروری

### Unit

- PMT فرمول
- EAR
- Schedule
- Outstanding Principal
- Reserve Runway
- Scenario Ending Balance
- Break-even
- Loss Budget
- Risk Alert Transition

### Data

- V8 -> V9 migration
- Backup جدید
- Restore Backup جدید
- Restore Backup قدیمی بدون Loan table
- orphan Loan references

### Integration

- ساخت Loan
- ساخت Reserve Fund
- Link transaction
- ثبت Payment از Reserve
- ثبت Payment از External
- mixed source validation
- payment reminder de-duplication
- stale quote does not trigger risk alert

### Browser Smoke

- `/loans`
- `/loans/new`
- `/loans/[id]`
- mobile 375px
- desktop
- light/dark
- offline

---

## 22. Release Gate

قبل از Merge هر فاز:

```text
npm run typecheck
npm run lint
npm test
npm run check:lines
```

در فاز UI:

```text
npm run check:ui
npm run check:performance
npm run check:regressions
```

قبل از Release نهایی:

```text
npm run check:release
```

---

## 23. فازهای اجرا

### Phase 1: اقتصاد + Product + UX + معماری

خروجی:

- مدل اقتصادی
- UX Spec
- Technical Plan
- بدون تغییر Schema Runtime

Gate:

- فرمول‌ها و اصطلاحات مشخص
- Scope V1 بسته
- Edge Caseهای اصلی ثبت شده

### Phase 2: Loan Core ✅

خروجی پیاده‌سازی‌شده:

- Schema V9
- Typeها
- محاسبات Pure
- Loan CRUD
- Loan Payment Ledger
- Backup/Restore
- Unit Tests

UI در این فاز حداقلی است.

### Phase 3: Product UI و اتصال به Fund/Investment ✅

خروجی پیاده‌سازی‌شده:

- `/loans`
- Wizard
- Detail
- Reserve Link
- Investment Link
- Payment Dialog
- Dashboard Card
- Reports
- Search/Activity
- Offline/PWA route integration
- سناریوی ثابت و گزارش اثر خالص

### Phase 4: Reminder + Risk Alerts + Market Integration

#### Phase 4.1: Reminder + Notification ✅

- Payment Reminder هنگام اجرای Workspace
- Browser Notification با Permission صریح
- Deduplication محلی در `appMeta`
- Background Push اختیاری و Privacy-minimized
- Generic Server Payload و Local Enrichment در Service Worker

#### Phase 4.2: Risk Engine ✅

- Reserve Runway Alert
- Loss Budget Alert بر مبنای زیان باز و تعداد قسط
- Health Summary برای Dashboard، لیست و Detail
- Anti-spam Armed/Rearm و Hysteresis
- عدم Trigger خودکار از Snapshot

#### Phase 4.3: Market Integration ✅

- Fresh Quote guard دقیق زمانی
- `quote_stale` و `spread_below`
- اتصال Background Push به Risk Alertهای قابل ارزیابی سروری
- تکمیل Scenario tools بازار

### Phase 5: Hardening و Release

خروجی:

- Data Health
- Accessibility
- Responsive QA
- Offline QA
- Full Regression
- Release notes
- نسخه نهایی Zip

---

## 24. تصمیم‌های بسته‌شده در Phase 2

Schema V9 با این تصمیم‌ها Freeze شده است:

1. فروش دارایی به‌صورت خودکار از Lots به یک وام نسبت داده نمی‌شود. `InvestmentTransaction.loanId` انتساب صریح منبع را نگه می‌دارد و `LoanPayment.saleTransactionIds` فروش‌های مصرف‌شده برای قسط را مشخص می‌کند. یک فروش نمی‌تواند برای دو پرداخت وام مصرف شود.
2. V1 فقط قرارداد اقساط مساوی را پشتیبانی می‌کند. اگر مبلغ واقعی بانک با فرمول استاندارد فرق داشته باشد `actualInstallmentToman` منبع حقیقت است. Schedule نامساوی در V1 وارد Scope نمی‌شود.
3. هر Loan در V1 حداکثر یک `reserveFundId` دارد. خود صندوق از زیرساخت موجود Fund و Fund Movement استفاده می‌کند.
4. موتور خودکار جریمه دیرکرد در V1 وجود ندارد. اگر هزینه‌ای واقعی رخ دهد، فقط به‌صورت داده واقعی ثبت می‌شود و نباید از روی حدس تولید شود.
5. Reminder تاریخ قراردادی را جابه‌جا نمی‌کند. تعطیلی یا روز کاری در V1 سررسید را بازنویسی نمی‌کند.
6. برداشت صندوق برای پرداخت قسط با `FundMovementSource = "loan_payment"` ثبت می‌شود. این گردش سیستمی فقط Withdraw است و مانند گردش Manual مستقل ویرایش نمی‌شود.

جزئیات Gate و شواهد اجرای این فاز در `phase-2-acceptance.fa.md` ثبت شده است.


## 25. تصمیم‌های بسته‌شده در Phase 3

1. ذخیره اولیه تامین‌شده از خود وام با `loan_reserve` ثبت می‌شود و آورده شخصی نیست.
2. واریز Manual که به `loanId` متصل شده، آورده شخصی است و در اثر خالص استراتژی کسر می‌شود.
3. وجه نقد قابل ردیابی وام به‌صورت مشتق‌شده از اصل وام، هزینه اولیه، ذخیره تامین‌شده از وام، خریدها، فروش‌ها و پرداخت‌های تامین‌شده از فروش محاسبه می‌شود و جزو `StrategyAssets` است.
4. اگر خریدهای Loan-linked از وجه قابل ردیابی بیشتر شوند، اختلاف به‌عنوان حداقل آورده شخصی لازم محاسبه می‌شود تا سود ساختگی ایجاد نشود.
5. انتخاب Sale برای پرداخت قسط، `loanId` تراکنش را خودکار تغییر نمی‌دهد؛ فقط Saleای که از قبل به همان Loan متصل است پذیرفته می‌شود و مصرف آن در `LoanPayment.saleTransactionIds` ثبت می‌شود.
6. Transaction فقط با انتخاب صریح کاربر به Loan متصل می‌شود. خرید ترکیبی همچنان باید به دو تراکنش شکسته شود.
7. اتصال Reserve Fund موجود در V1 فقط وقتی مجاز است که صندوق خالی باشد. تغییر صندوق ذخیره نیز تا وقتی صندوق فعلی موجودی دارد مسدود می‌ماند تا attribution خراب نشود.
8. Dashboard و Reports فقط داده واقعی Ledger را نمایش می‌دهند و Scenario از عملکرد واقعی جداست.
9. Reminder و Risk setting در Phase 3 ذخیره می‌شود، اما اجرای زمان‌دار و درخواست Notification permission در Phase 4 است.

جزئیات Gate و UX اجراشده در `phase-3-acceptance.fa.md` ثبت شده است.


## 26. تصمیم‌های بسته‌شده در Phase 4.1

1. Reminder قسط از داده قرارداد و Payment Ledger مشتق می‌شود و جدول جدید نمی‌سازد.
2. Permission مرورگر فقط با Gesture کاربر درخواست می‌شود.
3. Notification محلی با `appMeta` و Reminder Key یکتا Deduplicate می‌شود.
4. Overdue فقط یک کلید پایدار دارد و روزانه Notification تکراری تولید نمی‌کند.
5. Background Push همچنان Opt-in و پشت Feature Flag است.
6. Remote Loan Reminder هیچ نام، مبلغ، اصل وام، موجودی یا دارایی کاربر را ارسال نمی‌کند.
7. Service Worker می‌تواند پس از دریافت Push، متن را فقط با داده IndexedDB همان دستگاه غنی کند.
8. Tindex Token برای Loan-only Push لازم نیست و فقط برای Remote Market Alert لازم است.

جزئیات Gate در `phase-4-1-acceptance.fa.md` ثبت شده است.

## 27. تصمیم‌های بسته‌شده در Phase 4.2

1. مرز ذخیره به واحد قسط نگهداری می‌شود و برای هدف‌های معمول حداکثر ۳ قسط است.
2. بودجه زیان هر دارایی از `riskBudgetInstallments` وام مشتق می‌شود و Alert جدا برای هر موقعیت باز ساخته می‌شود.
3. Loss Budget از زیان **باز** استفاده می‌کند؛ سود و زیان تحقق‌یافته تاریخی مبنای Stop-loss جاری نیست.
4. موقعیت کاملا بسته دیگر Policy فعال Loss Budget ندارد.
5. Snapshot محلی برای نمایش ارزش مجاز است، اما Risk Alert خودکار Loss Budget را Trigger نمی‌کند.
6. Hysteresis برای Reserve با فاصله Trigger/Rearm و برای Loss با Rearm در ۸۰٪ بودجه اجرا می‌شود.
7. Disable کردن Alert یا Browser Notification انتخاب کاربر است و Sync Policy آن را بازنویسی نمی‌کند.
8. Phase 4.2 Local-First است و هیچ Payload جدیدی برای Background Push اضافه نمی‌کند.

جزئیات Gate در `phase-4-2-acceptance.fa.md` ثبت شده است.
