import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, ArrowRight } from "lucide-react";
import { SITE, whatsappLink } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Sobre Luz Torres · Asesora Inmobiliaria",
  description:
    "Conoce a Luz Torres, asesora inmobiliaria. Acompañamiento técnico, legal y financiero en cada operación de compra, venta o renta.",
};

const VALORES = [
  {
    n: "01",
    title: "Claridad",
    text: "Explico contratos, créditos y procesos sin tecnicismos innecesarios. Entiendes antes de firmar.",
  },
  {
    n: "02",
    title: "Rigor",
    text: "Reviso cada documento, plazo y número personalmente. Lo que entrego está revisado dos veces.",
  },
  {
    n: "03",
    title: "Honestidad",
    text: "Si una propiedad no te conviene, te lo digo. Si una promesa no la puedo cumplir, no la hago.",
  },
  {
    n: "04",
    title: "Discreción",
    text: "Cuido la información financiera, familiar y personal de cada cliente. No comparto casos.",
  },
  {
    n: "05",
    title: "Acompañamiento",
    text: "Sabes en cada momento en qué etapa va la operación, qué sigue y qué documentos necesitas.",
  },
  {
    n: "06",
    title: "Oficio",
    text: "Cuido cada operación con la atención al detalle que pondría si la propiedad fuera mía.",
  },
];

const PILARES = [
  {
    label: "Misión",
    text: "Asesorar con claridad, rigor técnico y trato humano cada operación inmobiliaria que llevo, para que tomes decisiones informadas.",
  },
  {
    label: "Visión",
    text: "Ser la asesora inmobiliaria de referencia para propietarios y compradores que esperan un proceso ordenado.",
  },
  {
    label: "Propósito",
    text: "Que una decisión patrimonial relevante deje de sentirse como un trámite estresante y empiece a sentirse como una decisión bien tomada.",
  },
];

export default function SobreLuzPage() {
  return (
    <div className="py-12">
      {/* Hero */}
      <section className="lt-container">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
          <div>
            <p className="eyebrow">Sobre Luz</p>
            <h1 className="mt-3 text-display">
              Soy Luz Torres. <span className="text-vivo">Esta es mi marca.</span>
            </h1>
            <p className="mt-6 text-[15px] leading-relaxed text-humo">
              Trabajo como asesora inmobiliaria. Mi trabajo consiste en
              acompañar a familias e inversionistas a comprar, vender o rentar
              una propiedad en México.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-humo">
              Cubro el ciclo completo de la operación: búsqueda y valuación,
              asesoría financiera, trámites legales, regularización y entrega.
              Trabajo principalmente con créditos Infonavit, FOVISSSTE, IMSS y
              banca comercial, y reviso personalmente cada documento antes de
              la firma.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={whatsappLink("Hola Luz, me gustaría una asesoría.")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-accent"
              >
                <MessageCircle className="h-4 w-4" />
                Escríbeme
              </a>
              <Link href="/propiedades" className="btn-ghost">
                Ver propiedades
              </Link>
            </div>
          </div>

          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-sombra shadow-elevated">
            <Image
              src="/luz-keys.jpg"
              alt="Luz Torres, asesora inmobiliaria"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-top"
            />
          </div>
        </div>
      </section>

      {/* Frase */}
      <section className="lt-container mt-20">
        <div className="rounded-2xl bg-petroleo px-8 py-14 text-center sm:px-16">
          <p className="eyebrow text-bruma">Frase de marca</p>
          <p className="mx-auto mt-4 max-w-3xl font-serif text-2xl italic text-hueso sm:text-3xl">
            “Una decisión así no debería sentirse complicada. Mi trabajo es que
            no lo sea.”
          </p>
        </div>
      </section>

      {/* Valores */}
      <section className="lt-container mt-20">
        <div className="max-w-2xl">
          <p className="eyebrow">Cómo trabajo</p>
          <h2 className="mt-3 text-hero">
            Seis criterios que <span className="text-vivo">no negocio.</span>
          </h2>
          <p className="mt-4 text-[15px] text-humo">
            Estos son los criterios que aplico en cada operación. Si una
            decisión los pone en conflicto, prefiero perder el negocio.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {VALORES.map((v) => (
            <div key={v.n} className="rounded-xl bg-papel p-6 shadow-card">
              <span className="font-mono text-sm font-semibold text-vivo">
                {v.n}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-carbon">
                {v.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-humo">
                {v.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Misión / Visión / Propósito */}
      <section className="lt-container mt-20">
        <div className="grid gap-5 lg:grid-cols-3">
          {PILARES.map((p) => (
            <div key={p.label} className="rounded-xl bg-papel p-7 shadow-card">
              <p className="eyebrow">{p.label}</p>
              <p className="mt-3 text-[15px] leading-relaxed text-carbon">
                {p.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Alianza */}
      <section className="lt-container mt-20">
        <div className="flex flex-col items-center gap-5 rounded-2xl bg-papel p-10 text-center shadow-card sm:flex-row sm:text-left">
          <Image
            src="/imagen-inmobiliaria.jpg"
            alt={SITE.partner}
            width={88}
            height={88}
            className="rounded-xl"
          />
          <div>
            <p className="eyebrow">Alianza profesional</p>
            <h2 className="mt-2 text-xl font-semibold text-carbon">
              Trabajo de la mano con {SITE.partner}.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-humo">
              Esta alianza me permite ampliar el inventario, respaldar la parte
              de construcción y regularización, y dar a cada operación el
              soporte técnico que merece.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="lt-container mt-20">
        <div className="rounded-2xl bg-sombra px-8 py-14 text-center">
          <h2 className="mx-auto max-w-xl text-hero text-hueso">
            ¿Listo para tu próxima decisión patrimonial?
          </h2>
          <Link href="/contacto" className="btn-accent mx-auto mt-7">
            Agendar una conversación
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
