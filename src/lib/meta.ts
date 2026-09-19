"use client";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Envía un evento al píxel de Meta cuando éste está configurado. El eventId
 * se comparte con Conversions API para que Meta no contabilice dos veces el
 * mismo prospecto.
 */
export function trackMetaEvent(
  eventName: "Contact" | "Lead" | "PageView" | "Schedule" | "ViewContent",
  params: Record<string, unknown> = {},
  eventId?: string
) {
  if (typeof window === "undefined" || !window.fbq) return;

  window.fbq("track", eventName, params, eventId ? { eventID: eventId } : {});
}
