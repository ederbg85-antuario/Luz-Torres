"use server";

import {
  createSupabasePublicClient,
  isSupabaseConfigured,
} from "@/lib/supabase/public";
import type { ContactInterest } from "@/lib/types";
import {
  createMetaEventId,
  sendMetaServerEvent,
} from "@/lib/meta-conversions";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message: string;
  eventId?: string;
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

  try {
    const supabase = createSupabasePublicClient();
    const { error } = await supabase.from("contacts").insert({
      full_name: fullName,
      email: email || null,
      phone: phone || null,
      message: message || null,
      interest,
      source: "web",
      stage: "nuevo",
      property_id: propertyId || null,
    });
    if (error) throw error;
  } catch {
    return {
      status: "error",
      message:
        "No pude enviar tu mensaje. Intenta de nuevo o escríbeme por WhatsApp.",
    };
  }

  const eventId = createMetaEventId();
  await sendMetaServerEvent({
    eventName: "Lead",
    eventId,
    email,
    phone,
    contentName: `Contacto web · ${interest}`,
    ...(propertyId ? { contentIds: [propertyId] } : {}),
  });

  return {
    status: "success",
    message:
      "Gracias por escribir. Revisaré tu mensaje y te contactaré sin prisa, pero pronto.",
    eventId,
  };
}
