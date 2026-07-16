import type { Property } from "@/lib/types";

/**
 * Mapa de Google embebido — usa el iframe público de Maps, sin API key.
 * Si la propiedad tiene coordenadas exactas se usan; si no, se busca por
 * colonia + municipio + estado (suficiente para ubicar la zona).
 */
export function PropertyMap({ property }: { property: Property }) {
  const query =
    property.lat && property.lng
      ? `${property.lat},${property.lng}`
      : [property.direccion, property.colonia, property.municipio, property.estado, "México"]
          .filter(Boolean)
          .join(", ");

  const src = `https://maps.google.com/maps?q=${encodeURIComponent(
    query
  )}&z=${property.lat && property.lng ? 16 : 14}&hl=es&output=embed`;

  return (
    <div className="overflow-hidden rounded-xl shadow-card">
      <iframe
        src={src}
        title={`Mapa de ${property.title}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className="h-[320px] w-full border-0 sm:h-[380px]"
      />
    </div>
  );
}
