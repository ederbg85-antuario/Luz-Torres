import { createClient } from "@supabase/supabase-js";

/**
 * Cliente con privilegios de servicio (service_role).
 * SOLO debe usarse en el servidor — nunca en componentes del navegador.
 * Se usa para invitar a nuevos miembros del equipo.
 */
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export function isServiceRoleConfigured() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(key && !key.includes("PEGA_AQUI"));
}
