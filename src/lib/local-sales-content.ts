import type { CategoryDescriptor } from "./seo";
import type { Property } from "./types";
import { PROPERTY_TYPE_LABELS, PROPERTY_TYPE_PLURAL } from "./constants";

function names(values: (string | null)[]): string[] {
  return [...new Set(values.map((value) => value?.trim()).filter((value): value is string => !!value))]
    .sort((a, b) => a.localeCompare(b, "es"));
}

function list(values: string[], limit = 5, remainder = "otras ubicaciones"): string {
  const visible = values.slice(0, limit);
  if (values.length > limit) visible.push(remainder);
  return new Intl.ListFormat("es-MX", { type: "conjunction" }).format(visible);
}

function inventorySummary(descriptor: CategoryDescriptor, properties: Property[]): string {
  const count = properties.length;
  const single = count === 1;
  const noun = descriptor.type
    ? (single ? PROPERTY_TYPE_LABELS : PROPERTY_TYPE_PLURAL)[descriptor.type].toLowerCase()
    : single ? "propiedad" : "propiedades";
  const feminine = !descriptor.type || ["casa", "oficina", "bodega"].includes(descriptor.type);
  const agreement = feminine
    ? single ? "publicada" : "publicadas"
    : single ? "publicado" : "publicados";
  const selection = `${count} ${noun} ${agreement} en ${descriptor.operation}`;

  if (descriptor.level === "operation") {
    const types = names(properties.map((property) =>
      (single ? PROPERTY_TYPE_LABELS : PROPERTY_TYPE_PLURAL)[property.property_type].toLowerCase(),
    ));
    const states = names(properties.map((property) => property.estado));
    return `El catálogo reúne ${selection}: ${list(types)}. ` +
      (states.length ? `Las ubicaciones publicadas están en ${list(states)}.` : "");
  }

  if (descriptor.level === "type") {
    const states = names(properties.map((property) => property.estado));
    return `Esta selección reúne ${selection}.` +
      (states.length ? ` Puedes revisar ${single ? "la ficha" : "las fichas"} de ${list(states)}.` : "");
  }

  if (descriptor.level === "estado") {
    const municipalities = names(properties.map((property) => property.municipio));
    return `En ${descriptor.estado}, esta selección reúne ${selection}.` +
      (municipalities.length
        ? ` ${municipalities.length === 1 ? "La ubicación publicada es" : "Las ubicaciones publicadas son"} ${list(municipalities, 5, "otros municipios del catálogo")}.`
        : "");
  }

  const neighborhoods = names(properties.map((property) => property.colonia));
  return `Aquí puedes revisar ${selection} en ${descriptor.municipio}.` +
    (neighborhoods.length
      ? ` ${neighborhoods.length === 1 ? "La colonia publicada es" : "Las colonias publicadas son"} ${list(neighborhoods, 3, "otras colonias del catálogo")}.`
      : "");
}

function buyerChecklist(descriptor: CategoryDescriptor): { heading: string; details: string } {
  if (descriptor.operation === "renta") {
    return {
      heading: "Qué confirmar antes de rentar",
      details: "Pregunta por la renta vigente, qué incluye, los requisitos del arrendamiento y los gastos adicionales que puedan aplicar.",
    };
  }

  switch (descriptor.type) {
    case "departamento":
      return {
        heading: "Antes de comprar un departamento",
        details: "Pregunta qué superficie es interior, qué áreas exteriores corresponden a la unidad y qué incluye el mantenimiento. Confirma estacionamiento, precio vigente y condiciones de compra con Luz.",
      };
    case "casa":
      return {
        heading: "Antes de comprar una casa",
        details: "Distingue terreno y construcción, y confirma la distribución, el estado de conservación y las condiciones de compra de la casa que te interese.",
      };
    case "bodega":
      return {
        heading: "Antes de comprar una bodega",
        details: "Confirma dimensiones y altura útil, acceso para vehículos, servicios y uso de suelo autorizado para la actividad que necesitas.",
      };
    case "local":
      return {
        heading: "Antes de comprar un local comercial",
        details: "Confirma la superficie, el acceso, los servicios y qué actividades están autorizadas en el local. Consulta con Luz las condiciones de compra y los gastos que debas contemplar.",
      };
    case "oficina":
      return {
        heading: "Antes de comprar una oficina",
        details: "Confirma la superficie, distribución, acceso y servicios de la oficina, además de los gastos de mantenimiento y las condiciones de compra que apliquen.",
      };
    case "terreno":
      return {
        heading: "Antes de comprar un terreno",
        details: "Confirma superficie y límites, acceso, servicios y uso de suelo autorizado. Consulta con Luz qué documentación necesitas revisar antes de comprar.",
      };
    default:
      return {
        heading: "Qué revisar antes de comprar",
        details: "Elige el tipo de inmueble y la zona que necesitas. En cada ficha puedes revisar fotografías y características; confirma con Luz el precio vigente, las superficies y las condiciones de compra antes de solicitar una visita.",
      };
  }
}

/** Editorial context follows the current inventory, including future additions. */
export function localSalesContent(
  descriptor: CategoryDescriptor,
  properties: Property[],
): { intro: string; heading: string; details: string } | null {
  if (properties.length === 0) return null;
  const checklist = buyerChecklist(descriptor);

  return {
    intro: inventorySummary(descriptor, properties),
    heading: checklist.heading,
    details: checklist.details + " Abre la ficha que te interese y deja tu WhatsApp para que Luz te contacte y acuerden la visita. El envío de la solicitud no confirma una cita.",
  };
}
