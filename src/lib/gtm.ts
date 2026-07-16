declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

/**
 * Empuja un evento personalizado al dataLayer de GTM. Los triggers,
 * variables y tags correspondientes se configuran en
 * tagmanager.google.com — este helper solo dispara el evento.
 */
export function pushEvent(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}
