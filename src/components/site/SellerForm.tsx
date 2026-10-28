"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { submitSellerForm, type SellerFormState } from "@/lib/actions/seller";
import { confirmedLeadEventId, pushLeadEvent } from "@/lib/gtm";
import { trackMetaEvent } from "@/lib/meta";
import { attachLeadSubmission, finishLeadSubmission } from "@/lib/acquisition-browser";
import { preserveFormDraft } from "@/lib/form-draft";

const INITIAL: SellerFormState = { status: "idle", message: "" };

const PROPERTY_TYPES = [
  "Casa",
  "Departamento",
  "Terreno",
  "Oficina",
  "Local comercial",
  "Bodega",
  "Otro",
];

export function SellerForm() {
  const [state, action, pending] = useActionState(async (previous: SellerFormState, data: FormData) => {
    if (previous.retryConflict) finishLeadSubmission("seller");
    attachLeadSubmission(data, "seller");
    try {
      const result = await submitSellerForm(previous, data);
      if (result.status === "success" && result.eventId) finishLeadSubmission("seller");
      return result;
    } catch {
      return { status: "error", message: "No pude confirmar el envío. Intenta de nuevo con los mismos datos." } satisfies SellerFormState;
    }
  }, INITIAL);
  const [draft, setDraft] = useState({
    full_name: "", phone: "", email: "", property_type: "", location: "",
    estimated_value: "", message: "", company: "",
  });
  const trackedEventId = useRef<string | null>(null);

  function setField<K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  useEffect(() => {
    const result = { status: state.status, eventId: state.eventId };
    const eventId = confirmedLeadEventId(result);
    if (!eventId || trackedEventId.current === eventId) return;
    trackedEventId.current = eventId;
    // Reutiliza la conversión de GA4 ya publicada para todos los prospectos
    // y conserva el tipo de interés para distinguir a quien desea vender.
    pushLeadEvent(result, "seller");
    trackMetaEvent(
      "SellerLead",
      { content_name: "Solicitud para vender propiedad", content_category: "seller_request" },
      eventId
    );
  }, [state.eventId, state.status]);

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-xl bg-almendra/15 p-6 text-center">
        <CheckCircle2 className="mx-auto h-9 w-9 text-nogal" />
        <p className="mt-3 font-semibold text-nogal">Solicitud recibida</p>
        <p className="mt-1 text-sm text-humo">{state.message}</p>
      </div>
    );
  }

  return (
    <form ref={preserveFormDraft} action={action} className="space-y-4">
      <input
        type="text"
        name="company"
        value={draft.company}
        onChange={(event) => setField("company", event.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="label">Nombre completo *</span>
          <input name="full_name" value={draft.full_name} onChange={(event) => setField("full_name", event.target.value)} required className="field" placeholder="Tu nombre" />
        </label>
        <label className="block">
          <span className="label">Teléfono / WhatsApp *</span>
          <input name="phone" value={draft.phone} onChange={(event) => setField("phone", event.target.value)} required inputMode="tel" className="field" placeholder="55 0000 0000" />
        </label>
      </div>
      <label className="block">
        <span className="label">Correo electrónico *</span>
        <input name="email" value={draft.email} onChange={(event) => setField("email", event.target.value)} type="email" required className="field" placeholder="tu@correo.com" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="label">Tipo de propiedad *</span>
          <select name="property_type" value={draft.property_type} onChange={(event) => setField("property_type", event.target.value)} required className="field">
            <option value="" disabled>Selecciona una opción</option>
            {PROPERTY_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="label">Valor estimado (opcional)</span>
          <input name="estimated_value" value={draft.estimated_value} onChange={(event) => setField("estimated_value", event.target.value)} className="field" placeholder="Ej. $3,500,000" />
        </label>
      </div>
      <label className="block">
        <span className="label">Colonia, alcaldía/municipio y estado *</span>
        <input name="location" value={draft.location} onChange={(event) => setField("location", event.target.value)} required className="field" placeholder="Ej. Roma Norte, Cuauhtémoc, CDMX" />
      </label>
      <label className="block">
        <span className="label">Cuéntame un poco más (opcional)</span>
        <textarea name="message" value={draft.message} onChange={(event) => setField("message", event.target.value)} rows={4} className="field resize-none" placeholder="Características, estado de la propiedad, plazo para vender..." />
      </label>
      {state.status === "error" && (
        <p role="alert" className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.message}</p>
      )}
      <button type="submit" disabled={pending} className="btn-primary w-full py-3">
        <Send className="h-4 w-4" />
        {pending ? "Enviando…" : state.retryConflict ? "Enviar como nueva solicitud" : "Solicitar valuación"}
      </button>
      <p className="text-center text-[12px] text-humo">Tus datos se usarán únicamente para contactarte sobre tu propiedad.</p>
    </form>
  );
}
