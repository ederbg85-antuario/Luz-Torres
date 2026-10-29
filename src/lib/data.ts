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

/** Bajas públicas solicitadas; conservar filas, estado e historial en el panel.
 * Para republicar una ficha, retirar únicamente su ID de esta lista.
 */
const UNPUBLISHED_PROPERTY_IDS = [
  "77ba4e00-c1d1-488b-b516-c14cbb72a060", // Bonito El Manzano
  "2d68a9bf-2a1c-41bd-bfc2-7cc2e57c5adf", // Los Alpes
  "18c4553e-a579-4361-91a7-8cd7edf4695f", // San Marcos, Azcapotzalco
] as const;

/** Toda lectura pública excluye las bajas antes de ordenar o limitar. */
function publicProperties<Columns extends string>(columns: Columns) {
  let query = publicClient().from("properties").select(columns);
  for (const id of UNPUBLISHED_PROPERTY_IDS) query = query.neq("id", id);
  return query;
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
  return readPublicRows<Property>(
    publicProperties("*")
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(limit)
  );
}

/** Listado público de propiedades con filtros. */
export async function getProperties(
  filters: PropertyFilters = {}
): Promise<Property[]> {
  let query = publicProperties("*");

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
  return readPublicResult<Property>(
    publicProperties("*")
      .eq("slug", slug)
      .maybeSingle()
  );
}

/** Propiedades similares: misma operación y estado, distinta a la actual. */
export async function getRelatedProperties(
  property: Property,
  limit = 3
): Promise<Property[]> {
  return readPublicRows<Property>(
    publicProperties("*")
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
  const data = await readPublicRows<{ estado: string; municipio: string }>(
    publicProperties("estado, municipio")
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
  return readPublicRows<
    Pick<Property, "operation" | "property_type" | "estado" | "municipio">
  >(
    publicProperties("operation, property_type, estado, municipio")
  );
}

export async function getPropertySlugs(): Promise<
  { slug: string; updated_at: string }[]
> {
  return readPublicRows<{ slug: string; updated_at: string }>(
    publicProperties("slug, updated_at")
  );
}
