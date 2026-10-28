declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

type LeadType = "contact" | "seller" | "visit";
type LeadResult =
  | { status: "idle" | "success" | "error"; eventId?: string }
  | { ok: boolean; eventId?: string };

const EVENTS = new Set([
  "view_property",
  "generate_lead",
  "solicitud_visita",
  "contacto_whatsapp",
  "contacto_correo",
  "contacto_instagram",
]);

// DLV v2 conserva valores durante la navegación SPA. Cada mensaje limpia
// lo que no corresponde a esa acción, sin reinicializar el dataLayer de GTM.
const EMPTY_CONTEXT = {
  property_id: null,
  property_title: null,
  operation: null,
  property_price: null,
  currency: null,
  interest: null,
  lead_type: null,
  form_id: null,
  event_id: null,
  ubicacion: null,
  financing: null,
  value: null,
};

const CHOICES: Record<string, readonly string[]> = {
  operation: ["venta", "renta"],
  currency: ["MXN"],
  interest: ["compra", "renta", "venta", "inversion"],
  lead_type: ["contact", "seller", "visit"],
  form_id: ["contact", "seller", "visit_request"],
  ubicacion: [
    "header_desktop",
    "header_movil",
    "footer",
    "fab",
    "cta_home",
    "sobre_luz",
    "pagina_contacto",
    "ficha_propiedad",
  ],
};

function opaqueId(value: unknown): value is string {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(value);
}

function eventContext(params: Record<string, unknown>) {
  const context: Record<string, unknown> = { ...EMPTY_CONTEXT };
  for (const [key, choices] of Object.entries(CHOICES)) {
    const value = params[key];
    if (typeof value === "string" && choices.includes(value)) context[key] = value;
  }
  for (const key of ["event_id", "property_id"]) {
    if (opaqueId(params[key])) context[key] = params[key];
  }
  if (typeof params.property_title === "string") {
    context.property_title = params.property_title.slice(0, 200);
  }
  if (
    typeof params.property_price === "number" &&
    Number.isFinite(params.property_price) &&
    params.property_price >= 0
  ) {
    context.property_price = params.property_price;
  }
  // Lista cerrada: no copiar campos de formularios, URLs, value o financiación.
  return context;
}

/** El honeypot puede devolver éxito aparente, pero nunca un ID confirmado. */
export function confirmedLeadEventId(result: LeadResult) {
  const saved = "status" in result ? result.status === "success" : result.ok === true;
  return saved && opaqueId(result.eventId) ? result.eventId : null;
}

/**
 * Empuja un evento personalizado al dataLayer de GTM. Los triggers,
 * variables y tags correspondientes se configuran en
 * tagmanager.google.com — este helper solo dispara el evento.
 */
export function pushEvent(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined" || !EVENTS.has(event)) return false;
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ ...eventContext(params), event });
    return true;
  } catch {
    // La medición nunca impide mostrar el éxito ni enviar el evento Meta.
    return false;
  }
}

/** Solo después del guardado; la UI protege cada ID frente a efectos repetidos. */
export function pushLeadEvent(
  result: LeadResult,
  leadType: LeadType,
  params: Record<string, unknown> = {},
) {
  const eventId = confirmedLeadEventId(result);
  if (!eventId) return false;
  return pushEvent(leadType === "visit" ? "solicitud_visita" : "generate_lead", {
    ...params,
    ...(leadType === "seller"
      ? {
          property_id: null,
          property_title: null,
          operation: null,
          property_price: null,
          currency: null,
          interest: "venta",
        }
      : {}),
    event_id: eventId,
    lead_type: leadType,
    form_id: leadType === "visit" ? "visit_request" : leadType,
  });
}
