"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Images } from "lucide-react";
import type { PropertyType } from "@/lib/types";
import { cn } from "@/lib/format";
import { PropertyImage } from "./PropertyImage";

/**
 * Galería de la ficha — grid de portada contenido (no una imagen gigante)
 * con acceso a un visor a pantalla completa que muestra todas las fotos.
 */
export function PropertyGallery({
  images,
  type,
  title,
}: {
  images: string[];
  type: PropertyType;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const openAt = useCallback((i: number) => {
    setActive(i);
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);
  const prev = useCallback(
    () => setActive((i) => (i - 1 + images.length) % images.length),
    [images.length]
  );
  const next = useCallback(
    () => setActive((i) => (i + 1) % images.length),
    [images.length]
  );

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, prev, next]);

  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl shadow-card sm:aspect-[21/9]">
        <PropertyImage src={null} type={type} alt={title} priority />
      </div>
    );
  }

  const rest = images.slice(1, 5);

  return (
    <>
      <div className="relative grid grid-cols-4 grid-rows-2 gap-1.5 overflow-hidden rounded-xl shadow-card sm:h-[420px] lg:h-[460px]">
        <button
          type="button"
          onClick={() => openAt(0)}
          className="group relative col-span-4 row-span-2 h-64 overflow-hidden sm:col-span-2 sm:h-full"
        >
          <Image
            src={images[0]}
            alt={title}
            fill
            priority
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </button>

        {rest.map((img, i) => (
          <button
            key={img}
            type="button"
            onClick={() => openAt(i + 1)}
            className="group relative hidden overflow-hidden sm:block"
          >
            <Image
              src={img}
              alt={`${title} — foto ${i + 2}`}
              fill
              sizes="25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </button>
        ))}

        {/* Placeholders para completar el grid 2x2 cuando hay pocas fotos */}
        {rest.length < 4 &&
          Array.from({ length: 4 - rest.length }).map((_, i) => (
            <div
              key={`ph-${i}`}
              className="hidden bg-lino sm:block"
              aria-hidden
            />
          ))}

        <button
          type="button"
          onClick={() => openAt(0)}
          className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-2 rounded-full bg-papel/95 px-4 py-2.5 text-[13px] font-semibold text-carbon shadow-card backdrop-blur-sm transition-transform hover:scale-105"
        >
          <Images className="h-4 w-4 text-nogal" />
          Ver las {images.length} fotos
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex flex-col backdrop-blur-sm animate-fade-in"
          style={{ backgroundColor: "rgba(20, 14, 10, 0.97)" }}
        >
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <p className="text-sm font-medium text-hueso/80">
              {active + 1} / {images.length}
            </p>
            <button
              type="button"
              onClick={close}
              aria-label="Cerrar galería"
              className="grid h-10 w-10 place-items-center rounded-full bg-hueso/10 text-hueso transition-colors hover:bg-hueso/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative flex-1 px-2 pb-2 sm:px-6 sm:pb-6">
            <div className="relative h-full w-full overflow-hidden rounded-lg">
              <Image
                src={images[active]}
                alt={`${title} — foto ${active + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Foto anterior"
                  className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-hueso/10 text-hueso transition-colors hover:bg-hueso/25 sm:left-8"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Foto siguiente"
                  className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-hueso/10 text-hueso transition-colors hover:bg-hueso/25 sm:right-8"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-4 sm:px-6">
            {images.map((img, i) => (
              <button
                key={img}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "relative h-16 w-20 shrink-0 overflow-hidden rounded-md transition-opacity",
                  i === active
                    ? "ring-2 ring-almendra-claro"
                    : "opacity-50 hover:opacity-90"
                )}
              >
                <Image src={img} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
