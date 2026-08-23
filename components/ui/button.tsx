import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "secondary" | "outline" | "ghost" | "destructive";
type Size = "default" | "sm" | "lg" | "icon";

export function Button({ className, variant = "default", size = "default", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  const variants: Record<Variant, string> = {
    default: "bg-primary text-primary-foreground shadow-sm hover:brightness-[.97]",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-border bg-background/70 hover:bg-accent",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    destructive: "bg-destructive text-white hover:brightness-95",
  };
  const sizes: Record<Size, string> = { default: "h-10 px-4", sm: "h-8 px-3 text-xs", lg: "h-12 px-5 text-base", icon: "size-10" };
  return <button className={cn("inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", variants[variant], sizes[size], className)} {...props} />;
}
