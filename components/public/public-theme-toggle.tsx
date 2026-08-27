"use client";

import { useRef } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import { RiMoonLine, RiSunLine } from "react-icons/ri";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";

type TransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> };
};

export function PublicThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const hydrated = useHydrated();
  const transitioning = useRef(false);
  const dark = hydrated && resolvedTheme === "dark";
  const label = dark ? "فعال‌کردن تم روشن" : "فعال‌کردن تم تاریک";

  function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    if (transitioning.current) return;
    const next = dark ? "light" : "dark";
    const root = document.documentElement;
    const transitionDoc = document as TransitionDocument;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.ceil(Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)));
    const apply = () => {
      root.classList.remove("light", "dark");
      root.classList.add(next);
      root.style.colorScheme = next;
      flushSync(() => setTheme(next));
    };

    if (!transitionDoc.startViewTransition || reduceMotion) {
      apply();
      return;
    }

    root.style.setProperty("--theme-transition-x", `${x}px`);
    root.style.setProperty("--theme-transition-y", `${y}px`);
    root.style.setProperty("--theme-transition-radius", `${radius}px`);
    root.dataset.themeMotion = "public";
    root.classList.add("theme-transitioning");
    transitioning.current = true;
    const transition = transitionDoc.startViewTransition(apply);
    void transition.finished.finally(() => {
      root.classList.remove("theme-transitioning");
      delete root.dataset.themeMotion;
      transitioning.current = false;
    });
  }

  return (
    <button
      type="button"
      data-public-theme-toggle="true"
      data-hydrated={hydrated ? "true" : "false"}
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn("grid size-10 place-items-center rounded-xl border bg-background/75 text-foreground shadow-sm transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
    >
      {dark ? <RiSunLine className="size-5" /> : <RiMoonLine className="size-5" />}
    </button>
  );
}
