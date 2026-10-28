import reviewedAlts from "./property-image-alts.json";
import type { Property } from "./types";

const ALPES_SLUG = "departamento-venta-los-alpes-alvaro-obregon-iap7712491";
const ALPES_INTERIOR =
  "https://acrzgrbovizhqcnpmpdn.supabase.co/storage/v1/object/public/property-images/" +
  ALPES_SLUG + "/36.jpg";

/** An existing gallery photograph, reviewed at 900 x 1200; no image alteration. */
export function propertyCover(
  property: Pick<Property, "slug" | "cover_image" | "images">,
): string | null {
  return property.slug === ALPES_SLUG && property.images?.includes(ALPES_INTERIOR)
    ? ALPES_INTERIOR
    : property.cover_image;
}

export function propertyImageAlt(url: string | null, fallback: string): string {
  return url ? (reviewedAlts as Record<string, string>)[url] ?? fallback : fallback;
}

export function propertyImages(
  property: Pick<Property, "slug" | "cover_image" | "images">,
): string[] {
  const cover = propertyCover(property);
  return [...new Set([
    ...(cover ? [cover] : []),
    ...(property.cover_image ? [property.cover_image] : []),
    ...(property.images ?? []),
  ])];
}
