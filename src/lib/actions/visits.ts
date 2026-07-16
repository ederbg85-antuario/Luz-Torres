"use server";

import {
  createSupabasePublicClient,
  isSupabaseConfigured,
} from "@/lib/supabase/public";
import type {
  AvailabilityRule,
  BlockedSlot,
  FinancingMethod,
  TakenSlot,
} from "@/lib/types";

// ─── Disponibilidad pública ─────────────────────────────────────

export type VisitAvailability = {
  rules: AvailabilityRule[];
  blocked: BlockedSlot[];
  taken: TakenSlot[];
};

const EMPTY: VisitAvailability = { rules: [], blocked: [], taken: [] };

/**
 * Devuelve todo lo necesario para pintar el calendario de visitas:
 * horario semanal, bloqueos puntuales y rangos ya ocupados en la agenda.
 */
export async function fetchVisitAvailability(
  fromISO: string,
  toISO: string
): Promise<VisitAvailability> {
  if (!isSupabaseConfigured()) return EMPTY;
  try {
    const supabase = createSupabasePublicClient();
    const fromDate = fromISO.slice(0, 10);
    const toDate = toISO.slice(0, 10);
    const [rules, blocked, taken] = await Promise.all([
      supabase.from("availability_rules").select("*").order("weekday"),
      supabase
        .from("blocked_slots")
        .select("*")
        .gte("date", fromDate)
        .lte("date", toDate),
      supabase.rpc("get_taken_slots", { p_from: fromISO, p_to: toISO }),
    ]);
    return {
      rules: (rules.data as AvailabilityRule[]) ?? [],
      blocked: (blocked.data as BlockedSlot[]) ?? [],
      taken: (taken.data as TakenSlot[]) ?? [],
    };
  } catch {
    return EMPTY;
  }
}

// ─── Reservar visita ────────────────────────────────────────────

export type BookVisitInput = {
  property_id: string;
  starts_at: string; // ISO
  full_name: string;
  phone: string;
  email: string;
  financing: FinancingMethod;
  message: string;
  /** Honeypot anti-spam: si viene lleno, fingimos éxito. */
  company?: string;
};

export type BookVisitResult = { ok: boolean; error?: string };

export async function bookVisit(
  input: BookVisitInput
): Promise<BookVisitResult> {
  if (input.company) return { ok: true };

  if (!input.full_name.trim()) {
    return { ok: false, error: "Falta tu nombre completo." };
  }
  if (!input.phone.trim() && !input.email.trim()) {
    return {
      ok: false,
      error: "Deja un teléfono o un correo para confirmarte la visita.",
    };
  }
  if (!input.starts_at) {
    return { ok: false, error: "Elige fecha y hora para tu visita." };
  }
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      error:
        "El sistema de reservas aún no está conectado. Escríbeme por WhatsApp.",
    };
  }

  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase.rpc("book_visit", {
      p_property_id: input.property_id,
      p_starts_at: new Date(input.starts_at).toISOString(),
      p_full_name: input.full_name.trim(),
      p_phone: input.phone.trim() || null,
      p_email: input.email.trim() || null,
      p_financing: input.financing,
      p_message: input.message.trim() || null,
    });
    if (error) throw error;
    const result = data as { ok: boolean; error?: string };
    if (!result?.ok) {
      return {
        ok: false,
        error: result?.error ?? "No se pudo agendar la visita.",
      };
    }
    return { ok: true };
  } catch {
    return {
      ok: false,
      error:
        "No pude agendar tu visita. Intenta de nuevo o escríbeme por WhatsApp.",
    };
  }
}
