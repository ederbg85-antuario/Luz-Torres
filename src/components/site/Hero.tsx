import Image from "next/image";
import { SearchBar } from "./SearchBar";

const CREDITS = ["Infonavit", "FOVISSSTE", "IMSS", "Crédito bancario"];

export function Hero() {
  return (
    <section className="lt-container pt-8 lg:pt-14">
      <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <div className="animate-fade-up">
          <p className="eyebrow">Asesoría inmobiliaria · Cobertura nacional</p>
          <h1 className="mt-4 text-display leading-[1.05]">
            Casas y departamentos{" "}
            <span className="text-vivo">en venta y renta</span> en México.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-humo">
            Soy Luz Torres. Te acompaño en la compra, venta o renta de tu
            propiedad con un proceso ordenado de principio a fin: búsqueda,
            crédito, trámites legales y entrega de llaves.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-medium text-carbon">
              Trabajo con:
            </span>
            {CREDITS.map((c) => (
              <span
                key={c}
                className="rounded-full bg-papel px-3 py-1.5 text-[12px] font-medium text-petroleo shadow-soft"
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        <div className="relative animate-fade-up">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-sombra shadow-elevated sm:aspect-[5/5] lg:aspect-[4/5]">
            <Image
              src="/luz-keys.jpg"
              alt="Luz Torres, asesora inmobiliaria"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover object-top"
            />
          </div>
          <div className="absolute -bottom-5 -left-5 hidden rounded-xl bg-papel px-5 py-4 shadow-card sm:block">
            <p className="font-serif text-lg italic text-petroleo">
              “Mi trabajo es que no se sienta complicado.”
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 lg:mt-12">
        <SearchBar />
      </div>
    </section>
  );
}
