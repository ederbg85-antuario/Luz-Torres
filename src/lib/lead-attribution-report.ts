import type { LeadAcquisition, AcquisitionChannel } from "@/lib/acquisition";

export type LeadAttribution = {
  contact_id: string;
  event_id: string;
  lead_type: "contact" | "seller" | "visit";
  acquisition: LeadAcquisition;
  created_at: string;
};

export const ACQUISITION_LABELS: Record<AcquisitionChannel, string> = {
  organic_search: "Búsqueda orgánica observada", paid_search: "Búsqueda pagada observada",
  organic_social: "Social orgánico observado", paid_social: "Social pagado observado",
  paid_other: "Otro medio pagado observado", email: "Email observado", referral: "Referente externo observado", unknown: "Origen desconocido",
};

export const ACQUISITION_SEGMENTS = { compra: "Compra", renta: "Renta", seller: "Propietario vendedor", inversion: "Inversión", unknown: "Interés desconocido" };
export function summarizeLeadSources(contacts: { id: string; stage: string; interest?: string | null }[], receipts: LeadAttribution[]) {
  const byId = new Map(receipts.map((receipt) => [receipt.contact_id, receipt]));
  const groups = new Map<string, { channel: AcquisitionChannel; stage: string; segment: keyof typeof ACQUISITION_SEGMENTS; count: number }>();
  for (const contact of contacts) {
    const receipt = byId.get(contact.id);
    const channel = receipt?.acquisition.first_touch?.channel ?? "unknown";
    const segment = receipt?.lead_type === "seller" || contact.interest === "venta" ? "seller" : contact.interest === "compra" || contact.interest === "renta" || contact.interest === "inversion" ? contact.interest : "unknown";
    const key = `${channel}:${contact.stage}:${segment}`;
    const group = groups.get(key) ?? { channel, stage: contact.stage, segment, count: 0 };
    group.count++;
    groups.set(key, group);
  }
  return [...groups.values()].sort((a, b) => b.count - a.count || a.channel.localeCompare(b.channel));
}
