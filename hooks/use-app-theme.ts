"use client";

import { useEffect, useRef } from "react";
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
  const transitioning = useRef(false);

  useEffect(() => {
    document.documentElement.dataset.palette = settings.palette;
  }, [settings.palette]);

  useEffect(() => {
    if (!transitioning.current) setTheme(settings.darkMode);
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
    if (transitioning.current) return;
    const next = resolvedTheme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    const transitionDoc = document as TransitionDocument;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const canAnimate = !!origin && !!transitionDoc.startViewTransition && !reduceMotion;
    const apply = () => {
      root.classList.remove("light", "dark");
      root.classList.add(next);
      root.style.colorScheme = next;
      flushSync(() => setTheme(next));
    };

    if (!canAnimate || !origin) {
      apply();
      void persistAppearance(next);
      return;
    }

    const radius = Math.ceil(Math.hypot(
      Math.max(origin.x, window.innerWidth - origin.x),
      Math.max(origin.y, window.innerHeight - origin.y),
    ));
    root.style.setProperty("--theme-transition-x", `${origin.x}px`);
    root.style.setProperty("--theme-transition-y", `${origin.y}px`);
    root.style.setProperty("--theme-transition-radius", `${radius}px`);
    root.dataset.themeMotion = mobile ? "mobile" : "desktop";
    root.classList.add("theme-transitioning");
    transitioning.current = true;

    const transition = transitionDoc.startViewTransition!(apply);
    void transition.finished.finally(() => {
      root.classList.remove("theme-transitioning");
      delete root.dataset.themeMotion;
      transitioning.current = false;
    }).catch(() => {
      root.classList.remove("theme-transitioning");
      delete root.dataset.themeMotion;
      transitioning.current = false;
    });
    void persistAppearance(next);
  }

  return { resolvedTheme, theme, setAppearance, setPalette, toggleTheme };
}
