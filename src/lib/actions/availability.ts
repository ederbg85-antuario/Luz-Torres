"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AvailabilityResult = { ok: boolean; error?: string };

export type AvailabilityRuleInput = {
  weekday: number; // 1=lunes … 7=domingo
  enabled: boolean;
  start_time: string; // "10:00"
  end_time: string;
};

/** Guarda el horario semanal completo (7 filas) de una sola vez. */
export async function saveAvailabilityRules(
  rules: AvailabilityRuleInput[]
): Promise<AvailabilityResult> {
  for (const r of rules) {
    if (r.enabled && r.start_time >= r.end_time) {
      return {
        ok: false,
        error: "La hora de inicio debe ser antes que la de fin.",
      };
    }
  }
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("availability_rules").upsert(
      rules.map((r) => ({
        weekday: r.weekday,
        enabled: r.enabled,
        start_time: r.start_time,
        end_time: r.end_time,
        updated_at: new Date().toISOString(),
      }))
    );
    if (error) throw error;
    revalidatePath("/admin/agenda");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo guardar.",
    };
  }
}

export type BlockedSlotInput = {
  date: string; // "2026-07-20"
  start_time: string | null; // null = día completo
  end_time: string | null;
  reason: string;
};

export async function addBlockedSlot(
  input: BlockedSlotInput
): Promise<AvailabilityResult> {
  if (!input.date) return { ok: false, error: "Falta la fecha." };
  if (input.start_time && input.end_time && input.start_time >= input.end_time) {
    return {
      ok: false,
      error: "La hora de inicio debe ser antes que la de fin.",
    };
  }
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("blocked_slots").insert({
      date: input.date,
      start_time: input.start_time,
      end_time: input.end_time,
      reason: input.reason.trim() || null,
    });
    if (error) throw error;
    revalidatePath("/admin/agenda");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo bloquear.",
    };
  }
}

export async function removeBlockedSlot(
  id: string
): Promise<AvailabilityResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("blocked_slots")
      .delete()
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/agenda");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo eliminar.",
    };
  }
}
