import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Property } from "@/lib/types";
import { PropertyCard } from "./PropertyCard";
import { Reveal } from "./Reveal";

export function FeaturedSection({ properties }: { properties: Property[] }) {
  return (
    <section
      id="seleccion"
      className="home-selection home-editorial-container"
      aria-labelledby="home-selection-title"
    >
      <Reveal>
        <div className="selection-heading">
          <div>
            <p className="home-kicker">Espacios con posibilidades</p>
            <h2 id="home-selection-title" className="home-display">
              Aquí puede empezar
              <br />
              <em>lo que sigue.</em>
            </h2>
          </div>
          <div className="selection-heading-aside">
            <p>
              Explora las propiedades y cuéntame
              <br />
              cuál te gustaría conocer.
            </p>
            <Link href="/propiedades" className="home-inline-cta">
              Ver el catálogo <ArrowUpRight size={20} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Reveal>
      {properties.length > 0 ? (
        <div className="home-property-grid">
          {properties.map((property, index) => (
            <Reveal
              key={property.id}
              delay={(index % 2) * 80}
              className="home-property-reveal"
            >
              <article data-motion-scene className="home-property-scene">
                <div className="home-property-number">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span>
                    {property.operation === "venta"
                      ? "Para tu nueva etapa"
                      : "Un nuevo lugar para vivir"}
                  </span>
                </div>
                <PropertyCard
                  property={property}
                  index={index}
                  editorial
                  imageSizes="(max-width: 767px) calc(100vw - 48px), (max-width: 1439px) calc(50vw - 60px), 620px"
                />
              </article>
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="home-empty">
          <h3>Pronto, nuevas propiedades.</h3>
          <p>Cuéntame qué buscas y te aviso cuando tenga una opción para ti.</p>
          <Link href="/contacto" className="home-inline-cta">
            Quiero que me avises <ArrowUpRight size={18} />
          </Link>
        </div>
      )}
    </section>
  );
}
