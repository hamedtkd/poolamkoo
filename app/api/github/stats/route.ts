import { NextResponse } from "next/server";
import { COMMUNITY_LINKS } from "@/lib/community";

const CACHE_CONTROL = "public, s-maxage=21600, stale-while-revalidate=86400";

export async function GET() {
  try {
    const response = await fetch("https://api.github.com/repos/hamedtkd/poolamkoo", {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "poolamkoo-open-source-surface" },
      next: { revalidate: 21_600 },
    });
    if (!response.ok) throw new Error(`GitHub ${response.status}`);
    const data = await response.json() as { stargazers_count?: unknown; forks_count?: unknown; html_url?: unknown };
    return NextResponse.json({
      stars: typeof data.stargazers_count === "number" ? data.stargazers_count : null,
      forks: typeof data.forks_count === "number" ? data.forks_count : null,
      url: typeof data.html_url === "string" ? data.html_url : COMMUNITY_LINKS.repository,
    }, { headers: { "Cache-Control": CACHE_CONTROL } });
  } catch {
    return NextResponse.json({ stars: null, forks: null, url: COMMUNITY_LINKS.repository }, { headers: { "Cache-Control": "public, max-age=300" } });
  }
}
