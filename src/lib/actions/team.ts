"use server";

import { revalidatePath } from "next/cache";
import {
  createSupabaseAdminClient,
  isServiceRoleConfigured,
} from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type TeamState = {
  status: "idle" | "success" | "error";
  message: string;
};

/**
 * Invita a un nuevo miembro del equipo por correo.
 * El registro público está deshabilitado: esta es la única vía
 * para crear cuentas de acceso al panel.
 */
export async function inviteMember(
  _prev: TeamState,
  formData: FormData
): Promise<TeamState> {
  const email = String(formData.get("email") ?? "").trim();
  const fullName =
    String(formData.get("full_name") ?? "").trim() || "Equipo Luz Torres";
  const role = String(formData.get("role") ?? "agente");

  if (!email) {
    return { status: "error", message: "Ingresa un correo electrónico." };
  }

  // El invitador debe tener sesión activa.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "Tu sesión expiró." };
  }

  if (!isServiceRoleConfigured()) {
    return {
      status: "error",
      message:
        "Falta configurar SUPABASE_SERVICE_ROLE_KEY en las variables de entorno.",
    };
  }

  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName, role: role === "admin" ? "admin" : "agente" },
    });
    if (error) throw error;
  } catch (e) {
    return {
      status: "error",
      message:
        e instanceof Error
          ? e.message
          : "No se pudo enviar la invitación.",
    };
  }

  revalidatePath("/admin/equipo");
  return {
    status: "success",
    message: `Invitación enviada a ${email}.`,
  };
}
