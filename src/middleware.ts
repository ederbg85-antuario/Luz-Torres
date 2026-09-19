import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { SITE_URL } from "@/lib/supabase/config";

const DASHBOARD_HOST = process.env.DASHBOARD_HOST || "dashboard.luztorres.com";
const PUBLIC_HOST = new URL(SITE_URL).hostname;

function requestHost(request: NextRequest) {
  // En Vercel, `host` puede ser el alias interno del deployment. Conserva el
  // dominio que pidió el visitante para distinguir el sitio del dashboard.
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    request.nextUrl.hostname;

  return host.split(",")[0]?.trim().split(":")[0]?.toLowerCase() ?? "";
}

export async function middleware(request: NextRequest) {
  const host = requestHost(request);
  const path = request.nextUrl.pathname;
  const isDashboardHost = host === DASHBOARD_HOST;
  const isPublicHost = host === PUBLIC_HOST || host === `www.${PUBLIC_HOST}`;

  // En producción, el panel vive en un host separado. Mantener una sola
  // aplicación evita duplicar repositorio y Supabase, sin mezclar URLs ni
  // analítica del backoffice con el sitio indexable.
  if (isDashboardHost && path === "/") {
    const sessionResponse = await updateSession(request);
    if (sessionResponse.headers.get("location")) return sessionResponse;

    const dashboardRoot = request.nextUrl.clone();
    dashboardRoot.pathname = "/admin";
    const response = NextResponse.rewrite(dashboardRoot);
    sessionResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
    return response;
  }

  if (isPublicHost && path.startsWith("/admin")) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.protocol = "https:";
    dashboardUrl.hostname = DASHBOARD_HOST;
    dashboardUrl.port = "";
    return NextResponse.redirect(dashboardUrl);
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
