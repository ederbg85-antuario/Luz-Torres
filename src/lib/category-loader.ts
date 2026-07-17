import "server-only";
import { getProperties, getSeoIndex } from "./data";
import {
  categoryFilters,
  relatedCategories,
  resolveCategory,
  type CategoryDescriptor,
  type CategoryLink,
} from "./seo";
import type { Property } from "./types";

export type LoadedCategory = {
  descriptor: CategoryDescriptor;
  properties: Property[];
  related: CategoryLink[];
  minPrice: number | null;
};

/**
 * Resuelve una categoría desde sus segmentos de URL y carga su inventario.
 * Devuelve null cuando la combinación no existe (→ 404).
 */
export async function loadCategory(parts: {
  operation: string;
  typeSlug?: string;
  ubicacionSlug?: string;
}): Promise<LoadedCategory | null> {
  const index = await getSeoIndex();
  const descriptor = resolveCategory(index, parts);
  if (!descriptor) return null;

  const properties = await getProperties(categoryFilters(descriptor));
  const related = relatedCategories(index, descriptor);
  const minPrice = properties.length
    ? Math.min(...properties.map((p) => p.price))
    : null;

  return { descriptor, properties, related, minPrice };
}
