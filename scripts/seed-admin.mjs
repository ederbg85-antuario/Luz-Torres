/**
 * Crea el usuario administrador del panel de Luz Torres.
 *
 * Uso:  npm run seed:admin
 * (lee las variables de .env.local — requiere SUPABASE_SERVICE_ROLE_KEY)
 *
 * Credenciales por defecto (puedes cambiarlas con variables de entorno
 * ADMIN_EMAIL y ADMIN_PASSWORD antes de ejecutar):
 *
 *   Email:    admin@luztorres.com
 *   Password: LuzTorres2026!
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@luztorres.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "LuzTorres2026!";

if (!url || !serviceKey || serviceKey.includes("PEGA_AQUI")) {
  console.error(
    "\n  Faltan variables. Configura NEXT_PUBLIC_SUPABASE_URL y\n" +
      "  SUPABASE_SERVICE_ROLE_KEY en .env.local antes de ejecutar.\n"
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { error } = await supabase.auth.admin.createUser({
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
  email_confirm: true,
  user_metadata: { full_name: "Luz Torres", role: "admin" },
});

if (error) {
  if ((error.message || "").toLowerCase().includes("already")) {
    console.log(`\n  El usuario ya existe: ${ADMIN_EMAIL}\n`);
    process.exit(0);
  }
  console.error("\n  Error al crear el usuario:", error.message, "\n");
  process.exit(1);
}

console.log(
  "\n  Usuario administrador creado.\n" +
    `  Email:    ${ADMIN_EMAIL}\n` +
    `  Password: ${ADMIN_PASSWORD}\n\n` +
    "  Entra en /admin para iniciar sesión.\n"
);
