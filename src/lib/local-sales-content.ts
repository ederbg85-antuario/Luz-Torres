import type { CategoryDescriptor } from "./seo";
import type { Property } from "./types";

const PILOT_CATEGORIES = new Set([
  "/propiedades/venta/departamentos/alvaro-obregon",
  "/propiedades/venta/casas/chicoloapan",
]);

/** Editorial context follows the current inventory, including future additions. */
export function localSalesContent(
  descriptor: CategoryDescriptor,
  properties: Property[],
): { intro: string; heading: string; details: string } | null {
  if (!PILOT_CATEGORIES.has(descriptor.path) || properties.length === 0)
    return null;

  const apartment = descriptor.type === "departamento";
  const locations = [...new Set(properties.map((p) => p.colonia).filter(Boolean))];
  const places = locations.length
    ? " en " + locations.slice(0, 3).join(", ") + (locations.length > 3 ? " y otras colonias" : "")
    : "";
  const single = properties.length === 1;
  const subject = single
    ? "La opción publicada por Luz en " + descriptor.municipio + " es " + (apartment ? "un departamento" : "una casa") + places + "."
    : "Esta selección reúne " + (apartment ? "departamentos" : "casas") + " publicados por Luz en " + descriptor.municipio + places + ".";

  return {
    intro: subject + " Revisa las fotografías y características de cada ficha, y consulta con Luz los datos que necesitas confirmar antes de visitarla.",
    heading: single ? "Antes de visitar esta opción" : "Antes de solicitar una visita",
    details:
      "Confirma el precio vigente, las superficies y los gastos o condiciones de compra que apliquen. Puedes dejar tu WhatsApp para que Luz te contacte y acuerde contigo la visita. El envío de la solicitud no confirma una cita.",
  };
}
