# Luz Torres · Sitio web + Panel de gestión

Sitio web inmobiliario y panel de administración para **Luz Torres**, asesora
inmobiliaria. Construido con Next.js, React y Supabase, siguiendo el brandbook
de la marca.

## Qué incluye

**Sitio público** (sin inicio de sesión)

- Portada con buscador y filtros tipo Inmuebles24 (comprar / rentar / vender).
- Catálogo de propiedades con filtros por operación, estado, ciudad/alcaldía,
  tipo, precio, recámaras y baños.
- Ficha de propiedad con galería, características y formulario de contacto.
- Página "Sobre Luz" y página de contacto.
- Estructura preparada para SEO (metadatos, sitemap, robots, datos
  estructurados, keywords).

**Panel de administración** (`/admin`, acceso solo por invitación)

- Dashboard con métricas y pipeline.
- Gestión de propiedades (alta, edición, fotos a Supabase Storage).
- CRM de contactos con etapas de pipeline.
- Agenda con calendario de citas.
- Tablero de tareas tipo Trello (arrastrar y soltar).
- Panel de marketing (estructura lista para conectar Instagram, Facebook,
  Meta Ads, Google Analytics, Search Console y Google Ads).
- Gestión de equipo por invitación.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS** para el diseño (tokens del brandbook)
- **Supabase** — base de datos, autenticación y almacenamiento

## Puesta en marcha

### 1. Instalar dependencias

```bash
npm install
```

### 2. Variables de entorno

Copia `.env.example` a `.env.local` y completa las claves de Supabase
(Project Settings → API):

```
NEXT_PUBLIC_SUPABASE_URL=https://acrzgrbovizhqcnpmpdn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=https://luztorres.com
NEXT_PUBLIC_META_PIXEL_ID=123456789012345
META_CAPI_ACCESS_TOKEN=...
META_CAPI_TEST_EVENT_CODE=...
DASHBOARD_HOST=dashboard.luztorres.com
```

### 3. Base de datos

En el **SQL Editor** de Supabase, ejecuta en orden:

1. `supabase/migrations/0001_schema.sql` — tablas, seguridad (RLS) y storage.
2. `supabase/migrations/0002_seed.sql` — datos de ejemplo (CRM, agenda, tareas, marketing).
3. `supabase/migrations/0003_real_properties.sql` — catálogo real de 22 propiedades
   (reemplaza las propiedades demo de 0002; las fotos se suben aparte al bucket
   `property-images`, una carpeta por slug).

### 4. Usuario administrador

Con las claves ya configuradas en `.env.local`:

```bash
npm run seed:admin
```

Crea el usuario administrador (credenciales por defecto):

- **Correo:** `admin@luztorres.com`
- **Contraseña:** `LuzTorres2026!`

### 5. Ejecutar en local

```bash
npm run dev
```

- Sitio público: `http://localhost:3000`
- Panel de administración: `http://localhost:3000/admin`

## Despliegue en Vercel

1. Importa el repositorio en Vercel.
2. Despliega — **no se necesitan variables de entorno**: la configuración
   pública de Supabase vive en `src/lib/supabase/config.ts` y las
   operaciones privilegiadas (invitar al equipo) corren en la Edge
   Function `invite-member` dentro de Supabase.

### Analytics, Meta Pixel y Tag Manager

Cuando tengas el contenedor de Google Tag Manager, pega su ID en
`GTM_ID` (`src/lib/constants.ts`) y vuelve a desplegar. Desde GTM
puedes conectar Google Analytics 4, Google Ads, Meta Pixel, etc.

El sitio ya incluye el contenedor `GTM-536966B7` únicamente en las rutas
públicas; el panel `/admin` no envía actividad a marketing. Para Meta, agrega
en Vercel las variables `NEXT_PUBLIC_META_PIXEL_ID` y
`META_CAPI_ACCESS_TOKEN`. El navegador dispara `PageView`, `ViewContent`,
`Contact`, `Lead` y `Schedule`; los dos últimos se envían además por
Conversions API con el mismo `event_id`, para deduplicación.

Los eventos disponibles en `dataLayer` son `view_property`,
`generate_lead`, `seller_lead`, `solicitud_visita` y los eventos
`contacto_*`. Crea los triggers de GTM a partir de esos nombres; no instales
un segundo Meta Pixel desde GTM si usas la integración directa del sitio.

### Solicitudes de visita

Ejecuta `supabase/migrations/0005_solicitudes_visita.sql` una vez en el SQL
Editor de Supabase. La migración registra solicitudes con estatus
`solicitud`; no bloquea la agenda ni confirma una cita hasta que el equipo la
cambie a `programada` en el panel.

### Dominio del panel

No hace falta separar repositorio ni proyecto de Supabase. Agrega
`dashboard.luztorres.com` al mismo proyecto de Vercel y crea su DNS. En
producción, el middleware envía cualquier URL `/admin` de `luztorres.com` al
subdominio, mantiene `dashboard.luztorres.com` como entrada del panel y deja
el sitio público como la única superficie con etiquetas de marketing e
indexación.

## Estructura

```
src/
  app/
    (site)/        Sitio público
    admin/         Panel de administración
  components/
    site/          Componentes del sitio
    admin/         Componentes del panel
    ui/            Componentes compartidos
  lib/
    actions/       Server Actions
    supabase/      Clientes de Supabase
supabase/migrations/  Esquema SQL y datos de ejemplo
scripts/           Script para crear el usuario admin
```

## Notas

- El registro público está deshabilitado: los usuarios del panel solo se crean
  por invitación desde **Equipo**.
- Las propiedades sin foto usan un diseño de marca como portada.
- El catálogo de propiedades (22 fichas) es real, de Imagen Inmobiliaria y
  Construcción. El CRM, la agenda y las tareas de ejemplo siguen siendo datos
  demo — bórralos o reemplázalos desde el panel cuando tengas los reales.
