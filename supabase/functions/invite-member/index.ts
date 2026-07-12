// Edge Function: invite-member
//
// Invita a un nuevo miembro del equipo por correo. Vive dentro de
// Supabase porque aquí la clave service_role existe de forma nativa
// (Deno.env), sin depender de variables de entorno en Vercel.
//
// Seguridad: el gateway exige un JWT válido (verify_jwt = true) y
// además se verifica que el token corresponda a un usuario real del
// panel. El registro público está deshabilitado, así que solo el
// equipo puede invocarla.
//
// Despliegue: se publica vía MCP/CLI de Supabase con verify_jwt=true.

import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Verificar que quien llama tiene sesión activa en el panel.
  const authHeader = req.headers.get("Authorization") ?? "";
  const caller = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const {
    data: { user },
  } = await caller.auth.getUser();
  if (!user) return json({ error: "Sesión inválida o expirada." }, 401);

  let payload: {
    email?: string;
    full_name?: string;
    role?: string;
    redirect_to?: string;
  };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Cuerpo de la petición inválido." }, 400);
  }

  const email = (payload.email ?? "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "Correo electrónico inválido." }, 400);
  }

  const fullName = (payload.full_name ?? "").trim() || "Equipo Luz Torres";
  const role = payload.role === "admin" ? "admin" : "agente";

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName, role },
    redirectTo: payload.redirect_to,
  });

  if (error) {
    const msg = /already been registered|already registered/i.test(
      error.message
    )
      ? "Ese correo ya tiene una cuenta en el panel."
      : error.message;
    return json({ error: msg }, 400);
  }

  return json({ ok: true });
});
