import type { Metadata } from "next";
import type { Operation, Property, PropertyType } from "./types";
import {
  OPERATION_LABELS,
  PROPERTY_TYPE_LABELS,
  PROPERTY_TYPE_PLURAL,
  SITE,
  SLUG_TO_TYPE,
  TYPE_SLUG,
} from "./constants";
import { slugify, formatPrice } from "./format";
import { SITE_URL } from "./supabase/config";

// ─── Filas mínimas para construir la arquitectura de categorías ─────
export type SeoRow = Pick<
  Property,
  "operation" | "property_type" | "estado" | "municipio"
>;

// ─── Descripción y título limpios de ficha ──────────────────────────

/**
 * Descripción meta limpia armada desde datos estructurados — nunca un
 * `slice()` del texto crudo (que produce cortes feos con saltos de línea).
 */
export function cleanPropertyDescription(property: Property): string {
  const tipo = PROPERTY_TYPE_LABELS[property.property_type];
  const lugar = [property.colonia, property.municipio, property.estado]
    .filter(Boolean)
    .join(", ");
  const specs: string[] = [];
  if (property.bedrooms) specs.push(`${property.bedrooms} recámaras`);
  if (property.bathrooms) specs.push(`${property.bathrooms} baños`);
  if (property.area_m2) specs.push(`${Math.round(property.area_m2)} m²`);

  const partes = [
    `${tipo} en ${property.operation} en ${lugar}.`,
    specs.length ? `${specs.join(", ")}.` : "",
    `${formatPrice(property.price, property.operation)}.`,
    "Agenda tu visita con Luz Torres.",
  ].filter(Boolean);

  return partes.join(" ").slice(0, 300);
}

/**
 * Título único de ficha. Resuelve los duplicados (dos fichas de la misma
 * colonia) agregando recámaras/superficie, que siempre difieren y además
 * aportan información útil al usuario en la SERP.
 */
export function uniquePropertyTitle(property: Property): string {
  const qualifiers: string[] = [];
  if (property.bedrooms) qualifiers.push(`${property.bedrooms} rec`);
  const area = property.area_m2 || property.lot_m2;
  if (area) qualifiers.push(`${Math.round(area)} m²`);
  const suffix = qualifiers.length ? ` — ${qualifiers.join(" · ")}` : "";
  return `${property.title}${suffix} | ${SITE.name}`;
}

// ─── Schema.org: ficha de propiedad ─────────────────────────────────

/** Mapea el tipo de dominio al tipo de residencia/lugar de schema.org. */
function residenceSchemaType(type: PropertyType): string {
  switch (type) {
    case "casa":
      return "SingleFamilyResidence";
    case "departamento":
      return "Apartment";
    case "oficina":
      return "Place";
    case "bodega":
      return "Warehouse";
    case "terreno":
      return "Place";
    case "local":
      return "Store";
    default:
      return "Residence";
  }
}

function schemaAvailability(status: Property["status"]): string {
  if (status === "vendido") return "https://schema.org/SoldOut";
  if (status === "rentado") return "https://schema.org/SoldOut";
  if (status === "apartado") return "https://schema.org/LimitedAvailability";
  return "https://schema.org/InStock";
}

export type BreadcrumbItem = { name: string; path: string };

export function breadcrumbList(items: BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

/** Miga de pan de una ficha: Inicio › Propiedades › {Tipo} en {op} › {Municipio} › {título}. */
export function propertyBreadcrumb(property: Property): BreadcrumbItem[] {
  const typeSlug = TYPE_SLUG[property.property_type];
  const muniSlug = slugify(property.municipio);
  const plural = PROPERTY_TYPE_PLURAL[property.property_type];
  return [
    { name: "Inicio", path: "/" },
    { name: "Propiedades", path: "/propiedades" },
    {
      name: `${plural} en ${property.operation}`,
      path: `/propiedades/${property.operation}/${typeSlug}`,
    },
    {
      name: property.municipio,
      path: `/propiedades/${property.operation}/${typeSlug}/${muniSlug}`,
    },
    { name: property.title, path: `/propiedades/${property.slug}` },
  ];
}

/** `@graph` con RealEstateListing + BreadcrumbList para la ficha. */
export function propertyJsonLd(property: Property, images: string[]) {
  const canonical = `${SITE_URL}/propiedades/${property.slug}`;
  const listing: Record<string, unknown> = {
    "@type": "RealEstateListing",
    url: canonical,
    name: property.title,
    description: cleanPropertyDescription(property),
    datePosted: property.created_at,
    ...(images.length ? { image: images } : {}),
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: property.currency || "MXN",
      availability: schemaAvailability(property.status),
      url: canonical,
    },
    about: {
      "@type": residenceSchemaType(property.property_type),
      name: property.title,
      ...(property.bedrooms ? { numberOfRooms: property.bedrooms } : {}),
      ...(property.bathrooms
        ? { numberOfBathroomsTotal: property.bathrooms }
        : {}),
      ...(property.area_m2
        ? {
            floorSize: {
              "@type": "QuantitativeValue",
              value: property.area_m2,
              unitCode: "MTK",
            },
          }
        : {}),
      address: {
        "@type": "PostalAddress",
        ...(property.colonia
          ? { streetAddress: property.colonia }
          : {}),
        addressLocality: property.municipio,
        addressRegion: property.estado,
        addressCountry: "MX",
      },
      ...(property.lat && property.lng
        ? {
            geo: {
              "@type": "GeoCoordinates",
              latitude: property.lat,
              longitude: property.lng,
            },
          }
        : {}),
    },
  };

  return {
    "@context": "https://schema.org",
    "@graph": [listing, breadcrumbList(propertyBreadcrumb(property))],
  };
}

/** Metadata de la ficha: título único, description limpia y canonical. */
export function propertyMetadata(property: Property): Metadata {
  const description = cleanPropertyDescription(property);
  return {
    title: { absolute: uniquePropertyTitle(property) },
    description,
    alternates: { canonical: `/propiedades/${property.slug}` },
    openGraph: {
      title: property.title,
      description,
      url: `/propiedades/${property.slug}`,
      type: "website",
      images: property.cover_image ? [property.cover_image] : undefined,
    },
  };
}

// ─── Arquitectura de categorías ─────────────────────────────────────

export type CategoryLevel = "operation" | "type" | "estado" | "municipio";

export type CategoryDescriptor = {
  operation: Operation;
  type?: PropertyType;
  estado?: string;
  municipio?: string;
  level: CategoryLevel;
  path: string;
  heading: string;
  intro: string;
};

/** Filtros equivalentes para consultar el catálogo de una categoría. */
export function categoryFilters(d: CategoryDescriptor) {
  return {
    operation: d.operation,
    property_type: d.type,
    estado: d.municipio ? undefined : d.estado,
    municipio: d.municipio,
  };
}

function buildHeading(d: Omit<CategoryDescriptor, "heading" | "intro" | "path">) {
  const op = d.operation;
  if (d.level === "operation") return `Propiedades en ${op}`;
  const plural = PROPERTY_TYPE_PLURAL[d.type!];
  if (d.level === "type") return `${plural} en ${op}`;
  if (d.level === "estado") return `${plural} en ${op} en ${d.estado}`;
  return `${plural} en ${op} en ${d.municipio}`;
}

/**
 * Resuelve segmentos de URL a un descriptor de categoría, validando contra el
 * inventario real. Devuelve null (→ 404) si la combinación no tiene propiedades.
 */
export function resolveCategory(
  index: SeoRow[],
  parts: { operation: string; typeSlug?: string; ubicacionSlug?: string }
): CategoryDescriptor | null {
  if (parts.operation !== "venta" && parts.operation !== "renta") return null;
  const operation = parts.operation as Operation;

  let rows = index.filter((r) => r.operation === operation);
  if (rows.length === 0) return null;

  let type: PropertyType | undefined;
  if (parts.typeSlug) {
    type = SLUG_TO_TYPE[parts.typeSlug];
    if (!type) return null;
    rows = rows.filter((r) => r.property_type === type);
    if (rows.length === 0) return null;
  }

  let estado: string | undefined;
  let municipio: string | undefined;
  if (parts.ubicacionSlug) {
    const muni = rows.find(
      (r) => r.municipio && slugify(r.municipio) === parts.ubicacionSlug
    );
    if (muni) {
      municipio = muni.municipio;
      estado = muni.estado;
    } else {
      const est = rows.find(
        (r) => r.estado && slugify(r.estado) === parts.ubicacionSlug
      );
      if (!est) return null;
      estado = est.estado;
    }
  }

  const level: CategoryLevel = municipio
    ? "municipio"
    : estado
    ? "estado"
    : type
    ? "type"
    : "operation";

  const base = { operation, type, estado, municipio, level };
  const heading = buildHeading(base);
  const typeSlug = type ? TYPE_SLUG[type] : undefined;
  const locSlug = municipio
    ? slugify(municipio)
    : estado
    ? slugify(estado)
    : undefined;
  const path = [
    "/propiedades",
    operation,
    typeSlug,
    locSlug,
  ]
    .filter(Boolean)
    .join("/");

  const lugar = municipio ?? estado ?? "México";
  const tipoTxt = type ? PROPERTY_TYPE_PLURAL[type].toLowerCase() : "propiedades";
  const intro =
    level === "operation"
      ? `Explora todas las propiedades en ${op(operation)} con Luz Torres: casas, departamentos, oficinas, bodegas y terrenos con ficha técnica completa, ubicación y acompañamiento de principio a fin.`
      : `Encuentra ${tipoTxt} en ${operation} en ${lugar} con asesoría inmobiliaria integral. Cada propiedad incluye ficha técnica, fotos, ubicación y la posibilidad de agendar una visita guiada con Luz Torres, sin compromiso.`;

  return { ...base, heading, path, intro };
}

function op(operation: Operation) {
  return OPERATION_LABELS[operation].toLowerCase();
}

/** Metadata de una página de categoría. */
export function categoryMetadata(
  d: CategoryDescriptor,
  count: number,
  minPrice: number | null
): Metadata {
  const lugar = d.municipio
    ? `${d.municipio}`
    : d.estado
    ? d.estado
    : "México";
  const tipoTxt = d.type
    ? PROPERTY_TYPE_PLURAL[d.type].toLowerCase()
    : "propiedades";
  const desde =
    minPrice && d.level !== "operation"
      ? ` desde ${formatPrice(minPrice, d.operation)}`
      : "";

  const title = `${d.heading} | ${SITE.name}`;
  const description =
    d.level === "operation"
      ? `${count} propiedades en ${d.operation}: casas, departamentos y más con acompañamiento completo. Agenda tu visita con Luz Torres.`
      : `${count} ${tipoTxt} en ${d.operation} en ${lugar}${desde}. Ficha técnica, fotos y asesoría integral. Agenda una visita sin compromiso con Luz Torres.`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: d.path },
    openGraph: { title, description, url: d.path, type: "website" },
  };
}

/** Migas de pan de una categoría. */
export function categoryBreadcrumb(d: CategoryDescriptor): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { name: "Inicio", path: "/" },
    { name: "Propiedades", path: "/propiedades" },
    {
      name: `En ${d.operation}`,
      path: `/propiedades/${d.operation}`,
    },
  ];
  if (d.type) {
    items.push({
      name: PROPERTY_TYPE_PLURAL[d.type],
      path: `/propiedades/${d.operation}/${TYPE_SLUG[d.type]}`,
    });
  }
  if (d.municipio || d.estado) {
    items.push({ name: d.municipio ?? d.estado!, path: d.path });
  }
  return items;
}

/** `@graph` CollectionPage + BreadcrumbList + ItemList para una categoría. */
export function categoryJsonLd(d: CategoryDescriptor, properties: Property[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        url: `${SITE_URL}${d.path}`,
        name: d.heading,
        description: d.intro,
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: properties.length,
          itemListElement: properties.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${SITE_URL}/propiedades/${p.slug}`,
            name: p.title,
          })),
        },
      },
      breadcrumbList(categoryBreadcrumb(d)),
    ],
  };
}

// ─── Enlaces internos (interlinking) ────────────────────────────────

export type CategoryLink = { label: string; path: string };

/**
 * Categorías hermanas para el bloque "Explora otras zonas/tipos".
 * Distribuye autoridad interna entre categoría ⇄ categoría ⇄ hub.
 */
export function relatedCategories(
  index: SeoRow[],
  d: CategoryDescriptor
): CategoryLink[] {
  const links: CategoryLink[] = [];
  const seen = new Set<string>();
  const add = (label: string, path: string) => {
    if (seen.has(path) || path === d.path) return;
    seen.add(path);
    links.push({ label, path });
  };

  const rowsOp = index.filter((r) => r.operation === d.operation);

  if (d.level === "municipio" || d.level === "estado") {
    // Otros municipios del mismo tipo + operación
    const sameType = rowsOp.filter((r) => r.property_type === d.type);
    const munis = [...new Set(sameType.map((r) => r.municipio))].filter(Boolean);
    for (const m of munis) {
      add(
        `${PROPERTY_TYPE_PLURAL[d.type!]} en ${d.operation} en ${m}`,
        `/propiedades/${d.operation}/${TYPE_SLUG[d.type!]}/${slugify(m)}`
      );
    }
    // Otros tipos en la misma zona (si municipio)
    if (d.municipio) {
      const here = rowsOp.filter((r) => r.municipio === d.municipio);
      const types = [...new Set(here.map((r) => r.property_type))];
      for (const t of types) {
        add(
          `${PROPERTY_TYPE_PLURAL[t]} en ${d.operation} en ${d.municipio}`,
          `/propiedades/${d.operation}/${TYPE_SLUG[t]}/${slugify(d.municipio)}`
        );
      }
    }
  } else if (d.level === "type") {
    // Estados disponibles para este tipo + operación
    const sameType = rowsOp.filter((r) => r.property_type === d.type);
    const estados = [...new Set(sameType.map((r) => r.estado))].filter(Boolean);
    for (const e of estados) {
      add(
        `${PROPERTY_TYPE_PLURAL[d.type!]} en ${d.operation} en ${e}`,
        `/propiedades/${d.operation}/${TYPE_SLUG[d.type!]}/${slugify(e)}`
      );
    }
    // Otros tipos en la misma operación
    const types = [...new Set(rowsOp.map((r) => r.property_type))];
    for (const t of types) {
      add(
        `${PROPERTY_TYPE_PLURAL[t]} en ${d.operation}`,
        `/propiedades/${d.operation}/${TYPE_SLUG[t]}`
      );
    }
  } else {
    // Operación: tipos disponibles
    const types = [...new Set(rowsOp.map((r) => r.property_type))];
    for (const t of types) {
      add(
        `${PROPERTY_TYPE_PLURAL[t]} en ${d.operation}`,
        `/propiedades/${d.operation}/${TYPE_SLUG[t]}`
      );
    }
  }

  return links.slice(0, 8);
}

// ─── Generación de parámetros estáticos ─────────────────────────────

export function operationParams(index: SeoRow[]) {
  return [...new Set(index.map((r) => r.operation))].map((operation) => ({
    operation,
  }));
}

/** Params para `{operation}/[type]`. */
export function typeParams(index: SeoRow[], operation: Operation) {
  const types = [
    ...new Set(
      index.filter((r) => r.operation === operation).map((r) => r.property_type)
    ),
  ];
  return types.map((t) => ({ type: TYPE_SLUG[t] }));
}

/** Params para `{operation}/[type]/[ubicacion]` (municipios y estados). */
export function ubicacionParams(index: SeoRow[], operation: Operation) {
  const rows = index.filter((r) => r.operation === operation);
  const params: { type: string; ubicacion: string }[] = [];
  const seen = new Set<string>();
  for (const t of [...new Set(rows.map((r) => r.property_type))]) {
    const typeRows = rows.filter((r) => r.property_type === t);
    const slugs = new Set<string>();
    for (const r of typeRows) {
      if (r.municipio) slugs.add(slugify(r.municipio));
      if (r.estado) slugs.add(slugify(r.estado));
    }
    for (const ubicacion of slugs) {
      const key = `${TYPE_SLUG[t]}/${ubicacion}`;
      if (seen.has(key)) continue;
      seen.add(key);
      params.push({ type: TYPE_SLUG[t], ubicacion });
    }
  }
  return params;
}

/**
 * Chips de categoría destacados para el catálogo maestro (`/propiedades`).
 * Nivel operación + tipo — los hubs con más peso para el interlinking.
 */
export function categoryChips(index: SeoRow[]): CategoryLink[] {
  const chips: CategoryLink[] = [];
  const seen = new Set<string>();
  for (const { operation } of operationParams(index)) {
    for (const { type } of typeParams(index, operation as Operation)) {
      const t = SLUG_TO_TYPE[type];
      const path = `/propiedades/${operation}/${type}`;
      if (seen.has(path)) continue;
      seen.add(path);
      chips.push({
        label: `${PROPERTY_TYPE_PLURAL[t]} en ${operation}`,
        path,
      });
    }
  }
  return chips;
}

/** Todas las rutas de categoría (para el sitemap). */
export function allCategoryPaths(index: SeoRow[]): string[] {
  const paths = new Set<string>();
  for (const { operation } of operationParams(index)) {
    paths.add(`/propiedades/${operation}`);
    for (const { type } of typeParams(index, operation)) {
      paths.add(`/propiedades/${operation}/${type}`);
    }
    for (const { type, ubicacion } of ubicacionParams(index, operation)) {
      paths.add(`/propiedades/${operation}/${type}/${ubicacion}`);
    }
  }
  return [...paths];
}
