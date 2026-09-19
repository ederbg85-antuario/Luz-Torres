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
import { createMetaEventId, sendMetaServerEvent } from "@/lib/meta-conversions";

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
  toISO: string,
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

// ─── Solicitar visita ───────────────────────────────────────────

export type VisitRequestInput = {
  property_id: string;
  preferred_date: string; // YYYY-MM-DD
  preferred_time: string; // HH:mm
  full_name: string;
  phone: string;
  email: string;
  financing: FinancingMethod;
  message: string;
  /** Honeypot anti-spam: si viene lleno, fingimos éxito. */
  company?: string;
};

export type VisitRequestResult = {
  ok: boolean;
  error?: string;
  eventId?: string;
};

export async function requestVisit(
  input: VisitRequestInput,
): Promise<VisitRequestResult> {
  if (input.company) return { ok: true };

  if (!input.full_name.trim() || !input.phone.trim() || !input.email.trim()) {
    return {
      ok: false,
      error: "Completa nombre, teléfono y correo para enviar la solicitud.",
    };
  }
  if (!input.preferred_date || !input.preferred_time) {
    return { ok: false, error: "Elige la fecha y hora que prefieres." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    return { ok: false, error: "Escribe un correo electrónico válido." };
  }
  if (!/^\d{10,15}$/.test(input.phone.replace(/\D/g, ""))) {
    return {
      ok: false,
      error: "Escribe un teléfono válido de 10 a 15 dígitos.",
    };
  }
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      error:
        "El sistema de solicitudes aún no está conectado. Escríbeme por WhatsApp.",
    };
  }

  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase.rpc("request_visit", {
      p_property_id: input.property_id,
      p_preferred_date: input.preferred_date,
      p_preferred_time: input.preferred_time,
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
        error: result?.error ?? "No se pudo registrar la solicitud.",
      };
    }
    const eventId = createMetaEventId();
    await sendMetaServerEvent({
      eventName: "Lead",
      eventId,
      email: input.email.trim(),
      phone: input.phone.trim(),
      contentName: "Solicitud de visita",
      contentCategory: "visit_request",
      contentIds: [input.property_id],
    });
    return { ok: true, eventId };
  } catch {
    return {
      ok: false,
      error:
        "No pude enviar tu solicitud. Intenta de nuevo o escríbeme por WhatsApp.",
    };
  }
}
