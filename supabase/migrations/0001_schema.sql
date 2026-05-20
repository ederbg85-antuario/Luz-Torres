-- ════════════════════════════════════════════════════════════════
--  Luz Torres · Esquema de base de datos
--  Ejecutar primero, en el SQL Editor de Supabase.
-- ════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ─── Función utilitaria: actualizar updated_at ──────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ════════════════════════════════════════════════════════════════
--  PROFILES — miembros del panel de administración
--  El registro público está deshabilitado: los usuarios solo se
--  crean por invitación. Cada usuario de auth recibe un profile.
-- ════════════════════════════════════════════════════════════════
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null default 'Equipo Luz Torres',
  role        text not null default 'agente' check (role in ('admin','agente')),
  avatar_url  text,
  created_at  timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Equipo Luz Torres'),
    coalesce(new.raw_user_meta_data->>'role', 'agente')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ════════════════════════════════════════════════════════════════
--  PROPERTIES — catálogo de propiedades (el "book")
-- ════════════════════════════════════════════════════════════════
create table if not exists public.properties (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  description   text,
  operation     text not null default 'venta'
                  check (operation in ('venta','renta')),
  property_type text not null default 'casa'
                  check (property_type in ('casa','departamento','oficina','bodega','terreno','local')),
  status        text not null default 'disponible'
                  check (status in ('disponible','apartado','vendido','rentado')),
  price         numeric(14,2) not null default 0,
  currency      text not null default 'MXN',
  estado        text not null,
  municipio     text not null,
  colonia       text,
  direccion     text,
  bedrooms      int default 0,
  bathrooms     numeric(3,1) default 0,
  parking       int default 0,
  area_m2       numeric(10,2) default 0,
  lot_m2        numeric(10,2),
  amenities     text[] default '{}',
  cover_image   text,
  images        text[] default '{}',
  featured      boolean not null default false,
  lat           numeric(9,6),
  lng           numeric(9,6),
  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists properties_operation_idx on public.properties(operation);
create index if not exists properties_type_idx      on public.properties(property_type);
create index if not exists properties_estado_idx    on public.properties(estado);
create index if not exists properties_status_idx    on public.properties(status);
create index if not exists properties_featured_idx  on public.properties(featured);
create index if not exists properties_price_idx     on public.properties(price);

drop trigger if exists properties_touch on public.properties;
create trigger properties_touch before update on public.properties
  for each row execute function public.touch_updated_at();

-- ════════════════════════════════════════════════════════════════
--  CONTACTS — CRM: prospectos y clientes
-- ════════════════════════════════════════════════════════════════
create table if not exists public.contacts (
  id                uuid primary key default gen_random_uuid(),
  full_name         text not null,
  email             text,
  phone             text,
  source            text not null default 'web'
                      check (source in ('web','instagram','facebook','referido','portal','llamada','whatsapp','otro')),
  stage             text not null default 'nuevo'
                      check (stage in ('nuevo','contactado','calificado','propuesta','negociacion','cerrado','perdido')),
  interest          text default 'compra'
                      check (interest in ('compra','renta','venta','inversion')),
  budget_min        numeric(14,2),
  budget_max        numeric(14,2),
  notes             text,
  message           text,
  property_id       uuid references public.properties(id) on delete set null,
  assigned_to       uuid references public.profiles(id) on delete set null,
  last_contacted_at timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists contacts_stage_idx  on public.contacts(stage);
create index if not exists contacts_source_idx on public.contacts(source);

drop trigger if exists contacts_touch on public.contacts;
create trigger contacts_touch before update on public.contacts
  for each row execute function public.touch_updated_at();

-- ════════════════════════════════════════════════════════════════
--  APPOINTMENTS — agenda de citas
-- ════════════════════════════════════════════════════════════════
create table if not exists public.appointments (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  type        text not null default 'visita'
                check (type in ('visita','firma','llamada','reunion','avaluo')),
  contact_id  uuid references public.contacts(id) on delete set null,
  property_id uuid references public.properties(id) on delete set null,
  starts_at   timestamptz not null,
  ends_at     timestamptz,
  location    text,
  notes       text,
  status      text not null default 'programada'
                check (status in ('programada','completada','cancelada')),
  created_at  timestamptz not null default now()
);

create index if not exists appointments_starts_idx on public.appointments(starts_at);

-- ════════════════════════════════════════════════════════════════
--  TASKS — tablero de actividades (tipo Trello)
-- ════════════════════════════════════════════════════════════════
create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  status      text not null default 'pendiente'
                check (status in ('pendiente','en_progreso','en_revision','completada')),
  priority    text not null default 'media' check (priority in ('baja','media','alta')),
  due_date    date,
  contact_id  uuid references public.contacts(id) on delete set null,
  position    int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists tasks_status_idx on public.tasks(status);

drop trigger if exists tasks_touch on public.tasks;
create trigger tasks_touch before update on public.tasks
  for each row execute function public.touch_updated_at();

-- ════════════════════════════════════════════════════════════════
--  MARKETING — integraciones y métricas
--  Estructura lista para conectar IG, Facebook, Meta Ads,
--  Google Analytics, Search Console y Google Ads más adelante.
-- ════════════════════════════════════════════════════════════════
create table if not exists public.marketing_integrations (
  id             uuid primary key default gen_random_uuid(),
  provider       text unique not null
                   check (provider in ('instagram','facebook','meta_ads','google_analytics','search_console','google_ads')),
  status         text not null default 'desconectado'
                   check (status in ('conectado','desconectado')),
  account_label  text,
  last_synced_at timestamptz,
  config         jsonb not null default '{}'
);

create table if not exists public.marketing_metrics (
  id            uuid primary key default gen_random_uuid(),
  provider      text not null,
  metric        text not null,
  value         numeric not null default 0,
  recorded_date date not null default current_date,
  created_at    timestamptz not null default now()
);

create index if not exists marketing_metrics_provider_idx on public.marketing_metrics(provider, recorded_date);

-- ════════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY
--  · properties  → lectura pública, escritura solo equipo
--  · contacts    → alta pública (formulario web), gestión solo equipo
--  · resto       → solo equipo autenticado
-- ════════════════════════════════════════════════════════════════
alter table public.profiles               enable row level security;
alter table public.properties             enable row level security;
alter table public.contacts               enable row level security;
alter table public.appointments           enable row level security;
alter table public.tasks                  enable row level security;
alter table public.marketing_integrations enable row level security;
alter table public.marketing_metrics      enable row level security;

-- PROFILES
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated using (true);
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- PROPERTIES
drop policy if exists properties_select_public on public.properties;
create policy properties_select_public on public.properties
  for select using (true);
drop policy if exists properties_write on public.properties;
create policy properties_write on public.properties
  for all to authenticated using (true) with check (true);

-- CONTACTS
drop policy if exists contacts_insert_public on public.contacts;
create policy contacts_insert_public on public.contacts
  for insert with check (true);
drop policy if exists contacts_manage on public.contacts;
create policy contacts_manage on public.contacts
  for all to authenticated using (true) with check (true);

-- APPOINTMENTS
drop policy if exists appointments_manage on public.appointments;
create policy appointments_manage on public.appointments
  for all to authenticated using (true) with check (true);

-- TASKS
drop policy if exists tasks_manage on public.tasks;
create policy tasks_manage on public.tasks
  for all to authenticated using (true) with check (true);

-- MARKETING
drop policy if exists marketing_integrations_manage on public.marketing_integrations;
create policy marketing_integrations_manage on public.marketing_integrations
  for all to authenticated using (true) with check (true);
drop policy if exists marketing_metrics_manage on public.marketing_metrics;
create policy marketing_metrics_manage on public.marketing_metrics
  for all to authenticated using (true) with check (true);

-- ════════════════════════════════════════════════════════════════
--  STORAGE — bucket público para fotos de propiedades
-- ════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

drop policy if exists property_images_read on storage.objects;
create policy property_images_read on storage.objects
  for select using (bucket_id = 'property-images');

drop policy if exists property_images_insert on storage.objects;
create policy property_images_insert on storage.objects
  for insert to authenticated with check (bucket_id = 'property-images');

drop policy if exists property_images_update on storage.objects;
create policy property_images_update on storage.objects
  for update to authenticated using (bucket_id = 'property-images');

drop policy if exists property_images_delete on storage.objects;
create policy property_images_delete on storage.objects
  for delete to authenticated using (bucket_id = 'property-images');
