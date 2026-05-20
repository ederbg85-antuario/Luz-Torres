import type { Operation } from "./types";

/** Une clases de Tailwind condicionalmente. */
export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const pesos = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

/** $5,250,000 MXN — agrega "/mes" en operaciones de renta. */
export function formatPrice(value: number, operation?: Operation) {
  const base = `${pesos.format(value || 0)} MXN`;
  return operation === "renta" ? `${base}/mes` : base;
}

/** Versión compacta: $5.25M · $28K */
export function formatPriceShort(value: number) {
  if (!value) return "$0";
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 2)}M`;
  }
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${value}`;
}

const decimal = new Intl.NumberFormat("es-MX");

export function formatNumber(value: number) {
  return decimal.format(value || 0);
}

/** 78 m² */
export function formatArea(value: number | null) {
  if (!value) return "—";
  return `${decimal.format(value)} m²`;
}

export function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateLong(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  return `${formatDate(iso)} · ${formatTime(iso)}`;
}

/** "hace 2 días", "en 3 días" */
export function formatRelative(iso: string | null) {
  if (!iso) return "—";
  const diffMs = new Date(iso).getTime() - Date.now();
  const rtf = new Intl.RelativeTimeFormat("es-MX", { numeric: "auto" });
  const minutes = Math.round(diffMs / 60000);
  const hours = Math.round(diffMs / 3_600_000);
  const days = Math.round(diffMs / 86_400_000);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  if (Math.abs(days) < 30) return rtf.format(days, "day");
  return formatDate(iso);
}

/** Convierte un texto en un slug seguro para URLs. */
export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
