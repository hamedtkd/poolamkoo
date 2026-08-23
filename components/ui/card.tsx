import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("rounded-2xl border bg-card text-card-foreground shadow-[0_8px_35px_rgba(0,0,0,.035)]", className)} {...props} />; }
export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("p-4 pb-2 sm:p-5 sm:pb-2", className)} {...props} />; }
export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) { return <h3 className={cn("font-bold tracking-tight", className)} {...props} />; }
export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) { return <p className={cn("text-sm text-muted-foreground", className)} {...props} />; }
export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("p-4 pt-2 sm:p-5 sm:pt-2", className)} {...props} />; }
