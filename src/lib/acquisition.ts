/** Acquisition reported by this tab, never an identity or proof of causality. */
export type AcquisitionChannel = "organic_search" | "paid_search" | "organic_social" | "paid_social" | "paid_other" | "email" | "referral" | "unknown";
export type AcquisitionTouch = {
  landing_path: string;
  referrer_host: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  observed_at: string;
  channel: AcquisitionChannel;
  campaign_present: boolean;
  campaign_rejected: boolean;
  paid_click_present: boolean;
  social_click_present: boolean;
};
export type LeadAcquisition = {
  version: 1;
  first_touch: AcquisitionTouch | null;
  last_touch: AcquisitionTouch | null;
  conversion_path: string | null;
  source_basis: "browser_observed" | "unknown";
  source_confidence: "low" | "unknown";
};
export type LeadSubmissionContext = {
  submission_id: string;
  retry_token: string;
  acquisition: LeadAcquisition;
};

export const ACQUISITION_MAX_AGE_MS = 24 * 60 * 60 * 1000;
export const isUuid = (value: unknown): value is string => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export function cleanPublicPath(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 240) return null;
  const path = value.split(/[?#]/, 1)[0];
  if (["/", "/contacto", "/sobre-luz", "/vende-tu-propiedad"].includes(path)) return path;
  return /^\/propiedades(?:\/[a-z0-9-]+){0,4}\/?$/.test(path) ? path : null;
}

/** Deliberately excludes free text, e-mail, URLs, phone-like strings and IDs. */
export function cleanCampaignValue(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim().toLowerCase();
  return /^[a-z][a-z0-9_-]{0,79}$/.test(text) && !/\d{8,}|[a-f0-9]{24,}/.test(text) && !/^[a-z0-9]{24,}$/.test(text) && !isUuid(text) ? text : null;
}

export function cleanReferrerHost(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const host = new URL(value.includes("://") ? value : `https://${value}`).hostname.toLowerCase().replace(/^www\./, "");
    if (!/^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(host) || host.length > 120 || /^\d[\d.]+$/.test(host)) return null;
    if (host === "luztorres.com" || host.endsWith(".luztorres.com") || host === "localhost" || host.endsWith(".test") || host === "accounts.google.com" || /^(?:login|checkout|auth)\./.test(host)) return null;
    return host;
  } catch { return null; }
}

const isSearch = (value: string) => /^(?:google(?:\.com(?:\.mx)?)?|bing(?:\.com)?|duckduckgo(?:\.com)?|search\.yahoo\.com|search\.brave\.com)$/.test(value);
const isSocial = (value: string) => /^(?:(?:l\.|lm\.|m\.)?(?:facebook|instagram)\.com|facebook|instagram|linkedin(?:\.com)?|tiktok(?:\.com)?|x(?:\.com)?|t\.co|pinterest(?:\.com)?)$/.test(value);

function channelFor(touch: Omit<AcquisitionTouch, "channel">): AcquisitionChannel {
  const source = touch.utm_source ?? "";
  const medium = (touch.utm_medium ?? "").replaceAll("_", "-");
  if (touch.campaign_rejected) return "unknown";
  if (["cpc", "ppc", "paid", "paid-social", "paid-search", "sponsored", "display"].includes(medium)) {
    return isSearch(source) ? "paid_search" : isSocial(source) ? "paid_social" : "paid_other";
  }
  if (touch.paid_click_present || touch.social_click_present) return "unknown";
  if (medium === "email") return "email";
  if (medium === "organic" && isSearch(source)) return "organic_search";
  if (["social", "organic-social"].includes(medium) && isSocial(source)) return "organic_social";
  if (source || medium || touch.campaign_present || touch.paid_click_present || touch.social_click_present) return "unknown"; // Never promote an ambiguous/ad-click visit to organic.
  const host = touch.referrer_host ?? "";
  if (isSearch(host)) return "organic_search";
  if (isSocial(host)) return "organic_social";
  return host ? "referral" : "unknown"; // No referrer does not prove direct or SEO.
}

export function normalizeTouch(raw: unknown, now = Date.now()): AcquisitionTouch | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const input = raw as Record<string, unknown>;
  const landing = cleanPublicPath(input.landing_path);
  const at = typeof input.observed_at === "string" ? Date.parse(input.observed_at) : NaN;
  if (!landing || !Number.isFinite(at) || at > now + 5 * 60 * 1000 || now - at > ACQUISITION_MAX_AGE_MS) return null;
  const touch = {
    landing_path: landing,
    referrer_host: cleanReferrerHost(input.referrer_host),
    utm_source: cleanCampaignValue(input.utm_source), utm_medium: cleanCampaignValue(input.utm_medium),
    utm_campaign: cleanCampaignValue(input.utm_campaign), utm_content: cleanCampaignValue(input.utm_content),
    utm_term: cleanCampaignValue(input.utm_term), observed_at: new Date(at).toISOString(),
    campaign_present: input.campaign_present === true || ["utm_source","utm_medium","utm_campaign","utm_content","utm_term"].some((key) => input[key] != null),
    campaign_rejected: input.campaign_rejected === true || ["utm_source","utm_medium","utm_campaign","utm_content","utm_term"].some((key) => input[key] != null && cleanCampaignValue(input[key]) === null),
    paid_click_present: input.paid_click_present === true,
    social_click_present: input.social_click_present === true,
  };
  return { ...touch, channel: channelFor(touch) };
}

export function normalizeAcquisition(raw: unknown, now = Date.now()): LeadAcquisition {
  const input = raw && typeof raw === "object" && !Array.isArray(raw) ? raw as Record<string, unknown> : {};
  const first = normalizeTouch(input.first_touch, now);
  const last = normalizeTouch(input.last_touch, now);
  const orderedLast = first && last && last.observed_at < first.observed_at ? first : last;
  return {
    version: 1, first_touch: first, last_touch: orderedLast,
    conversion_path: cleanPublicPath(input.conversion_path),
    source_basis: first || last ? "browser_observed" : "unknown",
    source_confidence: first || last ? "low" : "unknown",
  };
}

export function touchFromLocation(href: string, referrer: string, now = Date.now()): AcquisitionTouch | null {
  try {
    const url = new URL(href);
    try { if (referrer && new URL(referrer).hostname === url.hostname) referrer = ""; } catch { referrer = ""; }
    return normalizeTouch({
      landing_path: url.pathname, referrer_host: referrer,
      ...Object.fromEntries(["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].map((key) => [key, url.searchParams.get(key)])),
      campaign_present: [...url.searchParams.keys()].some((key) => key.startsWith("utm_")),
      paid_click_present: ["gclid","dclid","gbraid","wbraid","msclkid"].some((key) => url.searchParams.has(key)),
      social_click_present: url.searchParams.has("fbclid"),
      observed_at: new Date(now).toISOString(),
    }, now);
  } catch { return null; }
}
