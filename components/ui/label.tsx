import type { LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) { return <label className={cn("type-label", className)} {...props} />; }
