import "server-only";
import {
  createSupabasePublicClient,
  isSupabaseConfigured,
} from "./supabase/public";
import type { Property, PropertyFilters } from "./types";

/** Propiedades destacadas para la portada. */
export async function getFeaturedProperties(limit = 6): Promise<Property[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = createSupabasePublicClient();
    const { data } = await supabase
      .from("properties")
      .select("*")
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    return (data as Property[]) ?? [];
  } catch {
    return [];
  }
}

/** Listado público de propiedades con filtros. */
export async function getProperties(
  filters: PropertyFilters = {}
): Promise<Property[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = createSupabasePublicClient();
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

    const { data } = await query.limit(60);
    return (data as Property[]) ?? [];
  } catch {
    return [];
  }
}

export async function getPropertyBySlug(
  slug: string
): Promise<Property | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = createSupabasePublicClient();
    const { data } = await supabase
      .from("properties")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    return (data as Property) ?? null;
  } catch {
    return null;
  }
}

/** Propiedades similares: misma operación y estado, distinta a la actual. */
export async function getRelatedProperties(
  property: Property,
  limit = 3
): Promise<Property[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = createSupabasePublicClient();
    const { data } = await supabase
      .from("properties")
      .select("*")
      .eq("operation", property.operation)
      .eq("estado", property.estado)
      .neq("id", property.id)
      .limit(limit);
    return (data as Property[]) ?? [];
  } catch {
    return [];
  }
}

/** Opciones para los selectores de filtro (estados y municipios reales). */
export async function getFilterOptions(): Promise<{
  estados: string[];
  municipiosByEstado: Record<string, string[]>;
}> {
  const empty = { estados: [], municipiosByEstado: {} };
  if (!isSupabaseConfigured()) return empty;
  try {
    const supabase = createSupabasePublicClient();
    const { data } = await supabase
      .from("properties")
      .select("estado, municipio");
    if (!data) return empty;

    const map: Record<string, Set<string>> = {};
    for (const row of data as { estado: string; municipio: string }[]) {
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
  } catch {
    return empty;
  }
}

export async function getPropertySlugs(): Promise<
  { slug: string; updated_at: string }[]
> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = createSupabasePublicClient();
    const { data } = await supabase
      .from("properties")
      .select("slug, updated_at");
    return data ?? [];
  } catch {
    return [];
  }
}
