import { ShieldCheck, UserCircle } from "lucide-react";
import { getProfiles } from "@/lib/admin-data";
import { PageHeader } from "@/components/admin/PageHeader";
import { InviteForm } from "@/components/admin/InviteForm";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";

export default async function EquipoPage() {
  const profiles = await getProfiles();

  return (
    <>
      <PageHeader
        title="Equipo"
        description="Gestiona quién tiene acceso al panel de administración."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Miembros */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-carbon">
            Miembros con acceso ({profiles.length})
          </h2>
          {profiles.length > 0 ? (
            <div className="space-y-2.5">
              {profiles.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-xl bg-papel p-4 shadow-soft"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-petroleo/8 text-petroleo">
                    <UserCircle className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-carbon">
                      {p.full_name}
                    </p>
                    <p className="text-[12px] text-humo">
                      Se unió el {formatDate(p.created_at)}
                    </p>
                  </div>
                  <Badge tone={p.role === "admin" ? "green" : "neutral"}>
                    {p.role === "admin" ? "Administrador" : "Agente"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-papel p-8 text-center text-sm text-humo shadow-soft">
              Aún no hay miembros registrados.
            </div>
          )}
        </div>

        {/* Invitar */}
        <aside className="space-y-4">
          <div className="rounded-xl bg-papel p-5 shadow-soft">
            <h2 className="font-semibold text-carbon">Invitar a un miembro</h2>
            <p className="mt-1 text-[13px] text-humo">
              Recibirá un correo para crear su contraseña y acceder al panel.
            </p>
            <div className="mt-4">
              <InviteForm />
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-sombra p-5">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-almendra-claro" />
            <p className="text-[13px] leading-relaxed text-bruma">
              El registro público está deshabilitado. Las cuentas de acceso
              solo se crean por invitación desde este panel.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
