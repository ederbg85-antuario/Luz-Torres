"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppointmentStatus, AppointmentType } from "@/lib/types";

export type AppointmentInput = {
  title: string;
  type: AppointmentType;
  contact_id: string | null;
  property_id: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string;
  notes: string;
  status: AppointmentStatus;
};

export type AppointmentResult = { ok: boolean; error?: string; id?: string };

function toRow(input: AppointmentInput) {
  return {
    title: input.title.trim(),
    type: input.type,
    contact_id: input.contact_id || null,
    property_id: input.property_id || null,
    starts_at: new Date(input.starts_at).toISOString(),
    ends_at: input.ends_at ? new Date(input.ends_at).toISOString() : null,
    location: input.location.trim() || null,
    notes: input.notes.trim() || null,
    status: input.status,
  };
}

export async function createAppointment(
  input: AppointmentInput
): Promise<AppointmentResult> {
  if (!input.title.trim()) return { ok: false, error: "Falta el título." };
  if (!input.starts_at) return { ok: false, error: "Falta la fecha." };
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("appointments")
      .insert(toRow(input))
      .select("id")
      .single();
    if (error) throw error;
    revalidatePath("/admin/agenda");
    revalidatePath("/admin");
    return { ok: true, id: data.id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo guardar.",
    };
  }
}

export async function updateAppointment(
  id: string,
  input: AppointmentInput
): Promise<AppointmentResult> {
  if (!input.title.trim()) return { ok: false, error: "Falta el título." };
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("appointments")
      .update(toRow(input))
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/agenda");
    revalidatePath("/admin");
    return { ok: true, id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo actualizar.",
    };
  }
}

export async function deleteAppointment(
  id: string
): Promise<AppointmentResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("appointments")
      .delete()
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/agenda");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo eliminar.",
    };
  }
}
