"use client";

import { useEffect, useState } from "react";

export interface GithubStats {
  stars: number | null;
  forks: number | null;
  url: string;
}

const FALLBACK_STATS: GithubStats = { stars: null, forks: null, url: "https://github.com/hamedtkd/poolamkoo" };

export function useGithubStats() {
  const [stats, setStats] = useState<GithubStats>(FALLBACK_STATS);

  useEffect(() => {
    let active = true;
    const request = new XMLHttpRequest();

    request.open("GET", "/api/github/stats", true);
    request.responseType = "json";
    request.timeout = 6_000;
    request.addEventListener("load", () => {
      if (!active || request.status < 200 || request.status >= 300) return;
      const value = request.response as Partial<GithubStats> | null;
      if (!value) return;
      setStats({
        stars: typeof value.stars === "number" ? value.stars : null,
        forks: typeof value.forks === "number" ? value.forks : null,
        url: typeof value.url === "string" ? value.url : FALLBACK_STATS.url,
      });
    });
    request.addEventListener("error", () => undefined);
    request.addEventListener("timeout", () => undefined);

    try {
      request.send();
    } catch {
      // GitHub stars are decorative; the static repository link remains usable.
    }

    return () => {
      active = false;
      // Deliberately do not abort: browser/React teardown must not surface AbortError.
    };
  }, []);

  return stats;
}
