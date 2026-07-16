"use client";

import { pushEvent } from "@/lib/gtm";

/**
 * Enlace normal que además dispara un evento al dataLayer al hacer
 * clic (WhatsApp, correo, Instagram, etc.). No bloquea la navegación.
 */
export function TrackedLink({
  href,
  event,
  params,
  className,
  target,
  rel,
  ariaLabel,
  children,
}: {
  href: string;
  event: string;
  params?: Record<string, unknown>;
  className?: string;
  target?: string;
  rel?: string;
  ariaLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      aria-label={ariaLabel}
      className={className}
      onClick={() => pushEvent(event, params)}
    >
      {children}
    </a>
  );
}
