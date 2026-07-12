"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Search, MapPin, ChevronDown, ArrowRight } from "lucide-react";
import { PROPERTY_TYPE_LABELS, PROPERTY_TYPES } from "@/lib/constants";
import { cn } from "@/lib/format";

type Tab = "venta" | "renta" | "vender";

const TABS: { id: Tab; label: string }[] = [
  { id: "venta", label: "Comprar" },
  { id: "renta", label: "Rentar" },
  { id: "vender", label: "Vender" },
];

const QUICK_LINKS = [
  { label: "Casas en venta", href: "/propiedades?operation=venta&property_type=casa" },
  { label: "Departamentos en renta", href: "/propiedades?operation=renta&property_type=departamento" },
  { label: "Oficinas", href: "/propiedades?property_type=oficina" },
  { label: "Terrenos", href: "/propiedades?property_type=terreno" },
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

  const activeIndex = TABS.findIndex((t) => t.id === tab);

  return (
    <div>
      <div className="rounded-xl border border-lino/60 bg-papel/95 p-2.5 shadow-floating backdrop-blur-sm">
        {/* Tabs con indicador deslizante */}
        <div className="relative grid w-full grid-cols-3 rounded-full bg-nieve p-1 sm:w-fit">
          <span
            aria-hidden
            className="absolute inset-y-1 w-[calc((100%-8px)/3)] rounded-full bg-petroleo shadow-soft transition-transform duration-300 ease-out"
            style={{ transform: `translateX(calc(${activeIndex} * (100% + 0px)))`, left: 4 }}
          />
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "relative z-10 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors duration-300 sm:px-8",
                tab === t.id ? "text-hueso" : "text-humo hover:text-carbon"
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
              <ArrowRight className="h-4 w-4" />
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
              <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-almendra" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Estado, ciudad o colonia"
                className="w-full rounded-md border border-lino bg-nieve py-3.5 pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-humo focus:border-almendra focus:bg-papel focus:ring-2 focus:ring-almendra/15"
              />
            </div>

            <div className="relative sm:w-52">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full appearance-none rounded-md border border-lino bg-nieve py-3.5 pl-3.5 pr-9 text-sm text-carbon outline-none transition-colors focus:border-almendra focus:bg-papel"
              >
                <option value="">Tipo de propiedad</option>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {PROPERTY_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-almendra" />
            </div>

            <button type="submit" className="btn-accent px-7 py-3.5">
              <Search className="h-4 w-4" />
              Buscar
            </button>
          </form>
        )}
      </div>

      {/* Accesos rápidos */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-[12px] font-medium uppercase tracking-wider text-humo">
          Búsquedas frecuentes:
        </span>
        {QUICK_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-full border border-arena/60 bg-papel/70 px-3.5 py-1.5 text-[12px] font-medium text-nogal transition-all hover:border-almendra hover:bg-papel hover:shadow-soft"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
