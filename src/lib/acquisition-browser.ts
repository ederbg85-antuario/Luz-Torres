import { ACQUISITION_MAX_AGE_MS, isUuid, normalizeAcquisition, touchFromLocation } from "@/lib/acquisition";
import type { LeadAcquisition, LeadSubmissionContext } from "@/lib/acquisition";

const JOURNEY_KEY = "lt.acquisition.v1";
let memory: LeadAcquisition | undefined;
const submissions = new Map<string, LeadSubmissionContext & { created_at: number }>();

function read(key: string): unknown {
  try { return JSON.parse(window.sessionStorage.getItem(key) ?? "null"); } catch { return null; }
}
function write(key: string, value: unknown) {
  try { window.sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* Storage blocking must not block the form. */ }
}

/** One tab, max 24h. Internal navigation never overwrites acquisition with itself. */
export function captureAcquisition(isDocumentEntry = false): LeadAcquisition {
  if (typeof window === "undefined") return normalizeAcquisition(null);
  const previous = normalizeAcquisition(memory ?? read(JOURNEY_KEY));
  const current = touchFromLocation(window.location.href, isDocumentEntry || !previous.first_touch ? document.referrer : "");
  if (!current) return previous;
  const tagged = current.campaign_present || current.paid_click_present || current.social_click_present;
  const newTouch = !previous.first_touch || (isDocumentEntry && (Boolean(current.referrer_host) || tagged));
  memory = normalizeAcquisition({
    first_touch: previous.first_touch ?? current,
    last_touch: newTouch ? current : previous.last_touch,
    conversion_path: current.landing_path,
  });
  write(JOURNEY_KEY, memory);
  return memory;
}

export function getLeadSubmission(key: string): LeadSubmissionContext | undefined {
  if (typeof window === "undefined" || typeof crypto === "undefined" || typeof crypto.randomUUID !== "function") return undefined;
  const storageKey = `lt.submission.v1:${key}`;
  const stored = read(storageKey) as (LeadSubmissionContext & { created_at?: number }) | null;
  const candidate = submissions.get(key) ?? stored;
  const age = candidate?.created_at == null ? NaN : Date.now() - candidate.created_at;
  const cached = Number.isFinite(age) && age >= 0 && age < ACQUISITION_MAX_AGE_MS ? candidate : null;
  let context;
  try {
    context = cached && isUuid(cached.submission_id) && isUuid(cached.retry_token) ? cached : {
      submission_id: crypto.randomUUID(), retry_token: crypto.randomUUID(), acquisition: captureAcquisition(), created_at: Date.now(),
    };
  } catch { return undefined; } // The server can accept a form with unknown acquisition.
  const record = { ...context, created_at: context.created_at ?? Date.now() };
  submissions.set(key, record);
  write(storageKey, record);
  return { ...context, acquisition: captureAcquisition() };
}

export function finishLeadSubmission(key: string) {
  submissions.delete(key);
  try { window.sessionStorage.removeItem(`lt.submission.v1:${key}`); } catch { /* No-op when storage is blocked. */ }
}

export function attachLeadSubmission(form: FormData, key: string) {
  const context = getLeadSubmission(key);
  if (context) form.set("lead_context", JSON.stringify(context));
  else form.delete("lead_context");
}
