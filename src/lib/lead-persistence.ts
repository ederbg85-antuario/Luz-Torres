import { createHash, randomUUID } from "node:crypto";
import { isUuid, normalizeAcquisition } from "@/lib/acquisition";
import type { ContactInterest } from "@/lib/types";

export type PersistedLead = { ok: true; leadId: string; eventId: string; created: boolean; interest: ContactInterest; propertyId: string | null };
type RpcClient = { rpc: (name: string, params: Record<string, unknown>) => PromiseLike<{ data: unknown; error: unknown }> };
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const RETRY_CONFLICT = "LEAD_RETRY_CONFLICT";
export function isLeadRetryConflict(error: unknown): boolean {
  return error instanceof Error && error.message === RETRY_CONFLICT;
}

/** No raw URLs/PII are copied into acquisition. The RPC also validates its boundary. */
export async function persistWebLead(client: RpcClient, payload: Record<string, unknown>, rawContext: unknown): Promise<PersistedLead> {
  let context: Record<string, unknown> = {};
  try {
    const value = typeof rawContext === "string" && rawContext.length <= 8000 ? JSON.parse(rawContext) : rawContext;
    if (value && typeof value === "object" && !Array.isArray(value)) context = value as Record<string, unknown>;
  } catch { /* Missing/invalid context degrades to unknown, never a fake source. */ }
  const submissionId = isUuid(context.submission_id) ? context.submission_id : randomUUID();
  const token = isUuid(context.retry_token) ? context.retry_token : randomUUID();
  const { data, error } = await client.rpc("submit_web_lead", {
    p_submission_id: submissionId, p_retry_hash: hash(token),
    p_payload: payload,
    p_acquisition: normalizeAcquisition(context.acquisition),
  });
  if (error) throw new Error("Lead persistence failed");
  const result = data as Record<string, unknown> | null;
  if (result?.reason === "payload_changed") throw new Error(RETRY_CONFLICT);
  if (!result?.ok || !isUuid(result.lead_id) || !isUuid(result.event_id) || !["compra", "renta", "venta", "inversion"].includes(String(result.interest))) {
    throw new Error("Lead persistence was not confirmed");
  }
  return { ok: true, leadId: result.lead_id, eventId: result.event_id, created: result.created === true, interest: result.interest as ContactInterest, propertyId: isUuid(result.property_id) ? result.property_id : null };
}
