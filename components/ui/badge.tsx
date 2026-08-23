import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) { return <span className={cn("inline-flex items-center rounded-full border bg-secondary/70 px-2 py-0.5 text-[11px] font-semibold", className)} {...props} />; }
