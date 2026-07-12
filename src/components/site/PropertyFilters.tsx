"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  Home,
  Building2,
  Briefcase,
  Warehouse,
  Trees,
  Store,
  BedDouble,
  Bath,
  MapPin,
  ChevronDown,
} from "lucide-react";
import {
  PROPERTY_TYPE_LABELS,
  PROPERTY_TYPES,
  OPERATION_LABELS,
} from "@/lib/constants";
import type { PropertyType } from "@/lib/types";
import { cn } from "@/lib/format";

const OPERATIONS = [
  { value: "", label: "Todas" },
  { value: "venta", label: "Comprar" },
  { value: "renta", label: "Rentar" },
];

const TYPE_ICONS: Record<PropertyType, typeof Home> = {
  casa: Home,
  departamento: Building2,
  oficina: Briefcase,
  bodega: Warehouse,
  terreno: Trees,
  local: Store,
};

const ROOM_OPTIONS = ["1", "2", "3", "4"];

/** Formatea "2500000" → "2,500,000" mientras se escribe. */
function formatThousands(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function unformat(value: string) {
  return value.replace(/\D/g, "");
}

export function PropertyFilters({
  estados,
  municipiosByEstado,
}: {
  estados: string[];
  municipiosByEstado: Record<string, string[]>;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  const [operation, setOperation] = useState(sp.get("operation") ?? "");
  const [type, setType] = useState(sp.get("property_type") ?? "");
  const [estado, setEstado] = useState(sp.get("estado") ?? "");
  const [municipio, setMunicipio] = useState(sp.get("municipio") ?? "");
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [priceMin, setPriceMin] = useState(
    formatThousands(sp.get("priceMin") ?? "")
  );
  const [priceMax, setPriceMax] = useState(
    formatThousands(sp.get("priceMax") ?? "")
  );
  const [bedrooms, setBedrooms] = useState(sp.get("bedrooms") ?? "");
  const [bathrooms, setBathrooms] = useState(sp.get("bathrooms") ?? "");
  const [openMore, setOpenMore] = useState(false);

  const municipios = estado ? municipiosByEstado[estado] ?? [] : [];
  const opIndex = OPERATIONS.findIndex((o) => o.value === operation);

  function buildParams() {
    const p = new URLSearchParams();
    if (operation) p.set("operation", operation);
    if (type) p.set("property_type", type);
    if (estado) p.set("estado", estado);
    if (municipio) p.set("municipio", municipio);
    if (q.trim()) p.set("q", q.trim());
    if (unformat(priceMin)) p.set("priceMin", unformat(priceMin));
    if (unformat(priceMax)) p.set("priceMax", unformat(priceMax));
    if (bedrooms) p.set("bedrooms", bedrooms);
    if (bathrooms) p.set("bathrooms", bathrooms);
    const sort = sp.get("sort");
    if (sort) p.set("sort", sort);
    return p;
  }

  function apply(e?: React.FormEvent) {
    e?.preventDefault();
    router.push(`/propiedades?${buildParams().toString()}`);
  }

  function clear() {
    setOperation("");
    setType("");
    setEstado("");
    setMunicipio("");
    setQ("");
    setPriceMin("");
    setPriceMax("");
    setBedrooms("");
    setBathrooms("");
    router.push("/propiedades");
  }

  /** Filtros activos según la URL — chips removibles. */
  const activeChips = useMemo(() => {
    const chips: { key: string; label: string }[] = [];
    const op = sp.get("operation");
    if (op)
      chips.push({
        key: "operation",
        label: OPERATION_LABELS[op as "venta" | "renta"] ?? op,
      });
    const t = sp.get("property_type");
    if (t)
      chips.push({
        key: "property_type",
        label: PROPERTY_TYPE_LABELS[t as PropertyType] ?? t,
      });
    if (sp.get("estado"))
      chips.push({ key: "estado", label: sp.get("estado")! });
    if (sp.get("municipio"))
      chips.push({ key: "municipio", label: sp.get("municipio")! });
    if (sp.get("q")) chips.push({ key: "q", label: `“${sp.get("q")}”` });
    if (sp.get("priceMin"))
      chips.push({
        key: "priceMin",
        label: `Desde $${formatThousands(sp.get("priceMin")!)}`,
      });
    if (sp.get("priceMax"))
      chips.push({
        key: "priceMax",
        label: `Hasta $${formatThousands(sp.get("priceMax")!)}`,
      });
    if (sp.get("bedrooms"))
      chips.push({ key: "bedrooms", label: `${sp.get("bedrooms")}+ rec` });
    if (sp.get("bathrooms"))
      chips.push({ key: "bathrooms", label: `${sp.get("bathrooms")}+ baños` });
    return chips;
  }, [sp]);

  function removeChip(key: string) {
    const p = new URLSearchParams(sp.toString());
    p.delete(key);
    if (key === "estado") p.delete("municipio");
    router.push(`/propiedades?${p.toString()}`);
  }

  const moreCount = [estado, municipio, bedrooms, bathrooms, priceMin, priceMax]
    .filter(Boolean).length;

  return (
    <form
      onSubmit={apply}
      className="overflow-hidden rounded-xl border border-lino/70 bg-papel shadow-card"
    >
      {/* ── Fila principal: operación + búsqueda + acción ───────── */}
      <div className="flex flex-col gap-3 p-4 sm:p-5 lg:flex-row lg:items-center">
        <div className="relative grid w-full grid-cols-3 rounded-full bg-nieve p-1 sm:w-fit">
          <span
            aria-hidden
            className="absolute inset-y-1 w-[calc((100%-8px)/3)] rounded-full bg-petroleo shadow-soft transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(calc(${opIndex} * 100%))`,
              left: 4,
            }}
          />
          {OPERATIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setOperation(o.value)}
              className={cn(
                "relative z-10 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 sm:px-6",
                operation === o.value
                  ? "text-hueso"
                  : "text-humo hover:text-carbon"
              )}
            >
              {o.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-almendra" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por ciudad, colonia o palabra clave"
            className="field pl-10"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setOpenMore((v) => !v)}
            className={cn(
              "btn-ghost relative flex-1 py-2.5 lg:flex-none",
              openMore && "border-almendra bg-nieve"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Más filtros
            {moreCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-vivo text-[11px] font-bold text-papel">
                {moreCount}
              </span>
            )}
          </button>
          <button type="submit" className="btn-accent flex-1 px-6 py-2.5 lg:flex-none">
            <Search className="h-4 w-4" />
            Buscar
          </button>
        </div>
      </div>

      {/* ── Tipo de propiedad: chips con ícono ──────────────────── */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-4 sm:px-5">
        <button
          type="button"
          onClick={() => setType("")}
          className={cn("chip whitespace-nowrap", !type && "chip-active")}
        >
          Todos los tipos
        </button>
        {PROPERTY_TYPES.map((t) => {
          const Icon = TYPE_ICONS[t];
          const active = type === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setType(active ? "" : t)}
              className={cn("chip whitespace-nowrap", active && "chip-active")}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              {PROPERTY_TYPE_LABELS[t]}
            </button>
          );
        })}
      </div>

      {/* ── Filtros avanzados (desplegable) ─────────────────────── */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          openMore
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="grid gap-4 border-t border-lino/70 bg-nieve/60 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
            <label className="block">
              <span className="label flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-almendra" />
                Estado
              </span>
              <div className="relative">
                <select
                  value={estado}
                  onChange={(e) => {
                    setEstado(e.target.value);
                    setMunicipio("");
                  }}
                  className="field appearance-none pr-9"
                >
                  <option value="">Todos</option>
                  {estados.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-almendra" />
              </div>
            </label>

            <label className="block">
              <span className="label flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-almendra" />
                Ciudad / Alcaldía
              </span>
              <div className="relative">
                <select
                  value={municipio}
                  onChange={(e) => setMunicipio(e.target.value)}
                  disabled={!estado}
                  className="field appearance-none pr-9 disabled:opacity-50"
                >
                  <option value="">Todas</option>
                  {municipios.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-almendra" />
              </div>
            </label>

            <div>
              <span className="label flex items-center gap-1.5">
                <BedDouble className="h-3.5 w-3.5 text-almendra" />
                Recámaras
              </span>
              <div className="flex gap-1.5">
                {ROOM_OPTIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setBedrooms(bedrooms === r ? "" : r)}
                    className={cn(
                      "chip flex-1 justify-center px-0",
                      bedrooms === r && "chip-active"
                    )}
                  >
                    {r}+
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="label flex items-center gap-1.5">
                <Bath className="h-3.5 w-3.5 text-almendra" />
                Baños
              </span>
              <div className="flex gap-1.5">
                {ROOM_OPTIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setBathrooms(bathrooms === r ? "" : r)}
                    className={cn(
                      "chip flex-1 justify-center px-0",
                      bathrooms === r && "chip-active"
                    )}
                  >
                    {r}+
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="label">Precio mínimo (MXN)</span>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-almendra">
                  $
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={priceMin}
                  onChange={(e) => setPriceMin(formatThousands(e.target.value))}
                  placeholder="0"
                  className="field pl-8"
                />
              </div>
            </label>

            <label className="block">
              <span className="label">Precio máximo (MXN)</span>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-almendra">
                  $
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={priceMax}
                  onChange={(e) => setPriceMax(formatThousands(e.target.value))}
                  placeholder="Sin límite"
                  className="field pl-8"
                />
              </div>
            </label>

            <div className="flex items-end gap-2 sm:col-span-2">
              <button type="submit" className="btn-accent flex-1 py-2.5">
                Aplicar filtros
              </button>
              <button
                type="button"
                onClick={clear}
                className="btn-ghost py-2.5"
              >
                <X className="h-4 w-4" />
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filtros activos: chips removibles ───────────────────── */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-lino/70 px-4 py-3 sm:px-5">
          <span className="text-[12px] font-medium uppercase tracking-wider text-humo">
            Filtros activos:
          </span>
          {activeChips.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => removeChip(c.key)}
              className="group inline-flex items-center gap-1.5 rounded-full bg-almendra/15 px-3 py-1.5 text-[12px] font-medium text-nogal transition-colors hover:bg-almendra/30"
            >
              {c.label}
              <X className="h-3 w-3 transition-transform group-hover:scale-125" />
            </button>
          ))}
          <button
            type="button"
            onClick={clear}
            className="text-[12px] font-semibold text-humo underline-offset-2 hover:text-carbon hover:underline"
          >
            Limpiar todo
          </button>
        </div>
      )}
    </form>
  );
}
