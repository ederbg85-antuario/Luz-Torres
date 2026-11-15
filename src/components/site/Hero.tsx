import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { MotionToggle } from "./HomeMotion";

export function Hero() {
  return (
    <section
      className="home-hero"
      aria-labelledby="home-title"
      data-motion-scene
    >
      <div className="hero-shell">
        <div className="hero-copy">
          <p className="hero-eyebrow">
            <span className="motion-loop hero-spark" aria-hidden="true">
              ✳
            </span>{" "}
            Propiedades para una nueva etapa
          </p>
          <h1 id="home-title" className="hero-headline">
            <span>Tu próximo</span> <span className="hero-word">hogar.</span>
          </h1>
          <p className="hero-intro">
            Un lugar que se sienta tuyo.
            <br /> Y alguien que te acompañe a encontrarlo.
          </p>
          <p className="hero-services">
            Compra, venta y renta · Con Luz Torres
          </p>
          <div className="hero-search">
            <SearchBar />
          </div>
          <div className="hero-copy-footer">
            <Link href="/contacto" className="hero-text-link">
              Hablar con Luz <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
            <MotionToggle />
          </div>
        </div>
        <div className="hero-stage">
          <div
            className="hero-arch hero-arch-back motion-loop"
            aria-hidden="true"
          />
          <div
            className="hero-arch hero-arch-front motion-loop"
            aria-hidden="true"
          />
          <svg
            className="hero-floorplan"
            viewBox="0 0 280 360"
            fill="none"
            aria-hidden="true"
          >
            <path d="M20 335V25H250V335H20ZM20 160H140V25M140 160V335M140 235H250M20 245H100M185 25V110H250M140 160H250" />
            <path
              className="motion-loop plan-trace"
              pathLength="100"
              d="M20 335V25H250V335H20ZM20 160H140V335M140 235H250"
            />
            <path d="M40 55H110V125H40ZM165 260H225V310H165ZM45 270H100V315H45" />
            <circle
              className="motion-loop plan-marker"
              cx="140"
              cy="160"
              r="6"
            />
          </svg>
          <Link
            href="/sobre-luz"
            className="hero-portrait"
            aria-label="Conoce a Luz Torres, tu asesora inmobiliaria"
          >
            <Image
              src="/luz-keys.jpg"
              alt="Luz Torres, asesora inmobiliaria, sosteniendo las llaves de una casa"
              fill
              priority
              fetchPriority="high"
              sizes="(max-width: 767px) calc(100vw - 48px), (max-width: 1439px) 43vw, 580px"
              className="hero-portrait-photo motion-loop"
            />
            <span className="hero-portrait-shade" aria-hidden="true" />
            <span className="hero-portrait-name">
              <span>Tu asesora inmobiliaria</span>
              <strong>Luz Torres</strong>
            </span>
            <span className="hero-portrait-arrow">
              <ArrowUpRight size={22} aria-hidden="true" />
            </span>
          </Link>
          <svg
            className="hero-seal motion-loop"
            viewBox="0 0 150 150"
            aria-hidden="true"
          >
            <defs>
              <path
                id="hero-seal-path"
                d="M75 75m-57 0a57 57 0 1 1 114 0a57 57 0 1 1-114 0"
              />
            </defs>
            <circle cx="75" cy="75" r="74" fill="#e5e9df" />
            <text>
              <textPath href="#hero-seal-path" textLength="355">
                UN NUEVO LUGAR · UNA NUEVA HISTORIA ·{" "}
              </textPath>
            </text>
            <path
              d="M75 49V101M49 75H101M57 57L93 93M57 93L93 57"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
          <span className="hero-vertical-label" aria-hidden="true">
            Bienvenido a tu siguiente capítulo
          </span>
        </div>
      </div>
      <a href="#seleccion" className="hero-scroll">
        <span>Encuentra tu espacio</span>
        <ArrowDown size={16} className="motion-loop" aria-hidden="true" />
      </a>
    </section>
  );
}
