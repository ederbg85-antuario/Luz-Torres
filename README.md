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

### Analytics / Tag Manager

Cuando tengas el contenedor de Google Tag Manager, pega su ID en
`GTM_ID` (`src/lib/constants.ts`) y vuelve a desplegar. Desde GTM
puedes conectar Google Analytics 4, Google Ads, Meta Pixel, etc.

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
