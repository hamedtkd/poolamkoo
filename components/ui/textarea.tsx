import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea className={cn("min-h-24 w-full resize-none rounded-lg border border-input bg-background/70 p-3 text-sm outline-none focus:ring-2 focus:ring-ring/40", className)} {...props} />; }
