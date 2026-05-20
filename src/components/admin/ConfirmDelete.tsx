"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/format";

type Result = { ok: boolean; error?: string };

export function ConfirmDelete({
  onDelete,
  redirectTo,
  variant = "icon",
  label = "Eliminar",
}: {
  onDelete: () => Promise<Result>;
  redirectTo?: string;
  variant?: "icon" | "button";
  label?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  function run() {
    setError("");
    start(async () => {
      const res = await onDelete();
      if (res.ok) {
        if (redirectTo) router.push(redirectTo);
        router.refresh();
      } else {
        setError(res.error ?? "No se pudo eliminar.");
        setConfirming(false);
      }
    });
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-1.5">
        <span className="text-[12px] text-humo">¿Eliminar?</span>
        <button
          type="button"
          onClick={run}
          disabled={pending}
          className="rounded-md bg-rose-600 px-2 py-1 text-[12px] font-semibold text-white"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Sí"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-md bg-lino px-2 py-1 text-[12px] font-semibold text-carbon"
        >
          No
        </button>
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col items-end">
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={cn(
          variant === "icon"
            ? "grid h-9 w-9 place-items-center rounded-md text-humo transition-colors hover:bg-rose-50 hover:text-rose-600"
            : "btn-ghost py-2.5 text-rose-600 hover:border-rose-200"
        )}
        aria-label={label}
      >
        <Trash2 className="h-4 w-4" />
        {variant === "button" && label}
      </button>
      {error && <span className="mt-1 text-[11px] text-rose-600">{error}</span>}
    </span>
  );
}
