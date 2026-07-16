import type {
  AppointmentStatus,
  AppointmentType,
  ContactInterest,
  ContactSource,
  ContactStage,
  FinancingMethod,
  MarketingProvider,
  Operation,
  PropertyStatus,
  PropertyType,
  TaskPriority,
  TaskStatus,
} from "./types";

// ─── Marca ──────────────────────────────────────────────────────
export const SITE = {
  name: "Luz Torres",
  role: "Asesora Inmobiliaria",
  tagline: "Para quien se toma su patrimonio en serio.",
  phoneDisplay: "56 5669 9894",
  whatsapp: "525656699894",
  email: "hola@luztorres.com",
  instagram: "luztorres.inmuebles",
  instagramUrl: "https://instagram.com/luztorres.inmuebles",
  partner: "Imagen Inmobiliaria y Construcción",
} as const;

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${SITE.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/**
 * Google Tag Manager. Al crear el contenedor en tagmanager.google.com,
 * pega aquí el ID (formato "GTM-XXXXXXX") y vuelve a desplegar: el
 * script se inyecta solo. Desde GTM se conectan Analytics 4, Ads, etc.
 */
export const GTM_ID = "";

// ─── Operación ──────────────────────────────────────────────────
export const OPERATION_LABELS: Record<Operation, string> = {
  venta: "Venta",
  renta: "Renta",
};

// ─── Tipos de propiedad ─────────────────────────────────────────
export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  casa: "Casa",
  departamento: "Departamento",
  oficina: "Oficina",
  bodega: "Bodega",
  terreno: "Terreno",
  local: "Local comercial",
};

export const PROPERTY_TYPE_PLURAL: Record<PropertyType, string> = {
  casa: "Casas",
  departamento: "Departamentos",
  oficina: "Oficinas",
  bodega: "Bodegas",
  terreno: "Terrenos",
  local: "Locales comerciales",
};

export const PROPERTY_TYPES = Object.keys(
  PROPERTY_TYPE_LABELS
) as PropertyType[];

// ─── Estatus de propiedad ───────────────────────────────────────
export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  disponible: "Disponible",
  apartado: "Apartado",
  vendido: "Vendido",
  rentado: "Rentado",
};

export function statusBadge(operation: Operation, status: PropertyStatus) {
  if (status === "vendido") return "Vendido";
  if (status === "rentado") return "Rentado";
  if (status === "apartado") return "Apartado";
  return operation === "venta" ? "En venta" : "En renta";
}

// ─── CRM · etapas del pipeline ──────────────────────────────────
export const CONTACT_STAGES: ContactStage[] = [
  "nuevo",
  "contactado",
  "calificado",
  "propuesta",
  "negociacion",
  "cerrado",
  "perdido",
];

export const CONTACT_STAGE_LABELS: Record<ContactStage, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  calificado: "Calificado",
  propuesta: "Propuesta",
  negociacion: "Negociación",
  cerrado: "Cerrado",
  perdido: "Perdido",
};

export const CONTACT_SOURCE_LABELS: Record<ContactSource, string> = {
  web: "Sitio web",
  instagram: "Instagram",
  facebook: "Facebook",
  referido: "Referido",
  portal: "Portal inmobiliario",
  llamada: "Llamada",
  whatsapp: "WhatsApp",
  otro: "Otro",
};

export const CONTACT_INTEREST_LABELS: Record<ContactInterest, string> = {
  compra: "Compra",
  renta: "Renta",
  venta: "Venta",
  inversion: "Inversión",
};

// ─── Financiamiento (formulario de visitas) ─────────────────────
export const FINANCING_LABELS: Record<FinancingMethod, string> = {
  recursos_propios: "Recursos propios",
  credito_bancario: "Crédito bancario",
  infonavit: "Crédito Infonavit",
  fovissste: "Crédito Fovissste",
  cofinanciamiento: "Cofinanciamiento (banco + Infonavit/Fovissste)",
  por_definir: "Aún no lo defino",
  no_aplica: "No aplica (renta)",
};

/** Opciones que se muestran al agendar una visita de compra. */
export const FINANCING_OPTIONS: FinancingMethod[] = [
  "recursos_propios",
  "credito_bancario",
  "infonavit",
  "fovissste",
  "cofinanciamiento",
  "por_definir",
];

/** Días de la semana (isodow: 1=lunes … 7=domingo). */
export const WEEKDAY_LABELS: Record<number, string> = {
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
  7: "Domingo",
};

/** Duración de cada visita en minutos. */
export const VISIT_SLOT_MINUTES = 60;

// ─── Agenda ─────────────────────────────────────────────────────
export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  visita: "Visita",
  firma: "Firma",
  llamada: "Llamada",
  reunion: "Reunión",
  avaluo: "Avalúo",
};

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  programada: "Programada",
  completada: "Completada",
  cancelada: "Cancelada",
};

// ─── Tareas · tablero ───────────────────────────────────────────
export const TASK_COLUMNS: TaskStatus[] = [
  "pendiente",
  "en_progreso",
  "en_revision",
  "completada",
];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pendiente: "Por hacer",
  en_progreso: "En progreso",
  en_revision: "En revisión",
  completada: "Completada",
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
};

// ─── Marketing ──────────────────────────────────────────────────
export const MARKETING_PROVIDER_LABELS: Record<MarketingProvider, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  meta_ads: "Meta Ads",
  google_analytics: "Google Analytics",
  search_console: "Search Console",
  google_ads: "Google Ads",
};

export const MARKETING_PROVIDER_DESC: Record<MarketingProvider, string> = {
  instagram: "Seguidores, alcance e interacciones del perfil.",
  facebook: "Seguidores y alcance de la página.",
  meta_ads: "Inversión, clics y leads de campañas en Meta.",
  google_analytics: "Tráfico y comportamiento del sitio web.",
  search_console: "Clics, impresiones y posición en Google.",
  google_ads: "Inversión, clics y conversiones de campañas.",
};

// ─── Estados de México ──────────────────────────────────────────
export const MEXICAN_STATES: string[] = [
  "Aguascalientes",
  "Baja California",
  "Baja California Sur",
  "Campeche",
  "Chiapas",
  "Chihuahua",
  "Ciudad de México",
  "Coahuila",
  "Colima",
  "Durango",
  "Estado de México",
  "Guanajuato",
  "Guerrero",
  "Hidalgo",
  "Jalisco",
  "Michoacán",
  "Morelos",
  "Nayarit",
  "Nuevo León",
  "Oaxaca",
  "Puebla",
  "Querétaro",
  "Quintana Roo",
  "San Luis Potosí",
  "Sinaloa",
  "Sonora",
  "Tabasco",
  "Tamaulipas",
  "Tlaxcala",
  "Veracruz",
  "Yucatán",
  "Zacatecas",
];

/** Estados con presencia activa de propiedades — sección de cobertura. */
export const COVERAGE_STATES: { estado: string; zona: string }[] = [
  { estado: "Ciudad de México", zona: "Del Valle · Roma · Polanco" },
  { estado: "Estado de México", zona: "Interlomas · Lomas Verdes · Valle de Bravo" },
  { estado: "Jalisco", zona: "Guadalajara · Zapopan" },
  { estado: "Nuevo León", zona: "San Pedro Garza García" },
  { estado: "Querétaro", zona: "Juriquilla" },
  { estado: "Quintana Roo", zona: "Playa del Carmen" },
  { estado: "Yucatán", zona: "Mérida" },
  { estado: "Puebla", zona: "Puebla capital" },
];

// ─── Sugerencias de amenidades (formulario admin) ───────────────
export const AMENITY_SUGGESTIONS: string[] = [
  "Cocina integral",
  "Seguridad 24h",
  "Elevador",
  "Estacionamiento de visitas",
  "Jardín",
  "Terraza",
  "Roof garden",
  "Alberca",
  "Gimnasio",
  "Casa club",
  "Área de lavado",
  "Cuarto de servicio",
  "Aire acondicionado",
  "Calentador solar",
  "Pet friendly",
  "Amueblado",
];
