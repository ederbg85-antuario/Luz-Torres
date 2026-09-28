const NATIONAL = /^[1-9]\d{9}$/;

/**
 * Número nacional mexicano de 10 dígitos.
 * Acepta el número local, el prefijo +52 y el prefijo móvil 521 de WhatsApp.
 */
export function mexicanNationalNumber(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (NATIONAL.test(digits)) return digits;
  if (digits.length === 12 && digits.startsWith("52") && NATIONAL.test(digits.slice(2))) {
    return digits.slice(2);
  }
  if (digits.length === 13 && digits.startsWith("521") && NATIONAL.test(digits.slice(3))) {
    return digits.slice(3);
  }
  return null;
}

/** Forma canónica para guardar y abrir WhatsApp: +52 y 10 dígitos. */
export function formatMexicanWhatsApp(input: string): string | null {
  const national = mexicanNationalNumber(input);
  return national ? `+52${national}` : null;
}
