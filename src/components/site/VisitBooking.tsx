"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  MapPin,
  Wallet,
  X,
} from "lucide-react";
import { requestVisit } from "@/lib/actions/visits";
import { pushEvent } from "@/lib/gtm";
import { trackMetaEvent } from "@/lib/meta";
import { FINANCING_LABELS, FINANCING_OPTIONS } from "@/lib/constants";
import { formatMexicanWhatsApp } from "@/lib/phone";
import type { FinancingMethod, Operation } from "@/lib/types";
import { cn, formatPrice } from "@/lib/format";

const OPEN_EVENT = "lt:open-visit-booking";

/** Abre el modal de solicitud desde cualquier parte de la ficha. */
export function openVisitBooking() {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT));
}

/** Botón reutilizable que abre el modal de solicitud. */
export function BookVisitButton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={openVisitBooking} className={className}>
      {children}
    </button>
  );
}

export function VisitBooking({
  propertyId,
  propertyTitle,
  operation,
  price,
  location,
}: {
  propertyId: string;
  propertyTitle: string;
  operation: Operation;
  price: number;
  location: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, handler);
    return () => window.removeEventListener(OPEN_EVENT, handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <div className="fixed bottom-4 left-4 right-24 z-40 animate-fade-up sm:bottom-5 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-2.5 rounded-full bg-petroleo px-6 py-3.5 text-sm font-semibold text-hueso shadow-floating transition-all duration-200 hover:-translate-y-0.5 hover:bg-sombra sm:w-auto"
        >
          <CalendarDays className="h-4 w-4" />
          Quiero que me contacten
          <span className="hidden pl-2.5 text-[13px] font-medium text-white/85 sm:inline">
            {formatPrice(price, operation)}
          </span>
        </button>
      </div>

      {open && (
        <VisitRequestModal
          propertyId={propertyId}
          propertyTitle={propertyTitle}
          operation={operation}
          price={price}
          location={location}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function VisitRequestModal({
  propertyId,
  propertyTitle,
  operation,
  price,
  location,
  onClose,
}: {
  propertyId: string;
  propertyTitle: string;
  operation: Operation;
  price: number;
  location: string;
  onClose: () => void;
}) {
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    financing: (operation === "renta"
      ? "no_aplica"
      : "por_definir") as FinancingMethod,
    message: "",
    company: "",
  });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = modalRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function validate() {
    if (form.full_name.trim().length < 2) {
      return "Escribe tu nombre completo.";
    }
    if (!formatMexicanWhatsApp(form.phone)) {
      return "Escribe un WhatsApp de México de 10 dígitos. Puedes incluir +52.";
    }
    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      return "Escribe un correo electrónico válido.";
    }
    return "";
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }

    setPending(true);
    setError("");
    const result = await requestVisit({
      property_id: propertyId,
      full_name: form.full_name,
      phone: form.phone,
      email: form.email,
      financing: form.financing,
      message: form.message,
      company: form.company,
      source_url: `${window.location.origin}${window.location.pathname}`,
    });
    setPending(false);

    if (!result.ok) {
      setError(
        result.error ?? "No pude enviar tu solicitud. Intenta de nuevo.",
      );
      return;
    }

    const eventParams = {
      property_id: propertyId,
      property_title: propertyTitle,
      operation,
      financing: form.financing,
      value: price,
      currency: "MXN",
      event_id: result.eventId,
    };
    if (result.eventId) {
      pushEvent("solicitud_visita", eventParams);
      trackMetaEvent(
        "Lead",
        {
          content_ids: [propertyId],
          content_name: "Solicitud de visita",
          content_category: "visit_request",
          content_type: "product",
        },
        result.eventId,
      );
    }
    setDone(true);
  }

  return (
    <dialog
      ref={modalRef}
      aria-label="Quiero que me contacten para agendar"
      onCancel={onClose}
      className="fixed inset-0 z-[90] m-0 flex h-full max-h-none w-full max-w-none items-end justify-center bg-carbon/55 p-0 backdrop-blur-sm animate-fade-in sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-xl bg-papel shadow-floating animate-fade-up sm:rounded-xl"
      >
        <div className="border-b border-lino px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="eyebrow">Solicitud de visita</p>
              <p className="mt-1 truncate text-[15px] font-semibold text-carbon">
                {propertyTitle}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[12px] text-humo">
                <MapPin className="h-3 w-3 shrink-0 text-bruma" />
                <span className="truncate">{location}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-humo transition-colors hover:bg-nieve"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {done ? (
          <div className="px-5 py-8 text-center sm:px-6">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-almendra/15 text-nogal">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <h3 className="mt-4 text-xl font-semibold text-carbon">
              Recibí tu solicitud
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-humo">
              Te escribiré por WhatsApp para agendar la visita. Aún no es una
              cita confirmada.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="btn-primary mt-6 px-5 py-2.5"
            >
              Entendido
            </button>
          </div>
        ) : (
          <form onSubmit={(event) => void submit(event)} className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              <div className="rounded-lg bg-almendra/10 p-4 text-sm leading-relaxed text-petroleo">
                <p className="font-semibold">Quiero que me contacten para agendar</p>
                <p className="mt-1 text-petroleo/80">
                  No necesitas elegir fecha. Deja tu WhatsApp y te contacto
                  para cuadrar la visita.
                </p>
              </div>

              <div className="mt-4 space-y-3.5">
                <input
                  type="text"
                  value={form.company}
                  onChange={(event) => set("company", event.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />
                <label className="block">
                  <span className="label">Nombre completo *</span>
                  <input
                    value={form.full_name}
                    onChange={(event) => set("full_name", event.target.value)}
                    className="field"
                    placeholder="Tu nombre"
                    autoComplete="name"
                    autoFocus
                    required
                  />
                </label>
                <div className="grid gap-3.5 sm:grid-cols-2">
                  <label className="block">
                    <span className="label">WhatsApp *</span>
                    <input
                      value={form.phone}
                      onChange={(event) => set("phone", event.target.value)}
                      className="field"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="+52 55 1234 5678"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="label">Correo electrónico (opcional)</span>
                    <input
                      value={form.email}
                      onChange={(event) => set("email", event.target.value)}
                      type="email"
                      autoComplete="email"
                      className="field"
                      placeholder="tu@correo.com"
                    />
                  </label>
                </div>
                {operation === "venta" && (
                  <div>
                    <span className="label flex items-center gap-1.5">
                      <Wallet className="h-3.5 w-3.5 text-nogal" />
                      ¿Cómo planeas financiar la compra?
                    </span>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {FINANCING_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => set("financing", option)}
                          className={cn(
                            "rounded-md border px-3 py-2.5 text-left text-[13px] font-medium transition-all",
                            form.financing === option
                              ? "border-petroleo bg-petroleo/8 text-petroleo"
                              : "border-lino bg-papel text-humo hover:border-almendra hover:text-carbon",
                          )}
                        >
                          {FINANCING_LABELS[option]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <label className="block">
                  <span className="label">Mensaje (opcional)</span>
                  <textarea
                    value={form.message}
                    onChange={(event) => set("message", event.target.value)}
                    rows={2}
                    className="field resize-none"
                    placeholder="¿Hay algo que deba saber antes de contactarte?"
                  />
                </label>
              </div>

              {error && (
                <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {error}
                </p>
              )}
            </div>

            <div className="border-t border-lino px-5 py-4 sm:px-6">
              <button
                type="submit"
                disabled={pending}
                className="btn-primary w-full py-3"
              >
                {pending ? "Enviando…" : "Quiero que me contacten para agendar"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}
