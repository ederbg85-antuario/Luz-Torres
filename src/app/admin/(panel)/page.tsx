import Link from "next/link";
import {
  Building2,
  Users,
  CalendarDays,
  KanbanSquare,
  Plus,
  ArrowUpRight,
  CalendarClock,
} from "lucide-react";
import { getDashboardData } from "@/lib/admin-data";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { Badge } from "@/components/ui/Badge";
import {
  APPOINTMENT_TYPE_LABELS,
  CONTACT_STAGES,
  CONTACT_STAGE_LABELS,
  CONTACT_SOURCE_LABELS,
} from "@/lib/constants";
import { stageTone } from "@/lib/badges";
import { formatDate, formatDateTime } from "@/lib/format";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Resumen de tu actividad inmobiliaria."
      >
        <Link href="/admin/propiedades/nueva" className="btn-primary py-2.5">
          <Plus className="h-4 w-4" />
          Nueva propiedad
        </Link>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Propiedades disponibles"
          value={data.properties.available}
          icon={Building2}
          hint={`${data.properties.total} en total · ${data.properties.featured} destacadas`}
        />
        <StatCard
          label="Contactos nuevos (7 días)"
          value={data.contacts.recent}
          icon={Users}
          hint={`${data.contacts.total} contactos en el CRM`}
        />
        <StatCard
          label="Citas próximas"
          value={data.upcoming.length}
          icon={CalendarDays}
          hint="Programadas a futuro"
        />
        <StatCard
          label="Tareas pendientes"
          value={data.tasks.pending}
          icon={KanbanSquare}
          hint="Sin completar en el tablero"
        />
      </div>

      {/* Pipeline */}
      <div className="mt-6 rounded-xl bg-papel p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-carbon">Pipeline de contactos</h2>
          <Link
            href="/admin/crm"
            className="flex items-center gap-1 text-[13px] font-medium text-vivo hover:underline"
          >
            Ver CRM
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {CONTACT_STAGES.map((stage) => (
            <Link
              key={stage}
              href={`/admin/crm?stage=${stage}`}
              className="rounded-md bg-nieve p-3 transition-colors hover:bg-lino"
            >
              <p className="font-mono text-2xl font-medium text-carbon">
                {data.contacts.byStage[stage] ?? 0}
              </p>
              <p className="mt-0.5 text-[12px] text-humo">
                {CONTACT_STAGE_LABELS[stage]}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Próximas citas */}
        <section className="rounded-xl bg-papel p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-carbon">Próximas citas</h2>
            <Link
              href="/admin/agenda"
              className="text-[13px] font-medium text-vivo hover:underline"
            >
              Agenda
            </Link>
          </div>
          {data.upcoming.length > 0 ? (
            <ul className="mt-4 space-y-2.5">
              {data.upcoming.map((a) => (
                <li
                  key={a.id}
                  className="flex items-start gap-3 rounded-md bg-nieve p-3"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-petroleo/8 text-petroleo">
                    <CalendarClock className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-carbon">
                      {a.title}
                    </p>
                    <p className="text-[12px] text-humo">
                      {APPOINTMENT_TYPE_LABELS[a.type]} ·{" "}
                      {formatDateTime(a.starts_at)}
                      {a.contact ? ` · ${a.contact.full_name}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-humo">
              No tienes citas programadas.
            </p>
          )}
        </section>

        {/* Contactos recientes */}
        <section className="rounded-xl bg-papel p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-carbon">Contactos recientes</h2>
            <Link
              href="/admin/crm"
              className="text-[13px] font-medium text-vivo hover:underline"
            >
              Ver todos
            </Link>
          </div>
          {data.recentContacts.length > 0 ? (
            <ul className="mt-4 divide-y divide-lino">
              {data.recentContacts.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/admin/crm/${c.id}`}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-carbon">
                        {c.full_name}
                      </p>
                      <p className="text-[12px] text-humo">
                        {CONTACT_SOURCE_LABELS[c.source]} ·{" "}
                        {formatDate(c.created_at)}
                      </p>
                    </div>
                    <Badge tone={stageTone[c.stage]}>
                      {CONTACT_STAGE_LABELS[c.stage]}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-humo">
              Aún no hay contactos registrados.
            </p>
          )}
        </section>
      </div>
    </>
  );
}
