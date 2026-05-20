"use client";

import { useRef, useState } from "react";
import { ImagePlus, X, Star, Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/format";

export function ImageUploader({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError("");
    setUploading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const added: string[] = [];
      for (const file of Array.from(files)) {
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("property-images")
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (upErr) {
          setError(
            "No se pudo subir una imagen. Verifica la conexión con Supabase."
          );
          continue;
        }
        const { data } = supabase.storage
          .from("property-images")
          .getPublicUrl(path);
        added.push(data.publicUrl);
      }
      if (added.length) onChange([...value, ...added]);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {value.map((url, i) => (
          <div
            key={url}
            className="group relative aspect-square overflow-hidden rounded-md bg-lino"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Imagen ${i + 1}`}
              className="h-full w-full object-cover"
            />
            {i === 0 && (
              <span className="absolute left-1.5 top-1.5 rounded-full bg-petroleo px-2 py-0.5 text-[10px] font-semibold text-hueso">
                Portada
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-carbon/55 p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
              {i !== 0 && (
                <button
                  type="button"
                  onClick={() =>
                    onChange([url, ...value.filter((u) => u !== url)])
                  }
                  className="flex items-center gap-1 rounded px-1.5 py-1 text-[10px] font-medium text-hueso hover:bg-white/15"
                >
                  <Star className="h-3 w-3" />
                  Portada
                </button>
              )}
              <button
                type="button"
                onClick={() => onChange(value.filter((u) => u !== url))}
                className="ml-auto grid h-6 w-6 place-items-center rounded text-hueso hover:bg-white/15"
                aria-label="Quitar imagen"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "flex aspect-square flex-col items-center justify-center gap-1.5 rounded-md border-2 border-dashed border-lino text-humo transition-colors hover:border-vivo hover:text-vivo",
            uploading && "opacity-60"
          )}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <ImagePlus className="h-6 w-6" />
          )}
          <span className="text-[11px] font-medium">
            {uploading ? "Subiendo…" : "Agregar"}
          </span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <p className="mt-2 text-[12px] text-humo">
        La primera imagen es la portada. Se guardan en el almacenamiento de
        Supabase.
      </p>
      {error && (
        <p className="mt-1 text-[12px] text-rose-600">{error}</p>
      )}
    </div>
  );
}
