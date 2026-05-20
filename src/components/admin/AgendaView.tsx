"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Trash2,
  CalendarClock,
} from "lucide-react";
import {
  createAppointment,
  updateAppointment,
  deleteAppointment,
  type AppointmentInput,
} from "@/lib/actions/appointments";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS,
} from "@/lib/constants";
import type {
  AppointmentRow,
} from "@/lib/admin-data";
import type {
  AppointmentStatus,
  AppointmentType,
} from "@/lib/types";
import { cn, formatDateTime } from "@/lib/format";

const DAY_NAMES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const TYPE_STYLE: Record<AppointmentType, string> = {
  visita: "bg-petroleo/12 text-petroleo",
  firma: "bg-almendra/20 text-nogal",
  llamada: "bg-vivo/12 text-vivo",
  reunion: "bg-sombra/12 text-sombra",
  avaluo: "bg-arena/40 text-nogal",
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function toLocalInput(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

type DialogState =
  | { mode: "new"; date: Date }
  | { mode: "edit"; appointment: AppointmentRow }
  | null;

export function AgendaView({
  appointments,
  contacts,
  properties,
}: {
  appointments: AppointmentRow[];
  contacts: { id: string; full_name: string }[];
  properties: { id: string; title: string }[];
}) {
  const router = useRouter();
  const today = new Date();
  const [cursor, setCursor] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [dialog, setDialog] = useState<DialogState>(null);

  const grid = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const offset = (first.getDay() + 6) % 7;
    return Array.from(
      { length: 42 },
      (_, i) => new Date(year, month, 1 - offset + i)
    );
  }, [cursor]);

  const upcoming = useMemo(
    () =>
      [...appointments]
        .filter((a) => new Date(a.starts_at) >= new Date())
        .slice(0, 8),
    [appointments]
  );

  return (
    <div className="space-y-6">
      {/* Calendario */}
      <div className="rounded-xl bg-papel p-4 shadow-soft sm:p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold capitalize text-carbon">
            {cursor.toLocaleDateString("es-MX", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                setCursor(
                  new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1)
                )
              }
              className="grid h-9 w-9 place-items-center rounded-md text-humo hover:bg-nieve"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                setCursor(new Date(today.getFullYear(), today.getMonth(), 1))
              }
              className="rounded-md px-3 py-2 text-[13px] font-medium text-humo hover:bg-nieve"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() =>
                setCursor(
                  new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
                )
              }
              className="grid h-9 w-9 place-items-center rounded-md text-humo hover:bg-nieve"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1">
          {DAY_NAMES.map((d) => (
            <div
              key={d}
              className="pb-1 text-center text-[11px] font-semibold uppercase tracking-wide text-humo"
            >
              {d}
            </div>
          ))}
          {grid.map((day, i) => {
            const inMonth = day.getMonth() === cursor.getMonth();
            const isToday = sameDay(day, today);
            const dayAppts = appointments.filter((a) =>
              sameDay(new Date(a.starts_at), day)
            );
            return (
              <div
                key={i}
                className={cn(
                  "min-h-[92px] rounded-md border border-lino/70 p-1.5",
                  inMonth ? "bg-nieve" : "bg-hueso/40"
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "grid h-6 w-6 place-items-center rounded-full text-[12px]",
                      isToday
                        ? "bg-petroleo font-semibold text-hueso"
                        : inMonth
                          ? "text-carbon"
                          : "text-bruma"
                    )}
                  >
                    {day.getDate()}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDialog({ mode: "new", date: day })}
                    className="text-bruma hover:text-vivo"
                    aria-label="Agregar cita"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-1 space-y-1">
                  {dayAppts.slice(0, 3).map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() =>
                        setDialog({ mode: "edit", appointment: a })
                      }
                      className={cn(
                        "block w-full truncate rounded px-1.5 py-0.5 text-left text-[11px] font-medium",
                        TYPE_STYLE[a.type]
                      )}
                    >
                      {new Date(a.starts_at).toLocaleTimeString("es-MX", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      {a.title}
                    </button>
                  ))}
                  {dayAppts.length > 3 && (
                    <p className="px-1 text-[10px] text-humo">
                      +{dayAppts.length - 3} más
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Próximas citas */}
      <div className="rounded-xl bg-papel p-5 shadow-soft">
        <h2 className="font-semibold text-carbon">Próximas citas</h2>
        {upcoming.length > 0 ? (
          <ul className="mt-3 divide-y divide-lino">
            {upcoming.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => setDialog({ mode: "edit", appointment: a })}
                  className="flex w-full items-center gap-3 py-2.5 text-left"
                >
                  <span
                    className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-md",
                      TYPE_STYLE[a.type]
                    )}
                  >
                    <CalendarClock className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-carbon">
                      {a.title}
                    </span>
                    <span className="block text-[12px] text-humo">
                      {APPOINTMENT_TYPE_LABELS[a.type]} ·{" "}
                      {formatDateTime(a.starts_at)}
                      {a.contact ? ` · ${a.contact.full_name}` : ""}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-humo">
            No tienes citas próximas. Usa el botón “+” en cualquier día.
          </p>
        )}
      </div>

      {dialog && (
        <AppointmentDialog
          state={dialog}
          contacts={contacts}
          properties={properties}
          onClose={() => setDialog(null)}
          onSaved={() => {
            setDialog(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function AppointmentDialog({
  state,
  contacts,
  properties,
  onClose,
  onSaved,
}: {
  state: NonNullable<DialogState>;
  contacts: { id: string; full_name: string }[];
  properties: { id: string; title: string }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const editing = state.mode === "edit" ? state.appointment : null;
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  const defaultStart =
    state.mode === "new"
      ? toLocalInput(
          new Date(
            state.date.getFullYear(),
            state.date.getMonth(),
            state.date.getDate(),
            10,
            0
          )
        )
      : toLocalInput(new Date(state.mode === "edit" ? editing!.starts_at : ""));

  const [form, setForm] = useState({
    title: editing?.title ?? "",
    type: (editing?.type ?? "visita") as AppointmentType,
    starts_at: defaultStart,
    ends_at: editing?.ends_at ? toLocalInput(new Date(editing.ends_at)) : "",
    contact_id: editing?.contact_id ?? "",
    property_id: editing?.property_id ?? "",
    location: editing?.location ?? "",
    status: (editing?.status ?? "programada") as AppointmentStatus,
    notes: editing?.notes ?? "",
  });

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const input: AppointmentInput = {
      title: form.title,
      type: form.type,
      starts_at: form.starts_at,
      ends_at: form.ends_at || null,
      contact_id: form.contact_id || null,
      property_id: form.property_id || null,
      location: form.location,
      status: form.status,
      notes: form.notes,
    };
    start(async () => {
      const res = editing
        ? await updateAppointment(editing.id, input)
        : await createAppointment(input);
      if (res.ok) onSaved();
      else setError(res.error ?? "No se pudo guardar.");
    });
  }

  function remove() {
    if (!editing) return;
    start(async () => {
      const res = await deleteAppointment(editing.id);
      if (res.ok) onSaved();
      else setError(res.error ?? "No se pudo eliminar.");
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-carbon/50 p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-xl bg-papel shadow-floating">
        <div className="flex items-center justify-between border-b border-lino px-5 py-4">
          <h3 className="font-semibold text-carbon">
            {editing ? "Editar cita" : "Nueva cita"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md text-humo hover:bg-nieve"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={save} className="space-y-3.5 p-5">
          <label className="block">
            <span className="label">Título</span>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
              className="field"
              placeholder="Visita · Departamento Del Valle"
            />
          </label>

          <div className="grid gap-3.5 sm:grid-cols-2">
            <label className="block">
              <span className="label">Tipo</span>
              <select
                value={form.type}
                onChange={(e) =>
                  set("type", e.target.value as AppointmentType)
                }
                className="field"
              >
                {(
                  Object.keys(APPOINTMENT_TYPE_LABELS) as AppointmentType[]
                ).map((t) => (
                  <option key={t} value={t}>
                    {APPOINTMENT_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="label">Estado</span>
              <select
                value={form.status}
                onChange={(e) =>
                  set("status", e.target.value as AppointmentStatus)
                }
                className="field"
              >
                {(
                  Object.keys(
                    APPOINTMENT_STATUS_LABELS
                  ) as AppointmentStatus[]
                ).map((s) => (
                  <option key={s} value={s}>
                    {APPOINTMENT_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="label">Inicio</span>
              <input
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => set("starts_at", e.target.value)}
                required
                className="field"
              />
            </label>
            <label className="block">
              <span className="label">Fin (opcional)</span>
              <input
                type="datetime-local"
                value={form.ends_at}
                onChange={(e) => set("ends_at", e.target.value)}
                className="field"
              />
            </label>
            <label className="block">
              <span className="label">Contacto</span>
              <select
                value={form.contact_id}
                onChange={(e) => set("contact_id", e.target.value)}
                className="field"
              >
                <option value="">Sin contacto</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="label">Propiedad</span>
              <select
                value={form.property_id}
                onChange={(e) => set("property_id", e.target.value)}
                className="field"
              >
                <option value="">Sin propiedad</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="label">Lugar</span>
            <input
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              className="field"
              placeholder="Dirección, notaría, videollamada…"
            />
          </label>
          <label className="block">
            <span className="label">Notas</span>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
              className="field resize-none"
            />
          </label>

          {error && (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={pending}
              className="btn-primary py-2.5"
            >
              {pending ? "Guardando…" : "Guardar cita"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={remove}
                disabled={pending}
                className="grid h-10 w-10 place-items-center rounded-full text-rose-600 hover:bg-rose-50"
                aria-label="Eliminar cita"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
