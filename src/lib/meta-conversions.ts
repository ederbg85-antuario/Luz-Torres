import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
import { SITE_URL } from "@/lib/supabase/config";

type MetaEventName = "Lead" | "Schedule";

type MetaServerEvent = {
  eventName: MetaEventName;
  eventId: string;
  email?: string;
  phone?: string;
  contentName?: string;
  contentCategory?: string;
  contentIds?: string[];
  value?: number;
  currency?: string;
};

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `52${digits}`;
  return digits;
}

/** Identificador opaco compartido entre el navegador y Conversions API. */
export function createMetaEventId() {
  return randomUUID();
}

/**
 * Registra un evento de conversión del lado servidor. Si las credenciales aún
 * no se han configurado, el formulario no se ve afectado: el píxel del
 * navegador seguirá funcionando cuando tenga un ID.
 */
export async function sendMetaServerEvent(event: MetaServerEvent) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !accessToken)
    return { sent: false, reason: "not_configured" };

  const [requestHeaders, cookieStore] = await Promise.all([
    headers(),
    cookies(),
  ]);
  const email = event.email?.trim().toLowerCase();
  const phone = event.phone ? normalizePhone(event.phone) : "";
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  const clientIp = forwardedFor?.split(",")[0]?.trim();
  const sourceUrl = requestHeaders.get("referer") || SITE_URL;

  const userData: Record<string, string> = {};
  if (email) userData.em = sha256(email);
  if (phone) userData.ph = sha256(phone);
  if (clientIp) userData.client_ip_address = clientIp;
  const userAgent = requestHeaders.get("user-agent");
  if (userAgent) userData.client_user_agent = userAgent;
  const fbp = cookieStore.get("_fbp")?.value;
  const fbc = cookieStore.get("_fbc")?.value;
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;

  const customData: Record<string, unknown> = {
    ...(event.contentName ? { content_name: event.contentName } : {}),
    ...(event.contentCategory
      ? { content_category: event.contentCategory }
      : {}),
    ...(event.contentIds?.length
      ? { content_ids: event.contentIds, content_type: "product" }
      : {}),
    ...(typeof event.value === "number" ? { value: event.value } : {}),
    ...(event.currency ? { currency: event.currency } : {}),
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/v22.0/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [
            {
              event_name: event.eventName,
              event_time: Math.floor(Date.now() / 1000),
              event_id: event.eventId,
              event_source_url: sourceUrl,
              action_source: "website",
              user_data: userData,
              custom_data: customData,
            },
          ],
          ...(process.env.META_CAPI_TEST_EVENT_CODE
            ? { test_event_code: process.env.META_CAPI_TEST_EVENT_CODE }
            : {}),
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(4000),
      },
    );

    if (!response.ok) {
      console.error(
        "Meta Conversions API respondió con error",
        response.status,
      );
      return { sent: false, reason: "api_error" };
    }
    return { sent: true };
  } catch {
    console.error("No se pudo enviar la conversión a Meta CAPI");
    return { sent: false, reason: "network_error" };
  }
}
