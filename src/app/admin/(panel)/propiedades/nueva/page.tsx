import { PageHeader } from "@/components/admin/PageHeader";
import { PropertyForm } from "@/components/admin/PropertyForm";

export default function NuevaPropiedadPage() {
  return (
    <>
      <PageHeader
        title="Nueva propiedad"
        description="Completa los datos. Aparecerá en el catálogo público al guardar."
      />
      <PropertyForm />
    </>
  );
}
