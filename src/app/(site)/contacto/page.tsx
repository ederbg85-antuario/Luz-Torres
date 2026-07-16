import type { Metadata } from "next";
import { Mail, MessageCircle, Instagram, MapPin } from "lucide-react";
import { ContactForm } from "@/components/site/ContactForm";
import { TrackedLink } from "@/components/site/TrackedLink";
import { SITE, whatsappLink } from "@/lib/constants";
import type { ContactInterest } from "@/lib/types";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Escríbele a Luz Torres para comprar, vender o rentar una propiedad en México. Asesoría sin prisa y sin compromiso.",
};

export default async function ContactoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const intent = sp.intent === "venta" ? "venta" : "compra";

  const CHANNELS = [
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: SITE.phoneDisplay,
      href: whatsappLink("Hola Luz, me gustaría más información."),
      event: "contacto_whatsapp",
    },
    {
      icon: Mail,
      label: "Correo",
      value: SITE.email,
      href: `mailto:${SITE.email}`,
      event: "contacto_correo",
    },
    {
      icon: Instagram,
      label: "Instagram",
      value: `@${SITE.instagram}`,
      href: SITE.instagramUrl,
      event: "contacto_instagram",
    },
  ];

  return (
    <div className="lt-container py-12">
      <header className="max-w-2xl">
        <p className="eyebrow">Contacto</p>
        <h1 className="mt-3 text-hero">
          Hablemos <span className="text-nogal">sin prisa.</span>
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-humo">
          {intent === "venta"
            ? "¿Quieres vender o rentar tu propiedad? Cuéntame los detalles y coordinamos la valuación."
            : "Cuéntame qué buscas y vemos juntos qué opciones reales tienes. Sin compromiso."}
        </p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        {/* Canales */}
        <div className="space-y-4">
          {CHANNELS.map((c) => (
            <TrackedLink
              key={c.label}
              href={c.href}
              event={c.event}
              params={{ ubicacion: "pagina_contacto" }}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-xl bg-papel p-5 shadow-soft transition-shadow hover:shadow-card"
            >
              <span className="grid h-11 w-11 place-items-center rounded-md bg-almendra/15 text-nogal">
                <c.icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-[11px] font-semibold uppercase tracking-eyebrow text-humo">
                  {c.label}
                </span>
                <span className="block text-sm font-medium text-carbon">
                  {c.value}
                </span>
              </span>
            </TrackedLink>
          ))}

          <div className="flex items-center gap-4 rounded-xl bg-papel p-5 shadow-soft">
            <span className="grid h-11 w-11 place-items-center rounded-md bg-almendra/15 text-nogal">
              <MapPin className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-[11px] font-semibold uppercase tracking-eyebrow text-humo">
                Cobertura
              </span>
              <span className="block text-sm font-medium text-carbon">
                Operaciones en todo México
              </span>
            </span>
          </div>

          <div className="rounded-xl bg-sombra p-6">
            <p className="font-serif text-xl italic text-almendra-claro">
              “{SITE.tagline}”
            </p>
            <p className="mt-3 text-sm text-bruma">
              Respondo todos los mensajes en horario laboral. Si escribes fuera
              de horario, te contacto al día siguiente.
            </p>
          </div>
        </div>

        {/* Formulario */}
        <div className="rounded-xl bg-papel p-6 shadow-card sm:p-8">
          <h2 className="text-xl font-semibold text-carbon">
            Envíame un mensaje
          </h2>
          <p className="mt-1 text-sm text-humo">
            Te responderé personalmente, sin presión.
          </p>
          <div className="mt-6">
            <ContactForm defaultInterest={intent as ContactInterest} />
          </div>
        </div>
      </div>
    </div>
  );
}
