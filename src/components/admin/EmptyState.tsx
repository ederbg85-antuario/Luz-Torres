import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-papel p-12 text-center shadow-soft">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-nieve">
        <Icon className="h-5 w-5 text-bruma" />
      </div>
      <p className="mt-4 font-semibold text-carbon">{title}</p>
      {description && (
        <p className="mx-auto mt-1 max-w-sm text-sm text-humo">
          {description}
        </p>
      )}
      {children && <div className="mt-5 flex justify-center">{children}</div>}
    </div>
  );
}
