"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Images, Expand } from "lucide-react";
import type { PropertyType } from "@/lib/types";
import { cn } from "@/lib/format";
import { PropertyImage } from "./PropertyImage";

export function PropertyGallery({
  images,
  type,
  title,
}: {
  images: string[];
  type: PropertyType;
  title: string;
}) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);
  const count = images.length;
  const move = (direction: number) =>
    setActive((i) => (i + direction + count) % count);
  const show = (index: number) => {
    setActive(index);
    setOpen(true);
  };
  useEffect(() => {
    const el = dialog.current;
    if (!el || !open) return;
    el.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      el.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);
  useEffect(() => {
    if (open)
      dialog.current
        ?.querySelector<HTMLElement>('[aria-current="true"]')
        ?.scrollIntoView({
          block: "nearest",
          inline: "center",
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "instant"
            : "smooth",
        });
  }, [active, open]);

  if (!count)
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#f5f6f5] shadow-card">
        <PropertyImage src={null} type={type} alt={title} priority />
      </div>
    );

  return (
    <>
      <div className="grid gap-3">
        <div
          className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-[#f4f5f4] shadow-card sm:aspect-[16/10]"
          onTouchStart={(e) => {
            touchX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchX.current !== null) {
              const difference = touchX.current - e.changedTouches[0].clientX;
              if (Math.abs(difference) > 45) move(difference > 0 ? 1 : -1);
            }
            touchX.current = null;
          }}
        >
          <button
            type="button"
            onClick={() => show(active)}
            aria-label={`Ampliar foto ${active + 1} de ${count}`}
            className="absolute inset-0"
          >
            <Image
              key={images[active]}
              src={images[active]}
              alt={`${title} — foto ${active + 1}`}
              fill
              priority={active === 0}
              sizes="(max-width: 1024px) 100vw, 65vw"
              className="object-cover animate-fade-in transition-transform duration-700 group-hover:scale-[1.025]"
            />
          </button>
          <span
            className="pointer-events-none absolute left-4 top-4 rounded-full bg-white/95 px-3 py-2 text-xs font-semibold text-petroleo shadow-soft"
            aria-live="polite"
          >
            {active + 1} / {count}
          </span>
          {count > 1 && (
            <>
              <button
                type="button"
                onClick={() => move(-1)}
                aria-label="Foto anterior"
                className="absolute left-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-petroleo shadow-card"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => move(1)}
                aria-label="Foto siguiente"
                className="absolute right-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-petroleo shadow-card"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => show(active)}
            className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2.5 text-sm font-semibold text-petroleo shadow-card"
          >
            <Images size={16} />
            Ver {count} fotos
            <Expand size={14} />
          </button>
        </div>
        <div className="no-scrollbar flex gap-3 overflow-x-auto px-1 pb-3 pt-1">
          {images.slice(0, 6).map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => (i === 5 && count > 6 ? show(6) : setActive(i))}
              aria-label={
                i === 5 && count > 6
                  ? "Ver todas las fotos"
                  : `Ver foto ${i + 1}`
              }
              aria-pressed={active === i}
              className={cn(
                "relative h-20 min-w-0 flex-1 shrink-0 basis-24 overflow-hidden rounded-md transition-all hover:-translate-y-1",
                active === i
                  ? "shadow-card opacity-100"
                  : "opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={src}
                alt={`${title} — miniatura ${i + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
              {i === 5 && count > 6 && (
                <span className="absolute inset-0 grid place-items-center bg-petroleo/75 text-sm font-semibold text-white">
                  +{count - 6}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      {open && (
        <dialog
          ref={dialog}
          className="property-gallery-dialog"
          aria-label={`Fotos: ${title}`}
          onCancel={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              move(-1);
            }
            if (e.key === "ArrowRight") {
              e.preventDefault();
              move(1);
            }
          }}
        >
          <div className="flex items-center justify-between gap-4 p-4 sm:px-8">
            <div className="min-w-0">
              <p className="truncate text-sm text-white/70">{title}</p>
              <p className="mt-1 text-sm font-semibold" aria-live="polite">
                Foto {active + 1} de {count}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar galería"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/15 text-white"
            >
              <X size={22} />
            </button>
          </div>
          <div
            className="relative min-h-0 flex-1"
            onTouchStart={(e) => {
              touchX.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              if (touchX.current !== null) {
                const dx = touchX.current - e.changedTouches[0].clientX;
                if (Math.abs(dx) > 45) move(dx > 0 ? 1 : -1);
              }
              touchX.current = null;
            }}
          >
            <Image
              src={images[active]}
              alt={`${title} — foto ${active + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => move(-1)}
                  aria-label="Foto anterior"
                  className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-petroleo shadow-card sm:left-8"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  onClick={() => move(1)}
                  aria-label="Foto siguiente"
                  className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-petroleo shadow-card sm:right-8"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
          <div className="no-scrollbar flex shrink-0 gap-3 overflow-x-auto p-4 sm:p-6">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                aria-label={`Ir a foto ${i + 1}`}
                aria-current={i === active ? "true" : undefined}
                onClick={() => setActive(i)}
                className={cn(
                  "relative h-16 w-20 shrink-0 overflow-hidden rounded-sm transition-opacity",
                  i === active
                    ? "opacity-100 shadow-elevated"
                    : "opacity-45 hover:opacity-100",
                )}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </dialog>
      )}
    </>
  );
}
