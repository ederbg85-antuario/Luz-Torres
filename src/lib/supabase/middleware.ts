import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Refresca la sesión de Supabase y protege las rutas /admin.
 * El registro público está deshabilitado: si no hay sesión, se
 * redirige al login. No existe pantalla de "crear cuenta".
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Sin credenciales configuradas: no bloquear el sitio público.
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAdminArea = path.startsWith("/admin");
  // Rutas públicas del panel: login e invitación (los tokens de la
  // invitación llegan en el hash de la URL, invisible para el servidor).
  const isLogin = path === "/admin/login";
  const isInvite = path === "/admin/invitacion";

  if (isAdminArea && !isLogin && !isInvite && !user) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/admin/login";
    redirect.searchParams.set("next", path);
    return NextResponse.redirect(redirect);
  }

  if (isLogin && user) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/admin";
    redirect.search = "";
    return NextResponse.redirect(redirect);
  }

  return response;
}
