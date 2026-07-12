"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Lock } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Phase = "verificando" | "listo" | "invalido" | "guardando";

/**
 * Recibe la invitación de Supabase (tokens en el hash de la URL),
 * establece la sesión y deja al nuevo miembro crear su contraseña.
 */
export function AcceptInviteForm() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("verificando");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function init() {
      // Tokens del correo de invitación: #access_token=…&refresh_token=…
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (!error) {
          window.history.replaceState(null, "", window.location.pathname);
          setPhase("listo");
          return;
        }
      }

      // Sin tokens en el hash: quizá ya hay sesión (enlace reabierto).
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setPhase(user ? "listo" : "invalido");
    }

    init();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setPhase("guardando");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError("No se pudo guardar la contraseña. Intenta de nuevo.");
      setPhase("listo");
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  if (phase === "verificando") {
    return (
      <p className="py-6 text-center text-sm text-humo">
        Verificando tu invitación…
      </p>
    );
  }

  if (phase === "invalido") {
    return (
      <div className="rounded-md bg-rose-50 px-4 py-3 text-center text-sm text-rose-700">
        Este enlace de invitación no es válido o ya expiró. Pide al
        administrador que te envíe una nueva invitación.
      </div>
    );
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <label className="block">
        <span className="label">Nueva contraseña</span>
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field"
          placeholder="Mínimo 8 caracteres"
        />
      </label>

      <label className="block">
        <span className="label">Confirmar contraseña</span>
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="field"
          placeholder="Repite la contraseña"
        />
      </label>

      {error && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={phase === "guardando"}
        className="btn-primary w-full py-3"
      >
        {phase === "guardando" ? (
          "Guardando…"
        ) : (
          <>
            <KeyRound className="h-4 w-4" />
            Crear contraseña y entrar
          </>
        )}
      </button>

      <p className="flex items-center justify-center gap-1.5 pt-1 text-[12px] text-humo">
        <Lock className="h-3.5 w-3.5" />
        Tu acceso es personal. No compartas tu contraseña.
      </p>
    </form>
  );
}
