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
  ChevronRight,
  Building2,
  Tag,
  KeyRound,
  Landmark,
  Ruler,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { getPropertyBySlug, getRelatedProperties } from "@/lib/data";
import { PropertyGallery } from "@/components/site/PropertyGallery";
import { PropertyCard } from "@/components/site/PropertyCard";
import { PropertyMap } from "@/components/site/PropertyMap";
import { TrackedLink } from "@/components/site/TrackedLink";
import {
  VisitBooking,
  BookVisitButton,
} from "@/components/site/VisitBooking";
import {
  OPERATION_LABELS,
  PROPERTY_TYPE_LABELS,
  PROPERTY_STATUS_LABELS,
  SITE,
  statusBadge,
  whatsappLink,
} from "@/lib/constants";
import { amenityIcon } from "@/lib/amenity-icons";
import { formatArea, formatDate, formatPrice } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) return { title: "Propiedad no encontrada" };
  return {
    title: property.title,
    description:
      property.description?.slice(0, 160) ??
      `${property.title} — ${formatPrice(property.price, property.operation)}.`,
    openGraph: {
      title: property.title,
      description: property.description ?? property.title,
      images: property.cover_image ? [property.cover_image] : undefined,
    },
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const related = await getRelatedProperties(property);
  const images = [
    ...(property.cover_image ? [property.cover_image] : []),
    ...(property.images ?? []),
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
      value: property.lot_m2 ? formatArea(property.lot_m2) : null,
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
      label: "Estacionamiento",
      value: property.parking ? String(property.parking) : null,
    },
  ].filter((s) => s.value);

  const pricePerM2 =
    property.operation === "venta" && property.area_m2
      ? property.price / property.area_m2
      : null;

  const generalData = [
    {
      icon: Building2,
      label: "Tipo de inmueble",
      value: PROPERTY_TYPE_LABELS[property.property_type],
    },
    {
      icon: Tag,
      label: "Operación",
      value: OPERATION_LABELS[property.operation],
    },
    {
      icon: ShieldCheck,
      label: "Estatus",
      value: PROPERTY_STATUS_LABELS[property.status],
    },
    {
      icon: Landmark,
      label: "Precio",
      value: formatPrice(property.price, property.operation),
    },
    ...(pricePerM2
      ? [
          {
            icon: Ruler,
            label: "Precio por m²",
            value: formatPrice(Math.round(pricePerM2)),
          },
        ]
      : []),
    ...(property.area_m2
      ? [
          {
            icon: Maximize,
            label: "Construcción",
            value: formatArea(property.area_m2),
          },
        ]
      : []),
    ...(property.lot_m2
      ? [
          {
            icon: Trees,
            label: "Terreno",
            value: formatArea(property.lot_m2),
          },
        ]
      : []),
    ...(property.bedrooms
      ? [
          {
            icon: BedDouble,
            label: "Recámaras",
            value: String(property.bedrooms),
          },
        ]
      : []),
    ...(property.bathrooms
      ? [
          {
            icon: Bath,
            label: "Baños",
            value: String(property.bathrooms),
          },
        ]
      : []),
    ...(property.parking
      ? [
          {
            icon: Car,
            label: "Estacionamientos",
            value: String(property.parking),
          },
        ]
      : []),
    {
      icon: Clock,
      label: "Publicado",
      value: formatDate(property.created_at),
    },
    {
      icon: KeyRound,
      label: "Clave",
      value: `LT-${property.id.slice(0, 6).toUpperCase()}`,
    },
  ];

  const fullLocation = [
    property.colonia,
    property.municipio,
    property.estado,
  ]
    .filter(Boolean)
    .join(", ");

  const waMessage = `Hola Luz, me interesa la propiedad "${property.title}" (${SITE.name}). ¿Podemos agendar una visita?`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Residence",
    name: property.title,
    description: property.description ?? property.title,
    address: {
      "@type": "PostalAddress",
      addressLocality: property.municipio,
      addressRegion: property.estado,
      addressCountry: "MX",
    },
  };

  return (
    <article className="lt-container pb-28 pt-8 sm:pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1.5 text-[13px] text-humo">
        <Link href="/" className="hover:text-carbon">
          Inicio
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/propiedades" className="hover:text-carbon">
          Propiedades
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-carbon">{property.title}</span>
      </nav>

      {/* Encabezado */}
      <header className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-petroleo px-3 py-1 text-[11px] font-semibold text-hueso">
              {statusBadge(property.operation, property.status)}
            </span>
            <span className="rounded-full bg-almendra/15 px-3 py-1 text-[11px] font-semibold text-nogal">
              {PROPERTY_TYPE_LABELS[property.property_type]}
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-light tracking-tight sm:text-4xl">
            {property.title}
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-[15px] text-humo">
            <MapPin className="h-4 w-4 shrink-0 text-bruma" />
            {fullLocation}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-3xl font-medium tabular-nums text-petroleo">
            {formatPrice(property.price, property.operation)}
          </p>
          {pricePerM2 && (
            <p className="mt-0.5 font-mono text-[13px] text-humo">
              {formatPrice(Math.round(pricePerM2))} por m²
            </p>
          )}
        </div>
      </header>

      {/* Galería */}
      <div className="mt-6">
        <PropertyGallery
          images={images}
          type={property.property_type}
          title={property.title}
        />
      </div>

      {/* Contenido */}
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Ficha técnica rápida */}
          {specs.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {specs.map((s) => (
                <div
                  key={s.label}
                  className="rounded-md bg-papel p-4 text-center shadow-soft"
                >
                  <s.icon className="mx-auto h-5 w-5 text-nogal" />
                  <p className="mt-2 font-mono text-lg font-medium text-carbon">
                    {s.value}
                  </p>
                  <p className="text-[12px] text-humo">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Descripción */}
          {property.description && (
            <section className="mt-10">
              <p className="eyebrow">Descripción</p>
              <h2 className="mt-1 text-xl font-semibold text-carbon">
                Sobre esta propiedad
              </h2>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-humo">
                {property.description}
              </p>
            </section>
          )}

          {/* Amenidades con iconos */}
          {property.amenities && property.amenities.length > 0 && (
            <section className="mt-10">
              <p className="eyebrow">Amenidades</p>
              <h2 className="mt-1 text-xl font-semibold text-carbon">
                Lo que esta propiedad ofrece
              </h2>
              <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {property.amenities.map((a) => {
                  const Icon = amenityIcon(a);
                  return (
                    <li
                      key={a}
                      className="flex items-center gap-3 rounded-md bg-papel px-4 py-3 text-sm text-carbon shadow-soft"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-almendra/15">
                        <Icon className="h-4 w-4 text-nogal" />
                      </span>
                      {a}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* Datos generales */}
          <section className="mt-10">
            <p className="eyebrow">Ficha técnica</p>
            <h2 className="mt-1 text-xl font-semibold text-carbon">
              Datos generales
            </h2>
            <dl className="mt-4 overflow-hidden rounded-xl bg-papel shadow-soft">
              {generalData.map((d, i) => (
                <div
                  key={d.label}
                  className={`flex items-center justify-between gap-4 px-5 py-3 ${
                    i % 2 === 1 ? "bg-nieve/70" : ""
                  }`}
                >
                  <dt className="flex items-center gap-2.5 text-sm text-humo">
                    <d.icon className="h-4 w-4 shrink-0 text-bruma" />
                    {d.label}
                  </dt>
                  <dd className="text-right text-sm font-medium text-carbon">
                    {d.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Ubicación con mapa */}
          <section className="mt-10">
            <p className="eyebrow">Ubicación</p>
            <h2 className="mt-1 text-xl font-semibold text-carbon">
              ¿Dónde se encuentra?
            </h2>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-humo">
              <MapPin className="h-4 w-4 shrink-0 text-bruma" />
              {fullLocation}
            </p>
            <div className="mt-4">
              <PropertyMap property={property} />
            </div>
            <p className="mt-3 text-[13px] text-humo">
              El mapa muestra la zona de la propiedad. Comparto la dirección
              exacta al confirmar tu visita.
            </p>
          </section>
        </div>

        {/* Tarjeta lateral */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-xl bg-papel p-5 shadow-card">
              <p className="eyebrow">
                {statusBadge(property.operation, property.status)}
              </p>
              <p className="mt-1 font-mono text-2xl font-medium text-petroleo">
                {formatPrice(property.price, property.operation)}
              </p>

              <BookVisitButton className="btn-primary mt-4 w-full py-3">
                <CalendarDays className="h-4 w-4" />
                Agendar una visita
              </BookVisitButton>
              <p className="mt-2 text-center text-[12px] text-humo">
                Elige fecha y hora en el calendario. Sin compromiso.
              </p>

              <div className="my-4 flex items-center gap-3">
                <span className="h-px flex-1 bg-lino" />
                <span className="text-[11px] font-medium uppercase tracking-wide text-humo">
                  o
                </span>
                <span className="h-px flex-1 bg-lino" />
              </div>

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
                className="btn-whatsapp w-full py-3"
              >
                <MessageCircle className="h-4 w-4" />
                Preguntar por WhatsApp
              </TrackedLink>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-papel p-4 shadow-soft">
              <Image
                src="/luz-keys.jpg"
                alt="Luz Torres"
                width={52}
                height={52}
                className="h-[52px] w-[52px] rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-carbon">
                  {SITE.name}
                </p>
                <p className="text-[12px] text-humo">{SITE.role}</p>
                <p className="mt-0.5 text-[12px] text-humo">
                  Te acompaño personalmente en cada visita.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Propiedades similares */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-hero">Propiedades similares</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <PropertyCard key={p.id} property={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Botón fijo + modal de reserva */}
      <VisitBooking
        propertyId={property.id}
        propertyTitle={property.title}
        operation={property.operation}
        price={property.price}
        location={fullLocation}
      />
    </article>
  );
}
