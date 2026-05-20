"use client";

import { useActionState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { inviteMember, type TeamState } from "@/lib/actions/team";

const INITIAL: TeamState = { status: "idle", message: "" };

export function InviteForm() {
  const [state, action, pending] = useActionState(inviteMember, INITIAL);

  return (
    <form action={action} className="space-y-3.5">
      <div className="grid gap-3.5 sm:grid-cols-2">
        <label className="block">
          <span className="label">Nombre</span>
          <input
            name="full_name"
            className="field"
            placeholder="Nombre del nuevo miembro"
          />
        </label>
        <label className="block">
          <span className="label">Correo electrónico</span>
          <input
            name="email"
            type="email"
            required
            className="field"
            placeholder="correo@ejemplo.com"
          />
        </label>
      </div>
      <label className="block">
        <span className="label">Rol</span>
        <select name="role" defaultValue="agente" className="field">
          <option value="agente">Agente</option>
          <option value="admin">Administrador</option>
        </select>
      </label>

      {state.status === "success" && (
        <p className="flex items-center gap-2 rounded-md bg-petroleo/8 px-3 py-2 text-sm text-petroleo">
          <CheckCircle2 className="h-4 w-4" />
          {state.message}
        </p>
      )}
      {state.status === "error" && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-primary py-2.5"
      >
        <Send className="h-4 w-4" />
        {pending ? "Enviando…" : "Enviar invitación"}
      </button>
    </form>
  );
}
