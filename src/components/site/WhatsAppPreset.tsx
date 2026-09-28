"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { whatsappLink } from "@/lib/constants";
import { TrackedLink } from "./TrackedLink";

export type WhatsAppPreset = {
  message: string;
  propertyId: string;
  propertyTitle: string;
};

const WhatsAppPresetContext = createContext<{
  preset: WhatsAppPreset | null;
  setPreset: (preset: WhatsAppPreset | null) => void;
} | null>(null);

export function WhatsAppPresetProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [preset, setPreset] = useState<WhatsAppPreset | null>(null);
  const value = useMemo(() => ({ preset, setPreset }), [preset]);
  return (
    <WhatsAppPresetContext.Provider value={value}>
      {children}
    </WhatsAppPresetContext.Provider>
  );
}

export function useWhatsAppPreset() {
  return useContext(WhatsAppPresetContext)?.preset ?? null;
}

/** Publica el mensaje de la ficha para el botón flotante y el resto de CTAs. */
export function PropertyWhatsAppPreset(preset: WhatsAppPreset) {
  const setPreset = useContext(WhatsAppPresetContext)?.setPreset;
  const { message, propertyId, propertyTitle } = preset;

  useEffect(() => {
    if (!setPreset) return;
    setPreset({ message, propertyId, propertyTitle });
    return () => setPreset(null);
  }, [message, propertyId, propertyTitle, setPreset]);

  return null;
}

/** Enlace de WhatsApp. En una ficha usa el mensaje de esa propiedad. */
export function WhatsAppCta({
  fallbackMessage,
  ubicacion,
  className,
  children,
  ariaLabel,
}: {
  fallbackMessage?: string;
  ubicacion: string;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  const preset = useWhatsAppPreset();
  return (
    <TrackedLink
      href={whatsappLink(preset?.message ?? fallbackMessage)}
      event="contacto_whatsapp"
      params={{
        ubicacion,
        ...(preset
          ? {
              property_id: preset.propertyId,
              property_title: preset.propertyTitle,
            }
          : {}),
      }}
      target="_blank"
      rel="noopener noreferrer"
      ariaLabel={ariaLabel}
      className={className}
    >
      {children}
    </TrackedLink>
  );
}
