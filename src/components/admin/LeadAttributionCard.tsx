import type { LeadAttribution } from "@/lib/lead-attribution-report";
import { ACQUISITION_LABELS } from "@/lib/lead-attribution-report";
import type { AcquisitionTouch } from "@/lib/acquisition";

function Touch({ label, touch }: { label: string; touch: AcquisitionTouch | null }) {
  return <div className="border-t border-linea pt-3">
    <dt className="text-xs font-semibold text-carbon">{label}</dt>
    <dd className="mt-1 break-words text-xs text-humo">
      {touch ? <>
        <p>{ACQUISITION_LABELS[touch.channel]}</p>
        <p>{touch.landing_path}</p>
        {touch.referrer_host && <p>Referente: {touch.referrer_host}</p>}
        {(touch.utm_source || touch.utm_medium) && <p>UTM: {[touch.utm_source, touch.utm_medium].filter(Boolean).join(" / ")}</p>}
        {touch.utm_campaign && <p>Campaña: {touch.utm_campaign}</p>}
        {touch.utm_content && <p>Contenido: {touch.utm_content}</p>}
        {touch.utm_term && <p>Término etiquetado: {touch.utm_term}</p>}
        <p>{new Date(touch.observed_at).toLocaleString("es-MX", { timeZone: "America/Mexico_City" })}</p>
      </> : "Sin evidencia conservada"}
    </dd>
  </div>;
}

/** Server-rendered inside the authenticated CRM; never mounts marketing tags. */
export function LeadAttributionCard({ receipt, leadId, available }: { receipt?: LeadAttribution; leadId: string; available: boolean }) {
  const formLabels = { contact: "Contacto", seller: "Propietario vendedor", visit: "Solicitud de visita" };
  return <section className="rounded-xl bg-papel p-5 shadow-soft">
    <h3 className="text-sm font-semibold text-carbon">Adquisición del contacto</h3>
    <p className="mt-2 text-xs text-humo">{!available ? "La adquisición no está disponible en este momento. Vuelve a cargar la ficha para intentarlo de nuevo." : receipt ? "Señal reportada por la pestaña del visitante durante las 24 horas previas al envío. Confianza limitada: no demuestra causalidad ni une otros dispositivos." : "Origen desconocido. Sin recibo de adquisición; no se reconstruye por fecha ni campaña."}</p>
    <dl className="mt-3 space-y-3">
      <div className="break-all text-xs"><dt className="text-humo">ID del contacto</dt><dd>{leadId}</dd></div>
      {available && receipt && <>
        <div className="break-all text-xs"><dt className="text-humo">ID del evento aceptado</dt><dd>{receipt.event_id}</dd></div>
        <div className="text-xs"><dt className="text-humo">Formulario</dt><dd>{formLabels[receipt.lead_type]}</dd></div>
        <Touch label="Primera llegada observada" touch={receipt.acquisition.first_touch} />
        <Touch label="Última llegada observada" touch={receipt.acquisition.last_touch} />
        <div className="break-words text-xs"><dt className="text-humo">Página del envío</dt><dd>{receipt.acquisition.conversion_path ?? "Desconocida"}</dd></div>
      </>}
    </dl>
  </section>;
}
