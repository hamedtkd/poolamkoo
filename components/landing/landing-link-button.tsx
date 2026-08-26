import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Props = ComponentProps<typeof Link> & { size?: "default" | "lg" };

export function ButtonLink({ className, size = "default", ...props }: Props) {
  return (
    <Link
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground shadow-sm transition-[transform,filter,box-shadow] hover:brightness-[.97] active:scale-[.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:active:scale-100",
        size === "lg" ? "h-12 px-5 text-base font-[590]" : "h-10 px-4 text-sm font-[590]",
        className,
      )}
      {...props}
    />
  );
}
