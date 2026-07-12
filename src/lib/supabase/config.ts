/**
 * Configuración de Supabase embebida en el código.
 *
 * El plan gratuito de Vercel del proyecto no permite gestionar variables
 * de entorno, así que los valores PÚBLICOS viven aquí como respaldo:
 *
 *  · URL del proyecto  — pública por diseño.
 *  · Clave anónima     — pública por diseño: viaja al navegador en todo
 *                        sitio hecho con Supabase; la seguridad real la
 *                        aplican las políticas RLS de la base de datos.
 *  · URL del sitio     — pública (metadatos SEO y sitemap).
 *
 * La clave service_role (SECRETA) nunca se incluye aquí: las operaciones
 * privilegiadas (invitar miembros) viven en la Edge Function
 * `invite-member`, dentro de Supabase, donde esa clave existe de forma
 * nativa. Ver `supabase/functions/invite-member/`.
 *
 * Si algún día se configuran variables de entorno, tienen prioridad.
 */

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://acrzgrbovizhqcnpmpdn.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjcnpncmJvdml6aHFjbnBtcGRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyOTQyNzQsImV4cCI6MjA5NDg3MDI3NH0.tGG-uyZh4za8MhKiTtmV2QP_ex6CC5Wz5PLwXsvLx9M";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://luztorres.com";
