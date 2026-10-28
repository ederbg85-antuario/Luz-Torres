/** JSON-LD embedded in a script must never contain a literal closing HTML tag. */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
