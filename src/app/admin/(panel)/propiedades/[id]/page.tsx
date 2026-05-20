import { notFound } from "next/navigation";
import { getAdminProperty } from "@/lib/admin-data";
import { deleteProperty } from "@/lib/actions/properties";
import { PageHeader } from "@/components/admin/PageHeader";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";

export default async function EditarPropiedadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getAdminProperty(id);
  if (!property) notFound();

  return (
    <>
      <PageHeader title="Editar propiedad" description={property.title}>
        <ConfirmDelete
          variant="button"
          label="Eliminar propiedad"
          onDelete={deleteProperty.bind(null, id)}
          redirectTo="/admin/propiedades"
        />
      </PageHeader>
      <PropertyForm property={property} />
    </>
  );
}
