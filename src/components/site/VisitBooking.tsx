"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  Wallet,
  X,
} from "lucide-react";
import { requestVisit } from "@/lib/actions/visits";
import { pushEvent } from "@/lib/gtm";
import { trackMetaEvent } from "@/lib/meta";
import { FINANCING_LABELS, FINANCING_OPTIONS } from "@/lib/constants";
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

function toLocalDateInput(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

type Step = "datos" | "visita" | "confirmar" | "listo";

const STEPS: { id: Exclude<Step, "listo">; label: string }[] = [
  { id: "datos", label: "Tus datos" },
  { id: "visita", label: "Preferencia" },
  { id: "confirmar", label: "Enviar" },
];

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
          Solicitar visita
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
  const [step, setStep] = useState<Step>("datos");
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    financing: (operation === "renta"
      ? "no_aplica"
      : "por_definir") as FinancingMethod,
    preferred_date: "",
    preferred_time: "",
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

  useEffect(() => {
    const body = modalRef.current?.querySelector<HTMLElement>(
      "[data-step-content]",
    );
    const firstField = body?.querySelector<HTMLElement>(
      'input:not([aria-hidden="true"]), select, textarea',
    );
    (firstField ?? body)?.focus();
  }, [step]);

  const today = new Date();
  const minimumDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1,
  );
  const maximumDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 90,
  );
  const stepIndex = STEPS.findIndex((item) => item.id === step);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function goToPreference() {
    setError("");
    if (!form.full_name.trim() || !form.phone.trim() || !form.email.trim()) {
      setError(
        "Completa nombre, teléfono y correo para poder confirmar disponibilidad.",
      );
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Escribe un correo electrónico válido.");
      return;
    }
    if (!/^\d{10,15}$/.test(form.phone.replace(/\D/g, ""))) {
      setError("Escribe un teléfono válido de 10 a 15 dígitos.");
      return;
    }
    setStep("visita");
  }

  function goToConfirm() {
    setError("");
    if (!form.preferred_date || !form.preferred_time) {
      setError("Indica la fecha y el horario que prefieres.");
      return;
    }
    if (
      form.preferred_date < toLocalDateInput(minimumDate) ||
      form.preferred_date > toLocalDateInput(maximumDate)
    ) {
      setError("Elige una fecha entre mañana y los próximos 90 días.");
      return;
    }
    setStep("confirmar");
  }

  async function submit() {
    setPending(true);
    setError("");
    const result = await requestVisit({
      property_id: propertyId,
      preferred_date: form.preferred_date,
      preferred_time: form.preferred_time,
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
    setStep("listo");
  }

  return (
    <dialog
      ref={modalRef}
      aria-label="Solicitar visita"
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
          {step !== "listo" && (
            <ol className="mt-4 flex items-center gap-2">
              {STEPS.map((item, index) => (
                <li key={item.id} className="flex flex-1 items-center gap-2">
                  <span
                    className={cn(
                      "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold",
                      index <= stepIndex
                        ? "bg-petroleo text-hueso"
                        : "bg-lino text-humo",
                    )}
                  >
                    {index + 1}
                  </span>
                  <span
                    className={cn(
                      "hidden text-[12px] font-medium sm:block",
                      index === stepIndex ? "text-carbon" : "text-humo",
                    )}
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div
          data-step-content
          tabIndex={-1}
          className="flex-1 overflow-y-auto px-5 py-5 sm:px-6"
        >
          {step === "datos" && (
            <div className="space-y-3.5">
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
                  autoFocus
                  required
                />
              </label>
              <div className="grid gap-3.5 sm:grid-cols-2">
                <label className="block">
                  <span className="label">Teléfono / WhatsApp *</span>
                  <input
                    value={form.phone}
                    onChange={(event) => set("phone", event.target.value)}
                    className="field"
                    inputMode="tel"
                    placeholder="55 0000 0000"
                    required
                  />
                </label>
                <label className="block">
                  <span className="label">Correo electrónico *</span>
                  <input
                    value={form.email}
                    onChange={(event) => set("email", event.target.value)}
                    type="email"
                    className="field"
                    placeholder="tu@correo.com"
                    required
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
                  rows={3}
                  className="field resize-none"
                  placeholder="¿Hay algo que deba saber antes de contactarte?"
                />
              </label>
            </div>
          )}

          {step === "visita" && (
            <div className="space-y-5">
              <div className="rounded-lg bg-almendra/10 p-4 text-sm leading-relaxed text-petroleo">
                <p className="font-semibold">Elige tu preferencia</p>
                <p className="mt-1 text-petroleo/80">
                  Esto es una solicitud, no una cita confirmada. Revisaremos la
                  disponibilidad con el propietario y te confirmaremos por
                  WhatsApp o correo.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="label">Fecha preferida *</span>
                  <input
                    value={form.preferred_date}
                    onInput={(event) =>
                      set("preferred_date", event.currentTarget.value)
                    }
                    onChange={(event) =>
                      set("preferred_date", event.target.value)
                    }
                    type="date"
                    min={toLocalDateInput(minimumDate)}
                    max={toLocalDateInput(maximumDate)}
                    className="field"
                    required
                  />
                </label>
                <label className="block">
                  <span className="label">Horario preferido *</span>
                  <span className="relative block">
                    <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bruma" />
                    <input
                      value={form.preferred_time}
                      onInput={(event) =>
                        set("preferred_time", event.currentTarget.value)
                      }
                      onChange={(event) =>
                        set("preferred_time", event.target.value)
                      }
                      type="time"
                      className="field pl-9"
                      required
                    />
                  </span>
                </label>
              </div>
              <p className="text-[13px] leading-relaxed text-humo">
                Si ese horario no está disponible, te propondremos alternativas
                antes de agendar cualquier visita.
              </p>
            </div>
          )}

          {step === "confirmar" && (
            <div className="space-y-4">
              <div className="rounded-xl bg-nieve p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-humo">
                  Solicitud para
                </p>
                <p className="mt-1 text-sm font-semibold text-carbon">
                  {propertyTitle}
                </p>
                <dl className="mt-4 space-y-2 text-[13px]">
                  <div className="flex justify-between gap-4">
                    <dt className="text-humo">Nombre</dt>
                    <dd className="text-right font-medium text-carbon">
                      {form.full_name}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-humo">Contacto</dt>
                    <dd className="text-right font-medium text-carbon">
                      {form.phone}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-humo">Fecha preferida</dt>
                    <dd className="text-right font-medium text-carbon">
                      {new Date(
                        `${form.preferred_date}T12:00:00`,
                      ).toLocaleDateString("es-MX", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-humo">Horario</dt>
                    <dd className="text-right font-medium text-carbon">
                      {form.preferred_time}
                    </dd>
                  </div>
                </dl>
              </div>
              <p className="rounded-md bg-almendra/10 px-3 py-3 text-[13px] leading-relaxed text-petroleo">
                Al enviar, nos pides revisar ese horario. La visita queda
                pendiente de confirmación y no se agenda automáticamente.
              </p>
            </div>
          )}

          {step === "listo" && (
            <div className="py-6 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-almendra/15 text-nogal">
                <CheckCircle2 className="h-7 w-7" />
              </span>
              <h3 className="mt-4 text-xl font-semibold text-carbon">
                Recibí tu solicitud
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-humo">
                Revisaré la disponibilidad con el propietario y te confirmaré
                por WhatsApp o correo. Aún no es una cita confirmada.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="btn-primary mt-6 px-5 py-2.5"
              >
                Entendido
              </button>
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}
        </div>

        {step !== "listo" && (
          <div className="flex items-center justify-between gap-3 border-t border-lino px-5 py-4 sm:px-6">
            {step === "datos" ? (
              <span />
            ) : (
              <button
                type="button"
                onClick={() => setStep(step === "visita" ? "datos" : "visita")}
                disabled={pending}
                className="btn px-4 py-2.5 text-carbon hover:bg-nieve"
              >
                <ArrowLeft className="h-4 w-4" />
                Regresar
              </button>
            )}
            {step === "datos" && (
              <button
                type="button"
                onClick={goToPreference}
                className="btn-primary px-4 py-2.5"
              >
                Continuar
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
            {step === "visita" && (
              <button
                type="button"
                onClick={goToConfirm}
                className="btn-primary px-4 py-2.5"
              >
                Revisar solicitud
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
            {step === "confirmar" && (
              <button
                type="button"
                onClick={() => void submit()}
                disabled={pending}
                className="btn-primary px-4 py-2.5"
              >
                {pending ? "Enviando…" : "Enviar solicitud"}
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </dialog>
  );
}
