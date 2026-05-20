import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/constants";

export function WhatsAppFab() {
  return (
    <a
      href={whatsappLink("Hola Luz, me gustaría recibir asesoría inmobiliaria.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir por WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-vivo px-4 py-3.5 text-sm font-semibold text-papel shadow-floating transition-transform hover:scale-105"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">Escríbeme</span>
    </a>
  );
}
