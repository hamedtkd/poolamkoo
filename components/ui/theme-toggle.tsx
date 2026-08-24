"use client";

import { useEffect, useState } from "react";
import { RiMoonLine, RiSunLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import type { ThemeOrigin } from "@/hooks/use-app-theme";
import { cn } from "@/lib/utils";

export function ThemeToggle({
  resolvedTheme,
  onToggle,
  className,
  showLabel = false,
  dataTour,
}: {
  resolvedTheme?: string;
  onToggle: (origin?: ThemeOrigin) => void | Promise<void>;
  className?: string;
  showLabel?: boolean;
  dataTour?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = mounted && resolvedTheme === "dark";
  const label = dark ? "حالت روشن" : "حالت تاریک";

  return (
    <Button
      type="button"
      data-tour={dataTour}
      variant="ghost"
      size={showLabel ? "default" : "icon"}
      className={cn(showLabel ? "h-10 justify-start gap-2 px-3" : "size-9", className)}
      aria-label={label}
      title={label}
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        void onToggle({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      }}
    >
      {dark ? <RiSunLine className="size-5" /> : <RiMoonLine className="size-5" />}
      {showLabel && <span>{label}</span>}
    </Button>
  );
}
