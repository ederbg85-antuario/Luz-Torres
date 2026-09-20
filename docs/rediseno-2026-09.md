# Rediseño público · septiembre de 2026

## Entrega

- Lienzo blanco, verde petróleo y nogal; superficies redondeadas, sombras y sin bordes decorativos.
- Inicio más breve y visual, con las dos propiedades promocionadas, acceso a vendedores y presentación de Luz.
- Fichas con precio y acciones principales visibles, galería navegable, visor completo, miniaturas y navegación por teclado/táctil.
- Descripción completa y características adicionales conservadas en desplegables. Se mantienen URLs, metadatos, JSON-LD y rutas SEO.
- Solicitudes de visita con datos de contacto obligatorios, validación de correo/teléfono y preferencia de fecha/hora. No confirman una cita.
- Evento `Lead` para solicitud registrada, con `content_category=visit_request` y el mismo ID en navegador/CAPI. No se asigna el precio de la propiedad como valor del lead de Meta.
- CAPI tiene un límite de espera de cuatro segundos; una caída de Meta no impide registrar el contacto.

## Verificación realizada

- TypeScript: `npx tsc --noEmit`, correcto.
- Compilación: `npm run build`, correcta (Next.js 15.5.18, 46 páginas generadas).
- `git diff --check`, correcto.
- Navegador integrado: inicio y ficha de Los Alpes, navegación entre imágenes, visor de 45 fotos, flechas de teclado y cierre con Escape.
- Formulario: campos obligatorios y formatos inválidos; avance desde datos a preferencia y al resumen con fecha/hora, sin enviar datos ficticios al CRM.
- Diálogos nativos con foco dentro del modal; el foco pasa al primer campo o al resumen al cambiar de paso.
- Vista móvil de 390 px: inicio sin desbordamiento horizontal, menú desplegable y navegación a vendedores.
- Fotografías originales: piezas de campaña maquetadas sin reconstruir ni modificar arquitectura.

## Pendiente antes de invertir

- Una solicitud real autorizada para comprobar recepción en CRM y evento deduplicado en Meta. La prueba de interfaz no equivale a una prueba de CAPI en producción.
- Confirmar presupuesto, fechas de campaña y disponibilidad/precios con Luz.
- Corregir en origen la discrepancia de recámaras/baños de El Manzano: la descripción y los campos estructurados no coinciden. Los anuncios evitan esos datos.

## Regenerar creativos

Desde la raíz del repositorio, `node scripts/prepare-campaign-assets.mjs` descarga las fotografías públicas a `../Campanas-2026-09`. Después instala la dependencia del renderizador fuera de la app con `npm install --prefix ../Campanas-2026-09/renderer-deps fontkit@2.0.4` y ejecuta `node scripts/render-campaign-creatives.mjs`.

El renderizador usa el logotipo original, Inter y Cormorant Garamond (licencias OFL guardadas junto a las fuentes). Genera cuatro tarjetas de 1080×1080, feed de 1080×1350 y Stories de 1080×1920 por propiedad. No incorpora fotos generadas por IA. El directorio de campaña no forma parte del despliegue web.

### Revisión visual del 20/09

Por petición del cliente, la segunda versión elimina las columnas fotográficas estrechas y reduce los bloques de texto. Aumenta márgenes, utiliza fotografías anchas y una sola idea por tarjeta. Guarda los nuevos archivos en `../Campanas-2026-09/revision-aire/`; las piezas para Meta incluyen `v2` en el nombre para evitar confundirlas con la entrega anterior. Se conservan los originales y no se altera la arquitectura.

Verificación de la revisión: doce JPG renderizados y revisados visualmente; ocho de 1080×1080, dos de 1080×1350 y dos de 1080×1920. `node --check scripts/render-campaign-creatives.mjs` y `git diff --check` correctos. Esta revisión no cambia el código del sitio web.
