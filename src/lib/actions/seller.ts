"use server";

import {
  createSupabasePublicClient,
  isSupabaseConfigured,
} from "@/lib/supabase/public";
import { createMetaEventId, sendMetaServerEvent } from "@/lib/meta-conversions";

export type SellerFormState = {
  status: "idle" | "success" | "error";
  message: string;
  eventId?: string;
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

  try {
    const supabase = createSupabasePublicClient();
    const { error } = await supabase.from("contacts").insert({
      full_name: fullName,
      email,
      phone,
      message: details,
      interest: "venta",
      source: "web",
      stage: "nuevo",
    });
    if (error) throw error;
  } catch {
    return {
      status: "error",
      message: "No pude enviar la solicitud. Intenta de nuevo o escríbeme por WhatsApp.",
    };
  }

  const eventId = createMetaEventId();
  await sendMetaServerEvent({
    eventName: "Lead",
    eventId,
    email,
    phone,
    contentName: "Solicitud para vender propiedad",
  });

  return {
    status: "success",
    message: "Recibí los datos de tu propiedad. Te escribiré para conocerla y preparar una valuación.",
    eventId,
  };
}
