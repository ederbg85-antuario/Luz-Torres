import { cn } from "@/lib/format";

type Tone =
  | "neutral"
  | "green"
  | "vivo"
  | "almond"
  | "amber"
  | "rose"
  | "ink";

const TONES: Record<Tone, string> = {
  neutral: "bg-lino text-humo",
  green: "bg-petroleo/10 text-petroleo",
  vivo: "bg-vivo/12 text-vivo",
  almond: "bg-almendra/15 text-nogal",
  amber: "bg-amber-100 text-amber-700",
  rose: "bg-rose-100 text-rose-700",
  ink: "bg-carbon text-hueso",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
