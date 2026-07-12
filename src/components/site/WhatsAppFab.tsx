import { whatsappLink } from "@/lib/constants";

/** Glifo oficial de WhatsApp (trazado del logo, licencia de marca de uso justo). */
export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M16.004 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.59 4.46 1.71 6.4L3.2 28.8l6.58-1.67a12.74 12.74 0 0 0 6.22 1.61h.01c7.06 0 12.79-5.74 12.79-12.8 0-3.42-1.33-6.63-3.75-9.05a12.72 12.72 0 0 0-9.05-3.69zm0 23.39h-.01c-1.91 0-3.79-.51-5.43-1.49l-.39-.23-4.04 1.03 1.08-3.94-.25-.4a10.6 10.6 0 0 1-1.62-5.66c0-5.87 4.78-10.65 10.66-10.65 2.85 0 5.52 1.11 7.53 3.12a10.58 10.58 0 0 1 3.12 7.54c0 5.87-4.78 10.68-10.65 10.68zm5.84-7.97c-.32-.16-1.89-.93-2.19-1.04-.29-.11-.5-.16-.72.16-.21.32-.82 1.04-1.01 1.25-.18.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.12 1.09-1.12 2.66 0 1.57 1.14 3.08 1.3 3.3.16.21 2.25 3.43 5.45 4.81.76.33 1.36.53 1.82.67.77.24 1.46.21 2.01.13.61-.09 1.89-.77 2.15-1.52.27-.74.27-1.38.19-1.52-.08-.13-.29-.21-.61-.37z" />
    </svg>
  );
}

/**
 * Botón flotante de WhatsApp — verde oficial de la marca, con anillo
 * de pulso y etiqueta visible en pantallas medianas en adelante.
 */
export function WhatsAppFab() {
  return (
    <a
      href={whatsappLink("Hola Luz, me gustaría recibir asesoría inmobiliaria.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir a Luz Torres por WhatsApp"
      className="group fixed bottom-5 right-5 z-40 flex items-center"
    >
      {/* Etiqueta desplegable */}
      <span className="pointer-events-none mr-3 hidden translate-x-2 rounded-full bg-cacao-oscuro px-4 py-2 text-[13px] font-medium text-hueso opacity-0 shadow-card transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 sm:block">
        ¿Hablamos por WhatsApp?
      </span>

      <span className="relative grid h-14 w-14 place-items-center">
        {/* Anillo de pulso */}
        <span className="absolute inset-0 rounded-full bg-whatsapp animate-pulse-ring" />
        <span className="relative grid h-14 w-14 place-items-center rounded-full bg-whatsapp text-white shadow-floating transition-transform duration-300 group-hover:scale-110 group-hover:bg-whatsapp-oscuro">
          <WhatsAppIcon className="h-7 w-7" />
        </span>
      </span>
    </a>
  );
}
