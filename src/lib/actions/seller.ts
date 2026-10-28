"use server";

import {
  createSupabasePublicClient,
  isSupabaseConfigured,
} from "@/lib/supabase/public";
import { sendMetaServerEvent } from "@/lib/meta-conversions";
import { isLeadRetryConflict, persistWebLead } from "@/lib/lead-persistence";
import type { PersistedLead } from "@/lib/lead-persistence";
import { SITE_URL } from "@/lib/supabase/config";

export type SellerFormState = {
  status: "idle" | "success" | "error";
  message: string;
  eventId?: string;
  leadId?: string;
  retryConflict?: boolean;
};

export async function submitSellerForm(
  _previous: SellerFormState,
  formData: FormData
): Promise<SellerFormState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const propertyType = String(formData.get("property_type") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const estimatedValue = String(formData.get("estimated_value") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const honeypot = String(formData.get("company") ?? "");

  if (honeypot) {
    return { status: "success", message: "Gracias, te contactaré pronto." };
  }

  if (!fullName || !phone || !email || !propertyType || !location) {
    return {
      status: "error",
      message: "Completa tus datos de contacto y los datos básicos de la propiedad.",
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{10,15}$/.test(phone.replace(/\D/g, ""))) {
    return { status: "error", message: "Escribe un correo y un teléfono válidos." };
  }

  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      message: "El formulario aún no está conectado. Escríbeme por WhatsApp mientras tanto.",
    };
  }

  const details = [
    "Solicitud para vender una propiedad",
    `Tipo de inmueble: ${propertyType}`,
    `Ubicación: ${location}`,
    ...(estimatedValue ? [`Valor estimado: ${estimatedValue}`] : []),
    ...(message ? [`Comentarios: ${message}`] : []),
  ].join("\n");

  let saved: PersistedLead;
  try {
    const supabase = createSupabasePublicClient();
    saved = await persistWebLead(supabase, {
      lead_type: "seller",
      full_name: fullName,
      email,
      phone,
      message: details,
      interest: "venta",
    }, formData.get("lead_context"));
  } catch (error) {
    if (isLeadRetryConflict(error)) return { status: "error", retryConflict: true, message: "La solicitud anterior ya se recibió. Estos datos son distintos; puedes enviarlos como una nueva solicitud." };
    return {
      status: "error",
      message: "No pude enviar la solicitud. Intenta de nuevo o escríbeme por WhatsApp.",
    };
  }

  const eventId = saved.eventId;
  if (saved.created) await sendMetaServerEvent({
    eventName: "SellerLead",
    eventId,
    email,
    phone,
    contentName: "Solicitud para vender propiedad",
    contentCategory: "seller_request",
    sourceUrl: `${SITE_URL}/vende-tu-propiedad`,
  });

  return {
    status: "success",
    message: "Recibí los datos de tu propiedad. Te escribiré para conocerla y preparar una valuación.",
    eventId,
    leadId: saved.leadId,
  };
}
