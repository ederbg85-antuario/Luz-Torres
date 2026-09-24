# Medición Meta — Luz Torres

Portfolio propietario: **Luz Torres `723347267185763`**. Cuenta publicitaria: **Luz Inmuebles `1423787785383218`**.

Píxel/conjunto de datos: **Luz Torres · Web y conversiones `1089464006801296`**.

El antiguo `1061691976478859`, propiedad del portfolio Eder Garcia, no debe instalarse ni utilizarse para estas campañas.

| Acción | Evento Meta | content_category | Momento |
| --- | --- | --- | --- |
| Abrir página pública | PageView | — | Carga y navegación interna |
| Abrir ficha de propiedad | ViewContent | — | Al ver la propiedad |
| Enviar solicitud de visita | Lead | visit_request | Solo después de guardar en el sistema |
| Enviar formulario para vender | SellerLead | seller_request | Solo después de guardar en el CRM |
| Enviar contacto general | ContactLead | contact_request | Solo después de guardar en el CRM |
| Pulsar WhatsApp | Contact | whatsapp_click | Clic; no confirma mensaje enviado ni conversación |

Todos los eventos de formularios y Contact/WhatsApp comparten `event_name` y `event_id` entre navegador y servidor. El ID se genera una sola vez por acción. Los reintentos de servidor conservan ID y hora. Los formularios inválidos y el honeypot no emiten conversiones. SellerLead y ContactLead son eventos personalizados (trackSingleCustom); no se mezclan con la señal estándar Lead de visitas.

La CAPI envía correo y teléfono normalizados y SHA-256 solo para formularios guardados, además de IP, agente de usuario y cookies `_fbp`/`_fbc` cuando existen. No se envían nombre, mensaje, método de financiamiento, dirección del inmueble del vendedor ni parámetros de consulta de la URL. El token vive exclusivamente en una variable Secret de Vercel.

Configuración de producción: `NEXT_PUBLIC_META_PIXEL_ID=1089464006801296` y `META_CAPI_ACCESS_TOKEN` de ese conjunto de datos. `META_CAPI_TEST_EVENT_CODE` se utiliza temporalmente para pruebas y debe eliminarse al terminar. Todo cambio de variables requiere nuevo despliegue.

La optimización de solicitudes usa el evento estándar `Lead`, reservado exclusivamente para solicitudes de visita (`content_category=visit_request`). Vendedores, contactos generales y clics de WhatsApp tienen otros nombres de evento y no alimentan esa optimización. Las primeras pruebas QA del 23 de septiembre de 2026 usaron Lead para los tres formularios; esos registros fueron retirados del CRM y esta separación se instaló antes de activar publicidad.

Verificación técnica: `node --experimental-strip-types --test scripts/meta-event-data.test.mjs`, `npx tsc --noEmit`, `npm run build`. Los logs `meta_capi_accepted` muestran el ID del evento y `eventsReceived: 1`, sin datos personales ni tokens. Comprobar además la recepción y deduplicación en Probar eventos de Meta y retirar los registros QA del CRM.
