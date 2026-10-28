"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import {
  submitContactForm,
  type ContactFormState,
} from "@/lib/actions/contact";
import { CONTACT_INTEREST_LABELS } from "@/lib/constants";
import { confirmedLeadEventId, pushLeadEvent } from "@/lib/gtm";
import { trackMetaEvent } from "@/lib/meta";
import type { ContactInterest } from "@/lib/types";
import { usePathname } from "next/navigation";
import { SITE_URL } from "@/lib/supabase/config";
import { attachLeadSubmission, finishLeadSubmission } from "@/lib/acquisition-browser";
import { preserveFormDraft } from "@/lib/form-draft";

const INITIAL: ContactFormState = { status: "idle", message: "" };

export function ContactForm({
  propertyId,
  propertyTitle,
  defaultInterest = "compra",
  compact = false,
}: {
  propertyId?: string;
  propertyTitle?: string;
  defaultInterest?: ContactInterest;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const submissionKey = `contact:${pathname}:${propertyId ?? "general"}`;
  const [state, action, pending] = useActionState(
    async (previous: ContactFormState, data: FormData) => {
      if (previous.retryConflict) finishLeadSubmission(submissionKey);
      attachLeadSubmission(data, submissionKey);
      try {
        const result = await submitContactForm(previous, data);
        if (result.status === "success" && result.eventId) finishLeadSubmission(submissionKey);
        return result;
      } catch {
        return { status: "error", message: "No pude confirmar el envío. Intenta de nuevo con los mismos datos." } satisfies ContactFormState;
      }
    },
    INITIAL
  );
  const [draft, setDraft] = useState({
    full_name: "", phone: "", email: "", interest: defaultInterest,
    message: "", company: "",
  });
  const trackedEventId = useRef<string | null>(null);

  function setField<K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  useEffect(() => {
    const result = { status: state.status, eventId: state.eventId };
    const eventId = confirmedLeadEventId(result);
    if (eventId && state.interest && trackedEventId.current !== eventId) {
      trackedEventId.current = eventId;
      pushLeadEvent(result, "contact", {
        interest: state.interest,
        property_id: state.propertyId,
        property_title: state.propertyId === propertyId ? propertyTitle : null,
      });
      trackMetaEvent(
        "ContactLead",
        {
          content_name: `Contacto web · ${state.interest}`,
          content_category: "contact_request",
          ...(state.propertyId ? { content_ids: [state.propertyId], content_type: "product" } : {}),
        },
        eventId
      );
    }
  }, [state.status, state.eventId, state.interest, state.propertyId, propertyId, propertyTitle]);

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-xl bg-almendra/15 p-6 text-center">
        <CheckCircle2 className="mx-auto h-9 w-9 text-nogal" />
        <p className="mt-3 font-semibold text-nogal">Mensaje enviado</p>
        <p className="mt-1 text-sm text-humo">{state.message}</p>
      </div>
    );
  }

  return (
    <form ref={preserveFormDraft} action={action} className="space-y-3.5">
      <input type="hidden" name="source_url" value={`${SITE_URL}${pathname}`} />
      {propertyId && (
        <input type="hidden" name="property_id" value={propertyId} />
      )}
      {/* Honeypot anti-spam */}
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

      {propertyTitle && (
        <p className="rounded-md bg-nieve px-3 py-2 text-[13px] text-humo">
          Sobre: <span className="font-medium text-carbon">{propertyTitle}</span>
        </p>
      )}

      <div className={compact ? "space-y-3.5" : "grid gap-3.5 sm:grid-cols-2"}>
        <label className="block">
          <span className="label">Nombre completo</span>
          <input
            name="full_name"
            value={draft.full_name}
            onChange={(event) => setField("full_name", event.target.value)}
            required
            className="field"
            placeholder="Tu nombre"
          />
        </label>
        <label className="block">
          <span className="label">Teléfono / WhatsApp</span>
          <input
            name="phone"
            value={draft.phone}
            onChange={(event) => setField("phone", event.target.value)}
            required
            className="field"
            placeholder="55 0000 0000"
          />
        </label>
      </div>

      <label className="block">
        <span className="label">Correo electrónico</span>
          <input
            name="email"
            value={draft.email}
            onChange={(event) => setField("email", event.target.value)}
            type="email"
            required
          className="field"
          placeholder="tu@correo.com"
        />
      </label>

      <label className="block">
        <span className="label">Me interesa</span>
        <select
          name="interest"
          value={draft.interest}
          onChange={(event) => setField("interest", event.target.value as ContactInterest)}
          className="field"
        >
          {(
            Object.keys(CONTACT_INTEREST_LABELS) as ContactInterest[]
          ).map((k) => (
            <option key={k} value={k}>
              {CONTACT_INTEREST_LABELS[k]}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="label">Mensaje</span>
        <textarea
          name="message"
          value={draft.message}
          onChange={(event) => setField("message", event.target.value)}
          rows={compact ? 3 : 4}
          className="field resize-none"
          placeholder="Cuéntame qué buscas y en qué te puedo ayudar."
        />
      </label>

      {state.status === "error" && (
        <p role="alert" className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full py-3"
      >
        {pending ? (
          "Enviando…"
        ) : (
          <>
            <Send className="h-4 w-4" />
            {state.retryConflict ? "Enviar como nueva solicitud" : "Enviar mensaje"}
          </>
        )}
      </button>
      <p className="text-center text-[12px] text-humo">
        Te responderé personalmente. Tus datos son privados.
      </p>
    </form>
  );
}
