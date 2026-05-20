import Link from "next/link";
import { MessageCircle, ArrowRight } from "lucide-react";
import { whatsappLink } from "@/lib/constants";

export function CtaSection() {
  return (
    <section className="lt-container mt-24">
      <div className="rounded-2xl bg-sombra px-8 py-14 text-center sm:px-14">
        <p className="eyebrow text-bruma">Si quieres trabajar conmigo</p>
        <h2 className="mx-auto mt-3 max-w-2xl text-hero text-hueso">
          Hablemos <span className="text-almendra-claro">sin prisa.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-bruma">
          Cuéntame qué buscas y vemos juntos qué opciones reales tienes. Sin
          compromiso y sin presión — a tu ritmo.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href={whatsappLink(
              "Hola Luz, me gustaría agendar una asesoría inmobiliaria."
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-accent px-6 py-3.5"
          >
            <MessageCircle className="h-4 w-4" />
            Escríbeme por WhatsApp
          </a>
          <Link
            href="/contacto"
            className="btn px-6 py-3.5 bg-hueso text-sombra hover:bg-papel"
          >
            Enviar un mensaje
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
