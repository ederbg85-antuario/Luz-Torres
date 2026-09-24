"use client";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
type EventName = "Contact" | "Lead" | "PageView" | "ViewContent";
type QueuedEvent = { name: EventName; params: Record<string, unknown>; id?: string };
const pendingEvents: QueuedEvent[] = [];
const sentIds = new Set<string>();
let ready = false;

export function flushMetaEvents() {
  ready = true;
  for (const event of pendingEvents.splice(0)) {
    trackMetaEvent(event.name, event.params, event.id);
  }
}

/**
 * Envía un evento al píxel de Meta cuando éste está configurado. El eventId
 * se comparte con Conversions API para que Meta no contabilice dos veces el
 * mismo prospecto.
 */
export function trackMetaEvent(
  eventName: EventName,
  params: Record<string, unknown> = {},
  eventId?: string
) {
  if (typeof window === "undefined" || !PIXEL_ID) return;
  if (!ready || !window.fbq) {
    if (pendingEvents.length < 30) pendingEvents.push({ name: eventName, params, id: eventId });
    return;
  }
  const key = eventId ? `${eventName}:${eventId}` : undefined;
  if (key && sentIds.has(key)) return;
  if (key) sentIds.add(key);
  window.fbq("trackSingle", PIXEL_ID, eventName, params, eventId ? { eventID: eventId } : {});
}
