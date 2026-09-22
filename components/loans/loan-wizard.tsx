"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RiBankCardLine, RiInformationLine, RiShieldCheckLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { LoanField, MiniStat, WizardFooter, WizardProgress } from "@/components/loans/loan-form-parts";
import { formatMoney, formatNumber, formatPercent, dateToISO, isoToDate } from "@/lib/format";
import { loanBreakEvenAnnualRate, loanContractInstallment, loanReserveTarget, loanTotalRepayment } from "@/lib/loans/calculations";
import { createLoanSetup, type ReserveSetup } from "@/lib/loans/setup";
import { addCalendarMonths } from "@/lib/loans/schedule";
import { toPersianUiError } from "@/lib/errors";
import type { AppSettings, Asset, GoalFund, LoanAllocationPlanItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { LOAN_TEMPLATES } from "@/lib/loans/templates";

const STEPS = ["قرارداد", "ذخیره", "تخصیص", "یادآور و ریسک"];
const reserveByStability = { stable: 6, variable: 9, irregular: 12 } as const;

type LoanCalcSummary = {
  installment: number;
  reserveTarget: number;
  reserveDeposit: number;
  total: number;
  breakEven: number;
  investable: number;
};

type ContractStepProps = {
  unit: AppSettings["displayUnit"]; name: string; lender: string; principal: number | null; rate: number; term: number;
  disbursedAt: string; firstPaymentAt: string; actualInstallment: number | null; upfrontCosts: number | null; calc: LoanCalcSummary | null;
  setters: {
    setName: (value: string) => void; setLender: (value: string) => void; setPrincipal: (value: number | null) => void;
    setRate: (value: number) => void; setTerm: (value: number) => void; setDisbursedAt: (value: string) => void;
    setFirstPaymentAt: (value: string) => void; setActualInstallment: (value: number | null) => void; setUpfrontCosts: (value: number | null) => void;
  };
};

type ReserveStepProps = {
  unit: AppSettings["displayUnit"]; funds: GoalFund[]; reserveMonths: number; reserveMode: ReserveSetup["mode"]; reserveFundId: number | null; calc: LoanCalcSummary | null;
  onMonths: (value: number) => void; onMode: (value: ReserveSetup["mode"]) => void; onFund: (value: number | null) => void;
};

type RiskStepProps = {
  installment: number; unit: AppSettings["displayUnit"]; riskBudget: number; reminders: number[]; notifyBrowser: boolean;
  onRisk: (value: number) => void; onReminders: (value: number[]) => void; onNotify: (value: boolean) => void;
};

export function LoanWizard({ settings, funds, assets }: { settings: AppSettings; funds: GoalFund[]; assets: Asset[] }) {
  const router = useRouter();
  const today = dateToISO(new Date());
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const templateId = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("template") : null;
  const template = LOAN_TEMPLATES.find((item) => item.id === templateId);
  const [name, setName] = useState(template?.title ?? "وام ودیعه مسکن");
  const [lender, setLender] = useState(template?.lender ?? "");
  const [principal, setPrincipal] = useState<number | null>(template?.principalToman ?? 280_000_000);
  const [rate, setRate] = useState(template?.rate ?? 23);
  const [term, setTerm] = useState(template?.term ?? 60);
  const [disbursedAt, setDisbursedAt] = useState(today);
  const [firstPaymentAt, setFirstPaymentAt] = useState(addCalendarMonths(today, 1));
  const [actualInstallment, setActualInstallment] = useState<number | null>(null);
  const [upfrontCosts, setUpfrontCosts] = useState<number | null>(null);
  const [reserveMonths, setReserveMonths] = useState<number>(reserveByStability[settings.incomeStability]);
  const [reserveMode, setReserveMode] = useState<ReserveSetup["mode"]>("new");
  const [reserveFundId, setReserveFundId] = useState<number | null>(null);
  const [allocation, setAllocation] = useState<Record<number, number>>({});
  const [allocationMode, setAllocationMode] = useState<"amount" | "percent">("amount");
  const [allocationPercent, setAllocationPercent] = useState<Record<number, number>>({});
  const [riskBudget, setRiskBudget] = useState(2);
  const [reminders, setReminders] = useState([7, 3, 1, 0]);
  const [notifyBrowser, setNotifyBrowser] = useState(false);

  const terms = { principalToman: principal ?? 0, nominalAnnualRatePct: rate, termMonths: term, actualInstallmentToman: actualInstallment || undefined, upfrontCostsToman: upfrontCosts || undefined };
  let calc: LoanCalcSummary | null = null;
  try {
    const installment = loanContractInstallment(terms);
    const reserveTarget = loanReserveTarget(installment, reserveMonths);
    const reserveDeposit = reserveMode === "new" ? Math.min(reserveTarget, Math.max(0, (principal ?? 0) - (upfrontCosts ?? 0))) : 0;
    calc = { installment, reserveTarget, reserveDeposit, total: loanTotalRepayment(terms), breakEven: loanBreakEvenAnnualRate(terms), investable: Math.max(0, (principal ?? 0) - (upfrontCosts ?? 0) - reserveDeposit) };
  } catch {
    calc = null;
  }
  const allocated = Object.values(allocation).reduce((sum, value) => sum + (Number.isFinite(value) ? value : 0), 0);
  const allocationOver = Boolean(calc && allocated > calc.investable + 0.5);
  const allocationPercentTotal = Object.values(allocationPercent).reduce((sum, value) => sum + (Number.isFinite(value) ? value : 0), 0);
  const activeAssets = assets.filter((asset) => !asset.archived && asset.id);

  function contractValid() { return Boolean(name.trim() && principal && principal > 0 && rate >= 0 && term > 0 && disbursedAt && firstPaymentAt && calc); }
  function next() {
    if (step === 0 && !contractValid()) { toast({ tone: "error", title: "شرایط وام کامل نیست", description: "نام، مبلغ، نرخ، مدت و تاریخ‌ها را بررسی کن." }); return; }
    if (step === 1 && reserveMode === "existing" && !reserveFundId) { toast({ tone: "error", title: "صندوق ذخیره را انتخاب کن" }); return; }
    if (step === 2 && allocationMode === "amount" && allocationOver) { toast({ tone: "error", title: "تخصیص از پول قابل استفاده بیشتر است" }); return; }
    if (step === 2 && allocationMode === "percent" && Math.abs(allocationPercentTotal - 100) > 0.01) { toast({ tone: "error", title: "جمع درصدها باید ۱۰۰٪ باشد", description: `جمع فعلی ${formatPercent(allocationPercentTotal, 1)} است.` }); return; }
    setStep((current) => Math.min(STEPS.length - 1, current + 1));
  }

  async function finish() {
    if (!calc || !contractValid() || (allocationMode === "amount" && allocationOver) || (allocationMode === "percent" && Math.abs(allocationPercentTotal - 100) > 0.01)) return;
    setBusy(true);
    try {
      const browserPermission = notifyBrowser;
      const allocationPlan: LoanAllocationPlanItem[] = activeAssets.flatMap((asset) => {
        const amountToman = asset.id ? allocationMode === "percent" ? Math.round(calc.investable * (allocationPercent[asset.id] ?? 0) / 100) : allocation[asset.id] ?? 0 : 0;
        return amountToman > 0 ? [{ assetId: asset.id, label: asset.name, amountToman }] : [];
      });
      const reserve: ReserveSetup = reserveMode === "existing" && reserveFundId ? { mode: "existing", fundId: reserveFundId } : reserveMode === "new" ? { mode: "new", initialDepositToman: calc.reserveDeposit } : { mode: "none" };
      const { loanId } = await createLoanSetup({
        name: name.trim(), lender: lender.trim() || undefined, principalToman: principal!, nominalAnnualRatePct: rate, termMonths: term,
        disbursedAt, firstPaymentAt, actualInstallmentToman: actualInstallment || undefined, upfrontCostsToman: upfrontCosts || undefined,
        reserveTargetMonths: reserveMonths, riskBudgetInstallments: riskBudget || undefined, allocationPlan, reminderDays: reminders, notifyBrowser: browserPermission,
      }, reserve);
      toast({ tone: "success", title: "برنامه وام ساخته شد", description: browserPermission ? "ذخیره، برنامه تخصیص و ترجیح اعلان ثبت شدند. اجازه مرورگر هنگام فعال‌شدن پایش درخواست می‌شود." : "وام، ذخیره و برنامه بازپرداخت ثبت شدند." });
      router.push(`/loans/${loanId}`);
    } catch (error) { toast({ tone: "error", title: "ساخت وام انجام نشد", description: toPersianUiError(error, "اطلاعات را بررسی کن و دوباره تلاش کن.") }); }
    finally { setBusy(false); }
  }

  return <div className="mx-auto max-w-5xl space-y-4"><div><div className="type-caption type-body-strong text-primary">وام و تعهد</div><h1 className="mt-1 type-page-title">ساخت برنامه بازپرداخت</h1><p className="mt-1 max-w-2xl type-body text-muted-foreground">این مقادیر پیشنهادی هستند. قبل از ثبت می‌توانید آن‌ها را تغییر دهید.</p></div><WizardProgress step={step} labels={STEPS} />
    <Card><CardContent className="p-4 sm:p-6">{step === 0 && <ContractStep unit={settings.displayUnit} name={name} lender={lender} principal={principal} rate={rate} term={term} disbursedAt={disbursedAt} firstPaymentAt={firstPaymentAt} actualInstallment={actualInstallment} upfrontCosts={upfrontCosts} calc={calc} setters={{ setName, setLender, setPrincipal, setRate, setTerm, setDisbursedAt, setFirstPaymentAt, setActualInstallment, setUpfrontCosts }} />}{step === 1 && <ReserveStep unit={settings.displayUnit} funds={funds} reserveMonths={reserveMonths} reserveMode={reserveMode} reserveFundId={reserveFundId} calc={calc} onMonths={setReserveMonths} onMode={setReserveMode} onFund={setReserveFundId} />}{step === 2 && <AllocationStep unit={settings.displayUnit} assets={activeAssets} investable={calc?.investable ?? 0} allocation={allocation} allocationMode={allocationMode} allocationPercent={allocationPercent} onMode={setAllocationMode} onAllocation={setAllocation} onPercent={setAllocationPercent} over={allocationOver} percentTotal={allocationPercentTotal} />}{step === 3 && <RiskStep installment={calc?.installment ?? 0} unit={settings.displayUnit} riskBudget={riskBudget} reminders={reminders} notifyBrowser={notifyBrowser} onRisk={setRiskBudget} onReminders={setReminders} onNotify={setNotifyBrowser} />}</CardContent></Card>
    <WizardFooter step={step} last={STEPS.length - 1} busy={busy} onBack={() => setStep((current) => Math.max(0, current - 1))} onNext={next} onSubmit={() => void finish()} />
  </div>;
}

function ContractStep({ unit, name, lender, principal, rate, term, disbursedAt, firstPaymentAt, actualInstallment, upfrontCosts, calc, setters }: ContractStepProps) {
  return <div className="space-y-5"><StepTitle icon={<RiBankCardLine />} title="شرایط واقعی قرارداد" desc="اگر مبلغ قسط بانک را داری وارد کن؛ همان عدد بر محاسبه نظری اولویت دارد."/><div className="grid gap-4 sm:grid-cols-2"><LoanField label="نام وام"><Input value={name} onChange={(e) => setters.setName(e.target.value)} /></LoanField><LoanField label="بانک یا وام‌دهنده" hint="اختیاری"><Input value={lender} onChange={(e) => setters.setLender(e.target.value)} /></LoanField><LoanField label="مبلغ دریافتی"><MoneyInput value={principal} onValueChange={setters.setPrincipal} unit={unit}/></LoanField><LoanField label="نرخ اسمی سالانه"><Input type="number" min={0} step="0.1" value={rate} onChange={(e) => setters.setRate(Number(e.target.value))}/></LoanField><LoanField label="تعداد اقساط"><Input type="number" min={1} max={600} value={term} onChange={(e) => setters.setTerm(Number(e.target.value))}/></LoanField><LoanField label="قسط واقعی بانک" hint="اختیاری"><MoneyInput value={actualInstallment} onValueChange={setters.setActualInstallment} unit={unit}/></LoanField><LoanField label="تاریخ دریافت"><DatePicker value={isoToDate(disbursedAt)} onValueChange={(v) => v && setters.setDisbursedAt(dateToISO(v))}/></LoanField><LoanField label="تاریخ اولین قسط"><DatePicker value={isoToDate(firstPaymentAt)} onValueChange={(v) => v && setters.setFirstPaymentAt(dateToISO(v))}/></LoanField><LoanField label="هزینه اولیه و جانبی" hint="اختیاری"><MoneyInput value={upfrontCosts} onValueChange={setters.setUpfrontCosts} unit={unit}/></LoanField></div>{calc && <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4"><MiniStat label="قسط مبنا" value={formatMoney(calc.installment, unit, true)} note={actualInstallment ? "قسط واقعی قرارداد" : "برآورد فرمولی"}/><MiniStat label="کل بازپرداخت" value={formatMoney(calc.total, unit, true)}/><MiniStat label="نقطه سر به سر" value={formatPercent(calc.breakEven, 1)} note="بازده موثر سالانه ریاضی"/><MiniStat label="هزینه اولیه" value={formatMoney(upfrontCosts ?? 0, unit, true)}/></div>}</div>;
}

function ReserveStep({ unit, funds, reserveMonths, reserveMode, reserveFundId, calc, onMonths, onMode, onFund }: ReserveStepProps) {
  const presets = [3, 6, 9, 12];
  const emptyFunds = funds.filter((fund) => fund.id && fund.currentToman <= 0.5);
  return <div className="space-y-5"><StepTitle icon={<RiShieldCheckLine />} title="اول ذخیره بازپرداخت" desc="امنیت پایه را به بازده آینده وابسته نمی‌کنیم. موجودی امروز معیار پوشش فعلی است."/><div className="flex flex-wrap gap-2">{presets.map((months) => <Button key={months} type="button" variant={reserveMonths === months ? "default" : "outline"} onClick={() => onMonths(months)}>{months} قسط</Button>)}</div>{calc && <div className="grid gap-2 sm:grid-cols-2"><MiniStat label="هدف ذخیره" value={formatMoney(calc.reserveTarget, unit, true)} note={`${reserveMonths} قسط`}/><MiniStat label="پول باقی‌مانده پس از ذخیره" value={formatMoney(calc.investable, unit, true)} note={reserveMode === "new" ? "با تامین کامل ذخیره از همین وام" : "ذخیره جدید از وام کسر نشده"}/></div>}<LoanField label="روش ذخیره"><Select value={reserveMode} onValueChange={(value) => onMode(value as ReserveSetup["mode"])} options={[{ value: "new", label: "ساخت صندوق اختصاصی و تامین کامل از وام" }, { value: "existing", label: "اتصال به صندوق خالی موجود" }, { value: "none", label: "فعلاً فقط هدف را ثبت کن" }]}/></LoanField>{reserveMode === "existing" && <LoanField label="صندوق خالی موجود" hint="برای جلوگیری از اشتباه در محاسبه آورده شخصی، صندوق دارای موجودی در این نسخه قابل اتصال نیست."><Select value={reserveFundId ? String(reserveFundId) : undefined} onValueChange={(v) => onFund(Number(v))} placeholder={emptyFunds.length ? "انتخاب صندوق" : "صندوق خالی پیدا نشد"} options={emptyFunds.map((fund) => ({ value: String(fund.id), label: fund.name }))}/></LoanField>}</div>;
}

function AllocationStep({ unit, assets, investable, allocation, allocationMode, allocationPercent, onMode, onAllocation, onPercent, over, percentTotal }: { unit: AppSettings["displayUnit"]; assets: Asset[]; investable: number; allocation: Record<number, number>; allocationMode: "amount" | "percent"; allocationPercent: Record<number, number>; onMode: (value: "amount" | "percent") => void; onAllocation: (v: Record<number, number>) => void; onPercent: (v: Record<number, number>) => void; over: boolean; percentTotal: number }) {
  const used = allocationMode === "percent" ? investable * percentTotal / 100 : Object.values(allocation).reduce((sum, value) => sum + (value || 0), 0);
  const cash = investable - used;
  const setSuggestion = (values: number[]) => onPercent(Object.fromEntries(assets.map((asset, index) => [asset.id!, values[index] ?? 0])));
  return <div className="space-y-5"><StepTitle icon={<RiInformationLine />} title="برنامه تخصیص، نه دستور خرید" desc="این فقط یک الگوی تخصیص است و خریدی در این مرحله انجام نمی‌شود."/><div className="flex gap-2"><Button type="button" variant={allocationMode === "amount" ? "default" : "outline"} onClick={() => onMode("amount")}>مبلغ</Button><Button type="button" variant={allocationMode === "percent" ? "default" : "outline"} onClick={() => onMode("percent")}>درصد</Button></div>{allocationMode === "percent" && <div className="flex flex-wrap gap-2"><span className="type-caption self-center text-muted-foreground">الگوهای پیشنهادی:</span><Button type="button" size="sm" variant="outline" onClick={() => setSuggestion([10, 30, 60])}>امن</Button><Button type="button" size="sm" variant="outline" onClick={() => setSuggestion([20, 40, 40])}>متعادل</Button><Button type="button" size="sm" variant="outline" onClick={() => setSuggestion([30, 50, 20])}>رشد</Button></div>}<div className="grid gap-2 sm:grid-cols-3"><MiniStat label="قابل تخصیص" value={formatMoney(investable, unit, true)}/><MiniStat label="تخصیص‌شده" value={formatMoney(Math.max(0, used), unit, true)}/><MiniStat label="فعلاً نقد می‌ماند" value={formatMoney(Math.max(0, cash), unit, true)}/></div><div className="grid gap-3 sm:grid-cols-2">{assets.map((asset) => { const percent = allocationPercent[asset.id!] ?? 0; const amount = allocationMode === "percent" ? Math.round(investable * percent / 100) : allocation[asset.id!] ?? 0; const price = asset.manualPriceToman; const quantity = price && amount > 0 ? amount / price : 0; return <LoanField key={asset.id} label={asset.name} hint={allocationMode === "percent" ? `${formatMoney(amount, unit, true)} · ${percent}%` : asset.symbol}><div className="space-y-2">{allocationMode === "percent" ? <Input type="number" min={0} max={100} step="1" value={percent || ""} onChange={(event) => onPercent({ ...allocationPercent, [asset.id!]: Number(event.target.value) || 0 })} /> : <MoneyInput value={amount || null} onValueChange={(value) => onAllocation({ ...allocation, [asset.id!]: value ?? 0 })} unit={unit}/>} {price ? <p className="type-caption text-muted-foreground">قیمت آخر: {formatMoney(price, unit, true)} · مقدار تقریبی: {formatNumber(quantity, 6)} {asset.kind === "gold" ? "گرم" : asset.kind === "currency" ? "واحد" : "سهم/واحد"} — حدودی بر اساس آخرین قیمت دریافت‌شده</p> : <p className="type-caption text-muted-foreground">قیمت فعلی ثبت نشده؛ این مقدار قطعی نیست.</p>}</div></LoanField>; })}</div>{allocationMode === "percent" && <div className={cn("rounded-xl border p-3 type-caption", Math.abs(percentTotal - 100) > 0.01 ? "border-destructive/25 bg-destructive/8 text-destructive" : "border-primary/20 bg-primary/8 text-primary")}>جمع درصدها: {formatPercent(percentTotal, 1)}{Math.abs(percentTotal - 100) > 0.01 && " · باید ۱۰۰٪ باشد"}</div>}{over && allocationMode === "amount" && <div className="rounded-xl border border-destructive/25 bg-destructive/8 p-3 type-caption text-destructive">جمع تخصیص از پول قابل استفاده بیشتر است.</div>}<p className="type-caption text-muted-foreground">این الگو توصیه مالی نیست و همه اعداد قبل از ثبت قابل تغییر هستند.</p></div>;
}

function RiskStep({ installment, unit, riskBudget, reminders, notifyBrowser, onRisk, onReminders, onNotify }: RiskStepProps) {
  const options = [1,2,3];
  return <div className="space-y-5"><StepTitle icon={<RiShieldCheckLine />} title="مرز ریسک و یادآوری" desc="حد ضرر ثابت تحمیل نمی‌کنیم؛ بودجه زیان را با تعداد قسط تعریف می‌کنی."/><LoanField label="بودجه زیان"><div className="flex flex-wrap gap-2">{options.map((n) => <Button type="button" key={n} variant={riskBudget === n ? "default" : "outline"} onClick={() => onRisk(n)}>{n} قسط</Button>)}<Button type="button" variant={riskBudget === 0 ? "default" : "outline"} onClick={() => onRisk(0)}>خاموش</Button></div>{riskBudget > 0 && <p className="mt-2 type-caption text-muted-foreground">معادل {formatMoney(installment * riskBudget, unit, true)} زیان در کل موقعیت‌های متصل.</p>}</LoanField><LoanField label="یادآوری قسط"><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{[7,3,1,0].map((day) => { const checked = reminders.includes(day); return <button type="button" key={day} onClick={() => onReminders(checked ? reminders.filter((x: number) => x !== day) : [...reminders, day].sort((a,b) => b-a))} className={cn("min-h-11 rounded-xl border px-3 type-caption type-body-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", checked && "border-primary bg-primary/8 text-primary")}>{day === 0 ? "روز سررسید" : `${day} روز قبل`}</button>; })}</div></LoanField><div className="flex items-start justify-between gap-4 rounded-2xl border bg-muted/20 p-4"><div><div className="type-label">اعلان مرورگر</div><p className="mt-1 type-caption leading-6 text-muted-foreground">با اجازه خودت، یادآورها در فاز پایش از Notification سیستم هم نمایش داده می‌شوند.</p></div><Switch checked={notifyBrowser} onCheckedChange={onNotify}/></div></div>;
}

function StepTitle({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) { return <div className="flex gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary [&_svg]:size-5">{icon}</span><div><CardTitle>{title}</CardTitle><p className="mt-1 type-body text-muted-foreground">{desc}</p></div></div>; }
