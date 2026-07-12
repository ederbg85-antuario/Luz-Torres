import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Property } from "@/lib/types";
import { SectionHeading } from "./SectionHeading";
import { PropertyCard } from "./PropertyCard";
import { Reveal } from "./Reveal";

export function FeaturedSection({
  properties,
}: {
  properties: Property[];
}) {
  return (
    <section className="lt-container mt-24">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Catálogo"
            title={
              <>
                Propiedades <span className="text-nogal">destacadas</span>
              </>
            }
            intro="Una selección del catálogo actual. Cada propiedad incluye ficha técnica, fotografía y acompañamiento completo."
          />
          <Link href="/propiedades" className="btn-ghost">
            Ver todas
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Reveal>

      {properties.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 100} className="h-full">
              <PropertyCard property={p} index={i} />
            </Reveal>
          ))}
        </div>
      ) : (
        <Reveal>
          <div className="mt-10 rounded-xl border border-lino bg-papel p-12 text-center shadow-card">
            <p className="font-serif text-2xl italic text-petroleo">
              Pronto, nuevas propiedades.
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-humo">
              Estoy preparando el catálogo. Mientras tanto, escríbeme y te
              aviso en cuanto tenga una opción que encaje con lo que buscas.
            </p>
            <Link href="/contacto" className="btn-accent mt-6">
              Quiero que me avises
            </Link>
          </div>
        </Reveal>
      )}
    </section>
  );
}
