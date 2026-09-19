import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { Property } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { SearchBar } from "./SearchBar";

export function Hero({ properties }: { properties: Property[] }) {
  const main =
    properties.find((p) => p.slug.includes("los-alpes")) ?? properties[0];
  const secondary =
    properties.find((p) => p.slug.includes("el-manzano")) ?? properties[1];
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
        </div>
        <div className="relative pb-12 lg:pb-8">
          <Link
            href={main ? `/propiedades/${main.slug}` : "/propiedades"}
            className="group relative block aspect-[5/4] overflow-hidden rounded-2xl bg-petroleo shadow-elevated sm:aspect-[6/5] lg:aspect-[.93]"
          >
            <Image
              src={main?.cover_image ?? "/luz-outdoor.jpg"}
              alt={main?.title ?? "Luz Torres, asesora inmobiliaria"}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 52vw"
              className="hero-photo object-cover transition-transform duration-700 group-hover:scale-[1.025]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
            <span className="absolute left-5 top-5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-petroleo shadow-card">
              Espacios para descubrir
            </span>
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4 text-white">
              <div>
                <p className="flex items-center gap-1.5 text-sm text-white/85">
                  <MapPin size={14} />
                  {main?.colonia ?? "Conoce el catálogo"}
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {main ? formatPrice(main.price) : "Encuentra tu lugar"}
                </p>
              </div>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-petroleo shadow-card transition-transform group-hover:rotate-45">
                <ArrowUpRight size={22} />
              </span>
            </div>
          </Link>
          {secondary && (
            <Link
              href={`/propiedades/${secondary.slug}`}
              className="absolute -bottom-1 left-5 right-5 flex items-center gap-4 rounded-lg bg-white p-3 shadow-floating sm:left-auto sm:right-[-12px] sm:w-[320px]"
            >
              <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-md">
                <Image
                  src={secondary.cover_image ?? "/luz-keys.jpg"}
                  alt={secondary.title}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-nogal">
                  También en venta
                </p>
                <p className="mt-1 truncate text-sm font-semibold">
                  {secondary.colonia}
                </p>
                <p className="mt-1 text-sm text-humo">
                  {formatPrice(secondary.price)}
                </p>
              </div>
              <ArrowUpRight className="ml-auto h-5 w-5 shrink-0 text-nogal" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
