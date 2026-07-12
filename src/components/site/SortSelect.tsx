"use client";

import { useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { value: "recientes", label: "Más recientes" },
  { value: "precio_asc", label: "Precio: menor a mayor" },
  { value: "precio_desc", label: "Precio: mayor a menor" },
];

export function SortSelect() {
  const router = useRouter();
  const sp = useSearchParams();
  const current = sp.get("sort") ?? "recientes";

  function change(value: string) {
    const params = new URLSearchParams(sp.toString());
    if (value === "recientes") params.delete("sort");
    else params.set("sort", value);
    router.push(`/propiedades?${params.toString()}`);
  }

  return (
    <label className="flex items-center gap-2 text-sm text-humo">
      <span className="hidden sm:inline">Ordenar:</span>
      <select
        value={current}
        onChange={(e) => change(e.target.value)}
        className="rounded-md border border-lino bg-papel px-3 py-2 text-sm font-medium text-carbon outline-none focus:border-almendra"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
