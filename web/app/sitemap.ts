import type { MetadataRoute } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { toolRoutes } from "@/lib/tool-routes";
import { getSiteUrl } from "@/lib/site";

const staticHrefs = ["/", "/tools", "/privacy", "/terms"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const href of staticHrefs) {
      const path = await getPathname({ locale, href });
      entries.push({
        url: `${base}${path}`,
        lastModified: new Date(),
        changeFrequency: href === "/" ? "weekly" : "monthly",
        priority: href === "/" ? 1 : 0.7,
      });
    }

    for (const r of toolRoutes) {
      const path = await getPathname({ locale, href: r.path });
      entries.push({
        url: `${base}${path}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  return entries;
}
