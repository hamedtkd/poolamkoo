"use client";

import { usePathname } from "next/navigation";
import { RiGithubFill, RiHeart3Line, RiStarFill } from "react-icons/ri";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { useCommunitySupport } from "@/hooks/use-community-support";
import { COMMUNITY_LINKS } from "@/lib/community";

type SupportState = ReturnType<typeof useCommunitySupport>;

export function SupportPrompt({ support }: { support: SupportState }) {
  const pathname = usePathname();
  const open = pathname === "/dashboard" && support.due;

  function choose(action: "github" | "support") {
    window.open(action === "github" ? COMMUNITY_LINKS.repository : COMMUNITY_LINKS.support, "_blank", "noopener,noreferrer");
    void support.act(action);
  }

  return <Dialog open={open} onOpenChange={(next) => { if (!next && open) void support.act("later"); }}>
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <div className="mb-3 flex items-center gap-3"><div className="grid size-12 place-items-center rounded-2xl bg-primary/10"><BrandLogo className="size-9" /></div><div className="text-xs type-strong text-primary">یک درخواست کوچک، بعد از استفاده واقعی</div></div>
        <DialogTitle>اگر پولم‌کو به کارت آمده، کمکش کن بهتر بماند</DialogTitle>
        <DialogDescription className="leading-7">پولم‌کو رایگان و متن‌باز می‌ماند. اگر دوست داشتی، یک Star در GitHub بهترین کمک برای دیده‌شدن پروژه است؛ حمایت مالی هم کاملاً اختیاری است و هیچ قابلیتی را باز نمی‌کند.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-2 sm:grid-cols-2">
        <Button className="h-12" onClick={() => choose("github")}><RiGithubFill className="size-5" /><RiStarFill className="size-4" /> ستاره در GitHub</Button>
        <Button className="h-12" variant="outline" onClick={() => choose("support")}><RiHeart3Line className="size-5" /> حمایت اختیاری</Button>
      </div>
      <button type="button" onClick={() => void support.act("later")} className="mt-3 w-full rounded-xl px-3 py-2 text-xs text-muted-foreground transition hover:bg-muted">فعلاً نه؛ خیلی دیرتر یادآوری کن</button>
      <p className="mt-2 text-center text-[11px] leading-5 text-muted-foreground">این پیام فقط پس از حداقل ۷ روز استفاده واقعی ظاهر می‌شود و بعد از رد کردن تا مدت طولانی مزاحمت ایجاد نمی‌کند.</p>
    </DialogContent>
  </Dialog>;
}
