import type { MetadataRoute } from "next";
import { PUBLIC_INDEX_ROUTES, siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return PUBLIC_INDEX_ROUTES.map((route) => {
    const changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = route === "/" ? "weekly" : "monthly";
    return {
      url: `${base}${route === "/" ? "" : route}`,
      changeFrequency,
      priority: route === "/" ? 1 : route === "/guide" ? 0.8 : 0.6,
    };
  });
}
