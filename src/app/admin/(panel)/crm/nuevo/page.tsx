import { getPropertyOptions } from "@/lib/admin-data";
import { PageHeader } from "@/components/admin/PageHeader";
import { ContactEditor } from "@/components/admin/ContactEditor";

export default async function NuevoContactoPage() {
  const properties = await getPropertyOptions();
  return (
    <>
      <PageHeader
        title="Nuevo contacto"
        description="Da de alta un prospecto o cliente en el CRM."
      />
      <ContactEditor properties={properties} />
    </>
  );
}
