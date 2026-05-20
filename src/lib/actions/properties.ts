"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/format";
import type {
  Operation,
  PropertyStatus,
  PropertyType,
} from "@/lib/types";

export type PropertyInput = {
  title: string;
  description: string;
  operation: Operation;
  property_type: PropertyType;
  status: PropertyStatus;
  price: number;
  estado: string;
  municipio: string;
  colonia: string;
  direccion: string;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  area_m2: number;
  lot_m2: number;
  amenities: string[];
  cover_image: string | null;
  images: string[];
  featured: boolean;
};

export type ActionResult = {
  ok: boolean;
  error?: string;
  id?: string;
  slug?: string;
};

type DbClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

async function uniqueSlug(
  supabase: DbClient,
  base: string,
  excludeId?: string
): Promise<string> {
  const root = slugify(base) || "propiedad";
  let n = 1;
  // Límite de seguridad para evitar bucles infinitos.
  while (n < 200) {
    const candidate = n === 1 ? root : `${root}-${n}`;
    let query = supabase
      .from("properties")
      .select("id")
      .eq("slug", candidate);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
    n++;
  }
  return `${root}-${Date.now()}`;
}

function validate(input: PropertyInput): string | null {
  if (!input.title.trim()) return "El título es obligatorio.";
  if (!input.estado.trim()) return "Selecciona un estado.";
  if (!input.municipio.trim()) return "La ciudad o alcaldía es obligatoria.";
  if (input.price < 0) return "El precio no puede ser negativo.";
  return null;
}

function toRow(input: PropertyInput) {
  return {
    title: input.title.trim(),
    description: input.description.trim() || null,
    operation: input.operation,
    property_type: input.property_type,
    status: input.status,
    price: input.price || 0,
    estado: input.estado.trim(),
    municipio: input.municipio.trim(),
    colonia: input.colonia.trim() || null,
    direccion: input.direccion.trim() || null,
    bedrooms: input.bedrooms || 0,
    bathrooms: input.bathrooms || 0,
    parking: input.parking || 0,
    area_m2: input.area_m2 || 0,
    lot_m2: input.lot_m2 || null,
    amenities: input.amenities,
    cover_image: input.cover_image,
    images: input.images,
    featured: input.featured,
  };
}

export async function createProperty(
  input: PropertyInput
): Promise<ActionResult> {
  const invalid = validate(input);
  if (invalid) return { ok: false, error: invalid };

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Tu sesión expiró." };

    const slug = await uniqueSlug(supabase, input.title);
    const { data, error } = await supabase
      .from("properties")
      .insert({ ...toRow(input), slug, created_by: user.id })
      .select("id, slug")
      .single();
    if (error) throw error;

    revalidatePath("/admin/propiedades");
    revalidatePath("/propiedades");
    return { ok: true, id: data.id, slug: data.slug };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo guardar.",
    };
  }
}

export async function updateProperty(
  id: string,
  input: PropertyInput
): Promise<ActionResult> {
  const invalid = validate(input);
  if (invalid) return { ok: false, error: invalid };

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Tu sesión expiró." };

    const { error } = await supabase
      .from("properties")
      .update(toRow(input))
      .eq("id", id);
    if (error) throw error;

    revalidatePath("/admin/propiedades");
    revalidatePath("/propiedades");
    revalidatePath(`/admin/propiedades/${id}`);
    return { ok: true, id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo actualizar.",
    };
  }
}

export async function deleteProperty(id: string): Promise<ActionResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("properties")
      .delete()
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/propiedades");
    revalidatePath("/propiedades");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo eliminar.",
    };
  }
}
