"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Save } from "lucide-react";
import {
  createContact,
  updateContact,
  type ContactInput,
} from "@/lib/actions/contacts";
import {
  CONTACT_INTEREST_LABELS,
  CONTACT_SOURCE_LABELS,
  CONTACT_STAGES,
  CONTACT_STAGE_LABELS,
} from "@/lib/constants";
import type {
  Contact,
  ContactInterest,
  ContactSource,
  ContactStage,
} from "@/lib/types";

export function ContactEditor({
  contact,
  properties,
}: {
  contact?: Contact;
  properties: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    full_name: contact?.full_name ?? "",
    email: contact?.email ?? "",
    phone: contact?.phone ?? "",
    source: (contact?.source ?? "web") as ContactSource,
    stage: (contact?.stage ?? "nuevo") as ContactStage,
    interest: (contact?.interest ?? "compra") as ContactInterest,
    budget_min: contact?.budget_min ? String(contact.budget_min) : "",
    budget_max: contact?.budget_max ? String(contact.budget_max) : "",
    property_id: contact?.property_id ?? "",
    notes: contact?.notes ?? "",
  });

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const input: ContactInput = {
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      source: form.source,
      stage: form.stage,
      interest: form.interest,
      budget_min: form.budget_min ? Number(form.budget_min) : null,
      budget_max: form.budget_max ? Number(form.budget_max) : null,
      notes: form.notes,
      property_id: form.property_id || null,
    };
    start(async () => {
      const res = contact
        ? await updateContact(contact.id, input)
        : await createContact(input);
      if (res.ok) {
        router.push(contact ? `/admin/crm/${contact.id}` : "/admin/crm");
        router.refresh();
      } else {
        setError(res.error ?? "No se pudo guardar.");
      }
    });
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-xl bg-papel p-6 shadow-soft"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="label">Nombre completo</span>
          <input
            value={form.full_name}
            onChange={(e) => set("full_name", e.target.value)}
            required
            className="field"
          />
        </label>
        <label className="block">
          <span className="label">Teléfono / WhatsApp</span>
          <input
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            className="field"
          />
        </label>
        <label className="block">
          <span className="label">Correo electrónico</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className="field"
          />
        </label>
        <label className="block">
          <span className="label">Origen</span>
          <select
            value={form.source}
            onChange={(e) => set("source", e.target.value as ContactSource)}
            className="field"
          >
            {(Object.keys(CONTACT_SOURCE_LABELS) as ContactSource[]).map(
              (s) => (
                <option key={s} value={s}>
                  {CONTACT_SOURCE_LABELS[s]}
                </option>
              )
            )}
          </select>
        </label>
        <label className="block">
          <span className="label">Etapa del pipeline</span>
          <select
            value={form.stage}
            onChange={(e) => set("stage", e.target.value as ContactStage)}
            className="field"
          >
            {CONTACT_STAGES.map((s) => (
              <option key={s} value={s}>
                {CONTACT_STAGE_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Interés</span>
          <select
            value={form.interest}
            onChange={(e) =>
              set("interest", e.target.value as ContactInterest)
            }
            className="field"
          >
            {(
              Object.keys(CONTACT_INTEREST_LABELS) as ContactInterest[]
            ).map((i) => (
              <option key={i} value={i}>
                {CONTACT_INTEREST_LABELS[i]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Presupuesto mínimo (MXN)</span>
          <input
            type="number"
            inputMode="numeric"
            value={form.budget_min}
            onChange={(e) => set("budget_min", e.target.value)}
            className="field"
          />
        </label>
        <label className="block">
          <span className="label">Presupuesto máximo (MXN)</span>
          <input
            type="number"
            inputMode="numeric"
            value={form.budget_max}
            onChange={(e) => set("budget_max", e.target.value)}
            className="field"
          />
        </label>
      </div>

      <label className="block">
        <span className="label">Propiedad de interés</span>
        <select
          value={form.property_id}
          onChange={(e) => set("property_id", e.target.value)}
          className="field"
        >
          <option value="">Sin propiedad asociada</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="label">Notas</span>
        <textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={4}
          className="field resize-none"
          placeholder="Contexto del prospecto, seguimiento, acuerdos…"
        />
      </label>

      {error && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="btn-primary py-3">
          <Save className="h-4 w-4" />
          {pending ? "Guardando…" : "Guardar contacto"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-ghost py-3"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
