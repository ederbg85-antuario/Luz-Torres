"use server";

import {
  createSupabasePublicClient,
  isSupabaseConfigured,
} from "@/lib/supabase/public";
import type { ContactInterest } from "@/lib/types";
import { sendMetaServerEvent } from "@/lib/meta-conversions";
import { isLeadRetryConflict, persistWebLead } from "@/lib/lead-persistence";
import type { PersistedLead } from "@/lib/lead-persistence";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message: string;
  eventId?: string;
  interest?: ContactInterest;
  propertyId?: string | null;
  leadId?: string;
  retryConflict?: boolean;
};

const INTERESTS: ContactInterest[] = ["compra", "renta", "venta", "inversion"];

export async function submitContactForm(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const interestRaw = String(formData.get("interest") ?? "compra");
  const propertyId = String(formData.get("property_id") ?? "").trim();
  const honeypot = String(formData.get("company") ?? "");

  // Trampa anti-spam: si el campo oculto viene lleno, fingimos éxito.
  if (honeypot) {
    return { status: "success", message: "Gracias, te contactaré pronto." };
  }

  if (!fullName || !email || !phone) {
    return {
      status: "error",
      message: "Necesito tu nombre, teléfono y correo para poder contactarte.",
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{10,15}$/.test(phone.replace(/\D/g, ""))) {
    return { status: "error", message: "Escribe un correo y un teléfono válidos." };
  }

  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      message:
        "El formulario aún no está conectado. Escríbeme por WhatsApp mientras tanto.",
    };
  }

  const interest = INTERESTS.includes(interestRaw as ContactInterest)
    ? (interestRaw as ContactInterest)
    : "compra";

  let saved: PersistedLead;
  try {
    const supabase = createSupabasePublicClient();
    saved = await persistWebLead(supabase, {
      lead_type: "contact",
      full_name: fullName,
      email: email || null,
      phone: phone || null,
      message: message || null,
      interest,
      property_id: propertyId || null,
    }, formData.get("lead_context"));
  } catch (error) {
    if (isLeadRetryConflict(error)) return { status: "error", retryConflict: true, message: "La solicitud anterior ya se recibió. Estos datos son distintos; puedes enviarlos como una nueva solicitud." };
    return {
      status: "error",
      message:
        "No pude enviar tu mensaje. Intenta de nuevo o escríbeme por WhatsApp.",
    };
  }

  const eventId = saved.eventId;
  if (saved.created) await sendMetaServerEvent({
    eventName: "ContactLead",
    eventId,
    email,
    phone,
    contentName: `Contacto web · ${saved.interest}`,
    contentCategory: "contact_request",
    sourceUrl: String(formData.get("source_url") ?? "") || undefined,
    ...(saved.propertyId ? { contentIds: [saved.propertyId] } : {}),
  });

  return {
    status: "success",
    message:
      "Gracias por escribir. Revisaré tu mensaje y te contactaré sin prisa, pero pronto.",
    eventId,
    leadId: saved.leadId,
    interest: saved.interest,
    propertyId: saved.propertyId,
  };
}
