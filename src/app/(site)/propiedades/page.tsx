import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SearchX } from "lucide-react";
import { getProperties, getFilterOptions, getSeoIndex } from "@/lib/data";
import { PropertyCard } from "@/components/site/PropertyCard";
import { PropertyFilters } from "@/components/site/PropertyFilters";
import { SortSelect } from "@/components/site/SortSelect";
import { PROPERTY_TYPE_PLURAL } from "@/lib/constants";
import { categoryChips } from "@/lib/seo";
import type {
  Operation,
  PropertyFilters as Filters,
  PropertyType,
} from "@/lib/types";

type SearchParams = Record<string, string | string[] | undefined>;

const TYPES: PropertyType[] = [
  "casa",
  "departamento",
  "oficina",
  "bodega",
  "terreno",
  "local",
];

function str(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

function parseFilters(sp: SearchParams): Filters {
  const operation = str(sp.operation);
  const type = str(sp.property_type);
  const sort = str(sp.sort);
  const num = (v: string | string[] | undefined) => {
    const n = Number(str(v));
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };
  return {
    operation:
      operation === "venta" || operation === "renta"
        ? (operation as Operation)
        : undefined,
    property_type: TYPES.includes(type as PropertyType)
      ? (type as PropertyType)
      : undefined,
    estado: str(sp.estado) || undefined,
    municipio: str(sp.municipio) || undefined,
    q: str(sp.q) || undefined,
    priceMin: num(sp.priceMin),
    priceMax: num(sp.priceMax),
    bedrooms: num(sp.bedrooms),
    bathrooms: num(sp.bathrooms),
    sort:
      sort === "precio_asc" || sort === "precio_desc"
        ? sort
        : "recientes",
  };
}

function buildTitle(f: Filters): string {
  const base = f.property_type
    ? PROPERTY_TYPE_PLURAL[f.property_type]
    : "Propiedades";
  let title = base;
  if (f.operation) title += ` en ${f.operation}`;
  if (f.estado) title += ` en ${f.estado}`;
  return title;
}

// Metadata estable: los estados filtrados por query params canonicalizan al
// catálogo base para no competir como duplicados en el índice de Google.
export const metadata: Metadata = {
  title: { absolute: "Propiedades en venta y renta en México | Luz Torres" },
  description:
    "Casas, departamentos, oficinas, bodegas y terrenos con asesoría integral: búsqueda, crédito, trámites y acompañamiento. Agenda tu visita con Luz Torres.",
  alternates: { canonical: "/propiedades" },
};

export default async function PropiedadesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const filters = parseFilters(await searchParams);
  const [properties, options, seoIndex] = await Promise.all([
    getProperties(filters),
    getFilterOptions(),
    getSeoIndex(),
  ]);

  const title = buildTitle(filters);
  const chips = categoryChips(seoIndex);

  return (
    <div className="lt-container py-10">
      <header className="max-w-2xl">
        <p className="eyebrow">Catálogo</p>
        <h1 className="mt-3 text-hero animate-fade-up">{title}</h1>
        <p className="mt-3 text-[15px] text-humo">
          Casas, departamentos, oficinas y más — con ficha técnica completa y
          acompañamiento de principio a fin.
        </p>
      </header>

      {/* Accesos directos a categorías (interlinking + rutas indexables) */}
      {chips.length > 0 && (
        <nav
          aria-label="Categorías de propiedades"
          className="mt-6 flex flex-wrap gap-2.5"
        >
          {chips.map((c) => (
            <Link
              key={c.path}
              href={c.path}
              className="rounded-full bg-papel px-4 py-2 text-sm capitalize text-carbon shadow-soft transition-colors hover:bg-almendra/10 hover:text-nogal"
            >
              {c.label}
            </Link>
          ))}
        </nav>
      )}

      <div className="mt-8">
        <Suspense fallback={<div className="h-24" />}>
          <PropertyFilters
            estados={options.estados}
            municipiosByEstado={options.municipiosByEstado}
          />
        </Suspense>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-humo">
          <span className="font-semibold text-carbon">
            {properties.length}
          </span>{" "}
          {properties.length === 1
            ? "propiedad encontrada"
            : "propiedades encontradas"}
        </p>
        <Suspense fallback={null}>
          <SortSelect />
        </Suspense>
      </div>

      {properties.length > 0 ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p, i) => (
            <PropertyCard key={p.id} property={p} index={i} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-xl bg-papel p-14 text-center shadow-card">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-nieve">
            <SearchX className="h-6 w-6 text-bruma" />
          </div>
          <p className="mt-4 font-serif text-2xl italic text-petroleo">
            No encontré propiedades con esos filtros.
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-humo">
            Ajusta la búsqueda o cuéntame qué buscas — con gusto te aviso
            cuando tenga una opción que encaje.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/propiedades" className="btn-ghost">
              Limpiar filtros
            </Link>
            <Link href="/contacto" className="btn-primary">
              Escribirle a Luz
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
