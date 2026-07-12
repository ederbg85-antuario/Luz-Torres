import Link from "next/link";
import { MapPin } from "lucide-react";
import { COVERAGE_STATES } from "@/lib/constants";
import { Reveal } from "./Reveal";

export function CoverageSection() {
  return (
    <section id="cobertura" className="lt-container mt-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-2xl bg-petroleo">
          {/* Resplandor cálido sutil */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-almendra/10 blur-3xl"
          />
          <div className="relative p-8 sm:p-12">
            <p className="eyebrow text-almendra-claro">Cobertura</p>
            <h2 className="mt-3 text-hero text-hueso">
              Te acompaño en{" "}
              <span className="text-almendra-claro">todo México.</span>
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-bruma">
              Atiendo operaciones residenciales y comerciales en las zonas de
              mayor plusvalía del país. Estas son las regiones donde tengo
              propiedades y red de aliados.
            </p>

            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {COVERAGE_STATES.map((c, i) => (
                <Reveal key={c.estado} delay={i * 60}>
                  <Link
                    href={`/propiedades?estado=${encodeURIComponent(c.estado)}`}
                    className="group block h-full rounded-xl bg-sombra/60 p-5 ring-1 ring-white/5 transition-all duration-300 hover:-translate-y-1 hover:bg-sombra hover:ring-almendra/30"
                  >
                    <MapPin
                      className="h-5 w-5 text-almendra-claro transition-transform duration-300 group-hover:scale-110"
                      strokeWidth={2}
                    />
                    <h3 className="mt-3 font-semibold text-hueso">
                      {c.estado}
                    </h3>
                    <p className="mt-1 text-[13px] leading-snug text-bruma">
                      {c.zona}
                    </p>
                  </Link>
                </Reveal>
              ))}
            </div>

            <p className="mt-8 text-sm text-bruma">
              ¿No ves tu estado?{" "}
              <Link
                href="/contacto"
                className="font-semibold text-almendra-claro underline-offset-4 hover:underline"
              >
                Escríbeme
              </Link>{" "}
              — la cobertura crece con cada operación.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
