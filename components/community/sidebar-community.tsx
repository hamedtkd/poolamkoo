"use client";

import Link from "next/link";
import { RiBookOpenLine, RiGithubFill, RiInformationLine, RiStarFill } from "react-icons/ri";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useGithubStats } from "@/hooks/use-github-stats";
import { COMMUNITY_LINKS } from "@/lib/community";
import { cn } from "@/lib/utils";

export function SidebarCommunity({ collapsed }: { collapsed: boolean }) {
  const stats = useGithubStats();
  if (collapsed) return <div className="grid gap-1 border-t px-2 py-3">
    <CompactLink href="/guide" label="راهنما"><RiBookOpenLine className="size-5" /></CompactLink>
    <CompactLink href={COMMUNITY_LINKS.repository} label="GitHub" external><RiGithubFill className="size-5" /></CompactLink>
  </div>;

  return <div className="border-t p-3">
    <a href={COMMUNITY_LINKS.repository} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border bg-muted/35 px-3 py-2.5 transition hover:bg-accent">
      <span className="flex items-center gap-2 type-label"><RiGithubFill className="size-5" /> متن‌باز در GitHub</span>
      {stats.stars !== null && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><RiStarFill className="size-3.5" />{new Intl.NumberFormat("fa-IR").format(stats.stars)}</span>}
    </a>
    <div className="mt-1 grid grid-cols-2 gap-1">
      <Link href="/guide" className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground"><RiBookOpenLine /> راهنما</Link>
      <Link href="/about" className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground"><RiInformationLine /> درباره</Link>
    </div>
  </div>;
}

function CompactLink({ href, label, external, children }: { href: string; label: string; external?: boolean; children: React.ReactNode }) {
  const className = cn("grid size-11 place-items-center rounded-xl text-muted-foreground transition hover:bg-accent hover:text-foreground");
  const link = external
    ? <a href={href} target="_blank" rel="noreferrer" aria-label={label} className={className}>{children}</a>
    : <Link href={href} aria-label={label} className={className}>{children}</Link>;
  return <Tooltip><TooltipTrigger asChild>{link}</TooltipTrigger><TooltipContent side="left">{label}</TooltipContent></Tooltip>;
}
