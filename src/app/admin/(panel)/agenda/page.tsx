import {
  getAppointments,
  getContactOptions,
  getPropertyOptions,
} from "@/lib/admin-data";
import { PageHeader } from "@/components/admin/PageHeader";
import { AgendaView } from "@/components/admin/AgendaView";

export default async function AgendaPage() {
  const [appointments, contacts, properties] = await Promise.all([
    getAppointments(),
    getContactOptions(),
    getPropertyOptions(),
  ]);

  return (
    <>
      <PageHeader
        title="Agenda"
        description="Organiza visitas, firmas y citas con tus clientes."
      />
      <AgendaView
        appointments={appointments}
        contacts={contacts}
        properties={properties}
      />
    </>
  );
}
