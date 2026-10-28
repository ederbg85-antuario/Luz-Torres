import Link from "next/link";
import { Plus, Users, Mail, Phone, ChevronRight } from "lucide-react";
import { getContacts, getLeadAttributions } from "@/lib/admin-data";
import { ACQUISITION_LABELS, ACQUISITION_SEGMENTS, summarizeLeadSources } from "@/lib/lead-attribution-report";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { Badge } from "@/components/ui/Badge";
import {
  CONTACT_INTEREST_LABELS,
  CONTACT_SOURCE_LABELS,
  CONTACT_STAGES,
  CONTACT_STAGE_LABELS,
} from "@/lib/constants";
import { stageTone } from "@/lib/badges";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/format";
import type { ContactStage } from "@/lib/types";

export default async function CrmPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string }>;
}) {
  const { stage } = await searchParams;
  const activeStage = CONTACT_STAGES.includes(stage as ContactStage)
    ? (stage as ContactStage)
    : null;

  const all = await getContacts();
  const contacts = activeStage
    ? all.filter((c) => c.stage === activeStage)
    : all;
  const receipts = await getLeadAttributions(contacts.map((contact) => contact.id));
  const acquisitionSummary = receipts.available ? summarizeLeadSources(contacts, receipts.receipts) : [];

  return (
    <>
      <PageHeader
        title="CRM · Contactos"
        description={`${all.length} contactos · clasifícalos por etapa del pipeline.`}
      >
        <Link href="/admin/crm/nuevo" className="btn-primary py-2.5">
          <Plus className="h-4 w-4" />
          Nuevo contacto
        </Link>
      </PageHeader>

      {/* Filtro por etapa */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        <Link
          href="/admin/crm"
          className={cn(
            "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
            !activeStage
              ? "bg-petroleo text-hueso"
              : "bg-papel text-humo shadow-soft hover:text-carbon"
          )}
        >
          Todos ({all.length})
        </Link>
        {CONTACT_STAGES.map((s) => {
          const count = all.filter((c) => c.stage === s).length;
          return (
            <Link
              key={s}
              href={`/admin/crm?stage=${s}`}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                activeStage === s
                  ? "bg-petroleo text-hueso"
                  : "bg-papel text-humo shadow-soft hover:text-carbon"
              )}
            >
              {CONTACT_STAGE_LABELS[s]} ({count})
            </Link>
          );
        })}
      </div>

      {!receipts.available && <p className="mb-5 rounded-xl bg-papel p-4 text-sm text-humo">La adquisición no está disponible en este momento. Vuelve a cargar la página para intentarlo de nuevo.</p>}
      {receipts.available && acquisitionSummary.length > 0 && <section className="mb-5 rounded-xl bg-papel p-4 shadow-soft">
        <h2 className="text-sm font-semibold text-carbon">Primera adquisición observada por etapa</h2>
        <p className="mt-1 text-xs text-humo">{contacts.length} registros cargados del filtro actual, separados por interés y etapa actuales. Primera llegada registrada en la pestaña del visitante, hasta 24 horas antes del envío. Una persona puede enviar varios formularios; los registros sin evidencia permanecen como origen desconocido.</p>
        <div className="mt-3 overflow-x-auto"><table className="w-full text-left text-xs">
          <thead><tr><th scope="col" className="py-2">Canal observado</th><th scope="col">Interés actual</th><th scope="col">Etapa actual</th><th scope="col" className="text-right">Registros</th></tr></thead>
          <tbody>{acquisitionSummary.map((row) => <tr key={`${row.channel}:${row.stage}:${row.segment}`} className="border-t border-linea"><td className="py-2">{ACQUISITION_LABELS[row.channel]}</td><td>{ACQUISITION_SEGMENTS[row.segment]}</td><td>{CONTACT_STAGE_LABELS[row.stage as ContactStage]}</td><td className="text-right">{row.count}</td></tr>)}</tbody>
        </table></div>
      </section>}

      {contacts.length > 0 ? (
        <div className="space-y-2.5">
          {contacts.map((c) => (
            <Link
              key={c.id}
              href={`/admin/crm/${c.id}`}
              className="flex flex-wrap items-center gap-4 rounded-xl bg-papel p-4 shadow-soft transition-shadow hover:shadow-card"
            >
              <div className="min-w-[180px] flex-1">
                <p className="font-medium text-carbon">{c.full_name}</p>
                <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[12px] text-humo">
                  {c.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {c.email}
                    </span>
                  )}
                  {c.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {c.phone}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <Badge tone="neutral">
                  {CONTACT_SOURCE_LABELS[c.source]}
                </Badge>
                {c.interest && (
                  <Badge tone="vivo">
                    {CONTACT_INTEREST_LABELS[c.interest]}
                  </Badge>
                )}
                <Badge tone={stageTone[c.stage]}>
                  {CONTACT_STAGE_LABELS[c.stage]}
                </Badge>
              </div>

              <div className="hidden text-right md:block">
                <p className="text-[12px] text-humo">
                  {formatDate(c.created_at)}
                </p>
                {c.property && (
                  <p className="max-w-[180px] truncate text-[12px] text-petroleo">
                    {c.property.title}
                  </p>
                )}
              </div>

              <ChevronRight className="h-4 w-4 text-bruma" />
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title={
            activeStage
              ? "Sin contactos en esta etapa"
              : "Aún no hay contactos"
          }
          description="Los mensajes del formulario web llegan aquí. También puedes dar de alta contactos manualmente."
        >
          <Link href="/admin/crm/nuevo" className="btn-primary">
            <Plus className="h-4 w-4" />
            Nuevo contacto
          </Link>
        </EmptyState>
      )}
    </>
  );
}
