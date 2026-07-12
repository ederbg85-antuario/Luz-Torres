"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SUPABASE_URL, SUPABASE_ANON_KEY, SITE_URL } from "@/lib/supabase/config";

export type TeamState = {
  status: "idle" | "success" | "error";
  message: string;
};

/**
 * Invita a un nuevo miembro del equipo por correo.
 * El registro público está deshabilitado: esta es la única vía
 * para crear cuentas de acceso al panel.
 *
 * La operación privilegiada (crear el usuario) corre en la Edge
 * Function `invite-member` dentro de Supabase — ahí vive la clave
 * service_role, sin depender de variables de entorno en Vercel.
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
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return { status: "error", message: "Tu sesión expiró." };
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/invite-member`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        email,
        full_name: fullName,
        role: role === "admin" ? "admin" : "agente",
        redirect_to: `${SITE_URL}/admin/invitacion`,
      }),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      throw new Error(body?.error || "No se pudo enviar la invitación.");
    }
  } catch (e) {
    return {
      status: "error",
      message:
        e instanceof Error ? e.message : "No se pudo enviar la invitación.",
    };
  }

  revalidatePath("/admin/equipo");
  return {
    status: "success",
    message: `Invitación enviada a ${email}.`,
  };
}
