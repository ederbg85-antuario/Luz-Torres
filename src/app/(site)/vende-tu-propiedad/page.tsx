import type { Metadata } from "next";
import { CheckCircle2, Home, LineChart, ShieldCheck } from "lucide-react";
import { SellerForm } from "@/components/site/SellerForm";

export const metadata: Metadata = {
  title: "Vende tu propiedad",
  description:
    "Solicita una valuación para vender tu casa, departamento, terreno u oficina con Luz Torres. Estrategia, difusión y acompañamiento legal.",
  alternates: { canonical: "/vende-tu-propiedad" },
};

const BENEFITS = [
  { icon: LineChart, title: "Valuación con mercado real", text: "Definimos un precio competitivo con datos y contexto, no con promesas." },
  { icon: Home, title: "Estrategia de comercialización", text: "Fotografía, difusión y filtrado de prospectos para cuidar tu tiempo." },
  { icon: ShieldCheck, title: "Acompañamiento hasta la firma", text: "Revisión legal, negociación y coordinación del proceso completo." },
];

export default function SellPropertyPage() {
  return (
    <div className="lt-container py-12 sm:py-16">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <section>
          <p className="eyebrow">Para propietarios</p>
          <h1 className="mt-3 max-w-xl text-hero">Vende tu propiedad con una estrategia clara.</h1>
          <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-humo">
            Cuéntame sobre tu inmueble y revisaré el contexto de mercado antes de proponerte el siguiente paso. La solicitud no confirma ningún servicio ni tiene costo.
          </p>
          <div className="mt-8 space-y-4">
            {BENEFITS.map((benefit) => (
              <div key={benefit.title} className="flex gap-3 rounded-xl bg-papel p-4 shadow-soft">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-almendra/15 text-nogal"><benefit.icon className="h-5 w-5" /></span>
                <span><span className="block font-semibold text-carbon">{benefit.title}</span><span className="mt-1 block text-sm leading-relaxed text-humo">{benefit.text}</span></span>
              </div>
            ))}
          </div>
          <p className="mt-7 flex items-center gap-2 text-sm text-humo"><CheckCircle2 className="h-4 w-4 text-nogal" /> Respuesta personal y sin compromiso.</p>
        </section>
        <section className="rounded-2xl bg-papel p-6 shadow-card sm:p-8">
          <p className="eyebrow">Solicitud de valuación</p>
          <h2 className="mt-2 text-2xl font-semibold text-carbon">Conozcamos tu propiedad</h2>
          <p className="mt-2 text-sm leading-relaxed text-humo">Completa los campos obligatorios y te contactaré para revisar disponibilidad y siguientes pasos.</p>
          <div className="mt-6"><SellerForm /></div>
        </section>
      </div>
    </div>
  );
}
