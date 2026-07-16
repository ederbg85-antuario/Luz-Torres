import {
  getAppointments,
  getAvailabilityRules,
  getBlockedSlots,
  getContactOptions,
  getPropertyOptions,
} from "@/lib/admin-data";
import { PageHeader } from "@/components/admin/PageHeader";
import { AgendaView } from "@/components/admin/AgendaView";
import { AvailabilityManager } from "@/components/admin/AvailabilityManager";

export default async function AgendaPage() {
  const [appointments, contacts, properties, rules, blocked] =
    await Promise.all([
      getAppointments(),
      getContactOptions(),
      getPropertyOptions(),
      getAvailabilityRules(),
      getBlockedSlots(),
    ]);

  return (
    <>
      <PageHeader
        title="Agenda"
        description="Organiza visitas, firmas y citas. Las visitas agendadas desde la web aparecen aquí automáticamente."
      />
      <AgendaView
        appointments={appointments}
        contacts={contacts}
        properties={properties}
      />

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-carbon">
          Disponibilidad para visitas
        </h2>
        <p className="mt-1 text-sm text-humo">
          Controla qué días y horas pueden reservar los clientes desde la
          ficha de cada propiedad.
        </p>
        <div className="mt-4">
          <AvailabilityManager rules={rules} blocked={blocked} />
        </div>
      </div>
    </>
  );
}
