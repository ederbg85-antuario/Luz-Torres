"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { PROPERTY_TYPE_LABELS, PROPERTY_TYPES } from "@/lib/constants";
import { cn } from "@/lib/format";

const OPERATIONS = [
  { value: "", label: "Todas" },
  { value: "venta", label: "Venta" },
  { value: "renta", label: "Renta" },
];

const ROOM_OPTIONS = ["1", "2", "3", "4"];

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
  const [priceMin, setPriceMin] = useState(sp.get("priceMin") ?? "");
  const [priceMax, setPriceMax] = useState(sp.get("priceMax") ?? "");
  const [bedrooms, setBedrooms] = useState(sp.get("bedrooms") ?? "");
  const [bathrooms, setBathrooms] = useState(sp.get("bathrooms") ?? "");
  const [openMobile, setOpenMobile] = useState(false);

  const municipios = estado ? municipiosByEstado[estado] ?? [] : [];

  function apply(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (operation) p.set("operation", operation);
    if (type) p.set("property_type", type);
    if (estado) p.set("estado", estado);
    if (municipio) p.set("municipio", municipio);
    if (q.trim()) p.set("q", q.trim());
    if (priceMin) p.set("priceMin", priceMin);
    if (priceMax) p.set("priceMax", priceMax);
    if (bedrooms) p.set("bedrooms", bedrooms);
    if (bathrooms) p.set("bathrooms", bathrooms);
    const sort = sp.get("sort");
    if (sort) p.set("sort", sort);
    setOpenMobile(false);
    router.push(`/propiedades?${p.toString()}`);
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

  return (
    <form
      onSubmit={apply}
      className="rounded-xl bg-papel p-4 shadow-card sm:p-5"
    >
      {/* Operación + búsqueda */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex rounded-full bg-nieve p-1">
          {OPERATIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setOperation(o.value)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                operation === o.value
                  ? "bg-petroleo text-hueso"
                  : "text-humo hover:text-carbon"
              )}
            >
              {o.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-bruma" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por ciudad, colonia o palabra clave"
            className="field pl-10"
          />
        </div>

        <button
          type="button"
          onClick={() => setOpenMobile((v) => !v)}
          className="btn-ghost py-2.5 sm:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
        </button>
      </div>

      {/* Filtros detallados */}
      <div
        className={cn(
          "mt-4 grid-cols-2 gap-3 lg:grid-cols-4",
          openMobile ? "grid" : "hidden sm:grid"
        )}
      >
        <label className="block">
          <span className="label">Tipo</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="field"
          >
            <option value="">Todos</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>
                {PROPERTY_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="label">Estado</span>
          <select
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value);
              setMunicipio("");
            }}
            className="field"
          >
            <option value="">Todos</option>
            {estados.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="label">Ciudad / Alcaldía</span>
          <select
            value={municipio}
            onChange={(e) => setMunicipio(e.target.value)}
            disabled={!estado}
            className="field disabled:opacity-50"
          >
            <option value="">Todas</option>
            {municipios.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="label">Recámaras</span>
          <select
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            className="field"
          >
            <option value="">Cualquiera</option>
            {ROOM_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}+
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="label">Baños</span>
          <select
            value={bathrooms}
            onChange={(e) => setBathrooms(e.target.value)}
            className="field"
          >
            <option value="">Cualquiera</option>
            {ROOM_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}+
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="label">Precio mínimo</span>
          <input
            type="number"
            inputMode="numeric"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            placeholder="$ MXN"
            className="field"
          />
        </label>

        <label className="block">
          <span className="label">Precio máximo</span>
          <input
            type="number"
            inputMode="numeric"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            placeholder="$ MXN"
            className="field"
          />
        </label>

        <div className="flex items-end gap-2">
          <button type="submit" className="btn-primary flex-1 py-2.5">
            Aplicar
          </button>
          <button
            type="button"
            onClick={clear}
            className="btn-ghost py-2.5"
            aria-label="Limpiar filtros"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </form>
  );
}
