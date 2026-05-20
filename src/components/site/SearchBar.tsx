"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Search, MapPin, ChevronDown } from "lucide-react";
import { PROPERTY_TYPE_LABELS, PROPERTY_TYPES } from "@/lib/constants";
import { cn } from "@/lib/format";

type Tab = "venta" | "renta" | "vender";

const TABS: { id: Tab; label: string }[] = [
  { id: "venta", label: "Comprar" },
  { id: "renta", label: "Rentar" },
  { id: "vender", label: "Vender" },
];

export function SearchBar() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("venta");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");

  function search() {
    const params = new URLSearchParams();
    params.set("operation", tab === "renta" ? "renta" : "venta");
    if (location.trim()) params.set("q", location.trim());
    if (type) params.set("property_type", type);
    router.push(`/propiedades?${params.toString()}`);
  }

  return (
    <div className="rounded-xl bg-papel p-2 shadow-floating">
      {/* Tabs */}
      <div className="flex gap-1 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors sm:flex-none sm:px-6",
              tab === t.id
                ? "bg-petroleo text-hueso"
                : "text-humo hover:bg-nieve hover:text-carbon"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "vender" ? (
        <div className="flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-humo">
            ¿Quieres vender o rentar tu propiedad? Coordino la valuación, la
            difusión profesional y el filtrado de prospectos.
          </p>
          <Link
            href="/contacto?intent=venta"
            className="btn-accent shrink-0 px-5 py-3"
          >
            Solicitar valuación
          </Link>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            search();
          }}
          className="flex flex-col gap-2 p-2 sm:flex-row sm:items-center"
        >
          <div className="relative flex-1">
            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-bruma" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Estado, ciudad o colonia"
              className="w-full rounded-md border border-lino bg-nieve py-3 pl-10 pr-3 text-sm outline-none placeholder:text-humo focus:border-vivo focus:bg-papel"
            />
          </div>

          <div className="relative sm:w-52">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full appearance-none rounded-md border border-lino bg-nieve py-3 pl-3.5 pr-9 text-sm text-carbon outline-none focus:border-vivo focus:bg-papel"
            >
              <option value="">Tipo de propiedad</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {PROPERTY_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bruma" />
          </div>

          <button type="submit" className="btn-accent px-6 py-3">
            <Search className="h-4 w-4" />
            Buscar
          </button>
        </form>
      )}
    </div>
  );
}
