import Image from "next/image";
import {
  Home,
  Building2,
  Briefcase,
  Warehouse,
  Trees,
  Store,
} from "lucide-react";
import type { PropertyType } from "@/lib/types";
import { cn } from "@/lib/format";

const TYPE_ICON: Record<PropertyType, typeof Home> = {
  casa: Home,
  departamento: Building2,
  oficina: Briefcase,
  bodega: Warehouse,
  terreno: Trees,
  local: Store,
};

const GRADIENTS = [
  "from-petroleo to-sombra",
  "from-nogal to-almendra",
  "from-sombra via-petroleo to-vivo",
  "from-almendra to-nogal",
  "from-petroleo via-vivo to-sombra",
];

/**
 * Imagen de propiedad. Si no hay foto cargada, muestra un
 * placeholder con degradado de marca — siguiendo el brandbook.
 */
export function PropertyImage({
  src,
  type,
  alt,
  index = 0,
  sizes,
  priority,
}: {
  src: string | null;
  type: PropertyType;
  alt: string;
  index?: number;
  sizes?: string;
  priority?: boolean;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? "(max-width: 768px) 100vw, 33vw"}
        className="object-cover"
        priority={priority}
      />
    );
  }

  const Icon = TYPE_ICON[type] ?? Home;
  const gradient = GRADIENTS[index % GRADIENTS.length];

  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-gradient-to-br",
        gradient
      )}
    >
      <Icon className="h-14 w-14 text-hueso/25" strokeWidth={1.5} />
    </div>
  );
}
