import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Check } from "lucide-react";
import { Reveal } from "./Reveal";

export function HomeJourney() {
  return (
    <section className="lt-container mt-20 sm:mt-28">
      <div className="grid gap-6 md:grid-cols-2">
        <Reveal className="h-full">
          <div className="relative flex h-full min-h-[340px] flex-col justify-between overflow-hidden rounded-2xl bg-nogal p-8 text-white shadow-elevated sm:p-10">
            <div>
              <p className="text-xs font-medium uppercase tracking-[.18em] text-white/70">
                Para propietarios
              </p>
              <h2 className="mt-5 max-w-sm text-4xl font-medium leading-[1.08] text-white">
                Tu propiedad.
                <br />
                <span className="font-serif font-normal italic">
                  Un nuevo comienzo.
                </span>
              </h2>
              <p className="mt-4 max-w-xs text-base text-white/80">
                Valuación, promoción y acompañamiento hasta la firma.
              </p>
            </div>
            <Link
              href="/vende-tu-propiedad"
              className="mt-8 inline-flex w-fit items-center gap-5 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-nogal shadow-card transition-transform hover:-translate-y-1"
            >
              Quiero vender
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </Reveal>
        <Reveal delay={100} className="h-full">
          <div className="grid h-full grid-cols-[1fr_1.05fr] overflow-hidden rounded-2xl bg-white shadow-card">
            <div className="relative min-h-[340px]">
              <Image
                src="/luz-outdoor.jpg"
                alt="Luz Torres"
                fill
                sizes="(max-width: 768px) 45vw, 25vw"
                className="object-cover object-top"
              />
            </div>
            <div className="flex flex-col justify-center p-5 sm:p-8">
              <p className="eyebrow">Conoce a Luz</p>
              <h2 className="mt-3 text-2xl font-medium leading-tight sm:text-3xl">
                Cerca de ti.
                <br />
                <span className="text-petroleo">En cada paso.</span>
              </h2>
              <ul className="mt-6 space-y-3 text-sm text-humo">
                {[
                  "Asesoría personal",
                  "Compra, venta y renta",
                  "Proceso claro",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <Check size={15} className="shrink-0 text-almendra" />
                    {t}
                  </li>
                ))}
              </ul>
              <Link
                href="/sobre-luz"
                className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-nogal"
              >
                Conóceme
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
