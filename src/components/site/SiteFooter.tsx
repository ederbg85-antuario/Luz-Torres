import Link from "next/link";
import { Mail, Instagram, MapPin } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { SITE, whatsappLink } from "@/lib/constants";
import { WhatsAppIcon } from "./WhatsAppFab";
import { TrackedLink } from "./TrackedLink";

const PROPERTY_LINKS = [
  { href: "/propiedades?operation=venta", label: "Casas y deptos en venta" },
  { href: "/propiedades?operation=renta", label: "Propiedades en renta" },
  { href: "/propiedades?property_type=oficina", label: "Oficinas" },
  { href: "/propiedades?property_type=bodega", label: "Bodegas" },
];

const NAV_LINKS = [
  { href: "/propiedades", label: "Todas las propiedades" },
  { href: "/sobre-luz", label: "Sobre Luz Torres" },
  { href: "/contacto", label: "Contacto" },
  { href: "/contacto?intent=venta", label: "Quiero vender mi propiedad" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-sombra text-hueso">
      <div className="lt-container py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Marca */}
          <div className="lg:pr-6">
            <Logo className="h-8 text-hueso" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-bruma">
              Asesoría inmobiliaria integral en México. Compra, venta y renta
              con un proceso ordenado de principio a fin.
            </p>
            <p className="mt-5 font-serif text-lg italic text-almendra-claro">
              “{SITE.tagline}”
            </p>
          </div>

          {/* Propiedades */}
          <div>
            <h3 className="eyebrow text-bruma">Propiedades</h3>
            <ul className="mt-4 space-y-2.5">
              {PROPERTY_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-bruma transition-colors hover:text-hueso"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navegación */}
          <div>
            <h3 className="eyebrow text-bruma">Navegación</h3>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-bruma transition-colors hover:text-hueso"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="eyebrow text-bruma">Contacto</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <TrackedLink
                  href={whatsappLink()}
                  event="contacto_whatsapp"
                  params={{ ubicacion: "footer" }}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-bruma hover:text-hueso"
                >
                  <WhatsAppIcon className="h-4 w-4 shrink-0" />
                  {SITE.phoneDisplay}
                </TrackedLink>
              </li>
              <li>
                <TrackedLink
                  href={`mailto:${SITE.email}`}
                  event="contacto_correo"
                  params={{ ubicacion: "footer" }}
                  className="flex items-center gap-2.5 text-sm text-bruma hover:text-hueso"
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  {SITE.email}
                </TrackedLink>
              </li>
              <li>
                <TrackedLink
                  href={SITE.instagramUrl}
                  event="contacto_instagram"
                  params={{ ubicacion: "footer" }}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-bruma hover:text-hueso"
                >
                  <Instagram className="h-4 w-4 shrink-0" />@{SITE.instagram}
                </TrackedLink>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-bruma">
                <MapPin className="h-4 w-4 shrink-0" />
                Cobertura nacional
              </li>
            </ul>
          </div>
        </div>

        {/* Alianza */}
        <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-white/10 pt-8 text-sm text-bruma">
          <span>En alianza con</span>
          <span className="rounded-md bg-hueso px-2.5 py-1.5 font-semibold text-sombra">
            {SITE.partner}
          </span>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-white/10">
        <div className="lt-container flex flex-col items-center justify-between gap-3 py-6 text-xs text-bruma sm:flex-row">
          <p>
            © {new Date().getFullYear()} {SITE.name} · {SITE.role}. Todos los
            derechos reservados.
          </p>
          <Link
            href="/admin/login"
            className="text-bruma/60 transition-colors hover:text-bruma"
          >
            Panel de administración
          </Link>
        </div>
      </div>
    </footer>
  );
}
