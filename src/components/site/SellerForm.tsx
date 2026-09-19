"use client";

import { useActionState, useEffect } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { submitSellerForm, type SellerFormState } from "@/lib/actions/seller";
import { pushEvent } from "@/lib/gtm";
import { trackMetaEvent } from "@/lib/meta";

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
  const [state, action, pending] = useActionState(submitSellerForm, INITIAL);

  useEffect(() => {
    if (state.status !== "success") return;
    // Reutiliza la conversión de GA4 ya publicada para todos los prospectos
    // y conserva el tipo de interés para distinguir a quien desea vender.
    pushEvent("generate_lead", {
      event_id: state.eventId,
      interest: "venta",
      lead_type: "seller",
    });
    trackMetaEvent(
      "Lead",
      { content_name: "Solicitud para vender propiedad" },
      state.eventId
    );
  }, [state.eventId, state.status]);

  if (state.status === "success") {
    return (
      <div className="rounded-xl bg-almendra/15 p-6 text-center">
        <CheckCircle2 className="mx-auto h-9 w-9 text-nogal" />
        <p className="mt-3 font-semibold text-nogal">Solicitud recibida</p>
        <p className="mt-1 text-sm text-humo">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="label">Nombre completo *</span>
          <input name="full_name" required className="field" placeholder="Tu nombre" />
        </label>
        <label className="block">
          <span className="label">Teléfono / WhatsApp *</span>
          <input name="phone" required inputMode="tel" className="field" placeholder="55 0000 0000" />
        </label>
      </div>
      <label className="block">
        <span className="label">Correo electrónico *</span>
        <input name="email" type="email" required className="field" placeholder="tu@correo.com" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="label">Tipo de propiedad *</span>
          <select name="property_type" required defaultValue="" className="field">
            <option value="" disabled>Selecciona una opción</option>
            {PROPERTY_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="label">Valor estimado (opcional)</span>
          <input name="estimated_value" className="field" placeholder="Ej. $3,500,000" />
        </label>
      </div>
      <label className="block">
        <span className="label">Colonia, alcaldía/municipio y estado *</span>
        <input name="location" required className="field" placeholder="Ej. Roma Norte, Cuauhtémoc, CDMX" />
      </label>
      <label className="block">
        <span className="label">Cuéntame un poco más (opcional)</span>
        <textarea name="message" rows={4} className="field resize-none" placeholder="Características, estado de la propiedad, plazo para vender..." />
      </label>
      {state.status === "error" && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.message}</p>
      )}
      <button type="submit" disabled={pending} className="btn-primary w-full py-3">
        <Send className="h-4 w-4" />
        {pending ? "Enviando…" : "Solicitar valuación"}
      </button>
      <p className="text-center text-[12px] text-humo">Tus datos se usarán únicamente para contactarte sobre tu propiedad.</p>
    </form>
  );
}
