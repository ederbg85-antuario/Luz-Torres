import "server-only";
import { createSupabaseServerClient } from "./supabase/server";
import type {
  Appointment,
  Contact,
  ContactStage,
  MarketingIntegration,
  MarketingMetric,
  Profile,
  Property,
  Task,
} from "./types";

export type ContactRow = Contact & {
  property: { title: string; slug: string } | null;
};

export type AppointmentRow = Appointment & {
  contact: { full_name: string } | null;
  property: { title: string } | null;
};

// ─── Propiedades ────────────────────────────────────────────────
export async function getAdminProperties(): Promise<Property[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });
    return (data as Property[]) ?? [];
  } catch {
    return [];
  }
}

export async function getAdminProperty(id: string): Promise<Property | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("properties")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return (data as Property) ?? null;
  } catch {
    return null;
  }
}

// ─── Contactos / CRM ────────────────────────────────────────────
export async function getContacts(): Promise<ContactRow[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("contacts")
      .select("*, property:properties(title, slug)")
      .order("created_at", { ascending: false });
    return (data as ContactRow[]) ?? [];
  } catch {
    return [];
  }
}

export async function getContact(id: string): Promise<ContactRow | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("contacts")
      .select("*, property:properties(title, slug)")
      .eq("id", id)
      .maybeSingle();
    return (data as ContactRow) ?? null;
  } catch {
    return null;
  }
}

// ─── Citas / Agenda ─────────────────────────────────────────────
export async function getAppointments(): Promise<AppointmentRow[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("appointments")
      .select("*, contact:contacts(full_name), property:properties(title)")
      .order("starts_at", { ascending: true });
    return (data as AppointmentRow[]) ?? [];
  } catch {
    return [];
  }
}

// ─── Tareas ─────────────────────────────────────────────────────
export async function getTasks(): Promise<Task[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });
    return (data as Task[]) ?? [];
  } catch {
    return [];
  }
}

// ─── Marketing ──────────────────────────────────────────────────
export async function getMarketing(): Promise<{
  integrations: MarketingIntegration[];
  metrics: MarketingMetric[];
}> {
  try {
    const supabase = await createSupabaseServerClient();
    const [integrations, metrics] = await Promise.all([
      supabase.from("marketing_integrations").select("*"),
      supabase
        .from("marketing_metrics")
        .select("*")
        .order("recorded_date", { ascending: false }),
    ]);
    return {
      integrations: (integrations.data as MarketingIntegration[]) ?? [],
      metrics: (metrics.data as MarketingMetric[]) ?? [],
    };
  } catch {
    return { integrations: [], metrics: [] };
  }
}

// ─── Equipo ─────────────────────────────────────────────────────
export async function getProfiles(): Promise<Profile[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true });
    return (data as Profile[]) ?? [];
  } catch {
    return [];
  }
}

/** Lista ligera de propiedades para selectores de formularios. */
export async function getPropertyOptions(): Promise<
  { id: string; title: string }[]
> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("properties")
      .select("id, title")
      .order("created_at", { ascending: false });
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getContactOptions(): Promise<
  { id: string; full_name: string }[]
> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("contacts")
      .select("id, full_name")
      .order("full_name", { ascending: true });
    return data ?? [];
  } catch {
    return [];
  }
}

// ─── Dashboard ──────────────────────────────────────────────────
export async function getDashboardData() {
  const empty = {
    properties: { total: 0, available: 0, featured: 0 },
    contacts: { total: 0, recent: 0, byStage: {} as Record<string, number> },
    tasks: { pending: 0 },
    upcoming: [] as AppointmentRow[],
    recentContacts: [] as ContactRow[],
  };
  try {
    const supabase = await createSupabaseServerClient();
    const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
    const nowIso = new Date().toISOString();

    const [props, contacts, tasks, upcoming, recentContacts] =
      await Promise.all([
        supabase.from("properties").select("status, featured"),
        supabase.from("contacts").select("stage, created_at"),
        supabase.from("tasks").select("status"),
        supabase
          .from("appointments")
          .select("*, contact:contacts(full_name), property:properties(title)")
          .gte("starts_at", nowIso)
          .eq("status", "programada")
          .order("starts_at", { ascending: true })
          .limit(5),
        supabase
          .from("contacts")
          .select("*, property:properties(title, slug)")
          .order("created_at", { ascending: false })
          .limit(6),
      ]);

    const propRows = (props.data as Property[]) ?? [];
    const contactRows = (contacts.data as Contact[]) ?? [];
    const taskRows = (tasks.data as Task[]) ?? [];

    const byStage: Record<string, number> = {};
    for (const c of contactRows) {
      byStage[c.stage] = (byStage[c.stage] ?? 0) + 1;
    }

    return {
      properties: {
        total: propRows.length,
        available: propRows.filter((p) => p.status === "disponible").length,
        featured: propRows.filter((p) => p.featured).length,
      },
      contacts: {
        total: contactRows.length,
        recent: contactRows.filter(
          (c) => c.created_at && c.created_at >= weekAgo
        ).length,
        byStage,
      },
      tasks: {
        pending: taskRows.filter((t) => t.status !== "completada").length,
      },
      upcoming: (upcoming.data as AppointmentRow[]) ?? [],
      recentContacts: (recentContacts.data as ContactRow[]) ?? [],
    };
  } catch {
    return empty;
  }
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
export type ContactStageCounts = Record<ContactStage, number>;
