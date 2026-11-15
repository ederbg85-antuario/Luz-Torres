import { ArrowUpRight } from "lucide-react";
import { whatsappLink } from "@/lib/constants";
import { TrackedLink } from "./TrackedLink";
import { Reveal } from "./Reveal";

export function CtaSection() {
  return (
    <section className="home-outro" data-motion-scene>
      <div className="home-editorial-container">
        <p className="home-kicker">Tu próxima historia puede empezar hoy.</p>
        <Reveal>
          <h2>
            ¿Lo <em>encontramos?</em>
          </h2>
        </Reveal>
        <div className="outro-bottom">
          <p>
            Cuéntame dónde te gustaría vivir.
            <br />
            Empecemos por ahí.
          </p>
          <TrackedLink
            href={whatsappLink(
              "Hola Luz, me gustaría recibir asesoría inmobiliaria.",
            )}
            event="contacto_whatsapp"
            params={{ ubicacion: "cta_home" }}
            target="_blank"
            rel="noopener noreferrer"
            className="outro-contact"
          >
            Hablemos{" "}
            <span>
              <ArrowUpRight size={25} aria-hidden="true" />
            </span>
          </TrackedLink>
        </div>
        <div className="outro-line" aria-hidden="true">
          <span className="motion-loop" />
        </div>
      </div>
    </section>
  );
}
