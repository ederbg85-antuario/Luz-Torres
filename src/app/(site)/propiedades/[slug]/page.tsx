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
  Check,
  ChevronRight,
} from "lucide-react";
import { getPropertyBySlug, getRelatedProperties } from "@/lib/data";
import { PropertyGallery } from "@/components/site/PropertyGallery";
import { PropertyCard } from "@/components/site/PropertyCard";
import { ContactForm } from "@/components/site/ContactForm";
import {
  PROPERTY_TYPE_LABELS,
  SITE,
  statusBadge,
  whatsappLink,
} from "@/lib/constants";
import { formatArea, formatPrice } from "@/lib/format";

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
    <article className="lt-container py-8">
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
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-petroleo px-3 py-1 text-[11px] font-semibold text-hueso">
              {statusBadge(property.operation, property.status)}
            </span>
            <span className="eyebrow">
              {PROPERTY_TYPE_LABELS[property.property_type]}
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-light tracking-tight sm:text-4xl">
            {property.title}
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-[15px] text-humo">
            <MapPin className="h-4 w-4 text-bruma" />
            {property.colonia ? `${property.colonia}, ` : ""}
            {property.municipio}, {property.estado}
          </p>
        </div>
        <p className="font-mono text-3xl font-medium tabular-nums text-petroleo">
          {formatPrice(property.price, property.operation)}
        </p>
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
          {/* Ficha técnica */}
          {specs.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {specs.map((s) => (
                <div
                  key={s.label}
                  className="rounded-md bg-papel p-4 text-center shadow-soft"
                >
                  <s.icon className="mx-auto h-5 w-5 text-vivo" />
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
            <section className="mt-8">
              <h2 className="text-xl font-semibold text-carbon">
                Sobre esta propiedad
              </h2>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-humo">
                {property.description}
              </p>
            </section>
          )}

          {/* Amenidades */}
          {property.amenities && property.amenities.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xl font-semibold text-carbon">
                Amenidades y características
              </h2>
              <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {property.amenities.map((a) => (
                  <li
                    key={a}
                    className="flex items-center gap-2 text-sm text-carbon"
                  >
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-petroleo/10">
                      <Check className="h-3 w-3 text-petroleo" />
                    </span>
                    {a}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Ubicación */}
          <section className="mt-8">
            <h2 className="text-xl font-semibold text-carbon">Ubicación</h2>
            <div className="mt-3 rounded-xl bg-papel p-5 shadow-soft">
              <dl className="grid gap-3 sm:grid-cols-3">
                <div>
                  <dt className="eyebrow">Estado</dt>
                  <dd className="mt-1 text-sm text-carbon">
                    {property.estado}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow">Ciudad / Alcaldía</dt>
                  <dd className="mt-1 text-sm text-carbon">
                    {property.municipio}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow">Colonia</dt>
                  <dd className="mt-1 text-sm text-carbon">
                    {property.colonia ?? "—"}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 text-[13px] text-humo">
                Comparto la dirección exacta y coordino la visita de forma
                personal una vez que conversamos.
              </p>
            </div>
          </section>
        </div>

        {/* Tarjeta de contacto */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-xl bg-papel p-5 shadow-card">
              <p className="eyebrow">{statusBadge(property.operation, property.status)}</p>
              <p className="mt-1 font-mono text-2xl font-medium text-petroleo">
                {formatPrice(property.price, property.operation)}
              </p>
              <a
                href={whatsappLink(waMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-accent mt-4 w-full py-3"
              >
                <MessageCircle className="h-4 w-4" />
                Preguntar por WhatsApp
              </a>

              <div className="mt-5 border-t border-lino pt-5">
                <p className="text-sm font-semibold text-carbon">
                  Agenda una visita
                </p>
                <p className="mt-1 text-[13px] text-humo">
                  Déjame tus datos y te contacto sin prisa.
                </p>
                <div className="mt-4">
                  <ContactForm
                    propertyId={property.id}
                    propertyTitle={property.title}
                    defaultInterest={
                      property.operation === "renta" ? "renta" : "compra"
                    }
                    compact
                  />
                </div>
              </div>
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
    </article>
  );
}
