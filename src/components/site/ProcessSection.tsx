import { SectionHeading } from "./SectionHeading";

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
      <SectionHeading
        eyebrow="Cómo trabajo"
        title={
          <>
            Acompaño cada operación{" "}
            <span className="text-vivo">de principio a fin.</span>
          </>
        }
        intro="Sin cajas negras: los honorarios, los plazos y los riesgos están sobre la mesa desde el primer mensaje."
      />

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s) => (
          <div key={s.n} className="rounded-xl bg-papel p-6 shadow-card">
            <span className="font-mono text-sm font-semibold text-vivo">
              {s.n}
            </span>
            <h3 className="mt-3 text-lg font-semibold text-carbon">
              {s.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-humo">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
