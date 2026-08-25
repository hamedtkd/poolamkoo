"use client";

import { RiFileCopyLine, RiShareForwardLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";

export function TransferCodeField({ label, value, onChange, placeholder }: { label: string; value: string; onChange?: (value: string) => void; placeholder?: string }) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      toast({ tone: "success", title: "کد کپی شد", description: "آن را فقط به دستگاه مقصد انتقال بده." });
    } catch {
      toast({ tone: "error", title: "کپی خودکار ممکن نشد", description: "کد را دستی انتخاب و کپی کن." });
    }
  }

  async function share() {
    if (!navigator.share) { await copy(); return; }
    try { await navigator.share({ title: "کد انتقال پولم‌کو", text: value }); }
    catch (error) { if ((error as DOMException)?.name !== "AbortError") await copy(); }
  }

  return <div className="space-y-2">
    <div className="flex items-center justify-between gap-2"><label className="type-label">{label}</label>{value && <div className="flex gap-1"><Button type="button" size="sm" variant="ghost" onClick={() => void copy()}><RiFileCopyLine /> کپی</Button><Button type="button" size="sm" variant="ghost" onClick={() => void share()}><RiShareForwardLine /> اشتراک</Button></div>}</div>
    <Textarea value={value} onChange={onChange ? (event) => onChange(event.target.value) : undefined} readOnly={!onChange} dir="ltr" spellCheck={false} className="min-h-24 max-h-40 resize-y font-mono text-[10px] leading-5" placeholder={placeholder} />
  </div>;
}
