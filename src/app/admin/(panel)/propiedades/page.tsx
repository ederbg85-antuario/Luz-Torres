import Link from "next/link";
import { Plus, Building2, Pencil, Eye } from "lucide-react";
import { getAdminProperties } from "@/lib/admin-data";
import { deleteProperty } from "@/lib/actions/properties";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { Badge } from "@/components/ui/Badge";
import { PropertyImage } from "@/components/site/PropertyImage";
import {
  OPERATION_LABELS,
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
} from "@/lib/constants";
import { propertyStatusTone } from "@/lib/badges";
import { formatPrice } from "@/lib/format";

export default async function AdminPropertiesPage() {
  const properties = await getAdminProperties();

  return (
    <>
      <PageHeader
        title="Propiedades"
        description={`${properties.length} propiedades en el catálogo.`}
      >
        <Link href="/admin/propiedades/nueva" className="btn-primary py-2.5">
          <Plus className="h-4 w-4" />
          Nueva propiedad
        </Link>
      </PageHeader>

      {properties.length > 0 ? (
        <div className="space-y-3">
          {properties.map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap items-center gap-4 rounded-xl bg-papel p-3 shadow-soft"
            >
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md">
                <PropertyImage
                  src={p.cover_image}
                  type={p.property_type}
                  alt={p.title}
                  sizes="96px"
                />
              </div>

              <div className="min-w-[180px] flex-1">
                <p className="truncate font-medium text-carbon">{p.title}</p>
                <p className="text-[13px] text-humo">
                  {p.municipio}, {p.estado}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <Badge tone="neutral">
                    {PROPERTY_TYPE_LABELS[p.property_type]}
                  </Badge>
                  <Badge tone="vivo">{OPERATION_LABELS[p.operation]}</Badge>
                  <Badge tone={propertyStatusTone[p.status]}>
                    {PROPERTY_STATUS_LABELS[p.status]}
                  </Badge>
                  {p.featured && <Badge tone="almond">Destacada</Badge>}
                </div>
              </div>

              <p className="font-mono text-sm font-medium tabular-nums text-petroleo">
                {formatPrice(p.price, p.operation)}
              </p>

              <div className="flex items-center gap-1">
                <Link
                  href={`/propiedades/${p.slug}`}
                  target="_blank"
                  className="grid h-9 w-9 place-items-center rounded-md text-humo transition-colors hover:bg-nieve hover:text-carbon"
                  aria-label="Ver en el sitio"
                >
                  <Eye className="h-4 w-4" />
                </Link>
                <Link
                  href={`/admin/propiedades/${p.id}`}
                  className="grid h-9 w-9 place-items-center rounded-md text-humo transition-colors hover:bg-nieve hover:text-carbon"
                  aria-label="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <ConfirmDelete onDelete={deleteProperty.bind(null, p.id)} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Building2}
          title="Aún no hay propiedades"
          description="Publica tu primera propiedad para que aparezca en el sitio."
        >
          <Link href="/admin/propiedades/nueva" className="btn-primary">
            <Plus className="h-4 w-4" />
            Nueva propiedad
          </Link>
        </EmptyState>
      )}
    </>
  );
}
