/** Clave de ficha al final del slug (p. ej. iho8356137 → IHO8356137). */
export function listingKeyFromSlug(slug: string) {
  const last = slug.split("-").at(-1) ?? "";
  return /^[a-z]{2,4}\d{4,}$/i.test(last) ? last.toUpperCase() : null;
}

/** Mensaje de WhatsApp que identifica la propiedad por título, clave y URL. */
export function propertyWhatsAppMessage(
  property: { title: string; slug: string },
  siteUrl: string,
) {
  const url = `${siteUrl.replace(/\/$/, "")}/propiedades/${property.slug}`;
  const key = listingKeyFromSlug(property.slug);
  const ref = key ? `${key} · ${url}` : url;
  return `Hola Luz, me interesa la propiedad: ${property.title} (${ref})`;
}
