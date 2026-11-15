import type { CategoryDescriptor, CategoryLink, SeoRow } from "./seo";
import type { Property } from "./types";
import { PROPERTY_TYPE_PLURAL, TYPE_SLUG } from "./constants";
import { slugify } from "./format";

const focusAreas = {
  "Benito Juárez": {
    colonia: "Del Valle Sur",
    shortLocation: "Del Valle Sur",
    location: "Del Valle Sur, Benito Juárez",
    heading: "Qué comparar al comprar en Del Valle Sur",
    details: "Los departamentos de esta selección están en la misma colonia, pero sus distribuciones y superficies son distintas. Revisa cuántas recámaras necesitas, el espacio exterior de cada unidad y cómo se accede al estacionamiento. La ficha con roof privado requiere revisar el desglose de metros y las condiciones de uso de ese espacio.",
    questions: [
      { question: "¿Qué incluye la superficie de cada departamento?", answer: "Consulta el desglose de construcción, balcón, terraza o roof garden de la ficha que te interese. La superficie publicada no permite asumir que todos los metros son interiores; Luz puede aclararlo antes de coordinar la visita." },
      { question: "¿Cómo comparo el mantenimiento y las amenidades?", answer: "Solicita la cuota vigente de cada edificio y qué servicios cubre. Revisa también el régimen de los estacionamientos y las reglas de uso de las amenidades mencionadas en cada ficha." },
    ],
  },
  "Pachuca de Soto": {
    colonia: "Centro",
    shortLocation: "Centro, Pachuca",
    location: "Centro, Pachuca de Soto",
    heading: "Compara los departamentos de Centro, Pachuca",
    details: "Las dos fichas publicadas describen departamentos de dos recámaras en un edificio de cinco niveles. Una corresponde al departamento 3 y la otra al departamento 5, que se describe en dos niveles y con roof garden. Revisa las fotografías y el desglose de cada ficha para comparar el espacio habitable con las áreas exteriores.",
    questions: [
      { question: "¿El roof garden está incluido en los metros publicados?", answer: "En la ficha del departamento 5 se publican 109.77 m² de construcción y 83.13 m² de roof garden; su campo de superficie muestra 192.9 m². Son conceptos que debes revisar por separado con Luz, junto con el acceso y el régimen de uso del roof garden." },
      { question: "¿Qué debo confirmar de los baños y estacionamiento?", answer: "Las descripciones distinguen baños completos y medio baño de visitas. Pide el desglose de la unidad elegida y confirma el cajón de estacionamiento antes de tomar una decisión; no sumes los campos de ambas fichas como si fueran una sola propiedad." },
    ],
  },
} as const;

/** One existing municipal URL serves the buyer's neighborhood intent. */
export function buyerFocus(descriptor: CategoryDescriptor, properties: Property[]) {
  if (descriptor.operation !== "venta" || descriptor.type !== "departamento" || descriptor.level !== "municipio") return null;
  const area = focusAreas[descriptor.municipio as keyof typeof focusAreas];
  if (!area || properties.length === 0 || properties.some((p) => p.colonia?.trim() !== area.colonia)) return null;

  // Detailed unit comparisons apply only while the researched pair is present.
  // A changed catalog keeps the normal inventory copy instead of stale claims.
  const expected = descriptor.municipio === "Benito Juárez"
    ? ["departamento-venta-del-valle-sur-benito-juarez-iap8022745", "departamento-venta-del-valle-sur-benito-juarez-iap7975541"]
    : ["departamento-venta-centro-pachuca-de-soto-iap4729457", "departamento-venta-centro-pachuca-de-soto-iap4729478"];
  if (properties.length !== expected.length || expected.some((slug) => !properties.some((p) => p.slug === slug))) return null;

  const ordered = [...properties].sort((a, b) => a.price - b.price);
  const currency = ordered[0].currency || "MXN";
  const sameCurrency = ordered.every((p) => (p.currency || "MXN") === currency);
  const price = (value: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
  const range = sameCurrency ? `Precios publicados de ${price(ordered[0].price)} a ${price(ordered.at(-1)!.price)} ${currency}.` : "Consulta el precio publicado de cada ficha.";

  return {
    title: `Departamentos en venta en ${area.shortLocation} | Luz Torres`,
    heading: `Departamentos en venta en ${area.location}`,
    description: `Compara ${ordered.length} departamentos en ${area.shortLocation}. ${range} Revisa fotos y solicita información con Luz Torres.`,
    intro: `Compara los ${ordered.length} departamentos publicados en venta en ${area.location}. ${range} Elige la distribución que buscas y consulta con Luz las condiciones de compra y la visita.`,
    comparisonHeading: `Departamentos publicados en ${area.shortLocation}`,
    detailsHeading: area.heading,
    details: area.details,
    questions: area.questions,
    properties: ordered,
  };
}

/** Keep the home linked to live sale areas when a previous pilot is withdrawn. */
export function buyerAreaLinks(index: SeoRow[]): CategoryLink[] {
  const areas = new Map<string, { label: string; path: string; count: number }>();
  for (const row of index) {
    if (row.operation !== "venta" || !row.municipio) continue;
    const path = `/propiedades/venta/${TYPE_SLUG[row.property_type]}/${slugify(row.municipio)}`;
    const existing = areas.get(path);
    if (existing) existing.count += 1;
    else areas.set(path, { path, label: `${PROPERTY_TYPE_PLURAL[row.property_type]} en venta en ${row.municipio}`, count: 1 });
  }
  const priorities = ["/propiedades/venta/departamentos/benito-juarez", "/propiedades/venta/departamentos/pachuca-de-soto"];
  return [...areas.values()].sort((a, b) => {
    const rank = (path: string) => priorities.includes(path) ? priorities.indexOf(path) : priorities.length;
    return rank(a.path) - rank(b.path) || b.count - a.count || a.path.localeCompare(b.path);
  }).slice(0, 4).map(({ label, path }) => ({ label, path }));
}
