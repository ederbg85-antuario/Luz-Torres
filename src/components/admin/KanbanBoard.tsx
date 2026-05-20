"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus, X, Trash2, CalendarDays, User, Flag } from "lucide-react";
import {
  createTask,
  updateTask,
  moveTask,
  deleteTask,
  type TaskInput,
} from "@/lib/actions/tasks";
import {
  TASK_COLUMNS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
} from "@/lib/constants";
import { priorityTone } from "@/lib/badges";
import { Badge } from "@/components/ui/Badge";
import type { Task, TaskPriority, TaskStatus } from "@/lib/types";
import { cn, formatDate } from "@/lib/format";

type DialogState =
  | { mode: "new"; status: TaskStatus }
  | { mode: "edit"; task: Task }
  | null;

export function KanbanBoard({
  initialTasks,
  contacts,
}: {
  initialTasks: Task[];
  contacts: { id: string; full_name: string }[];
}) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<TaskStatus | null>(null);
  const [dialog, setDialog] = useState<DialogState>(null);

  function drop(status: TaskStatus) {
    setOverCol(null);
    const id = dragId;
    setDragId(null);
    if (!id) return;
    const task = tasks.find((t) => t.id === id);
    if (!task || task.status === status) return;
    const prev = tasks;
    setTasks((list) =>
      list.map((t) => (t.id === id ? { ...t, status } : t))
    );
    moveTask(id, status).then((res) => {
      if (!res.ok) setTasks(prev);
      router.refresh();
    });
  }

  const contactName = (cid: string | null) =>
    cid ? contacts.find((c) => c.id === cid)?.full_name : null;

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-4">
        {TASK_COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col);
          return (
            <div
              key={col}
              onDragOver={(e) => {
                e.preventDefault();
                setOverCol(col);
              }}
              onDragLeave={() => setOverCol((c) => (c === col ? null : c))}
              onDrop={() => drop(col)}
              className={cn(
                "rounded-xl bg-papel/70 p-3 transition-colors",
                overCol === col && "bg-vivo/8 ring-2 ring-vivo/30"
              )}
            >
              <div className="flex items-center justify-between px-1 pb-2">
                <h3 className="text-sm font-semibold text-carbon">
                  {TASK_STATUS_LABELS[col]}
                  <span className="ml-1.5 text-humo">{colTasks.length}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setDialog({ mode: "new", status: col })}
                  className="grid h-7 w-7 place-items-center rounded-md text-humo hover:bg-nieve hover:text-vivo"
                  aria-label="Nueva tarea"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2.5">
                {colTasks.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    draggable
                    onDragStart={() => setDragId(t.id)}
                    onDragEnd={() => setDragId(null)}
                    onClick={() => setDialog({ mode: "edit", task: t })}
                    className={cn(
                      "block w-full cursor-grab rounded-md bg-papel p-3 text-left shadow-soft transition-shadow hover:shadow-card active:cursor-grabbing",
                      dragId === t.id && "opacity-50"
                    )}
                  >
                    <p className="text-sm font-medium text-carbon">
                      {t.title}
                    </p>
                    {t.description && (
                      <p className="mt-1 line-clamp-2 text-[12px] text-humo">
                        {t.description}
                      </p>
                    )}
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      <Badge tone={priorityTone[t.priority]}>
                        <Flag className="h-3 w-3" />
                        {TASK_PRIORITY_LABELS[t.priority]}
                      </Badge>
                      {t.due_date && (
                        <span className="flex items-center gap-1 text-[11px] text-humo">
                          <CalendarDays className="h-3 w-3" />
                          {formatDate(t.due_date)}
                        </span>
                      )}
                      {contactName(t.contact_id) && (
                        <span className="flex items-center gap-1 text-[11px] text-humo">
                          <User className="h-3 w-3" />
                          {contactName(t.contact_id)}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
                {colTasks.length === 0 && (
                  <p className="rounded-md border border-dashed border-lino px-3 py-6 text-center text-[12px] text-bruma">
                    Arrastra tarjetas aquí
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {dialog && (
        <TaskDialog
          state={dialog}
          contacts={contacts}
          onClose={() => setDialog(null)}
          onChange={(updated, removedId) => {
            setTasks((list) => {
              if (removedId) return list.filter((t) => t.id !== removedId);
              if (!updated) return list;
              const exists = list.some((t) => t.id === updated.id);
              return exists
                ? list.map((t) => (t.id === updated.id ? updated : t))
                : [...list, updated];
            });
            setDialog(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

function TaskDialog({
  state,
  contacts,
  onClose,
  onChange,
}: {
  state: NonNullable<DialogState>;
  contacts: { id: string; full_name: string }[];
  onClose: () => void;
  onChange: (task: Task | null, removedId?: string) => void;
}) {
  const editing = state.mode === "edit" ? state.task : null;
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: editing?.title ?? "",
    description: editing?.description ?? "",
    status: (editing
      ? editing.status
      : state.mode === "new"
        ? state.status
        : "pendiente") as TaskStatus,
    priority: (editing?.priority ?? "media") as TaskPriority,
    due_date: editing?.due_date ?? "",
    contact_id: editing?.contact_id ?? "",
  });

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const input: TaskInput = {
      title: form.title,
      description: form.description,
      status: form.status as TaskStatus,
      priority: form.priority,
      due_date: form.due_date || null,
      contact_id: form.contact_id || null,
    };
    start(async () => {
      const res = editing
        ? await updateTask(editing.id, input)
        : await createTask(input);
      if (res.ok) {
        const task: Task = {
          id: res.id ?? editing?.id ?? crypto.randomUUID(),
          title: input.title,
          description: input.description || null,
          status: input.status,
          priority: input.priority,
          due_date: input.due_date,
          contact_id: input.contact_id,
          position: editing?.position ?? 0,
          created_at: editing?.created_at ?? new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        onChange(task);
      } else {
        setError(res.error ?? "No se pudo guardar.");
      }
    });
  }

  function remove() {
    if (!editing) return;
    start(async () => {
      const res = await deleteTask(editing.id);
      if (res.ok) onChange(null, editing.id);
      else setError(res.error ?? "No se pudo eliminar.");
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-carbon/50 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-xl bg-papel shadow-floating">
        <div className="flex items-center justify-between border-b border-lino px-5 py-4">
          <h3 className="font-semibold text-carbon">
            {editing ? "Editar tarea" : "Nueva tarea"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md text-humo hover:bg-nieve"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={save} className="space-y-3.5 p-5">
          <label className="block">
            <span className="label">Título</span>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
              className="field"
              placeholder="¿Qué hay que hacer?"
            />
          </label>
          <label className="block">
            <span className="label">Descripción</span>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className="field resize-none"
            />
          </label>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <label className="block">
              <span className="label">Columna</span>
              <select
                value={form.status}
                onChange={(e) =>
                  set("status", e.target.value as TaskStatus)
                }
                className="field"
              >
                {TASK_COLUMNS.map((c) => (
                  <option key={c} value={c}>
                    {TASK_STATUS_LABELS[c]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="label">Prioridad</span>
              <select
                value={form.priority}
                onChange={(e) =>
                  set("priority", e.target.value as TaskPriority)
                }
                className="field"
              >
                {(
                  Object.keys(TASK_PRIORITY_LABELS) as TaskPriority[]
                ).map((p) => (
                  <option key={p} value={p}>
                    {TASK_PRIORITY_LABELS[p]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="label">Fecha límite</span>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => set("due_date", e.target.value)}
                className="field"
              />
            </label>
            <label className="block">
              <span className="label">Contacto</span>
              <select
                value={form.contact_id}
                onChange={(e) => set("contact_id", e.target.value)}
                className="field"
              >
                <option value="">Ninguno</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error && (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={pending}
              className="btn-primary py-2.5"
            >
              {pending ? "Guardando…" : "Guardar tarea"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={remove}
                disabled={pending}
                className="grid h-10 w-10 place-items-center rounded-full text-rose-600 hover:bg-rose-50"
                aria-label="Eliminar tarea"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
