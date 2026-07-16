"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CalendarOff, Check, Plus, Trash2 } from "lucide-react";
import {
  addBlockedSlot,
  removeBlockedSlot,
  saveAvailabilityRules,
  type AvailabilityRuleInput,
} from "@/lib/actions/availability";
import { WEEKDAY_LABELS } from "@/lib/constants";
import type { AvailabilityRule, BlockedSlot } from "@/lib/types";
import { cn, formatDateLong } from "@/lib/format";

/** "10:00:00" → "10:00" para inputs type=time. */
function toInputTime(t: string) {
  return t.slice(0, 5);
}

export function AvailabilityManager({
  rules,
  blocked,
}: {
  rules: AvailabilityRule[];
  blocked: BlockedSlot[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [draft, setDraft] = useState<AvailabilityRuleInput[]>(() =>
    Array.from({ length: 7 }, (_, i) => {
      const rule = rules.find((r) => r.weekday === i + 1);
      return {
        weekday: i + 1,
        enabled: rule?.enabled ?? false,
        start_time: rule ? toInputTime(rule.start_time) : "10:00",
        end_time: rule ? toInputTime(rule.end_time) : "18:00",
      };
    })
  );

  function setRule(weekday: number, patch: Partial<AvailabilityRuleInput>) {
    setSaved(false);
    setDraft((list) =>
      list.map((r) => (r.weekday === weekday ? { ...r, ...patch } : r))
    );
  }

  function save() {
    setError("");
    start(async () => {
      const res = await saveAvailabilityRules(draft);
      if (res.ok) {
        setSaved(true);
        router.refresh();
      } else {
        setError(res.error ?? "No se pudo guardar.");
      }
    });
  }

  // ─── Bloqueos puntuales ───────────────────────────────────────
  const [block, setBlock] = useState({
    date: "",
    allDay: true,
    start_time: "10:00",
    end_time: "11:00",
    reason: "",
  });
  const [blockError, setBlockError] = useState("");

  function addBlock() {
    setBlockError("");
    if (!block.date) {
      setBlockError("Elige la fecha a bloquear.");
      return;
    }
    start(async () => {
      const res = await addBlockedSlot({
        date: block.date,
        start_time: block.allDay ? null : block.start_time,
        end_time: block.allDay ? null : block.end_time,
        reason: block.reason,
      });
      if (res.ok) {
        setBlock({ date: "", allDay: true, start_time: "10:00", end_time: "11:00", reason: "" });
        router.refresh();
      } else {
        setBlockError(res.error ?? "No se pudo bloquear.");
      }
    });
  }

  function removeBlock(id: string) {
    start(async () => {
      const res = await removeBlockedSlot(id);
      if (res.ok) router.refresh();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Horario semanal */}
      <div className="rounded-xl bg-papel p-5 shadow-soft">
        <h2 className="font-semibold text-carbon">Horario para visitas</h2>
        <p className="mt-1 text-[13px] text-humo">
          Los clientes solo podrán agendar visitas dentro de estos horarios.
          Cada visita dura 1 hora.
        </p>

        <div className="mt-4 space-y-2">
          {draft.map((r) => (
            <div
              key={r.weekday}
              className={cn(
                "flex flex-wrap items-center gap-3 rounded-md px-3 py-2.5 transition-colors",
                r.enabled ? "bg-nieve" : "bg-hueso/50"
              )}
            >
              <label className="flex w-32 cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={r.enabled}
                  onChange={(e) =>
                    setRule(r.weekday, { enabled: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-lino text-vivo focus:ring-vivo"
                />
                <span
                  className={cn(
                    "text-sm font-medium",
                    r.enabled ? "text-carbon" : "text-humo"
                  )}
                >
                  {WEEKDAY_LABELS[r.weekday]}
                </span>
              </label>
              {r.enabled ? (
                <div className="flex items-center gap-2 text-sm text-humo">
                  <input
                    type="time"
                    value={r.start_time}
                    onChange={(e) =>
                      setRule(r.weekday, { start_time: e.target.value })
                    }
                    className="field w-auto px-2.5 py-1.5"
                  />
                  <span>a</span>
                  <input
                    type="time"
                    value={r.end_time}
                    onChange={(e) =>
                      setRule(r.weekday, { end_time: e.target.value })
                    }
                    className="field w-auto px-2.5 py-1.5"
                  />
                </div>
              ) : (
                <span className="text-[13px] text-humo">Sin visitas</span>
              )}
            </div>
          ))}
        </div>

        {error && (
          <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="btn-primary py-2.5"
          >
            {pending ? "Guardando…" : "Guardar horario"}
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-vivo">
              <Check className="h-4 w-4" />
              Guardado
            </span>
          )}
        </div>
      </div>

      {/* Bloqueos puntuales */}
      <div className="rounded-xl bg-papel p-5 shadow-soft">
        <h2 className="font-semibold text-carbon">Bloquear fechas u horas</h2>
        <p className="mt-1 text-[13px] text-humo">
          Vacaciones, compromisos personales o días que no quieras recibir
          visitas.
        </p>

        <div className="mt-4 space-y-3 rounded-md bg-nieve p-3.5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="label">Fecha</span>
              <input
                type="date"
                value={block.date}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) =>
                  setBlock((b) => ({ ...b, date: e.target.value }))
                }
                className="field"
              />
            </label>
            <label className="block">
              <span className="label">Motivo (opcional)</span>
              <input
                value={block.reason}
                onChange={(e) =>
                  setBlock((b) => ({ ...b, reason: e.target.value }))
                }
                className="field"
                placeholder="Vacaciones, firma…"
              />
            </label>
          </div>

          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={block.allDay}
              onChange={(e) =>
                setBlock((b) => ({ ...b, allDay: e.target.checked }))
              }
              className="h-4 w-4 rounded border-lino text-vivo focus:ring-vivo"
            />
            <span className="text-sm text-carbon">Bloquear el día completo</span>
          </label>

          {!block.allDay && (
            <div className="flex items-center gap-2 text-sm text-humo">
              <input
                type="time"
                value={block.start_time}
                onChange={(e) =>
                  setBlock((b) => ({ ...b, start_time: e.target.value }))
                }
                className="field w-auto px-2.5 py-1.5"
              />
              <span>a</span>
              <input
                type="time"
                value={block.end_time}
                onChange={(e) =>
                  setBlock((b) => ({ ...b, end_time: e.target.value }))
                }
                className="field w-auto px-2.5 py-1.5"
              />
            </div>
          )}

          {blockError && (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {blockError}
            </p>
          )}

          <button
            type="button"
            onClick={addBlock}
            disabled={pending}
            className="btn-ghost py-2"
          >
            <Plus className="h-4 w-4" />
            Bloquear
          </button>
        </div>

        {blocked.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {blocked.map((b) => (
              <li
                key={b.id}
                className="flex items-center gap-3 rounded-md border border-lino px-3.5 py-2.5"
              >
                <CalendarOff className="h-4 w-4 shrink-0 text-nogal" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium capitalize text-carbon">
                    {formatDateLong(`${b.date}T12:00:00`)}
                  </p>
                  <p className="text-[12px] text-humo">
                    {b.start_time
                      ? `${toInputTime(b.start_time)} – ${
                          b.end_time ? toInputTime(b.end_time) : "…"
                        }`
                      : "Día completo"}
                    {b.reason ? ` · ${b.reason}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeBlock(b.id)}
                  disabled={pending}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-rose-600 hover:bg-rose-50"
                  aria-label="Quitar bloqueo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-[13px] text-humo">
            No tienes fechas bloqueadas próximas.
          </p>
        )}
      </div>
    </div>
  );
}
