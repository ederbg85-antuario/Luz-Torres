import "server-only";

import { randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
import { SITE_URL } from "@/lib/supabase/config";
import { hashMetaValue, normalizeMetaPhone, metaSourceUrl, metaClickId } from "@/lib/meta-event-data";

type MetaEventName = "Lead" | "Contact" | "SellerLead" | "ContactLead";

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
  sourceUrl?: string;
  placement?: string;
};

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
  const phone = event.phone ? normalizeMetaPhone(event.phone) : "";
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  const clientIp = forwardedFor?.split(",")[0]?.trim();
  const referer = event.sourceUrl || requestHeaders.get("referer");
  const sourceUrl = metaSourceUrl(referer, SITE_URL);

  const userData: Record<string, string> = {};
  if (email) userData.em = hashMetaValue(email);
  if (phone) userData.ph = hashMetaValue(phone);
  if (clientIp) userData.client_ip_address = clientIp;
  const userAgent = requestHeaders.get("user-agent");
  if (userAgent) userData.client_user_agent = userAgent;
  const fbp = cookieStore.get("_fbp")?.value;
  const fbc = metaClickId(cookieStore.get("_fbc")?.value, referer);
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
    ...(event.placement ? { placement: event.placement } : {}),
  };

  const body = JSON.stringify({
    access_token: accessToken,
    data: [{
      event_name: event.eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: event.eventId,
      event_source_url: sourceUrl,
      action_source: "website",
      user_data: userData,
      custom_data: customData,
    }],
    ...(process.env.META_CAPI_TEST_EVENT_CODE
      ? { test_event_code: process.env.META_CAPI_TEST_EVENT_CODE }
      : {}),
  });
  try {
    const send = () => fetch(
      `https://graph.facebook.com/v22.0/${encodeURIComponent(pixelId)}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        cache: "no-store",
        signal: AbortSignal.timeout(4000),
      },
    );

    let response = await send();
    // Mismo ID y hora en el reintento: una conversión nunca se duplica.
    if (response.status === 429 || response.status >= 500) response = await send();
    const result = await response.json() as {
      events_received?: number;
      fbtrace_id?: string;
      error?: { code?: number; error_subcode?: number };
    };
    if (!response.ok || result.events_received !== 1) {
      console.error(
        "Meta Conversions API respondió con error",
        { status: response.status, code: result.error?.code, subcode: result.error?.error_subcode, eventId: event.eventId },
      );
      return { sent: false, reason: "api_error" };
    }
    console.info("meta_capi_accepted", { pixelId, eventName: event.eventName, category: event.contentCategory, eventId: event.eventId, eventsReceived: result.events_received, traceId: result.fbtrace_id });
    return { sent: true, eventId: event.eventId };
  } catch {
    console.error("No se pudo enviar la conversión a Meta CAPI");
    return { sent: false, reason: "network_error" };
  }
}
