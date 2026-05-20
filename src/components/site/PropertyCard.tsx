import Link from "next/link";
import { Maximize, BedDouble, Bath, Car } from "lucide-react";
import type { Property } from "@/lib/types";
import { PROPERTY_TYPE_LABELS, statusBadge } from "@/lib/constants";
import { cn, formatArea, formatPrice } from "@/lib/format";
import { PropertyImage } from "./PropertyImage";

function Spec({
  icon: Icon,
  value,
}: {
  icon: typeof Maximize;
  value: string;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <Icon className="h-4 w-4 text-bruma" strokeWidth={1.75} />
      {value}
    </span>
  );
}

export function PropertyCard({
  property,
  index = 0,
}: {
  property: Property;
  index?: number;
}) {
  const sold = property.status === "vendido" || property.status === "rentado";
  const area = property.area_m2 || property.lot_m2 || 0;

  return (
    <Link
      href={`/propiedades/${property.slug}`}
      className="group block overflow-hidden rounded-xl bg-papel shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <div className="h-full w-full transition-transform duration-500 group-hover:scale-105">
          <PropertyImage
            src={property.cover_image}
            type={property.property_type}
            alt={property.title}
            index={index}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <span className="absolute left-3 top-3 rounded-full bg-papel/95 px-3 py-1 text-[11px] font-semibold text-petroleo shadow-soft">
          {statusBadge(property.operation, property.status)}
        </span>
        {property.featured && !sold && (
          <span className="absolute right-3 top-3 rounded-full bg-almendra px-3 py-1 text-[11px] font-semibold text-papel shadow-soft">
            Destacada
          </span>
        )}
      </div>

      <div className="p-5">
        <p className="text-[11px] font-semibold uppercase tracking-eyebrow text-vivo">
          {PROPERTY_TYPE_LABELS[property.property_type]}
        </p>
        <p
          className={cn(
            "mt-1.5 font-mono text-xl font-medium tabular-nums text-carbon",
            sold && "text-humo line-through decoration-1"
          )}
        >
          {formatPrice(property.price, property.operation)}
        </p>
        <h3 className="mt-1.5 line-clamp-2 text-[15px] font-semibold leading-snug text-carbon">
          {property.title}
        </h3>
        <p className="mt-1 text-sm text-humo">
          {property.colonia ? `${property.colonia} · ` : ""}
          {property.municipio}, {property.estado}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-lino pt-3.5 text-[13px] text-humo">
          {area > 0 && <Spec icon={Maximize} value={formatArea(area)} />}
          {(property.bedrooms ?? 0) > 0 && (
            <Spec icon={BedDouble} value={`${property.bedrooms} rec`} />
          )}
          {(property.bathrooms ?? 0) > 0 && (
            <Spec icon={Bath} value={`${property.bathrooms} baños`} />
          )}
          {(property.parking ?? 0) > 0 && (
            <Spec icon={Car} value={`${property.parking} estac`} />
          )}
        </div>
      </div>
    </Link>
  );
}
