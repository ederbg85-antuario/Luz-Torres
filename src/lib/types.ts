// ─── Tipos de dominio ───────────────────────────────────────────

export type Operation = "venta" | "renta";
export type PropertyType =
  | "casa"
  | "departamento"
  | "oficina"
  | "bodega"
  | "terreno"
  | "local";
export type PropertyStatus = "disponible" | "apartado" | "vendido" | "rentado";

export type ContactSource =
  | "web"
  | "instagram"
  | "facebook"
  | "referido"
  | "portal"
  | "llamada"
  | "whatsapp"
  | "otro";
export type ContactStage =
  | "nuevo"
  | "contactado"
  | "calificado"
  | "propuesta"
  | "negociacion"
  | "cerrado"
  | "perdido";
export type ContactInterest = "compra" | "renta" | "venta" | "inversion";

export type FinancingMethod =
  | "recursos_propios"
  | "credito_bancario"
  | "infonavit"
  | "fovissste"
  | "cofinanciamiento"
  | "por_definir"
  | "no_aplica";

export type AppointmentType =
  | "visita"
  | "firma"
  | "llamada"
  | "reunion"
  | "avaluo";
export type AppointmentStatus = "programada" | "completada" | "cancelada";

export type TaskStatus =
  | "pendiente"
  | "en_progreso"
  | "en_revision"
  | "completada";
export type TaskPriority = "baja" | "media" | "alta";

export type MarketingProvider =
  | "instagram"
  | "facebook"
  | "meta_ads"
  | "google_analytics"
  | "search_console"
  | "google_ads";

export interface Property {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  operation: Operation;
  property_type: PropertyType;
  status: PropertyStatus;
  price: number;
  currency: string;
  estado: string;
  municipio: string;
  colonia: string | null;
  direccion: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parking: number | null;
  area_m2: number | null;
  lot_m2: number | null;
  amenities: string[] | null;
  cover_image: string | null;
  images: string[] | null;
  featured: boolean;
  lat: number | null;
  lng: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  source: ContactSource;
  stage: ContactStage;
  interest: ContactInterest | null;
  budget_min: number | null;
  budget_max: number | null;
  notes: string | null;
  message: string | null;
  financing: FinancingMethod | null;
  property_id: string | null;
  assigned_to: string | null;
  last_contacted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  title: string;
  type: AppointmentType;
  contact_id: string | null;
  property_id: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  notes: string | null;
  status: AppointmentStatus;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  contact_id: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface MarketingIntegration {
  id: string;
  provider: MarketingProvider;
  status: "conectado" | "desconectado";
  account_label: string | null;
  last_synced_at: string | null;
  config: Record<string, unknown>;
}

export interface MarketingMetric {
  id: string;
  provider: MarketingProvider;
  metric: string;
  value: number;
  recorded_date: string;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  role: "admin" | "agente";
  avatar_url: string | null;
  created_at: string;
}

// ─── Agenda de visitas públicas ─────────────────────────────────

/** Horario semanal de disponibilidad. weekday: 1=lunes … 7=domingo. */
export interface AvailabilityRule {
  weekday: number;
  enabled: boolean;
  start_time: string; // "10:00:00"
  end_time: string;
}

/** Bloqueo puntual: día completo (start_time null) o rango de horas. */
export interface BlockedSlot {
  id: string;
  date: string; // "2026-07-20"
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
  created_at: string;
}

/** Rango ocupado devuelto por get_taken_slots (sin datos personales). */
export interface TakenSlot {
  starts_at: string;
  ends_at: string;
}

export interface PropertyFilters {
  operation?: Operation;
  property_type?: PropertyType;
  estado?: string;
  municipio?: string;
  q?: string;
  priceMin?: number;
  priceMax?: number;
  bedrooms?: number;
  bathrooms?: number;
  sort?: "recientes" | "precio_asc" | "precio_desc";
}
