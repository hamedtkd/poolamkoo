"use client";

import { useEffect, useState } from "react";

export interface GithubStats {
  stars: number | null;
  forks: number | null;
  url: string;
}

export function useGithubStats() {
  const [stats, setStats] = useState<GithubStats>({ stars: null, forks: null, url: "https://github.com/hamedtkd/poolamkoo" });

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/github/stats", { signal: controller.signal })
      .then((response) => response.ok ? response.json() as Promise<GithubStats> : Promise.reject(new Error("github stats unavailable")))
      .then((value) => setStats(value))
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  return stats;
}
