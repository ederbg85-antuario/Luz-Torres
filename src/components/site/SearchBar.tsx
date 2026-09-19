"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Search, MapPin, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/format";

export function SearchBar() {
  const router = useRouter();
  const [tab, setTab] = useState<"venta" | "renta" | "vender">("venta");
  const [location, setLocation] = useState("");
  return (
    <div className="max-w-lg rounded-xl bg-white p-3 shadow-elevated">
      <div
        className="flex gap-1 rounded-full bg-[#f5f6f5] p-1"
        role="group"
        aria-label="Tipo de búsqueda"
      >
        {(
          [
            ["venta", "Comprar"],
            ["renta", "Rentar"],
            ["vender", "Vender"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={tab === value}
            onClick={() => setTab(value)}
            className={cn(
              "flex-1 rounded-full px-3 py-2.5 text-sm font-semibold transition-all duration-300",
              tab === value
                ? "bg-petroleo text-white shadow-soft"
                : "text-humo hover:text-petroleo",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "vender" ? (
        <div className="flex items-center justify-between gap-3 p-3 pt-5">
          <p className="text-sm text-humo">
            Dale el siguiente paso a tu propiedad.
          </p>
          <Link href="/vende-tu-propiedad" className="btn-accent shrink-0 px-4">
            Empezar
            <ArrowUpRight size={16} />
          </Link>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const params = new URLSearchParams({ operation: tab });
            if (location.trim()) params.set("q", location.trim());
            router.push(`/propiedades?${params}`);
          }}
          className="mt-3 flex items-center gap-2"
        >
          <label className="flex min-w-0 flex-1 items-center gap-2 px-2">
            <MapPin size={18} className="shrink-0 text-almendra" />
            <span className="sr-only">Ciudad o colonia</span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="¿Dónde quieres vivir?"
              className="min-w-0 w-full bg-transparent py-3 text-sm outline-none placeholder:text-humo"
            />
          </label>
          <button
            type="submit"
            className="btn-accent h-12 w-12 shrink-0 p-0 sm:w-auto sm:px-5"
            aria-label="Buscar propiedades"
          >
            <Search size={18} />
            <span className="hidden sm:inline">Buscar</span>
          </button>
        </form>
      )}
    </div>
  );
}
