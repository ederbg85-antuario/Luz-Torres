import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, KeyRound } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { MotionToggle } from "./HomeMotion";

export function Hero() {
  return (
    <section className="lt-container pb-6 pt-7 sm:pt-12">
      <div className="grid items-center gap-9 lg:grid-cols-[.95fr_1.05fr] lg:gap-14">
        <div className="relative z-10 py-3 lg:py-10">
          <p className="eyebrow animate-fade-up">
          Casas y departamentos · México
          </p>
          <h1 className="mt-5 max-w-xl text-[44px] font-medium leading-[1.04] tracking-[-.045em] sm:text-[62px] lg:text-[70px] animate-fade-up delay-75">
            Tu próximo
            <br />
            espacio.
            <br />
            <span className="font-serif font-normal italic text-nogal">
              A tu manera.
            </span>
          </h1>
          <p className="mt-5 max-w-sm text-base leading-relaxed text-humo animate-fade-up delay-150">
            Compra, renta o vende con Luz Torres.
            <br />
            Cada paso, bien acompañado.
          </p>
          <div className="mt-8 animate-fade-up delay-300">
            <SearchBar />
          </div>
          <MotionToggle />
        </div>
        <div className="relative pb-12 lg:pb-8" data-motion-scene>
          <Link
            href="/sobre-luz"
            aria-label="Conoce a Luz Torres, tu asesora inmobiliaria"
            className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-petroleo shadow-elevated sm:aspect-[6/5] lg:aspect-[.93]"
          >
            <Image
              src="/luz-keys.jpg"
              alt="Luz Torres, asesora inmobiliaria, sosteniendo las llaves de una casa"
              fill
              priority
              fetchPriority="high"
              sizes="(max-width: 1024px) 100vw, 52vw"
              className="hero-photo object-cover object-[center_35%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
            <span className="absolute left-5 top-5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-petroleo shadow-card">
              Conoce a tu asesora
            </span>
            <div className="absolute bottom-24 left-6 right-6 flex items-end justify-between gap-4 text-white">
              <div>
                <p className="text-sm text-white/85">
                  Asesora inmobiliaria
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  Luz Torres
                </p>
              </div>
              <span className="mb-6 grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-petroleo shadow-card transition-transform group-hover:rotate-45">
                <ArrowUpRight size={22} />
              </span>
            </div>
          </Link>
          <Link href="/contacto" className="hero-contact group absolute -bottom-1 left-4 right-4 flex items-center gap-4 rounded-lg bg-white p-4 shadow-floating sm:left-auto sm:right-[-12px] sm:w-[340px]">
            <span className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-[#f2ece4] text-nogal" aria-hidden="true">
              <svg viewBox="0 0 64 64" className="motion-loop key-orbit absolute inset-0 h-full w-full fill-none">
                <circle cx="32" cy="32" r="27" stroke="currentColor" strokeOpacity=".25" strokeDasharray="3 7" />
                <circle cx="32" cy="5" r="3" fill="currentColor" />
              </svg>
              <KeyRound size={27} className="motion-loop key-float" />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-semibold uppercase tracking-[.14em] text-nogal">Tu siguiente paso</span>
              <span className="mt-1 block text-lg font-semibold text-petroleo">Las llaves de una nueva etapa.</span>
              <span className="mt-1 block text-xs text-humo">Cuéntale a Luz qué estás buscando</span>
            </span>
            <ArrowUpRight className="ml-auto h-5 w-5 shrink-0 text-nogal transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
