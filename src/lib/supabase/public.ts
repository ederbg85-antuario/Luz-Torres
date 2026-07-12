import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config";

/** Indica si las credenciales de Supabase están configuradas. */
export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/**
 * Cliente de solo lectura para contenido público (propiedades).
 * Usa la clave anónima y no depende de cookies — permite cachear
 * las páginas públicas y generar el sitemap sin contexto de petición.
 */
export function createSupabasePublicClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
}
