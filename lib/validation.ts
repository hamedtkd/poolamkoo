import { assetRequiresManualPrice } from "@/lib/assets";
import { z } from "zod";

const requiredNumber = (message: string) => z.number({ error: message });
const requiredString = (message: string) => z.string({ error: message });

export const newMoneySchema = z.object({
  amount: requiredNumber("مبلغ را وارد کن.").positive("مبلغ باید بیشتر از صفر باشد."),
  title: requiredString("عنوان را وارد کن.")
    .trim()
    .min(2, "عنوان حداقل دو حرف باشد.")
    .max(60, "عنوان نباید بیشتر از ۶۰ حرف باشد."),
  date: z.date({ error: "تاریخ را انتخاب کن." }),
  smart: z.boolean({ error: "وضعیت پیشنهاد هوشمند معتبر نیست." }),
});

export type NewMoneyFormValues = z.infer<typeof newMoneySchema>;

export const assetSchema = z.object({
  name: requiredString("نام دارایی را وارد کن.")
    .trim()
    .min(2, "نام دارایی حداقل دو حرف باشد.")
    .max(60, "نام دارایی نباید بیشتر از ۶۰ حرف باشد."),
  kind: z.enum(["gold", "currency", "crypto", "stock", "fund", "custom"], { error: "نوع دارایی را انتخاب کن." }),
  symbol: z.string({ error: "نماد بازار معتبر نیست." }).trim().max(40, "نماد بازار نباید بیشتر از ۴۰ حرف باشد.").optional(),
  marketId: z.string({ error: "شناسه بازار معتبر نیست." }).trim().max(80, "شناسه بازار معتبر نیست.").optional(),
  marketSource: z.enum(["tsetmc", "tindex"], { error: "منبع بازار معتبر نیست." }).optional(),
  targetPct: requiredNumber("سهم هدف را انتخاب کن.")
    .min(0, "درصد نمی‌تواند منفی باشد.")
    .max(100, "درصد نمی‌تواند بیشتر از ۱۰۰ باشد."),
  manualPriceToman: z.number({ error: "قیمت دستی را به‌صورت عدد وارد کن." })
    .positive("قیمت باید بیشتر از صفر باشد.")
    .nullable()
    .optional(),
}).superRefine((value, ctx) => {
  if (assetRequiresManualPrice(value.kind, value.marketId) && !value.manualPriceToman) {
    ctx.addIssue({ code: "custom", path: ["manualPriceToman"], message: "اگر دارایی به بازار وصل نیست، قیمت فعلی را وارد کن." });
  }
});

export type AssetFormValues = z.infer<typeof assetSchema>;


export const openingHoldingSchema = z.object({
  assetId: requiredNumber("دارایی را انتخاب کن.").int("دارایی انتخاب‌شده معتبر نیست.").positive("دارایی انتخاب‌شده معتبر نیست."),
  quantity: requiredNumber("مقدار دارایی را وارد کن.").positive("مقدار دارایی باید بیشتر از صفر باشد."),
  price: requiredNumber("میانگین قیمت خرید را وارد کن.").positive("قیمت خرید باید بیشتر از صفر باشد."),
  date: z.date({ error: "تاریخ خرید را انتخاب کن." }),
});

export type OpeningHoldingFormValues = z.infer<typeof openingHoldingSchema>;

export const transactionSchema = z.object({
  type: z.enum(["buy", "sell"], { error: "نوع تراکنش را انتخاب کن." }),
  amount: requiredNumber("مبلغ کل را وارد کن.").positive("مبلغ باید بیشتر از صفر باشد."),
  price: requiredNumber("قیمت واحد را وارد کن.").positive("قیمت واحد باید بیشتر از صفر باشد."),
  date: z.date({ error: "تاریخ معامله را انتخاب کن." }),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;

export const allocationRuleSchema = z.object({
  life: requiredNumber("سهم زندگی را مشخص کن.").min(0, "سهم زندگی نمی‌تواند منفی باشد.").max(100, "سهم زندگی نمی‌تواند بیشتر از ۱۰۰٪ باشد."),
  safety: requiredNumber("سهم امنیت را مشخص کن.").min(0, "سهم امنیت نمی‌تواند منفی باشد.").max(100, "سهم امنیت نمی‌تواند بیشتر از ۱۰۰٪ باشد."),
  growth: requiredNumber("سهم رشد را مشخص کن.").min(0, "سهم رشد نمی‌تواند منفی باشد.").max(100, "سهم رشد نمی‌تواند بیشتر از ۱۰۰٪ باشد."),
}).refine((value) => Math.round(value.life + value.safety + value.growth) === 100, {
  message: "جمع سه بخش باید دقیقاً ۱۰۰٪ باشد.",
  path: ["growth"],
});

export type AllocationRuleFormValues = z.infer<typeof allocationRuleSchema>;

export const fundSchema = z.object({
  name: requiredString("نام صندوق را وارد کن.")
    .trim()
    .min(2, "نام صندوق حداقل دو حرف باشد.")
    .max(60, "نام صندوق نباید بیشتر از ۶۰ حرف باشد."),
  targetToman: requiredNumber("هدف صندوق را وارد کن.").positive("هدف باید بیشتر از صفر باشد."),
  currentToman: requiredNumber("موجودی فعلی را وارد کن.").min(0, "موجودی نمی‌تواند منفی باشد."),
  dueAt: z.date({ error: "موعد واردشده معتبر نیست." }).nullable().optional(),
  category: z.enum(["planned", "emergency", "custom"], { error: "نوع صندوق را انتخاب کن." }),
});

export type FundFormValues = z.infer<typeof fundSchema>;

export const onboardingSchema = z.object({
  preset: z.enum(["growth", "balanced", "comfort", "safety", "custom"], { error: "سبک مالی را انتخاب کن." }),
  life: requiredNumber("سهم زندگی را مشخص کن.").min(0, "سهم زندگی نمی‌تواند منفی باشد.").max(100, "سهم زندگی نمی‌تواند بیشتر از ۱۰۰٪ باشد."),
  safety: requiredNumber("سهم امنیت را مشخص کن.").min(0, "سهم امنیت نمی‌تواند منفی باشد.").max(100, "سهم امنیت نمی‌تواند بیشتر از ۱۰۰٪ باشد."),
  growth: requiredNumber("سهم رشد را مشخص کن.").min(0, "سهم رشد نمی‌تواند منفی باشد.").max(100, "سهم رشد نمی‌تواند بیشتر از ۱۰۰٪ باشد."),
  monthly: requiredNumber("هزینه ضروری ماهانه را وارد کن.").positive("هزینه ضروری ماهانه باید بیشتر از صفر باشد."),
  months: requiredNumber("تعداد ماه‌های ذخیره اضطراری را مشخص کن.").int("تعداد ماه باید عدد صحیح باشد.").min(1, "حداقل یک ماه را انتخاب کن.").max(12, "حداکثر ۱۲ ماه قابل انتخاب است."),
  stability: z.enum(["stable", "variable", "irregular"], { error: "وضعیت درآمد را انتخاب کن." }),
  risk: z.enum(["low", "medium", "high"], { error: "میزان تحمل نوسان را انتخاب کن." }),
}).refine((value) => Math.round(value.life + value.safety + value.growth) === 100, {
  message: "جمع قانون پول باید ۱۰۰٪ باشد.",
  path: ["growth"],
});

export const fundMovementSchema = z.object({
  type: z.enum(["deposit", "withdraw"], { error: "نوع عملیات را انتخاب کن." }),
  amount: requiredNumber("مبلغ را وارد کن.").positive("مبلغ باید بیشتر از صفر باشد."),
});
export type FundMovementFormValues = z.infer<typeof fundMovementSchema>;

export const incomeEditSchema = z.object({
  amount: requiredNumber("مبلغ را وارد کن.").positive("مبلغ باید بیشتر از صفر باشد."),
  title: requiredString("عنوان را وارد کن.")
    .trim()
    .min(2, "عنوان حداقل دو حرف باشد.")
    .max(60, "عنوان نباید بیشتر از ۶۰ حرف باشد."),
  date: z.date({ error: "تاریخ را انتخاب کن." }),
});
export type IncomeEditFormValues = z.infer<typeof incomeEditSchema>;

export const emergencyPlanSchema = z.object({
  monthlyEssentialToman: requiredNumber("هزینه ضروری ماهانه را وارد کن.").positive("هزینه ضروری ماهانه باید بیشتر از صفر باشد."),
  emergencyMonths: requiredNumber("تعداد ماه‌های ذخیره اضطراری را مشخص کن.")
    .int("تعداد ماه باید عدد صحیح باشد.")
    .min(1, "حداقل یک ماه.")
    .max(12, "حداکثر ۱۲ ماه."),
});
export type EmergencyPlanFormValues = z.infer<typeof emergencyPlanSchema>;


export const planExecutionSchema = z.object({
  amount: requiredNumber("\u0645\u0628\u0644\u063a \u0627\u062c\u0631\u0627\u0634\u062f\u0647 \u0631\u0627 \u0648\u0627\u0631\u062f \u06a9\u0646.").positive("\u0645\u0628\u0644\u063a \u0628\u0627\u06cc\u062f \u0628\u06cc\u0634\u062a\u0631 \u0627\u0632 \u0635\u0641\u0631 \u0628\u0627\u0634\u062f."),
});
export type PlanExecutionFormValues = z.infer<typeof planExecutionSchema>;
export const quickPlanSchema = z.object({
  label: requiredString("عنوان کارت را وارد کن.")
    .trim()
    .min(2, "عنوان کارت حداقل دو حرف باشد.")
    .max(60, "عنوان کارت نباید بیشتر از ۶۰ حرف باشد."),
  amount: requiredNumber("مبلغ برنامه را وارد کن.").positive("مبلغ برنامه باید بیشتر از صفر باشد."),
  bucket: z.enum(["life", "safety", "growth"], { error: "بخش برنامه را انتخاب کن." }),
  targetType: z.enum(["bucket", "fund", "asset"], { error: "نوع کارت را انتخاب کن." }),
  targetId: z.number({ error: "هدف انتخاب‌شده معتبر نیست." }).int().positive().nullable().optional(),
}).superRefine((value, ctx) => {
  if (value.bucket === "life" && value.targetType !== "bucket") {
    ctx.addIssue({ code: "custom", path: ["targetType"], message: "کارت زندگی باید از نوع عمومی باشد." });
  }
  if (value.bucket === "safety" && value.targetType === "asset") {
    ctx.addIssue({ code: "custom", path: ["targetType"], message: "برای بخش امنیت، صندوق یا هدف عمومی انتخاب کن." });
  }
  if (value.bucket === "growth" && value.targetType === "fund") {
    ctx.addIssue({ code: "custom", path: ["targetType"], message: "برای بخش رشد، دارایی یا هدف عمومی انتخاب کن." });
  }
  if ((value.targetType === "asset" || value.targetType === "fund") && !value.targetId) {
    ctx.addIssue({ code: "custom", path: ["targetId"], message: "هدف این کارت را انتخاب کن." });
  }
});
export type QuickPlanFormValues = z.infer<typeof quickPlanSchema>;

