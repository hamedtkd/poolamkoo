"use client";

import Link from "next/link";
import { RiBookOpenLine, RiGithubFill, RiHeart3Line, RiInformationLine, RiLineChartLine, RiShieldCheckLine } from "react-icons/ri";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GithubLink } from "@/components/community/github-link";
import { COMMUNITY_LINKS } from "@/lib/community";

export function OpenSourceCard() {
  return <Card>
    <CardHeader><CardTitle className="flex items-center gap-2"><RiGithubFill className="text-primary" /> متن‌باز، راهنما و اعتماد</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      <p className="text-sm leading-7 text-muted-foreground">کد پولم‌کو عمومی است. می‌توانی راهنما و سیاست داده را بخوانی، مشکل گزارش کنی یا در صورت تمایل از توسعه پروژه حمایت کنی.</p>
      <GithubLink className="w-full" />
      <div className="grid grid-cols-2 gap-2">
        <MiniLink href="/guide" icon={<RiBookOpenLine />} label="راهنما" />
        <MiniLink href="/about" icon={<RiInformationLine />} label="درباره" />
        <MiniLink href="/privacy" icon={<RiShieldCheckLine />} label="سیاست داده" />
        <MiniLink href="/analytics" icon={<RiLineChartLine />} label="Analytics" />
        <MiniLink href="/security" icon={<RiShieldCheckLine />} label="امنیت" />
        <MiniLink href="/license" icon={<RiInformationLine />} label="مجوز MIT" />
        <MiniLink href={COMMUNITY_LINKS.support} icon={<RiHeart3Line />} label="حمایت اختیاری" external />
      </div>
    </CardContent>
  </Card>;
}

function MiniLink({ href, label, icon, external }: { href: string; label: string; icon: React.ReactNode; external?: boolean }) {
  const className = "flex min-h-11 items-center justify-center gap-2 rounded-xl border bg-background/70 px-3 text-xs type-strong transition hover:bg-accent";
  if (external) return <a href={href} target="_blank" rel="noreferrer" className={className}>{icon}{label}</a>;
  return <Link href={href} className={className}>{icon}{label}</Link>;
}
