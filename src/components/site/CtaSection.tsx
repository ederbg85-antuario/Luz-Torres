import { ArrowUpRight } from "lucide-react";
import { whatsappLink } from "@/lib/constants";
import { TrackedLink } from "./TrackedLink";
import { Reveal } from "./Reveal";
export function CtaSection() {
  return (
    <section className="lt-container mt-20">
      <Reveal>
        <div className="flex flex-col items-start justify-between gap-7 rounded-2xl bg-[#f5f7f6] p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <p className="eyebrow">Hablemos</p>
            <h2 className="mt-3 text-3xl font-medium sm:text-4xl">
              Tu siguiente paso empieza aquí.
            </h2>
          </div>
          <TrackedLink
            href={whatsappLink(
              "Hola Luz, me gustaría recibir asesoría inmobiliaria.",
            )}
            event="contacto_whatsapp"
            params={{ ubicacion: "cta_home" }}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary shrink-0 px-7 py-4"
          >
            Escribir a Luz
            <ArrowUpRight size={18} />
          </TrackedLink>
        </div>
      </Reveal>
    </section>
  );
}
