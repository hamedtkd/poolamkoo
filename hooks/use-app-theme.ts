"use client";

import { useEffect } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import { db } from "@/lib/db";
import type { AppSettings, ThemePalette } from "@/lib/types";

export type ThemeOrigin = { x: number; y: number };
type TransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> };
};

export function useAppTheme(settings: AppSettings) {
  const { resolvedTheme, theme, setTheme } = useTheme();

  useEffect(() => {
    document.documentElement.dataset.palette = settings.palette;
  }, [settings.palette]);

  useEffect(() => {
    setTheme(settings.darkMode);
  }, [settings.darkMode, setTheme]);

  useEffect(() => {
    if (resolvedTheme === "dark" || resolvedTheme === "light") {
      document.documentElement.style.colorScheme = resolvedTheme;
    }
  }, [resolvedTheme]);

  async function persistAppearance(next: AppSettings["darkMode"]) {
    await db.settings.update("settings", { darkMode: next, updatedAt: new Date().toISOString() });
  }

  async function setAppearance(next: AppSettings["darkMode"]) {
    setTheme(next);
    await persistAppearance(next);
  }

  async function setPalette(next: ThemePalette) {
    document.documentElement.dataset.palette = next;
    await db.settings.update("settings", { palette: next, updatedAt: new Date().toISOString() });
  }

  async function toggleTheme(origin?: ThemeOrigin) {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    const transitionDoc = document as TransitionDocument;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canAnimate = !!origin && !!transitionDoc.startViewTransition && !reduceMotion;
    const apply = () => {
      root.classList.remove("light", "dark");
      root.classList.add(next);
      root.style.colorScheme = next;
      setTheme(next);
    };

    if (!canAnimate || !origin) {
      apply();
      await persistAppearance(next);
      return;
    }

    const radius = Math.hypot(
      Math.max(origin.x, window.innerWidth - origin.x),
      Math.max(origin.y, window.innerHeight - origin.y),
    );
    root.style.setProperty("--theme-transition-x", `${origin.x}px`);
    root.style.setProperty("--theme-transition-y", `${origin.y}px`);
    root.style.setProperty("--theme-transition-radius", `${radius}px`);
    root.classList.add("theme-transitioning");

    const transition = transitionDoc.startViewTransition!(() => flushSync(apply));
    void transition.finished.finally(() => root.classList.remove("theme-transitioning")).catch(() => root.classList.remove("theme-transitioning"));
    await persistAppearance(next);
  }

  return { resolvedTheme, theme, setAppearance, setPalette, toggleTheme };
}
