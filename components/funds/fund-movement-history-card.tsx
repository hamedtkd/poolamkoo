"use client";

import { RiDeleteBin6Line, RiEditLine } from "react-icons/ri";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SensitiveValue } from "@/components/ui/sensitive-value";
import { formatSignedMoney, toPersianDate } from "@/lib/format";
import { fundMovementCanEdit, sortFundMovements } from "@/lib/fund-ledger";
import type { AppSettings, FundMovement, GoalFund } from "@/lib/types";

const sourceLabel: Record<FundMovement["source"], string> = {
  manual: "دستی",
  opening: "موجودی آغازین",
  plan: "اجرای برنامه",
  direct: "کنارگذاری مستقیم",
  income_reversal: "برگشت حذف ورودی",
  migration: "موجودی قدیمی",
};

export function FundMovementHistoryCard({ funds, movements, settings, onEdit, onDelete }: {
  funds: GoalFund[];
  movements: FundMovement[];
  settings: AppSettings;
  onEdit: (movement: FundMovement) => void;
  onDelete: (movement: FundMovement) => void;
}) {
  const fundNames = new Map(funds.filter((fund) => fund.id).map((fund) => [fund.id!, fund.name]));
  const rows = sortFundMovements(movements).reverse().slice(0, 30);
  return <Card>
    <CardHeader><CardTitle>گردش صندوق‌ها</CardTitle></CardHeader>
    <CardContent>
      {rows.length === 0 ? <p className="type-body text-muted-foreground">هنوز واریز یا برداشتی ثبت نشده است. موجودی صندوق‌های قدیمی بعد از ارتقا به‌صورت «موجودی قدیمی» ثبت می‌شود.</p> : (
        <div className="divide-y">
          {rows.map((movement) => {
            const editable = fundMovementCanEdit(movement);
            const positive = movement.type !== "withdraw";
            return <div key={movement.id ?? `${movement.fundId}-${movement.createdAt}`} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2"><span className="type-strong">{fundNames.get(movement.fundId) ?? "صندوق حذف‌شده"}</span><Badge>{sourceLabel[movement.source]}</Badge></div>
                <div className="mt-1 type-caption text-muted-foreground">{toPersianDate(movement.happenedAt)}{movement.note ? ` · ${movement.note}` : ""}</div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <SensitiveValue className={positive ? "type-strong" : "type-strong text-destructive"}>{formatSignedMoney(positive ? movement.amountToman : -movement.amountToman, settings.displayUnit)}</SensitiveValue>
                {editable && <><Button size="icon" variant="ghost" className="size-8" aria-label="ویرایش گردش صندوق" onClick={() => onEdit(movement)}><RiEditLine /></Button><Button size="icon" variant="ghost" className="size-8 text-destructive" aria-label="حذف گردش صندوق" onClick={() => onDelete(movement)}><RiDeleteBin6Line /></Button></>}
              </div>
            </div>;
          })}
        </div>
      )}
    </CardContent>
  </Card>;
}
