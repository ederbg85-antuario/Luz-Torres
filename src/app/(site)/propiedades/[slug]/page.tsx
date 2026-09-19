import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Maximize,
  BedDouble,
  Bath,
  Car,
  Trees,
  MapPin,
  MessageCircle,
  CalendarDays,
  ArrowLeft,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";
import { getPropertyBySlug, getRelatedProperties } from "@/lib/data";
import { PropertyGallery } from "@/components/site/PropertyGallery";
import { PropertyCard } from "@/components/site/PropertyCard";
import { PropertyMap } from "@/components/site/PropertyMap";
import { PropertyTracking } from "@/components/site/PropertyTracking";
import { TrackedLink } from "@/components/site/TrackedLink";
import { VisitBooking, BookVisitButton } from "@/components/site/VisitBooking";
import {
  PROPERTY_TYPE_LABELS,
  SITE,
  statusBadge,
  whatsappLink,
} from "@/lib/constants";
import { amenityIcon } from "@/lib/amenity-icons";
import { formatArea, formatPrice } from "@/lib/format";
import { propertyJsonLd, propertyMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const property = await getPropertyBySlug((await params).slug);
  return property
    ? propertyMetadata(property)
    : { title: "Propiedad no encontrada" };
}
export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const property = await getPropertyBySlug((await params).slug);
  if (!property) notFound();
  const related = await getRelatedProperties(property);
  const images = [
    ...new Set([
      ...(property.cover_image ? [property.cover_image] : []),
      ...(property.images ?? []),
    ]),
  ];
  const specs = [
    {
      icon: Maximize,
      label: "Construcción",
      value: property.area_m2 ? formatArea(property.area_m2) : null,
    },
    {
      icon: Trees,
      label: "Terreno",
      value:
        property.property_type !== "departamento" && property.lot_m2
          ? formatArea(property.lot_m2)
          : null,
    },
    {
      icon: BedDouble,
      label: "Recámaras",
      value: property.bedrooms ? String(property.bedrooms) : null,
    },
    {
      icon: Bath,
      label: "Baños",
      value: property.bathrooms ? String(property.bathrooms) : null,
    },
    {
      icon: Car,
      label: "Estacionamientos",
      value: property.parking ? String(property.parking) : null,
    },
  ].filter((s) => s.value);
  const location = [property.colonia, property.municipio, property.estado]
    .filter(Boolean)
    .join(", ");
  const name = `${PROPERTY_TYPE_LABELS[property.property_type]} en ${property.operation}`;
  const amenities = [...(property.amenities ?? [])].sort(
    (a, b) =>
      Number(
        /alberca|gimnasio|seguridad|terraza|jardín|patio|estacionamiento/i.test(
          b,
        ),
      ) -
      Number(
        /alberca|gimnasio|seguridad|terraza|jardín|patio|estacionamiento/i.test(
          a,
        ),
      ),
  );
  const waMessage = `Hola Luz, me interesa ${property.title}. ¿Me compartes disponibilidad para visitarla? https://luztorres.com/propiedades/${property.slug}`;
  const contact = (
    <>
      <BookVisitButton className="btn-primary w-full py-4">
        <CalendarDays size={18} />
        Solicitar visita
      </BookVisitButton>
      <TrackedLink
        href={whatsappLink(waMessage)}
        event="contacto_whatsapp"
        params={{
          ubicacion: "ficha_propiedad",
          property_id: property.id,
          property_title: property.title,
        }}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-accent mt-3 w-full py-4"
      >
        <MessageCircle size={18} />
        Consultar por WhatsApp
      </TrackedLink>
      <p className="mt-4 text-center text-xs leading-relaxed text-humo">
        Elige tu fecha. Luz te confirma la disponibilidad.
      </p>
    </>
  );
  return (
    <article className="lt-container pb-20 pt-7 sm:pt-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(propertyJsonLd(property, images)),
        }}
      />
      <PropertyTracking
        id={property.id}
        title={property.title}
        price={property.price}
        operation={property.operation}
      />
      <nav
        aria-label="Ruta de navegación"
        className="flex items-center justify-between gap-3 text-sm"
      >
        <Link
          href="/propiedades"
          className="inline-flex items-center gap-2 text-humo hover:text-petroleo"
        >
          <ArrowLeft size={16} />
          Todas las propiedades
        </Link>
        <span className="rounded-full bg-petroleo px-3 py-1.5 text-xs font-semibold text-white">
          {statusBadge(property.operation, property.status)}
        </span>
      </nav>
      <header className="mb-7 mt-7">
        <p className="eyebrow">{name}</p>
        <h1 className="mt-3 text-3xl font-medium leading-tight tracking-[-.03em] sm:text-4xl lg:text-[44px]">
          {property.colonia || property.title}
        </h1>
        <p className="mt-3 flex items-center gap-2 text-sm text-humo">
          <MapPin size={16} className="shrink-0 text-almendra" />
          {property.municipio}, {property.estado}
        </p>
        <p className="mt-4 text-2xl font-semibold tracking-tight text-petroleo lg:hidden">
          {formatPrice(property.price, property.operation)}
        </p>
      </header>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div className="min-w-0">
          <PropertyGallery
            images={images}
            type={property.property_type}
            title={property.title}
          />
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {specs.map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-3 rounded-lg bg-white px-4 py-5 shadow-soft"
              >
                <s.icon
                  size={22}
                  strokeWidth={1.5}
                  className="shrink-0 text-nogal"
                />
                <div>
                  <p className="text-lg font-semibold tabular-nums">
                    {s.value}
                  </p>
                  <p className="text-xs text-humo">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-7 rounded-xl bg-white p-6 shadow-card lg:hidden">
            {contact}
          </div>
          {amenities.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xl font-semibold">
                Lo que hace especial este espacio
              </h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {amenities.slice(0, 6).map((a) => {
                  const Icon = amenityIcon(a);
                  return (
                    <li
                      key={a}
                      className="flex items-center gap-3 rounded-md bg-[#f5f7f6] p-4 text-sm"
                    >
                      <Icon size={19} className="shrink-0 text-petroleo" />
                      {a}
                    </li>
                  );
                })}
              </ul>
              {amenities.length > 6 && (
                <details className="mt-4 rounded-lg bg-white p-5 shadow-soft">
                  <summary className="flex items-center justify-between gap-3 text-sm font-semibold text-nogal">
                    Ver las {amenities.length} características
                    <ChevronDown size={18} className="details-chevron" />
                  </summary>
                  <ul className="mt-5 grid gap-3 text-sm text-humo sm:grid-cols-2">
                    {amenities.slice(6).map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </details>
              )}
            </section>
          )}
          {property.description && (
            <details className="mt-6 rounded-xl bg-white p-6 shadow-soft">
              <summary className="flex items-center justify-between gap-3 text-lg font-semibold">
                Descripción y detalles
                <ChevronDown size={20} className="details-chevron text-nogal" />
              </summary>
              <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-humo">
                {property.description}
              </p>
            </details>
          )}
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Explora la zona</h2>
                <p className="mt-2 text-sm text-humo">{location}</p>
              </div>
              <MapPin size={24} className="shrink-0 text-almendra" />
            </div>
            <PropertyMap property={property} />
            <p className="mt-3 text-xs text-humo">
              Ubicación aproximada. Dirección exacta al confirmar tu visita.
            </p>
          </section>
        </div>
        <aside className="sticky top-28 hidden lg:block">
          <div className="rounded-xl bg-white p-7 shadow-elevated">
            <p className="eyebrow">Precio de {property.operation}</p>
            <p className="mt-3 text-[29px] font-semibold tracking-tight tabular-nums text-petroleo">
              {formatPrice(property.price, property.operation)}
            </p>
            <p className="mt-2 text-sm text-humo">
              {property.colonia || property.municipio}
            </p>
            <div className="mt-7">{contact}</div>
            <div className="mt-7 flex items-center gap-3 rounded-lg bg-[#f5f7f6] p-4">
              <Image
                src="/luz-keys.jpg"
                alt="Luz Torres"
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover object-top"
              />
              <div>
                <p className="text-sm font-semibold">{SITE.name}</p>
                <p className="mt-1 text-xs text-humo">
                  Tu asesora inmobiliaria
                </p>
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-humo">
            Información y disponibilidad sujetas a actualización.
          </p>
        </aside>
      </div>
      {related.length > 0 && (
        <section className="mt-20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-3xl font-medium">Más espacios para ti</h2>
            <Link
              href="/propiedades"
              className="inline-flex items-center gap-2 text-sm font-semibold text-nogal"
            >
              Explorar
              <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <PropertyCard key={p.id} property={p} index={i} />
            ))}
          </div>
        </section>
      )}
      <VisitBooking
        propertyId={property.id}
        propertyTitle={property.title}
        operation={property.operation}
        price={property.price}
        location={location}
      />
    </article>
  );
}
