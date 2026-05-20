import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Panel de administración",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-hueso px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="flex justify-center text-petroleo">
          <Logo className="h-8" />
        </div>

        <div className="mt-7 rounded-xl bg-papel p-7 shadow-card">
          <h1 className="text-center text-lg font-semibold text-carbon">
            Panel de administración
          </h1>
          <p className="mt-1 text-center text-[13px] text-humo">
            Inicia sesión para gestionar propiedades, contactos y agenda.
          </p>
          <div className="mt-6">
            <LoginForm />
          </div>
        </div>

        <Link
          href="/"
          className="mt-6 flex items-center justify-center gap-1.5 text-[13px] text-humo transition-colors hover:text-carbon"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al sitio
        </Link>
      </div>
    </div>
  );
}
