"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  Wallet,
  X,
} from "lucide-react";
import {
  bookVisit,
  fetchVisitAvailability,
  type VisitAvailability,
} from "@/lib/actions/visits";
import {
  FINANCING_LABELS,
  FINANCING_OPTIONS,
  VISIT_SLOT_MINUTES,
} from "@/lib/constants";
import type { FinancingMethod, Operation } from "@/lib/types";
import { cn, formatPrice } from "@/lib/format";

const OPEN_EVENT = "lt:open-visit-booking";

/** Abre el modal de reserva desde cualquier parte de la ficha. */
export function openVisitBooking() {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT));
}

/** Botón reutilizable que abre el modal (sidebar, secciones, etc.). */
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

// ─── Utilidades de fecha (todo en hora local del navegador) ─────

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function dateKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function parseTime(t: string): number {
  const [h, m] = t.split(":");
  return Number(h) * 60 + Number(m);
}
function sameDay(a: Date, b: Date) {
  return dateKey(a) === dateKey(b);
}

type Slot = { date: Date; label: string };

/** Horas libres de un día según reglas, bloqueos y agenda ocupada. */
function daySlots(day: Date, avail: VisitAvailability): Slot[] {
  const isodow = ((day.getDay() + 6) % 7) + 1;
  const rule = avail.rules.find((r) => r.weekday === isodow && r.enabled);
  if (!rule) return [];

  const key = dateKey(day);
  const blocks = avail.blocked.filter((b) => b.date === key);
  if (blocks.some((b) => b.start_time === null)) return [];

  const minStart = Date.now() + 2 * 3_600_000; // misma antelación que book_visit
  const maxStart = Date.now() + 90 * 86_400_000;
  const slots: Slot[] = [];

  for (
    let m = parseTime(rule.start_time);
    m + VISIT_SLOT_MINUTES <= parseTime(rule.end_time);
    m += VISIT_SLOT_MINUTES
  ) {
    const start = new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      Math.floor(m / 60),
      m % 60
    );
    const end = new Date(start.getTime() + VISIT_SLOT_MINUTES * 60_000);

    if (start.getTime() < minStart || start.getTime() > maxStart) continue;
    if (
      blocks.some((b) => {
        const bs = parseTime(b.start_time!);
        const be = b.end_time ? parseTime(b.end_time) : bs + VISIT_SLOT_MINUTES;
        return m < be && m + VISIT_SLOT_MINUTES > bs;
      })
    )
      continue;
    if (
      avail.taken.some(
        (t) =>
          new Date(t.starts_at).getTime() < end.getTime() &&
          new Date(t.ends_at).getTime() > start.getTime()
      )
    )
      continue;

    slots.push({
      date: start,
      label: start.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
  }
  return slots;
}

// ─── Componente principal ───────────────────────────────────────

type Step = "datos" | "horario" | "confirmar" | "listo";

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
    const handler = () => {
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, handler);
    return () => window.removeEventListener(OPEN_EVENT, handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      {/* Botón fijo — solo vive en la ficha de la propiedad */}
      <div className="fixed bottom-4 left-4 right-24 z-40 sm:bottom-5 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 animate-fade-up">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-2.5 rounded-full bg-petroleo px-6 py-3.5 text-sm font-semibold text-hueso shadow-floating transition-all duration-200 hover:-translate-y-0.5 hover:bg-sombra sm:w-auto"
        >
          <CalendarDays className="h-4 w-4" />
          Agendar visita
          <span className="hidden border-l border-hueso/25 pl-2.5 font-mono text-[13px] font-medium text-hueso/85 sm:inline">
            {formatPrice(price, operation)}
          </span>
        </button>
      </div>

      {open && (
        <BookingModal
          propertyId={propertyId}
          propertyTitle={propertyTitle}
          operation={operation}
          location={location}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

// ─── Modal ──────────────────────────────────────────────────────

const STEPS: { id: Step; label: string }[] = [
  { id: "datos", label: "Tus datos" },
  { id: "horario", label: "Fecha y hora" },
  { id: "confirmar", label: "Confirmar" },
];

function BookingModal({
  propertyId,
  propertyTitle,
  operation,
  location,
  onClose,
}: {
  propertyId: string;
  propertyTitle: string;
  operation: Operation;
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
    message: "",
    company: "", // honeypot
  });
  const [formError, setFormError] = useState("");

  const today = new Date();
  const [cursor, setCursor] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  // Disponibilidad por mes, con caché para no repetir viajes.
  const [availability, setAvailability] = useState<VisitAvailability | null>(
    null
  );
  const [loadingMonth, setLoadingMonth] = useState(false);
  const cache = useRef<Map<string, VisitAvailability>>(new Map());

  const monthKey = `${cursor.getFullYear()}-${cursor.getMonth()}`;

  const loadMonth = useCallback(async () => {
    const cached = cache.current.get(monthKey);
    if (cached) {
      setAvailability(cached);
      return;
    }
    setLoadingMonth(true);
    const from = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const to = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    const data = await fetchVisitAvailability(
      from.toISOString(),
      to.toISOString()
    );
    cache.current.set(monthKey, data);
    setAvailability(data);
    setLoadingMonth(false);
  }, [cursor, monthKey]);

  useEffect(() => {
    if (step === "horario") void loadMonth();
  }, [step, loadMonth]);

  const [pending, setPending] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function nextFromDatos() {
    setFormError("");
    if (!form.full_name.trim()) {
      setFormError("Escribe tu nombre completo.");
      return;
    }
    if (!form.phone.trim() && !form.email.trim()) {
      setFormError("Deja un teléfono o un correo para confirmarte la visita.");
      return;
    }
    setStep("horario");
  }

  async function confirm() {
    if (!selectedSlot) return;
    setPending(true);
    setSubmitError("");
    const res = await bookVisit({
      property_id: propertyId,
      starts_at: selectedSlot.date.toISOString(),
      full_name: form.full_name,
      phone: form.phone,
      email: form.email,
      financing: form.financing,
      message: form.message,
      company: form.company,
    });
    setPending(false);
    if (res.ok) {
      setStep("listo");
    } else {
      setSubmitError(res.error ?? "No se pudo agendar la visita.");
      // Si el horario se ocupó, refrescamos el mes.
      cache.current.delete(monthKey);
    }
  }

  const grid = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    return Array.from(
      { length: 42 },
      (_, i) => new Date(cursor.getFullYear(), cursor.getMonth(), 1 - offset + i)
    );
  }, [cursor]);

  const slots = useMemo(
    () =>
      selectedDay && availability ? daySlots(selectedDay, availability) : [],
    [selectedDay, availability]
  );

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-carbon/55 backdrop-blur-sm animate-fade-in sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Agendar visita"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-xl bg-papel shadow-floating animate-fade-up sm:rounded-xl"
      >
        {/* Encabezado */}
        <div className="border-b border-lino px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="eyebrow">Agendar visita</p>
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

          {/* Pasos */}
          {step !== "listo" && (
            <ol className="mt-4 flex items-center gap-2">
              {STEPS.map((s, i) => (
                <li key={s.id} className="flex flex-1 items-center gap-2">
                  <span
                    className={cn(
                      "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold",
                      i < stepIndex
                        ? "bg-petroleo text-hueso"
                        : i === stepIndex
                          ? "bg-petroleo text-hueso ring-4 ring-petroleo/15"
                          : "bg-lino text-humo"
                    )}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={cn(
                      "hidden text-[12px] font-medium sm:block",
                      i === stepIndex ? "text-carbon" : "text-humo"
                    )}
                  >
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <span className="h-px flex-1 bg-lino" />
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {step === "datos" && (
            <div className="space-y-3.5">
              {/* Honeypot anti-spam */}
              <input
                type="text"
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              <label className="block">
                <span className="label">Nombre completo *</span>
                <input
                  value={form.full_name}
                  onChange={(e) => set("full_name", e.target.value)}
                  className="field"
                  placeholder="Tu nombre"
                  autoFocus
                />
              </label>

              <div className="grid gap-3.5 sm:grid-cols-2">
                <label className="block">
                  <span className="label">Teléfono / WhatsApp</span>
                  <input
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    className="field"
                    inputMode="tel"
                    placeholder="55 0000 0000"
                  />
                </label>
                <label className="block">
                  <span className="label">Correo electrónico</span>
                  <input
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    type="email"
                    className="field"
                    placeholder="tu@correo.com"
                  />
                </label>
              </div>

              {operation === "venta" && (
                <div>
                  <span className="label flex items-center gap-1.5">
                    <Wallet className="h-3.5 w-3.5 text-nogal" />
                    ¿Cómo piensas financiar la compra? *
                  </span>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {FINANCING_OPTIONS.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => set("financing", f)}
                        className={cn(
                          "rounded-md border px-3 py-2.5 text-left text-[13px] font-medium transition-all",
                          form.financing === f
                            ? "border-petroleo bg-petroleo/8 text-petroleo"
                            : "border-lino bg-papel text-humo hover:border-almendra hover:text-carbon"
                        )}
                      >
                        {FINANCING_LABELS[f]}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[12px] text-humo">
                    Esto me ayuda a preparar tu visita y orientarte mejor sobre
                    el proceso.
                  </p>
                </div>
              )}

              <label className="block">
                <span className="label">Mensaje (opcional)</span>
                <textarea
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                  rows={2}
                  className="field resize-none"
                  placeholder="Cuéntame qué buscas o si tienes alguna duda."
                />
              </label>

              {formError && (
                <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {formError}
                </p>
              )}
            </div>
          )}

          {step === "horario" && (
            <div>
              {/* Navegación del mes */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold capitalize text-carbon">
                  {cursor.toLocaleDateString("es-MX", {
                    month: "long",
                    year: "numeric",
                  })}
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCursor(
                        new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1)
                      );
                      setSelectedDay(null);
                      setSelectedSlot(null);
                    }}
                    disabled={
                      cursor.getFullYear() === today.getFullYear() &&
                      cursor.getMonth() === today.getMonth()
                    }
                    className="grid h-8 w-8 place-items-center rounded-md text-humo hover:bg-nieve disabled:opacity-30"
                    aria-label="Mes anterior"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCursor(
                        new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
                      );
                      setSelectedDay(null);
                      setSelectedSlot(null);
                    }}
                    className="grid h-8 w-8 place-items-center rounded-md text-humo hover:bg-nieve"
                    aria-label="Mes siguiente"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Calendario */}
              <div className="mt-3 grid grid-cols-7 gap-1 text-center">
                {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                  <span
                    key={i}
                    className="pb-1 text-[11px] font-semibold uppercase text-humo"
                  >
                    {d}
                  </span>
                ))}
                {grid.map((day, i) => {
                  const inMonth = day.getMonth() === cursor.getMonth();
                  const enabled =
                    inMonth &&
                    availability !== null &&
                    daySlots(day, availability).length > 0;
                  const selected = selectedDay && sameDay(day, selectedDay);
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={!enabled}
                      onClick={() => {
                        setSelectedDay(day);
                        setSelectedSlot(null);
                      }}
                      className={cn(
                        "grid aspect-square place-items-center rounded-md text-[13px] transition-colors",
                        !inMonth && "invisible",
                        enabled
                          ? selected
                            ? "bg-petroleo font-semibold text-hueso"
                            : "bg-petroleo/8 font-medium text-petroleo hover:bg-petroleo/15"
                          : "text-arena"
                      )}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>

              {loadingMonth && (
                <p className="mt-4 flex items-center justify-center gap-2 text-sm text-humo">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando disponibilidad…
                </p>
              )}

              {/* Horas del día elegido */}
              {selectedDay && !loadingMonth && (
                <div className="mt-4 border-t border-lino pt-4">
                  <p className="flex items-center gap-1.5 text-[13px] font-medium capitalize text-carbon">
                    <Clock className="h-3.5 w-3.5 text-nogal" />
                    {selectedDay.toLocaleDateString("es-MX", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                  {slots.length > 0 ? (
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {slots.map((s) => (
                        <button
                          key={s.label}
                          type="button"
                          onClick={() => setSelectedSlot(s)}
                          className={cn(
                            "rounded-full border px-4 py-2 font-mono text-[13px] font-medium transition-all",
                            selectedSlot?.label === s.label &&
                              sameDay(selectedSlot.date, s.date)
                              ? "border-petroleo bg-petroleo text-hueso"
                              : "border-lino text-carbon hover:border-petroleo hover:text-petroleo"
                          )}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-humo">
                      Ese día ya no tiene horarios libres.
                    </p>
                  )}
                </div>
              )}

              {!selectedDay && !loadingMonth && (
                <p className="mt-4 text-center text-[13px] text-humo">
                  Los días en verde tienen horarios disponibles.
                </p>
              )}
            </div>
          )}

          {step === "confirmar" && selectedSlot && (
            <div className="space-y-4">
              <div className="rounded-xl bg-nieve p-5">
                <p className="eyebrow">Resumen de tu visita</p>
                <dl className="mt-3 space-y-2.5 text-sm">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-nogal" />
                    <div>
                      <dt className="text-[12px] text-humo">Propiedad</dt>
                      <dd className="font-medium text-carbon">
                        {propertyTitle}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-nogal" />
                    <div>
                      <dt className="text-[12px] text-humo">Fecha y hora</dt>
                      <dd className="font-medium capitalize text-carbon">
                        {selectedSlot.date.toLocaleDateString("es-MX", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}{" "}
                        · {selectedSlot.label} h
                      </dd>
                    </div>
                  </div>
                  {operation === "venta" && (
                    <div className="flex items-start gap-2.5">
                      <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-nogal" />
                      <div>
                        <dt className="text-[12px] text-humo">
                          Financiamiento
                        </dt>
                        <dd className="font-medium text-carbon">
                          {FINANCING_LABELS[form.financing]}
                        </dd>
                      </div>
                    </div>
                  )}
                </dl>
              </div>

              <p className="text-[13px] leading-relaxed text-humo">
                Al confirmar, Luz recibirá tu solicitud y te contactará al{" "}
                <span className="font-medium text-carbon">
                  {form.phone || form.email}
                </span>{" "}
                para confirmar la visita.
              </p>

              {submitError && (
                <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {submitError}
                </p>
              )}
            </div>
          )}

          {step === "listo" && (
            <div className="py-6 text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-petroleo/10">
                <CheckCircle2 className="h-8 w-8 text-petroleo" />
              </span>
              <h3 className="mt-4 text-xl font-semibold text-carbon">
                ¡Visita agendada!
              </h3>
              {selectedSlot && (
                <p className="mt-2 text-sm capitalize text-humo">
                  {selectedSlot.date.toLocaleDateString("es-MX", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}{" "}
                  · {selectedSlot.label} h
                </p>
              )}
              <p className="mx-auto mt-3 max-w-sm text-[13px] leading-relaxed text-humo">
                Luz revisará tu solicitud y te escribirá para confirmar los
                detalles. Si necesitas cambiar el horario, contáctala por
                WhatsApp.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="btn-primary mx-auto mt-5 py-2.5"
              >
                Listo
              </button>
            </div>
          )}
        </div>

        {/* Pie con acciones */}
        {step !== "listo" && (
          <div className="flex items-center justify-between gap-3 border-t border-lino px-5 py-4 sm:px-6">
            {step === "datos" ? (
              <span className="text-[12px] text-humo">
                Tus datos son privados.
              </span>
            ) : (
              <button
                type="button"
                onClick={() =>
                  setStep(step === "horario" ? "datos" : "horario")
                }
                className="inline-flex items-center gap-1.5 text-sm font-medium text-humo transition-colors hover:text-carbon"
              >
                <ArrowLeft className="h-4 w-4" />
                Atrás
              </button>
            )}

            {step === "datos" && (
              <button
                type="button"
                onClick={nextFromDatos}
                className="btn-primary py-2.5"
              >
                Elegir fecha y hora
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
            {step === "horario" && (
              <button
                type="button"
                disabled={!selectedSlot}
                onClick={() => setStep("confirmar")}
                className="btn-primary py-2.5"
              >
                Continuar
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
            {step === "confirmar" && (
              <button
                type="button"
                disabled={pending}
                onClick={confirm}
                className="btn-primary py-2.5"
              >
                {pending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Agendando…
                  </>
                ) : (
                  <>
                    <CalendarDays className="h-4 w-4" />
                    Confirmar visita
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
