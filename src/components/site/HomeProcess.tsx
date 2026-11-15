import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { ArchitectureGraphic } from "./ArchitectureGraphic";

export function HomeProcess() {
  return (
    <section
      className="home-process-section home-editorial-container"
      aria-labelledby="home-process-title"
      data-motion-scene
    >
      <div className="process-art">
        <span className="process-art-label">De la idea a las llaves</span>
        <div className="process-orbit motion-loop" aria-hidden="true" />
        <ArchitectureGraphic />
        <span className="process-art-caption">
          Un espacio. Muchas posibilidades.
        </span>
      </div>
      <div className="process-story">
        <Reveal>
          <p className="home-kicker">Contigo, en cada paso</p>
          <h2 id="home-process-title" className="home-display">
            De imaginarlo
            <br />
            <em>a hacerlo tuyo.</em>
          </h2>
        </Reveal>
        <ol className="process-editorial-steps">
          {[
            [
              "01",
              "Primero, te escucho.",
              "Zona, presupuesto y lo que necesitas para vivir como quieres.",
            ],
            [
              "02",
              "Después, lo conocemos.",
              "Visitamos las opciones y resolvemos tus dudas sobre cada propiedad.",
            ],
            [
              "03",
              "Y damos el siguiente paso.",
              "Te acompaño en la negociación y el proceso de compra.",
            ],
          ].map(([number, title, description], i) => (
            <li key={number}>
              <span
                className={`process-step-number motion-loop process-step-${i}`}
              >
                {number}
              </span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </li>
          ))}
        </ol>
        <Link href="/contacto" className="home-inline-cta">
          Empecemos por lo que buscas{" "}
          <ArrowUpRight size={19} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
