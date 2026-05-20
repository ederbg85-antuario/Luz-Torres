"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Building2,
  Users,
  CalendarDays,
  KanbanSquare,
  BarChart3,
  UserPlus,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/format";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/propiedades", label: "Propiedades", icon: Building2 },
  { href: "/admin/crm", label: "CRM · Contactos", icon: Users },
  { href: "/admin/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/admin/tareas", label: "Tareas", icon: KanbanSquare },
  { href: "/admin/marketing", label: "Marketing", icon: BarChart3 },
  { href: "/admin/equipo", label: "Equipo", icon: UserPlus },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = isActive(item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-vivo text-papel"
                : "text-bruma hover:bg-white/5 hover:text-hueso"
            )}
          >
            <item.icon className="h-[18px] w-[18px]" strokeWidth={2} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBody({
  user,
  onNavigate,
}: {
  user: { name: string; email: string; role: string };
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-sombra p-4">
      <Link
        href="/admin"
        onClick={onNavigate}
        className="px-2 py-3 text-hueso"
      >
        <Logo className="h-6" />
        <span className="mt-1 block text-[10px] font-semibold uppercase tracking-eyebrow text-bruma">
          Panel de gestión
        </span>
      </Link>

      <div className="mt-4 flex-1">
        <NavLinks onNavigate={onNavigate} />
      </div>

      <div className="space-y-2 border-t border-white/10 pt-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-bruma transition-colors hover:text-hueso"
        >
          <ExternalLink className="h-[18px] w-[18px]" />
          Ver sitio público
        </Link>
        <div className="rounded-md bg-white/5 p-3">
          <p className="truncate text-sm font-semibold text-hueso">
            {user.name}
          </p>
          <p className="truncate text-[12px] text-bruma">{user.email}</p>
          <form action={signOut} className="mt-2.5">
            <button className="flex w-full items-center justify-center gap-2 rounded-md bg-white/10 py-2 text-[13px] font-medium text-hueso transition-colors hover:bg-white/15">
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function AdminSidebar({
  user,
}: {
  user: { name: string; email: string; role: string };
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">
        <SidebarBody user={user} />
      </aside>

      {/* Mobile topbar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-lino bg-sombra px-4 py-3 lg:hidden">
        <Link href="/admin" className="text-hueso">
          <Logo className="h-5" />
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid h-9 w-9 place-items-center rounded-md bg-white/10 text-hueso"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-carbon/50"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute -right-11 top-3 grid h-9 w-9 place-items-center rounded-md bg-papel text-carbon"
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarBody user={user} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
