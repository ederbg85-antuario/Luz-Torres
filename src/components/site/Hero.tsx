import Image from "next/image";
import { ShieldCheck, Landmark, FileCheck2 } from "lucide-react";
import { SearchBar } from "./SearchBar";

const TRUST = [
  { icon: Landmark, text: "Infonavit · FOVISSSTE · Bancario" },
  { icon: FileCheck2, text: "Trámites legales y notaría" },
  { icon: ShieldCheck, text: "Acompañamiento de principio a fin" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Fondo cálido: resplandores café/almendra sobre hueso */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-32 right-[-10%] h-[480px] w-[480px] rounded-full bg-almendra/15 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-8%] h-[420px] w-[420px] rounded-full bg-nogal/10 blur-3xl" />
        <div className="absolute left-1/3 top-1/4 h-64 w-64 rounded-full bg-vivo/5 blur-3xl" />
      </div>

      <div className="lt-container pt-10 lg:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div>
            <p className="eyebrow animate-fade-up">
              Asesoría inmobiliaria · Cobertura nacional
            </p>
            <h1 className="mt-5 text-display animate-fade-up delay-75">
              Casas y departamentos{" "}
              <span className="text-nogal">en venta y renta</span> en México.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-humo animate-fade-up delay-150">
              Soy Luz Torres. Te acompaño en la compra, venta o renta de tu
              propiedad con un proceso ordenado de principio a fin: búsqueda,
              crédito, trámites legales y entrega de llaves.
            </p>

            <ul className="mt-8 space-y-2.5 animate-fade-up delay-300">
              {TRUST.map((t) => (
                <li
                  key={t.text}
                  className="flex items-center gap-3 text-[14px] font-medium text-carbon"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-almendra/15 text-nogal">
                    <t.icon className="h-4 w-4" strokeWidth={2} />
                  </span>
                  {t.text}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative animate-scale-in delay-150">
            {/* Marco café desplazado detrás de la foto */}
            <div
              aria-hidden
              className="absolute -bottom-4 -right-4 hidden h-full w-full rounded-2xl border-2 border-almendra/40 sm:block"
            />
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-cacao shadow-elevated sm:aspect-[5/5] lg:aspect-[4/5]">
              <Image
                src="/luz-keys.jpg"
                alt="Luz Torres, asesora inmobiliaria"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover object-top"
              />
              {/* Velo cálido inferior para dar profundidad */}
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-cacao-oscuro/50 to-transparent"
              />
            </div>
            <div className="absolute -bottom-5 -left-5 hidden max-w-[260px] rounded-xl border-l-4 border-almendra bg-papel px-5 py-4 shadow-card animate-float sm:block">
              <p className="font-serif text-lg italic leading-snug text-petroleo">
                “Mi trabajo es que no se sienta complicado.”
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 lg:mt-14 animate-fade-up delay-450">
          <SearchBar />
        </div>
      </div>
    </section>
  );
}
