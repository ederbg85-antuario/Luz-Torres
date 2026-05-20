"use client";

import { useState } from "react";
import Image from "next/image";
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

  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl shadow-card">
        <PropertyImage src={null} type={type} alt={title} priority />
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-lino shadow-card">
        <Image
          src={images[active]}
          alt={title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2.5">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-md transition-opacity",
                i === active
                  ? "ring-2 ring-vivo ring-offset-2 ring-offset-hueso"
                  : "opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={img}
                alt={`${title} — foto ${i + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
