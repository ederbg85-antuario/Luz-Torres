import type { MetadataRoute } from "next";
import { getPropertySlugs, getSeoIndex } from "@/lib/data";
import { allCategoryPaths } from "@/lib/seo";
import { SITE_URL } from "@/lib/supabase/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/propiedades",
    "/sobre-luz",
    "/contacto",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const [slugs, seoIndex] = await Promise.all([
    getPropertySlugs(),
    getSeoIndex(),
  ]);

  const categoryRoutes: MetadataRoute.Sitemap = allCategoryPaths(seoIndex).map(
    (path) => ({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    })
  );

  const propertyRoutes: MetadataRoute.Sitemap = slugs.map((s) => ({
    url: `${base}/propiedades/${s.slug}`,
    lastModified: new Date(s.updated_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...propertyRoutes];
}
