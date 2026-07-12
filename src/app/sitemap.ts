import type { MetadataRoute } from "next";
import { getPropertySlugs } from "@/lib/data";
import { SITE_URL } from "@/lib/supabase/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL;

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/propiedades",
    "/sobre-luz",
    "/contacto",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const slugs = await getPropertySlugs();
  const propertyRoutes: MetadataRoute.Sitemap = slugs.map((s) => ({
    url: `${base}/propiedades/${s.slug}`,
    lastModified: new Date(s.updated_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...propertyRoutes];
}
