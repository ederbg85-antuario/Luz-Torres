import { Search, MapPin, KeyRound } from "lucide-react";
import { Reveal } from "./Reveal";

const steps = [
  { number: "01", Icon: Search, title: "Encuentra tu espacio", description: "Revisamos zona, presupuesto y lo que necesitas." },
  { number: "02", Icon: MapPin, title: "Conócelo en persona", description: "Coordinamos visitas y resolvemos tus dudas." },
  { number: "03", Icon: KeyRound, title: "Decide con confianza", description: "Te acompaño en la negociación y el proceso de compra." },
];

export function HomeProcess() {
  return (
    <section className="lt-container mt-16 sm:mt-24" aria-labelledby="home-process-title" data-motion-scene>
      <Reveal>
        <div className="home-process rounded-2xl bg-[#f5f7f6] px-6 py-8 sm:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">De la búsqueda a las llaves</p>
              <h2 id="home-process-title" className="mt-3 text-2xl font-medium sm:text-3xl">Un paso más cerca de tu nuevo hogar.</h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-humo">Con Luz, tienes a quién preguntar en cada etapa.</p>
          </div>
          <ol className="process-steps relative mt-9 grid gap-7 md:grid-cols-3 md:gap-9">
            {steps.map(({ number, Icon, title, description }, index) => (
              <li key={number} className="relative flex gap-4 md:block">
                <div className="process-node relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-petroleo shadow-soft">
                  <span aria-hidden="true" className={`motion-loop process-pulse process-pulse-${index} absolute inset-0 rounded-full bg-petroleo/15`} />
                  <Icon size={21} aria-hidden="true" className="relative" />
                </div>
                <div className="md:mt-5">
                  <p className="text-xs font-medium text-nogal">{number}</p>
                  <h3 className="mt-1 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-humo">{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>
    </section>
  );
}
