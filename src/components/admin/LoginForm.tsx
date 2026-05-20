"use client";

import { useActionState } from "react";
import { LogIn, Lock } from "lucide-react";
import { signIn, type AuthState } from "@/lib/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    signIn,
    null
  );

  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="label">Correo electrónico</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="field"
          placeholder="correo@luztorres.com"
        />
      </label>

      <label className="block">
        <span className="label">Contraseña</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="field"
          placeholder="••••••••"
        />
      </label>

      {state?.error && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full py-3"
      >
        {pending ? (
          "Entrando…"
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            Entrar al panel
          </>
        )}
      </button>

      <p className="flex items-center justify-center gap-1.5 pt-1 text-[12px] text-humo">
        <Lock className="h-3.5 w-3.5" />
        Acceso solo por invitación de Luz Torres.
      </p>
    </form>
  );
}
