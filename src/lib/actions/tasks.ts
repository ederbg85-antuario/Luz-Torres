"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TaskPriority, TaskStatus } from "@/lib/types";

export type TaskInput = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  contact_id: string | null;
};

export type TaskResult = { ok: boolean; error?: string; id?: string };

export async function createTask(input: TaskInput): Promise<TaskResult> {
  if (!input.title.trim()) return { ok: false, error: "Falta el título." };
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: input.title.trim(),
        description: input.description.trim() || null,
        status: input.status,
        priority: input.priority,
        due_date: input.due_date || null,
        contact_id: input.contact_id || null,
        position: 0,
      })
      .select("id")
      .single();
    if (error) throw error;
    revalidatePath("/admin/tareas");
    revalidatePath("/admin");
    return { ok: true, id: data.id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo guardar.",
    };
  }
}

export async function updateTask(
  id: string,
  input: TaskInput
): Promise<TaskResult> {
  if (!input.title.trim()) return { ok: false, error: "Falta el título." };
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("tasks")
      .update({
        title: input.title.trim(),
        description: input.description.trim() || null,
        status: input.status,
        priority: input.priority,
        due_date: input.due_date || null,
        contact_id: input.contact_id || null,
      })
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/tareas");
    return { ok: true, id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo actualizar.",
    };
  }
}

/** Mueve una tarjeta de columna (usado por el tablero). */
export async function moveTask(
  id: string,
  status: TaskStatus
): Promise<TaskResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("tasks")
      .update({ status })
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/tareas");
    revalidatePath("/admin");
    return { ok: true, id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo mover.",
    };
  }
}

export async function deleteTask(id: string): Promise<TaskResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/tareas");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo eliminar.",
    };
  }
}
