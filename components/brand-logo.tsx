"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

const markMask: CSSProperties = {
  WebkitMaskImage: 'url("/brand/poolamkoo-mark.svg")',
  maskImage: 'url("/brand/poolamkoo-mark.svg")',
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
  maskPosition: "center",
  WebkitMaskSize: "contain",
  maskSize: "contain",
};

export function BrandLogo({ className, title = "پولم کو" }: { className?: string; title?: string }) {
  return (
    <span
      role="img"
      aria-label={title}
      className={cn("block shrink-0 bg-primary", className)}
      style={markMask}
    />
  );
}
