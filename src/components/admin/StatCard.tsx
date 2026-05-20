import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
}) {
  return (
    <div className="rounded-xl bg-papel p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-humo">{label}</p>
        <span className="grid h-9 w-9 place-items-center rounded-md bg-petroleo/8 text-petroleo">
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>
      <p className="mt-3 font-mono text-3xl font-medium tabular-nums text-carbon">
        {value}
      </p>
      {hint && <p className="mt-1 text-[12px] text-humo">{hint}</p>}
    </div>
  );
}
