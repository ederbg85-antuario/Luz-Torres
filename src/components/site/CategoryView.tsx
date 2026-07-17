import Link from "next/link";
import { ChevronRight, SearchX } from "lucide-react";
import type { Property } from "@/lib/types";
import type {
  CategoryDescriptor,
  CategoryLink,
} from "@/lib/seo";
import { categoryBreadcrumb, categoryJsonLd } from "@/lib/seo";
import { PropertyCard } from "./PropertyCard";

export function CategoryView({
  descriptor,
  properties,
  related,
}: {
  descriptor: CategoryDescriptor;
  properties: Property[];
  related: CategoryLink[];
}) {
  const crumbs = categoryBreadcrumb(descriptor);

  return (
    <div className="lt-container py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(categoryJsonLd(descriptor, properties)),
        }}
      />

      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1.5 text-[13px] text-humo">
        {crumbs.map((c, i) => (
          <span key={c.path} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
            {i < crumbs.length - 1 ? (
              <Link href={c.path} className="hover:text-carbon">
                {c.name}
              </Link>
            ) : (
              <span className="text-carbon">{c.name}</span>
            )}
          </span>
        ))}
      </nav>

      {/* Encabezado */}
      <header className="mt-5 max-w-2xl">
        <p className="eyebrow">Catálogo</p>
        <h1 className="mt-3 text-hero animate-fade-up">{descriptor.heading}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-humo">
          {descriptor.intro}
        </p>
      </header>

      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="text-sm text-humo">
          <span className="font-semibold text-carbon">
            {properties.length}
          </span>{" "}
          {properties.length === 1
            ? "propiedad disponible"
            : "propiedades disponibles"}
        </p>
      </div>

      {/* Listado */}
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
          <p className="mt-4 text-lg font-semibold text-carbon">
            Por ahora no hay propiedades en esta categoría.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/propiedades" className="btn-primary">
              Ver todo el catálogo
            </Link>
          </div>
        </div>
      )}

      {/* Interlinking: explora otras zonas / tipos */}
      {related.length > 0 && (
        <section className="mt-14 border-t border-lino pt-8">
          <h2 className="text-xl font-semibold text-carbon">
            Explora otras zonas y tipos
          </h2>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {related.map((r) => (
              <Link
                key={r.path}
                href={r.path}
                className="rounded-full bg-papel px-4 py-2 text-sm text-carbon shadow-soft transition-colors hover:bg-almendra/10 hover:text-nogal"
              >
                {r.label}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
