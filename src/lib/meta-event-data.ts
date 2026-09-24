import { createHash } from "node:crypto";

export function hashMetaValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function normalizeMetaPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `52${digits}`;
  // Meta espera E.164 sin el prefijo móvil mexicano antiguo (521).
  if (digits.length === 13 && digits.startsWith("521")) return `52${digits.slice(3)}`;
  return digits;
}

/** Solo URL pública, sin consultas que puedan contener datos del formulario. */
export function metaSourceUrl(raw: string | null, siteUrl: string) {
  try {
    const url = new URL(raw || siteUrl);
    const site = new URL(siteUrl);
    if (![site.hostname, `www.${site.hostname}`, "localhost"].includes(url.hostname)) return site.origin;
    if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api")) return site.origin;
    return `${url.origin}${url.pathname}`;
  } catch {
    return new URL(siteUrl).origin;
  }
}

export function metaClickId(fbc: string | undefined, referer: string | null) {
  if (fbc && /^fb\.\d+\.\d+\.[\w-]+$/.test(fbc)) return fbc;
  try {
    const fbclid = new URL(referer || "").searchParams.get("fbclid");
    if (fbclid && /^[\w-]{10,500}$/.test(fbclid)) return `fb.1.${Date.now()}.${fbclid}`;
  } catch { /* No hay atribución de clic disponible. */ }
  return undefined;
}
