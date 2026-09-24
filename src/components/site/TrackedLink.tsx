"use client";

import { pushEvent } from "@/lib/gtm";
import { trackMetaEvent } from "@/lib/meta";

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
      onClick={() => {
        pushEvent(event, params);
        if (event === "contacto_whatsapp") {
          const eventId = crypto.randomUUID();
          const propertyId = typeof params?.property_id === "string" ? params.property_id : undefined;
          const placement = typeof params?.ubicacion === "string" ? params.ubicacion : undefined;
          trackMetaEvent("Contact", {
            content_name: "WhatsApp",
            content_category: "whatsapp_click",
            ...(propertyId ? { content_ids: [propertyId], content_type: "product" } : {}),
            ...(placement ? { placement } : {}),
          }, eventId);
          // El envío sobrevive al cambio de pestaña; no se envía el mensaje ni el número del enlace.
          void fetch("/api/meta/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ eventId, propertyId, placement, sourceUrl: window.location.href }),
            keepalive: true,
          }).catch(() => {});
        } else if (event.startsWith("contacto_")) {
          trackMetaEvent("Contact", {
            content_name: event.replace("contacto_", ""),
            ...params,
          });
        }
      }}
    >
      {children}
    </a>
  );
}
