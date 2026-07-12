import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { AcceptInviteForm } from "@/components/admin/AcceptInviteForm";

export const metadata: Metadata = {
  title: "Crear contraseña",
  robots: { index: false, follow: false },
};

/**
 * Página de aterrizaje de las invitaciones al panel.
 * El correo de Supabase redirige aquí con los tokens en el hash de la
 * URL; el formulario cliente establece la sesión y permite crear la
 * contraseña. También funciona para restablecerla (type=recovery).
 */
export default function InvitacionPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-hueso px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="flex justify-center text-petroleo">
          <Logo className="h-8" />
        </div>

        <div className="mt-7 rounded-xl bg-papel p-7 shadow-card">
          <h1 className="text-center text-lg font-semibold text-carbon">
            Bienvenido al equipo
          </h1>
          <p className="mt-1 text-center text-[13px] text-humo">
            Crea tu contraseña para entrar al panel de administración.
          </p>
          <div className="mt-6">
            <AcceptInviteForm />
          </div>
        </div>

        <Link
          href="/admin/login"
          className="mt-6 flex items-center justify-center gap-1.5 text-[13px] text-humo transition-colors hover:text-carbon"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Ya tengo cuenta — iniciar sesión
        </Link>
      </div>
    </div>
  );
}
