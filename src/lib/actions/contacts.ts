"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ContactInterest,
  ContactSource,
  ContactStage,
} from "@/lib/types";

export type ContactInput = {
  full_name: string;
  email: string;
  phone: string;
  source: ContactSource;
  stage: ContactStage;
  interest: ContactInterest;
  budget_min: number | null;
  budget_max: number | null;
  notes: string;
  property_id: string | null;
};

export type ContactResult = { ok: boolean; error?: string; id?: string };

function toRow(input: ContactInput) {
  return {
    full_name: input.full_name.trim(),
    email: input.email.trim() || null,
    phone: input.phone.trim() || null,
    source: input.source,
    stage: input.stage,
    interest: input.interest,
    budget_min: input.budget_min,
    budget_max: input.budget_max,
    notes: input.notes.trim() || null,
    property_id: input.property_id || null,
  };
}

export async function createContact(
  input: ContactInput
): Promise<ContactResult> {
  if (!input.full_name.trim()) {
    return { ok: false, error: "El nombre es obligatorio." };
  }
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("contacts")
      .insert(toRow(input))
      .select("id")
      .single();
    if (error) throw error;
    revalidatePath("/admin/crm");
    revalidatePath("/admin");
    return { ok: true, id: data.id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo guardar.",
    };
  }
}

export async function updateContact(
  id: string,
  input: ContactInput
): Promise<ContactResult> {
  if (!input.full_name.trim()) {
    return { ok: false, error: "El nombre es obligatorio." };
  }
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("contacts")
      .update({ ...toRow(input), last_contacted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/crm");
    revalidatePath(`/admin/crm/${id}`);
    return { ok: true, id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo actualizar.",
    };
  }
}

export async function updateContactStage(
  id: string,
  stage: ContactStage
): Promise<ContactResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("contacts")
      .update({ stage, last_contacted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/crm");
    revalidatePath(`/admin/crm/${id}`);
    revalidatePath("/admin");
    return { ok: true, id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo actualizar.",
    };
  }
}

export async function deleteContact(id: string): Promise<ContactResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/crm");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo eliminar.",
    };
  }
}
