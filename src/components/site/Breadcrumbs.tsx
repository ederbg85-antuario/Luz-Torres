import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { BreadcrumbItem } from "@/lib/seo";

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Ruta de navegación">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-2 text-[13px] text-humo">
        {items.map((item, index) => (
          <li key={item.path} className="inline-flex items-center gap-1.5">
            {index > 0 && <ChevronRight size={14} aria-hidden="true" />}
            {index === items.length - 1 ? (
              <span aria-current="page" className="text-carbon">
                {item.name}
              </span>
            ) : (
              <Link href={item.path} className="hover:text-petroleo">
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
