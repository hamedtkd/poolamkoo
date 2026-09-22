"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LOAN_TEMPLATES } from "@/lib/loans/templates";
import { formatMoney } from "@/lib/format";

export function LoanTemplatePicker(){
 const router=useRouter();
 return <div className="mx-auto max-w-4xl space-y-5">
  <div><div className="type-caption text-primary type-body-strong">وام و تعهد</div>
  <h1 className="mt-1 type-page-title">انتخاب قالب وام</h1>
  <p className="mt-2 type-body text-muted-foreground">یک قالب نزدیک انتخاب کن. مبلغ و شرایط قبل از ثبت قابل تغییر هستند.</p></div>
  <div className="grid gap-3 sm:grid-cols-3">
  {LOAN_TEMPLATES.map((t)=><Card key={t.id} className="overflow-hidden">
   <CardContent className="p-4">
    <div className="type-strong">{t.title}</div>
    <div className="mt-2 space-y-1 type-caption text-muted-foreground">
      {t.principalToman ? <div>{formatMoney(t.principalToman,"toman",true)}</div> : null}
      <div>{t.term} ماه · {t.rate}٪</div>
      <div>{t.description}</div>
    </div>
    <Button className="mt-3 w-full" size="sm" onClick={()=>router.push(`/loans/new?template=${t.id}`)}>انتخاب</Button>
   </CardContent>
  </Card>)}
  </div>
 </div>
}
