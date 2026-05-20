import { getTasks, getContactOptions } from "@/lib/admin-data";
import { PageHeader } from "@/components/admin/PageHeader";
import { KanbanBoard } from "@/components/admin/KanbanBoard";

export default async function TareasPage() {
  const [tasks, contacts] = await Promise.all([
    getTasks(),
    getContactOptions(),
  ]);

  return (
    <>
      <PageHeader
        title="Tareas"
        description="Organiza tus actividades. Arrastra las tarjetas entre columnas."
      />
      <KanbanBoard initialTasks={tasks} contacts={contacts} />
    </>
  );
}
