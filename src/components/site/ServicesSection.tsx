import { Home, Tag, KeyRound, Scale } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

const SERVICES = [
  {
    icon: Home,
    title: "Compra",
    text: "Búsqueda de propiedad, negociación, revisión legal, coordinación de crédito y acompañamiento hasta la escrituración.",
  },
  {
    icon: Tag,
    title: "Venta",
    text: "Valuación de mercado, fotografía profesional, difusión multicanal, filtrado de prospectos y acompañamiento legal.",
  },
  {
    icon: KeyRound,
    title: "Renta",
    text: "Contrato bien redactado, filtrado de inquilinos, depósitos en garantía y administración inicial de la operación.",
  },
  {
    icon: Scale,
    title: "Asesoría técnica-legal",
    text: "Créditos hipotecarios, avalúos, regularización, escrituración, juicios sucesorios y trámites ante notaría.",
  },
];

export function ServicesSection() {
  return (
    <section id="servicios" className="lt-container mt-24">
      <Reveal>
        <SectionHeading
          eyebrow="Servicios"
          title={
            <>
              Una sola asesoría.{" "}
              <span className="text-nogal">El proceso completo.</span>
            </>
          }
          intro="Atiendo cuatro tipos de operación. En todos los casos opero el proceso completo, no servicios aislados."
        />
      </Reveal>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {SERVICES.map((s, i) => (
          <Reveal key={s.title} delay={i * 90} className="h-full">
            <div className="group h-full rounded-xl border-t-2 border-transparent bg-papel p-6 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-almendra hover:shadow-elevated">
              <div className="grid h-12 w-12 place-items-center rounded-md bg-almendra/15 text-nogal transition-colors duration-300 group-hover:bg-nogal group-hover:text-hueso">
                <s.icon className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-carbon">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-humo">{s.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
