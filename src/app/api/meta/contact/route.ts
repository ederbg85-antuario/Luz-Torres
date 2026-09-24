import { sendMetaServerEvent } from "@/lib/meta-conversions";
import { SITE_URL } from "@/lib/supabase/config";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const allowed = [new URL(SITE_URL).origin, new URL(request.url).origin];
  if (!origin || !allowed.includes(origin) || request.headers.get("sec-fetch-site") === "cross-site") {
    return new Response(null, { status: 403 });
  }
  const body = await request.text();
  if (body.length > 2048) return new Response(null, { status: 413 });
  let input: { eventId?: string; propertyId?: string; placement?: string; sourceUrl?: string };
  try { input = JSON.parse(body); } catch { return new Response(null, { status: 400 }); }
  if (!input.eventId || !/^[a-f0-9-]{36}$/i.test(input.eventId)) return new Response(null, { status: 400 });
  const propertyId = typeof input.propertyId === "string" && /^[a-f0-9-]{36}$/i.test(input.propertyId) ? input.propertyId : undefined;
  await sendMetaServerEvent({
    eventName: "Contact",
    eventId: input.eventId,
    contentName: "WhatsApp",
    contentCategory: "whatsapp_click",
    contentIds: propertyId ? [propertyId] : undefined,
    placement: typeof input.placement === "string" ? input.placement.replace(/[^a-z_]/g, "").slice(0,50) : undefined,
    sourceUrl: typeof input.sourceUrl === "string" ? input.sourceUrl : undefined,
  });
  return new Response(null, { status: 204 });
}
