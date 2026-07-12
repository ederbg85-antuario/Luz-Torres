"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { SITE, whatsappLink } from "@/lib/constants";
import { cn } from "@/lib/format";
import { WhatsAppIcon } from "./WhatsAppFab";

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/propiedades", label: "Propiedades" },
  { href: "/sobre-luz", label: "Sobre Luz" },
  { href: "/contacto", label: "Contacto" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-lino/70 bg-hueso/85 backdrop-blur-md">
      <div className="lt-container flex h-[72px] items-center justify-between">
        <Link href="/" className="text-petroleo" aria-label="Luz Torres · Inicio">
          <Logo className="h-7" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                isActive(item.href)
                  ? "bg-papel text-petroleo shadow-soft"
                  : "text-humo hover:bg-papel/60 hover:text-carbon"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={whatsappLink("Hola Luz, vi tu sitio y me gustaría más información.")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp hidden px-4 py-2.5 sm:inline-flex"
          >
            <WhatsAppIcon className="h-4 w-4" />
            WhatsApp
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full bg-papel text-carbon shadow-soft md:hidden"
            aria-label="Menú"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-lino bg-hueso md:hidden">
          <nav className="lt-container flex flex-col gap-1 py-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-4 py-3 text-sm font-medium",
                  isActive(item.href)
                    ? "bg-papel text-petroleo"
                    : "text-humo"
                )}
              >
                {item.label}
              </Link>
            ))}
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp mt-2"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Escribir por WhatsApp · {SITE.phoneDisplay}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
