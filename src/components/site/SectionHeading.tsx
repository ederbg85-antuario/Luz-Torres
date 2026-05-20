import { cn } from "@/lib/format";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  center,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  intro?: string;
  center?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        center && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-3 text-hero">{title}</h2>
      {intro && (
        <p className="mt-4 text-[15px] leading-relaxed text-humo">{intro}</p>
      )}
    </div>
  );
}
