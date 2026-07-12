import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

const STEPS = [
  {
    n: "01",
    title: "Diagnóstico",
    text: "Escucho tu objetivo y reviso tu situación. Definimos juntos qué es realista antes de mover una sola pieza.",
  },
  {
    n: "02",
    title: "Búsqueda o valuación",
    text: "Encuentro opciones que de verdad encajan, o valúo tu propiedad a precio de mercado con datos concretos.",
  },
  {
    n: "03",
    title: "Crédito y trámites",
    text: "Coordino el crédito hipotecario, el avalúo y la revisión legal de cada documento antes de la firma.",
  },
  {
    n: "04",
    title: "Firma y entrega",
    text: "Acompaño la firma ante notaría hasta la entrega de llaves. Sabes en cada momento qué sigue.",
  },
];

export function ProcessSection() {
  return (
    <section className="lt-container mt-24">
      <Reveal>
        <SectionHeading
          eyebrow="Cómo trabajo"
          title={
            <>
              Acompaño cada operación{" "}
              <span className="text-nogal">de principio a fin.</span>
            </>
          }
          intro="Sin cajas negras: los honorarios, los plazos y los riesgos están sobre la mesa desde el primer mensaje."
        />
      </Reveal>

      <div className="relative mt-12">
        {/* Línea que conecta los pasos (escritorio) */}
        <div
          aria-hidden
          className="absolute left-6 right-6 top-6 hidden h-px bg-gradient-to-r from-almendra/60 via-almendra/30 to-almendra/60 lg:block"
        />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 110}>
              <div className="relative">
                <span className="relative z-10 grid h-12 w-12 place-items-center rounded-full border-2 border-almendra bg-hueso font-mono text-sm font-semibold text-nogal">
                  {s.n}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-carbon">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-humo">
                  {s.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
