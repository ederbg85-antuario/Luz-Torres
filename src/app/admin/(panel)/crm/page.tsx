import Link from "next/link";
import { Plus, Users, Mail, Phone, ChevronRight } from "lucide-react";
import { getContacts } from "@/lib/admin-data";
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
