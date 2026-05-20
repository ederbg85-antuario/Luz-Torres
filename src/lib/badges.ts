import type {
  AppointmentStatus,
  ContactStage,
  PropertyStatus,
  TaskPriority,
} from "./types";

type Tone =
  | "neutral"
  | "green"
  | "vivo"
  | "almond"
  | "amber"
  | "rose"
  | "ink";

export const stageTone: Record<ContactStage, Tone> = {
  nuevo: "vivo",
  contactado: "green",
  calificado: "green",
  propuesta: "almond",
  negociacion: "amber",
  cerrado: "ink",
  perdido: "rose",
};

export const priorityTone: Record<TaskPriority, Tone> = {
  baja: "neutral",
  media: "amber",
  alta: "rose",
};

export const propertyStatusTone: Record<PropertyStatus, Tone> = {
  disponible: "green",
  apartado: "amber",
  vendido: "ink",
  rentado: "ink",
};

export const appointmentStatusTone: Record<AppointmentStatus, Tone> = {
  programada: "vivo",
  completada: "green",
  cancelada: "rose",
};
