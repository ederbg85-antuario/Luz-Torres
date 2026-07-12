"use client";

import { useActionState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import {
  submitContactForm,
  type ContactFormState,
} from "@/lib/actions/contact";
import { CONTACT_INTEREST_LABELS } from "@/lib/constants";
import type { ContactInterest } from "@/lib/types";

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
  const [state, action, pending] = useActionState(
    submitContactForm,
    INITIAL
  );

  if (state.status === "success") {
    return (
      <div className="rounded-xl bg-almendra/15 p-6 text-center">
        <CheckCircle2 className="mx-auto h-9 w-9 text-nogal" />
        <p className="mt-3 font-semibold text-nogal">Mensaje enviado</p>
        <p className="mt-1 text-sm text-humo">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-3.5">
      {propertyId && (
        <input type="hidden" name="property_id" value={propertyId} />
      )}
      {/* Honeypot anti-spam */}
      <input
        type="text"
        name="company"
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
            required
            className="field"
            placeholder="Tu nombre"
          />
        </label>
        <label className="block">
          <span className="label">Teléfono / WhatsApp</span>
          <input
            name="phone"
            className="field"
            placeholder="55 0000 0000"
          />
        </label>
      </div>

      <label className="block">
        <span className="label">Correo electrónico</span>
        <input
          name="email"
          type="email"
          className="field"
          placeholder="tu@correo.com"
        />
      </label>

      <label className="block">
        <span className="label">Me interesa</span>
        <select
          name="interest"
          defaultValue={defaultInterest}
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
          rows={compact ? 3 : 4}
          className="field resize-none"
          placeholder="Cuéntame qué buscas y en qué te puedo ayudar."
        />
      </label>

      {state.status === "error" && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
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
            Enviar mensaje
          </>
        )}
      </button>
      <p className="text-center text-[12px] text-humo">
        Te responderé personalmente. Tus datos son privados.
      </p>
    </form>
  );
}
