import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Check, ArrowUpRight } from "lucide-react";
import { TrackedLink } from "@/components/site/TrackedLink";
import { Reveal } from "@/components/site/Reveal";
import { SITE, whatsappLink } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Sobre Luz Torres · Asesora Inmobiliaria",
  description:
    "Conoce a Luz Torres, asesora inmobiliaria. Acompañamiento técnico, legal y financiero en cada operación de compra, venta o renta.",
  alternates: { canonical: "/sobre-luz" },
};

export default function SobreLuzPage() {
  return (
    <div className="lt-container py-10 sm:py-16">
      <section className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-elevated">
          <Image
            src="/luz-keys.jpg"
            alt="Luz Torres, asesora inmobiliaria"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-top"
          />
        </Reveal>
        <Reveal delay={120}>
          <p className="eyebrow">Tu asesora inmobiliaria</p>
          <h1 className="mt-4 text-display">
            Soy Luz.
            <br />
            <span className="text-nogal">Te acompaño.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-humo">
            Comprar, vender o rentar. Una decisión importante, con alguien de tu
            lado.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              "Opciones claras, sin presión.",
              "Orientación sobre créditos y documentos.",
              "Acompañamiento hasta la entrega.",
            ].map((text) => (
              <li key={text} className="flex items-center gap-3 text-sm">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#f4f0ec] text-nogal">
                  <Check size={17} />
                </span>
                {text}
              </li>
            ))}
          </ul>
          <TrackedLink
            href={whatsappLink("Hola Luz, me gustaría una asesoría.")}
            event="contacto_whatsapp"
            params={{ ubicacion: "sobre_luz" }}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-accent mt-9"
          >
            <MessageCircle size={18} />
            Hablemos
          </TrackedLink>
        </Reveal>
      </section>
      <Reveal className="mt-14 grid gap-5 md:grid-cols-[1.3fr_1fr]">
        <div className="flex items-center gap-5 rounded-xl bg-white p-7 shadow-card">
          <Image
            src="/imagen-inmobiliaria.jpg"
            alt={SITE.partner}
            width={72}
            height={72}
            className="rounded-md"
          />
          <div>
            <p className="eyebrow">Alianza profesional</p>
            <h2 className="mt-2 text-xl font-semibold">{SITE.partner}</h2>
            <p className="mt-2 text-sm text-humo">
              Respaldo técnico para tu siguiente paso.
            </p>
          </div>
        </div>
        <Link
          href="/propiedades"
          className="group flex items-center justify-between gap-5 rounded-xl bg-petroleo p-7 text-white shadow-card"
        >
          <span>
            <span className="block text-xs uppercase tracking-widest text-white/65">
              Encuentra tu espacio
            </span>
            <span className="mt-3 block text-2xl font-medium">
              Ver propiedades
            </span>
          </span>
          <ArrowUpRight
            className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
            size={30}
          />
        </Link>
      </Reveal>
    </div>
  );
}
