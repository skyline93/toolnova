import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import { tools } from "@/lib/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const staticPaths = ["", "/tools", "/privacy", "/terms"];

  const entries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  for (const t of tools) {
    entries.push({
      url: `${base}${t.href}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  return entries;
}
