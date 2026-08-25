"use client";

import { RiGithubFill, RiStarFill } from "react-icons/ri";
import { useGithubStats } from "@/hooks/use-github-stats";
import { COMMUNITY_LINKS } from "@/lib/community";
import { cn } from "@/lib/utils";

export function GithubLink({ compact = false, className }: { compact?: boolean; className?: string }) {
  const stats = useGithubStats();
  return (
    <a
      href={COMMUNITY_LINKS.repository}
      target="_blank"
      rel="noreferrer"
      className={cn("inline-flex items-center justify-center gap-2 rounded-xl border bg-background/72 transition hover:bg-accent", compact ? "size-10" : "h-10 px-3 type-label", className)}
      aria-label="مشاهده پولم‌کو در GitHub"
    >
      <RiGithubFill className="size-5" />
      {!compact && <><span>GitHub</span>{stats.stars !== null && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><RiStarFill className="size-3.5" />{new Intl.NumberFormat("fa-IR").format(stats.stars)}</span>}</>}
    </a>
  );
}
