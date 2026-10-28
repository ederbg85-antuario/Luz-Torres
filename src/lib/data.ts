import "server-only";
import {
  createSupabasePublicClient,
  isSupabaseConfigured,
} from "./supabase/public";
import type { Property, PropertyFilters } from "./types";

export class PublicInventoryUnavailableError extends Error {
  constructor() {
    super("El inventario no está disponible temporalmente. Inténtalo de nuevo.");
    this.name = "PublicInventoryUnavailableError";
  }
}

function publicClient() {
  if (!isSupabaseConfigured()) throw new PublicInventoryUnavailableError();
  try {
    return createSupabasePublicClient();
  } catch {
    throw new PublicInventoryUnavailableError();
  }
}

/** Un fallo del proveedor no debe publicarse como inventario vacío o un 404. */
async function readPublicResult<T>(
  query: PromiseLike<{ data: T | null; error: unknown }>
): Promise<T | null> {
  try {
    const { data, error } = await query;
    if (error || data === undefined) throw new PublicInventoryUnavailableError();
    return data;
  } catch {
    throw new PublicInventoryUnavailableError();
  }
}

async function readPublicRows<T>(
  query: PromiseLike<{ data: T[] | null; error: unknown }>
): Promise<T[]> {
  const data = await readPublicResult(query);
  if (!Array.isArray(data)) throw new PublicInventoryUnavailableError();
  return data;
}

/** Propiedades destacadas para la portada. */
export async function getFeaturedProperties(limit = 6): Promise<Property[]> {
  const supabase = publicClient();
  return readPublicRows<Property>(
    supabase
      .from("properties")
      .select("*")
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(limit)
  );
}

/** Listado público de propiedades con filtros. */
export async function getProperties(
  filters: PropertyFilters = {}
): Promise<Property[]> {
  const supabase = publicClient();
  let query = supabase.from("properties").select("*");

  if (filters.operation) query = query.eq("operation", filters.operation);
  if (filters.property_type)
    query = query.eq("property_type", filters.property_type);
  if (filters.estado) query = query.eq("estado", filters.estado);
  if (filters.municipio) query = query.eq("municipio", filters.municipio);
  if (filters.priceMin) query = query.gte("price", filters.priceMin);
  if (filters.priceMax) query = query.lte("price", filters.priceMax);
  if (filters.bedrooms) query = query.gte("bedrooms", filters.bedrooms);
  if (filters.bathrooms) query = query.gte("bathrooms", filters.bathrooms);

  if (filters.q) {
    const safe = filters.q.replace(/[,()%*]/g, " ").trim();
    if (safe) {
      query = query.or(
        `title.ilike.%${safe}%,municipio.ilike.%${safe}%,colonia.ilike.%${safe}%,estado.ilike.%${safe}%`
      );
    }
  }

  switch (filters.sort) {
    case "precio_asc":
      query = query.order("price", { ascending: true });
      break;
    case "precio_desc":
      query = query.order("price", { ascending: false });
      break;
    default:
      query = query
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });
  }

  return readPublicRows<Property>(query.limit(60));
}

export async function getPropertyBySlug(
  slug: string
): Promise<Property | null> {
  const supabase = publicClient();
  return readPublicResult<Property>(
    supabase
      .from("properties")
      .select("*")
      .eq("slug", slug)
      .maybeSingle()
  );
}

/** Propiedades similares: misma operación y estado, distinta a la actual. */
export async function getRelatedProperties(
  property: Property,
  limit = 3
): Promise<Property[]> {
  const supabase = publicClient();
  return readPublicRows<Property>(
    supabase
      .from("properties")
      .select("*")
      .eq("operation", property.operation)
      .eq("estado", property.estado)
      .neq("id", property.id)
      .limit(limit)
  );
}

/** Opciones para los selectores de filtro (estados y municipios reales). */
export async function getFilterOptions(): Promise<{
  estados: string[];
  municipiosByEstado: Record<string, string[]>;
}> {
  const supabase = publicClient();
  const data = await readPublicRows<{ estado: string; municipio: string }>(
    supabase
      .from("properties")
      .select("estado, municipio")
  );

  const map: Record<string, Set<string>> = {};
  for (const row of data) {
    if (!row.estado) continue;
    map[row.estado] ??= new Set();
    if (row.municipio) map[row.estado].add(row.municipio);
  }
  const estados = Object.keys(map).sort((a, b) => a.localeCompare(b));
  const municipiosByEstado: Record<string, string[]> = {};
  for (const estado of estados) {
    municipiosByEstado[estado] = [...map[estado]].sort((a, b) =>
      a.localeCompare(b)
    );
  }
  return { estados, municipiosByEstado };
}

/**
 * Índice mínimo (operación, tipo, estado, municipio) de todo el inventario.
 * Alimenta la generación estática y la resolución de las páginas de categoría.
 */
export async function getSeoIndex(): Promise<
  Pick<Property, "operation" | "property_type" | "estado" | "municipio">[]
> {
  const supabase = publicClient();
  return readPublicRows<
    Pick<Property, "operation" | "property_type" | "estado" | "municipio">
  >(
    supabase
      .from("properties")
      .select("operation, property_type, estado, municipio")
  );
}

export async function getPropertySlugs(): Promise<
  { slug: string; updated_at: string }[]
> {
  const supabase = publicClient();
  return readPublicRows<{ slug: string; updated_at: string }>(
    supabase
      .from("properties")
      .select("slug, updated_at")
  );
}
