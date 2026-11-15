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
import { buyerFocus } from "./buyer-focus";

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
  let descriptor = resolveCategory(index, parts);
  if (!descriptor) return null;

  const properties = await getProperties(categoryFilters(descriptor));
  if (properties.length === 0) return null;
  const related = relatedCategories(index, descriptor);
  const minPrice = Math.min(...properties.map((p) => p.price));

  const focus = buyerFocus(descriptor, properties);
  if (focus) descriptor = { ...descriptor, heading: focus.heading, intro: focus.intro, searchTitle: focus.title, searchDescription: focus.description };

  return { descriptor, properties, related, minPrice };
}
