import { createClient } from "@supabase/supabase-js";

/** Indica si las credenciales de Supabase están configuradas. */
export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !key.includes("PEGA_AQUI"));
}

/**
 * Cliente de solo lectura para contenido público (propiedades).
 * Usa la clave anónima y no depende de cookies — permite cachear
 * las páginas públicas y generar el sitemap sin contexto de petición.
 */
export function createSupabasePublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key",
    { auth: { persistSession: false } }
  );
}
