-- ════════════════════════════════════════════════════════════════
--  Sistema de visitas agendadas desde la web pública.
--  · availability_rules — horario semanal de Luz (isodow 1=lunes)
--  · blocked_slots      — fechas u horas bloqueadas puntualmente
--  · contacts.financing — cómo piensa financiar la compra
--  · book_visit()       — RPC pública que valida y crea contacto+cita
--  · get_taken_slots()  — RPC pública que expone solo horarios ocupados
-- ════════════════════════════════════════════════════════════════

create table if not exists public.availability_rules (
  weekday    int primary key check (weekday between 1 and 7),
  enabled    boolean not null default false,
  start_time time not null default '10:00',
  end_time   time not null default '18:00',
  updated_at timestamptz not null default now()
);

insert into public.availability_rules (weekday, enabled, start_time, end_time) values
  (1, true,  '10:00', '18:00'),
  (2, true,  '10:00', '18:00'),
  (3, true,  '10:00', '18:00'),
  (4, true,  '10:00', '18:00'),
  (5, true,  '10:00', '18:00'),
  (6, true,  '10:00', '14:00'),
  (7, false, '10:00', '14:00')
on conflict (weekday) do nothing;

create table if not exists public.blocked_slots (
  id         uuid primary key default gen_random_uuid(),
  date       date not null,
  start_time time,          -- null = día completo bloqueado
  end_time   time,
  reason     text,
  created_at timestamptz not null default now()
);
create index if not exists blocked_slots_date_idx on public.blocked_slots(date);

alter table public.contacts add column if not exists financing text
  check (financing in ('recursos_propios','credito_bancario','infonavit','fovissste','cofinanciamiento','por_definir','no_aplica'));

-- ─── RLS ─────────────────────────────────────────────────────────
alter table public.availability_rules enable row level security;
alter table public.blocked_slots      enable row level security;

drop policy if exists availability_rules_read on public.availability_rules;
create policy availability_rules_read on public.availability_rules
  for select using (true);
drop policy if exists availability_rules_write on public.availability_rules;
create policy availability_rules_write on public.availability_rules
  for all to authenticated using (true) with check (true);

drop policy if exists blocked_slots_read on public.blocked_slots;
create policy blocked_slots_read on public.blocked_slots
  for select using (true);
drop policy if exists blocked_slots_write on public.blocked_slots;
create policy blocked_slots_write on public.blocked_slots
  for all to authenticated using (true) with check (true);

-- ─── Horarios ocupados (sin exponer datos personales) ────────────
create or replace function public.get_taken_slots(p_from timestamptz, p_to timestamptz)
returns table (starts_at timestamptz, ends_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select a.starts_at, coalesce(a.ends_at, a.starts_at + interval '1 hour')
  from appointments a
  where a.status = 'programada'
    and a.starts_at < p_to
    and coalesce(a.ends_at, a.starts_at + interval '1 hour') > p_from;
$$;

revoke all on function public.get_taken_slots(timestamptz, timestamptz) from public;
grant execute on function public.get_taken_slots(timestamptz, timestamptz) to anon, authenticated;

-- ─── Reservar una visita desde la web ────────────────────────────
create or replace function public.book_visit(
  p_property_id uuid,
  p_starts_at   timestamptz,
  p_full_name   text,
  p_phone       text default null,
  p_email       text default null,
  p_financing   text default 'por_definir',
  p_message     text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_local      timestamp;
  v_rule       availability_rules%rowtype;
  v_prop       properties%rowtype;
  v_contact_id uuid;
  v_ends       timestamptz := p_starts_at + interval '1 hour';
  v_financing  text := p_financing;
  v_fin_label  text;
begin
  if p_full_name is null or length(trim(p_full_name)) < 2 then
    return jsonb_build_object('ok', false, 'error', 'Falta tu nombre completo.');
  end if;
  if coalesce(trim(p_phone), '') = '' and coalesce(trim(p_email), '') = '' then
    return jsonb_build_object('ok', false, 'error', 'Deja un teléfono o un correo para confirmarte la visita.');
  end if;

  if v_financing is null or v_financing not in
     ('recursos_propios','credito_bancario','infonavit','fovissste','cofinanciamiento','por_definir','no_aplica') then
    v_financing := 'por_definir';
  end if;

  select * into v_prop from properties where id = p_property_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Esta propiedad ya no está publicada.');
  end if;
  if v_prop.status in ('vendido','rentado') then
    return jsonb_build_object('ok', false, 'error', 'Esta propiedad ya no está disponible para visitas.');
  end if;

  if p_starts_at < now() + interval '2 hours' then
    return jsonb_build_object('ok', false, 'error', 'Elige un horario con al menos 2 horas de anticipación.');
  end if;
  if p_starts_at > now() + interval '90 days' then
    return jsonb_build_object('ok', false, 'error', 'Por ahora solo agendo visitas dentro de los próximos 3 meses.');
  end if;

  -- Toda la validación de agenda ocurre en hora de Ciudad de México.
  v_local := p_starts_at at time zone 'America/Mexico_City';

  select * into v_rule
  from availability_rules
  where weekday = extract(isodow from v_local)::int and enabled;

  if not found
     or v_local::time < v_rule.start_time
     or v_local::time > v_rule.end_time - interval '1 hour' then
    return jsonb_build_object('ok', false, 'error', 'Ese horario está fuera de la agenda disponible.');
  end if;

  if exists (
    select 1 from blocked_slots b
    where b.date = v_local::date
      and (b.start_time is null
           or (v_local::time >= b.start_time
               and v_local::time < coalesce(b.end_time, b.start_time + interval '1 hour')))
  ) then
    return jsonb_build_object('ok', false, 'error', 'Ese horario no está disponible. Elige otro, por favor.');
  end if;

  if exists (
    select 1 from appointments a
    where a.status = 'programada'
      and a.starts_at < v_ends
      and coalesce(a.ends_at, a.starts_at + interval '1 hour') > p_starts_at
  ) then
    return jsonb_build_object('ok', false, 'error', 'Ese horario acaba de ocuparse. Elige otro, por favor.');
  end if;

  v_fin_label := case v_financing
    when 'recursos_propios'  then 'Recursos propios'
    when 'credito_bancario'  then 'Crédito bancario'
    when 'infonavit'         then 'Crédito Infonavit'
    when 'fovissste'         then 'Crédito Fovissste'
    when 'cofinanciamiento'  then 'Cofinanciamiento (banco + Infonavit/Fovissste)'
    when 'no_aplica'         then 'No aplica (renta)'
    else 'Aún por definir'
  end;

  insert into contacts (full_name, phone, email, source, stage, interest, financing, message, property_id)
  values (
    trim(p_full_name),
    nullif(trim(p_phone), ''),
    nullif(trim(p_email), ''),
    'web',
    'nuevo',
    case when v_prop.operation = 'renta' then 'renta' else 'compra' end,
    v_financing,
    nullif(trim(coalesce(p_message, '')), ''),
    p_property_id
  )
  returning id into v_contact_id;

  insert into appointments (title, type, contact_id, property_id, starts_at, ends_at, location, notes, status)
  values (
    'Visita · ' || v_prop.title,
    'visita',
    v_contact_id,
    p_property_id,
    p_starts_at,
    v_ends,
    concat_ws(', ', v_prop.direccion, v_prop.colonia, v_prop.municipio, v_prop.estado),
    'Visita agendada desde la web.' || E'\n' || 'Financiamiento: ' || v_fin_label ||
      case when trim(coalesce(p_message, '')) <> ''
           then E'\n' || 'Mensaje: ' || trim(p_message)
           else '' end,
    'programada'
  );

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.book_visit(uuid, timestamptz, text, text, text, text, text) from public;
grant execute on function public.book_visit(uuid, timestamptz, text, text, text, text, text) to anon, authenticated;
