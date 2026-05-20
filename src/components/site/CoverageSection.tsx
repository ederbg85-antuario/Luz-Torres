import Link from "next/link";
import { MapPin } from "lucide-react";
import { COVERAGE_STATES } from "@/lib/constants";
import { SectionHeading } from "./SectionHeading";

export function CoverageSection() {
  return (
    <section id="cobertura" className="lt-container mt-24">
      <div className="overflow-hidden rounded-2xl bg-petroleo">
        <div className="p-8 sm:p-12">
          <p className="eyebrow text-bruma">Cobertura</p>
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
            {COVERAGE_STATES.map((c) => (
              <Link
                key={c.estado}
                href={`/propiedades?estado=${encodeURIComponent(c.estado)}`}
                className="group rounded-xl bg-sombra/60 p-5 ring-1 ring-white/5 transition-colors hover:bg-sombra"
              >
                <MapPin
                  className="h-5 w-5 text-vivo"
                  strokeWidth={2}
                />
                <h3 className="mt-3 font-semibold text-hueso">{c.estado}</h3>
                <p className="mt-1 text-[13px] leading-snug text-bruma">
                  {c.zona}
                </p>
              </Link>
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
    </section>
  );
}
