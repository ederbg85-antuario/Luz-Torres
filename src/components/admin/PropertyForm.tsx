"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus, X, Save } from "lucide-react";
import {
  createProperty,
  updateProperty,
  type PropertyInput,
} from "@/lib/actions/properties";
import {
  AMENITY_SUGGESTIONS,
  MEXICAN_STATES,
  OPERATION_LABELS,
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
  PROPERTY_TYPES,
} from "@/lib/constants";
import type {
  Operation,
  Property,
  PropertyStatus,
  PropertyType,
} from "@/lib/types";
import { ImageUploader } from "./ImageUploader";

export function PropertyForm({ property }: { property?: Property }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: property?.title ?? "",
    description: property?.description ?? "",
    operation: (property?.operation ?? "venta") as Operation,
    property_type: (property?.property_type ?? "casa") as PropertyType,
    status: (property?.status ?? "disponible") as PropertyStatus,
    price: property ? String(property.price) : "",
    estado: property?.estado ?? "",
    municipio: property?.municipio ?? "",
    colonia: property?.colonia ?? "",
    direccion: property?.direccion ?? "",
    bedrooms: property?.bedrooms ? String(property.bedrooms) : "",
    bathrooms: property?.bathrooms ? String(property.bathrooms) : "",
    parking: property?.parking ? String(property.parking) : "",
    area_m2: property?.area_m2 ? String(property.area_m2) : "",
    lot_m2: property?.lot_m2 ? String(property.lot_m2) : "",
    featured: property?.featured ?? false,
  });

  const [amenities, setAmenities] = useState<string[]>(
    property?.amenities ?? []
  );
  const [amenityInput, setAmenityInput] = useState("");
  const [images, setImages] = useState<string[]>([
    ...(property?.cover_image ? [property.cover_image] : []),
    ...(property?.images ?? []),
  ]);

  function set<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function addAmenity(raw: string) {
    const a = raw.trim();
    if (a && !amenities.includes(a)) setAmenities((list) => [...list, a]);
    setAmenityInput("");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const input: PropertyInput = {
      title: form.title,
      description: form.description,
      operation: form.operation,
      property_type: form.property_type,
      status: form.status,
      price: Number(form.price) || 0,
      estado: form.estado,
      municipio: form.municipio,
      colonia: form.colonia,
      direccion: form.direccion,
      bedrooms: Number(form.bedrooms) || 0,
      bathrooms: Number(form.bathrooms) || 0,
      parking: Number(form.parking) || 0,
      area_m2: Number(form.area_m2) || 0,
      lot_m2: Number(form.lot_m2) || 0,
      amenities,
      cover_image: images[0] ?? null,
      images: images.slice(1),
      featured: form.featured,
    };

    startTransition(async () => {
      const res = property
        ? await updateProperty(property.id, input)
        : await createProperty(input);
      if (res.ok) {
        router.push("/admin/propiedades");
        router.refresh();
      } else {
        setError(res.error ?? "No se pudo guardar.");
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Datos principales */}
      <section className="rounded-xl bg-papel p-6 shadow-soft">
        <h2 className="font-semibold text-carbon">Datos principales</h2>
        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="label">Título de la propiedad</span>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
              className="field"
              placeholder="Departamento en venta en Del Valle, Benito Juárez"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="label">Operación</span>
              <select
                value={form.operation}
                onChange={(e) =>
                  set("operation", e.target.value as Operation)
                }
                className="field"
              >
                {(Object.keys(OPERATION_LABELS) as Operation[]).map((o) => (
                  <option key={o} value={o}>
                    {OPERATION_LABELS[o]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="label">Tipo</span>
              <select
                value={form.property_type}
                onChange={(e) =>
                  set("property_type", e.target.value as PropertyType)
                }
                className="field"
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {PROPERTY_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="label">Estatus</span>
              <select
                value={form.status}
                onChange={(e) =>
                  set("status", e.target.value as PropertyStatus)
                }
                className="field"
              >
                {(
                  Object.keys(PROPERTY_STATUS_LABELS) as PropertyStatus[]
                ).map((s) => (
                  <option key={s} value={s}>
                    {PROPERTY_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="label">
                Precio (MXN){form.operation === "renta" ? " · mensual" : ""}
              </span>
              <input
                type="number"
                inputMode="numeric"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                className="field"
                placeholder="0"
              />
            </label>
            <label className="flex items-center gap-3 pt-7">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set("featured", e.target.checked)}
                className="h-4 w-4 rounded border-lino text-vivo focus:ring-vivo"
              />
              <span className="text-sm text-carbon">
                Mostrar como propiedad destacada
              </span>
            </label>
          </div>

          <label className="block">
            <span className="label">Descripción</span>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={5}
              className="field resize-none"
              placeholder="Describe la propiedad con datos concretos: metros, recámaras, zona, créditos que aplican…"
            />
          </label>
        </div>
      </section>

      {/* Ubicación */}
      <section className="rounded-xl bg-papel p-6 shadow-soft">
        <h2 className="font-semibold text-carbon">Ubicación</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="label">Estado</span>
            <select
              value={form.estado}
              onChange={(e) => set("estado", e.target.value)}
              required
              className="field"
            >
              <option value="">Selecciona un estado</option>
              {MEXICAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="label">Ciudad / Alcaldía</span>
            <input
              value={form.municipio}
              onChange={(e) => set("municipio", e.target.value)}
              required
              className="field"
              placeholder="Benito Juárez"
            />
          </label>
          <label className="block">
            <span className="label">Colonia</span>
            <input
              value={form.colonia}
              onChange={(e) => set("colonia", e.target.value)}
              className="field"
              placeholder="Del Valle Centro"
            />
          </label>
          <label className="block">
            <span className="label">Dirección o calle (referencia)</span>
            <input
              value={form.direccion}
              onChange={(e) => set("direccion", e.target.value)}
              className="field"
              placeholder="Av. Coyoacán"
            />
          </label>
        </div>
      </section>

      {/* Características */}
      <section className="rounded-xl bg-papel p-6 shadow-soft">
        <h2 className="font-semibold text-carbon">Características</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {(
            [
              ["bedrooms", "Recámaras"],
              ["bathrooms", "Baños"],
              ["parking", "Estacionamientos"],
              ["area_m2", "Construcción m²"],
              ["lot_m2", "Terreno m²"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block">
              <span className="label">{label}</span>
              <input
                type="number"
                inputMode="decimal"
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                className="field"
                placeholder="0"
              />
            </label>
          ))}
        </div>

        {/* Amenidades */}
        <div className="mt-5">
          <span className="label">Amenidades</span>
          <div className="flex gap-2">
            <input
              value={amenityInput}
              onChange={(e) => setAmenityInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addAmenity(amenityInput);
                }
              }}
              className="field"
              placeholder="Escribe una amenidad y presiona Enter"
            />
            <button
              type="button"
              onClick={() => addAmenity(amenityInput)}
              className="btn-ghost shrink-0 px-3 py-2.5"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {amenities.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {amenities.map((a) => (
                <span
                  key={a}
                  className="flex items-center gap-1.5 rounded-full bg-petroleo/8 px-3 py-1 text-[13px] text-petroleo"
                >
                  {a}
                  <button
                    type="button"
                    onClick={() =>
                      setAmenities((list) => list.filter((x) => x !== a))
                    }
                    aria-label={`Quitar ${a}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-1.5">
            {AMENITY_SUGGESTIONS.filter((s) => !amenities.includes(s)).map(
              (s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addAmenity(s)}
                  className="rounded-full border border-lino px-2.5 py-1 text-[12px] text-humo transition-colors hover:border-vivo hover:text-vivo"
                >
                  + {s}
                </button>
              )
            )}
          </div>
        </div>
      </section>

      {/* Imágenes */}
      <section className="rounded-xl bg-papel p-6 shadow-soft">
        <h2 className="font-semibold text-carbon">Fotografías</h2>
        <p className="mt-1 text-sm text-humo">
          Si no agregas fotos, la propiedad usará un diseño de marca como
          portada.
        </p>
        <div className="mt-4">
          <ImageUploader value={images} onChange={setImages} />
        </div>
      </section>

      {error && (
        <p className="rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="btn-primary py-3"
        >
          <Save className="h-4 w-4" />
          {pending
            ? "Guardando…"
            : property
              ? "Guardar cambios"
              : "Publicar propiedad"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/propiedades")}
          className="btn-ghost py-3"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
