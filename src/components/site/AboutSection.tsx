import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SITE } from "@/lib/constants";

export function AboutSection() {
  return (
    <section className="lt-container mt-24">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
        <div className="relative order-2 aspect-[4/5] overflow-hidden rounded-2xl bg-lino shadow-elevated lg:order-1">
          <Image
            src="/luz-outdoor.jpg"
            alt="Luz Torres, asesora inmobiliaria"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div className="order-1 lg:order-2">
          <p className="eyebrow">Sobre Luz</p>
          <h2 className="mt-3 text-hero">
            Soy Luz Torres. Esta es mi{" "}
            <span className="text-vivo">forma de trabajar.</span>
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-humo">
            Acompaño a familias e inversionistas a comprar, vender o rentar una
            propiedad. Cubro el ciclo completo de la operación: búsqueda y
            valuación, asesoría financiera, trámites legales y entrega.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-humo">
            Trabajo con calma. No presiono al cliente, no genero urgencia
            artificial y prefiero explicar el proceso paso a paso antes de
            cerrar una operación.
          </p>

          <blockquote className="mt-6 border-l-2 border-almendra pl-5 font-serif text-xl italic text-petroleo">
            “Una decisión así no debería sentirse complicada. Mi trabajo es que
            no lo sea.”
          </blockquote>

          <div className="mt-7 flex items-center gap-3 rounded-xl bg-papel p-4 shadow-soft">
            <Image
              src="/imagen-inmobiliaria.jpg"
              alt={SITE.partner}
              width={48}
              height={48}
              className="rounded-md"
            />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-eyebrow text-humo">
                En alianza con
              </p>
              <p className="text-sm font-semibold text-carbon">
                {SITE.partner}
              </p>
            </div>
          </div>

          <Link href="/sobre-luz" className="btn-primary mt-7">
            Conoce más sobre mí
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
