import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, CalendarClock, Building2 } from "lucide-react";
import {
  getContact,
  getPropertyOptions,
  getAppointments,
} from "@/lib/admin-data";
import { deleteContact } from "@/lib/actions/contacts";
import { PageHeader } from "@/components/admin/PageHeader";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { ContactEditor } from "@/components/admin/ContactEditor";
import { Badge } from "@/components/ui/Badge";
import {
  APPOINTMENT_TYPE_LABELS,
  CONTACT_INTEREST_LABELS,
  FINANCING_LABELS,
  CONTACT_SOURCE_LABELS,
  CONTACT_STAGE_LABELS,
} from "@/lib/constants";
import { stageTone } from "@/lib/badges";
import { formatDate, formatDateTime, formatPrice } from "@/lib/format";

function waLink(phone: string | null) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  const full = digits.length === 10 ? `52${digits}` : digits;
  return `https://wa.me/${full}`;
}

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [contact, properties, allAppointments] = await Promise.all([
    getContact(id),
    getPropertyOptions(),
    getAppointments(),
  ]);
  if (!contact) notFound();

  const appointments = allAppointments.filter((a) => a.contact_id === id);
  const whatsapp = waLink(contact.phone);

  return (
    <>
      <PageHeader title={contact.full_name} description="Ficha del contacto">
        {whatsapp && (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-accent py-2.5"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        )}
        <ConfirmDelete
          variant="button"
          label="Eliminar contacto"
          onDelete={deleteContact.bind(null, id)}
          redirectTo="/admin/crm"
        />
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <ContactEditor contact={contact} properties={properties} />
        </div>

        <aside className="space-y-4">
          {/* Resumen */}
          <div className="rounded-xl bg-papel p-5 shadow-soft">
            <h3 className="text-sm font-semibold text-carbon">Resumen</h3>
            <dl className="mt-3 space-y-2.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-humo">Etapa</dt>
                <dd>
                  <Badge tone={stageTone[contact.stage]}>
                    {CONTACT_STAGE_LABELS[contact.stage]}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-humo">Origen</dt>
                <dd className="text-carbon">
                  {CONTACT_SOURCE_LABELS[contact.source]}
                </dd>
              </div>
              {contact.interest && (
                <div className="flex justify-between gap-3">
                  <dt className="text-humo">Interés</dt>
                  <dd className="text-carbon">
                    {CONTACT_INTEREST_LABELS[contact.interest]}
                  </dd>
                </div>
              )}
              {contact.financing && (
                <div className="flex justify-between gap-3">
                  <dt className="text-humo">Financiamiento</dt>
                  <dd className="text-right text-carbon">
                    {FINANCING_LABELS[contact.financing]}
                  </dd>
                </div>
              )}
              {(contact.budget_min || contact.budget_max) && (
                <div className="flex justify-between gap-3">
                  <dt className="text-humo">Presupuesto</dt>
                  <dd className="text-right font-mono text-[13px] text-carbon">
                    {contact.budget_min
                      ? formatPrice(contact.budget_min)
                      : "—"}
                    {" – "}
                    {contact.budget_max
                      ? formatPrice(contact.budget_max)
                      : "—"}
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <dt className="text-humo">Registrado</dt>
                <dd className="text-carbon">
                  {formatDate(contact.created_at)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-humo">Último contacto</dt>
                <dd className="text-carbon">
                  {formatDate(contact.last_contacted_at)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Mensaje original */}
          {contact.message && (
            <div className="rounded-xl bg-papel p-5 shadow-soft">
              <h3 className="text-sm font-semibold text-carbon">
                Mensaje recibido
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-humo">
                “{contact.message}”
              </p>
            </div>
          )}

          {/* Propiedad asociada */}
          {contact.property && (
            <Link
              href={`/propiedades/${contact.property.slug}`}
              target="_blank"
              className="flex items-center gap-3 rounded-xl bg-papel p-4 shadow-soft transition-shadow hover:shadow-card"
            >
              <span className="grid h-9 w-9 place-items-center rounded-md bg-petroleo/8 text-petroleo">
                <Building2 className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] uppercase tracking-eyebrow text-humo">
                  Propiedad de interés
                </span>
                <span className="block truncate text-sm font-medium text-carbon">
                  {contact.property.title}
                </span>
              </span>
            </Link>
          )}

          {/* Citas */}
          <div className="rounded-xl bg-papel p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-carbon">Citas</h3>
              <Link
                href="/admin/agenda"
                className="text-[12px] font-medium text-vivo hover:underline"
              >
                Agenda
              </Link>
            </div>
            {appointments.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {appointments.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-start gap-2.5 rounded-md bg-nieve p-2.5"
                  >
                    <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-petroleo" />
                    <div>
                      <p className="text-[13px] font-medium text-carbon">
                        {APPOINTMENT_TYPE_LABELS[a.type]}
                      </p>
                      <p className="text-[12px] text-humo">
                        {formatDateTime(a.starts_at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[13px] text-humo">
                Sin citas registradas.
              </p>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
