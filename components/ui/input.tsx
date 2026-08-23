import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("h-10 w-full rounded-lg border border-input bg-background/70 px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40", className)} {...props} />;
}
