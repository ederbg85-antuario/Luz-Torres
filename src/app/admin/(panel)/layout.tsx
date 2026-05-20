import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/public";

export const metadata: Metadata = {
  title: "Panel · Luz Torres",
  robots: { index: false, follow: false },
};

// El panel siempre se renderiza por petición: verifica la sesión cada vez.
export const dynamic = "force-dynamic";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) redirect("/admin/login");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const sidebarUser = {
    name: profile?.full_name ?? "Equipo Luz Torres",
    email: user.email ?? "",
    role: profile?.role ?? "agente",
  };

  return (
    <div className="min-h-screen bg-hueso">
      <AdminSidebar user={sidebarUser} />
      <div className="lg:pl-64">
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
