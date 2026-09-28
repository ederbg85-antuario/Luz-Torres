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
import { formatMexicanWhatsApp } from "@/lib/phone";

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
  /** Si ambos vienen vacíos, la solicitud queda como "contactar para agendar". */
  preferred_date?: string | null;
  preferred_time?: string | null;
  full_name: string;
  phone: string;
  email?: string;
  financing: FinancingMethod;
  message: string;
  /** Honeypot anti-spam: si viene lleno, fingimos éxito. */
  company?: string;
  source_url?: string;
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

  const phone = formatMexicanWhatsApp(input.phone);
  const email = input.email?.trim() ?? "";
  if (input.full_name.trim().length < 2) {
    return { ok: false, error: "Escribe tu nombre completo." };
  }
  if (!phone) {
    return {
      ok: false,
      error: "Escribe un WhatsApp de México de 10 dígitos. Puedes incluir +52.",
    };
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Escribe un correo electrónico válido." };
  }
  const preferredDate = input.preferred_date?.trim() || null;
  const preferredTime = input.preferred_time?.trim() || null;
  if (Boolean(preferredDate) !== Boolean(preferredTime)) {
    return {
      ok: false,
      error: "Si indicas una preferencia, necesito fecha y horario.",
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
      p_preferred_date: preferredDate,
      p_preferred_time: preferredTime,
      p_full_name: input.full_name.trim(),
      p_phone: phone,
      p_email: email || null,
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
      email: email || undefined,
      phone,
      contentName: "Solicitud de visita",
      contentCategory: "visit_request",
      contentIds: [input.property_id],
      sourceUrl: input.source_url,
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
