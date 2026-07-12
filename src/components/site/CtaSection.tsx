import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { whatsappLink } from "@/lib/constants";
import { Reveal } from "./Reveal";
import { WhatsAppIcon } from "./WhatsAppFab";

export function CtaSection() {
  return (
    <section className="lt-container mt-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-2xl bg-sombra px-8 py-14 text-center sm:px-14">
          {/* Resplandor cálido sutil */}
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-almendra/10 blur-3xl"
          />
          <div className="relative">
            <p className="eyebrow text-almendra-claro">
              Si quieres trabajar conmigo
            </p>
            <h2 className="mx-auto mt-3 max-w-2xl text-hero text-hueso">
              Hablemos{" "}
              <span className="text-almendra-claro">sin prisa.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-bruma">
              Cuéntame qué buscas y vemos juntos qué opciones reales tienes.
              Sin compromiso y sin presión — a tu ritmo.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href={whatsappLink(
                  "Hola Luz, me gustaría agendar una asesoría inmobiliaria."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp px-6 py-3.5"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Escríbeme por WhatsApp
              </a>
              <Link
                href="/contacto"
                className="btn px-6 py-3.5 bg-hueso text-sombra hover:-translate-y-0.5 hover:bg-papel hover:shadow-card"
              >
                Enviar un mensaje
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
