"use client";

import { RiQuestionLine } from "react-icons/ri";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function HelpLabel({
  label,
  help,
  className,
}: {
  label: React.ReactNode;
  help: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span>{label}</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`راهنمای ${typeof label === "string" ? label : "این بخش"}`}
            className="grid size-5 place-items-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RiQuestionLine className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-72 leading-6">{help}</TooltipContent>
      </Tooltip>
    </span>
  );
}
